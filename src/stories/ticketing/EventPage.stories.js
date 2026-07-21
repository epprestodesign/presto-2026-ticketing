// TICKETING & BUNDLES / Event & Tickets / Event Page — the full event page as
// one screen (scope 3.2, T-01…T-04): the client-appreciation event hero on top,
// then ticket-category selection with prices, availability, and quantities —
// exactly how the ticketing flow opens.
import { ref } from 'vue'
import EventHero from '../../components/EventHero.vue'
import TicketTierList from '../../components/TicketTierList.vue'
import JourneyStepper from '../../components/JourneyStepper.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]

export default {
  title: 'Ticket Map/Components/Event & Tickets/Event Page',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The event page as the ticketing flow actually opens it — the client-appreciation event hero (name, date, venue) above ticket-category selection (price, availability, quantity). Real Ticketmaster event; prototype pricing/inventory.',
      },
    },
  },
}

export const Default = {
  name: 'Event Page',
  render: () => ({
    components: { EventHero, TicketTierList, JourneyStepper },
    setup() {
      const selection = ref(null)
      return { event, selection, onContinue: (payload) => (selection.value = payload) }
    },
    template: `
      <div style="min-height:100vh;background:var(--ds-color-surface-canvas);">
        <EventHero :event="event" />
        <div style="max-width:720px;margin:0 auto;padding:28px 24px 64px;">
          <JourneyStepper :steps="['Tickets','Seats','Hotel','Cart','Checkout','Confirmation']" :current="0" />
          <div style="margin-top:28px;">
            <h2 style="font-family:var(--ds-font-family);margin:0 0 4px;font-size:22px;color:var(--ds-color-text);">Choose your tickets</h2>
            <p style="font-family:var(--ds-font-family);margin:0 0 20px;color:var(--ds-color-text-subtle);">EventPipe is hosting — pick your level, and we'll help you lock in exact seats and a hotel next.</p>
            <TicketTierList :event="event" @continue="onContinue" />
          </div>
        </div>
      </div>
    `,
  }),
}
