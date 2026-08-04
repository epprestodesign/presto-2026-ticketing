// Aug 4 Changes / Option C / Booking Widget
import BookingWidget from '../src/components/BookingWidget.vue'
import OptionABookingWidget from '../../option-a/src/components/BookingWidget.vue'
import { journey, setGuests, setRange } from '../src/store.js'
import { canvas } from './_fixtures.js'

const meta = {
  title: 'Aug 4 Changes/Option C/Booking Widget',
  component: BookingWidget,
  decorators: [canvas('1240px')],
  parameters: {
    docs: {
      description: {
        component:
          'The **Core Booking Widget** shape — dates and guests, no group field — sitting as the ' +
          'card tucked onto the bottom of the event hero.\n\n' +
          'Carried over from Option A, which forked the library widget to swap the Travelers ' +
          'popover (adults / children / rooms steppers) for a plain 1–8+ **Guests** dropdown. ' +
          'Two further changes here, both because Option C mounts the widget **directly on its ' +
          'board** rather than injecting it into library pages:\n\n' +
          '1. **No Search button.** In Option A the widget sits on a landing page, and Search is ' +
          'what navigates to results. Here the results are already on screen — every change ' +
          're-prices the board live — so a Search button would be a no-op the guest is invited ' +
          'to press.\n' +
          '2. **The date range writes to the store.** Option A keeps its range as local widget ' +
          'state. In Option C the nights multiply every room rate on the board, so the range has ' +
          'to be shared or the prices below would ignore the dates.\n\n' +
          'Unlike Option A, this is **not** wired in by a `resolveId` override — Option C ' +
          'overrides no library files at all. The board imports it directly.\n\n' +
          '_Interactive: these stories write to the real store, so changing the dates or guests ' +
          'here also moves the Package Grid stories._',
      },
    },
  },
}
export default meta

const render = () => ({
  components: { BookingWidget },
  setup: () => ({ journey }),
  template: `
    <div>
      <booking-widget :tabs="false" :show-mode="false" :show-teams="false" show-dates />
      <p style="margin:16px 2px 0;font-size:.875rem;color:var(--ds-color-text-subtle)">
        Store now holds <strong>{{ journey.nights }}</strong> night(s) and
        <strong>{{ journey.guests }}</strong> guest(s) — the board multiplies every room rate by the
        nights, and gives one free ticket per guest.
      </p>
    </div>
  `,
})

/** As the board renders it — the default gameday stay. */
export const CoreWidget = {
  render,
  play: () => { setRange({ from: '2026/09/19', to: '2026/09/20' }); setGuests(2) },
}

/** A three-night stay for a party of six — two rooms at either property. */
export const LongStayLargeParty = {
  render,
  play: () => { setRange({ from: '2026/09/18', to: '2026/09/21' }); setGuests(6) },
}

/**
 * Option A's widget, for comparison: same fields, but it keeps a **Search**
 * button (it has a landing page to search *from*) and its dates never leave the
 * component.
 */
export const OptionAForComparison = {
  name: 'Option A original (with Search)',
  render: () => ({
    components: { OptionABookingWidget },
    template: '<option-a-booking-widget :tabs="false" :show-mode="false" :show-teams="false" show-dates />',
  }),
}
