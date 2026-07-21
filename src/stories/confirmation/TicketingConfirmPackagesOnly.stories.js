// CONFIRMATION / Packages Only — the order-confirmed screen for a package purchase
// without a hotel (ticket + experience SKU), on the STANDARD confirmation template
// (ConfirmationPage, mode="ticketing"). One of the four ticketing confirmation
// flows (2×2). Prototype data.
import ConfirmationPage from '../../components/confirmation/ConfirmationPage.vue'
import { packagesOnlyCart } from '../ticketing/_ticketing-flow-carts.js'
import { confData } from './_ticketing-confirm-data.js'

export default {
  title: 'Confirmation/Packages Only',
  component: ConfirmationPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Order-confirmed screen for a **package without a hotel** — a ticket + experience SKU — on the standard confirmation template. Prototype pricing/inventory.' } },
  },
}

const story = (data) => ({
  components: { ConfirmationPage },
  setup: () => ({ data }),
  template: '<ConfirmationPage mode="ticketing" :data="data" />',
})

export const Confirmed = {
  name: 'Page',
  render: () => story(confData(packagesOnlyCart, {
    orderNumber: 'EP-9F3K1P',
    bannerTitle: 'Success! Your package is confirmed.',
  })),
}
