// Aug 4 Changes / Option A / Package Details / Hotel Availability
import HotelAvailability from '../src/components/HotelAvailability.vue'
import { hotels, canvas } from './_fixtures.js'

const meta = {
  title: 'Aug 4 Changes/Option A/Package Details/Hotel Availability',
  component: HotelAvailability,
  decorators: [canvas('980px')],
  parameters: {
    docs: {
      description: {
        component:
          "The carousel inside a package row's Availability panel: one photo card per hotel " +
          'the package covers, with its rating, walking distance, price against the package ' +
          'and rooms left. Every card is a link — clicking it, or the brand beneath, opens ' +
          'the read-only Hotel Details page in a new tab. Dragging the track sideways is ' +
          "suppressed so a drag doesn't fire the link.",
      },
    },
  },
  argTypes: { nights: { control: { type: 'number', min: 1, max: 5 } } },
}
export default meta

const render = (args) => ({
  components: { HotelAvailability },
  setup: () => ({ hotels: args.hotels ?? hotels, nights: args.nights ?? 1 }),
  template: '<hotel-availability :hotels="hotels" :nights="nights" />',
})

export const Playground = { render, args: { nights: 1 } }

/** All four hotels — the track overflows, so arrows and dots appear. */
export const FourHotels = { render, args: {} }

/** Two hotels fit without scrolling: no arrows, no dots. */
export const NoOverflow = { render, args: { hotels: hotels.slice(0, 2) } }

/** A longer stay changes the nightly maths behind each card. */
export const TwoNights = { render, args: { nights: 2 } }
