<script setup>
// HotelSummaryHeader — the top block of the hotel detail screen: name + star
// class, address/distance, guest score (DsRating), popular amenities, and a
// mini-map (HotelMap) pinned to the property. Composes existing DS components.
import { computed } from 'vue'
import DsRating from '../DsRating.vue'
import HotelMap from '../HotelMap.vue'
import Amenity from '../Amenity.vue'

const props = defineProps({
  name: { type: String, default: 'Hotel Name' },
  stars: { type: Number, default: 0 },            // star class (0 hides)
  address: { type: String, default: '' },
  distance: { type: String, default: '' },        // e.g. "2.4 mi from venue"
  score: { type: Number, default: null },          // guest score (null hides)
  scoreMax: { type: Number, default: 5 },
  reviews: { type: Number, default: null },
  ratingLabel: { type: String, default: '' },      // e.g. "Excellent"
  amenities: { type: Array, default: () => [] },    // [{ icon, label }]
  // Mini-map
  lat: { type: Number, default: 28.5383 },
  lng: { type: Number, default: -81.3792 },
  showMap: { type: Boolean, default: true },
  mapHeight: { type: String, default: '220px' },
})

const starList = computed(() => Array.from({ length: 5 }, (_, i) => i < props.stars))
const mapHotels = computed(() => [{ id: 0, name: props.name, location: props.address, lat: props.lat, lng: props.lng, price: null }])
const metaLine = computed(() => [props.address, props.distance].filter(Boolean).join(' · '))
</script>

<template>
  <header class="dhead">
    <div class="dhead__info">
      <div class="dhead__name">
        <span>{{ name }}</span>
        <span v-if="stars" class="dhead__stars" :title="`${stars}-star hotel`">
          <q-icon v-for="(on, i) in starList" :key="i" :name="on ? 'star' : 'star_border'" size="20px" />
        </span>
      </div>

      <div v-if="metaLine" class="dhead__addr">{{ metaLine }}</div>

      <div v-if="score != null" class="dhead__rating">
        <ds-rating :score="score" :max="scoreMax" :reviews="reviews" :label="ratingLabel" />
      </div>

      <template v-if="amenities.length">
        <div class="dhead__poplabel">Popular Amenities</div>
        <div class="dhead__pop">
          <amenity v-for="a in amenities" :key="a.key || a.label" :amenity="a" size="md" />
        </div>
      </template>
    </div>

    <div v-if="showMap" class="dhead__map">
      <hotel-map :hotels="mapHotels" :center="{ lat, lng }" :zoom="14" :height="mapHeight" />
    </div>
  </header>
</template>

<style scoped>
.dhead { display: flex; justify-content: space-between; gap: 32px; align-items: flex-start; }
.dhead__info { flex: 1; min-width: 0; }
.dhead__name { font-size: 1.75rem; font-weight: 700; line-height: 1.2; color: var(--ds-color-text); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.dhead__stars { display: inline-flex; color: var(--ds-palette-zinc-900); }
.dhead__addr { color: var(--ds-color-text-subtle); margin-top: 6px; }
.dhead__rating { margin-top: 14px; }
.dhead__poplabel { font-weight: 600; color: var(--ds-color-text); margin-top: 20px; }
.dhead__pop { display: flex; flex-wrap: wrap; gap: 14px 28px; margin-top: 14px; }
.dhead__map { flex: 0 0 300px; border-radius: var(--ds-radius-md); overflow: hidden; border: 1px solid var(--ds-color-border); }

@media (max-width: 860px) {
  .dhead { flex-direction: column; }
  .dhead__map { flex: 1 1 auto; width: 100%; }
}
</style>
