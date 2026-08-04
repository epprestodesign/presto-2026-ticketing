// Aug 4 Changes / Booking Widget
import BookingWidget from '../src/components/BookingWidget.vue'
import LibraryBookingWidget from '@lib/components/BookingWidget.vue'
import { canvas } from './_fixtures.js'

const meta = {
  title: 'Aug 4 Changes/Booking Widget',
  component: BookingWidget,
  decorators: [canvas('1100px')],
  parameters: {
    docs: {
      description: {
        component: `The prototype's fork of the library booking widget. Three changes:

1. **Guests dropdown** — the Travelers popover (adults/children/rooms steppers) is a plain
   **1–8+ select**, tied to the packages page's own Guests control through the journey store.
2. **Gameday dates** — the range defaults to the event weekend (**Sep 19 – 21**) computed from
   the event date, instead of today + 7 → + 10 days, which drifted away from the game.
3. **No flexible-date pills** — this is a one-game trip, not a flexible search.

Wired in by a \`resolveId\` override, so the library pages that embed the widget pick it up
in this app only.`,
      },
    },
  },
}
export default meta

/** The fork, as the prototype's Landing page renders it. */
export const GuestsDropdown = {
  render: () => ({
    components: { BookingWidget },
    template: '<booking-widget :tabs="false" :show-mode="false" :show-teams="true" />',
  }),
}

/** The Core widget (no group field) — Browse Hotels uses this shape. */
export const CoreWidget = {
  render: () => ({
    components: { BookingWidget },
    template: '<booking-widget :tabs="false" :show-mode="false" :show-teams="false" show-dates />',
  }),
}

/** The library original, for comparison: Travelers popover and flexible-date pills. */
export const LibraryOriginal = {
  name: 'Library original (before)',
  render: () => ({
    components: { LibraryBookingWidget },
    template: '<library-booking-widget :tabs="false" :show-mode="false" :show-teams="true" />',
  }),
}
