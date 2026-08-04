<script setup>
// Hotel Details — the second path out of step 2 (Option B).
//
// Unlike v1, where this page is a read-only reference opened in a new tab, here
// it's IN the flow: the guest clicked the hotel's NAME on its card, sees the
// property, and books its single room type straight from the page. "Reserve
// Room" lands on the same checkout the packages path reaches.
//
// One room type only, per the spec — on this path you're choosing the hotel, not
// the room.
import { computed } from 'vue'
import HotelDetailPage from '@lib/components/details/HotelDetailPage.vue'
import { hotelBase, reserveRooms } from '@lib/stories/details/_detail-data.js'
import { hotelById, theRoom } from '../hotelSelection.js'
import { STAY_LABEL } from '../event.js'
import { journey, setTab, nav, bookRoomOnly } from '../store.js'

const hotel = computed(() => hotelById(journey.hotelId))
const room = computed(() => theRoom(journey.hotelId))

// The library page takes a rooms array; this path offers exactly one, priced
// from the same room data the packages path uses.
const rooms = computed(() => {
  const base = reserveRooms[0] || {}
  const r = room.value
  if (!r) return [base]
  return [{
    ...base,
    name: `${r.name} — ${r.bed}`,
    rate: r.nightly,
    nightly: r.nightly,
    sleeps: r.sleeps,
    roomsLeft: r.roomsLeft,
  }]
})

const args = computed(() => ({
  ...hotelBase,
  name: hotel.value?.name || hotelBase.name,
  rooms: rooms.value,
  roomsFlow: 'reserve',
  roomsSubtitle: `One room type is held for this event · ${STAY_LABEL}. Prices are per room per night.`,
}))
</script>

<template>
  <div class="xhd">
    <p class="xhd__bar">
      <button type="button" class="xhd__back" @click="nav('hotels')">
        <q-icon name="arrow_back" size="18px" /> Back to hotels
      </button>
      <span class="xhd__hint">
        Booking this room on its own — or
        <button type="button" class="xhd__link" @click="nav('packages')">see packages at this hotel</button>
      </span>
    </p>

    <hotel-detail-page v-bind="args" :initial-tab="journey.tab" @update:tab="setTab" @back="nav('hotels')" />

    <!-- A second, always-visible way to book, since the room CTA scrolls away.
         Both land on the same checkout. -->
    <div class="xhd__foot">
      <div class="xhd__summary">
        <strong>{{ hotel?.name }}</strong>
        <span v-if="room">{{ room.name }} · {{ room.bed }} · {{ journey.guests }} guest{{ journey.guests === 1 ? '' : 's' }}</span>
      </div>
      <q-btn unelevated no-caps color="primary" class="xhd__cta" label="Book this room" @click="bookRoomOnly" />
    </div>
  </div>
</template>

<style scoped>
.xhd { display: flex; flex-direction: column; flex: 1; }

.xhd__bar { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; max-width: min(1440px, 92%); margin: 14px auto 0; width: 100%; }
.xhd__back { display: inline-flex; align-items: center; gap: 6px; background: none; border: 0; padding: 0; font: inherit; font-weight: 700; color: var(--ds-color-link, #1b4ed8); cursor: pointer; }
.xhd__hint { color: var(--ds-color-text-subtle); }
.xhd__link { background: none; border: 0; padding: 0; font: inherit; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }

.xhd__foot { position: sticky; bottom: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; padding: 14px 24px; border-top: 1px solid var(--ds-color-border); background: var(--ds-color-surface, #fff); box-shadow: 0 -4px 16px rgba(0,0,0,.06); }
.xhd__summary { display: flex; flex-direction: column; }
.xhd__summary span { color: var(--ds-color-text-subtle); font-size: .9375rem; }
.xhd__cta { min-width: 200px; height: 48px; font-weight: 700; }
</style>
