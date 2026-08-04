// The Option C package board — the simplified one-click grid (Aug 4 feedback).
//
// Option A and Option B both lead with the library's Browse Packages page: a
// filter rail plus a scrolling list of rows, each opening a modal where the tier,
// hotel, room and extras are configured. The feedback asks for the opposite of
// that on the landing page:
//
//   • a GRID of tiles, not a scrolling list, sitting just below the header
//   • no filtering, no configuration — pick a tile and check out
//   • the only variable is the number of people, capped by room occupancy
//
// So a tile here is a COMPLETE SKU. Every choice Option A defers to the modal is
// baked in before the grid renders:
//
//   ticket tier × contracted hotel = one tile
//   3 tiers × 2 hotels             = 6 tiles
//
// The two hotels are the two-tier model from the feedback — the same ticket at a
// premium property or at a value one — which is why the grid reads as two rows of
// three rather than six unrelated cards.
import { computed } from 'vue'
import { HOTEL_IMAGERY } from '@lib/lib/hotelImagery.js'
import { walkMinutes } from '@lib/lib/bundles.js'
import { TIERS } from './pricing.js'
import { EVENT } from './event.js'

// --- The contracted hotels ---------------------------------------------------
// The MVP holds room blocks at exactly two properties. The Ritz-Carlton is not in
// the library's CONTRACTED_HOTELS (which tops out at The Westin), so it is
// defined here rather than by editing the library — the same rule every prototype
// in this repo follows.
//
// `sleeps` is the whole quantity model: the room is what's being sold, and the
// free tickets come with the room, so occupancy is the ticket cap.
export const HOTELS = [
  {
    id: 'ritz',
    name: 'The Ritz-Carlton',
    brand: 'Marriott',
    stayTier: 'Premium stay',
    rating: 4.8,
    distanceMi: 1.1,
    roomType: 'Carlton Suite',
    bed: '1 King Bed + Sofa Bed',
    sleeps: 4,
    nightlyRate: 549,
    blurb: 'The premium block — suites, club lounge access and valet.',
  },
  {
    id: 'courtyard',
    name: 'Courtyard by Marriott',
    brand: 'Marriott',
    stayTier: 'Value stay',
    rating: 4.4,
    distanceMi: 0.3,
    roomType: 'Double Queen',
    bed: '2 Queen Beds',
    sleeps: 4,
    nightlyRate: 219,
    blurb: 'Closest to the gate — walk to kickoff in minutes.',
  },
]

// --- Room types at each contracted hotel -------------------------------------
// The package is priced around the hotel's DEFAULT room (`included: true`);
// everything else is a per-night difference against it, the same convention
// Option A's hotel picker uses.
//
// The premium block carries a real choice of rooms; the value block is a single
// contracted room type. That asymmetry is deliberate — it is what "choose your
// room at the premium hotel" means without reintroducing a configuration step
// everywhere.
export const ROOMS = {
  ritz: [
    { id: 'carlton-suite', name: 'Carlton Suite', bed: '1 King Bed + Sofa Bed', sleeps: 4, sqft: 620, view: 'City view', deltaPerNight: 0, included: true, roomsLeft: 6 },
    { id: 'deluxe-king', name: 'Deluxe King', bed: '1 King Bed', sleeps: 2, sqft: 420, view: 'City view', deltaPerNight: -90, roomsLeft: 4 },
    { id: 'club-king', name: 'Club Level King', bed: '1 King Bed', sleeps: 2, sqft: 450, view: 'Stadium view', deltaPerNight: 60, roomsLeft: 2 },
    { id: 'executive-suite', name: 'Executive Suite', bed: '1 King Bed + Living Room', sleeps: 4, sqft: 880, view: 'Stadium view', deltaPerNight: 240, roomsLeft: 3 },
    { id: 'accessible-king', name: 'Accessible King', bed: '1 King Bed', sleeps: 2, sqft: 430, view: 'City view', deltaPerNight: -90, roomsLeft: 5 },
  ],
  courtyard: [
    { id: 'double-queen', name: 'Double Queen', bed: '2 Queen Beds', sleeps: 4, sqft: 385, view: 'City view', deltaPerNight: 0, included: true, roomsLeft: 8 },
  ],
}

/** The room types at a hotel, priced-in room first. */
export const roomsFor = (hotelId) => ROOMS[hotelId] || []

/** A room by id, falling back to the hotel's priced-in room. */
export function resolveRoom(hotelId, roomId) {
  const rooms = roomsFor(hotelId)
  return rooms.find((r) => r.id === roomId) || rooms.find((r) => r.included) || rooms[0] || null
}

// --- The ticket tiers on offer ----------------------------------------------
// The top three of the event's four tiers. Upper Level is held back: with the
// ticket given away, the cheapest tier adds a fourth near-identical row without
// adding a decision, and the feedback wants fewer tiles, not more.
export const GRID_TIERS = TIERS.slice(0, 3)

// What the contracted nightly rate becomes once the free ticket is folded in.
// Roughly half the ticket's face value per night — the richer the tier, the more
// the room carries. Prototype economics, deterministic so demos never drift.
const TIER_UPLIFT = { club: 260, lower: 180, mezz: 90, upper: 40 }

