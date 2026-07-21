// TICKETING & BUNDLES / Seat Map & View / View From Seat — SeatGeek-style
// "look at the seat you're buying". Stock (Unsplash) photos stand in for real
// seat views; attribution is rendered per Unsplash guidelines.
import ViewFromSeat from '../../components/ViewFromSeat.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { generateListings } from '../../lib/seatListings.js'

const event = fixtureEvents.find((e) => /stadium|field/i.test(e.venue?.name || '')) || fixtureEvents[1] || fixtureEvents[0]
const top = generateListings(event, { count: 12 })[0]

export default {
  title: 'Ticketing & Bundles/Seat Map & View/View From Seat',
  component: ViewFromSeat,
  parameters: { layout: 'centered' },
}

export const Default = {
  render: () => ({
    components: { ViewFromSeat },
    setup: () => ({ top }),
    template: `
      <div style="width:460px;max-width:100%;">
        <ViewFromSeat :photo="top.photo" :section="top.section" :row="top.row"
                      :deal-score="top.dealScore" :price="top.priceWithFees" @look-around="() => {}" />
      </div>
    `,
  }),
}
