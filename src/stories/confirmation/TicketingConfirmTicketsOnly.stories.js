// CONFIRMATION / Tickets Only — the order-confirmed screen for a ticket-only
// purchase (no hotel), rendered on the STANDARD confirmation template
// (ConfirmationPage, mode="ticketing"). Ticketmaster fulfils the tickets; there
// is no hotel confirmation. One of the four ticketing confirmation flows (2×2).
import ConfirmationPage from '../../components/confirmation/ConfirmationPage.vue'
import { ticketsOnlyCart } from '../ticketing/_ticketing-flow-carts.js'
import { confData } from './_ticketing-confirm-data.js'

export default {
  title: 'Confirmation/Tickets Only',
  component: ConfirmationPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Order-confirmed screen for a **ticket-only** purchase — no hotel — on the standard confirmation template. Prototype pricing/inventory.' } },
  },
}

const story = (data) => ({
  components: { ConfirmationPage },
  setup: () => ({ data }),
  template: '<ConfirmationPage mode="ticketing" :data="data" />',
})

export const Confirmed = {
  name: 'Page',
  render: () => story(confData(ticketsOnlyCart, {
    orderNumber: 'EP-2B8H5W',
    bannerTitle: 'Success! Your tickets are confirmed.',
  })),
}

export const TicketsDelayed = {
  name: 'Tickets delayed',
  render: () => story(confData(ticketsOnlyCart, {
    orderNumber: 'EP-2B8H5W',
    tone: 'warning',
    bannerTitle: 'Order received — your tickets are on the way.',
    bannerSub: 'We’re finalizing your seats with the venue.',
    statusNote: {
      title: 'Your tickets will arrive shortly',
      body: 'Your payment went through and your order is secured. Mobile tickets are still being issued by the venue and will land in your EventPipe app within a few minutes — we’ll email you the moment they’re ready.',
    },
  })),
}
