// The contracted hotel block for Spirit Nationals — a curated Orlando dataset
// plus the pure filter/sort logic the Browse screen runs on.
//
// The sibling /prototype app generates 60 synthetic hotels to stress its filter
// rail. This flow is deliberately the opposite: a tournament block is a SHORT,
// hand-picked list of properties an event producer contracted near the venue, so
// the set is written out explicitly. Every property is a real I-Drive / Lake
// Buena Vista type — the neighbourhoods a family flying into MCO for a
// convention-centre tournament actually stays in — and its distance is measured
// from the Orange County Convention Center, not from a stadium.
//
// Deterministic throughout: no Math.random, no Date.now. Coordinates are derived
// from each hotel's distance so the map and the radius filter agree with the
// number printed on the card.
import { EVENT, DETAIL_NIGHTS } from './event.js'

// Coordinates are DERIVED rather than hand-typed: HotelMap's marker API throws on
// a non-numeric lat/lng and swallows the error as a misleading "API key needed"
// state, so every record must carry real numbers. Spreading by the golden angle
// keeps pins from stacking while honouring each hotel's stated distance.
const COS_LAT = Math.cos((EVENT.lat * Math.PI) / 180)
function coordsFor(i, distanceMi) {
  const ang = (i * 137.5 * Math.PI) / 180
  return {
    lat: EVENT.lat + (distanceMi / 69) * Math.cos(ang),
    lng: EVENT.lng + (distanceMi / (69 * COS_LAT)) * Math.sin(ang),
  }
}

// Amenity keys are drawn from the library's FILTER_AMENITY_KEYS so a selection in
// the Amenities filter can actually match a property.
const FAMILY = ['outdoor_pool', 'breakfast', 'parking', 'non_smoking', 'laundry', 'in_room_fridge']
const SUITE = ['kitchenette', 'microwave', 'connecting_rooms', 'rollaway_beds', 'laundry']
const RESORT = ['outdoor_pool', 'restaurant', 'bar', 'spa', 'kids_club', 'concierge', 'room_service', 'valet']
const BUSINESS = ['business_center', 'restaurant', 'front_desk_24h', 'express_checkin', 'dry_cleaning']

// name · parent brand · stars · guest rating · from-nightly · distance from OCCC
// · availability tier · amenity mix. `availability` uses the Book Reservation
// vocabulary the library card expects: available | unmatched | unavailable.
const BLOCK = [
  { name: 'Rosen Centre Convention Hotel', brand: 'Independent', stars: 4, rating: 4.5, reviews: 3120, fromNightly: 229, distanceMi: 0.1, availability: 'available', preferred: true, amenities: [...RESORT, ...BUSINESS], imageCategories: ['exterior', 'lobby', 'pool'] },
  { name: 'Hyatt Regency Convention Center', brand: 'Hyatt Hotels', stars: 4.5, rating: 4.6, reviews: 2480, fromNightly: 259, distanceMi: 0.2, availability: 'available', preferred: true, amenities: [...RESORT, ...BUSINESS], imageCategories: ['exterior', 'suites', 'pool'] },
  { name: 'Hilton Garden Inn International Drive', brand: 'Hilton Worldwide', stars: 3.5, rating: 4.3, reviews: 1640, fromNightly: 169, distanceMi: 0.4, availability: 'available', amenities: [...FAMILY, 'shuttle', 'restaurant'], imageCategories: ['lobby', 'rooms', 'dining'] },
  { name: 'Residence Inn Orlando Convention Center', brand: 'Marriott International', stars: 3.5, rating: 4.4, reviews: 1210, fromNightly: 189, distanceMi: 0.6, availability: 'available', amenities: [...FAMILY, ...SUITE], imageCategories: ['exterior', 'rooms', 'lobby'] },
  { name: 'Springhill Suites I-Drive', brand: 'Marriott International', stars: 3, rating: 4.2, reviews: 980, fromNightly: 159, distanceMi: 0.8, availability: 'available', amenities: [...FAMILY, ...SUITE, 'shuttle'], imageCategories: ['rooms', 'suites', 'pool'] },
  { name: 'Embassy Suites Lake Buena Vista', brand: 'Hilton Worldwide', stars: 4, rating: 4.4, reviews: 2260, fromNightly: 209, distanceMi: 1.2, availability: 'available', amenities: [...FAMILY, ...SUITE, 'shuttle', 'restaurant'], imageCategories: ['exterior', 'suites', 'dining'] },
  { name: 'Rosen Plaza Hotel', brand: 'Independent', stars: 4, rating: 4.3, reviews: 1890, fromNightly: 199, distanceMi: 0.5, availability: 'available', amenities: [...RESORT, 'business_center'], imageCategories: ['lobby', 'dining', 'pool'] },
  { name: 'Hampton Inn Orlando Convention Center', brand: 'Hilton Worldwide', stars: 3, rating: 4.1, reviews: 1420, fromNightly: 139, distanceMi: 1.0, availability: 'available', amenities: [...FAMILY, 'shuttle'], imageCategories: ['exterior', 'rooms', 'bathroom'] },
  { name: 'Holiday Inn Resort Orlando Suites', brand: 'IHG Hotels & Resorts', stars: 3.5, rating: 4.0, reviews: 3410, fromNightly: 149, distanceMi: 2.4, availability: 'available', amenities: [...FAMILY, ...SUITE, 'kids_club', 'restaurant'], imageCategories: ['pool', 'suites', 'dining'] },
  { name: 'Hyatt House Across from Universal', brand: 'Hyatt Hotels', stars: 3.5, rating: 4.3, reviews: 1550, fromNightly: 179, distanceMi: 3.1, availability: 'unmatched', amenities: [...SUITE, 'outdoor_pool', 'breakfast', 'shuttle'], imageCategories: ['exterior', 'rooms', 'pool'] },
  { name: 'Crowne Plaza Orlando Universal', brand: 'IHG Hotels & Resorts', stars: 3.5, rating: 3.9, reviews: 1120, fromNightly: 129, distanceMi: 3.6, availability: 'unmatched', amenities: [...BUSINESS, 'outdoor_pool', 'parking'], imageCategories: ['lobby', 'rooms', 'bar'] },
  { name: 'The Grand Lakeside Resort & Spa', brand: 'Independent', stars: 5, rating: 4.7, reviews: 4210, fromNightly: 389, distanceMi: 1.8, availability: 'unmatched', preferred: true, amenities: [...RESORT, 'golf', 'tennis', 'hot_tub'], imageCategories: ['exterior', 'spa', 'pool'] },
  { name: 'Courtyard Orlando I-Drive', brand: 'Marriott International', stars: 3, rating: 4.0, reviews: 860, fromNightly: 145, distanceMi: 1.4, availability: 'unavailable', amenities: [...FAMILY, 'business_center'], imageCategories: ['exterior', 'rooms', 'lobby'] },
  { name: 'Staybridge Suites Convention Center', brand: 'IHG Hotels & Resorts', stars: 3, rating: 4.2, reviews: 740, fromNightly: 165, distanceMi: 0.9, availability: 'unavailable', amenities: [...SUITE, 'breakfast', 'outdoor_pool'], imageCategories: ['suites', 'rooms', 'lobby'] },
]

