<script setup>
// The "View Map" field in the filter rail — the real library HotelMap, driven by
// the Orlando block instead of the library field's hardcoded Nashville sample.
// Composed here rather than using the library's ViewMapField because that
// component ships its own demo hotels AND labels the map pin "Gillette Stadium";
// on a Convention Center search either would be a visible lie.
//
// NO MODAL (Aug 25). This file used to own a `DsModal size="fullscreen"` holding
// a second, larger copy of the map, and "View Map" opened it. The dialog is gone:
// the button now just asks the page to switch to its map view (HotelMapPanel,
// rendered by HotelBrowseScreen where the results list normally is). The rail's
// job is to be a rail — it should not be the thing that puts a full-screen layer
// over the app, and a map big enough to use is a page, not a pop-up.
//
// The rejected alternative was expanding the map in place, here in the rail. The
// rail is 280px wide; a map that grows inside it is taller, not more usable, and
// the guest still can't see the hotels it is filtering.
//
// HotelMap handles the key states itself (renders the map when a build-time
// VITE_GOOGLE_MAPS_API_KEY is present, otherwise shows its own key form), so this
// file stays a composition. Zero library changes.
import { computed, toRef } from 'vue'
import HotelMap from '@lib/components/HotelMap.vue'
import { useMapHotels, eventLocation } from '../mapdata.js'

const props = defineProps({
  modelValue: { type: Number, default: 0 }, // search radius, shared with the slider
  hotels: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'expand'])

const radius = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const { mapHotels, imgReady } = useMapHotels(toRef(props, 'hotels'))
</script>

<template>
  <div class="fr__map-wrap">
    <hotel-map
      :key="imgReady"
      :hotels="mapHotels" :event-location="eventLocation" :zoom="12" height="200px"
      :zoom-control="false" :radius-min="0.25" :radius-step="0.25" v-model:search-radius="radius"
    />
    <button type="button" class="fr__map-btn" @click="emit('expand')">
      <q-icon name="map" size="18px" /> View Map
    </button>
  </div>
</template>

<style scoped>
.fr__map-wrap { border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,0,0,0.04); background: var(--ds-color-surface); box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 20px rgba(0,0,0,0.06); }
.fr__map-btn { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; height: 48px; padding: 0 18px; border: 0; border-top: 1px solid var(--ds-color-border); background: var(--ds-color-surface); color: var(--ds-color-text); font-weight: 700; font-size: 0.9375rem; cursor: pointer; }
.fr__map-btn:hover { background: var(--ds-palette-navy-50, #eef1f7); }
</style>
