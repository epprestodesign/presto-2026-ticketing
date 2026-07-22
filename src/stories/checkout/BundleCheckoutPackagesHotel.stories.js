// CHECKOUT EXPERIENCE / Packages + Hotel — checkout for a package that includes a
// hotel stay (ticket + experience + hotel SKU), now on the STANDARD checkout
// template (CheckoutPage mode="ticketing"): a left stepped accordion beside a
// sticky Order Summary rail in a minimal-nav frame, seats held on a timer, one
// charge for the whole package. One of the four ticketing checkout flows (2×2).
// Prototype data.
import CheckoutPage from '../../components/checkout/CheckoutPage.vue'
import PageFrame from '../../components/PageFrame.vue'
import HoldTimerPill from '../../components/HoldTimerPill.vue'
import { pkgHotel, packagesHotelCart, packagesHotelCartSplit } from '../ticketing/_ticketing-flow-carts.js'
import { makeSummary } from './_ticketing-checkout-data.js'

const summary = makeSummary(packagesHotelCart, [
  { label: 'Package', value: pkgHotel.name },
  { label: 'Seats', value: `${pkgHotel.ticket.tierName} · Sec CL10` },
  { label: 'Experience', value: pkgHotel.theme },
  { label: 'Hotel', value: `${pkgHotel.hotel.name} · 1 night` },
], { rrow1: `${pkgHotel.name} · ${pkgHotel.hotel.name}` })

export default {
  title: 'Checkout Experience/Packages + Hotel',
  component: CheckoutPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component:
      'Checkout for a **package with a hotel stay** — a ticket + experience + hotel SKU charged as one line — on the standard checkout template (stepped accordion + sticky Order Summary, seats held on a timer). Prototype pricing/inventory.' } },
  },
}

const frame = (inner) => `<page-frame cart-mode="hold" brand="Secure Checkout" minimal-nav>${inner}</page-frame>`

export const Checkout = {
  name: 'Checkout',
  render: () => ({
    components: { CheckoutPage, PageFrame, HoldTimerPill },
    // Split cart → the hotel is its own section (matches the Tickets + Hotel rail).
    setup: () => ({ cart: packagesHotelCartSplit, summary }),
    template: frame(`
      <checkout-page mode="ticketing" :cart="cart" :summary="summary" />
      <hold-timer-pill :seconds="352" running label="Seats held" sub="Finish before the timer ends" />`),
  }),
}
