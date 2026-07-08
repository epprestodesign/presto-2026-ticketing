// HOTEL DETAILS / Book Reservation — the fully-rendered hotel detail page for the
// single-reservation flow, wrapped in the app shell (Global Nav + footer).
import HotelDetailPage from '../../components/details/HotelDetailPage.vue'
import PageFrame from '../../components/PageFrame.vue'
import { hotelBase, reserveRooms } from './_detail-data.js'

export default {
  title: 'Hotel Details/Book Reservation',
  component: HotelDetailPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Hotel Detail Page — Book Reservation
The fully-composed page inside the app shell — Global Nav, real hero gallery,
summary header, the Book Reservation **Rooms** carousel (per-night rooms-left,
price/room/night + total, Reserve Room), about / amenities / policies, and footer.

> The summary mini-map needs a Google Maps API key at runtime.
` } } },
}

/** Full rendered page — real imagery + detailed rooms (available / limited / sold out). */
export const Page = {
  render: () => ({
    components: { PageFrame, HotelDetailPage },
    setup: () => ({ args: { ...hotelBase, rooms: reserveRooms, roomsFlow: 'reserve', roomsSubtitle: 'Prices shown are per room per night for your selected dates.' } }),
    template: `<page-frame cart-mode="reserve"><hotel-detail-page v-bind="args" /></page-frame>`,
  }),
}
