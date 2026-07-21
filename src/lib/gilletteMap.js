// Hypothetical price pins positioned over the REAL Gillette Stadium vector map
// (src/assets/venue/gillette-stadium.svg). Positions are % of the map image,
// hand-placed on representative sections across every level. Prices are
// PROTOTYPE / hypothetical — Ticketmaster's map feed carries no per-seat pricing.
import { deriveTiers } from './seatmap.js'

// section label + position (% of map) + tier family (matches stadium tiers).
export const GILLETTE_SECTIONS = [
  // Lower level (100s) + premium sidelines (140s)
  { label: '104', x: 35.2, y: 29.9, tier: 'lower' },
  { label: '108', x: 46.4, y: 27.7, tier: 'lower' },
  { label: '110', x: 51.8, y: 27.7, tier: 'lower' },
  { label: '115', x: 67.4, y: 29.9, tier: 'lower' },
  { label: '119', x: 73.2, y: 43.6, tier: 'lower' },
  { label: '124', x: 71.8, y: 63.8, tier: 'lower' },
  { label: '131', x: 54.2, y: 70.3, tier: 'lower' },
  { label: '135', x: 42.0, y: 70.3, tier: 'lower' },
  { label: '143', x: 28.3, y: 49.5, tier: 'lower' },
  // Club level (CL)
  { label: 'CL7', x: 40.0, y: 19.5, tier: 'club' },
  { label: 'CL10', x: 52.7, y: 19.5, tier: 'club' },
  { label: 'CL31', x: 51.8, y: 78.1, tier: 'club' },
  // Mezzanine (200s)
  { label: '202', x: 20.0, y: 22.8, tier: 'mezz' },
  { label: '214', x: 68.8, y: 19.5, tier: 'mezz' },
  { label: '225', x: 74.2, y: 74.2, tier: 'mezz' },
  { label: '240', x: 21.0, y: 66.4, tier: 'mezz' },
  // Upper level (300s)
  { label: '311', x: 57.6, y: 8.9, tier: 'upper' },
  { label: '317', x: 79.6, y: 15.6, tier: 'upper' },
  { label: '331', x: 51.3, y: 85.9, tier: 'upper' },
  { label: '340', x: 18.6, y: 80.7, tier: 'upper' },
]

function hash(str = '') {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295
}

/**
 * Build price pins for an event: each curated Gillette section gets a
 * deterministic hypothetical price from its tier, plus availability.
 */
export function gillettePins(event = {}) {
  const tiers = deriveTiers(event, 'stadium')
  const byId = Object.fromEntries(tiers.map((t) => [t.id, t]))
  return GILLETTE_SECTIONS.map((s) => {
    const tier = byId[s.tier] ?? tiers[0]
    const r = hash(`${event.id || 'gil'}-${s.label}`)
    return {
      id: s.label,
      label: s.label,
      x: s.x,
      y: s.y,
      tierId: tier.id,
      tierName: tier.name,
      colorVar: tier.colorVar,
      price: Math.round(tier.price * (0.8 + r * 0.45)),
      currency: 'USD',
      available: hash(`${event.id || 'gil'}-a-${s.label}`) > 0.15,
    }
  })
}
