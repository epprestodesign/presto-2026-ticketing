<script setup>
// The Browse Hotels filter rail — the library's own filter-rail fields, in the
// library's own order, with the state held here so that they actually filter.
//
// WHY NOT the library's FilterRail.vue, which is this list of fields already
// assembled: it owns no state and emits nothing, because on the booking site the
// page above it owns the query. Mounting it would give a rail that looks right
// and filters nothing. The fields are the reusable part; the wiring is the part
// each app has to bring.
//
// ONE LIBRARY FIELD IS DELIBERATELY LEFT OUT: ViewMapField. It is a full-screen
// DsModal, and this round removed every modal from this prototype — putting one
// back in the rail would reintroduce exactly the pattern the round rejected, in
// the one place a guest is most likely to press it. The radius slider below
// still does the spatial filtering the map was there to support.
//
// Filters commit on "Apply Filters" (or any per-field Apply), never on keystroke.
// A rail that re-sorts the results under the cursor as you type is the thing the
// real site deliberately doesn't do.
import { reactive } from 'vue'
import ExactMatchesField from '@lib/components/browse/filter-rail/ExactMatchesField.vue'
import PropertyNameField from '@lib/components/browse/filter-rail/PropertyNameField.vue'
import ParentBrandField from '@lib/components/browse/filter-rail/ParentBrandField.vue'
import AmenitiesField from '@lib/components/browse/filter-rail/AmenitiesField.vue'
import SearchRadiusField from '@lib/components/browse/filter-rail/SearchRadiusField.vue'
import BudgetField from '@lib/components/browse/filter-rail/BudgetField.vue'
import StarRatingField from '@lib/components/browse/filter-rail/StarRatingField.vue'
import RoomTypeField from '@lib/components/browse/filter-rail/RoomTypeField.vue'
import { filterAmenities } from '@lib/lib/amenities.js'
import { FULL_RADIUS } from '../browse.js'

const props = defineProps({
  // The stay length the results are priced for — a budget typed as a stay TOTAL
  // has to be divided by the same number of nights the cards are multiplying by.
  nights: { type: Number, default: 1 },
})
const emit = defineEmits(['update:filters'])

// The amenity field emits LABELS; the catalogue stores KEYS. Mapping back here
// rather than storing labels keeps the dataset speaking the library's vocabulary.
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
  const priceMax = !Number.isNaN(maxNum)
    ? (raw.budget.basis === 'total' ? maxNum / Math.max(1, props.nights) : maxNum)
    : null
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
// Every library field ships its own "Apply …" button and emits nothing when it
// is pressed. Matching on the button text is what lets those buttons work
// without a single library file gaining an event.
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
    <div class="fr__section fr__section--exact"><exact-matches-field v-model="raw.exactOnly" /></div>
    <div class="fr__section"><property-name-field v-model="raw.property" /></div>
    <div class="fr__section"><parent-brand-field v-model="raw.brands" /></div>
    <div class="fr__section"><amenities-field v-model="raw.amenities" /></div>
    <div class="fr__section"><search-radius-field v-model="raw.radius" /></div>
    <div class="fr__section"><budget-field v-model="raw.budget" /></div>
    <div class="fr__section"><star-rating-field v-model="raw.minStars" /></div>
    <div class="fr__section"><room-type-field v-model="raw.rooms" /></div>
    <div class="fr__section fr__section--clear">
      <button type="button" class="fr__apply" @click="apply"><q-icon name="tune" size="18px" /> Apply Filters</button>
      <button type="button" class="fr__clear" @click="clearAll"><q-icon name="close" size="18px" /> Clear All Filters</button>
    </div>
  </div>
</template>

<style scoped>
/* Mirrors FilterRail's own scoped styles, so the rail sits on the page exactly
   as it does on the booking site. */
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
