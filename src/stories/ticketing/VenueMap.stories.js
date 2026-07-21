// TICKETING & BUNDLES / Seat Map & View / Venue Map (Ticketmaster) — a Google-
// Maps-style interactive seating map on the REAL Gillette Stadium vector map
// (downloaded from Ticketmaster's maps API, bundled locally). Pan, zoom, and
// clickable price pins with hypothetical prototype inventory.
import { ref } from 'vue'
import VenueMap from '../../components/VenueMap.vue'
import { gillettePins } from '../../lib/gilletteMap.js'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /gillette/i.test(e.venue?.name || '')) || fixtureEvents[0]
const pins = gillettePins(event)

export default {
  title: 'Ticket Map/Components/Seat Map & View/Venue Map (Ticketmaster)',
  component: VenueMap,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Pick your seats for EventPipe’s client-appreciation outing at Gillette Stadium — a Google-Maps-style interactive map on the **real Gillette Stadium vector map** from Ticketmaster (bundled locally — Ticketmaster’s live map endpoint is anti-bot protected, so we self-host the SVG). Drag to pan (with flick momentum), scroll/buttons to zoom, and tap a price pin to preview a seat. Prices & inventory are hypothetical prototype data — the Ticketmaster feed provides the geometry only.',
      },
    },
  },
}

export const InteractiveMap = {
  name: 'Live venue map',
  render: () => ({
    components: { VenueMap },
    setup() {
      const selectedId = ref(null)
      return { event, pins, selectedId, onSelect: () => {} }
    },
    template: `
      <div style="max-width:820px;margin:0 auto;padding:24px;">
        <h2 style="font-family:var(--ds-font-family);margin:0 0 4px;font-size:22px;color:var(--ds-color-text);">{{ event.name }}</h2>
        <p style="font-family:var(--ds-font-family);margin:0 0 16px;color:var(--ds-color-text-subtle);">{{ event.venue?.name }} · EventPipe is hosting — pick your seats on the map</p>
        <VenueMap :event="event" :pins="pins" :initial-scale="1.8" v-model="selectedId" @select="onSelect" />
      </div>
    `,
  }),
}
