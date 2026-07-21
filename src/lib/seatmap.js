// Seat-map helpers for the Ticketmaster prototype.
//
// IMPORTANT CONTEXT: the Discovery API v2 gives us a REAL static seatmap image
// (`seatmap.staticUrl`) and real event/venue data, but NO seat-level geometry
// and — in practice — no `priceRanges` for US events. So the interactive bowl
// below (sections, tiers, prices) is a PROTOTYPE layer we generate ourselves,
// deterministically per event, on top of the real data. Clearly a mock; swap in
// Ticketmaster's Presence/Seat Map SDK for production seat selection.

// Tier presets, ordered premium → value (inner ring → outer ring). Colors are
// pulled from the design-system palette tokens so the map reads as one system.
// Stadium preset models an NFL bowl (tuned to Gillette Stadium's section
// families): a 100-level lower bowl, a Club ring (C-sections), a 200-level
// mezzanine, and a 300-level upper deck. `prefix` drives real-looking section
// numbers (101…, C1…, 201…, 301…).
export const TIER_PRESETS = {
  stadium: [
    { id: 'lower', name: 'Lower Level', prefix: '1', desc: 'Sideline & end zone, closest to the field', colorVar: '--ds-palette-red-500',   base: 289 },
    { id: 'club',  name: 'Club Level',  prefix: 'C', desc: 'Premium mid-level with indoor lounge access', colorVar: '--ds-palette-amber-500', base: 375 },
    { id: 'mezz',  name: 'Mezzanine',   prefix: '2', desc: 'Elevated corners & sideline',                 colorVar: '--ds-palette-blue-500',  base: 165 },
    { id: 'upper', name: 'Upper Level', prefix: '3', desc: 'Highest level — the budget-friendly view',    colorVar: '--ds-palette-green-600', base: 89  },
  ],
  arena: [
    { id: 'floor', name: 'Floor / GA',  prefix: 'F', desc: 'On the floor, closest to the stage',  colorVar: '--ds-palette-red-500',   base: 320 },
    { id: 'lower', name: 'Lower Bowl',  prefix: '1', desc: 'Lower seated bowl around the floor',   colorVar: '--ds-palette-amber-500', base: 190 },
    { id: 'club',  name: 'Club',        prefix: 'C', desc: 'Mid-level club with amenities',        colorVar: '--ds-palette-blue-500',  base: 140 },
    { id: 'upper', name: 'Upper Level', prefix: '2', desc: 'Upper bowl — the budget-friendly view', colorVar: '--ds-palette-green-600', base: 75  },
  ],
}

// Deterministic pseudo-random from a string seed (no Math.random → stable maps).
function hash(str = '') {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295
}

/**
 * Build the price tiers for an event. Uses real `priceRanges` when present,
 * otherwise a deterministic synthetic set from a preset. The `synthetic` flag
 * lets the UI label mock pricing honestly.
 */
export function deriveTiers(event = {}, kind = 'stadium') {
  const preset = TIER_PRESETS[kind] ?? TIER_PRESETS.stadium
  const seed = hash(event.id || event.name || 'seed')

  // Real pricing path (rare in Discovery for US events, but honored if present).
  if (event.priceTiers?.length || event.priceRanges?.length) {
    const ranges = event.priceTiers?.length ? event.priceTiers : event.priceRanges
    return ranges.map((r, i) => {
      const p = preset[i % preset.length]
      return {
        id: r.id || `tier-${i}`,
        name: r.type ? cap(r.type) : (preset[i]?.name ?? `Tier ${i + 1}`),
        prefix: p.prefix,
        desc: p.desc,
        colorVar: p.colorVar,
        price: Math.round(r.min ?? r.max ?? p.base),
        currency: r.currency || 'USD',
        synthetic: false,
      }
    })
  }

  // Synthetic path — jitter each preset base ±12% by seed so events differ.
  return preset.map((t) => ({
    id: t.id,
    name: t.name,
    prefix: t.prefix,
    desc: t.desc,
    colorVar: t.colorVar,
    price: Math.round(t.base * (0.88 + hash(event.id + t.id) * 0.24)),
    currency: 'USD',
    synthetic: true,
  }))
}

