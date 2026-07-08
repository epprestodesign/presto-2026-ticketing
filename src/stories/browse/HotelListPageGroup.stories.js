// BROWSE HOTELS / Group Block — the composed hotel-list (search results) page for
// the group-block flow, wrapped in the app shell. Two widget states: Teams
// Booking Widget and Core Booking Widget. Booking-type selector hidden (flow fixed).
import HotelListPage from '../../components/browse/HotelListPage.vue'
import PageFrame from '../../components/PageFrame.vue'

export default {
  title: 'Browse Hotels/Group Block',
  component: HotelListPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Hotel List — Group Block
The full **search results** page for the **Group Block** flow inside the app shell
— Global Nav → Hero Banner → Booking Widget (below the banner) → results toolbar →
3-column body (filters · results · display ads).

Two widget states:
- **Teams Booking Widget** — includes the Registered Team(s) field.
- **Core Booking Widget** — no team field.

The **booking-type** selector is hidden on this page (the flow is already fixed).
` } } },
}

const page = (showTeams) => () => ({
  components: { PageFrame, HotelListPage },
  setup: () => ({ showTeams }),
  template: `<page-frame cart-mode="hold"><hotel-list-page flow="group" :show-teams="showTeams" /></page-frame>`,
})

/** Group Block list page — Teams Booking Widget. */
export const TeamsBookingWidget = { name: 'Teams Booking Widget', render: page(true) }

/** Group Block list page — Core Booking Widget (no team field). */
export const CoreBookingWidget = { name: 'Core Booking Widget', render: page(false) }
