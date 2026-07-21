// CONFIRMATION / Packages + Hotel — the order-confirmed screen for a package
// purchase that includes a hotel stay (ticket + experience + hotel SKU). One of
// the four ticketing confirmation flows (2×2). Prototype data.
import BundleConfirmation from '../../components/BundleConfirmation.vue'
import { event, packagesHotelCart } from '../ticketing/_ticketing-flow-carts.js'

export default {
  title: 'Confirmation/Packages + Hotel',
  component: BundleConfirmation,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Order-confirmed screen for a **package with a hotel stay** — a ticket + experience + hotel SKU. Prototype pricing/inventory.' } },
  },
}

const wrap = (inner) => `<div style="display:flex;justify-content:center;padding:24px;background:var(--ds-color-surface-canvas);min-height:100vh;">${inner}</div>`

export const Confirmed = {
  name: 'Confirmation',
  render: () => ({
    components: { BundleConfirmation },
    setup: () => ({ event, cart: packagesHotelCart }),
    template: wrap(`<BundleConfirmation order-number="EP-6T2N8V" :event="event" :cart="cart" email="hello@girardjustin.com" variant="package" />`),
  }),
}
