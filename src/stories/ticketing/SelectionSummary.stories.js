// TICKETING & BUNDLES / Selection Summary — the checkout rail, pre-populated.
import { ref } from 'vue'
import SeatMapSummary from '../../components/SeatMapSummary.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /stadium|field/i.test(e.venue?.name || '')) || fixtureEvents[1] || fixtureEvents[0]

export default {
  title: 'Ticketing & Bundles/Selection Summary',
  component: SeatMapSummary,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Your running summary for the outing — the seats you’ve picked for EventPipe’s client-appreciation game, ready to roll into the bundled ticket + hotel checkout. Pricing shown is hypothetical prototype data.',
      },
    },
  },
}

export const Default = {
  render: () => ({
    components: { SeatMapSummary },
    setup() {
      const selection = {
        section: { id: 'club-3', label: 'CLUB3', tierName: 'Club Level', colorVar: '--ds-palette-amber-500', price: 245, currency: 'USD', available: true },
        tier: { id: 'club', name: 'Club Level' },
      }
      const qty = ref(3)
      return { event, selection, qty }
    },
    template: `<div style="width:380px;max-width:100%;"><SeatMapSummary :event="event" :selection="selection" v-model="qty" /></div>`,
  }),
}

export const EmptyState = {
  render: () => ({
    components: { SeatMapSummary },
    setup: () => ({ event, qty: ref(2) }),
    template: `<div style="width:380px;max-width:100%;"><SeatMapSummary :event="event" :selection="null" v-model="qty" /></div>`,
  }),
}
