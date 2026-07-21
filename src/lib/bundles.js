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

// Themed "Patriots experience" packages for the EventPipe client-appreciation
// outing — beyond a plain ticket+hotel, each bundles a signature experience.
// Sponsor names are illustrative/fictional (prototype).
const EXPERIENCE_PACKAGES = [
  {
    id: 'legends-tour', theme: 'Stadium Tour', icon: 'tour', accentVar: '--ds-palette-blue-600',
    name: 'Legends Stadium Tour', tierId: 'club', hotelId: 'westin', extra: 120,
    tagline: 'Go behind the scenes before kickoff.',
    experiences: [
      { icon: 'stadium', label: 'Guided stadium & locker-room tour' },
      { icon: 'emoji_events', label: 'Patriots Hall of Fame visit' },
      { icon: 'photo_camera', label: 'Pregame field photo op' },
    ],
  },
  {
    id: 'ultimate-tailgate', theme: 'Tailgate', icon: 'outdoor_grill', accentVar: '--ds-palette-amber-600',
    name: 'Ultimate Tailgate', tierId: 'lower', hotelId: 'courtyard', extra: 95,
    sponsor: 'Harbor Light Brewing', tagline: 'The full pregame party, hosted for you.',
    experiences: [
      { icon: 'celebration', label: 'Sponsored pregame tailgate party' },
      { icon: 'lunch_dining', label: 'All-you-can-eat New England BBQ' },
      { icon: 'sports_bar', label: 'Craft beer garden (21+)' },
    ],
  },
  {
    id: 'family-gameday', theme: 'Family · Kids Friendly', icon: 'family_restroom', accentVar: '--ds-palette-green-600',
    name: 'Family Gameday', tierId: 'mezz', hotelId: 'hilton-garden', extra: 60, quantity: 4,
    tagline: 'An easy, kid-friendly day out for the whole crew.',
    experiences: [
      { icon: 'child_care', label: 'Junior Patriots activity kit for kids' },
      { icon: 'face', label: 'Face-painting & mascot meet-and-greet' },
      { icon: 'local_parking', label: 'Reserved family parking pass' },
    ],
  },
  {
    id: 'field-vip', theme: 'VIP', icon: 'workspace_premium', accentVar: '--ds-palette-red-600',
    name: 'Field-Level VIP', tierId: 'club', hotelId: 'westin', extra: 240,
    tagline: 'The white-glove treatment, start to finish.',
    experiences: [
      { icon: 'meeting_room', label: 'Optum Field Lounge all-game access' },
      { icon: 'sports_football', label: 'Pregame field-level visit' },
      { icon: 'restaurant', label: 'Premium all-inclusive catering' },
    ],
  },
  {
    id: 'fan-essentials', theme: 'Value', icon: 'confirmation_number', accentVar: '--ds-palette-slate-500',
    name: 'Fan Essentials', tierId: 'upper', hotelId: 'hyatt-place', extra: 0,
    tagline: 'Everything you need for the game — nothing you don’t.',
    experiences: [
      { icon: 'directions_bus', label: 'Round-trip shuttle to Gillette' },
      { icon: 'hotel', label: 'Overnight stay near the venue' },
    ],
  },
]

/**
 * Build the themed Patriots-experience packages for an event: ticket tier +
 * hotel + a signature experience, priced as a single discounted SKU.
 */
export function generateExperiencePackages(event = {}, opts = {}) {
  const { nights = 1 } = opts
  const tiers = deriveTiers(event, 'stadium')
  const tierById = Object.fromEntries(tiers.map((t) => [t.id, t]))
  const hotelById = Object.fromEntries(CONTRACTED_HOTELS.map((h) => [h.id, h]))
  const seed = event.id || event.name || 'exp'

  return EXPERIENCE_PACKAGES.map((p, i) => {
    const tier = tierById[p.tierId] ?? tiers[0]
    const hotel = hotelById[p.hotelId] ?? CONTRACTED_HOTELS[0]
    const quantity = p.quantity ?? 2
    const ticketTotal = tier.price * quantity
    const hotelTotal = hotel.nightlyRate * nights
    const experienceValue = p.extra * quantity
    const componentsTotal = ticketTotal + hotelTotal + experienceValue
    const discountPct = 0.08 + hash(`${seed}-${p.id}`) * 0.08
    const packagePrice = Math.round(componentsTotal * (1 - discountPct))
    return {
      id: p.id,
      name: p.name,
      theme: p.theme,
      icon: p.icon,
      accentVar: p.accentVar,
      tagline: p.tagline,
      sponsor: p.sponsor ?? null,
      experiences: p.experiences,
      quantity,
      ticket: { tierId: tier.id, tierName: tier.name, price: tier.price, colorVar: tier.colorVar },
      hotel: { ...hotel, nights, hotelTotal },
      nights,
      componentsTotal,
      packagePrice,
      savings: componentsTotal - packagePrice,
      currency: 'USD',
      soldOut: hash(`${seed}-exp-sold-${i}`) > 0.88,
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
