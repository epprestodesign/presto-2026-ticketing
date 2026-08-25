<script setup>
// Stage 0 — the event landing page. The real library LandingPage (its own Global
// Nav + hero + BookingWidget + event copy + footer), identical in structure to the
// sibling /prototype app's landing: this is the booking site as it ships, with
// only its copy re-pointed at the tournament.
//
// Every string below is a prop the library already exposes, which is the reason
// the re-frame needed no component work at all — a producer changing events
// changes content, not code. `showTeams` is on (unlike /prototype) because a cheer
// family arrives here having been sent by a GYM, and the Registered Team field is
// how that gym's block is found.
import LandingPage from '@lib/components/LandingPage.vue'
import { EVENT } from '../event.js'

const INTRO = [
  `Spirit Nationals returns to Orlando for three days of competition at the ${EVENT.venue}. More than 400 all-star, school and rec programs compete across eight mats, with preliminaries Friday and Saturday and finals and awards on Sunday.`,
  'EventPipe manages the official hotel block. Book your room here and you stay with your program, at contracted rates, close enough to the Convention Center to walk on finals day — and you can add tournament admission and Orlando attraction tickets to the same booking before you check out.',
]

const BENEFITS = [
  'Official tournament hotel block, walking distance to the Convention Center',
  'Contracted rates held for competing programs and their families',
  'Suites and connecting rooms for teams travelling together',
  'Tournament admission passes added to the same booking',
  'Optional Disney, Universal, SeaWorld and airport transfer add-ons',
  'One confirmation covering the room, the passes and the extras',
]

const ATTENDING = [
  { title: 'Competing Programs', text: 'Keep your athletes, coaches and chaperones in one property with connecting rooms, early breakfast and a bag-storage plan for finals day.' },
  { title: 'Cheer Families', text: 'Book the room, the weekend spectator passes and a park day in one pass through checkout, with the schedule already accounted for.' },
  { title: 'Travelling Spectators', text: 'Grandparents, siblings and friends flying in for finals can book a shorter stay and a single day pass without leaving the family’s hotel.' },
  { title: 'Judges & Staff', text: 'Event staff rooms are held in the same block, with late check-out on Sunday for teardown.' },
]

const EVENT_INFO = {
  dates: EVENT.datesLong,
  lines: [`Venue: ${EVENT.venue}`, ...EVENT.address],
}

const CLOSING = [
  'Competition schedules are published two weeks out. Book early — the properties inside a half mile of the Convention Center are the first to sell out on a national weekend.',
  'Add-on attraction tickets are date-flexible across your stay, so a park day can wait until after Sunday awards without a second booking.',
]
</script>

<template>
  <landing-page
    brand="Presto"
    mode="reservations"
    :event-name="EVENT.name"
    :event-dates="EVENT.dates"
    :intro="INTRO"
    :benefits="BENEFITS"
    :attending="ATTENDING"
    :event-info="EVENT_INFO"
    :closing="CLOSING"
    :show-teams="true"
  />
</template>
