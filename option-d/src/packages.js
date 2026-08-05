// The Option D package board — two packages, one per hotel (Aug 5 feedback).
//
// Option C's board is six tiles: 3 ticket tiers × 2 hotels. The Aug 5 feedback
// cuts that down to the single decision that actually matters here:
//
//   "Two tiles side by side only: one per hotel option. Package contents are
//    identical across both; only the hotel differs."
//
// So there is no tier axis any more. Both packages carry the SAME inclusions —
// the same tickets, the same transportation, the same hospitality — and are
// named for the only thing that separates them. The guest is choosing a hotel,
// and the package is how they get there.
//
// The other half of the feedback is that this is a pre-invited group: the party
// is invited for two days, so there are no dates to pick and no availability to
// search. The stay is fixed; the only variable is how many people are coming.
import { computed } from 'vue'
import { HOTEL_IMAGERY } from '@lib/lib/hotelImagery.js'
import { walkMinutes } from '@lib/lib/bundles.js'
import { TIERS } from './pricing.js'
import { STAY_LABEL } from './event.js'

// --- The stay -----------------------------------------------------------------
// Fixed, because the guests are already invited for the weekend. Check in the
// day before kickoff, check out the day after — two nights around Sunday's
// 1:00 PM game. Nothing on any screen offers to change this.
export const NIGHTS = 2
export const STAY_SHORT = '2 nights'
// Re-exported so screens can pull the stay from one place; the string itself
// lives in event.js alongside the rest of the event's copy.
export { STAY_LABEL }

// --- The two hotels -----------------------------------------------------------
// The Westin is the library's own contracted property; The Ritz-Carlton is not in
// `CONTRACTED_HOTELS`, so it is defined here rather than by editing the library —
// the rule every prototype in this repo follows.
export const HOTELS = [
  {
    id: 'westin',
    name: 'The Westin',
    packageName: 'Westin Package',
    brand: 'Marriott',
    rating: 4.6,
    distanceMi: 0.8,
    roomType: 'Deluxe King',
    bed: '1 King Bed',
    sleeps: 2,
    nightlyRate: 289,
    blurb: 'Full-service hotel with the largest standard rooms of the two.',
    photoCategory: 'Rooms',
  },
  {
    id: 'ritz',
    name: 'The Ritz-Carlton',
    packageName: 'Ritz-Carlton Package',
    brand: 'Marriott',
    rating: 4.8,
    distanceMi: 1.1,
    roomType: 'Carlton Suite',
    bed: '1 King Bed + Sofa Bed',
    sleeps: 4,
    nightlyRate: 549,
    blurb: 'The premium block — suites, club lounge access and valet.',
    photoCategory: 'Suites',
  },
]

// --- What's in the package ----------------------------------------------------
// IDENTICAL across both hotels. That is the point of the Aug 5 feedback: the only
// difference between the two tiles is where you sleep, so anything that differed
// would undermine the comparison.
//
// The ticket tier is fixed too — one tier, not a choice — because Option D has no
// tier axis. Club Level is the one the event holds.
export const TIER = TIERS.find((t) => t.id === 'club') || TIERS[0]

// Flat per-package value for the non-room, non-ticket inclusions. Prototype
// economics, deterministic so demos never drift.
//
// Exported because the hotel page's package price breakdown itemises them —
// `extrasTotal` alone can't be split back apart once summed.
export const TRANSPORT_VALUE = 180  // round-trip coach, hotel ↔ stadium, both days
export const HOSPITALITY_VALUE = 140 // pregame hospitality tent, per person

/** The inclusion list both packages carry, rendered on the tile and at checkout. */
export const inclusionsFor = (people) => [
  { icon: 'confirmation_number', label: `${people} × ${TIER.name} ticket${people === 1 ? '' : 's'}`, note: 'Seated together in one block' },
  { icon: 'hotel', label: `${STAY_SHORT} · ${STAY_LABEL}`, note: 'Check-in 3:00 PM · check-out 11:00 AM' },
  { icon: 'directions_bus', label: 'Round-trip transportation', note: 'Coach between the hotel and Gillette Stadium' },
  { icon: 'celebration', label: 'Pregame hospitality', note: 'Food and drink in the EventPipe tent before kickoff' },
]

