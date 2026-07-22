// Ticketing + hotel BUNDLE mock layer (scope 3.3 Hotel add-on, 3.4 Packages).
//
// PROTOTYPE DATA: Ticketmaster provides events only — no hotels, packages, or
// bundle pricing. Hotels below are curated "contracted block" mocks near the
// venue; packages are deterministic ticket+hotel SKUs. Hotel imagery reuses the
// design-system's bundled hotel photos so everything stays self-contained.
import { deriveTiers } from './seatmap.js'
import { imageForTheme } from './gamedayImagery.js'

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
      image: imageForTheme(p.theme)?.src ?? null,
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

/**
 * Scalable package board for the Storybook stress test. Synthesizes `count`
 * deterministic package SKUs by cycling the curated experience templates across
 * every ticket tier + contracted hotel — so a designer can dial the package
 * list from a handful up to a large grid and watch the cards/layout hold up.
 * The first {EXPERIENCE_PACKAGES.length} entries match the hand-authored
 * "Patriots Experiences" set; beyond that, variants recombine tier + hotel +
 * party size. Deterministic per event + index.
 */
export function generatePackageGrid(event = {}, opts = {}) {
  const { count = 12, nights = 1 } = opts
  const tiers = deriveTiers(event, 'stadium')
  const tierById = Object.fromEntries(tiers.map((t) => [t.id, t]))
  const hotelById = Object.fromEntries(CONTRACTED_HOTELS.map((h) => [h.id, h]))
  const seed = event.id || event.name || 'grid'
  const out = []

  for (let i = 0; i < count; i++) {
    const tmpl = EXPERIENCE_PACKAGES[i % EXPERIENCE_PACKAGES.length]
    const cyc = Math.floor(i / EXPERIENCE_PACKAGES.length)
    // First pass mirrors the curated packages exactly; later passes recombine.
    const tier = cyc === 0 ? (tierById[tmpl.tierId] ?? tiers[0]) : tiers[Math.floor(hash(`${seed}-gt${i}`) * tiers.length)]
    const hotel = cyc === 0 ? (hotelById[tmpl.hotelId] ?? CONTRACTED_HOTELS[0]) : CONTRACTED_HOTELS[Math.floor(hash(`${seed}-gh${i}`) * CONTRACTED_HOTELS.length)]
    const quantity = tmpl.quantity ?? (cyc === 0 ? 2 : 2 + Math.floor(hash(`${seed}-gq${i}`) * 3))
    const ticketTotal = tier.price * quantity
    const hotelTotal = hotel.nightlyRate * nights
    const experienceValue = tmpl.extra * quantity
    const componentsTotal = ticketTotal + hotelTotal + experienceValue
    const discountPct = 0.08 + hash(`${seed}-gd${i}`) * 0.08
    const packagePrice = Math.round(componentsTotal * (1 - discountPct))
    out.push({
      id: `grid-${i}-${tmpl.id}`,
      name: cyc === 0 ? tmpl.name : `${tmpl.name} · ${tier.name}`,
      theme: tmpl.theme,
      icon: tmpl.icon,
      accentVar: tmpl.accentVar,
      image: imageForTheme(tmpl.theme)?.src ?? null,
      tagline: tmpl.tagline,
      sponsor: tmpl.sponsor ?? null,
      experiences: tmpl.experiences,
      quantity,
      ticket: { tierId: tier.id, tierName: tier.name, price: tier.price, colorVar: tier.colorVar },
      hotel: { ...hotel, nights, hotelTotal },
      nights,
      componentsTotal,
      packagePrice,
      savings: componentsTotal - packagePrice,
      currency: 'USD',
      soldOut: hash(`${seed}-gsold-${i}`) > 0.85,
    })
  }

  return out
}

/**
 * Return a copy of an experience package with its hotel removed and repriced to
 * ticket + experience only — powering the "Packages Only" flow (the 2×2 pair of
 * "Packages + Hotel"). Keeps the same discount proportion the bundled SKU used.
 */
export function stripHotel(pkg) {
  const hotelTotal = pkg.hotel?.hotelTotal ?? 0
  const componentsTotal = pkg.componentsTotal - hotelTotal
  const ratio = pkg.componentsTotal ? pkg.packagePrice / pkg.componentsTotal : 1
  const packagePrice = Math.round(componentsTotal * ratio)
  return { ...pkg, hotel: null, nights: 0, componentsTotal, packagePrice, savings: componentsTotal - packagePrice }
}

// Itemized hotel-stay policies shown inside an expanded hotel line in the cart —
// mirroring the Book Reservation confirmation policies.
const HOTEL_CART_POLICIES = [
  { title: 'Check-in / Check-out', body: 'Check-in from 3:00 PM, check-out by 11:00 AM. Photo ID and the booking card required at check-in.' },
  { title: 'Cancellation', body: 'Free cancellation until 48 hours before check-in; after that, one night’s room rate plus tax.' },
  { title: 'Parking & Wi-Fi', body: 'Complimentary Wi-Fi. Event-day parking and shuttle options near Gillette Stadium are available.' },
]

/**
 * Itemized hotel-stay detail for an expandable cart line: address, dates, room,
 * a per-night breakdown, and the stay policies. Mirrors what the reservations
 * cart shows when a hotel is expanded, so ticket+hotel / package+hotel carts can
 * itemize the hotel the same way. Prototype dates.
 */
