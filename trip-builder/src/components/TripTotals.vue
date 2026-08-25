<script setup>
// TripTotals — one price block, rendered wherever a total is shown outside
// checkout (the trip page rail and the fly-out footer).
//
// It names a row per category rather than showing one "Subtotal", because in a
// cart that can hold any combination the guest's question after an edit is which
// part moved. The rows sum to the total exactly — stay, saving, tickets, add-ons,
// fee, tax — so nothing is hidden inside an aggregate. Every figure is recomputed
// from the lines by priceTrip(); nothing here accumulates.
//
// The library's OrderSummary was the obvious candidate and doesn't fit: it is
// built around a single reservation (hero image, property title, rating,
// cancellation line) and a trip that is three add-ons and nothing else has no
// such subject. It still renders the checkout rail, where the order IS one fixed
// thing — see CheckoutScreen.
import { computed } from 'vue'
import { totals, items } from '../store.js'
import { money } from '../trip.js'

defineProps({
  // The fly-out footer has less room than the page rail.
  compact: { type: Boolean, default: false },
})

const t = computed(() => totals.value)
const empty = computed(() => items.value.length === 0)
</script>

<template>
  <div class="tt" :class="{ 'tt--compact': compact }">
    <div v-if="!compact" class="tt__head">Price details</div>

    <template v-if="!empty">
      <div v-if="t.stay" class="tt__row"><span>Stay</span><span>{{ money(t.stay) }}</span></div>
      <div v-if="t.tickets" class="tt__row"><span>Tickets</span><span>{{ money(t.tickets) }}</span></div>
      <div v-if="t.addons" class="tt__row"><span>Add-ons</span><span>{{ money(t.addons) }}</span></div>
      <!-- Named for the two things that earned it, so removing either explains
           the line's disappearance without a second sentence. -->
      <div v-if="t.savings" class="tt__row tt__row--save"><span>Trip saving · stay + tickets</span><span>−{{ money(t.savings) }}</span></div>
      <div v-if="t.fees" class="tt__row"><span>Service fee</span><span>{{ money(t.fees) }}</span></div>
      <div v-if="t.taxes" class="tt__row"><span>Taxes</span><span>{{ money(t.taxes) }}</span></div>
      <div class="tt__rule" />
      <div class="tt__row tt__row--total"><span>Total</span><span>{{ money(t.total) }}</span></div>
      <p class="tt__note">Rates in USD. One charge, whatever the trip ends up containing.</p>
    </template>

    <p v-else class="tt__empty">Nothing in the trip yet — the total appears as soon as something is.</p>
  </div>
</template>

<style scoped>
.tt { font-family: var(--ds-font-family); display: flex; flex-direction: column; gap: 8px; }
.tt__head { font-size: 1rem; font-weight: 700; color: var(--ds-color-text); margin-bottom: 2px; }
.tt__row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; font-size: .9375rem; color: var(--ds-color-text-subtle); }
.tt__row--save { color: var(--ds-color-text-success, #167a4a); font-weight: 600; }
.tt__rule { height: 1px; background: var(--ds-color-border); margin: 6px 0; }
.tt__row--total { font-size: 1.125rem; font-weight: 800; color: var(--ds-color-text); }
.tt__note { margin: 4px 0 0; font-size: .75rem; color: var(--ds-color-text-subtle); }
.tt__empty { margin: 0; font-size: .875rem; color: var(--ds-color-text-subtle); }

.tt--compact { gap: 6px; }
.tt--compact .tt__row { font-size: .875rem; }
.tt--compact .tt__note { display: none; }
</style>
