<script setup>
// The extras step — the fourth stop in the tickets-first journey, and the one
// the fork was built to add.
//
// It is written as the twin of the library's HotelAddOnStep: same header shape,
// same source-mode pill, same always-visible skip. That is deliberate. The two
// steps ask structurally identical questions ("want to add this to the trip?"),
// and a guest who has just learned how the hotel step behaves should not have
// to learn a second pattern one screen later.
//
// Where it departs from that twin:
//
//   • MULTI-SELECT, not single-select. A hotel is one choice; extras are four
//     independent yes/no answers, so nothing deselects when something else is
//     picked and the running total below has to exist — with the hotel step you
//     can see your one selection, here you can't hold four prices in your head.
//
//   • IT KNOWS WHAT'S ALREADY IN THE TRIP. The transfer needs a hotel to leave
//     from, so it renders explained-and-disabled rather than absent when the
//     hotel step was skipped. Hiding it would leave a guest who skipped the
//     hotel wondering why a friend's screen had four cards and theirs had
//     three; saying why is the whole reason extras come after the hotel.
import { computed } from 'vue'
import AddOnCard from './AddOnCard.vue'
import { ADD_ONS, isOfferable, unitsFor } from '../addons.js'

const props = defineProps({
  selected: { type: Array, default: () => [] },   // chosen add-on ids
  guests: { type: Number, default: 2 },            // the ticket count
  vehicles: { type: Number, default: 1 },
  hotel: { type: Object, default: null },
  eventName: { type: String, default: '' },
})
const emit = defineEmits(['toggle', 'update:vehicles', 'skip'])

const chosen = computed(() =>
  ADD_ONS.filter((a) => props.selected.includes(a.id) && isOfferable(a, { hotel: props.hotel }))
)
const extrasTotal = computed(() =>
  chosen.value.reduce((sum, a) => sum + a.price * unitsFor(a, { guests: props.guests, vehicles: props.vehicles }), 0)
)

// The transfer's card explains itself rather than disappearing — see above.
function unavailableReason(addOn) {
  return addOn.requiresHotel && !props.hotel
    ? 'Needs a hotel — the coach leaves from your lobby'
    : null
}

function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) }
</script>

<template>
  <section class="xstep">
    <header class="xstep__head">
      <div>
        <h3 class="xstep__title">Anything else for gameday?</h3>
        <p class="xstep__sub">
          Optional extras for <strong>{{ eventName }}</strong> · Sun, Dec 6 · 4:25 PM kickoff.
          <template v-if="hotel">Everything below meets you at {{ hotel.name }} or the stadium.</template>
          <template v-else>Add nothing and your tickets are already complete.</template>
        </p>
      </div>
      <span class="xstep__mode"><q-icon name="verified" size="14px" /> Included in one charge</span>
    </header>

    <div class="xstep__list">
      <AddOnCard
        v-for="a in ADD_ONS" :key="a.id"
        :add-on="a" :guests="guests" :vehicles="vehicles"
        :selected="selected.includes(a.id)"
        :unavailable-reason="unavailableReason(a)"
        @toggle="emit('toggle', a)"
        @update:vehicles="emit('update:vehicles', $event)"
      />
    </div>

    <!-- A running total, because four independent prices don't add themselves
         up in a guest's head the way one hotel rate does. -->
    <div class="xstep__foot">
      <p class="xstep__tally">
        <template v-if="chosen.length">
          <strong>{{ chosen.length }} extra{{ chosen.length === 1 ? '' : 's' }}</strong> added ·
          {{ fmt(extrasTotal) }} before the bundle credit
        </template>
        <template v-else>No extras added yet — they're all optional.</template>
      </p>
      <button type="button" class="xstep__skip" @click="emit('skip')">
        Skip extras — continue to review
      </button>
    </div>
  </section>
</template>

<style scoped>
.xstep { font-family: var(--ds-font-family); display: flex; flex-direction: column; gap: var(--ds-space-4); }
.xstep__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--ds-space-4); }
.xstep__title { margin: 0; font-size: var(--ds-font-size-lg); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.xstep__sub { margin: 4px 0 0; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.xstep__mode {
  flex: none; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
  font-size: var(--ds-font-size-sm); color: var(--ds-color-text-info);
  background: var(--ds-color-background-info); border-radius: var(--ds-radius-pill); padding: 3px 10px;
}
.xstep__list { display: flex; flex-direction: column; gap: var(--ds-space-3); }

.xstep__foot { display: flex; flex-direction: column; align-items: center; gap: var(--ds-space-2); }
.xstep__tally { margin: 0; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.xstep__tally strong { color: var(--ds-color-text); }
.xstep__skip {
  background: none; border: none; cursor: pointer; font: inherit;
  color: var(--ds-color-link); font-weight: var(--ds-font-weight-bold); padding: var(--ds-space-2);
  text-decoration: underline;
}
.xstep__skip:hover { color: var(--ds-color-text-brand); }

@media (max-width: 640px) {
  .xstep__head { flex-direction: column; }
}
</style>
