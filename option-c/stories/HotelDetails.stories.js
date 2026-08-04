// Aug 4 Changes / Option C / Hotel Details (read-only)
import HotelDetailsScreen from '../src/screens/HotelDetailsScreen.vue'
import { journey } from '../src/store.js'

const meta = {
  title: 'Aug 4 Changes/Option C/Hotel Details',
  component: HotelDetailsScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A **read-only** reference view of a contracted hotel.\n\n' +
          'Never a stage of the journey. Every hotel name on the board — on the row heading and ' +
          'inside each tile — opens this page in **its own tab**, so the grid behind it keeps ' +
          'its dates and party size. Looking up a property should never cost the guest their ' +
          'place in the flow.\n\n' +
          'Read-only means read-only: nothing here books, prices or selects. There is no CTA, ' +
          'because every booking decision belongs to the tile that sent you here, and no ' +
          'stepper, because this is off-flow (stage `-1`). That is the same contract Option A\'s ' +
          'Hotel Details screen holds.\n\n' +
          'It lists the three packages the property carries so the page shows what it is part ' +
          'of — at the nightly rate, without offering to book any of them.',
      },
    },
  },
}
export default meta

const render = (args) => ({
  components: { HotelDetailsScreen },
  setup() {
    journey.activeHotelId = args.hotelId
    return {}
  },
  template: '<hotel-details-screen />',
})

/** The premium block — suites, club lounge, valet. */
export const RitzCarlton = { render, args: { hotelId: 'ritz' } }

/** The value block — closest to the gate. */
export const CourtyardByMarriott = { render, args: { hotelId: 'courtyard' } }
