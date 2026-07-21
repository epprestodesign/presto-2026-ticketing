// TICKETING & BUNDLES / Seat Map & View / Static Seat Map — the REAL Ticketmaster
// static seat-map image.
import SeatMapStatic from '../../components/SeatMapStatic.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const arenaEvent = fixtureEvents.find((e) => /sphere|arena|garden/i.test(e.venue?.name || '')) || fixtureEvents[0]

export default {
  title: 'Ticket Map/Components/Seat Map & View/Static Seat Map',
  component: SeatMapStatic,
  parameters: { layout: 'centered' },
}

export const Default = {
  render: () => ({
    components: { SeatMapStatic },
    setup: () => ({ event: arenaEvent }),
    template: `<div style="width:520px;max-width:100%;"><SeatMapStatic :event="event" /></div>`,
  }),
}
