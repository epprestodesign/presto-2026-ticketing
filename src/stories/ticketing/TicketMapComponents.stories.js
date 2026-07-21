// TICKET MAP / Components / Browse Tickets — itemizes the individual building
// blocks that compose the unified Browse Tickets (SeatGeek-style) experience, so
// each can be reviewed/edited on its own: the all-inclusive Filters dialog, a
// seat Listing Row, the interactive Venue Map, and the Price Histogram.
// Prototype data.
import { ref } from 'vue'
import TicketFilters from '../../components/TicketFilters.vue'
import SeatListingRow from '../../components/SeatListingRow.vue'
import VenueMap from '../../components/VenueMap.vue'
import PriceHistogram from '../../components/PriceHistogram.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { generateListings, priceDistribution } from '../../lib/seatListings.js'
import { gillettePins } from '../../lib/gilletteMap.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const listings = generateListings(event, { count: 18 })
const dist = priceDistribution(listings)
const pins = gillettePins(event)

export default {
  title: 'Ticket Map/Components/Browse Tickets',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'The building blocks that compose the **Browse Tickets** experience — reviewed individually. Prototype pricing/inventory.' } },
  },
}

const pad = (inner, max = 720) => `<div style="max-width:${max}px;margin:0 auto;padding:24px;background:var(--ds-color-surface-canvas);min-height:100vh;font-family:var(--ds-font-family);">${inner}</div>`

/** The all-inclusive filters dialog (quantity, price + histogram, sections, levels, seat perks). */
export const FiltersDialog = {
  name: 'Filters Dialog',
  render: () => ({
    components: { TicketFilters },
    setup: () => ({ listings }),
    template: `<div style="display:flex;justify-content:center;padding:24px;background:var(--ds-color-surface-sunken);min-height:100vh;">
      <TicketFilters :listings="listings" @close="() => {}" @apply="() => {}" @clear="() => {}" />
    </div>`,
  }),
}

/** A single Authenticated-NFL-Tickets listing row (seat photo · section/row · price). */
export const ListingRow = {
  name: 'Listing Row',
  render: () => ({
    components: { SeatListingRow },
    setup() {
      const sel = ref(listings[0].id)
      return { listings: listings.slice(0, 4), sel, pick: (l) => (sel.value = l.id) }
    },
    template: pad(`<div style="display:flex;flex-direction:column;gap:10px;"><SeatListingRow v-for="l in listings" :key="l.id" :listing="l" :selected="l.id === sel" @select="pick" /></div>`, 460),
  }),
}

/** The interactive Gillette venue map with live price pins. */
export const VenueMapBlock = {
  name: 'Venue Map',
  render: () => ({
    components: { VenueMap },
    setup: () => ({ pins }),
    template: pad(`<VenueMap :pins="pins" :initial-scale="1.4" />`, 820),
  }),
}

/** The price distribution histogram used in the filters. */
export const Histogram = {
  name: 'Price Histogram',
  render: () => ({
    components: { PriceHistogram },
    setup: () => ({ dist }),
    template: pad(`<PriceHistogram :bins="dist.bins" :min="dist.min" :max="dist.max" :selected-min="dist.min" :selected-max="dist.max" />`, 460),
  }),
}
