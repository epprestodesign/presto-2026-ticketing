// CHECKOUT EXPERIENCE / Packages Only — checkout for a package without a hotel
// (ticket + experience SKU): stepped accordion + sticky Order Summary in a
// minimal-nav frame, seats held on a timer. One of the four ticketing checkout
// flows (2×2). Prototype data.
import BundleCheckoutPage from '../../components/checkout/BundleCheckoutPage.vue'
import PageFrame from '../../components/PageFrame.vue'
import HoldTimerPill from '../../components/HoldTimerPill.vue'
import { event, pkgOnly, packagesOnlyCart } from '../ticketing/_ticketing-flow-carts.js'

const summary = {
  image: event.image,
  title: event.name,
  subtitle: event.venue?.name,
  rows: [
    { label: 'Package', value: pkgOnly.name },
    { label: 'Seats', value: `${pkgOnly.ticket.tierName} · Sec CL10` },
    { label: 'Experience', value: pkgOnly.theme },
  ],
  note: 'Your seats are held while the timer runs.',
}

export default {
  title: 'Checkout Experience/Packages Only',
  component: BundleCheckoutPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Checkout for a **package without a hotel** — a ticket + experience SKU charged as one line. Prototype pricing/inventory.' } },
  },
}

const frame = (inner) => `<page-frame cart-mode="hold" brand="Secure Checkout" minimal-nav>${inner}</page-frame>`

export const Checkout = {
  name: 'Checkout',
  render: () => ({
    components: { BundleCheckoutPage, PageFrame, HoldTimerPill },
    setup: () => ({ event, cart: packagesOnlyCart, summary, savings: pkgOnly.savings }),
    template: frame(`
      <div style="padding:28px 20px;"><bundle-checkout-page :event="event" :cart="cart" :summary="summary" :savings="savings" @confirm="() => {}" /></div>
      <hold-timer-pill :seconds="352" running label="Seats held" sub="Finish before the timer ends" />`),
  }),
}
