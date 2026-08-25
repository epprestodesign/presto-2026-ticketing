<script setup>
// Tickets — the library's TicketTierList, unchanged.
//
// It derives the event's tiers, assigns deterministic remaining counts (one tier
// sold out, one limited), and emits `continue` with whatever quantities were set.
// Everything this screen adds is what happens to that payload: the tiers are
// ADDED to the trip rather than becoming the trip. A tier already in the cart
// gains the new quantity instead of appearing twice, which is the difference
// between a cart and a selection.
//
// The /experience fork opened this screen with a "How many tickets?" modal and
// treated the answer as the party size for the whole journey — one number that
// also sized the hotel. That's gone. Tickets are counted here, rooms are counted
// in the stay editor, and a shuttle seat is counted on its own card, because in a
// trip that can be any shape those three numbers are genuinely not the same
// number.
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import TicketTierList from '@lib/components/TicketTierList.vue'
import EventStrip from '../components/EventStrip.vue'
import { itemsOf, addTickets, nav } from '../store.js'
import { EVENT, MAX_TICKETS, tierById } from '../trip.js'

const $q = useQuasar()

const held = computed(() => itemsOf('ticket'))
const heldCount = computed(() => held.value.reduce((s, i) => s + i.qty, 0))

function onContinue({ items = [] } = {}) {
  for (const sel of items) addTickets(sel.id, sel.quantity)
  const added = items.reduce((s, i) => s + i.quantity, 0)
  $q.notify({
    message: `${added} ticket${added === 1 ? '' : 's'} added to your trip.`,
    icon: 'confirmation_number', color: 'grey-9', position: 'bottom', timeout: 3000,
    actions: [{ label: 'View trip', color: 'white', handler: () => nav('trip') }],
  })
  nav('trip')
}
</script>

<template>
  <div class="ts">
    <event-strip note="Tickets stand on their own — buy them and stop, or keep building." />

    <div class="ts__inner">
      <header class="ts__head">
        <h2 class="ts__title">Pick your seats</h2>
        <p class="ts__sub">
          Priced per ticket. Your party is seated together in one block whatever quantity you choose.
        </p>
        <!-- Adding to a cart that already holds tickets has to say so before the
             Continue button, or the new number reads as a replacement. -->
        <p v-if="heldCount" class="ts__note">
          <q-icon name="info" size="17px" />
          Your trip already holds {{ heldCount }} ticket{{ heldCount === 1 ? '' : 's' }}
          ({{ held.map((h) => `${h.qty} × ${tierById(h.tierId).name}`).join(', ') }}) —
          anything chosen here is added to them, not instead of them.
        </p>
      </header>

      <ticket-tier-list :event="EVENT" :max="MAX_TICKETS" @continue="onContinue" />

      <p class="ts__foot">
        Prices exclude the service fee, which is shown in your trip total.
        Quantities can be changed or dropped from the trip afterwards — this screen is not a commitment.
      </p>
    </div>
  </div>
</template>

<style scoped>
.ts { display: flex; flex-direction: column; flex: 1; }
.ts__inner { width: 100%; max-width: min(980px, 92%); margin: 0 auto; padding: 26px 0 56px; }
.ts__head { margin-bottom: 20px; }
.ts__title { margin: 0; font-size: 1.5rem; font-weight: 800; color: var(--ds-color-text); }
.ts__sub { margin: 6px 0 0; max-width: 70ch; color: var(--ds-color-text-subtle); }
.ts__note { display: flex; align-items: flex-start; gap: 8px; margin: 12px 0 0; padding: 10px 14px; border-radius: var(--ds-radius-md, 8px); background: var(--ds-palette-blue-100, #e8f0fe); font-size: .9375rem; color: var(--ds-color-text); }
.ts__foot { margin: 22px 0 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }
</style>
