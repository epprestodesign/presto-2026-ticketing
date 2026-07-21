// CONFIRMATION / Tickets + Hotel — the order-confirmed screen for a build-your-own
// ticket + hotel bundle, on the STANDARD confirmation template (ConfirmationPage,
// mode="ticketing"). Confirmed via the v1 dual-email model (hotel now, tickets in a
// separate email). One of the four ticketing confirmation flows (2×2). Prototype data.
import ConfirmationPage from '../../components/confirmation/ConfirmationPage.vue'
import { ticketsHotelCart } from '../ticketing/_ticketing-flow-carts.js'
import { confData } from './_ticketing-confirm-data.js'

export default {
  title: 'Confirmation/Tickets + Hotel',
  component: ConfirmationPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Order-confirmed screen for a **ticket + hotel** bundle on the standard confirmation template — tickets and a nearby hotel in one order, confirmed via the dual-email v1 model. Prototype pricing/inventory.' } },
  },
}

const story = (data) => ({
  components: { ConfirmationPage },
  setup: () => ({ data }),
  template: '<ConfirmationPage mode="ticketing" :data="data" />',
})

export const Confirmed = {
  name: 'Page',
  render: () => story(confData(ticketsHotelCart, {
    orderNumber: 'EP-7Q4M2X',
    bannerTitle: 'Success! Your hotel + tickets are confirmed.',
    statusNote: {
      title: 'Two confirmations, two emails',
      body: 'Your hotel stay is confirmed now. Your event tickets are issued by the venue and arrive in a separate email — both are already part of this order and payment is complete.',
    },
  })),
}

export const SeatsUpgraded = {
  name: 'Seats upgraded',
  render: () => story(confData(ticketsHotelCart, {
    orderNumber: 'EP-7Q4M2X',
    tone: 'warning',
    bannerTitle: 'Order confirmed — with a seating change.',
    statusNote: {
      title: 'Your seats were upgraded',
      body: 'The section you selected sold out before your order finalized, so we moved your party to a comparable, better-located section at no extra charge. Your updated seats are shown in your order.',
    },
  })),
}

export const HoldExpired = {
  name: 'Hold expired',
  render: () => story(confData(ticketsHotelCart, {
    orderNumber: 'EP-7Q4M2X',
    tone: 'danger',
    bannerTitle: 'Your hold expired before payment.',
    bannerSub: 'This order was not confirmed.',
    bannerCta: 'Start a new order',
    statusNote: {
      title: 'Order not confirmed',
      body: 'The reservation hold on these tickets and this room expired before payment was completed, so nothing was charged. The inventory has been released — you can start a new order to try again.',
    },
  })),
}

export const Refunded = {
  name: 'Refunded',
  render: () => story(confData(ticketsHotelCart, {
    orderNumber: 'EP-7Q4M2X',
    tone: 'danger',
    bannerTitle: 'This order was cancelled and refunded.',
    bannerSub: 'A refund confirmation is on its way.',
    bannerCta: 'View my orders',
    statusNote: {
      title: 'Order cancelled & refunded',
      body: 'This order has been cancelled and the full amount refunded to your original payment method. Refunds typically take 5–10 business days to appear on your statement.',
    },
  })),
}
