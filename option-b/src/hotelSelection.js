// The two hotels this version offers (Option B, step 2).
//
// The spec calls for a working example with TWO hotels rather than the full
// contracted list, each presented prominently. Both carry the same package
// inventory — choosing one decides where you stay, and that choice follows you
// into the packages page and the checkout.
import { CONTRACTED_HOTELS, walkMinutes } from '@lib/lib/bundles.js'
import { HOTEL_IMAGERY } from '@lib/lib/hotelImagery.js'
import { getAmenities } from '@lib/lib/amenities.js'
import { roomsFor } from './rooms.js'

// Closest to the stadium, and the full-service option — a useful contrast.
const SELECTED = ['courtyard', 'westin']

const AMENITY_KEYS = {
  courtyard: ['wifi', 'parking', 'fitness', 'breakfast'],
  westin: ['wifi', 'valet', 'pool', 'restaurant'],
}

const BLURB = {
  courtyard: 'Closest to the gate — walk to kickoff in under ten minutes.',
  westin: 'Full-service hotel with the largest rooms and on-site dining.',
}

// Three photos apiece for the card.
const photosFor = (index) =>
  ['Exterior', 'Rooms', 'Lobby']
    .map((category) => {
      const pool = HOTEL_IMAGERY.filter((i) => i.category === category)
      return pool.length ? pool[(index * 2 + 1) % pool.length] : null
    })
    .filter(Boolean)

/** The two hotels, in the richer shape the selection cards render. */
export const HOTELS = SELECTED.map((id, i) => {
  const h = CONTRACTED_HOTELS.find((x) => x.id === id)
  const rooms = roomsFor(h, 1)
  return {
    ...h,
    walkMin: walkMinutes(h.distanceMi),
    blurb: BLURB[id] || '',
    photos: photosFor(i),
    amenities: getAmenities(AMENITY_KEYS[id] || ['wifi', 'parking']),
    fromRate: rooms.length ? Math.min(...rooms.map((r) => r.nightly)) : h.nightlyRate,
    roomsLeft: rooms.reduce((s, r) => s + r.roomsLeft, 0),
  }
})

export const hotelById = (id) => HOTELS.find((h) => h.id === id) || HOTELS[0]

/**
 * The single room type a hotel offers on the details path. The spec asks for one
 * room type, so on that path the guest is choosing the hotel, not the room.
 */
export function theRoom(hotelId) {
  return roomsFor(hotelById(hotelId), 1)[0]
}
