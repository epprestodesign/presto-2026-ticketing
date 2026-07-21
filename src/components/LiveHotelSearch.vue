<script setup>
// LiveHotelSearch — Expedia "live mode" hotel discovery for the add-on step
// (scope H-05): a searchable, filterable list with live pricing. Unlike the
// curated contracted-block view, this is an open search surface — text search
// by name, quick filter chips, and a sort control — reusing ContractedHotelCard
// to render each result. A "Live rates via Expedia" badge distinguishes it from
// partner/contracted rates.
import { ref, computed } from 'vue'
import ContractedHotelCard from './ContractedHotelCard.vue'
import { CONTRACTED_HOTELS } from '../lib/bundles.js'

// Cycle the DS bundled hotel images across the extra live entries so everything
// stays self-contained (no external imagery).
const imgs = CONTRACTED_HOTELS.map((h) => h.image)
const pick = (i) => imgs[i % imgs.length]

// Expand the curated set with a few extra plausible "live" properties so the
// search/filter/sort surface has enough inventory to feel real (~8 total).
const EXTRA_HOTELS = [
  { id: 'aloft', name: 'Aloft Downtown', brand: 'Marriott', distanceMi: 0.6, rating: 4.1, roomType: 'Urban King', nightlyRate: 189, image: pick(1) },
  { id: 'kimpton', name: 'Kimpton Harbor', brand: 'IHG', distanceMi: 0.9, rating: 4.7, roomType: 'Deluxe Suite', nightlyRate: 264, image: pick(2) },
  { id: 'holiday-inn', name: 'Holiday Inn Express', brand: 'IHG', distanceMi: 1.6, rating: 4.0, roomType: 'Standard Queen', nightlyRate: 139, image: pick(3) },
  { id: 'four-points', name: 'Four Points Riverside', brand: 'Marriott', distanceMi: 2.4, rating: 4.2, roomType: 'Double Queen', nightlyRate: 149, image: pick(0) },
]

const DEFAULT_HOTELS = [...CONTRACTED_HOTELS, ...EXTRA_HOTELS]

// NOTE: defineProps defaults cannot reference locally-declared variables (Vue
// hoists the macro), so default to null and fall back via a computed below.
const props = defineProps({
  hotels: { type: Array, default: null },
  nights: { type: Number, default: 1 },
})
const emit = defineEmits(['select'])

const sourceHotels = computed(() => props.hotels ?? DEFAULT_HOTELS)

const query = ref('')
const sortBy = ref('price') // price | distance | rating
const filters = ref({ price: false, distance: false, rating: false })

const SORTS = [
  { id: 'price', label: 'Price' },
  { id: 'distance', label: 'Distance' },
  { id: 'rating', label: 'Rating' },
]

function toggleFilter(key) {
  filters.value[key] = !filters.value[key]
}

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = sourceHotels.value.filter((h) => {
    if (q && !(`${h.name} ${h.brand}`.toLowerCase().includes(q))) return false
    if (filters.value.price && h.nightlyRate >= 200) return false
    if (filters.value.distance && h.distanceMi > 1) return false
    if (filters.value.rating && h.rating < 4) return false
    return true
  })
  list = [...list].sort((a, b) => {
    if (sortBy.value === 'price') return a.nightlyRate - b.nightlyRate
    if (sortBy.value === 'distance') return a.distanceMi - b.distanceMi
    return b.rating - a.rating
  })
  return list
})
</script>

