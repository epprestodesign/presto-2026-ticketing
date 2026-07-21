// Ticketing + hotel BUNDLE mock layer (scope 3.3 Hotel add-on, 3.4 Packages).
//
// PROTOTYPE DATA: Ticketmaster provides events only — no hotels, packages, or
// bundle pricing. Hotels below are curated "contracted block" mocks near the
// venue; packages are deterministic ticket+hotel SKUs. Hotel imagery reuses the
// design-system's bundled hotel photos so everything stays self-contained.
import { deriveTiers } from './seatmap.js'

const img = (file) => new URL(`../assets/hotel/${file}`, import.meta.url).href

// "Contracted block" properties an event producer curates near the venue (H-04).
export const CONTRACTED_HOTELS = [
  { id: 'courtyard', name: 'Courtyard by Marriott', brand: 'Marriott', distanceMi: 0.3, rating: 4.4, roomType: 'King Room', nightlyRate: 219, image: img('exterior.jpg') },
  { id: 'westin', name: 'The Westin', brand: 'Marriott', distanceMi: 0.8, rating: 4.6, roomType: 'Deluxe King', nightlyRate: 289, image: img('lobby.jpg') },
  { id: 'hilton-garden', name: 'Hilton Garden Inn', brand: 'Hilton', distanceMi: 1.2, rating: 4.2, roomType: 'Queen Studio', nightlyRate: 179, image: img('pool.jpg') },
  { id: 'hyatt-place', name: 'Hyatt Place', brand: 'Hyatt', distanceMi: 2.1, rating: 4.3, roomType: 'Double Queen', nightlyRate: 159, image: img('restaurant.jpg') },
]

// Rough walking minutes from distance (prototype heuristic).
export function walkMinutes(distanceMi) {
  return Math.max(3, Math.round(distanceMi * 20))
}

function hash(str = '') {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295
}

/**
 * Build pre-defined ticket + hotel packages for an event (scope 3.4). Each pairs
 * a ticket tier with a contracted hotel for a 1-night stay, priced as a single
 * SKU that is discounted vs. buying the parts separately (PK-04). Deterministic.
 */
export function generatePackages(event = {}, opts = {}) {
  const { kind = 'stadium', nights = 1 } = opts
  const tiers = deriveTiers(event, kind)
  const seed = event.id || event.name || 'pkg'

  // Pair the top ticket tiers with the closest hotels.
  const pairs = [
    { tier: tiers[0], hotel: CONTRACTED_HOTELS[0] },
    { tier: tiers[1] ?? tiers[0], hotel: CONTRACTED_HOTELS[1] },
    { tier: tiers[2] ?? tiers[0], hotel: CONTRACTED_HOTELS[2] },
  ]

  return pairs.map(({ tier, hotel }, i) => {
    const ticketPrice = tier.price
    const hotelTotal = hotel.nightlyRate * nights
    const componentsTotal = ticketPrice + hotelTotal
    // 6–16% bundle discount, deterministic per pairing.
    const discountPct = 0.06 + hash(`${seed}-${hotel.id}`) * 0.1
    const packagePrice = Math.round(componentsTotal * (1 - discountPct))
    const savings = componentsTotal - packagePrice
    return {
      id: `${tier.id}-${hotel.id}`,
      name: `${tier.name} + ${hotel.name}`,
      ticket: { tierId: tier.id, tierName: tier.name, price: ticketPrice, colorVar: tier.colorVar },
      hotel: { ...hotel, nights, hotelTotal },
      nights,
      componentsTotal,
      packagePrice,
      savings,
      currency: 'USD',
      soldOut: hash(`${seed}-sold-${i}`) > 0.85,
    }
  })
}

/** Build a unified cart model from a ticket selection (+ optional hotel). */
export function buildBundleCart({ event, tier, quantity = 2, hotel = null, nights = 1, feeRate = 0.18, taxRate = 0.09 }) {
  const items = []
  const ticketSubtotal = (tier?.price ?? 0) * quantity
  items.push({ type: 'ticket', label: `${tier?.name ?? 'Ticket'} × ${quantity}`, sublabel: event?.venue?.name, amount: ticketSubtotal })
  if (hotel) {
    const hotelTotal = hotel.nightlyRate * nights
    items.push({ type: 'hotel', label: `${hotel.name} · ${hotel.roomType}`, sublabel: `${nights} night${nights === 1 ? '' : 's'}`, amount: hotelTotal })
  }
  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const fees = Math.round(ticketSubtotal * feeRate)
  const taxes = Math.round(subtotal * taxRate)
  return { items, subtotal, fees, taxes, total: subtotal + fees + taxes, currency: 'USD' }
}
