// The hotel side of the trip: the four contracted properties, the detail each
// one's own page needs, and the ROOM TYPES a guest picks between.
//
// Aug 25 feedback: "I want to pick the hotel... I want to dig in. I want to pick
// the room type." Until now the hotel step chose a PROPERTY and the room was
// whatever `CONTRACTED_HOTELS` happened to name — one rate, no choice, no page
// to read before committing a night's money. This module is what a room list
// needs to exist.
//
// The library stays the price source. `CONTRACTED_HOTELS` still supplies the id,
// name, distance, rating, contracted room name and nightly rate; nothing here
// re-prices a property. What it adds is the material the booking site's own
// `HotelDetailPage` renders and a ticketing fixture never had to carry: an
// address, a star rating, amenity keys, about copy, policies, map coordinates —
// and the room ladder.
//
// Why the data is local rather than a fifth field on the library fixture: the
// library is read-only in every prototype here, and `CONTRACTED_HOTELS` is a
// deliberately thin four-line fixture that three other apps import. Thickening
// it for this fork would change what those apps see.
import { CONTRACTED_HOTELS, walkMinutes } from '@lib/lib/bundles.js'
import { getAmenities, amenityGroups } from '@lib/lib/amenities.js'

// One night, Sat → Sun, the night before a Sunday 1:00 PM kickoff. Fixed rather
// than derived: the whole prototype prices one night (see the README), and a
// date picker on this step would be a second decision the fan did not come here
// to make.
export const STAY = {
  // Sunday 1:00 PM kickoff → the night before is the night that gets booked.
  // (The December sibling is also a Sunday game but kicks off at 4:25 PM and
  // books Fri → Sat; same one-night shape, different weekend.)
  checkIn: '2026-09-19',
  checkOut: '2026-09-20',
  nights: 1,
  checkInTime: '3:00 PM',
  checkOutTime: '11:00 AM',
  range: 'Sat, Sep 19 → Sun, Sep 20, 2026',
  nightDates: ['Sat, Sep 19, 2026'],
}

// Per-property detail, keyed on the library's own ids so the two lists can never
// drift apart — an id here that CONTRACTED_HOTELS drops simply stops resolving.
const DETAIL = {
  courtyard: {
    city: 'Foxborough, MA',
    address: '35 Foxborough Blvd, Foxborough, MA 02035',
    stars: 3.5,
    reviews: 1284,
    seed: 3,
    lat: 42.0925, lng: -71.2643,
    amenities: [
      'wifi', 'parking', 'breakfast_fee', 'restaurant', 'bar', 'coffee_shop', 'fitness',
      'indoor_pool', 'front_desk_24h', 'laundry', 'luggage_storage', 'express_checkin',
      'air_conditioning', 'tv', 'safe', 'in_room_fridge', 'coffee_maker', 'iron',
      'interior_corridors', 'connecting_rooms', 'accessible', 'elevator', 'non_smoking',
    ],
    blurb: 'the closest of the four to the gate, and the one that empties into the tailgate lots on foot',
    quirk: 'The lobby bistro opens at 6:00 AM and runs a gameday grab-and-go until noon, which is the difference between eating and queueing when the lots open at 12:25.',
  },
  westin: {
    city: 'Foxborough, MA',
    address: '1 Patriot Pl, Foxborough, MA 02035',
    stars: 4,
    reviews: 2107,
    seed: 11,
    lat: 42.0909, lng: -71.2643,
    amenities: [
      'wifi', 'valet', 'ev_charging', 'restaurant', 'bar', 'room_service', 'minibar',
      'indoor_pool', 'hot_tub', 'spa', 'fitness', 'concierge', 'front_desk_24h',
      'dry_cleaning', 'luggage_storage', 'housekeeping', 'air_conditioning', 'tv', 'safe',
      'coffee_maker', 'balcony', 'interior_corridors', 'accessible', 'elevator', 'non_smoking',
    ],
    blurb: 'the flagship of the Patriot Place block, attached to the shops and restaurants outside the stadium',
    quirk: 'It is the only property in the block the EventPipe coach picks up at the front door rather than the side lot, so a transfer booked here leaves from where you are already standing.',
  },
  'hilton-garden': {
    city: 'Foxborough, MA',
    address: '31 Hampshire St, Foxborough, MA 02035',
    stars: 3,
    reviews: 946,
    seed: 21,
    lat: 42.0658, lng: -71.2483,
    amenities: [
      'wifi', 'parking', 'breakfast', 'restaurant', 'bar', 'fitness', 'indoor_pool',
      'front_desk_24h', 'laundry', 'luggage_storage', 'air_conditioning', 'tv', 'safe',
      'in_room_fridge', 'microwave', 'coffee_maker', 'iron', 'interior_corridors',
      'family_rooms', 'connecting_rooms', 'accessible', 'elevator', 'non_smoking', 'pet_friendly',
    ],
    blurb: 'the value room in the block, a mile out and the only one where parking is included',
    quirk: 'Breakfast is complimentary and hot, which for a party arriving Friday night and leaving Saturday is a meal the other three charge for.',
  },
  'hyatt-place': {
    city: 'Foxborough, MA',
    address: '450 Fortune Blvd, Milford, MA 01757',
    stars: 3,
    reviews: 733,
    seed: 34,
    lat: 42.1512, lng: -71.5183,
    amenities: [
      'wifi', 'parking', 'breakfast', 'bar', 'coffee_shop', 'fitness', 'indoor_pool',
      'front_desk_24h', 'laundry', 'luggage_storage', 'air_conditioning', 'tv', 'safe',
      'in_room_fridge', 'microwave', 'coffee_maker', 'kitchenette', 'interior_corridors',
      'family_rooms', 'rollaway_beds', 'accessible', 'elevator', 'non_smoking', 'pet_friendly',
    ],
    blurb: 'the furthest out and the cheapest, with rooms built around two queens rather than one king',
    quirk: 'Every room is a two-queen with a pull-out sofa, so four adults sleep here for what two pay closer in — the trade is the drive.',
  },
}

