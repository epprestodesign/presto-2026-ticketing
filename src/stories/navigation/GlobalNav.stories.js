// NAVIGATION / Global Nav — the app's dark top bar (logo + Manage Booking +
// cart icon) whose cart opens a right-side fly-out order summary, Uber Eats
// style. The fly-out has two data modes: a group/team room hold and a single
// hotel reservation. Accents use the DS primary (Zinc 900); the held timer
// counts down live and the cart badge tracks the live selection.
import GlobalNav from '../../components/GlobalNav.vue'

// "Hold Rooms for Group or Team" cart — multiple room types, live steppers.
const holdCart = {
  hotel: { name: 'Embassy Suites Chicago Downtown', stars: 4 },
  heldSeconds: 372, // 06:12
  heldUntil: 'June 26, 2026 at 11:59 PM PST',
  imageCategories: ['suites', 'rooms'],
  seed: 0,
  rooms: [
    { type: 'Two-Room Suite King', nights: [
      { date: 'Tue, Jun 23', qty: 4, roomsLeft: 4, price: 269 },
      { date: 'Wed, Jun 24', qty: 1, roomsLeft: 5, price: 269 },
    ] },
    { type: 'Two-Room Suite Double', nights: [
      { date: 'Tue, Jun 23', qty: 1, roomsLeft: 5, price: 289 },
      { date: 'Wed, Jun 24', qty: 1, roomsLeft: 4, price: 289 },
    ] },
  ],
}

// "Hotel Reservation" cart — held countdown, nightly breakdown, totals.
const reserveCart = {
  hotel: { name: 'Embassy Suites Chicago Downtown', stars: 4, address: '600 N State St, Chicago, IL 60654' },
  heldSeconds: 895, // 14:55
  imageCategories: ['suites', 'rooms', 'lobby'],
  seed: 3,
  checkIn: '2026-06-23',
  checkOut: '2026-06-26',
  reserveRoom: 'Two-Room Suite King',
  reserveNights: [
    { date: 'Tue, 6/23/2026', price: 269 },
    { date: 'Wed, 6/24/2026', price: 269 },
    { date: 'Thu, 6/25/2026', price: 269 },
  ],
  taxes: 113,
  total: 920,
  dueToday: 269,
  balanceDue: 651,
}

export default {
  title: 'Navigation/Global Nav',
  component: GlobalNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Overview
The **Global Nav** is the app's persistent dark top bar — brand logo, a
**Manage Booking** pill, and a **cart icon** with a live count badge. Clicking
the cart opens the **Cart Fly-out** order summary (Uber Eats-style slide-over).

## Cart modes
- **\`hold\`** — "Hold Rooms for Group or Team": rooms grouped by type with live
  − / + steppers, Remove, "+ Add another hotel", and a "N Rooms Selected" /
  held-until panel + Proceed to Checkout. The badge tracks the live count.
- **\`reserve\`** — "Hotel Reservation": held countdown, photo carousel, dates,
  nightly breakdown, Total, Due Today / Balance Due, Edit / Start Over.

Built on DS tokens; primary actions use the brand Zinc 900.
` } },
  },
}

/** Just the bar — empty cart. Click the cart icon to open the fly-out. */
export const Default = {
  render: () => ({
    components: { GlobalNav },
    setup: () => ({ cart: reserveCart }),
    template: `<global-nav brand="Soccer League" cart-mode="reserve" :cart="cart" />`,
  }),
}

/** Group / team room hold — fly-out shown open over the bar. */
export const GroupHoldCart = {
  render: () => ({
    components: { GlobalNav },
    setup: () => ({ cart: holdCart }),
    template: `<global-nav brand="Soccer League" cart-mode="hold" :cart="cart" :start-open="true" />`,
  }),
}

/** Single hotel reservation — fly-out shown open over the bar. */
export const ReservationCart = {
  render: () => ({
    components: { GlobalNav },
    setup: () => ({ cart: reserveCart }),
    template: `<global-nav brand="Soccer League" cart-mode="reserve" :cart="cart" :start-open="true" />`,
  }),
}
