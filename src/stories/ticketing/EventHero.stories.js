// TICKETING & BUNDLES / Event & Tickets / Event Hero — the event-page hero banner
// (scope T-01: event name, date, venue, description). Framed as an EventPipe
// client-appreciation outing over the event image (or a bundled gameday stand-in).
import EventHero from '../../components/EventHero.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]

export default {
  title: 'Ticketing & Bundles/Event & Tickets/Event Hero',
  component: EventHero,
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  render: () => ({
    components: { EventHero },
    setup: () => ({ event }),
    template: `<EventHero :event="event" />`,
  }),
}
