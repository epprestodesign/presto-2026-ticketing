// TICKETING & BUNDLES / Confirmation / Bundle Confirmation — post-payment (scope
// 3.6). Three variants: ticket + hotel bundle (dual-email v1), a themed package,
// and ticket-only (Ticketmaster fulfills; no EP email).
import BundleConfirmation from '../../components/BundleConfirmation.vue'
import { buildBundleCart, CONTRACTED_HOTELS } from '../../lib/bundles.js'
import { deriveTiers } from '../../lib/seatmap.js'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const tier = deriveTiers(event)[1]
const bundleCart = buildBundleCart({ event, tier, quantity: 2, hotel: CONTRACTED_HOTELS[1], nights: 1 })
const ticketCart = buildBundleCart({ event, tier, quantity: 2 })

// A package cart with an experience line item.
const packageCart = {
  items: [
    { type: 'ticket', label: 'Legends Stadium Tour · Club × 2', sublabel: event.venue?.name, amount: 750 },
    { type: 'hotel', label: 'The Westin · Deluxe King', sublabel: '1 night', amount: 289 },
    { type: 'experience', label: 'Guided stadium tour + field photo', sublabel: 'Signature experience', amount: 240 },
  ],
  subtotal: 1279, fees: 135, taxes: 115, total: 1529, currency: 'USD',
}

export default {
  title: 'Ticketing & Bundles/Confirmation/Bundle Confirmation',
  component: BundleConfirmation,
  parameters: { layout: 'centered' },
}

export const TicketPlusHotel = {
  name: 'Ticket + Hotel (dual-email)',
  render: () => ({
    components: { BundleConfirmation },
    setup: () => ({ event, cart: bundleCart }),
    template: `<BundleConfirmation order-number="EP-7Q4M2X" :event="event" :cart="cart" email="hello@girardjustin.com" variant="bundle" />`,
  }),
}

export const Package = {
  name: 'Experience package',
  render: () => ({
    components: { BundleConfirmation },
    setup: () => ({ event, cart: packageCart }),
    template: `<BundleConfirmation order-number="EP-9F3K1P" :event="event" :cart="cart" email="hello@girardjustin.com" variant="package" />`,
  }),
}

export const TicketOnly = {
  name: 'Ticket only',
  render: () => ({
    components: { BundleConfirmation },
    setup: () => ({ event, cart: ticketCart }),
    template: `<BundleConfirmation order-number="EP-2B8H5W" :event="event" :cart="cart" email="hello@girardjustin.com" variant="ticket-only" />`,
  }),
}
