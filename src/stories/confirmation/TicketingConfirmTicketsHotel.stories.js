// CONFIRMATION / Tickets + Hotel — the order-confirmed screen for a build-your-own
// ticket + hotel bundle, confirmed via the v1 dual-email model. One of the four
// ticketing confirmation flows (2×2). Prototype data.
import BundleConfirmation from '../../components/BundleConfirmation.vue'
import { event, ticketsHotelCart } from '../ticketing/_ticketing-flow-carts.js'

export default {
  title: 'Confirmation/Tickets + Hotel',
  component: BundleConfirmation,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Order-confirmed screen for a **ticket + hotel** bundle — tickets and a nearby hotel in one order, confirmed via the dual-email v1 model. Prototype pricing/inventory.' } },
  },
}

const wrap = (inner) => `<div style="display:flex;justify-content:center;padding:24px;background:var(--ds-color-surface-canvas);min-height:100vh;">${inner}</div>`

export const Confirmed = {
  name: 'Confirmation',
  render: () => ({
    components: { BundleConfirmation },
    setup: () => ({ event, cart: ticketsHotelCart }),
    template: wrap(`<BundleConfirmation order-number="EP-7Q4M2X" :event="event" :cart="cart" email="hello@girardjustin.com" variant="bundle" />`),
  }),
}
