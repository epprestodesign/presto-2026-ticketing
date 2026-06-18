// HOTEL DETAILS / Rooms — the "Select Your Room" carousel. Lays out RoomCards
// in a horizontal scroll-snapping track so more than three rooms can be browsed
// when available. Sold-out rooms stay in the list (disabled), not removed.
import RoomsCarousel from '../../components/details/RoomsCarousel.vue'

const feat = (n) => [
  { icon: 'wifi', label: 'Free WiFi' },
  { icon: 'free_breakfast', label: 'Breakfast' },
  { icon: 'straighten', label: `${n} sq ft` },
]

const nights = [
  { date: 'Tue, Jun 23', roomsLeft: 4, price: 269 },
  { date: 'Wed, Jun 24', roomsLeft: 5, price: 269 },
  { date: 'Thu, Jun 25', roomsLeft: 6, price: 289 },
]

// A 5-room reserve catalog (one sold out) — enough to overflow and scroll.
const reserveRooms = [
  { roomType: 'King Bedroom', bedConfig: '1 King Bed', sleeps: 2, features: feat(241), price: 269, total: 970.26, refundable: true, seed: 0 },
  { roomType: 'Double Queen Bedroom', bedConfig: '2 Queen Beds', sleeps: 4, features: feat(256), price: 331, total: 1180.5, refundable: false, seed: 1 },
  { roomType: 'Studio Suite', bedConfig: '1 King Bed + Sofa', sleeps: 3, features: feat(240), originalPrice: 420, price: 369, discountLabel: '12% Off', total: 1320.0, refundable: true, badge: { label: 'Member Price', tone: 'blue' }, seed: 2 },
  { roomType: 'Executive Suite', bedConfig: '1 King Bed, Living Room', sleeps: 4, features: feat(480), price: 459, total: 1640.0, refundable: true, availability: 'limited', roomsLeft: 2, seed: 3 },
  { roomType: 'Accessible King', bedConfig: '1 King Bed', sleeps: 2, features: feat(245), price: 269, total: 970.26, refundable: true, availability: 'soldout', seed: 4 },
]

// Hold variant — per-night quantity steppers, including a sold-out room.
const holdRooms = [
  { mode: 'hold', roomType: 'Two-Room Suite King', bedConfig: '1 King Bed + Sofa', sleeps: 4, features: feat(480), price: 269, nights, refundable: true, seed: 2 },
  { mode: 'hold', roomType: 'Double Queen', bedConfig: '2 Queen Beds', sleeps: 4, features: feat(256), price: 289, nights, refundable: false, seed: 1 },
  { mode: 'hold', roomType: 'King Studio', bedConfig: '1 King Bed', sleeps: 2, features: feat(241), price: 249, nights, refundable: true, seed: 0 },
  { mode: 'hold', roomType: 'Accessible Queen', bedConfig: '1 Queen Bed', sleeps: 2, features: feat(245), price: 239, nights, refundable: true, availability: 'soldout', seed: 5 },
]

const wrap = (rooms, extra = {}) => ({
  components: { RoomsCarousel },
  setup: () => ({ args: { rooms, ...extra } }),
  template: `<div style="max-width:1180px"><rooms-carousel v-bind="args" /></div>`,
})

export default {
  title: 'Hotel Details/Rooms',
  component: RoomsCarousel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Overview
The **Rooms** carousel is the "Select Your Room" section of the hotel detail
screen. It lays out [Room Cards](/?path=/docs/hotel-details-room-card--docs) in
a horizontal, scroll-snapping track so **more than three rooms** can be browsed
when a property has them — via the ‹ › arrows or native touch/trackpad swipe.
Arrows disable at each end and the whole nav hides when everything already fits.

**Sold-out rooms stay in the list** (rendered disabled by RoomCard) rather than
being dropped, so guests still see the full room lineup.
` } } },
}

/** Reserve mode — 5 rooms (one discounted, one limited, one sold out). Scrolls. */
export const Default = { render: () => wrap(reserveRooms, { subtitle: 'Prices shown are per night for your selected dates.' }) }

/** Hold mode — group room blocks with per-night steppers, incl. a sold-out room. */
export const HoldMode = {
  render: () => wrap(holdRooms, { title: 'Hold Rooms for Your Group', subtitle: 'Choose how many rooms to hold each night.' }),
}

/** Only two rooms — fits without scrolling, so the arrows are hidden. */
export const FewRooms = { render: () => wrap(reserveRooms.slice(0, 2)) }

/** Availability mix — available, limited, and sold-out side by side. */
export const WithSoldOut = {
  render: () => wrap([
    reserveRooms[0],
    { ...reserveRooms[3] },
    { ...reserveRooms[4] },
  ]),
}
