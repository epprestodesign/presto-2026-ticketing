// TICKETING & BUNDLES / Seat Map & View / Seat Listings — the SeatGeek-style
// browse experience: a listings rail (price histogram + rows with deal scores)
// paired with the view-from-seat and the interactive map. All listings are
// prototype data generated from a real Ticketmaster event.
import { ref, computed } from 'vue'
import SeatListingRow from '../../components/SeatListingRow.vue'
import PriceHistogram from '../../components/PriceHistogram.vue'
import ViewFromSeat from '../../components/ViewFromSeat.vue'
import SeatMap from '../../components/SeatMap.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { generateListings, priceDistribution } from '../../lib/seatListings.js'

const event = fixtureEvents.find((e) => /stadium|field/i.test(e.venue?.name || '')) || fixtureEvents[1] || fixtureEvents[0]

export default {
  title: 'Ticketing & Bundles/Seat Map & View/Seat Listings',
  parameters: { layout: 'fullscreen' },
}

export const Browser = {
  render: () => ({
    components: { SeatListingRow, PriceHistogram, ViewFromSeat, SeatMap },
    setup() {
      const listings = generateListings(event, { count: 16 })
      const dist = priceDistribution(listings)
      const selectedId = ref(listings[0].id)
      const selected = computed(() => listings.find((l) => l.id === selectedId.value) || listings[0])
      return { event, listings, dist, selectedId, selected, pick: (l) => (selectedId.value = l.id) }
    },
    template: `
      <div style="display:grid;grid-template-columns:minmax(320px,420px) 1fr;gap:0;height:100vh;font-family:var(--ds-font-family);">
        <!-- Listings rail -->
        <div style="display:flex;flex-direction:column;border-right:1px solid var(--ds-color-border);min-height:0;">
          <div style="padding:20px 20px 12px;">
            <div style="font-weight:700;color:var(--ds-color-text);">Your seats, hosted by EventPipe</div>
            <div style="font-size:13px;color:var(--ds-color-text-subtle);margin-bottom:12px;">{{ listings.length }} seats held for our guests · {{ event.venue?.name }}</div>
            <PriceHistogram :bins="dist.bins" :min="dist.min" :max="dist.max" />
          </div>
          <div style="overflow-y:auto;padding:4px 20px 20px;display:flex;flex-direction:column;gap:10px;min-height:0;">
            <SeatListingRow v-for="l in listings" :key="l.id" :listing="l" :selected="l.id === selectedId" @select="pick" />
          </div>
        </div>

        <!-- View from seat + map -->
        <div style="padding:24px;overflow-y:auto;display:flex;flex-direction:column;gap:24px;background:var(--ds-color-surface-canvas);">
          <div style="max-width:520px;">
            <ViewFromSeat :photo="selected.photo" :section="selected.section" :row="selected.row"
                          :deal-score="selected.dealScore" :price="selected.priceWithFees" />
          </div>
          <div style="max-width:560px;">
            <SeatMap :event="event" kind="stadium" center-label="FIELD" />
          </div>
        </div>
      </div>
    `,
  }),
}