export function hotelCartDetail(hotel = {}, nights = 1) {
  const dates = ['Fri, Dec 5, 2026', 'Sat, Dec 6, 2026', 'Sun, Dec 7, 2026']
  const rate = hotel.nightlyRate ?? hotel.rate ?? 0
  return {
    name: hotel.name,
    // Imagery for the cart hotel block (resolved from the hosted library).
    image: hotel.image,
    imageCategories: hotel.imageCategories || ['exterior', 'rooms', 'lobby'],
    seed: Math.floor(hash(hotel.id || hotel.name || 'hotel') * 90),
    roomType: hotel.roomType || 'Deluxe King',
    address: hotel.address || '1 Patriot Pl, Foxborough, MA 02035',
    note: '1 King Bed · Sleeps 2 · Near Gillette Stadium',
    checkIn: 'Fri, Dec 5, 2026 · 3:00 PM',
    checkOut: 'Sat, Dec 6, 2026 · 11:00 AM',
    nights: Array.from({ length: nights }, (_, i) => ({ date: dates[i] || `Night ${i + 1}`, price: rate })),
    rate,
    total: rate * nights,
    policies: HOTEL_CART_POLICIES,
  }
}

/** Build a unified cart model from a ticket selection (+ optional hotel). */
export function buildBundleCart({ event, tier, quantity = 2, hotel = null, nights = 1, feeRate = 0.18, taxRate = 0.09 }) {
  const items = []
  const ticketSubtotal = (tier?.price ?? 0) * quantity
  // Quantity is editable in the cart (dropdown), so keep it out of the label.
  items.push({ type: 'ticket', label: `${tier?.name ?? 'Ticket'} ticket`, sublabel: event?.venue?.name, amount: ticketSubtotal, unitPrice: tier?.price, qty: quantity, maxQty: 8 })
  if (hotel) {
    const hotelTotal = hotel.nightlyRate * nights
    items.push({
      type: 'hotel', label: `${hotel.name} · ${hotel.roomType}`, sublabel: `${nights} night${nights === 1 ? '' : 's'}`, amount: hotelTotal,
      image: hotel.image, imageCategories: hotel.imageCategories || ['exterior', 'rooms', 'lobby'], seed: Math.floor(hash(hotel.id || hotel.name || 'hotel') * 90),
      hotelDetail: hotelCartDetail(hotel, nights),
    })
  }
  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const fees = Math.round(ticketSubtotal * feeRate)
  const taxes = Math.round(subtotal * taxRate)
  return { items, subtotal, fees, taxes, total: subtotal + fees + taxes, currency: 'USD', feeRate, taxRate }
}

/**
 * SeatGeek-style ticket-detail rows for the cart — the seat location plus the
 * delivery / verification / protection guarantees shown under the price. All
 * fulfilment is framed through EventPipe.
 */
export function ticketDetails({ section = 'CL10', row = '12' } = {}) {
  return [
    { icon: 'confirmation_number', title: `Section ${section}, Row ${row}` },
    { icon: 'qr_code_2', title: 'Mobile tickets', text: 'Delivered to the EventPipe app before gameday and scanned at the gate.' },
    { icon: 'verified', title: 'Verified tickets', text: 'Reviewed and verified by the venue — sourced through EventPipe.' },
    { icon: 'event_seat', title: 'Seats together', text: 'Your whole party is seated together in one block.' },
    { icon: 'verified_user', title: 'Every ticket protected', text: "If something comes up with the event, EventPipe has you covered." },
  ]
}

/**
 * Build a single-SKU cart for an experience package (one line at the package
 * price) in the shared ticketing cart shape. The sublabel auto-describes the
 * package — ticket + hotel when the package includes a stay, ticket-only when
 * stripHotel() has removed it.
 */
export function buildPackageCart(pkg, { sublabel = null, feeRate = 0.10, taxRate = 0.09 } = {}) {
  const fees = Math.round(pkg.packagePrice * feeRate)
  const taxes = Math.round(pkg.packagePrice * taxRate)
  const sub = sublabel ?? (pkg.hotel
    ? `${pkg.ticket.tierName} + ${pkg.hotel.name} · ${pkg.theme}`
    : `${pkg.ticket.tierName} ticket · ${pkg.theme}`)
  // Itemized "what's inside" rows for the expandable package line — the ticket
  // tier and each signature experience (the hotel gets its own rich sub-block).
  const details = [
    { icon: 'confirmation_number', title: `${pkg.ticket.tierName} ticket${pkg.quantity > 1 ? ` × ${pkg.quantity}` : ''}` },
    ...(pkg.experiences || []).map((x) => ({ icon: x.icon || 'stars', title: x.label })),
  ]
  // Re-pricing metadata so the cart's guests stepper can re-price the package
  // (scale the ticket portion, keep hotel + baked-in experience value fixed).
  const origQty = pkg.quantity || 2
  const ticketPrice = pkg.ticket?.price ?? 0
  const hotelTotal = pkg.hotel?.hotelTotal ?? 0
  const expValue = Math.max(0, (pkg.componentsTotal ?? 0) - ticketPrice * origQty - hotelTotal)
  const discountRate = pkg.componentsTotal ? (pkg.componentsTotal - pkg.packagePrice) / pkg.componentsTotal : 0
  return {
    items: [{
      type: 'package', label: pkg.name, sublabel: sub, amount: pkg.packagePrice,
      details,
      reprice: { ticketPrice, hotelTotal, expValue, discountRate, origQty, maxQty: 12 },
      hotelDetail: pkg.hotel ? hotelCartDetail(pkg.hotel, pkg.nights) : null,
    }],
    subtotal: pkg.packagePrice, fees, taxes, total: pkg.packagePrice + fees + taxes,
    currency: 'USD', savings: pkg.savings, feeRate, taxRate,
  }
}
