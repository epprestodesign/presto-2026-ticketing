// CONFIRMATION / Tickets + Hotel — the order-confirmed screen for a build-your-own
// ticket + hotel bundle, on the STANDARD confirmation template (ConfirmationPage,
// mode="ticketing"). Bundles the ticket info AND the full hotel reservation
// details + policies (like the Book Reservation confirmation). Confirmed via the
// v1 dual-email model. One of the four ticketing confirmation flows. Prototype data.
import ConfirmationPage from '../../components/confirmation/ConfirmationPage.vue'
import { ticketsHotelCart, hotel } from '../ticketing/_ticketing-flow-carts.js'
import { confData } from './_ticketing-confirm-data.js'

// Hotel descriptor → confData renders the full reservation block + hotel policies.
const HOTEL = { name: hotel.name, roomType: hotel.roomType, rate: hotel.nightlyRate, nights: 1 }

export default {
  title: 'Confirmation/Tickets + Hotel',
  component: ConfirmationPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Order-confirmed screen for a **ticket + hotel** bundle on the standard confirmation template — tickets, the value-prop guarantees, AND the full hotel reservation details + policies (like the Book Reservation confirmation). Confirmed via the dual-email v1 model. Prototype pricing/inventory.' } },
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
    hotel: HOTEL,
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
    hotel: HOTEL,
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
    hotel: HOTEL,
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
