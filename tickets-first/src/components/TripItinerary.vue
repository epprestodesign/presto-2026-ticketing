<script setup>
// The combined trip details under the confirmation — one panel holding the
// three things that were bought together, in the order the day happens:
// the stay the night before, the extras around kickoff, then the game.
//
// The library's BundleConfirmation (mounted directly above this) is the RECEIPT:
// order number, the line items, what was charged, and the dual-email notice. It
// stays exactly as shipped. What it can't answer is the question a guest
// actually opens this page with a week later — *where do I go, and when?* Its
// hotel line reads "The Westin · Deluxe King · 1 night" with no address and no
// check-in time, and its extras are priced names with no meeting point.
//
// So the receipt keeps its job and this panel takes the other one. It invents
// nothing: the stay block reads the library's own hotelCartDetail() off the
// hotel cart line, and each extra's note comes from ADD_ONS.
import { computed } from 'vue'

const props = defineProps({
  event: { type: Object, required: true },
  cart: { type: Object, required: true },   // buildTripCart() result
})

const ticket = computed(() => props.cart.items.find((i) => i.type === 'ticket'))
const hotel = computed(() => props.cart.items.find((i) => i.type === 'hotel'))
const stay = computed(() => hotel.value?.hotelDetail || null)
const extras = computed(() => props.cart.items.filter((i) => i.type === 'experience'))

// The fixture's real start time, in the venue's zone. Formatted from the event
// rather than hard-coded so a different fixture would still read correctly.
const kickoff = computed(() => {
  if (!props.event.date) return null
  return new Date(props.event.date).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    timeZone: 'America/New_York',
  })
})
</script>

<template>
  <section class="trip">
    <h3 class="trip__h">Your trip details</h3>

    <!-- Night before -->
    <div v-if="stay" class="trip__block">
      <div class="trip__blockhead"><q-icon name="hotel" size="20px" /><span>The night before</span></div>
      <div class="trip__name">{{ stay.name }} · {{ stay.roomType }}</div>
      <div class="trip__addr"><q-icon name="place" size="15px" />{{ stay.address }}</div>
      <div class="trip__grid">
        <div><span>Check-in</span><strong>{{ stay.checkIn }}</strong></div>
        <div><span>Check-out</span><strong>{{ stay.checkOut }}</strong></div>
      </div>
      <p class="trip__note">{{ stay.note }}</p>
    </div>
    <!-- Said out loud rather than omitted: a guest who skipped the hotel should
         see that the order knows they did, not a gap where a hotel would be. -->
    <div v-else class="trip__block trip__block--muted">
      <div class="trip__blockhead"><q-icon name="hotel" size="20px" /><span>The night before</span></div>
      <p class="trip__note">No hotel on this order — you're arriving on gameday.</p>
    </div>

    <!-- Around kickoff -->
    <div v-if="extras.length" class="trip__block">
      <div class="trip__blockhead"><q-icon name="stars" size="20px" /><span>Before the game</span></div>
      <div v-for="(x, i) in extras" :key="i" class="trip__row">
        <q-icon :name="x.icon || 'stars'" size="20px" class="trip__rowicon" />
        <div>
          <strong>{{ x.label }}</strong>
          <span class="trip__rowsub">{{ x.sublabel }}</span>
          <span v-if="x.note" class="trip__rowsub">{{ x.note }}</span>
        </div>
      </div>
    </div>

    <!-- Kickoff -->
    <div class="trip__block">
      <div class="trip__blockhead"><q-icon name="sports_football" size="20px" /><span>Kickoff</span></div>
      <div class="trip__name">{{ event.name }}</div>
      <div class="trip__addr"><q-icon name="place" size="15px" />{{ event.venue?.name }}<template v-if="event.venue?.city"> · {{ event.venue.city }}</template></div>
      <div class="trip__grid">
        <div><span>Starts</span><strong>{{ kickoff || 'See your tickets' }}</strong></div>
        <div v-if="ticket"><span>Seats</span><strong>{{ ticket.qty }} × {{ ticket.label }}</strong></div>
      </div>
      <p v-if="ticket?.sublabel" class="trip__note">{{ ticket.sublabel }}</p>
    </div>
  </section>
</template>

<style scoped>
.trip {
  font-family: var(--ds-font-family); max-width: 520px; display: flex; flex-direction: column; gap: var(--ds-space-4);
  background: var(--ds-color-surface); border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-lg); padding: var(--ds-space-6);
}
.trip__h { margin: 0; font-size: var(--ds-font-size-md); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }

.trip__block { display: flex; flex-direction: column; gap: 6px; padding: var(--ds-space-4); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); }
.trip__block--muted { color: var(--ds-color-text-subtle); }
.trip__blockhead {
  display: flex; align-items: center; gap: 8px; margin-bottom: 2px;
  font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold);
  letter-spacing: .04em; text-transform: uppercase; color: var(--ds-color-text-subtle);
}
.trip__name { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.trip__addr { display: flex; align-items: center; gap: 5px; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }

/* Check-in / check-out and starts / seats are pairs — a two-up grid keeps each
   label with its value instead of running them into one sentence. */
.trip__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--ds-space-3); margin-top: 6px; }
.trip__grid div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.trip__grid span { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.trip__grid strong { font-size: var(--ds-font-size-sm); color: var(--ds-color-text); }
.trip__note { margin: 6px 0 0; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); line-height: 1.45; }

.trip__row { display: flex; align-items: flex-start; gap: var(--ds-space-3); padding-top: var(--ds-space-3); }
.trip__row + .trip__row { border-top: 1px solid var(--ds-color-border); }
.trip__rowicon { color: var(--ds-color-text-brand); flex: none; margin-top: 1px; }
.trip__row div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.trip__row strong { font-size: var(--ds-font-size-sm); color: var(--ds-color-text); }
.trip__rowsub { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); line-height: 1.45; }

@media (max-width: 520px) {
  .trip__grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
