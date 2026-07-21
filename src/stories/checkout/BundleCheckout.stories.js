// CHECKOUT EXPERIENCE / Tickets + Hotel — the unified bundle checkout, following
// the Group Block convention (stepped accordion + sticky Order Summary in a
// minimal-nav PageFrame, seats held on a timer). One charge covers all
// components. Variants cover the scope 3.5 edge cases: payment-failure hold grace
// (C-08), a section selling out mid-checkout, and an expired hold. Prototype data.
import BundleCheckoutPage from '../../components/checkout/BundleCheckoutPage.vue'
import PageFrame from '../../components/PageFrame.vue'
import HoldTimerPill from '../../components/HoldTimerPill.vue'
import { event, tier, ticketsHotelCart } from '../ticketing/_ticketing-flow-carts.js'

const summary = {
  image: event.image,
  title: event.name,
  subtitle: event.venue?.name,
  rows: [
    { label: 'Seats', value: 'Club · Sec CL10' },
    { label: 'Tickets', value: `2 × ${tier.name}` },
    { label: 'Hotel', value: 'The Westin · 1 night' },
  ],
  note: 'Your seats are held while the timer runs.',
}

export default {
  title: 'Checkout Experience/Tickets + Hotel',
  component: BundleCheckoutPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component:
      'The unified **ticket + hotel bundle** checkout — same convention as Group Block (stepped accordion + sticky Order Summary, minimal-nav frame, held on a timer), with one charge covering all components. Variants show the scope 3.5 edge cases.' } },
  },
}

const frame = (inner) => `<page-frame cart-mode="hold" brand="Secure Checkout" minimal-nav>${inner}</page-frame>`

export const Checkout = {
  name: 'Checkout',
  render: () => ({
    components: { BundleCheckoutPage, PageFrame, HoldTimerPill },
    setup: () => ({ event, cart: ticketsHotelCart, summary, savings: 58 }),
    template: frame(`
      <div style="padding:28px 20px;">
        <bundle-checkout-page :event="event" :cart="cart" :summary="summary" :savings="savings" @confirm="() => {}" />
      </div>
      <hold-timer-pill :seconds="352" running label="Seats held" sub="Finish before the timer ends" />`),
  }),
}

export const PaymentFailed = {
  name: 'Payment failed · hold grace (C-08)',
  render: () => ({
    components: { BundleCheckoutPage, PageFrame },
    setup: () => ({ event, cart: ticketsHotelCart, summary }),
    template: frame(`<div style="padding:28px 20px;"><bundle-checkout-page :event="event" :cart="cart" :summary="summary" :start-step="3" edge="payment-failed" hold-label="4:52" /></div>`),
  }),
}

export const SoldOutMidCheckout = {
  name: 'Section sold out mid-checkout',
  render: () => ({
    components: { BundleCheckoutPage, PageFrame },
    setup: () => ({ event, cart: ticketsHotelCart, summary }),
    template: frame(`<div style="padding:28px 20px;"><bundle-checkout-page :event="event" :cart="cart" :summary="summary" edge="sold-out" /></div>`),
  }),
}

export const HoldExpired = {
  name: 'Hold expired',
  render: () => ({
    components: { BundleCheckoutPage, PageFrame },
    setup: () => ({ event, cart: ticketsHotelCart, summary }),
    template: frame(`<div style="padding:28px 20px;"><bundle-checkout-page :event="event" :cart="cart" :summary="summary" edge="hold-expired" /></div>`),
  }),
}
