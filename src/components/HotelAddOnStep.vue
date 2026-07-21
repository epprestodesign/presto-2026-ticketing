<script setup>
// HotelAddOnStep — the native hotel add-on step after ticket selection (scope
// 3.3). Presents curated contracted-block properties (or a live/Expedia mode
// note), pre-fills event dates as check-in/out, and ALWAYS offers a clear skip
// to ticket-only checkout (H-02). Not a modal — a first-class step in the flow.
import { computed } from 'vue'
import ContractedHotelCard from './ContractedHotelCard.vue'

const props = defineProps({
  hotels: { type: Array, required: true },        // CONTRACTED_HOTELS
  eventName: { type: String, default: '' },
  checkIn: { type: String, default: null },        // ISO date; defaults from event
  checkOut: { type: String, default: null },
  nights: { type: Number, default: 1 },
  sourceMode: { type: String, default: 'contracted' }, // contracted | live
  selectedHotelId: { type: String, default: null },
})
const emit = defineEmits(['select', 'skip'])

function fmtDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
const dateRange = computed(() => {
  const a = fmtDate(props.checkIn), b = fmtDate(props.checkOut)
  return a && b ? `${a} → ${b}` : 'Event dates'
})
function toggle(hotel) {
  emit('select', props.selectedHotelId === hotel.id ? null : hotel)
}
</script>

<template>
  <section class="haddon">
    <header class="haddon__head">
      <div>
        <h3 class="haddon__title">Add a hotel to your trip?</h3>
        <p class="haddon__sub">
          Stay near the venue for <strong>{{ eventName }}</strong> · {{ dateRange }} · {{ nights }} night{{ nights === 1 ? '' : 's' }}
        </p>
      </div>
      <span class="haddon__mode">
        <q-icon :name="sourceMode === 'live' ? 'travel_explore' : 'verified'" size="14px" />
        {{ sourceMode === 'live' ? 'Live availability' : 'Partner rates' }}
      </span>
    </header>

    <div class="haddon__list">
      <ContractedHotelCard
        v-for="h in hotels"
        :key="h.id"
        :hotel="h"
        :nights="nights"
        :selected="h.id === selectedHotelId"
        @toggle="toggle"
      />
    </div>

    <button type="button" class="haddon__skip" @click="emit('skip')">
      Skip — continue with tickets only
    </button>
  </section>
</template>

<style scoped>
.haddon { font-family: var(--ds-font-family); display: flex; flex-direction: column; gap: var(--ds-space-4); }
.haddon__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--ds-space-4); }
.haddon__title { margin: 0; font-size: var(--ds-font-size-lg); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.haddon__sub { margin: 4px 0 0; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.haddon__mode {
  flex: none; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
  font-size: var(--ds-font-size-sm); color: var(--ds-color-text-info);
  background: var(--ds-color-background-info); border-radius: var(--ds-radius-pill); padding: 3px 10px;
}
.haddon__list { display: flex; flex-direction: column; gap: var(--ds-space-3); }
.haddon__skip {
  align-self: center; background: none; border: none; cursor: pointer; font: inherit;
  color: var(--ds-color-link); font-weight: var(--ds-font-weight-bold); padding: var(--ds-space-2);
  text-decoration: underline;
}
.haddon__skip:hover { color: var(--ds-color-text-brand); }
</style>
