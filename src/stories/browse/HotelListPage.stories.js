// BROWSE HOTELS / Book Reservation — the fully composed hotel-list (search
// results) page for the individual reservation flow, wrapped in the app shell
// (Global Nav + footer): Hero → Booking Widget search → results toolbar →
// filters sidebar · results list · display ads.
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
shell — Global Nav → Hero Banner → Booking Widget (reservations) → results
toolbar (count + Sort) → 3-column body: filters sidebar · hotel results (grouped
into available / doesn't-match-filters / no-availability sections) · display ads.
` } } },
}

/** The full Book Reservation hotel list page. */
export const Page = {
  render: () => ({
    components: { PageFrame, HotelListPage },
    template: `<page-frame cart-mode="reserve"><hotel-list-page flow="reserve" /></page-frame>`,
  }),
}
