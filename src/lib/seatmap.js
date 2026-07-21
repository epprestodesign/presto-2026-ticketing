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
export const TIER_PRESETS = {
  stadium: [
    { id: 'field',  name: 'Field Level',  colorVar: '--ds-palette-red-500',   base: 385 },
    { id: 'club',   name: 'Club Level',   colorVar: '--ds-palette-amber-500', base: 245 },
    { id: 'lower',  name: 'Lower Bowl',   colorVar: '--ds-palette-blue-500',  base: 165 },
    { id: 'upper',  name: 'Upper Deck',   colorVar: '--ds-palette-green-600', base: 89  },
  ],
  arena: [
    { id: 'floor',  name: 'Floor / GA',   colorVar: '--ds-palette-red-500',   base: 320 },
    { id: 'lower',  name: 'Lower Bowl',   colorVar: '--ds-palette-amber-500', base: 190 },
    { id: 'club',   name: 'Club',         colorVar: '--ds-palette-blue-500',  base: 140 },
    { id: 'upper',  name: 'Upper Level',  colorVar: '--ds-palette-green-600', base: 75  },
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
    return ranges.map((r, i) => ({
      id: r.id || `tier-${i}`,
      name: r.type ? cap(r.type) : (preset[i]?.name ?? `Tier ${i + 1}`),
      colorVar: preset[i % preset.length].colorVar,
      price: Math.round(r.min ?? r.max ?? preset[i % preset.length].base),
      currency: r.currency || 'USD',
      synthetic: false,
    }))
  }

  // Synthetic path — jitter each preset base ±12% by seed so events differ.
  return preset.map((t, i) => ({
    id: t.id,
    name: t.name,
    colorVar: t.colorVar,
    price: Math.round(t.base * (0.88 + hash(event.id + t.id) * 0.24)),
    currency: 'USD',
    synthetic: true,
  }))
}

function cap(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1) }

/**
 * Parametric stadium/arena bowl. Returns one entry per section: an SVG path
 * (annular sector on an ellipse), a centroid for labels, and its tier. One ring
 * per tier — inner ring = premium tier. A deterministic sprinkling of sections
 * is marked unavailable so the map feels live.
 *
 * @param {Array} tiers  output of deriveTiers()
 * @param {object} opts
 */
export function buildBowlSections(tiers = [], opts = {}) {
  const {
    cx = 300, cy = 210,
    rxBase = 70, ryBase = 48,   // inner (center) ellipse radii
    ring = 42,                   // radial thickness added per ring (x); y scaled
    sectionGapDeg = 2.2,
    seed = 'bowl',
  } = opts

  const rings = tiers.length
  const yScale = ryBase / rxBase
  const sections = []

  tiers.forEach((tier, r) => {
    // More sections as you move outward (bigger rings hold more).
    const count = 8 + r * 4
    const innerRx = rxBase + r * ring
    const outerRx = rxBase + (r + 1) * ring - 6
    const step = 360 / count

    for (let s = 0; s < count; s++) {
      const a0 = s * step + sectionGapDeg / 2
      const a1 = (s + 1) * step - sectionGapDeg / 2
      const path = annularSector(cx, cy, innerRx, outerRx, innerRx * yScale, outerRx * yScale, a0, a1)
      const mid = (a0 + a1) / 2
      const midRx = (innerRx + outerRx) / 2
      const rad = (mid * Math.PI) / 180
      // Deterministic ~14% unavailable.
      const unavailable = hash(`${seed}-${tier.id}-${s}`) > 0.86
      sections.push({
        id: `${tier.id}-${s + 1}`,
        label: `${tier.id.toUpperCase()}${s + 1}`,
        tierId: tier.id,
        tierName: tier.name,
        colorVar: tier.colorVar,
        price: tier.price,
        currency: tier.currency,
        available: !unavailable,
        path,
        labelX: cx + Math.cos(rad) * midRx,
        labelY: cy + Math.sin(rad) * midRx * yScale,
      })
    }
  })

  return sections
}

// Annular sector as a closed polygon (sampled arcs — robust across renderers).
function annularSector(cx, cy, innerRx, outerRx, innerRy, outerRy, a0deg, a1deg) {
  const steps = 8
  const pts = []
  const at = (rx, ry, deg) => {
    const rad = (deg * Math.PI) / 180
    return `${(cx + Math.cos(rad) * rx).toFixed(1)},${(cy + Math.sin(rad) * ry).toFixed(1)}`
  }
  // outer arc a0 → a1
  for (let i = 0; i <= steps; i++) {
    const d = a0deg + ((a1deg - a0deg) * i) / steps
    pts.push(at(outerRx, outerRy, d))
  }
  // inner arc a1 → a0
  for (let i = steps; i >= 0; i--) {
    const d = a0deg + ((a1deg - a0deg) * i) / steps
    pts.push(at(innerRx, innerRy, d))
  }
  return `M${pts.join(' L')} Z`
}
