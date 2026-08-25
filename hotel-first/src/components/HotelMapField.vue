<script setup>
// The "View Map" field in the filter rail — the real library HotelMap + DsModal,
// driven by the Orlando block instead of the library field's hardcoded Nashville
// sample. Composed here rather than using the library's ViewMapField because that
// component ships its own demo hotels AND labels the map pin "Gillette Stadium";
// on a Convention Center search either would be a visible lie.
//
// HotelMap handles the key states itself (renders the map when a build-time
// VITE_GOOGLE_MAPS_API_KEY is present, otherwise shows its own key form), so this
// file stays a composition. Zero library changes.
import { ref, computed, onMounted } from 'vue'
import HotelMap from '@lib/components/HotelMap.vue'
import DsModal from '@lib/components/DsModal.vue'
import { loadImagery } from '@lib/lib/imagery'
import { EVENT } from '../event.js'

const props = defineProps({
  modelValue: { type: Number, default: 0 }, // search radius, shared with the slider
  hotels: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const radius = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const dialogRadius = computed({ get: () => props.modelValue || 3, set: (v) => emit('update:modelValue', v) })
const open = ref(false)

// HotelMap builds its markers once on init, capturing each hotel by reference — so
// if imagery hasn't loaded yet the tooltips get no photo and never gain one. Key
// the maps on imagery-readiness so they re-init exactly once, with photos.
const imgLib = ref(null)
onMounted(async () => { imgLib.value = await loadImagery() })
const imgReady = computed(() => !!imgLib.value)
function imageFor (h) {
  const lib = imgLib.value
  if (!lib) return undefined
  const cat = (h.imageCategories && h.imageCategories[0]) || 'exterior'
  const arr = lib[cat] || lib.exterior
  return arr && arr.length ? arr[h.seed % arr.length].url : undefined
}

const mapHotels = computed(() => props.hotels.map((h) => ({
  id: h.id, name: h.name, location: h.city, lat: h.lat, lng: h.lng,
  price: h.fromNightly, rating: h.rating, reviews: h.reviews,
  image: imageFor(h), url: `#hotel-${h.id}`,
})))
const eventLocation = { lat: EVENT.lat, lng: EVENT.lng, label: EVENT.venueShort }
</script>

<template>
  <div class="fr__map-wrap">
    <hotel-map
      :key="imgReady"
      :hotels="mapHotels" :event-location="eventLocation" :zoom="12" height="200px"
      :zoom-control="false" :radius-min="0.25" :radius-step="0.25" v-model:search-radius="radius"
    />
    <button type="button" class="fr__map-btn" @click="open = true"><q-icon name="map" size="18px" /> View Map</button>
  </div>

  <ds-modal
    v-model="open" title="Hotels near the Convention Center"
    :subtitle="mapHotels.length + ' block hotels · searching within ' + dialogRadius + ' mi'"
    aria-label="Hotels map" size="fullscreen" flush
  >
    <hotel-map
      :key="imgReady"
      :hotels="mapHotels" :event-location="eventLocation" :zoom="12" height="100%"
      radius-unit="mi" :radius-min="0.25" :radius-step="0.25"
      :search-radius="dialogRadius" @update:search-radius="dialogRadius = $event" cluster
    />
    <div class="fr__map-radius">
      <div class="fr__map-radius-head"><span>Search radius</span><strong>{{ dialogRadius }} mi</strong></div>
      <q-slider v-model="dialogRadius" :min="0.25" :max="10" :step="0.25" :label-value="dialogRadius + ' mi'" label color="dark" track-color="grey-4" />
    </div>
  </ds-modal>
</template>

<style scoped>
.fr__map-wrap { border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,0,0,0.04); background: var(--ds-color-surface); box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 20px rgba(0,0,0,0.06); }
.fr__map-btn { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; height: 48px; padding: 0 18px; border: 0; border-top: 1px solid var(--ds-color-border); background: var(--ds-color-surface); color: var(--ds-color-text); font-weight: 700; font-size: 0.9375rem; cursor: pointer; }
.fr__map-btn:hover { background: var(--ds-palette-navy-50, #eef1f7); }
.fr__map-radius { position: absolute; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 5; width: min(440px, 86%); background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); box-shadow: 0 10px 30px rgba(0,0,0,.22); padding: 14px 22px 6px; }
.fr__map-radius-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
.fr__map-radius-head span { font-weight: 700; color: var(--ds-color-text); }
.fr__map-radius-head strong { color: var(--ds-color-text); font-variant-numeric: tabular-nums; }
</style>
