// Aug 5 Changes / Option D / Hotel Details
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
          "A reference view of a contracted hotel, on the library's own " +
          '`Hotel Details / Book Reservation` page template (`HotelDetailPage`).\n\n' +
          '**Off-flow, and opened in its own tab** from any mention of a hotel, so the screen ' +
          'behind it keeps its state. Looking a property up should never cost the guest their ' +
          'place in the flow. No stepper either — it sits at stage `-1`.\n\n' +
          '### The Aug 5 afternoon revision\n\n' +
          'This page used to be strictly read-only: the template\'s per-room "Reserve Room" CTA ' +
          'was suppressed, and **Room types at this property** ended in a `Price Details` link ' +
          'and nothing else. That made it a dead end — you could read everything about a hotel ' +
          'and still have to go back to the other tab to act on it.\n\n' +
          'The room card now **selects the package**, with the same experience the package cards ' +
          'give:\n\n' +
          '- the same **party-size select**, bound to the same store value, so it re-prices here ' +
          'and on the board alike\n' +
          '- the **package total, all in** — the number checkout will actually charge — with the ' +
          'room rate demoted to a sub-line\n' +
          '- `Select package` as the primary CTA, and **Price details** kept beside it as the ' +
          'secondary link\n\n' +
          'Selecting navigates **this** tab to checkout; the tab it was opened from is untouched.\n\n' +
          'The section around the card is still the template\'s — `RoomsCarousel` renders the ' +
          'heading and rules, and only its grid of room cards is suppressed, with Option D\'s ' +
          'card teleported into `#hdp-rooms` in its place so the Rooms tab still scrolls to it. ' +
          'The back-to-results link and search band stay suppressed: there is no results list to ' +
          'go back to and the stay is fixed.',
      },
    },
  },
  argTypes: {
    people: { control: { type: 'range', min: 1, max: 12, step: 1 } },
  },
}
export default meta

const render = (args) => ({
  components: { HotelDetailsScreen },
  setup() {
    journey.activeHotelId = args.hotelId
    journey.people = args.people ?? 2
    journey.tab = args.tab || 'overview'
    return {}
  },
  template: '<hotel-details-screen />',
})

/** The Westin — the package's Deluxe King sleeps 2, so a party of four takes two rooms. */
export const Westin = { render, args: { hotelId: 'westin', people: 4 } }

/** The Ritz-Carlton — the Carlton Suite sleeps 4, so the same party takes one. */
export const RitzCarlton = { render, args: { hotelId: 'ritz', people: 4 } }

/**
 * Opened on the **Rooms** tab, which is where the revision lands. Compare the room
 * card's footer with the one on *Package Pair* — same control, same price block,
 * same rhythm.
 */
export const RoomsTab = { render, args: { hotelId: 'westin', people: 4, tab: 'rooms' } }

/** A single traveller — one room at either property, and the package is priced for one. */
export const SingleTraveller = { render, args: { hotelId: 'ritz', people: 1 } }
