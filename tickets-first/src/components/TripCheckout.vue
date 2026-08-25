<script setup>
// Step 6 — CHECKOUT. Aug 25, verbatim: "can there be a checkout? Like, I want
// to pay." Until this round the cart handed straight to the confirmation and
// nothing in the flow ever asked for a name or a card.
//
// The page is the library's CheckoutPageExpanded in `ticketing` mode — the
// EXPANDED variant, not the stepped CheckoutPage, and that is the other half of
// the ask: "I don't want this next. I want one big form... We're definitely
// getting rid of that step, step, step for a full open." CheckoutPage's left
// column is an accordion that opens one section at a time behind a Next button,
// so the order cannot be read in full until the last step. The expanded page
// shows contact, payment, review and policies all open at once, every field in
// its input state, with ONE submit at the bottom. The rail — the itemized cart,
// the hold countdown, the totals — is identical in both, and the stakeholder
// said the rail was already right.
//
// Two things this screen adds around it.
//
// 1. THE SUBMIT IS INTERCEPTED. CheckoutPageExpanded's "Book Now" fires a
//    Quasar notify and nothing else — it has no event to bind. The click is
//    caught on the way DOWN (capture) and stopped, so the toast never fires:
//    a toast reading "Reservation confirmed" while the app is already
//    navigating to the real confirmation is the same news twice, in two places,
//    one of which disappears.
//
// 2. EDITING STOPS HERE. The rail is `readonly` and its lines carry no
//    unitPrice (see buildCheckoutCart), so nothing on this page can move a
//    number. CartReview edits a deep copy of whatever it is handed, so an
//    editable rail would change a total the trip never sees — the cart, this
//    page and the receipt have to agree to the dollar. The way back to the one
//    surface that owns those numbers is a link, not a stepper.
import { computed } from 'vue'
import CheckoutPageExpanded from '@lib/components/checkout/CheckoutPageExpanded.vue'
import { buildCheckoutCart } from '../addons.js'

const props = defineProps({
  cart: { type: Object, required: true },   // buildTripCart() result
  event: { type: Object, required: true },
})
const emit = defineEmits(['submit', 'back'])

const checkoutCart = computed(() => buildCheckoutCart(props.cart))

// The rail's summary model. CheckoutPageExpanded reads `total` off it for the
// review section; the rest describes the trip in the guest's own terms, and a
// category the trip does not contain gets no line rather than a blank one.
const summary = computed(() => {
  const c = props.cart
  const ticket = c.items.find((i) => i.type === 'ticket')
  const stay = c.items.find((i) => i.type === 'hotel')
  const extras = c.items.filter((i) => i.type === 'experience')

  const rows = []
  if (ticket) rows.push({ label: 'Tickets', value: `${ticket.qty} × ${ticket.label.replace(/ ticket$/, '')}` })
  if (stay) rows.push({ label: 'Stay', value: stay.label })
  if (extras.length) rows.push({ label: 'Gameday extras', value: extras.map((e) => e.label).join(' · ') })

  const priceLines = []
  if (c.ticketSubtotal) priceLines.push({ label: 'Tickets', value: c.ticketSubtotal })
  if (c.hotelTotal) priceLines.push({ label: 'Stay', value: c.hotelTotal })
  if (c.addOnTotal) priceLines.push({ label: 'Gameday extras', value: c.addOnTotal })
  if (c.credit) priceLines.push({ label: 'Bundle credit', value: -c.credit })
  if (c.fees) priceLines.push({ label: 'Service fees', value: c.fees })
  if (c.taxes) priceLines.push({ label: 'Taxes', value: c.taxes })

  return {
    image: props.event.image,
    title: props.event.name,
    subtitle: props.event.venue?.name,
    rows,
    rrow1: rows.map((r) => r.value).join(' · ') || 'Your trip',
    priceLines,
    total: c.total,
    note: 'One secure charge — tickets, stay and extras together.',
  }
})

function onClickCapture(e) {
  const btn = e.target instanceof Element ? e.target.closest('.ck__submit') : null
  if (!btn) return
  e.preventDefault()
  e.stopPropagation()
  emit('submit')
}
</script>

<template>
  <div class="tco" @click.capture="onClickCapture">
    <div class="tco__bar">
      <button type="button" class="tco__back" @click="emit('back')">
        <q-icon name="arrow_back" size="17px" /> Back to your trip
      </button>
      <span class="tco__note">Quantities, rooms and extras are changed in your trip — this page states what's being charged.</span>
    </div>

    <CheckoutPageExpanded mode="ticketing" :cart="checkoutCart" :summary="summary" />
  </div>
</template>

<style scoped>
.tco { display: flex; flex-direction: column; font-family: var(--ds-font-family); }
.tco__bar {
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  max-width: 1040px; width: 100%; margin: 16px auto 0; padding: 0 24px;
}
.tco__back {
  display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px;
  border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button);
  background: var(--ds-color-surface); font: inherit; font-weight: var(--ds-font-weight-bold);
  color: var(--ds-color-text); cursor: pointer;
}
.tco__note { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
</style>
