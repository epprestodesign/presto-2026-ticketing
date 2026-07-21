// TICKETING & BUNDLES / Bundle Cart & Checkout / Bundle Cart — the unified cart
// (scope 3.5): itemized ticket + hotel line items with one transparent total.
import BundleCart from '../../components/BundleCart.vue'
import { buildBundleCart, CONTRACTED_HOTELS } from '../../lib/bundles.js'
import { deriveTiers } from '../../lib/seatmap.js'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /stadium|field/i.test(e.venue?.name || '')) || fixtureEvents[1] || fixtureEvents[0]
const tier = deriveTiers(event)[1]

const bundled = buildBundleCart({ event, tier, quantity: 2, hotel: CONTRACTED_HOTELS[1], nights: 1 })
const ticketsOnly = buildBundleCart({ event, tier, quantity: 2 })

export default {
  title: 'Ticket Map/Components/Bundle Cart & Checkout/Bundle Cart',
  component: BundleCart,
  parameters: { layout: 'centered' },
}

export const TicketPlusHotel = {
  name: 'Ticket + Hotel',
  render: () => ({
    components: { BundleCart },
    setup: () => ({ cart: bundled, savings: 58 }),
    template: `<div style="width:400px;max-width:100%;"><BundleCart :cart="cart" :savings="savings" /></div>`,
  }),
}

export const TicketsOnly = {
  name: 'Tickets only',
  render: () => ({
    components: { BundleCart },
    setup: () => ({ cart: ticketsOnly }),
    template: `<div style="width:400px;max-width:100%;"><BundleCart :cart="cart" /></div>`,
  }),
}
