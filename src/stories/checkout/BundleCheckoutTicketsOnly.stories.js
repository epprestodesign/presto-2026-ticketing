// CHECKOUT EXPERIENCE / Tickets Only — the ticket-only checkout (no hotel), now
// on the STANDARD checkout template (CheckoutPage mode="ticketing"): a left
// stepped accordion beside a sticky Order Summary rail in a minimal-nav frame,
// seats held on a timer. One of the four ticketing checkout flows (2×2).
// Prototype data.
import CheckoutPage from '../../components/checkout/CheckoutPage.vue'
import PageFrame from '../../components/PageFrame.vue'
import HoldTimerPill from '../../components/HoldTimerPill.vue'
import { tier, ticketsOnlyCart } from '../ticketing/_ticketing-flow-carts.js'
import { makeSummary } from './_ticketing-checkout-data.js'

const summary = makeSummary(ticketsOnlyCart, [
  { label: 'Seats', value: 'Club · Sec CL10' },
  { label: 'Tickets', value: `2 × ${tier.name}` },
], { rrow1: `2 × ${tier.name} · Club` })

export default {
  title: 'Checkout Experience/Tickets Only',
  component: CheckoutPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component:
      'The **ticket-only** checkout — no hotel — on the standard checkout template (stepped accordion + sticky Order Summary, minimal-nav frame, seats held on a timer). Prototype pricing/inventory.' } },
  },
}

const frame = (inner) => `<page-frame cart-mode="hold" brand="Secure Checkout" minimal-nav>${inner}</page-frame>`

export const Checkout = {
  name: 'Checkout',
  render: () => ({
    components: { CheckoutPage, PageFrame, HoldTimerPill },
    setup: () => ({ cart: ticketsOnlyCart, summary }),
    template: frame(`
      <checkout-page mode="ticketing" :cart="cart" :summary="summary" />
      <hold-timer-pill :seconds="352" running label="Seats held" sub="Finish before the timer ends" />`),
  }),
}