/**
 * The room ladder, as deltas off the property's contracted nightly rate.
 *
 * Deltas rather than absolute prices: a $159 airport hotel and a $289 flagship
 * must not show the same room list, and the contracted rate is the only number
 * the library publishes for a property. Keeping every room relative to it means
 * the cheapest room on every page is still the rate the card advertised, so the
 * "From $289 nightly" on the list and the $289 room on the detail page are the
 * same fact rather than two that have to be kept in sync.
 *
 * `delta: 0` is the CONTRACTED BLOCK room — the one `CONTRACTED_HOTELS` names.
 * It leads the list because it is what the block was negotiated for, and because
 * a guest who never opens the page and never picks is charged exactly what every
 * earlier version of this prototype charged them.
 */
const ROOM_LADDER = [
  { id: 'block', name: null, bed: null, sleeps: null, delta: 0, availability: 'available', left: 6 },
  { id: 'accessible', name: 'Accessible King', bed: '1 King Bed · Roll-in shower', sleeps: 2, delta: 0, availability: 'available', left: 2 },
  { id: 'queens', name: 'Double Queen', bed: '2 Queen Beds', sleeps: 4, delta: 20, availability: 'available', left: 5 },
  { id: 'exec', name: 'Executive King', bed: '1 King Bed · Club lounge access', sleeps: 2, delta: 45, availability: 'available', left: 3 },
  { id: 'suite', name: 'One-Bedroom Suite', bed: '1 King Bed · Sofa bed · Living room', sleeps: 4, delta: 85, availability: 'limited', left: 2 },
]

// The bed the contracted room is sold with, per property — the library fixture
// names the room ("Deluxe King") but not what is in it, and the cart's stay note
// and the room card both say the bed out loud.
const BLOCK_BED = {
  courtyard: { bed: '1 King Bed', sleeps: 2 },
  westin: { bed: '1 King Bed · Balcony', sleeps: 2 },
  'hilton-garden': { bed: '1 Queen Bed · Sofa bed', sleeps: 3 },
  'hyatt-place': { bed: '2 Queen Beds · Sofa bed', sleeps: 4 },
}

export const HOTELS = CONTRACTED_HOTELS

export const hotelById = (id) => CONTRACTED_HOTELS.find((h) => h.id === id) || null

/**
 * The room types offered at one property.
 *
 * A ladder room whose name matches the property's own contracted room is dropped
 * rather than shown twice: Hyatt Place's block room IS a Double Queen, so that
 * property offers four rooms and the others five. Filtering by name (not by a
 * per-hotel exception list) means adding a fifth contracted property can't
 * reintroduce the duplicate.
 */
export function roomsFor(hotel) {
  if (!hotel) return []
  const block = BLOCK_BED[hotel.id] || { bed: '1 King Bed', sleeps: 2 }
  return ROOM_LADDER
    .map((r) => ({
      id: r.id,
      name: r.name || hotel.roomType,
      bed: r.bed || block.bed,
      sleeps: r.sleeps || block.sleeps,
      nightly: hotel.nightlyRate + r.delta,
      availability: r.availability,
      roomsLeft: r.left,
      contracted: r.delta === 0 && !r.name,
    }))
    .filter((r, i) => i === 0 || r.name !== hotel.roomType)
}

/** The room a property defaults to — the contracted block room. */
export const defaultRoom = (hotel) => roomsFor(hotel)[0] || null

export function roomFor(hotel, roomId) {
  if (!hotel) return null
  return roomsFor(hotel).find((r) => r.id === roomId) || defaultRoom(hotel)
}

const ratingLabel = (score) => (score >= 4.6 ? 'Exceptional' : score >= 4.3 ? 'Excellent' : score >= 4.0 ? 'Very Good' : 'Good')

