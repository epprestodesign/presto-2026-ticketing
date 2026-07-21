// CONFIRMATION / Packages + Hotel — the order-confirmed screen for a package
// purchase that includes a hotel stay (ticket + experience + hotel SKU), on the
// STANDARD confirmation template (ConfirmationPage, mode="ticketing"). Bundles the
// package info AND the full hotel reservation details + policies. One of the four
// ticketing confirmation flows. Prototype data.
import ConfirmationPage from '../../components/confirmation/ConfirmationPage.vue'
import { packagesHotelCart, pkgHotel } from '../ticketing/_ticketing-flow-carts.js'
import { confData } from './_ticketing-confirm-data.js'

// The package's included stay → confData renders the full reservation block + hotel policies.
const HOTEL = { name: pkgHotel.hotel.name, roomType: pkgHotel.hotel.roomType, rate: pkgHotel.hotel.nightlyRate, nights: pkgHotel.nights || 1 }

export default {
  title: 'Confirmation/Packages + Hotel',
  component: ConfirmationPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Order-confirmed screen for a **package with a hotel stay** — a ticket + experience + hotel SKU — on the standard confirmation template, bundling the package info with the full hotel reservation details + policies. Prototype pricing/inventory.' } },
  },
}

const story = (data) => ({
  components: { ConfirmationPage },
  setup: () => ({ data }),
  template: '<ConfirmationPage mode="ticketing" :data="data" />',
})

export const Confirmed = {
  name: 'Page',
  render: () => story(confData(packagesHotelCart, {
    orderNumber: 'EP-6T2N8V',
    hotel: HOTEL,
    bannerTitle: 'Success! Your package is confirmed.',
    statusNote: {
      title: 'Your stay and experience are set',
      body: 'Your hotel stay is confirmed now. Event tickets are issued by the venue and arrive in a separate email — everything is part of this one order.',
    },
  })),
}

export const ExperiencePending = {
  name: 'Experience pending',
  render: () => story(confData(packagesHotelCart, {
    orderNumber: 'EP-6T2N8V',
    hotel: HOTEL,
    tone: 'warning',
    bannerTitle: 'Package confirmed — experience details to follow.',
    statusNote: {
      title: 'Experience details coming soon',
      body: 'Your tickets and hotel are confirmed. The experience add-on (times, meeting point, and what to bring) is being scheduled with the venue — we’ll email you the details a few days before the event.',
    },
  })),
}
