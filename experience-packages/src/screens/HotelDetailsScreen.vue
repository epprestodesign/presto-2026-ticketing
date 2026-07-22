<script setup>
// Stays · Hotel Details — the real library HotelDetailPage (Book Reservation),
// seeded with the shared detail fixture and titled with the hotel the guest
// picked on Browse Hotels. A room's "Reserve Room" CTA continues to Tickets
// (routed by the App shell's click handler).
import { computed } from 'vue'
import HotelDetailPage from '@lib/components/details/HotelDetailPage.vue'
import { hotelBase, reserveRooms } from '@lib/stories/details/_detail-data.js'
import { journey, nav, setTab } from '../store.js'

const args = computed(() => ({
  ...hotelBase,
  name: journey.activeHotel || hotelBase.name,
  rooms: reserveRooms,
  roomsFlow: 'reserve',
  roomsSubtitle: 'Prices shown are per room per night for your selected dates.',
}))
</script>

<template>
  <div class="xhd">
    <hotel-detail-page v-bind="args" :initial-tab="journey.tab" @update:tab="setTab" @back="nav('hotels')" />
  </div>
</template>

<style scoped>
.xhd { display: flex; flex-direction: column; flex: 1; }
</style>