export const distanceLabel = (hotel) =>
  `${hotel.distanceMi} mi from Gillette Stadium · ${walkMinutes(hotel.distanceMi)} min walk`

/** The search-result card model (library `HotelCardReserve`). */
export function cardPropsFor(hotel) {
  const d = DETAIL[hotel.id] || {}
  const rooms = roomsFor(hotel)
  return {
    name: hotel.name,
    city: d.city,
    stars: d.stars,
    distance: distanceLabel(hotel),
    // The Westin is the block's flagship and the only property the coach calls
    // at the front door — the one badge on the list is the one that changes what
    // else a guest can buy on the next screen.
    preferred: hotel.id === 'westin',
    refundable: true,
    lowRateGuarantee: true,
    seed: d.seed || 0,
    imageCategories: ['exterior', 'lobby', 'rooms'],
    fromNightly: Math.min(...rooms.map((r) => r.nightly)),
    total: Math.min(...rooms.map((r) => r.nightly)) * STAY.nights,
    availability: 'available',
    // The card's own availability panel, so a property's room ladder is
    // skimmable from the list without opening the page.
    rooms: rooms.map((r) => ({
      type: r.name,
      nightly: r.nightly,
      nights: STAY.nightDates.map((date) => ({ date, roomsLeft: r.roomsLeft })),
    })),
  }
}

function aboutFor(hotel) {
  const d = DETAIL[hotel.id] || {}
  return [
    `${hotel.name} is ${d.blurb}, and it sits inside the EventPipe contracted block for the game — the rate below is the block rate, not a public one.`,
    `It is ${hotel.distanceMi} miles from Gillette Stadium, about ${walkMinutes(hotel.distanceMi)} minutes on foot from the gates, and a few minutes by car from Route 1 and the Patriot Place lots.`,
    d.quirk,
    `Check-in is from ${STAY.checkInTime} and check-out is ${STAY.checkOutTime} the morning after the game — bag storage on gameday is complimentary for block guests, so a Sunday kickoff does not cost you a late check-out.`,
  ].filter(Boolean)
}

function policiesFor(hotel) {
  return [
    { title: 'Check-in', body: `Check-in from ${STAY.checkInTime}. Guests must be 18 or older with a valid photo ID and a credit card at check-in. Early check-in is subject to availability — the block fills on gameday weekends.` },
    { title: 'Check-out', body: `Check-out by ${STAY.checkOutTime}. Complimentary bag storage on gameday for block guests, so you can go straight to the lots after check-out.` },
    { title: 'Cancellation policy', body: 'Free cancellation until Dec 1, 2026. Cancellations after that are charged one night plus tax. No-shows are charged the full stay.' },
    { title: 'Deposit', body: 'A credit-card authorization of one night plus tax is held at check-in for incidentals and released at check-out.' },
    { title: 'Block rate', body: `The rate shown is the EventPipe contracted rate at ${hotel.name} and is held only for the night of the game. Extra nights are quoted at the property's public rate.` },
  ]
}

/**
 * Everything the library's `HotelDetailPage` renders for one property.
 *
 * `roomsFlow: 'reserve'` — the Book Reservations room card, the same one the
 * booking site's own hotel detail page uses. The group-block card is the other
 * option and is wrong here: nobody is holding a block, they are buying one room
 * on the way to a football game.
 */
export function detailPropsFor(hotel) {
  const d = DETAIL[hotel.id] || {}
  return {
    name: hotel.name,
    stars: d.stars,
    address: d.address,
    distance: distanceLabel(hotel),
    score: hotel.rating,
    reviews: d.reviews,
    ratingLabel: ratingLabel(hotel.rating),
    preferred: hotel.id === 'westin',
    lowRateGuarantee: true,
    checkInTime: STAY.checkInTime,
    checkOutTime: STAY.checkOutTime,
    popularAmenities: getAmenities((d.amenities || []).slice(0, 6)),
    amenityGroups: amenityGroups(d.amenities || []),
    lat: d.lat, lng: d.lng,
    galleryCategories: ['exterior', 'rooms', 'suites', 'lobby', 'dining', 'bar', 'pool', 'spa', 'bathroom'],
    seed: d.seed || 0,
    about: aboutFor(hotel),
    policies: policiesFor(hotel),
    rooms: roomsFor(hotel).map((r) => ({
      roomType: r.name,
      bedConfig: r.bed,
      maxOccupancy: r.sleeps,
      pricePerNight: r.nightly,
      total: r.nightly * STAY.nights,
      roomCount: 1,
      availability: r.availability,
      nights: STAY.nightDates.map((date) => ({ date, roomsLeft: r.roomsLeft })),
    })),
    roomsFlow: 'reserve',
    roomsTitle: 'Pick your room',
    roomsSubtitle: `Block rates per room, per night for ${STAY.range} — the night before kickoff.`,
  }
}
