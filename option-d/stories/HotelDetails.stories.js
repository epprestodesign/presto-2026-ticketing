// Aug 5 Changes / Option D / Hotel Details (read-only)
import HotelDetailsScreen from '../src/screens/HotelDetailsScreen.vue'
import { journey } from '../src/store.js'

const meta = {
  title: 'Aug 5 Changes/Option D/Hotel Details',
  component: HotelDetailsScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A **read-only** reference view of a contracted hotel, on the library\'s own ' +
          '`Hotel Details / Book Reservation` page template (`HotelDetailPage`).\n\n' +
          '**Optional, and never a step of the flow.** Option D\'s journey is Landing → Packages → ' +
          'Checkout; this opens in its **own tab** from any mention of a hotel, so the screen ' +
          'behind it keeps its state. Looking a property up should never cost the guest their ' +
          'place in the flow.\n\n' +
          'Read-only means read-only: the template ships per-room "Reserve Room" CTAs, a ' +
          'back-to-results link and a search band, and all three are suppressed, with a banner ' +
          'saying why. No stepper either — it is off-flow at stage `-1`.',
      },
    },
  },
}
export default meta

const render = (args) => ({
  components: { HotelDetailsScreen },
  setup() { journey.activeHotelId = args.hotelId; return {} },
  template: '<hotel-details-screen />',
})

/** The Westin — the package's Deluxe King sleeps 2. */
export const Westin = { render, args: { hotelId: 'westin' } }

/** The Ritz-Carlton — the Carlton Suite sleeps 4. */
export const RitzCarlton = { render, args: { hotelId: 'ritz' } }
