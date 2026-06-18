// HOTEL DETAILS / Room Card — the vertical room-rate card used in the
// "Select Your Room" section of the hotel detail screen. Extracted from the
// (now horizontal-only) Hotel Listing Card. One component renders both booking
// modes plus availability, pricing, refundability, and loading states.
import RoomCard from '../../components/details/RoomCard.vue'

const features = [
  { icon: 'wifi', label: 'Free WiFi' },
  { icon: 'free_breakfast', label: 'Breakfast Included' },
  { icon: 'king_bed', label: '1 King Bed' },
  { icon: 'straighten', label: '241 sq ft' },
]

const roomDetails = [
  { label: 'Entertainment', value: '55" Smart TV, Premium Channels, High-Speed WiFi' },
  { label: 'Food & Drink', value: 'Coffee Maker, Mini Bar, Microwave, Mini Fridge' },
  { label: 'Non-smoking', value: 'Yes' },
]

const nights = [
  { date: 'Tue, Jun 23', roomsLeft: 4, price: 269 },
  { date: 'Wed, Jun 24', roomsLeft: 5, price: 269 },
  { date: 'Thu, Jun 25', roomsLeft: 6, price: 269 },
]

// Base props mirroring the reference detail-screen room card.
const base = {
  roomType: 'King Bedroom',
  bedConfig: '1 King Bed',
  sleeps: 2,
  features,
  refundable: true,
  mode: 'reserve',
  price: 269,
  total: 970.26,
  roomCount: 1,
  availability: 'available',
  seed: 0,
}

const wrap = (extra = {}) => ({
  components: { RoomCard },
  setup: () => ({ args: { ...base, ...extra } }),
  template: `<room-card v-bind="args" />`,
})

export default {
  title: 'Hotel Details/Room Card',
  component: RoomCard,
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'inline-radio', options: ['reserve', 'hold'] },
    availability: { control: 'inline-radio', options: ['available', 'limited', 'soldout'] },
    refundable: { control: 'boolean' },
    loading: { control: 'boolean' },
    price: { control: 'number' },
  },
  parameters: { docs: { description: { component: `
## Overview
The **Room Card** is the vertical, room-rate card shown in the hotel detail
screen's "Select Your Room" section. It was extracted from the Hotel Listing
Card so the detail experience owns it independently (the listing card is now
horizontal-only).

One component, two booking modes:
- **Reserve** — room details + a "Nights" availability list + a **Reserve Room**
  CTA. Supports discounted pricing (struck-through original + deal badge).
- **Hold** — per-night **quantity steppers** (clamped to rooms left); the
  **Add to Cart** CTA stays muted until at least one room is selected, then
  activates and shows the running count.

States: \`availability\` (\`available\` / \`limited\` "Only N left" / \`soldout\`
overlay + disabled CTA + zeroed steppers), refundable vs nonrefundable tag,
optional trust \`badge\`, and a loading skeleton. Photos source from the local
imagery library by category.
` } } },
}

/** Reserve mode — the reference room card with a Reserve Room CTA. */
export const Reserve = { render: () => wrap({ roomDetails }) }

/** Hold mode — per-night quantity steppers + Add to Cart. */
export const Hold = {
  render: () => wrap({ mode: 'hold', roomType: 'Two-Room Suite King', bedConfig: '1 King Bed + Sofa', sleeps: 4, nights, seed: 2 }),
}

/** A discounted reserve rate — struck-through original price + deal badge. */
export const Discounted = {
  render: () => wrap({ roomType: 'Studio Suite', originalPrice: 320, price: 269, discountLabel: '15% Off', badge: { label: 'Member Price', tone: 'blue' }, seed: 1 }),
}

/** Urgency — only a couple of rooms remaining. */
export const LimitedAvailability = {
  render: () => wrap({ availability: 'limited', roomsLeft: 2, seed: 3 }),
}

/** Sold out — media overlay, disabled CTA, card dimmed. Shown in both modes. */
export const SoldOut = {
  render: () => ({
    components: { RoomCard },
    setup: () => ({
      reserve: { ...base, availability: 'soldout', seed: 4 },
      hold: { ...base, mode: 'hold', roomType: 'Two-Room Suite King', bedConfig: '1 King Bed + Sofa', sleeps: 4, nights, availability: 'soldout', seed: 5 },
    }),
    template: `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start"><room-card v-bind="reserve" /><room-card v-bind="hold" /></div>`,
  }),
}

/** Nonrefundable rate tag. */
export const Nonrefundable = {
  render: () => wrap({ roomType: 'Double Queen Bedroom', bedConfig: '2 Queen Beds', refundable: false, seed: 6 }),
}

/** Loading skeleton. */
export const Loading = { render: () => wrap({ loading: true }) }

/** Both booking modes side by side for comparison. */
export const BookingModes = {
  render: () => ({
    components: { RoomCard },
    setup: () => ({
      reserve: { ...base, roomDetails },
      hold: { ...base, mode: 'hold', roomType: 'Two-Room Suite King', bedConfig: '1 King Bed + Sofa', sleeps: 4, nights, seed: 2 },
    }),
    template: `<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start"><room-card v-bind="reserve" /><room-card v-bind="hold" /></div>`,
  }),
}
