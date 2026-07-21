// SeatGeek-style listing + deal-score mock layer.
//
// PROTOTYPE DATA: Ticketmaster's Discovery API returns events + a static seatmap
// image only — no per-seat listings, prices, deal scores, or view-from-seat
// photos. Everything below is generated deterministically from a real event so
// we can prototype the SeatGeek-like "browse listings on a map" experience.
// View-from-seat photos are stock (Unsplash) placeholders, not real seat views.
import { deriveTiers } from './seatmap.js'

// Attributed stock photos standing in for "view from your seat". Unsplash
// guidelines require visible photographer + Unsplash attribution (see
// ViewFromSeat.vue, which renders `attribution`).
export const SEAT_VIEW_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1727433421243-ff1ce924092a?fit=max&fm=jpg&q=80&w=1080', thumb: 'https://images.unsplash.com/photo-1727433421243-ff1ce924092a?fit=max&fm=jpg&q=80&w=400', alt: 'View toward the field from the stands', photographer: 'Justine CLAVERIE', photographerUrl: 'https://unsplash.com/@danjustine?utm_source=eventpipe&utm_medium=referral', photoUrl: 'https://unsplash.com/photos/AIGYkFbUVwo?utm_source=eventpipe&utm_medium=referral' },
  { url: 'https://images.unsplash.com/photo-1780087585404-85eefd8b14aa?fit=max&fm=jpg&q=80&w=1080', thumb: 'https://images.unsplash.com/photo-1780087585404-85eefd8b14aa?fit=max&fm=jpg&q=80&w=400', alt: 'Stadium seating with spectators', photographer: 'Ashwin Tanjore', photographerUrl: 'https://unsplash.com/@ashwintanjore?utm_source=eventpipe&utm_medium=referral', photoUrl: 'https://unsplash.com/photos/ZAeRj0d00NA?utm_source=eventpipe&utm_medium=referral' },
  { url: 'https://images.unsplash.com/photo-1779449607426-dab508147e7b?fit=max&fm=jpg&q=80&w=1080', thumb: 'https://images.unsplash.com/photo-1779449607426-dab508147e7b?fit=max&fm=jpg&q=80&w=400', alt: 'Lower-bowl seats near the pitch', photographer: 'Tanya Barrow', photographerUrl: 'https://unsplash.com/@tanyabarrow?utm_source=eventpipe&utm_medium=referral', photoUrl: 'https://unsplash.com/photos/Axuf9MWTVlA?utm_source=eventpipe&utm_medium=referral' },
  { url: 'https://images.unsplash.com/photo-1779449607197-c4a7c14e3139?fit=max&fm=jpg&q=80&w=1080', thumb: 'https://images.unsplash.com/photo-1779449607197-c4a7c14e3139?fit=max&fm=jpg&q=80&w=400', alt: 'Seats along the sideline', photographer: 'Tanya Barrow', photographerUrl: 'https://unsplash.com/@tanyabarrow?utm_source=eventpipe&utm_medium=referral', photoUrl: 'https://unsplash.com/photos/JSP_tXdB7XQ?utm_source=eventpipe&utm_medium=referral' },
  { url: 'https://images.unsplash.com/photo-1704908327144-e6237ea323a4?fit=max&fm=jpg&q=80&w=1080', thumb: 'https://images.unsplash.com/photo-1704908327144-e6237ea323a4?fit=max&fm=jpg&q=80&w=400', alt: 'Upper-deck view over the stadium', photographer: 'Alex Moliski', photographerUrl: 'https://unsplash.com/@alexmoliski?utm_source=eventpipe&utm_medium=referral', photoUrl: 'https://unsplash.com/photos/UUPc7I4h9vc?utm_source=eventpipe&utm_medium=referral' },
  { url: 'https://images.unsplash.com/photo-1777715330172-704cd49c0d5b?fit=max&fm=jpg&q=80&w=1080', thumb: 'https://images.unsplash.com/photo-1777715330172-704cd49c0d5b?fit=max&fm=jpg&q=80&w=400', alt: 'Field-level view from the seats', photographer: 'Tanya Barrow', photographerUrl: 'https://unsplash.com/@tanyabarrow?utm_source=eventpipe&utm_medium=referral', photoUrl: 'https://unsplash.com/photos/QAsaOOdEwIY?utm_source=eventpipe&utm_medium=referral' },
]

