<script setup>
// Stage 0 — the event landing page. Renders the real LandingPage (its own
// GlobalNav + hero + BookingWidget + event info + footer). The widget's "Search"
// button is intercepted globally (App.vue): it reads the widget's booking-type
// (Book Reservations vs Hold Rooms) and starts that flow. Event name/dates are
// conformed to the browse header ("Summer Soccer Classic 2027") for coherence.
import { EVENT } from '../fixtures.js'
import LandingPage from '@lib/components/LandingPage.vue'
</script>

<template>
  <landing-page
    mode="reservations"
    brand="Presto"
    :event-name="EVENT.name"
    :event-dates="EVENT.dates"
    :show-teams="false"
  />
</template>
