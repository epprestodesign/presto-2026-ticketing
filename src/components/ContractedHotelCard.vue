<script setup>
// ContractedHotelCard — one curated "contracted block" property in the hotel
// add-on step (scope H-04): image, name, distance-from-venue, rating, room type,
// nightly rate + stay total, and an Add / Selected toggle.
import { computed } from 'vue'
import { walkMinutes } from '../lib/bundles.js'

const props = defineProps({
  hotel: { type: Object, required: true },      // CONTRACTED_HOTELS item
  nights: { type: Number, default: 1 },
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle'])

const total = computed(() => props.hotel.nightlyRate * props.nights)
const walk = computed(() => walkMinutes(props.hotel.distanceMi))
function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) }
</script>

<template>
  <div class="chotel" :class="{ 'is-selected': selected }">
    <img :src="hotel.image" :alt="hotel.name" class="chotel__img" loading="lazy" />
    <div class="chotel__body">
      <div class="chotel__head">
        <div>
          <div class="chotel__name">{{ hotel.name }}</div>
          <div class="chotel__meta">
            <span class="chotel__dist"><q-icon name="place" size="13px" />{{ hotel.distanceMi }} mi · {{ walk }} min walk</span>
            <span class="chotel__rating"><q-icon name="star" size="13px" />{{ hotel.rating }}</span>
          </div>
        </div>
      </div>
      <div class="chotel__room">{{ hotel.roomType }}</div>
      <div class="chotel__foot">
        <div class="chotel__price">
          {{ fmt(hotel.nightlyRate) }}<span>/night · {{ fmt(total) }} total</span>
        </div>
        <button type="button" class="chotel__btn" :class="{ 'is-on': selected }" @click="emit('toggle', hotel)">
          <q-icon :name="selected ? 'check' : 'add'" size="16px" />{{ selected ? 'Added' : 'Add' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chotel {
  display: flex; gap: var(--ds-space-4); background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg);
  padding: var(--ds-space-3); font-family: var(--ds-font-family);
  transition: border-color var(--ds-duration-fast) var(--ds-ease-standard);
}
.chotel.is-selected { border-color: var(--ds-color-border-brand); box-shadow: 0 0 0 1px var(--ds-color-border-brand); }
.chotel__img { width: 132px; height: 108px; object-fit: cover; border-radius: var(--ds-radius-md); flex: none; background: var(--ds-color-surface-sunken); }
.chotel__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.chotel__name { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.chotel__meta { display: flex; gap: var(--ds-space-3); font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); margin-top: 2px; }
.chotel__dist, .chotel__rating { display: inline-flex; align-items: center; gap: 3px; }
.chotel__room { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.chotel__foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); }
.chotel__price { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.chotel__price span { font-weight: 400; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.chotel__btn {
  display: inline-flex; align-items: center; gap: 4px; cursor: pointer;
  border: 1px solid var(--ds-color-border-bold); background: var(--ds-color-surface);
  color: var(--ds-color-text); font: inherit; font-weight: var(--ds-font-weight-bold);
  padding: 7px 14px; border-radius: var(--ds-radius-button);
}
.chotel__btn.is-on { background: var(--ds-color-background-brand-bold); border-color: var(--ds-color-background-brand-bold); color: var(--ds-color-text-inverse); }
</style>
