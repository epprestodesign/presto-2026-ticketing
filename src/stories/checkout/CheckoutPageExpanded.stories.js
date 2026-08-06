// CHECKOUT EXPERIENCE EXPANDED — the checkout flow fully unfolded: every step
// shown open at once with all fields in their input state, ending in ONE submit
// (no per-step "Next").
//
// Ported from the presto-2026 category of the same name. The two hotel flows —
// Book Reservation and Group Block — carry that repo's fixtures verbatim, so the
// two Storybooks render the same stories. The four TICKETING flows have no
// counterpart there (this fork added `mode="ticketing"` after the port), so they
// reuse this repo's own ticketing carts — the same ones "Checkout Experience"
// mounts on the stepped template, which makes the pair directly comparable.
import { ref, computed } from 'vue'
import { loadImagery } from '../../lib/imagery'
import CheckoutPageExpanded from '../../components/checkout/CheckoutPageExpanded.vue'
import PageFrame from '../../components/PageFrame.vue'
import HoldTimerPill from '../../components/HoldTimerPill.vue'
import { tier, pkgOnly, pkgHotel, ticketsOnlyCart, ticketsHotelCart, packagesOnlyCart, packagesHotelCart } from '../ticketing/_ticketing-flow-carts.js'
import { makeSummary } from './_ticketing-checkout-data.js'

const useHero = (category, seed) => {
  const img = ref('')
  loadImagery().then((lib) => { const arr = lib[category] || lib.rooms || []; if (arr[seed]) img.value = arr[seed].url })
  return img
}

export default {
  title: 'Checkout Experience Expanded/Overview',
  component: CheckoutPageExpanded,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: `
The **Expanded** checkout renders every step of the "Confirm and pay" flow open
at the same time — all fields visible in their input state — and finishes with a
single giant submit instead of stepping through with per-step "Next" buttons.
Use it to review the complete set of checkout fields on one page.

Only the **left column** differs from \`Checkout Experience\`. The rail is the
same sticky cart, the same in-rail countdown and the same reservation actions,
so the two can be compared side by side.

Six flows, matching the ones \`Checkout Experience\` documents on the stepped
template: the two hotel flows and this fork's four ticketing flows.
` } } },
}

const frame = (inner, cartMode = 'hold') =>
  `<page-frame cart-mode="${cartMode}" brand="Secure Checkout" minimal-nav>${inner}</page-frame>`

// --- The two hotel flows, ported from presto-2026 ----------------------------

/** Book Reservation — Contact information · Payment · Review reservation ·
 *  Policies, all expanded, one "Book Now" submit. */
export const BookReservation = {
  name: 'Book Reservation',
  render: () => ({
    components: { CheckoutPageExpanded, PageFrame },
    setup() {
      const img = useHero('rooms', 2)
      const cart = {
        heldSeconds: 895,
        hotel: { name: 'The Concord Hotel', address: '750 Tremont St, Boston, MA 02118' },
        imageCategories: ['suites', 'rooms', 'lobby', 'pool', 'dining'], seed: 1,
        checkIn: { date: '06/23/2026', time: '4:00pm' }, checkOut: { date: '06/24/2026', time: '11:00am' }, nights: 1,
        highlights: [{ icon: 'kitchen', label: 'Kitchen' }, { icon: 'ac_unit', label: 'Air conditioning' }, { icon: 'microwave', label: 'Microwave' }],
        roomType: 'Aparthotel', bedConfig: '1 King Bed and 1 Queen Sofa Bed', sleeps: 2, amenities: [{ icon: 'wifi', label: 'Free WiFi' }],
        priceDetails: {
          nights: 1, rooms: 1, rate: 164.78, subtotal: 164.78, taxes: 47.53, propertyFee: 110.0, total: 322.31,
          lines: [
            { label: 'Check In', value: 'Wed, 03/31/2027', text: true },
            { label: 'Check Out', value: 'Sat, 04/03/2027', text: true },
            { label: 'Wed, 03/31/2027', value: 110 },
            { label: 'Thu, 04/01/2027', value: 115 },
            { label: 'Fri, 04/02/2027', value: 120 },
            { label: 'Booking Fee', value: 10 },
            { label: 'Taxes', value: 15 },
            { label: 'Secondary Fee', value: 2 },
            { label: 'Guest Fees', value: 15 },
            { label: 'Resort Fees', value: 45 },
          ],
          subtotals: [{ label: 'Room Cost', value: 432 }, { label: 'Due Today', value: 162 }],
          balanceDue: 270,
        },
        roomsLeft: 1,
      }
      const summary = computed(() => ({
        image: img.value, title: 'The Concord Hotel', subtitle: 'Aparthotel · Sleeps 2', rating: '4.8',
        rrow1: '1 room · 1 night', total: 322.31,
      }))
      return { cart, summary }
    },
    template: frame('<checkout-page-expanded mode="reservation" :cart="cart" :summary="summary" />', 'reserve'),
  }),
}

