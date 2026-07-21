// CONFIRMATION / Tickets Only — the order-confirmed screen for a ticket-only
// purchase (no hotel). Ticketmaster fulfils the tickets; EventPipe sends no hotel
// confirmation. One of the four ticketing confirmation flows (2×2). Prototype data.
import BundleConfirmation from '../../components/BundleConfirmation.vue'
import { event, ticketsOnlyCart } from '../ticketing/_ticketing-flow-carts.js'

export default {
  title: 'Confirmation/Tickets Only',
  component: BundleConfirmation,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Order-confirmed screen for a **ticket-only** purchase — no hotel. Prototype pricing/inventory.' } },
  },
}

const wrap = (inner) => `<div style="display:flex;justify-content:center;padding:24px;background:var(--ds-color-surface-canvas);min-height:100vh;">${inner}</div>`

export const Confirmed = {
  name: 'Confirmation',
  render: () => ({
    components: { BundleConfirmation },
    setup: () => ({ event, cart: ticketsOnlyCart }),
    template: wrap(`<BundleConfirmation order-number="EP-2B8H5W" :event="event" :cart="cart" email="hello@girardjustin.com" variant="ticket-only" />`),
  }),
}
