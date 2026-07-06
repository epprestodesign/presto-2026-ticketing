// HOTEL DETAILS / Group Block / Hotel Detail Page — a section wireframe
// (Template) plus a fully-rendered example (Full Example) with real imagery and
// detailed rooms for the group-block flow.
import HotelDetailPage from '../../components/details/HotelDetailPage.vue'
import { wireframe } from './_detail-wireframe.js'
import { hotelBase, groupRooms } from './_detail-data.js'

export default {
  title: 'Hotel Details/Group Block/Hotel Detail Page',
  component: HotelDetailPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Hotel Detail Page — Group Block
**Template** shows the section layout as labeled placeholders. **Full Example** is
the fully-composed page — real hero gallery, summary header, the Group Block
**Rooms** carousel (per-night quantity steppers, starting price, Add to Cart),
and about / amenities / policies. Same section order as Book Reservation.
` } } },
}

const roomsSection = {
  n: 'Rooms — Select Your Room (Group Block)',
  d: 'Horizontal carousel of Group Block room cards: "Rooms per Night" with quantity steppers, starting price, and an "Add to Cart" CTA.',
}

/** Section template — placeholder blocks in order (matches Book Reservation). */
export const Template = { render: () => wireframe('Group Block', roomsSection) }

/** Full rendered page — real imagery + detailed rooms with per-night steppers. */
export const FullExample = {
  name: 'Full Example',
  render: () => ({
    components: { HotelDetailPage },
    setup: () => ({ args: { ...hotelBase, rooms: groupRooms, roomsFlow: 'group', roomsTitle: 'Hold Rooms for Your Group', roomsSubtitle: 'Choose how many rooms to hold each night.' } }),
    template: `<hotel-detail-page v-bind="args" />`,
  }),
}