// Imagery: room shots rather than exteriors — the library's exterior photos carry
// real hotel signage, which put the wrong brand on a tile in Option C.
const photoFor = (hotel, i = 0) => {
  const pool = HOTEL_IMAGERY.filter((p) => p.category === hotel.photoCategory)
  return (pool.length ? pool[i % pool.length] : HOTEL_IMAGERY[0])?.src || null
}

// The bundle discount against buying the parts separately. One rate for both, so
// the tiles stay comparable.
const DISCOUNT_RATE = 0.12

/**
 * Price a package for a party.
 *
 * Rooms follow occupancy — the Westin's Deluxe King sleeps 2, the Ritz's Carlton
 * Suite sleeps 4 — so a party of four needs two rooms at the Westin and one at
 * the Ritz. That is a real difference between the two options, and the tiles say
 * so rather than letting the price move unexplained.
 */
export function pricePackage(hotel, people) {
  const guests = Math.max(1, people || 1)
  const rooms = Math.ceil(guests / hotel.sleeps)

  const ticketsTotal = TIER.price * guests
  const stayTotal = hotel.nightlyRate * NIGHTS * rooms
  const extrasTotal = TRANSPORT_VALUE * rooms + HOSPITALITY_VALUE * guests

  const componentsTotal = ticketsTotal + stayTotal + extrasTotal
  const packagePrice = Math.round(componentsTotal * (1 - DISCOUNT_RATE))

  return {
    guests,
    rooms,
    nights: NIGHTS,
    ticketsTotal,
    stayTotal,
    extrasTotal,
    componentsTotal,
    packagePrice,
    savings: componentsTotal - packagePrice,
    perPerson: Math.round(packagePrice / guests),
  }
}

/** Build one package tile for a hotel, priced for the party. */
function buildPackage(hotel, people) {
  const priced = pricePackage(hotel, people)
  return {
    id: `${hotel.id}-package`,
    name: hotel.packageName,
    hotel: { ...hotel, nights: NIGHTS, walkMin: walkMinutes(hotel.distanceMi) },
    image: photoFor(hotel),
    ticket: { tierId: TIER.id, tierName: TIER.name, price: TIER.price, colorVar: TIER.colorVar, desc: TIER.desc },
    inclusions: inclusionsFor(priced.guests),
    nights: NIGHTS,
    quantity: priced.guests,
    currency: 'USD',
    ...priced,
  }
}

/**
 * The two packages, priced for a party size. A function rather than a computed,
 * because the party size lives in the store and every screen prices from it.
 */
export const packagesFor = (people) => HOTELS.map((h) => buildPackage(h, people))

/** Both packages at the default party, for stories and cold deep links. */
export const packageGrid = computed(() => packagesFor(2))

/** A package by id. */
export function packageById(id, people = 2) {
  return packagesFor(people).find((p) => p.id === id) || null
}

/** A hotel by id — used by the read-only details page. */
export const hotelById = (id) => HOTELS.find((h) => h.id === id) || HOTELS[0]

// --- Room types, for the read-only hotel details page -------------------------
// Option D sells ONE room type per hotel — the one the package covers — so this
// is a single entry each. The details page shows it; nothing selects it.
export const ROOMS = {
  westin: [
    { id: 'deluxe-king', name: 'Deluxe King', bed: '1 King Bed', sleeps: 2, sqft: 420, view: 'City view', deltaPerNight: 0, included: true, roomsLeft: 9 },
  ],
  ritz: [
    { id: 'carlton-suite', name: 'Carlton Suite', bed: '1 King Bed + Sofa Bed', sleeps: 4, sqft: 620, view: 'City view', deltaPerNight: 0, included: true, roomsLeft: 6 },
  ],
}
export const roomsFor = (hotelId) => ROOMS[hotelId] || []
export function resolveRoom(hotelId, roomId) {
  const rooms = roomsFor(hotelId)
  return rooms.find((r) => r.id === roomId) || rooms[0] || null
}
