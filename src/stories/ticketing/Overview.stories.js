// TICKETING & BUNDLES / Overview — the headline: journey stepper + the real
// Gillette venue map (price pins) wired to the selection summary. Real
// Ticketmaster event + venue map; prototype pricing/inventory.
import { ref } from 'vue'
import JourneyStepper from '../../components/JourneyStepper.vue'
import VenueMap from '../../components/VenueMap.vue'
import SeatMapSummary from '../../components/SeatMapSummary.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { gillettePins } from '../../lib/gilletteMap.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const pins = gillettePins(event)

export default {
  title: 'Ticket Map/Overview',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Seat-selection experience for EventPipe’s client-appreciation outing — pick seats on the REAL Gillette Stadium map, and your ticket + hotel bundle rolls up in the summary. Event + venue map are real Ticketmaster; pricing and inventory are a clearly-labeled prototype layer.',
      },
    },
  },
}

export const Experience = {
  name: 'Overview',
  render: () => ({
    components: { JourneyStepper, VenueMap, SeatMapSummary },
    setup() {
      const selectedId = ref(null)
      const selection = ref(null)
      const qty = ref(2)
      // Adapt a VenueMap price pin into the SeatMapSummary selection shape.
      const onSelect = (pin) => {
        selection.value = {
          section: { id: pin.id, label: pin.label, tierName: pin.tierName, colorVar: pin.colorVar, price: pin.price, currency: pin.currency, available: pin.available },
          tier: { id: pin.tierId, name: pin.tierName },
        }
      }
      return { event, pins, selectedId, selection, qty, onSelect }
    },
    template: `
      <div style="max-width:1080px;margin:0 auto;padding:28px;">
        <JourneyStepper :steps="['Tickets','Seats','Hotel','Cart','Checkout','Confirmation']" :current="1" />
        <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:28px;align-items:start;margin-top:28px;">
          <div>
            <h2 style="font-family:var(--ds-font-family);margin:0 0 4px;font-size:24px;color:var(--ds-color-text);">{{ event.name }}</h2>
            <p style="font-family:var(--ds-font-family);margin:0 0 20px;color:var(--ds-color-text-subtle);">Your seats for the game — {{ event.venue?.name }}. EventPipe is hosting, so pick where you’d like to sit and we’ll take care of the rest.</p>
            <VenueMap :event="event" :pins="pins" v-model="selectedId" @select="onSelect" />
          </div>
          <SeatMapSummary :event="event" :selection="selection" v-model="qty" />
        </div>
      </div>
    `,
  }),
}
