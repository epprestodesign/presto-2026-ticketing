<script setup>
// Stays · Browse Hotels — the real library HotelListPage (Book Reservation
// layout, Core Booking Widget). A hotel card's name or "Choose Your Room" CTA
// links into the Hotel Details screen (routed by the App shell's click handler).
import HotelListPage from '@lib/components/browse/HotelListPage.vue'
</script>

<template>
  <div class="xhotels">
    <hotel-list-page flow="reserve" :show-teams="false" />
  </div>
</template>

<style scoped>
.xhotels { display: flex; flex-direction: column; flex: 1; }
/* Hotel name reads as a link to its Details page. */
.xhotels :deep(.hc__name) { cursor: pointer; }
.xhotels :deep(.hc__name:hover) { text-decoration: underline; }
</style>
