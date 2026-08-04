<script setup>
// Landing — the real library LandingPage (Book Reservation · Teams Booking
// Widget) with its own Global Nav, minus the booking-type dropdown. Clicking the
// widget's "Search" starts the journey (handled by the App shell's click router).
// Full-bleed intro: no app stepper here.
//
// Every string that names the event is passed in from ../event.js so this screen
// matches the rest of the journey; the hero photo behind it is swapped at the
// asset level (see vite.config.js).
import LandingPage from '@lib/components/LandingPage.vue'
import { EVENT_NAME, EVENT_DATE_TIME, EVENT_VENUE } from '../event.js'

// Written as an invitation — one short paragraph, second person, no marketing
// preamble. EventPipe is the host; the reader is the guest.
const intro = [
  `You're invited. EventPipe is hosting its top customers at ${EVENT_VENUE} on Sunday, September 20 as the New England Patriots take on the Pittsburgh Steelers — a client-appreciation gameday for you, your team, and your guests. Choose your package and rooms below, and we'll handle the rest.`,
]

// "Who's Attending?" is dropped from this page — an empty list hides the section
// and its heading (see the LandingPage patch in vite.config.js).
const attending = []

const eventInfo = {
  dates: 'September 20, 2026 · 1:00 PM',
  lines: [`Venue: ${EVENT_VENUE}`, '1 Patriot Place', 'Foxborough, Massachusetts 02035'],
}

const closing = [
  'Your gameday hospitality and tickets are arranged through EventPipe and your host company, making it a premium, worry-free experience for clients, employees, and families alike.',
  `Book your accommodations early to secure the best available rates and stay close to ${EVENT_VENUE} throughout the weekend.`,
]
</script>

<template>
  <div class="xls">
    <landing-page
      brand="EventPipe" mode="reservations" :show-teams="true"
      :event-name="EVENT_NAME" :event-dates="EVENT_DATE_TIME"
      :intro="intro" :attending="attending" :event-info="eventInfo" :closing="closing"
    />
  </div>
</template>

<style scoped>
/* Drop the "Booking type" dropdown from the widget for this flow. */
.xls :deep(.bw__field--mode) { display: none !important; }
</style>
