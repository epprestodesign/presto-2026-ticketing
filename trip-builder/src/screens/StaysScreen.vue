<script setup>
// Stays — the four contracted properties, on the library's own ContractedHotelCard.
//
// That card was built for the hotel ADD-ON step of the ticketing flow (scope
// H-04): image, distance, rating, room type, nightly rate + stay total, and an
// Add / Added toggle. Its assumption — that a hotel is something you attach to an
// order that already exists — is exactly the assumption this prototype inverts,
// and the card doesn't care: it emits `toggle` and lets its parent decide what
// adding means. Here it means "open the stay editor", whether the trip is empty
// or already holds four tickets.
//
// `selected` is read from the trip, not from local state, so the Added tick is
// the cart's own answer. Pressing Added doesn't remove the stay — it opens the
// editor, because on a card carrying a room type and a rate the toggle-off would
// be a hair away from every control that changes them. Removal is the cart's job.
import { computed } from 'vue'
import ContractedHotelCard from '@lib/components/ContractedHotelCard.vue'
import EventStrip from '../components/EventStrip.vue'
import { stayLine, openStayEditor, nav } from '../store.js'
import { STAYS } from '../trip.js'

// The stay total on each card is priced for the nights already chosen, so a guest
// who booked two nights and comes back to compare sees two-night totals.
const nights = computed(() => stayLine.value?.nights ?? 1)
const currentId = computed(() => stayLine.value?.hotelId ?? null)

function open(hotel) {
  openStayEditor(hotel.id, hotel.id === currentId.value ? stayLine.value : null)
}
</script>

<template>
  <div class="ss">
    <event-strip note="A room is one line in your trip. It doesn't require tickets, and tickets don't require it." />

    <div class="ss__inner">
      <header class="ss__head">
        <h2 class="ss__title">Where do you want to stay?</h2>
        <p class="ss__sub">
          Four contracted properties within two miles of the venue, priced for
          {{ nights }} night{{ nights === 1 ? '' : 's' }}. Pick one and set the room,
          the nights and how many rooms — all of it stays editable afterwards.
        </p>
        <p v-if="stayLine" class="ss__note">
          <q-icon name="info" size="17px" />
          Your trip already holds a room. Choosing another swaps it — your tickets and add-ons are untouched.
        </p>
      </header>

      <div class="ss__grid">
        <contracted-hotel-card
          v-for="h in STAYS" :key="h.id"
          :hotel="h" :nights="nights" :selected="h.id === currentId"
          @toggle="open"
        />
      </div>

      <p class="ss__foot">
        Rates are per room per night, before taxes.
        <button type="button" class="ss__link" @click="nav('tickets')">Tickets</button> and
        <button type="button" class="ss__link" @click="nav('addons')">add-ons</button>
        are bought separately, whenever you feel like it.
      </p>
    </div>
  </div>
</template>

<style scoped>
.ss { display: flex; flex-direction: column; flex: 1; }
.ss__inner { width: 100%; max-width: min(1180px, 92%); margin: 0 auto; padding: 26px 0 56px; }
.ss__head { margin-bottom: 20px; }
.ss__title { margin: 0; font-size: 1.5rem; font-weight: 800; color: var(--ds-color-text); }
.ss__sub { margin: 6px 0 0; max-width: 70ch; color: var(--ds-color-text-subtle); }
.ss__note { display: inline-flex; align-items: center; gap: 8px; margin: 12px 0 0; padding: 10px 14px; border-radius: var(--ds-radius-md, 8px); background: var(--ds-palette-amber-100, #fff5db); font-size: .9375rem; color: var(--ds-color-text); }

.ss__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; align-items: stretch; }

.ss__foot { margin: 26px 0 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.ss__link { appearance: none; padding: 0; border: 0; background: none; font: inherit; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }
</style>
