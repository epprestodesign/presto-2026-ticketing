// Room types offered inside a package's hotels (Aug 4 rework).
//
// The library's contracted hotels carry a single headline room ("Deluxe King").
// The package modal needs what an OTA room picker shows — bed configuration,
// square footage, who it sleeps, the view, per-room amenities, paid extras, and
// how many rooms are left per night — so this module derives a small, consistent
// room list for each hotel.
//
// Everything is deterministic (seeded off the hotel id), so a given hotel always
// offers the same rooms at the same prices in demos and screenshots.
import { HOTEL_IMAGERY } from '@lib/lib/hotelImagery.js'

function hash(str = '') {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295
}

// The four room shapes every property offers, priced as a delta on the hotel's
// nightly rate. `sleeps` is what drives the party-size warning in the modal.
const ROOM_TYPES = [
  { id: 'king', name: 'Standard King', bed: '1 King Bed', sqft: 325, sleeps: 2, view: 'City view', delta: 0 },
  { id: 'double-queen', name: 'Double Queen', bed: '2 Queen Beds', sqft: 385, sleeps: 4, view: 'City view', delta: 40 },
  { id: 'junior-suite', name: 'Junior Suite', bed: '1 King Bed + Sofa Bed', sqft: 520, sleeps: 3, view: 'Stadium view', delta: 120 },
  { id: 'accessible-king', name: 'Accessible King', bed: '1 King Bed', sqft: 330, sleeps: 2, view: 'City view', delta: 0, accessible: true },
]

// Paid add-ons, per room per stay — the "Room options / Extras" block.
export const ROOM_EXTRAS = [
  { id: 'none', label: 'No extras', price: 0 },
  { id: 'fnb', label: 'USD 100 food and beverage credit per room, per stay', price: 85 },
  { id: 'gameday', label: 'Gameday bundle — welcome bottle + valet parking + late checkout', price: 65 },
]

// Room amenities, grouped the way the modal renders them.
const BASE_AMENITIES = [
  { group: 'Bedroom', icon: 'bed', items: ['Air conditioning', 'Blackout drapes', 'Heating', 'Premium bedding', 'Iron/ironing board'] },
  { group: 'Bathroom', icon: 'bathtub', items: ['Private bathroom', 'Free toiletries', 'Hair dryer', 'Shower', 'Towels'] },
  { group: 'Entertainment', icon: 'live_tv', items: ['55-inch flat-screen TV', 'Streaming services', 'Cable channels'] },
  { group: 'Food and drink', icon: 'restaurant', items: ['Mini-fridge', 'Coffee/tea maker', 'Room service (24 hours)'] },
  { group: 'Internet', icon: 'wifi', items: ['Free WiFi'] },
  { group: 'More', icon: 'check', items: ['Daily housekeeping', 'Laptop workspace', 'Safe', 'Phone', 'Free local calls'] },
  { group: 'Safety', icon: 'verified_user', items: ['Carbon monoxide detector', 'Smoke detector', 'Fire extinguisher'] },
]
const ACCESSIBLE_AMENITIES = { group: 'Accessibility', icon: 'accessible', items: ['Roll-in shower', 'Closed captioned TV', 'Phone accessibility kit', 'Visual alarms'] }

// Two room photos apiece, offset so no two rooms open on the same shot.
const roomPhotos = (offset) => {
  const pool = HOTEL_IMAGERY.filter((i) => i.category === 'Rooms' || i.category === 'Suites')
  if (!pool.length) return []
  return [pool[offset % pool.length], pool[(offset + 3) % pool.length]]
}

/**
 * The rooms a hotel offers for this stay.
 * @param {object} hotelOption an entry from hotelOptionsFor()
 * @param {number} nights
 */
export function roomsFor(hotelOption, nights = 1) {
  if (!hotelOption) return []

  return ROOM_TYPES.map((t, i) => {
    const seed = hash(`${hotelOption.id}-${t.id}`)
    // 0–9 rooms left, weighted so most nights have stock and a few feel scarce.
    const base = Math.floor(seed * 10)
    return {
      id: `${hotelOption.id}-${t.id}`,
      typeId: t.id,
      name: t.name,
      bed: t.bed,
      sqft: t.sqft,
      sleeps: t.sleeps,
      view: t.view,
      accessible: !!t.accessible,
      hotelId: hotelOption.id,
      hotelName: hotelOption.name,
      // Nightly rate for this room at this hotel, and the delta against the
      // hotel's headline rate (which is what the package price is built on).
      nightly: hotelOption.nightlyRate + t.delta,
      deltaPerNight: t.delta,
      deltaTotal: t.delta * nights,
      roomsLeft: base,
      photos: roomPhotos(i * 2 + Math.floor(seed * 3)),
      amenities: t.accessible ? [ACCESSIBLE_AMENITIES, ...BASE_AMENITIES] : BASE_AMENITIES,
      rating: (8.4 + seed * 1.4).toFixed(1),
      reviews: 120 + Math.floor(seed * 380),
    }
  })
}

/** Total rooms left across a hotel's room types — drives the card's status line. */
export function roomsAvailable(rooms = []) {
  return rooms.reduce((sum, r) => sum + r.roomsLeft, 0)
}

/** The room a guest picked, falling back to the hotel's entry-level room. */
export function resolveRoomType(rooms = [], roomTypeId) {
  if (!rooms.length) return null
  return rooms.find((r) => r.typeId === roomTypeId) || rooms[0]
}
