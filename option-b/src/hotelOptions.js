// The hotels a package offers (Aug 4 rework).
//
// A package that includes a stay isn't tied to one property — the guest picks the
// room from the contracted hotels the package covers. This module turns the
// library's CONTRACTED_HOTELS into the richer shape the picker cards render:
// photos, amenities, walking distance, and the nightly difference against the
// hotel the package is priced around.
//
// All source data is the library's (hotels, imagery, amenity definitions); only
// the per-hotel curation below is local to this prototype.
import { CONTRACTED_HOTELS, walkMinutes } from '@lib/lib/bundles.js'
import { HOTEL_IMAGERY } from '@lib/lib/hotelImagery.js'
import { getAmenities } from '@lib/lib/amenities.js'

// Four photos per hotel, one from each category, offset per hotel so no two
// cards open on the same picture.
const PHOTO_CATEGORIES = ['Exterior', 'Rooms', 'Lobby', 'Pool']

const photosFor = (index) =>
  PHOTO_CATEGORIES.map((category) => {
    const pool = HOTEL_IMAGERY.filter((i) => i.category === category)
    return pool.length ? pool[index % pool.length] : null
  }).filter(Boolean)

// Per-property amenity picks (keys from @lib/lib/amenities.js), chosen to give
// each card a distinct profile rather than four identical chip rows.
const AMENITY_KEYS = {
  courtyard: ['wifi', 'parking', 'fitness', 'breakfast'],
  westin: ['wifi', 'valet', 'pool', 'restaurant'],
  'hilton-garden': ['wifi', 'parking', 'breakfast', 'pool'],
  'hyatt-place': ['wifi', 'parking', 'shuttle', 'fitness'],
}
const FALLBACK_AMENITY_KEYS = ['wifi', 'parking', 'breakfast']

// A short, human line about what the property is near — prototype copy.
const BLURBS = {
  courtyard: 'Closest to the gate — walk to kickoff in minutes.',
  westin: 'Full-service hotel with the largest rooms of the group.',
  'hilton-garden': 'Best value of the four, with breakfast included.',
  'hyatt-place': 'Quiet setting a short drive out, with free shuttle service.',
}

/**
 * The hotel options for a package that includes a stay.
 * @param {object} pkg a package from generateExperiencePackages / generatePackageGrid
 * @returns {Array} [] when the package has no hotel component
 */
export function hotelOptionsFor(pkg) {
  if (!pkg?.hotel) return []
  const nights = pkg.nights || 1
  // The package is priced around this hotel; everything else is a +/- upgrade.
  const baseRate = pkg.hotel.nightlyRate ?? 0

  const options = CONTRACTED_HOTELS.map((h, i) => {
    const deltaPerNight = (h.nightlyRate ?? 0) - baseRate
    return {
      id: h.id,
      name: h.name,
      brand: h.brand,
      rating: h.rating,
      roomType: h.roomType,
      nightlyRate: h.nightlyRate,
      distanceMi: h.distanceMi,
      walkMin: walkMinutes(h.distanceMi),
      blurb: BLURBS[h.id] || '',
      photos: photosFor(i),
      amenities: getAmenities(AMENITY_KEYS[h.id] || FALLBACK_AMENITY_KEYS),
      nights,
      deltaPerNight,
      deltaTotal: deltaPerNight * nights,
      // The room the package's price already covers.
      included: h.id === pkg.hotel.id,
    }
  })

  // The package's own hotel leads (it's the priced-in room), then the rest by
  // what they cost relative to it — savings first, upgrades last.
  return options.sort((a, b) => {
    if (a.included !== b.included) return a.included ? -1 : 1
    return a.deltaPerNight - b.deltaPerNight
  })
}

/** The option a guest has chosen, falling back to the package's included hotel. */
export function resolveRoom(pkg, roomHotelId) {
  const options = hotelOptionsFor(pkg)
  if (!options.length) return null
  return options.find((o) => o.id === roomHotelId) || options.find((o) => o.included) || options[0]
}
