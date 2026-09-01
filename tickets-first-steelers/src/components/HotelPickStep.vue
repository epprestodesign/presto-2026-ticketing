<script setup>
// Step 3a — pick the PROPERTY. The room is the next screen, not this one.
//
// This replaces the library's HotelAddOnStep, which this fork mounted until the
// Aug 25 round, and the reason is one button. HotelAddOnStep renders
// ContractedHotelCard, whose CTA is an Add / Added toggle: one click and the
// hotel is in the trip at whatever rate the fixture named. With room types that
// click has to OPEN A PAGE instead, and an "Add" that adds nothing is a worse
// answer than a different button.
//
// HotelCardReserve is the booking site's own search-result card and already ends
// in "Choose Your Room" — which is now literally what happens. It also carries
// what the contracted card never had and what a guest about to spend a night's
// money actually reads: a photo carousel, a star rating, an availability state,
// and an expandable per-night rooms-left panel listing the same room ladder the
// detail page will offer. Using it is also the round's hotel-consistency ask:
// this is the card the real EventPipe booking site shows.
//
// The two things HotelAddOnStep contributed that a card cannot — the event/dates
// header and the ALWAYS-VISIBLE skip (H-02, and the reason a ticket-only order
// is still one click away) — are the header and footer below.
import HotelCardReserve from '@lib/components/browse/HotelCardReserve.vue'
import { cardPropsFor, STAY } from '../hotels.js'

const props = defineProps({
  hotels: { type: Array, required: true },
  eventName: { type: String, default: '' },
  // The stay already in the trip, if the guest doubled back from the cart peek.
  chosen: { type: Object, default: null },   // { hotel, room }
})
const emit = defineEmits(['open', 'skip', 'remove'])

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
</script>

<template>
  <section class="hpick">
    <header class="hpick__head">
      <div>
        <h3 class="hpick__title">Where are you staying?</h3>
        <p class="hpick__sub">
          Contracted block for <strong>{{ eventName }}</strong> · {{ STAY.range }} ·
          {{ STAY.nights }} night{{ STAY.nights === 1 ? '' : 's' }}
        </p>
      </div>
      <span class="hpick__mode"><q-icon name="verified" size="14px" /> Partner rates</span>
    </header>

    <!-- Doubling back from the cart, the first question is "which one did I
         pick?" — the cards themselves have no selected state, so the answer is
         stated once, above them, with the room and the rate that are actually
         in the trip. -->
    <div v-if="chosen?.hotel" class="hpick__current">
      <q-icon name="hotel" size="20px" />
      <div class="hpick__currentinfo">
        <strong>{{ chosen.hotel.name }} · {{ chosen.room?.name || chosen.hotel.roomType }}</strong>
        <span>{{ fmt(chosen.room?.nightly ?? chosen.hotel.nightlyRate) }}/night · in your trip</span>
      </div>
      <button type="button" class="hpick__currentbtn" @click="emit('open', chosen.hotel)">Change room</button>
      <button type="button" class="hpick__currentbtn hpick__currentbtn--ghost" @click="emit('remove')">Remove</button>
    </div>

    <div class="hpick__list">
      <HotelCardReserve
        v-for="h in hotels" :key="h.id"
        v-bind="cardPropsFor(h)"
        :cta-label="chosen?.hotel?.id === h.id ? 'Change your room' : 'Choose your room'"
        @choose="emit('open', h)"
      />
    </div>

    <button type="button" class="hpick__skip" @click="emit('skip')">
      Skip — continue with tickets only
    </button>
  </section>
</template>

<style scoped>
.hpick { font-family: var(--ds-font-family); display: flex; flex-direction: column; gap: var(--ds-space-4); }
.hpick__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--ds-space-4); }
.hpick__title { margin: 0; font-size: var(--ds-font-size-lg); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.hpick__sub { margin: 4px 0 0; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.hpick__mode {
  flex: none; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
  font-size: var(--ds-font-size-sm); color: var(--ds-color-text-info);
  background: var(--ds-color-background-info); border-radius: var(--ds-radius-pill); padding: 3px 10px;
}

.hpick__current {
  display: flex; align-items: center; gap: var(--ds-space-3); flex-wrap: wrap;
  padding: var(--ds-space-3) var(--ds-space-4); border-radius: var(--ds-radius-lg);
  background: var(--ds-color-background-info); color: var(--ds-color-text-info);
}
.hpick__currentinfo { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.hpick__currentinfo span { font-size: var(--ds-font-size-sm); }
.hpick__currentbtn {
  background: var(--ds-color-surface); border: 1px solid var(--ds-color-border-bold); cursor: pointer;
  font: inherit; font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold);
  color: var(--ds-color-text); padding: 6px 12px; border-radius: var(--ds-radius-button);
}
.hpick__currentbtn--ghost { background: none; border-color: transparent; text-decoration: underline; }

.hpick__list { display: flex; flex-direction: column; gap: var(--ds-space-4); }
.hpick__skip {
  align-self: center; background: none; border: none; cursor: pointer; font: inherit;
  color: var(--ds-color-link); font-weight: var(--ds-font-weight-bold); padding: var(--ds-space-2);
  text-decoration: underline;
}
.hpick__skip:hover { color: var(--ds-color-text-brand); }
</style>
