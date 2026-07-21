// TICKET MAP / Browse Tickets — the SeatGeek-style two-pane ticket experience for
// the Patriots game, assembled from our own assets: an "Authenticated NFL Tickets"
// listings rail (filter bar + sort + seat photos + section/row + price) beside the
// interactive Gillette VenueMap with live price pins. Prototype data generated
// from the real Ticketmaster event.
import TicketMap from '../../components/TicketMap.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { generateListings } from '../../lib/seatListings.js'
import { gillettePins } from '../../lib/gilletteMap.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const listings = generateListings(event, { count: 18 })
const pins = gillettePins(event)

export default {
  title: 'Ticket Map/Browse Tickets',
  component: TicketMap,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'The unified **Ticket Map** — a SeatGeek-style two-pane browse experience for the Patriots v Bills game, built from our own components (SeatListingRow, VenueMap). Left: an Authenticated NFL Tickets rail with a filter bar (quantity, price, seat perks, instant delivery), sort, and seat listings. Right: the interactive Gillette seat map with live price pins and pan/zoom. Selecting a listing drives the sticky Continue summary. Prototype pricing/inventory.' } },
  },
}

export const Default = {
  name: 'Browse Tickets',
  render: () => ({
    components: { TicketMap },
    setup: () => ({ event, listings, pins }),
    template: `<TicketMap :event="event" :listings="listings" :pins="pins" @continue="() => {}" />`,
  }),
}
