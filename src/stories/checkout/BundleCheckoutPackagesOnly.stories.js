// CHECKOUT EXPERIENCE / Packages Only — checkout for a package without a hotel
// (ticket + experience SKU), now on the STANDARD checkout template
// (CheckoutPage mode="ticketing"): a left stepped accordion beside a sticky
// Order Summary rail in a minimal-nav frame, seats held on a timer. One of the
// four ticketing checkout flows (2×2). Prototype data.
import CheckoutPage from '../../components/checkout/CheckoutPage.vue'
import PageFrame from '../../components/PageFrame.vue'
import HoldTimerPill from '../../components/HoldTimerPill.vue'
import { pkgOnly, packagesOnlyCart } from '../ticketing/_ticketing-flow-carts.js'
import { makeSummary } from './_ticketing-checkout-data.js'

const summary = makeSummary(packagesOnlyCart, [
  { label: 'Package', value: pkgOnly.name },
  { label: 'Seats', value: `${pkgOnly.ticket.tierName} · Sec CL10` },
  { label: 'Experience', value: pkgOnly.theme },
], { rrow1: pkgOnly.name })

export default {
  title: 'Checkout Experience/Packages Only',
  component: CheckoutPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component:
      'Checkout for a **package without a hotel** — a ticket + experience SKU charged as one line — on the standard checkout template (stepped accordion + sticky Order Summary, seats held on a timer). Prototype pricing/inventory.' } },
  },
}

const frame = (inner) => `<page-frame cart-mode="hold" brand="Secure Checkout" minimal-nav>${inner}</page-frame>`

export const Checkout = {
  name: 'Checkout',
  render: () => ({
    components: { CheckoutPage, PageFrame, HoldTimerPill },
    setup: () => ({ cart: packagesOnlyCart, summary }),
    template: frame(`
      <checkout-page mode="ticketing" :cart="cart" :summary="summary" />
      <hold-timer-pill :seconds="352" running label="Seats held" sub="Finish before the timer ends" />`),
  }),
}
