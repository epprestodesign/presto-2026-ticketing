// The pure filter / sort logic behind the Browse Hotels rail.
//
// It lives in its own module rather than in trip.js because trip.js answers
// "what can go in the cart and what does it cost" and nothing in here can change
// either — filtering hides properties, it never re-prices one. Keeping the two
// apart is also what lets the stays screen be rewritten without the pricing
// tests moving underneath it.
//
// The alternative was the library's HotelListPage, which renders this whole page
// from one tag. It was rejected for the same reason the sibling hotel-first
// rejected it: its hotels, its event and its filter state are its own, and a
// page whose results can't be driven by THIS app's catalogue can't put a
// property into THIS app's trip.

// The radius the block spans. The library's SearchRadiusField runs 0–25, so
// anything at or above the block's own reach has to be read as "no filter" —
// otherwise the slider's whole upper half would be a filter that does nothing.
export const FULL_RADIUS = 5

export function filterStays(stays, f = {}) {
  return stays.filter((h) => {
    if (f.exactOnly && h.availability !== 'available') return false
    if (f.priceMax != null && h.fromNightly > f.priceMax) return false
    if (f.minStars && h.stars < f.minStars) return false
    if (f.brands && f.brands.length && !f.brands.includes(h.brand)) return false
    // Amenities are ANDed, not ORed: ticking "pool" and "shuttle" means a guest
    // wants both, and a list that widened as they narrowed would read as broken.
    if (f.amenities && f.amenities.length && !f.amenities.every((a) => h.amenities.includes(a))) return false
    if (f.propertySearch && f.propertySearch.trim() && !h.name.toLowerCase().includes(f.propertySearch.trim().toLowerCase())) return false
    if (f.distanceMax != null && f.distanceMax < FULL_RADIUS && h.distanceMi > f.distanceMax) return false
    if (f.roomTypes && f.roomTypes.length &&
        !f.roomTypes.some((rt) => h.rooms.some((r) => r.name.toLowerCase().includes(String(rt).toLowerCase())))) return false
    return true
  })
}

/** How many non-default filters are on — the toolbar's "(N filters applied)". */
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

export function sortStays(stays, key = 'distance') {
  const arr = [...stays]
  switch (key) {
    case 'price_asc': return arr.sort((a, b) => a.fromNightly - b.fromNightly)
    case 'price_desc': return arr.sort((a, b) => b.fromNightly - a.fromNightly)
    case 'guest_rating': return arr.sort((a, b) => b.rating - a.rating)
    case 'distance':
    default: return arr.sort((a, b) => a.distanceMi - b.distanceMi)
  }
}
