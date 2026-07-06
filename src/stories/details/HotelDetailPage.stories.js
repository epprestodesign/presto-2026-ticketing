// HOTEL DETAILS / Book Reservation / Hotel Detail Page — a section wireframe
// (Template) plus a fully-rendered example (Full Example) with real imagery and
// detailed rooms for the single-reservation flow.
import HotelDetailPage from '../../components/details/HotelDetailPage.vue'
import { wireframe } from './_detail-wireframe.js'
import { hotelBase, reserveRooms } from './_detail-data.js'

export default {
  title: 'Hotel Details/Book Reservation/Hotel Detail Page',
  component: HotelDetailPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Hotel Detail Page — Book Reservation
**Template** shows the section layout as labeled placeholders. **Full Example** is
the fully-composed page — real hero gallery, summary header, the Book Reservation
**Rooms** carousel (per-night rooms-left, price/room/night + total, Reserve Room),
and about / amenities / policies.

> The summary mini-map needs a Google Maps API key at runtime.
` } } },
}

const roomsSection = {
  n: 'Rooms — Select Your Room (Book Reservation)',
  d: 'Horizontal carousel of Book Reservation room cards: per-night rooms-left, price per room / night + stay total, and a "Reserve Room" CTA.',
}

/** Section template — placeholder blocks in order. */
export const Template = { render: () => wireframe('Book Reservation', roomsSection) }

/** Full rendered page — real imagery + detailed rooms (available / limited / sold out). */
export const FullExample = {
  name: 'Full Example',
  render: () => ({
    components: { HotelDetailPage },
    setup: () => ({ args: { ...hotelBase, rooms: reserveRooms, roomsFlow: 'reserve', roomsSubtitle: 'Prices shown are per room per night for your selected dates.' } }),
    template: `<hotel-detail-page v-bind="args" />`,
  }),
}
