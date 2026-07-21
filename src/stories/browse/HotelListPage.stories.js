// BROWSE HOTELS / Book Reservation — the composed hotel-list (search results)
// page for the individual reservation flow, wrapped in the app shell. Two widget
// states: Teams Booking Widget (Registered Team(s) field) and Core Booking Widget
// (no team field). The booking-type selector is hidden here (the flow is fixed).
import HotelListPage from '../../components/browse/HotelListPage.vue'
import PageFrame from '../../components/PageFrame.vue'

export default {
  title: 'Browse Hotels/Book Reservation',
  component: HotelListPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Hotel List — Book Reservation
The full **search results** page for the **Book Reservation** flow inside the app
shell — Global Nav → Hero Banner → Booking Widget (below the banner) → results
toolbar → 3-column body (filters · results · display ads).

Two widget states:
- **Teams Booking Widget** — includes the Registered Team(s) field.
- **Core Booking Widget** — no team field.

The **booking-type** selector is hidden on this page (the flow is already fixed).

Use the **\`count\`** control to pad the matching results with synthesized hotels
and stress-test the filters/results list at scale (default keeps the curated sample).
` } } },
  argTypes: {
    count: {
      name: 'Results (count)',
      description: 'Pad the matching results section up to N hotels to stress-test the filters + results list.',
      control: { type: 'range', min: 3, max: 60, step: 1 },
    },
  },
  args: { count: 9 },
}

const page = (showTeams) => (args) => ({
  components: { PageFrame, HotelListPage },
  setup: () => ({ showTeams, args }),
  template: `<page-frame cart-mode="reserve"><hotel-list-page flow="reserve" :show-teams="showTeams" :count="args.count" /></page-frame>`,
})

/** Book Reservation list page — Teams Booking Widget. */
export const TeamsBookingWidget = { name: 'Teams Booking Widget', render: page(true) }

/** Book Reservation list page — Core Booking Widget (no team field). */
export const CoreBookingWidget = { name: 'Core Booking Widget', render: page(false) }
