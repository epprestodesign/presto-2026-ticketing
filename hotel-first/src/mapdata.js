// Shared map plumbing for the two surfaces that draw the Orlando block: the
// small preview in the filter rail (HotelMapField) and the full-width in-page
// map (HotelMapPanel).
//
// It lives in its own module because those two used to be ONE component — a
// preview plus a full-screen DsModal holding a second copy of the same map. When
// the modal became a page surface the two maps ended up in different files, and
// the imagery/marker mapping is the part that has to stay identical between them
// or the pins in the preview and the pins on the page would carry different
// photos for the same hotel.
//
// The alternative — the panel importing the field and reaching into it — would
// have made the rail's little preview the owner of the page's map. It isn't.
import { ref, computed, onMounted } from 'vue'
import { loadImagery } from '@lib/lib/imagery'
import { EVENT } from './event.js'

export const eventLocation = { lat: EVENT.lat, lng: EVENT.lng, label: EVENT.venueShort }

/**
 * Hotels → HotelMap markers, keyed on imagery-readiness.
 *
 * HotelMap builds its markers once on init, capturing each hotel by reference —
 * so if imagery hasn't loaded yet the tooltips get no photo and never gain one.
 * `imgReady` is meant to be bound to the map's `:key` so it re-inits exactly
 * once, with photos.
 */
export function useMapHotels(hotelsRef) {
  const imgLib = ref(null)
  onMounted(async () => { imgLib.value = await loadImagery() })
  const imgReady = computed(() => !!imgLib.value)

  function imageFor(h) {
    const lib = imgLib.value
    if (!lib) return undefined
    const cat = (h.imageCategories && h.imageCategories[0]) || 'exterior'
    const arr = lib[cat] || lib.exterior
    return arr && arr.length ? arr[h.seed % arr.length].url : undefined
  }

  // `url` is a sentinel href, not a route: App.vue's capture-phase click handler
  // matches `a[href^="#hotel-"]` anywhere in the document and opens that hotel's
  // Details page. HotelMap's tooltip renders the link itself, so this is the only
  // way to make a pin navigate without changing a library component.
  const mapHotels = computed(() => (hotelsRef.value || []).map((h) => ({
    id: h.id, name: h.name, location: h.city, lat: h.lat, lng: h.lng,
    price: h.fromNightly, rating: h.rating, reviews: h.reviews,
    image: imageFor(h), url: `#hotel-${h.id}`,
  })))

  return { mapHotels, imgReady }
}
