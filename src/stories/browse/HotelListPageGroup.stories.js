// BROWSE HOTELS / Group Block — the fully composed hotel-list (search results)
// page for the group-block flow, wrapped in the app shell (Global Nav + footer):
// Hero → Booking Widget search → results toolbar → filters sidebar · results
// list · display ads.
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
The full **search results** page for the **Group Block** flow inside the app
shell — Global Nav → Hero Banner → Booking Widget (group) → results toolbar
(count + Sort) → 3-column body: filters sidebar · hotel results (rooms-matching
plus a combined "may not match / not enough rooms" section) · display ads.
` } } },
}

/** The full Group Block hotel list page. */
export const Page = {
  render: () => ({
    components: { PageFrame, HotelListPage },
    template: `<page-frame cart-mode="hold"><hotel-list-page flow="group" /></page-frame>`,
  }),
}
