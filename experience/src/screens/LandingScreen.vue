<script setup>
// Landing — the real library LandingPage (Book Reservation · Teams Booking
// Widget) with its own Global Nav, minus the booking-type dropdown. Clicking the
// widget's "Search" starts the journey (handled by the App shell's click router).
// Full-bleed intro: no app stepper here.
import LandingPage from '@lib/components/LandingPage.vue'
</script>

<template>
  <div class="xls">
    <landing-page brand="EventPipe" mode="reservations" :show-teams="true" />
  </div>
</template>

<style scoped>
/* Drop the "Booking type" dropdown from the widget for this flow. */
.xls :deep(.bw__field--mode) { display: none !important; }
</style>
