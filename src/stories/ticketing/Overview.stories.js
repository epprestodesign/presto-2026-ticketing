// TICKETING & BUNDLES / Overview — the headline: journey stepper + interactive
// seat map wired to the selection summary. Real Ticketmaster event; prototype
// sections/pricing (see src/lib/seatmap.js).
import { ref } from 'vue'
import JourneyStepper from '../../components/JourneyStepper.vue'
import SeatMap from '../../components/SeatMap.vue'
import SeatMapSummary from '../../components/SeatMapSummary.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /stadium|field/i.test(e.venue?.name || '')) || fixtureEvents[1] || fixtureEvents[0]

export default {
  title: 'Ticketing & Bundles/Overview',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Seat-selection experience for EventPipe’s client-appreciation outing — your ticket + hotel are bundled so you save on both. Event and static seat-map data are real Ticketmaster; the interactive bowl, sections, and prices are a clearly-labeled prototype layer. Ticketmaster does not expose seat geometry or per-seat pricing.',
      },
    },
  },
}

export const Experience = {
  name: 'Overview',
  render: () => ({
    components: { JourneyStepper, SeatMap, SeatMapSummary },
    setup() {
      const selectedId = ref(null)
      const selection = ref(null)
      const qty = ref(2)
      return { event, selectedId, selection, qty, onSelect: (p) => (selection.value = p) }
    },
    template: `
      <div style="max-width:1040px;margin:0 auto;padding:28px;">
        <JourneyStepper :steps="['Tickets','Seats','Hotel','Cart','Checkout','Confirmation']" :current="1" />
        <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:28px;align-items:start;margin-top:28px;">
          <div>
            <h2 style="font-family:var(--ds-font-family);margin:0 0 4px;font-size:24px;color:var(--ds-color-text);">{{ event.name }}</h2>
            <p style="font-family:var(--ds-font-family);margin:0 0 20px;color:var(--ds-color-text-subtle);">Your seats for the game — {{ event.venue?.name }}. EventPipe is hosting, so pick where you’d like to sit and we’ll take care of the rest.</p>
            <SeatMap :event="event" kind="stadium" center-label="FIELD" v-model="selectedId" @select="onSelect" />
          </div>
          <SeatMapSummary :event="event" :selection="selection" v-model="qty" />
        </div>
      </div>
    `,
  }),
}
