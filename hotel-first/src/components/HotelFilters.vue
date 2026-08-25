<script setup>
// The Browse filter rail — the library FilterRail's exact fields, in the library's
// exact order and markup, but with the state held here so the filters actually
// filter. This mirrors the sibling /prototype app's rail one-for-one: the hotel
// side of this flow has to feel like the booking site, and the booking site's
// left rail is this list of fields.
//
// Filters commit on "Apply Filters" (or any per-field Apply), never on keystroke —
// a rail that re-sorts the results under the cursor as you type is the thing the
// real site deliberately doesn't do. Zero library changes.
import { reactive } from 'vue'
import HotelMapField from './HotelMapField.vue'
import ExactMatchesField from '@lib/components/browse/filter-rail/ExactMatchesField.vue'
import PropertyNameField from '@lib/components/browse/filter-rail/PropertyNameField.vue'
import ParentBrandField from '@lib/components/browse/filter-rail/ParentBrandField.vue'
import AmenitiesField from '@lib/components/browse/filter-rail/AmenitiesField.vue'
import SearchRadiusField from '@lib/components/browse/filter-rail/SearchRadiusField.vue'
import BudgetField from '@lib/components/browse/filter-rail/BudgetField.vue'
import StarRatingField from '@lib/components/browse/filter-rail/StarRatingField.vue'
import RoomTypeField from '@lib/components/browse/filter-rail/RoomTypeField.vue'
import { filterAmenities } from '@lib/lib/amenities.js'
import { FULL_RADIUS } from '../hotels.js'

defineProps({ hotels: { type: Array, default: () => [] } })
const emit = defineEmits(['update:filters'])

// The amenity fields emit LABELS; map them back to the keys the dataset stores.
const LABEL_TO_KEY = Object.fromEntries(filterAmenities().map((a) => [a.label, a.key]))

const raw = reactive({
  exactOnly: false,
  property: '',
  brands: [],
  amenities: [],
  radius: FULL_RADIUS,
  budget: { basis: 'night', max: '' },
  minStars: 0,
  rooms: [],
})

function normalized() {
  const maxNum = parseFloat(raw.budget?.max)
  // A budget entered as a stay TOTAL is divided back to a nightly rate, because
  // that is the number every hotel record and every card is priced in.
  const priceMax = !Number.isNaN(maxNum) ? (raw.budget.basis === 'total' ? maxNum / 3 : maxNum) : null
  return {
    exactOnly: raw.exactOnly,
    propertySearch: raw.property,
    brands: raw.brands,
    amenities: (raw.amenities || []).map((l) => LABEL_TO_KEY[l]).filter(Boolean),
    distanceMax: raw.radius,
    priceMax,
    minStars: raw.minStars,
    roomTypes: raw.rooms,
  }
}

function apply() { emit('update:filters', normalized()) }
// Any "Apply…" button in the rail (the library fields ship their own) commits the
// current selection — matched by text so no library field needs an event added.
function onRailClick(e) {
  const b = e.target.closest('button')
  if (b && /apply/i.test(b.textContent || '') && !/clear/i.test(b.textContent || '')) apply()
}
function clearAll() {
  raw.exactOnly = false
  raw.property = ''
  raw.brands = []
  raw.amenities = []
  raw.radius = FULL_RADIUS
  raw.budget = { basis: 'night', max: '' }
  raw.minStars = 0
  raw.rooms = []
  emit('update:filters', normalized())
}
defineExpose({ clearAll })
</script>

<template>
  <div class="fr" @click="onRailClick">
    <!-- VIEW MAP (the Orlando block) -->
    <div class="fr__section"><hotel-map-field v-model="raw.radius" :hotels="hotels" /></div>
    <!-- EXACT MATCHES ONLY -->
    <div class="fr__section fr__section--exact"><exact-matches-field v-model="raw.exactOnly" /></div>
    <!-- SEARCH BY PROPERTY NAME -->
    <div class="fr__section"><property-name-field v-model="raw.property" /></div>
    <!-- PARENT BRAND -->
    <div class="fr__section"><parent-brand-field v-model="raw.brands" /></div>
    <!-- AMENITIES -->
    <div class="fr__section"><amenities-field v-model="raw.amenities" /></div>
    <!-- SEARCH RADIUS -->
    <div class="fr__section"><search-radius-field v-model="raw.radius" /></div>
    <!-- YOUR BUDGET -->
    <div class="fr__section"><budget-field v-model="raw.budget" /></div>
    <!-- MINIMUM STAR RATING -->
    <div class="fr__section"><star-rating-field v-model="raw.minStars" /></div>
    <!-- ROOM TYPE -->
    <div class="fr__section"><room-type-field v-model="raw.rooms" /></div>
    <!-- APPLY / CLEAR -->
    <div class="fr__section fr__section--clear">
      <button type="button" class="fr__apply" @click="apply"><q-icon name="tune" size="18px" /> Apply Filters</button>
      <button type="button" class="fr__clear" @click="clearAll"><q-icon name="close" size="18px" /> Clear All Filters</button>
    </div>
  </div>
</template>

<style scoped>
/* Mirrors FilterRail's scoped styles exactly. */
.fr { background: transparent; }
.fr__section { padding: 16px 0; border-top: 1px solid var(--ds-color-border); }
.fr__section:first-child { border-top: 0; padding-top: 0; }
.fr__section--exact { border-top: 0; }
.fr__section--clear { border-top: 1px solid var(--ds-color-border); padding-top: 16px; display: flex; flex-direction: column; gap: 10px; }

.fr__apply {
  width: 100%; height: 44px; display: flex; align-items: center; justify-content: center; gap: 6px;
  border: 0; border-radius: var(--ds-radius-button); cursor: pointer;
  background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; font-size: 0.9375rem;
}
.fr__apply:hover { background: var(--ds-palette-navy-800, #0a1f4d); }
.fr__clear {
  width: 100%; height: 44px; display: flex; align-items: center; justify-content: center; gap: 6px;
  border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button); cursor: pointer;
  background: var(--ds-color-surface); color: var(--ds-color-text); font-weight: 700; font-size: 0.9375rem;
}
.fr__clear:hover { background: var(--ds-palette-slate-100); }
</style>
