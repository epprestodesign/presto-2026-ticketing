// TICKETING & BUNDLES / Confirmation / Bundle Confirmation — post-payment (scope
// 3.6): EP order number, all components, and the v1 dual-email notice.
import BundleConfirmation from '../../components/BundleConfirmation.vue'
import { buildBundleCart, CONTRACTED_HOTELS } from '../../lib/bundles.js'
import { deriveTiers } from '../../lib/seatmap.js'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /stadium|field/i.test(e.venue?.name || '')) || fixtureEvents[1] || fixtureEvents[0]
const tier = deriveTiers(event)[1]
const cart = buildBundleCart({ event, tier, quantity: 2, hotel: CONTRACTED_HOTELS[1], nights: 1 })

export default {
  title: 'Ticketing & Bundles/Confirmation/Bundle Confirmation',
  component: BundleConfirmation,
  parameters: { layout: 'centered' },
}

export const WithHotel = {
  name: 'Bundle (dual-email)',
  render: () => ({
    components: { BundleConfirmation },
    setup: () => ({ event, cart }),
    template: `<BundleConfirmation order-number="EP-7Q4M2X" :event="event" :cart="cart" email="hello@girardjustin.com" :has-hotel="true" />`,
  }),
}
