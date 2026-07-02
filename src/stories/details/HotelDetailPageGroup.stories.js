// HOTEL DETAILS / Group Block / Hotel Detail Page — template/wireframe of the
// full detail screen: the sections in order as labeled placeholder blocks (no
// content). Same section order as Book Reservation; only Rooms differs.
import { wireframe } from './_detail-wireframe.js'

export default {
  title: 'Hotel Details/Group Block/Hotel Detail Page',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Hotel Detail Page — Group Block (template)
The page layout as a wireframe: each section is a labeled placeholder describing
its typical content, in render order. The **Rooms** section uses the Group Block
room cards. The individual sections are documented as their own stories under
Hotel Details.
` } } },
}

const roomsSection = {
  n: 'Rooms — Select Your Room (Group Block)',
  d: 'Horizontal carousel of Group Block room cards: "Rooms per Night" with quantity steppers, starting price, and an "Add to Cart" CTA.',
}

/** Section template — placeholder blocks in order (matches Book Reservation). */
export const Template = { render: () => wireframe('Group Block', roomsSection) }
