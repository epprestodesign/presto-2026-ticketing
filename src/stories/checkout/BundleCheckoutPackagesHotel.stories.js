// CHECKOUT EXPERIENCE / Packages + Hotel — checkout for a package that includes a
// hotel stay (ticket + experience + hotel SKU): stepped accordion + sticky Order
// Summary in a minimal-nav frame, seats held on a timer, one charge for the whole
// package. One of the four ticketing checkout flows (2×2). Prototype data.
import BundleCheckoutPage from '../../components/checkout/BundleCheckoutPage.vue'
import PageFrame from '../../components/PageFrame.vue'
import HoldTimerPill from '../../components/HoldTimerPill.vue'
import { event, pkgHotel, packagesHotelCart } from '../ticketing/_ticketing-flow-carts.js'

const summary = {
  image: event.image,
  title: event.name,
  subtitle: event.venue?.name,
  rows: [
    { label: 'Package', value: pkgHotel.name },
    { label: 'Seats', value: `${pkgHotel.ticket.tierName} · Sec CL10` },
    { label: 'Experience', value: pkgHotel.theme },
    { label: 'Hotel', value: `${pkgHotel.hotel.name} · 1 night` },
  ],
  note: 'Your seats are held while the timer runs.',
}

export default {
  title: 'Checkout Experience/Packages + Hotel',
  component: BundleCheckoutPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Checkout for a **package with a hotel stay** — a ticket + experience + hotel SKU charged as one line. Prototype pricing/inventory.' } },
  },
}

const frame = (inner) => `<page-frame cart-mode="hold" brand="Secure Checkout" minimal-nav>${inner}</page-frame>`

export const Checkout = {
  name: 'Checkout',
  render: () => ({
    components: { BundleCheckoutPage, PageFrame, HoldTimerPill },
    setup: () => ({ event, cart: packagesHotelCart, summary, savings: pkgHotel.savings }),
    template: frame(`
      <div style="padding:28px 20px;"><bundle-checkout-page :event="event" :cart="cart" :summary="summary" :savings="savings" @confirm="() => {}" /></div>
      <hold-timer-pill :seconds="352" running label="Seats held" sub="Finish before the timer ends" />`),
  }),
}
