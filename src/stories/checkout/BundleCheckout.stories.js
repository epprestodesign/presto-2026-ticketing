// CHECKOUT EXPERIENCE / Tickets + Hotel — the unified ticket + hotel bundle
// checkout, now on the STANDARD checkout template (CheckoutPage mode="ticketing"):
// a left stepped accordion beside a sticky Order Summary rail in a minimal-nav
// frame, seats held on a timer. One charge covers all components. Variants cover
// the edge cases: payment-failure hold grace, a section selling out mid-checkout,
// and an expired hold. Prototype data.
import CheckoutPage from '../../components/checkout/CheckoutPage.vue'
import PageFrame from '../../components/PageFrame.vue'
import HoldTimerPill from '../../components/HoldTimerPill.vue'
import { ticketsHotelCart } from '../ticketing/_ticketing-flow-carts.js'
import { makeSummary } from './_ticketing-checkout-data.js'

const summary = makeSummary(ticketsHotelCart, [
  { label: 'Seats', value: 'Club · Sec CL10' },
  { label: 'Tickets', value: '2 × Club' },
  { label: 'Hotel', value: 'The Westin · 1 night' },
], { rrow1: '2 × Club · The Westin · 1 night' })

export default {
  title: 'Checkout Experience/Tickets + Hotel',
  component: CheckoutPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component:
      'The unified **ticket + hotel bundle** checkout on the standard checkout template (stepped accordion + sticky Order Summary, minimal-nav frame, seats held on a timer), with one charge covering all components. Variants show the edge cases.' } },
  },
}

const frame = (inner) => `<page-frame cart-mode="hold" brand="Secure Checkout" minimal-nav>${inner}</page-frame>`

export const Checkout = {
  name: 'Checkout',
  render: () => ({
    components: { CheckoutPage, PageFrame, HoldTimerPill },
    setup: () => ({ cart: ticketsHotelCart, summary }),
    template: frame(`
      <checkout-page mode="ticketing" :cart="cart" :summary="summary" />
      <hold-timer-pill :seconds="352" running label="Seats held" sub="Finish before the timer ends" />`),
  }),
}

export const PaymentFailed = {
  name: 'Payment failed · hold grace',
  render: () => ({
    components: { CheckoutPage, PageFrame, HoldTimerPill },
    setup: () => ({ cart: ticketsHotelCart, summary }),
    template: frame(`
      <checkout-page mode="ticketing" :cart="cart" :summary="summary" edge="payment-failed" :start-step="3" />
      <hold-timer-pill :seconds="292" running label="Seats held" sub="Grace period — update your card" />`),
  }),
}

export const SoldOutMidCheckout = {
  name: 'Section sold out mid-checkout',
  render: () => ({
    components: { CheckoutPage, PageFrame, HoldTimerPill },
    setup: () => ({ cart: ticketsHotelCart, summary }),
    template: frame(`
      <checkout-page mode="ticketing" :cart="cart" :summary="summary" edge="sold-out" />
      <hold-timer-pill :seconds="352" running label="Seats held" sub="Finish before the timer ends" />`),
  }),
}

export const HoldExpired = {
  name: 'Hold expired',
  render: () => ({
    components: { CheckoutPage, PageFrame, HoldTimerPill },
    setup: () => ({ cart: ticketsHotelCart, summary }),
    template: frame(`
      <checkout-page mode="ticketing" :cart="cart" :summary="summary" edge="hold-expired" />
      <hold-timer-pill :seconds="0" label="Hold expired" sub="Re-select your seats to continue" />`),
  }),
}