<template>
  <section class="lhs">
    <header class="lhs__head">
      <div class="lhs__titlerow">
        <h3 class="lhs__title">Search hotels</h3>
        <span class="lhs__live">
          <q-icon name="travel_explore" size="14px" />Live rates via Expedia
        </span>
      </div>

      <label class="lhs__search">
        <q-icon name="search" size="18px" class="lhs__searchicon" />
        <input
          v-model="query"
          type="text"
          class="lhs__input"
          placeholder="Search by hotel or brand"
          aria-label="Search hotels"
        />
      </label>

      <div class="lhs__controls">
        <div class="lhs__chips" role="group" aria-label="Filters">
          <button type="button" class="lhs__chip" :class="{ 'is-on': filters.price }" @click="toggleFilter('price')">
            <q-icon v-if="filters.price" name="check" size="14px" />Under $200
          </button>
          <button type="button" class="lhs__chip" :class="{ 'is-on': filters.distance }" @click="toggleFilter('distance')">
            <q-icon v-if="filters.distance" name="check" size="14px" />&le; 1 mi
          </button>
          <button type="button" class="lhs__chip" :class="{ 'is-on': filters.rating }" @click="toggleFilter('rating')">
            <q-icon v-if="filters.rating" name="check" size="14px" />4+ rating
          </button>
        </div>

        <label class="lhs__sort">
          <span class="lhs__sortlabel">Sort</span>
          <select v-model="sortBy" class="lhs__select" aria-label="Sort results">
            <option v-for="s in SORTS" :key="s.id" :value="s.id">{{ s.label }}</option>
          </select>
        </label>
      </div>

      <div class="lhs__count">{{ results.length }} {{ results.length === 1 ? 'stay' : 'stays' }} available</div>
    </header>

    <div v-if="results.length" class="lhs__list">
      <ContractedHotelCard
        v-for="h in results"
        :key="h.id"
        :hotel="h"
        :nights="nights"
        @toggle="emit('select', $event)"
      />
    </div>
    <p v-else class="lhs__empty">No hotels match your filters. Try clearing a filter.</p>
  </section>
</template>

<style scoped>
.lhs { font-family: var(--ds-font-family); display: flex; flex-direction: column; gap: var(--ds-space-4); }
.lhs__head { display: flex; flex-direction: column; gap: var(--ds-space-3); }
.lhs__titlerow { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); }
.lhs__title { margin: 0; font-size: var(--ds-font-size-lg); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.lhs__live {
  flex: none; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
  font-size: var(--ds-font-size-sm); color: var(--ds-color-text-info);
  background: var(--ds-color-background-info); border-radius: var(--ds-radius-pill); padding: 3px 10px;
}
.lhs__search {
  display: flex; align-items: center; gap: var(--ds-space-2);
  background: var(--ds-color-background-input); border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-md); padding: 8px 12px;
}
.lhs__search:focus-within { border-color: var(--ds-color-border-focused); }
.lhs__searchicon { color: var(--ds-color-icon-subtle); flex: none; }
.lhs__input {
  flex: 1; min-width: 0; border: none; background: none; outline: none; font: inherit;
  color: var(--ds-color-text);
}
.lhs__input::placeholder { color: var(--ds-color-text-subtlest); }
.lhs__controls { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); flex-wrap: wrap; }
.lhs__chips { display: flex; gap: var(--ds-space-2); flex-wrap: wrap; }
.lhs__chip {
  display: inline-flex; align-items: center; gap: 4px; cursor: pointer; font: inherit;
  font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-medium);
  color: var(--ds-color-text); background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-pill);
  padding: 5px 12px;
  transition: background var(--ds-duration-fast) var(--ds-ease-standard);
}
.lhs__chip.is-on {
  background: var(--ds-color-background-selected); border-color: var(--ds-color-border-brand);
  color: var(--ds-color-text-brand);
}
.lhs__sort { display: inline-flex; align-items: center; gap: var(--ds-space-2); flex: none; }
.lhs__sortlabel { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.lhs__select {
  font: inherit; font-size: var(--ds-font-size-sm); color: var(--ds-color-text);
  background: var(--ds-color-surface); border: 1px solid var(--ds-color-border-bold);
  border-radius: var(--ds-radius-button); padding: 5px 10px; cursor: pointer;
}
.lhs__count { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.lhs__list { display: flex; flex-direction: column; gap: var(--ds-space-3); }
.lhs__empty {
  margin: 0; padding: var(--ds-space-5); text-align: center;
  font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle);
  background: var(--ds-color-surface-sunken); border-radius: var(--ds-radius-lg);
}
</style>
