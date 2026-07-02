// HOTEL DETAILS / Book Reservation / Hotel Detail Page — template/wireframe of
// the full detail screen: the sections in order as labeled placeholder blocks
// (no content), describing what each area holds. Same order as Group Block.
import { wireframe } from './_detail-wireframe.js'

export default {
  title: 'Hotel Details/Book Reservation/Hotel Detail Page',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Hotel Detail Page — Book Reservation (template)
The page layout as a wireframe: each section is a labeled placeholder describing
its typical content, in render order. The **Rooms** section uses the Book
Reservation room cards. The individual sections are documented as their own
stories under Hotel Details.
` } } },
}

const roomsSection = {
  n: 'Rooms — Select Your Room (Book Reservation)',
  d: 'Horizontal carousel of Book Reservation room cards: per-night rooms-left, price per room / night + stay total, and a "Reserve Room" CTA.',
}

/** Section template — placeholder blocks in order. */
export const Template = { render: () => wireframe('Book Reservation', roomsSection) }