// The room-type list the card's Availability panel expands into. Derived from the
// property's rate so a $389 resort never shows a $120 suite, and shaped per-night
// because a tournament weekend sells out unevenly (Saturday goes first).
function availRooms(i, fromNightly) {
  const types = ['King Bed - 1 King', 'Double Queen - 2 Queen', 'Two-Room Suite', 'Deluxe King']
  return types.slice(0, 3 + (i % 2)).map((type, r) => ({
    type,
    nightly: fromNightly + r * 30,
    nights: DETAIL_NIGHTS.map((date, n) => ({ date, roomsLeft: Math.max(0, (i + r * 3 + n * 2) % 11) })),
  }))
}

function buildHotels() {
  return BLOCK.map((h, i) => {
    const { lat, lng } = coordsFor(i, h.distanceMi)
    return {
      id: `h${i}`,
      city: 'Orlando',
      preferred: false,
      refundable: i % 3 !== 2,
      lowRateGuarantee: i % 2 === 0,
      ...h,
      lat,
      lng,
      seed: i,
      address: `${9200 + i * 60} International Drive, Orlando, FL 32819`,
      distance: `${h.distanceMi} mi from the Convention Center`,
      total: h.fromNightly * 3,
      rooms: availRooms(i, h.fromNightly),
    }
  })
}

export const HOTELS = buildHotels()
export const getHotel = (id) => HOTELS.find((h) => h.id === id) || null
export const getHotelByName = (name) => HOTELS.find((h) => h.name === name) || null

// ── Filtering ──
// The radius the dataset spans; anything at or above it is "no radius filter".
export const FULL_RADIUS = 5

export function filterHotels(hotels, filters = {}) {
  const f = filters
  return hotels.filter((h) => {
    if (f.exactOnly && h.availability !== 'available') return false
    if (f.priceMax != null && h.fromNightly > f.priceMax) return false
    if (f.minStars && h.stars < f.minStars) return false
    if (f.brands && f.brands.length && !f.brands.includes(h.brand)) return false
    if (f.amenities && f.amenities.length && !f.amenities.every((a) => h.amenities.includes(a))) return false
    if (f.propertySearch && f.propertySearch.trim() && !h.name.toLowerCase().includes(f.propertySearch.trim().toLowerCase())) return false
    if (f.distanceMax != null && f.distanceMax < FULL_RADIUS && h.distanceMi > f.distanceMax) return false
    if (f.roomTypes && f.roomTypes.length &&
        !f.roomTypes.some((rt) => h.rooms.some((r) => r.type.toLowerCase().includes(String(rt).toLowerCase())))) return false
    return true
  })
}

// Count of active (non-default) filters, for the "N filters applied" toolbar line.
export function countFilters(f = {}) {
  let n = 0
  if (f.exactOnly) n++
  if (f.propertySearch && f.propertySearch.trim()) n++
  if (f.brands && f.brands.length) n++
  if (f.amenities && f.amenities.length) n++
  if (f.priceMax != null) n++
  if (f.minStars) n++
  if (f.roomTypes && f.roomTypes.length) n++
  if (f.distanceMax != null && f.distanceMax < FULL_RADIUS) n++
  return n
}

// ── Sorting ──
export function sortHotels(hotels, sortKey = 'distance') {
  const arr = [...hotels]
  switch (sortKey) {
    case 'price_asc': return arr.sort((a, b) => a.fromNightly - b.fromNightly)
    case 'price_desc': return arr.sort((a, b) => b.fromNightly - a.fromNightly)
    case 'guest_rating': return arr.sort((a, b) => b.rating - a.rating)
    case 'distance':
    default: return arr.sort((a, b) => a.distanceMi - b.distanceMi)
  }
}