function hash(str = '') {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295
}

/**
 * Map a 1–10 deal score to a label + intent color token. Higher = better value
 * (SeatGeek convention: green = great deal).
 */
export function dealMeta(score) {
  if (score >= 9) return { label: 'Amazing', colorVar: '--ds-palette-green-600' }
  if (score >= 7) return { label: 'Great', colorVar: '--ds-palette-green-600' }
  if (score >= 5) return { label: 'Good', colorVar: '--ds-palette-amber-500' }
  if (score >= 3) return { label: 'Fair', colorVar: '--ds-palette-amber-600' }
  return { label: 'Low', colorVar: '--ds-palette-gray-400' }
}

/**
 * Generate deterministic SeatGeek-style listings for an event. Each listing is
 * a section/row offer with a price, a deal score (relative to its tier median),
 * a stock view-from-seat photo, and flags (best in section, cheapest in
 * section). Returns listings sorted by best value first.
 */
export function generateListings(event = {}, opts = {}) {
  const { kind = 'stadium', perListingTiers = null, count = 14 } = opts
  const tiers = perListingTiers ?? deriveTiers(event, kind)
  const seedBase = event.id || event.name || 'listings'
  const listings = []

  for (let i = 0; i < count; i++) {
    const r = hash(`${seedBase}-L${i}`)
    const tier = tiers[Math.floor(hash(`${seedBase}-T${i}`) * tiers.length)]
    const section = 100 + Math.floor(hash(`${seedBase}-S${i}`) * 330)
    const row = 1 + Math.floor(hash(`${seedBase}-R${i}`) * 34)
    // Price jitters around the tier base ±35%.
    const price = Math.round(tier.price * (0.65 + r * 0.7))
    const fees = Math.round(price * 0.18)
    const photo = SEAT_VIEW_PHOTOS[i % SEAT_VIEW_PHOTOS.length]
    const perks = hash(`${seedBase}-P${i}`) > 0.7 ? ['Aisle'] : []
    listings.push({
      id: `${tier.id}-${section}-${row}`,
      tierId: tier.id,
      tierName: tier.name,
      colorVar: tier.colorVar,
      section,
      row,
      quantityAvailable: 1 + Math.floor(hash(`${seedBase}-Q${i}`) * 6),
      price,
      fees,
      priceWithFees: price + fees,
      currency: tier.currency || 'USD',
      perks,
      photo,
      _score: r, // temp; replaced with deal score below
    })
  }

  // Deal score: cheaper than the tier's own listings ⇒ higher score.
  const byTier = {}
  for (const l of listings) (byTier[l.tierId] ??= []).push(l)
  for (const group of Object.values(byTier)) {
    const prices = group.map((l) => l.priceWithFees)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const cheapest = group.reduce((a, b) => (b.priceWithFees < a.priceWithFees ? b : a))
    for (const l of group) {
      const rel = max === min ? 0.5 : 1 - (l.priceWithFees - min) / (max - min) // 1 = cheapest
      l.dealScore = Math.max(1, Math.min(10, Math.round(3 + rel * 7)))
      l.dealLabel = dealMeta(l.dealScore).label
      l.cheapestInSection = l === cheapest
      delete l._score
    }
    cheapest.bestDeal = true
  }

  return listings.sort((a, b) => b.dealScore - a.dealScore || a.priceWithFees - b.priceWithFees)
}

/** A histogram-friendly price distribution (bin counts) for a set of listings. */
export function priceDistribution(listings = [], bins = 24) {
  if (!listings.length) return { bins: [], min: 0, max: 0 }
  const prices = listings.map((l) => l.priceWithFees)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const span = max - min || 1
  const counts = new Array(bins).fill(0)
  for (const p of prices) {
    const idx = Math.min(bins - 1, Math.floor(((p - min) / span) * bins))
    counts[idx]++
  }
  return { bins: counts, min, max }
}