function cap(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1) }

// Default bowl layout (shared with SeatMap.vue so the field lines up with the
// seating rings). A superellipse gives the rounded-rectangle "stadium" silhouette
// — not a circle — with the field wider than it is tall, like an NFL bowl.
export const BOWL = {
  cx: 380, cy: 250,
  fieldA: 150, fieldB: 92,   // field half-width / half-height
  ringGap: 15, ringThickness: 33,
  n: 2.8,                     // superellipse exponent (2 = ellipse, ∞ = rectangle)
  sectionGapDeg: 1.4,
}

// Point on a superellipse of half-extents (a, b) at polar angle `deg`, centered
// at (cx, cy). n controls "squareness": ~2.8 reads as a rounded-rect stadium.
function superPoint(cx, cy, a, b, deg, n) {
  const t = (deg * Math.PI) / 180
  const ct = Math.cos(t), st = Math.sin(t)
  const denom = Math.pow(Math.abs(ct / a), n) + Math.pow(Math.abs(st / b), n)
  const r = Math.pow(denom, -1 / n)
  return [cx + r * ct, cy + r * st]
}

/**
 * Stadium bowl sections. One ring per tier around a central (wider-than-tall)
 * field; each section is a trapezoid following the rounded-rectangle silhouette,
 * with a realistic section number (101…, C1…, 201…, 301…). A deterministic
 * sprinkle is marked unavailable so the map feels live.
 *
 * @param {Array} tiers  output of deriveTiers()
 * @param {object} opts  overrides for BOWL layout + `seed`
 */
export function buildBowlSections(tiers = [], opts = {}) {
  const { cx, cy, fieldA, fieldB, ringGap, ringThickness, n, sectionGapDeg } = { ...BOWL, ...opts }
  const seed = opts.seed || 'bowl'
  const sections = []

  tiers.forEach((tier, r) => {
    const count = 22 + r * 4 // more sections in the bigger outer rings
    const innerDelta = ringGap + r * ringThickness
    const outerDelta = ringGap + (r + 1) * ringThickness - 5
    const ia = fieldA + innerDelta, ib = fieldB + innerDelta
    const oa = fieldA + outerDelta, ob = fieldB + outerDelta
    const step = 360 / count

    for (let s = 0; s < count; s++) {
      const a0 = s * step + sectionGapDeg / 2
      const a1 = (s + 1) * step - sectionGapDeg / 2
      const path = superSector(cx, cy, ia, ib, oa, ob, a0, a1, n)
      const mid = (a0 + a1) / 2
      const [labelX, labelY] = superPoint(cx, cy, (ia + oa) / 2, (ib + ob) / 2, mid, n)
      const unavailable = hash(`${seed}-${tier.id}-${s}`) > 0.9
      const label = tier.prefix
        ? (/^\d$/.test(tier.prefix) ? `${tier.prefix}${String(s + 1).padStart(2, '0')}` : `${tier.prefix}${s + 1}`)
        : `${tier.id.toUpperCase()}${s + 1}`
      sections.push({
        id: `${tier.id}-${s + 1}`,
        label,
        tierId: tier.id,
        tierName: tier.name,
        colorVar: tier.colorVar,
        price: tier.price,
        currency: tier.currency,
        available: !unavailable,
        path, labelX, labelY, angle: mid,
      })
    }
  })

  return sections
}

// A section as a trapezoid between the inner and outer superellipse arcs.
function superSector(cx, cy, ia, ib, oa, ob, a0, a1, n) {
  const steps = 6
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const d = a0 + ((a1 - a0) * i) / steps
    const [x, y] = superPoint(cx, cy, oa, ob, d, n)
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  for (let i = steps; i >= 0; i--) {
    const d = a0 + ((a1 - a0) * i) / steps
    const [x, y] = superPoint(cx, cy, ia, ib, d, n)
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return `M${pts.join(' L')} Z`
}
