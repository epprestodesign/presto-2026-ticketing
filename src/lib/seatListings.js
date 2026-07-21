// SeatGeek-style listing mock layer.
//
// PROTOTYPE DATA: Ticketmaster's Discovery API returns events + a static seatmap
// image only — no per-seat listings, prices, or view-from-seat photos.
// Everything below is generated deterministically from a real event so we can
// prototype the SeatGeek-like "browse listings on a map" experience.
// View-from-seat photos are stock (Unsplash) placeholders, not real seat views.
import { deriveTiers } from './seatmap.js'
import { GILLETTE_SECTIONS } from './gilletteMap.js'

// Attributed stock photos standing in for "view from your seat". Unsplash
// guidelines require visible photographer + Unsplash attribution (see
// ViewFromSeat.vue, which renders `attribution`).
// American-football stadium points-of-view (hosted in the presto-ds-imagery
// library under `seat-views/`; direct Unsplash CDN URLs used here so the hero
// renders instantly without depending on the imagery Pages deploy). Each entry
// carries the photographer + photo link the ViewFromSeat/TicketMap hero renders.
const uP = (slug, w) => `https://images.unsplash.com/${slug}?fit=crop&crop=entropy&fm=jpg&q=80&w=${w}`
const seatPhoto = (slug, alt, photographer, user, photoId) => ({
  url: uP(slug, 1080), thumb: uP(slug, 400), alt,
  photographer, photographerUrl: `https://unsplash.com/@${user}?utm_source=eventpipe&utm_medium=referral`,
  photoUrl: `https://unsplash.com/photos/${photoId}?utm_source=eventpipe&utm_medium=referral`,
})
export const SEAT_VIEW_PHOTOS = [
  seatPhoto('photo-1723079426787-c54d04669613', 'View across the stadium at sunset', 'Cam Carpenter', 'cam_cameras', 'EKjVrS7O0io'),
  seatPhoto('photo-1781650104690-a5309d91a26b', 'Crowded football stadium under the lights', 'Scott Greer', 'sgreer', 'b_XhrmGQnyc'),
  seatPhoto('photo-1759808418405-c9693ad62957', 'Spectators watching from a modern stadium', 'Johnathan Kaufman', 'j_35mm', 'LemW56Wd7SE'),
  seatPhoto('photo-1770479086965-430e49d96e23', 'A packed stadium from the stands', 'Huang Lin', 'habobo', 'S-loLgsCLww'),
  seatPhoto('photo-1780087585404-85eefd8b14aa', 'Stadium seating with spectators', 'Ashwin Tanjore', 'ashwintanjore', 'ZAeRj0d00NA'),
  seatPhoto('photo-1759156207340-b9acde1cb905', 'View over the crowd on a clear day', 'Ruben Mavarez', 'justalifein', '_yKWjAn38KU'),
  seatPhoto('photo-1777715330109-d43457f51d1c', 'Field-level view with the crowd behind', 'Tanya Barrow', 'tanyabarrow', 'LJGEN5JsVDo'),
  seatPhoto('photo-1781793708575-f586c9f14011', 'A large crowd fills the stadium', 'Lx1', 'lx1', 'f2sG7LK08A0'),
  seatPhoto('photo-1777715329434-fe4379703852', 'Lower-bowl seats over the field', 'Tanya Barrow', 'tanyabarrow', 'WcM1NjXyj5o'),
  seatPhoto('photo-1699862731387-d40f6908ca4e', 'A large crowd of fans in the stadium', 'Jonathan Ikemura', 'ikemura', '8dzMfCuAYRA'),
  seatPhoto('photo-1780087585364-5f2777d299f6', 'View across a stadium full of spectators', 'Ashwin Tanjore', 'ashwintanjore', 'RGgnob-aCx0'),
  seatPhoto('photo-1783464553897-88c986c67445', 'Seats close to the action', 'Karsten Winegeart', '_karsten', 'pOazc4aGN6k'),
]

function hash(str = '') {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295
}

/**
 * Generate deterministic SeatGeek-style listings for an event. Each listing is
 * a section/row offer with a price and a stock view-from-seat photo. Returns
 * listings sorted by price (lowest first).
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
    })
  }

  return listings.sort((a, b) => a.priceWithFees - b.priceWithFees)
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

/**
 * Venue-anchored listings for the Ticket Map stress test. Unlike
 * {@link generateListings} (which scatters synthetic section numbers), every
 * listing here is pinned to a REAL curated Gillette section from
 * GILLETTE_SECTIONS — so its section label, seating tier, and map coordinates
 * are coherent with the interactive VenueMap. Each listing gets a small
 * deterministic position jitter so overlapping offers in the same section fan
 * out across the map as individual pins (one pin per listing). Deterministic
 * per event + index, so a given `count` always renders the same board.
 */
export function generateVenueListings(event = {}, opts = {}) {
  const { count = 100 } = opts
  const tiers = deriveTiers(event, 'stadium')
  const byTier = Object.fromEntries(tiers.map((t) => [t.id, t]))
  const seedBase = event.id || event.name || 'listings'
  const sections = GILLETTE_SECTIONS
  const listings = []

  for (let i = 0; i < count; i++) {
    const anchor = sections[Math.floor(hash(`${seedBase}-A${i}`) * sections.length)]
    const tier = byTier[anchor.tier] ?? tiers[0]
    const r = hash(`${seedBase}-L${i}`)
    const price = Math.round(tier.price * (0.65 + r * 0.7))
    const fees = Math.round(price * 0.18)
    const row = 1 + Math.floor(hash(`${seedBase}-R${i}`) * 34)
    // Fan overlapping offers out around the anchor so each gets its own pin.
    const jx = (hash(`${seedBase}-JX${i}`) - 0.5) * 5.5
    const jy = (hash(`${seedBase}-JY${i}`) - 0.5) * 5.5
    listings.push({
      id: `L${i}-${anchor.label}-${row}`,
      tierId: tier.id,
      tierName: tier.name,
      colorVar: tier.colorVar,
      section: anchor.label,
      row,
      x: clamp(anchor.x + jx, 3, 97),
      y: clamp(anchor.y + jy, 3, 97),
      quantityAvailable: 1 + Math.floor(hash(`${seedBase}-Q${i}`) * 6),
      price,
      fees,
      priceWithFees: price + fees,
      currency: tier.currency || 'USD',
      perks: hash(`${seedBase}-P${i}`) > 0.72 ? ['Aisle'] : [],
      photo: SEAT_VIEW_PHOTOS[i % SEAT_VIEW_PHOTOS.length],
      available: hash(`${seedBase}-AV${i}`) > 0.08,
    })
  }

  return listings.sort((a, b) => a.priceWithFees - b.priceWithFees)
}

/**
 * Map venue-anchored listings (from {@link generateVenueListings}) to VenueMap
 * price pins — one pin per listing, carrying the listing's own id so a pin click
 * selects that exact offer. Price shown is the all-in price incl. fees.
 */
export function listingPins(listings = []) {
  return listings.map((l) => ({
    id: l.id,
    label: l.section,
    x: l.x,
    y: l.y,
    price: l.priceWithFees,
    currency: l.currency,
    tierId: l.tierId,
    tierName: l.tierName,
    colorVar: l.colorVar,
    available: l.available !== false,
  }))
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
