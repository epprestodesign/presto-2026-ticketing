// CHECKOUT EXPERIENCE / Tickets Only — the ticket-only checkout (no hotel):
// stepped accordion + sticky Order Summary in a minimal-nav frame, seats held on
// a timer. One of the four ticketing checkout flows (2×2). Prototype data.
import BundleCheckoutPage from '../../components/checkout/BundleCheckoutPage.vue'
import PageFrame from '../../components/PageFrame.vue'
import HoldTimerPill from '../../components/HoldTimerPill.vue'
import { event, tier, ticketsOnlyCart } from '../ticketing/_ticketing-flow-carts.js'

const summary = {
  image: event.image,
  title: event.name,
  subtitle: event.venue?.name,
  rows: [
    { label: 'Seats', value: 'Club · Sec CL10' },
    { label: 'Tickets', value: `2 × ${tier.name}` },
  ],
  note: 'Your seats are held while the timer runs.',
}

export default {
  title: 'Checkout Experience/Tickets Only',
  component: BundleCheckoutPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'The **ticket-only** checkout — no hotel. Same convention as the bundle checkout (accordion + sticky Order Summary, held on a timer). Prototype pricing/inventory.' } },
  },
}

const frame = (inner) => `<page-frame cart-mode="hold" brand="Secure Checkout" minimal-nav>${inner}</page-frame>`

export const Checkout = {
  name: 'Checkout',
  render: () => ({
    components: { BundleCheckoutPage, PageFrame, HoldTimerPill },
    setup: () => ({ event, cart: ticketsOnlyCart, summary }),
    template: frame(`
      <div style="padding:28px 20px;"><bundle-checkout-page :event="event" :cart="cart" :summary="summary" @confirm="() => {}" /></div>
      <hold-timer-pill :seconds="352" running label="Seats held" sub="Finish before the timer ends" />`),
  }),
}
