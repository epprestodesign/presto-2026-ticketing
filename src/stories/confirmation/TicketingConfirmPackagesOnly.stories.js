// CONFIRMATION / Packages Only — the order-confirmed screen for a package purchase
// without a hotel (ticket + experience SKU). One of the four ticketing confirmation
// flows (2×2). Prototype data.
import BundleConfirmation from '../../components/BundleConfirmation.vue'
import { event, packagesOnlyCart } from '../ticketing/_ticketing-flow-carts.js'

export default {
  title: 'Confirmation/Packages Only',
  component: BundleConfirmation,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Order-confirmed screen for a **package without a hotel** — a ticket + experience SKU. Prototype pricing/inventory.' } },
  },
}

const wrap = (inner) => `<div style="display:flex;justify-content:center;padding:24px;background:var(--ds-color-surface-canvas);min-height:100vh;">${inner}</div>`

export const Confirmed = {
  name: 'Confirmation',
  render: () => ({
    components: { BundleConfirmation },
    setup: () => ({ event, cart: packagesOnlyCart }),
    template: wrap(`<BundleConfirmation order-number="EP-9F3K1P" :event="event" :cart="cart" email="hello@girardjustin.com" variant="package" />`),
  }),
}
