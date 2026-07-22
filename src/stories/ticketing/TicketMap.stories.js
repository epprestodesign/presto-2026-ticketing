// TICKET MAP / Browse Tickets — the SeatGeek-style two-pane ticket experience for
// the Patriots game, assembled from our own assets: an "Authenticated NFL Tickets"
// listings rail (filter bar + sort + seat photos + section/row + price) beside the
// interactive Gillette VenueMap with live price pins. Prototype data generated
// from the real Ticketmaster event.
//
// The story exposes a live Storybook Control (`count`) so you can scale the
// listing board from a handful up to 200 offers and watch the price range,
// section, sort, and histogram filters handle a complex, real-world-sized data
// set in real time. Listings are venue-anchored — every offer maps to a real
// Gillette section and gets its own pin on the map.
import { computed, ref } from 'vue'
import TicketMap from '../../components/TicketMap.vue'
import TicketQuantityDialog from '../../components/TicketQuantityDialog.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { generateVenueListings, listingPins } from '../../lib/seatListings.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]

export default {
  title: 'Ticket Map/Browse Tickets',
  component: TicketMap,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'The unified **Ticket Map** — a SeatGeek-style two-pane browse experience for the Patriots v Bills game, built from our own components (SeatListingRow, VenueMap). Left: an Authenticated NFL Tickets rail with a filter bar (quantity, price + histogram, sections) and sort. Right: the interactive Gillette seat map with one live price pin per listing and pan/zoom. Use the **`count`** control to scale the board (default 100) and stress-test how the filters handle a complex data set in real time. Prototype pricing/inventory.' } },
  },
  argTypes: {
    count: {
      name: 'Listings (count)',
      description: 'Number of ticket offers generated — drag to stress-test the filters against a complex data set.',
      control: { type: 'range', min: 10, max: 200, step: 5 },
    },
    maxQuantity: {
      name: 'Max tickets / order',
      control: { type: 'number', min: 1, max: 12 },
    },
  },
  args: { count: 100, maxQuantity: 6 },
}

export const Default = {
  name: 'Browse Tickets',
  render: (args) => ({
    components: { TicketMap },
    setup() {
      // Reactive to the `count` control — recomputes the venue-anchored board and
      // its map pins whenever the slider moves.
      const listings = computed(() => generateVenueListings(event, { count: args.count }))
      const pins = computed(() => listingPins(listings.value))
      return { event, args, listings, pins }
    },
    // :key remounts TicketMap when the board size changes so its price
    // distribution + range reset cleanly to the new data set.
    template: `<TicketMap :key="args.count + '-' + args.maxQuantity" :event="event" :listings="listings" :pins="pins" :max-quantity="args.maxQuantity" @continue="() => {}" />`,
  }),
}

/**
 * The Ticket Map with the "how many tickets?" quantity prompt overlaid on load —
 * the guest picks a party size before browsing, which seeds the map's quantity.
 */
export const WithQuantityPrompt = {
  name: 'With Quantity Prompt',
  render: (args) => ({
    components: { TicketMap, TicketQuantityDialog },
    setup() {
      const listings = computed(() => generateVenueListings(event, { count: args.count }))
      const pins = computed(() => listingPins(listings.value))
      const promptOpen = ref(true)
      const chosenQty = ref(2)
      const onSelect = (n) => { chosenQty.value = n; promptOpen.value = false }
      return { event, args, listings, pins, promptOpen, chosenQty, onSelect }
    },
    template: `
      <div style="position:relative;height:100vh;">
        <TicketMap :key="chosenQty" :event="event" :listings="listings" :pins="pins" :max-quantity="args.maxQuantity" :initial-quantity="chosenQty" @continue="() => {}" />
        <q-dialog v-model="promptOpen">
          <TicketQuantityDialog :selected="chosenQty" :available="6" :max="8" @select="onSelect" @skip="promptOpen = false" @close="promptOpen = false" />
        </q-dialog>
      </div>`,
  }),
}
