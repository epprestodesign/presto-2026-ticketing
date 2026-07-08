<script setup>
// ViewMapField — the embedded HotelMap preview (Nashville sample data) with a
// full-width "View Map" button that opens the full-screen map dialog (DsModal).
// `v-model` is the search radius, two-way synced across the preview circle, the
// dialog map, and the dialog's floating radius slider.
import { ref, computed } from 'vue'
import HotelMap from '../../HotelMap.vue'
import DsModal from '../../DsModal.vue'

const props = defineProps({ modelValue: { type: Number, default: 0 } })
const emit = defineEmits(['update:modelValue', 'view-map'])

const radius = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// The dialog's radius stays usable even when the rail's value is 0 (Any).
const dialogRadius = computed({
  get: () => props.modelValue || 5,
  set: (v) => emit('update:modelValue', v),
})

const open = ref(false)
function viewMap () {
  open.value = true
  emit('view-map')
}

// Sample map data (Nashville-area) for the View Map preview + dialog.
const mapHotels = [
  { id: '1', name: 'Hilton Nashville Downtown', location: 'Nashville, TN', lat: 36.1567, lng: -86.779, price: 250, rating: 4.5, reviews: 120 },
  { id: '2', name: 'Omni Nashville Hotel', location: 'Nashville, TN', lat: 36.1583, lng: -86.7758, price: 289, rating: 4.6, reviews: 980 },
  { id: '3', name: 'The Hermitage Hotel', location: 'Nashville, TN', lat: 36.1652, lng: -86.7836, price: 415, rating: 4.8, reviews: 540 },
  { id: '4', name: 'JW Marriott Nashville', location: 'Nashville, TN', lat: 36.1554, lng: -86.7812, price: 332, rating: 4.7, reviews: 760 },
  { id: '5', name: 'Union Station Hotel', location: 'Nashville, TN', lat: 36.1547, lng: -86.7861, price: 268, rating: 4.4, reviews: 610 },
  { id: '6', name: 'Bobby Hotel', location: 'Nashville, TN', lat: 36.1638, lng: -86.7795, price: 305, rating: 4.5, reviews: 430 },
]
const eventLocation = { lat: 36.1592, lng: -86.7785, label: 'Tournament venue' }
</script>

<template>
  <div class="fr__map-wrap">
    <hotel-map
      :hotels="mapHotels"
      :event-location="eventLocation"
      :zoom="12"
      height="200px"
      :zoom-control="false"
      :radius-min="0.25"
      :radius-step="0.25"
      v-model:search-radius="radius"
    />
    <button type="button" class="fr__map-btn" @click="viewMap">
      <q-icon name="map" size="18px" /> View Map
    </button>
  </div>

  <!-- Full-screen map dialog — DsModal owns backdrop / header / close / ESC. -->
  <ds-modal
    v-model="open"
    title="Hotels near the venue"
    :subtitle="mapHotels.length + ' hotels · searching within ' + dialogRadius + ' mi'"
    aria-label="Hotels map"
    size="fullscreen"
    flush
  >
    <hotel-map
      :hotels="mapHotels"
      :event-location="eventLocation"
      :zoom="12"
      height="100%"
      radius-unit="mi"
      :radius-min="0.25"
      :radius-step="0.25"
      :search-radius="dialogRadius"
      @update:search-radius="dialogRadius = $event"
      cluster
    />
    <!-- Floating, shadowed search-radius control at the bottom center. -->
    <div class="fr__map-radius">
      <div class="fr__map-radius-head">
        <span>Search radius</span>
        <strong>{{ dialogRadius }} mi</strong>
      </div>
      <q-slider v-model="dialogRadius" :min="0.25" :max="25" :step="0.25" :label-value="dialogRadius + ' mi'" label color="dark" track-color="grey-4" />
    </div>
  </ds-modal>
</template>

<style scoped>
/* View Map — HotelMap preview with a full-width footer button */
.fr__map-wrap {
  border-radius: 12px; overflow: hidden;
  border: 1px solid rgba(0,0,0,0.04); background: var(--ds-color-surface);
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 20px rgba(0,0,0,0.06);
}
.fr__map-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; height: 48px; padding: 0 18px;
  border: 0; border-top: 1px solid var(--ds-color-border);
  background: var(--ds-color-surface);
  color: var(--ds-color-text); font-weight: 700; font-size: 0.9375rem; cursor: pointer;
}
.fr__map-btn:hover { background: var(--ds-palette-navy-50, #eef1f7); }

/* Floating radius control inside the dialog */
.fr__map-radius {
  position: absolute; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 5;
  width: min(440px, 86%); background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg);
  box-shadow: 0 10px 30px rgba(0,0,0,.22); padding: 14px 22px 6px;
}
.fr__map-radius-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
.fr__map-radius-head span { font-weight: 700; color: var(--ds-color-text); }
.fr__map-radius-head strong { color: var(--ds-color-text); font-variant-numeric: tabular-nums; }
</style>
