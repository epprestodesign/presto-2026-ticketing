// TICKETING & BUNDLES / Event & Tickets / Ticket Tiers — the ticket-type picker:
// choose a category (name / description / price / availability) and a quantity
// per tier, with a running subtotal and a Continue CTA. Sold-out tiers are clearly
// marked and unselectable. Prototype pricing derived from a real Ticketmaster event.
import TicketTierList from '../../components/TicketTierList.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]

export default {
  title: 'Ticket Map/Components/Event & Tickets/Ticket Tiers',
  component: TicketTierList,
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  render: () => ({
    components: { TicketTierList },
    setup() {
      return { event, onContinue: (sel) => console.log('continue', sel) }
    },
    template: `
      <div style="max-width:640px;margin:0 auto;padding:28px;">
        <TicketTierList :event="event" @continue="onContinue" />
      </div>
    `,
  }),
}
