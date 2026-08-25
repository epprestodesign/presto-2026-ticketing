<script setup>
// Checkout — the library's CheckoutPageExpanded in mode="ticketing", handed
// whatever the trip turned out to be.
//
// Nothing about this page knows the trip was built out of order, and it doesn't
// need to: buildTripCart() hands it an ordinary itemized ticketing cart, so a
// hotel-only trip, a tickets-only trip and a parking-pass-only trip all arrive as
// the same shape with different lines. The page is mounted exactly as shipped.
//
// The EXPANDED checkout rather than the stepped one, for the same reason Option
// D moved: `CheckoutPage`'s left column is an accordion that reveals one section
// at a time behind a Next button, so the order can't be read in full until the
// last step. A trip assembled out of order deserves to be reviewable in one
// piece, and the rail — cart, countdown, order summary — is identical either way.
//
// One deliberate asymmetry: this is the FIRST surface in the flow where the trip
// is fixed. Its cart body (CartReview) edits a deep copy of what it's given, so
// changing a quantity here would move a number the trip never sees — an "Edit
// trip" link goes back to the one place that owns those numbers instead. Editing
// stops when paying starts, and that boundary is drawn once, here.
import { computed } from 'vue'
import CheckoutPageExpanded from '@lib/components/checkout/CheckoutPageExpanded.vue'
import { items, totals, isEmpty, nav } from '../store.js'
import { buildTripCart, EVENT, EVENT_VENUE, stayById, tierById, addonById } from '../trip.js'

const cart = computed(() => buildTripCart(items.value))

// The sticky rail's model. Rows describe the trip in the guest's own terms — one
// line per category present, and none for a category they never bought, so the
// rail of a tickets-only order doesn't have a blank "Hotel" waiting on it.
const summary = computed(() => {
  const stay = items.value.find((i) => i.kind === 'stay')
  const tickets = items.value.filter((i) => i.kind === 'ticket')
  const addons = items.value.filter((i) => i.kind === 'addon')
  const rows = []
  if (stay) rows.push({ label: 'Stay', value: `${stayById(stay.hotelId).name} · ${stay.nights} night${stay.nights === 1 ? '' : 's'}` })
  if (tickets.length) rows.push({ label: 'Tickets', value: tickets.map((t) => `${t.qty} × ${tierById(t.tierId).name}`).join(', ') })
  if (addons.length) rows.push({ label: 'Add-ons', value: addons.map((a) => `${a.qty} × ${addonById(a.addonId).name}`).join(', ') })

  const t = totals.value
  const priceLines = []
  if (t.stay) priceLines.push({ label: 'Stay', value: t.netStay })
  if (t.tickets) priceLines.push({ label: 'Tickets', value: t.tickets })
  if (t.addons) priceLines.push({ label: 'Add-ons', value: t.addons })
  if (t.fees) priceLines.push({ label: 'Service fee', value: t.fees })
  if (t.taxes) priceLines.push({ label: 'Taxes', value: t.taxes })

  return {
    image: EVENT.image,
    title: EVENT.name,
    subtitle: EVENT_VENUE,
    rows,
    rrow1: rows.map((r) => r.value).join(' · ') || 'Your trip',
    priceLines,
    total: t.total,
    note: 'One charge for everything in your trip.',
  }
})
</script>

<template>
  <div class="cs">
    <!-- The way back to the only surface that can change a line. -->
    <div class="cs__bar">
      <button type="button" class="cs__back" @click="nav('trip')">
        <q-icon name="arrow_back" size="17px" /> Edit trip
      </button>
      <span class="cs__barnote">Quantities and rooms are changed in your trip — this page states what's being charged.</span>
    </div>

    <checkout-page-expanded v-if="!isEmpty" mode="ticketing" :cart="cart" :summary="summary" />

    <!-- Reachable by deep link with an empty cart; says what's missing rather
         than rendering a checkout for nothing. -->
    <div v-else class="cs__empty">
      <h2>There's nothing to check out yet</h2>
      <p>Add a hotel, tickets or an add-on — any one of them is enough to check out with.</p>
      <button type="button" class="cs__cta" @click="nav('landing')">Start your trip</button>
    </div>
  </div>
</template>

<style scoped>
.cs { display: flex; flex-direction: column; flex: 1; }
.cs__bar { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; max-width: min(1440px, 92%); margin: 12px auto 0; }
.cs__back { display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-surface); font: inherit; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }
.cs__barnote { font-size: .8125rem; color: var(--ds-color-text-subtle); }

.cs__empty { max-width: 520px; margin: 60px auto; text-align: center; font-family: var(--ds-font-family); }
.cs__empty h2 { margin: 0 0 8px; font-size: 1.375rem; font-weight: 800; color: var(--ds-color-text); }
.cs__empty p { margin: 0 0 20px; color: var(--ds-color-text-subtle); }
.cs__cta { height: 46px; padding: 0 22px; border: 0; border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
</style>