/** Group Block — Review order · Contact & group information (teams block) ·
 *  Policies, all expanded, one "Hold Group Block Now" submit. Group holds aren't
 *  charged, so there is no payment step. */
export const GroupBlock = {
  name: 'Group Block',
  render: () => ({
    components: { CheckoutPageExpanded, PageFrame },
    setup() {
      const img = useHero('suites', 1)
      const cart = {
        heldSeconds: 372,
        hotels: [
          { name: 'Embassy Suites Chicago Downtown', imageCategories: ['suites', 'rooms'], seed: 0, rooms: [
            { type: 'Two-Room Suite King', summary: '1 King Bed · Sleeps 4', nights: [{ date: 'Tue, Jun 23', qty: 4, roomsLeft: 6, price: 269 }, { date: 'Wed, Jun 24', qty: 1, roomsLeft: 5, price: 299 }] },
            { type: 'Two-Room Suite Double', summary: '2 Queen Beds · Sleeps 4', price: 289, nights: [{ date: 'Tue, Jun 23', qty: 1, roomsLeft: 5 }, { date: 'Wed, Jun 24', qty: 1, roomsLeft: 4 }] },
          ] },
          { name: 'The Concord Hotel', imageCategories: ['lobby', 'rooms'], seed: 2, rooms: [
            { type: 'King Studio', summary: '1 King Bed · Sleeps 2', price: 165, nights: [{ date: 'Tue, Jun 23', qty: 1, roomsLeft: 6 }] },
          ] },
        ],
      }
      const summary = computed(() => ({
        image: img.value, title: 'Group hold', subtitle: 'Embassy Suites + The Concord',
        rrow1: '8 rooms · 2 hotels', note: 'Rooms held — finish before the timer ends',
      }))
      return { cart, summary }
    },
    template: frame('<checkout-page-expanded mode="group" :cart="cart" :summary="summary" :show-teams="true" />'),
  }),
}

// --- This fork's four ticketing flows ----------------------------------------
// Same carts the stepped "Checkout Experience" stories mount, so each pair is a
// like-for-like comparison of the two layouts.

const ticketingStory = (cart, summary) => ({
  render: () => ({
    components: { CheckoutPageExpanded, PageFrame, HoldTimerPill },
    setup: () => ({ cart, summary }),
    template: frame(`
      <checkout-page-expanded mode="ticketing" :cart="cart" :summary="summary" />
      <hold-timer-pill :seconds="352" running label="Seats held" sub="Finish before the timer ends" />`),
  }),
})

/** Tickets Only — no hotel. Contact · Payment · Review your order · Policies. */
export const TicketsOnly = {
  name: 'Tickets Only',
  ...ticketingStory(ticketsOnlyCart, makeSummary(ticketsOnlyCart, [
    { label: 'Seats', value: 'Club · Sec CL10' },
    { label: 'Tickets', value: `2 × ${tier.name}` },
  ], { rrow1: `2 × ${tier.name} · Club` })),
}

/** Tickets + Hotel — the unified bundle, one charge covering all components. */
export const TicketsHotel = {
  name: 'Tickets + Hotel',
  ...ticketingStory(ticketsHotelCart, makeSummary(ticketsHotelCart, [
    { label: 'Seats', value: 'Club · Sec CL10' },
    { label: 'Tickets', value: '2 × Club' },
    { label: 'Hotel', value: 'The Westin · 1 night' },
  ], { rrow1: '2 × Club · The Westin · 1 night' })),
}

/** Packages Only — a ticket + experience SKU without a hotel. */
export const PackagesOnly = {
  name: 'Packages Only',
  ...ticketingStory(packagesOnlyCart, makeSummary(packagesOnlyCart, [
    { label: 'Package', value: pkgOnly.name },
    { label: 'Seats', value: `${pkgOnly.ticket.tierName} · Sec CL10` },
    { label: 'Experience', value: pkgOnly.theme },
  ], { rrow1: pkgOnly.name })),
}

/**
 * Packages + Hotel — the full bundle. **This is the layout Option D's checkout
 * mounts**, so it is the one to review against that prototype.
 */
export const PackagesHotel = {
  name: 'Packages + Hotel',
  ...ticketingStory(packagesHotelCart, makeSummary(packagesHotelCart, [
    { label: 'Package', value: pkgHotel.name },
    { label: 'Seats', value: `${pkgHotel.ticket.tierName} · Sec CL10` },
    { label: 'Experience', value: pkgHotel.theme },
    { label: 'Hotel', value: `${pkgHotel.hotel.name} · 1 night` },
  ], { rrow1: `${pkgHotel.name} · ${pkgHotel.hotel.name}` })),
}
