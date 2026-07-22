<script setup>
// PackageFilterRail — the Browse Packages left filter rail: a "Hotels included
// only" toggle card, a Guests selector (moved here from the old tucked search
// bar), an Experience-type checklist, and a Price range with histogram — each
// filter section capped by an Apply button and a Clear All at the bottom, matching
// the Browse Hotels FilterRail. Driven by props (themes · bounds · priceHistogram)
// and four v-models (hotelOnly · guests · selThemes · price); the Apply buttons are
// visual (filtering stays live) and emit `apply` / `clear` for the page to react.
import { computed } from 'vue'
import PriceHistogram from './PriceHistogram.vue'

const props = defineProps({
  themes: { type: Array, default: () => [] },
  bounds: { type: Object, default: () => ({ min: 0, max: 100 }) },
  priceHistogram: { type: Array, default: () => [] },
  maxGuests: { type: Number, default: 8 },
  // v-models
  hotelOnly: { type: Boolean, default: false },
  guests: { type: Number, default: 2 },
  selThemes: { type: Array, default: () => [] },
  price: { type: Object, default: () => ({ min: 0, max: 0 }) },
})
const emit = defineEmits(['update:hotelOnly', 'update:guests', 'update:selThemes', 'update:price', 'apply', 'clear'])

const hotelOnlyM = computed({ get: () => props.hotelOnly, set: (v) => emit('update:hotelOnly', v) })
const guestsM = computed({ get: () => props.guests, set: (v) => emit('update:guests', v) })
const selThemesM = computed({ get: () => props.selThemes, set: (v) => emit('update:selThemes', v) })
const priceM = computed({ get: () => props.price, set: (v) => emit('update:price', v) })

const money = (n) => '$' + Math.round(n || 0).toLocaleString('en-US')

function clearAll() {
  emit('update:hotelOnly', false)
  emit('update:selThemes', [])
  emit('update:price', { min: props.bounds.min, max: props.bounds.max })
  emit('clear')
}
</script>

<template>
  <aside class="pfr">
    <!-- Hotels-included toggle — a self-contained card at the top -->
    <div class="pfr__hotelcard">
      <q-toggle v-model="hotelOnlyM" color="primary" size="sm" />
      <div class="pfr__hotelcard-text">
        <h3 class="pfr__hotelcard-title">Hotels included only</h3>
        <p class="pfr__hotelcard-sub">Only show packages with a hotel stay</p>
      </div>
    </div>

    <!-- Guests — the party size (was the tucked search bar's Guests field) -->
    <div class="pfr__block">
      <h3 class="pfr__h"><q-icon name="group" size="18px" /> Guests</h3>
      <div class="pfr__selectwrap">
        <select v-model.number="guestsM" class="pfr__select">
          <option v-for="n in maxGuests" :key="n" :value="n">{{ n === maxGuests ? n + '+' : n }} guest{{ n === 1 ? '' : 's' }}</option>
        </select>
        <q-icon name="expand_more" size="20px" class="pfr__selecticon" />
      </div>
    </div>

    <!-- Experience type -->
    <div class="pfr__block">
      <h3 class="pfr__h">Experience type</h3>
      <q-checkbox v-for="t in themes" :key="t" v-model="selThemesM" :val="t" :label="t" color="primary" dense class="pfr__check" />
      <button type="button" class="pfr__apply" @click="emit('apply')">Apply Experience Filters</button>
    </div>

    <!-- Price -->
    <div class="pfr__block">
      <h3 class="pfr__h">Price</h3>
      <PriceHistogram :bins="priceHistogram" :min="bounds.min" :max="bounds.max" :selected-min="priceM.min" :selected-max="priceM.max" />
      <q-range v-model="priceM" :min="bounds.min" :max="bounds.max" :step="10" color="primary" />
      <div class="pfr__pricevals"><span>{{ money(priceM.min) }}</span><span>{{ money(priceM.max) }}{{ priceM.max >= bounds.max ? '+' : '' }}</span></div>
      <button type="button" class="pfr__apply" @click="emit('apply')">Apply Price Filter</button>
    </div>

    <!-- Clear all -->
    <div class="pfr__block pfr__block--clear">
      <button type="button" class="pfr__apply" @click="clearAll"><q-icon name="close" size="18px" /> Clear All Filters</button>
    </div>
  </aside>
</template>

<style scoped>
.pfr { font-family: var(--ds-font-family); display: flex; flex-direction: column; gap: 20px; }

/* Hotels-included card — a self-contained bordered card (title is a toggle label,
   not a section header); toggle vertically centered with the text. */
.pfr__hotelcard { display: flex; align-items: center; justify-content: flex-start; gap: 12px; padding: 14px 16px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); background: var(--ds-color-surface); }
.pfr__hotelcard > .q-toggle { flex: 0 0 auto; }
.pfr__hotelcard-text { flex: 1; min-width: 0; }
.pfr__hotelcard-title { margin: 0; font-size: 1rem; font-weight: 600; line-height: 1.25; color: var(--ds-color-text-brand); }
.pfr__hotelcard-sub { margin: 3px 0 0; font-size: 0.875rem; color: var(--ds-color-text-subtle); line-height: 1.35; }

.pfr__block { border-bottom: 1px solid var(--ds-color-border); padding-bottom: 20px; }
.pfr__block--clear { border-bottom: 0; padding-bottom: 0; }
.pfr__h { display: flex; align-items: center; gap: 6px; margin: 0 0 10px; font-size: 1.125rem; font-weight: 700; color: var(--ds-color-text-brand); }
.pfr__h .q-icon { color: var(--ds-color-icon-subtle); }

/* Guests select — a full-width filter control. */
.pfr__selectwrap { position: relative; }
.pfr__select { width: 100%; appearance: none; height: 44px; padding: 0 40px 0 14px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-md); background: var(--ds-color-surface); font: inherit; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }
.pfr__select:hover { border-color: var(--ds-color-border-brand); }
.pfr__selecticon { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); color: var(--ds-color-text-subtle); pointer-events: none; }

/* Checkboxes — box + label in a row (flex), matching Browse Hotels. */
.pfr__check { display: flex; margin: 2px 0; }
.pfr__pricevals { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--ds-color-text-subtle); margin-top: 2px; }

/* Apply / Clear buttons — shared styling with Browse Hotels' .fr__apply. */
.pfr__apply { width: 100%; height: 44px; margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; border: 0; border-radius: var(--ds-radius-button); cursor: pointer; background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; font-size: 0.9375rem; }
.pfr__apply:hover { background: var(--ds-palette-navy-800, #0a1f4d); }
</style>