// Imagery for the tile hero, drawn from the library set.
//
// ROOMS, not exteriors. Two reasons: the library's exterior shots carry real hotel
// signage, so indexing them by slot put a Ritz-Carlton facade on a Courtyard tile;
// and the room is what's actually being sold here, so it's the honest hero. Each
// hotel gets its own category so the two rows stay visually distinct — suites for
// the premium block, standard rooms for the value one.
const byCategory = (category) => HOTEL_IMAGERY.filter((p) => p.category === category)
const pick = (pool, i) => (pool.length ? pool[i % pool.length] : null)
const HOTEL_PHOTO_CATEGORY = { ritz: 'Suites', courtyard: 'Rooms' }

// The board is BUILT at one night for a party of two, then re-priced live by
// priceTile() from whatever the search bar holds. Nights and guests are shared
// state (see store.js), not per-tile state — the dates change the price of every
// package at once, which is exactly why they sit above the grid rather than in it.
const BASE_NIGHTS = 1
const DEFAULT_GUESTS = 2

/**
 * Build one tile: a ticket tier at a hotel, sold as the room with the tickets
 * thrown in.
 *
 * Pricing is deliberately flat. `packagePrice` is the room for the night and does
 * NOT move with the party size — the room costs what it costs, and everyone in it
 * gets a ticket. What moves is the VALUE: each extra guest adds another free
 * ticket, so the struck-through a-la-carte total and the savings both grow while
 * the price the guest pays stays put. That is the whole "get your ticket free,
 * stay at this hotel" pitch, made visible in the numbers.
 */
function buildTile(tier, hotel, tierIndex) {
  const nightly = hotel.nightlyRate + (TIER_UPLIFT[tier.id] ?? 0)
  const hotelTotal = nightly * BASE_NIGHTS
  // Vary the photo across the row, but stay inside this hotel's own category.
  const photos = byCategory(HOTEL_PHOTO_CATEGORY[hotel.id] || 'Rooms')
  return {
    id: `${tier.id}-${hotel.id}`,
    name: `${tier.name} + ${hotel.name}`,
    theme: hotel.stayTier,
    icon: hotel.id === 'ritz' ? 'star' : 'hotel',
    accentVar: tier.colorVar,
    image: pick(photos, tierIndex)?.src || null,

    // The ticket — free, but its face value is what makes the savings real.
    ticket: {
      tierId: tier.id,
      tierName: tier.name,
      price: tier.price, // face value per ticket, charged at $0
      colorVar: tier.colorVar,
      desc: tier.desc,
    },
    // The stay — the thing actually being paid for.
    hotel: {
      ...hotel,
      nights: BASE_NIGHTS,
      nightlyRate: nightly,
      hotelTotal,
      walkMin: walkMinutes(hotel.distanceMi),
    },
    nights: BASE_NIGHTS,

    // Occupancy is the ticket cap — the one variable the feedback allows.
    quantity: DEFAULT_GUESTS,
    minGuests: 1,
    maxGuests: hotel.sleeps,

    // Priced for the default party; the tile re-derives both as guests change.
    componentsTotal: hotelTotal + tier.price * DEFAULT_GUESTS,
    packagePrice: hotelTotal,
    savings: tier.price * DEFAULT_GUESTS,
    currency: 'USD',
  }
}

/**
 * The 6-tile grid, premium row first.
 *
 * Ordered hotel-major so each ROW is one hotel across the three tiers, which is
 * what makes the two-tier model legible at a glance: the top row is the premium
 * stay, the bottom row the same three tickets at the value stay.
 */
export const packageGrid = computed(() =>
  HOTELS.flatMap((hotel) =>
    GRID_TIERS.map((tier, tierIndex) => buildTile(tier, hotel, tierIndex))
  )
)

/** The tile matching an id (used to restore state from a deep link). */
export function packageById(id) {
  return packageGrid.value.find((p) => p.id === id) || null
}

/**
 * Re-price a tile for the current stay — the party size and the nights from the
 * search bar above the board.
 *
 *   rooms   = ceil(guests / occupancy)     one room can only sleep so many
 *   price   = nightly × nights × rooms     the stay is what's charged
 *   value   = price + ticket face × guests the a-la-carte comparison
 *   saving  = ticket face × guests         "N tickets free"
 *
 * Occupancy caps the tickets per ROOM, as the feedback specifies — but a party
 * larger than one room books a second room rather than being refused, since a
 * client-appreciation outing is the whole premise of the event. Nights multiply
 * the room and nothing else: the tickets stay free however long the stay is.
 */
export function priceTile(pkg, guests, nights = 1, room = null) {
  const people = Math.max(1, guests || 1)
  const stay = Math.max(1, nights || 1)
  // Occupancy follows the CHOSEN room when there is one — picking a smaller room
  // at the premium hotel can mean needing a second one.
  const sleeps = room?.sleeps || pkg?.hotel?.sleeps || 1
  const rooms = Math.ceil(people / sleeps)

  const nightly = (pkg?.hotel?.nightlyRate ?? 0) + (room?.deltaPerNight ?? 0)
  const roomTotal = nightly * stay * rooms
  const ticketValue = (pkg?.ticket?.price ?? 0) * people

  return {
    guests: people,
    nights: stay,
    rooms,
    room,
    sleeps,
    nightly,
    ticketValue,
    roomTotal,
    componentsTotal: roomTotal + ticketValue,
    packagePrice: roomTotal,
    savings: ticketValue,
  }
}
