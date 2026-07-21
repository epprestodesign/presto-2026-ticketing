// Adapter: turn a shared ticketing cart (from ../ticketing/_ticketing-flow-carts.js)
// into the `data` object ConfirmationPage expects in mode="ticketing". Not a story
// file (underscore-prefixed) — Storybook only loads *.stories.js. Prototype data.
import { event } from '../ticketing/_ticketing-flow-carts.js'

const ICONS = { ticket: 'confirmation_number', hotel: 'hotel', package: 'redeem', experience: 'stars' }

// A reasonable, self-contained ticketing policy list (flat [{title,body}] shape;
// ConfirmationPage normalizes it under a single heading).
const TICKETING_POLICIES = [
  { title: 'Mobile entry', body: 'Tickets are delivered to the EventPipe app before gameday and scanned at the gate — no printouts needed.' },
  { title: 'Transfers & resale', body: 'You can transfer tickets to your party from the app up until the event begins.' },
  { title: 'Refunds & cancellations', body: 'If the event is cancelled or rescheduled, EventPipe will notify you with your refund or exchange options.' },
  { title: 'Event changes', body: 'Date, time, and lineup are set by the venue and may change. We’ll email you if anything about your order changes.' },
]

// Hotel-stay policies, shown as their own section (per-hotel shape) alongside the
// ticketing policies whenever the order includes a room — mirroring the Book
// Reservation confirmation.
const HOTEL_POLICIES = [
  { title: 'Check-in / Check-out', body: 'Check-in from 3:00 PM, check-out by 11:00 AM. Photo ID and the card used for booking are required at check-in.' },
  { title: 'Cancellation Policy', body: 'Free cancellation until 48 hours before check-in. After that, one night’s room rate plus tax is charged.' },
  { title: 'Deposit', body: 'The full stay is charged to the card on file with your order — no additional deposit is collected at check-in.' },
  { title: 'Parking & Amenities', body: 'Complimentary Wi-Fi is included. Event-day parking and shuttle options near Gillette Stadium are available — ask the front desk.' },
]

// Build the rich hotel reservation block (the same shape reserve/hold use) from a
// simple hotel descriptor: { name, roomType, rate, nights, address?, stars?,
// note?, checkIn?, checkOut? }.
function buildHotelBlock(h) {
  const dates = ['Fri, Dec 5, 2026', 'Sat, Dec 6, 2026', 'Sun, Dec 7, 2026']
  const nights = Array.from({ length: h.nights || 1 }, (_, i) => ({ date: dates[i] || `Night ${i + 1}`, qty: 1, price: h.rate }))
  return {
    name: h.name,
    stars: h.stars ?? 4,
    address: h.address || '1 Patriot Pl, Foxborough, MA 02035',
    seed: h.seed ?? 1,
    checkIn: h.checkIn || 'Fri, Dec 5, 2026 · 3:00 PM',
    checkOut: h.checkOut || 'Sat, Dec 6, 2026 · 11:00 AM',
    rooms: [{ type: h.roomType || 'Deluxe King', note: h.note || '1 King Bed · Sleeps 2 · Near Gillette Stadium', nights }],
  }
}

/**
 * Build the ConfirmationPage `data` for a ticketing order.
 * @param {object} cart  one of the four shared ticketing carts
 * @param {object} [opts] overrides: tone, bannerTitle, bannerSub, bannerCta,
 *                        statusNote, orderNumber, policies
 */
export function confData(cart, opts = {}) {
  const hasHotel = !!opts.hotel
  // The hotel is shown as a full reservation block (below) rather than a compact
  // order-component row, so drop the hotel line-item from `blocks` when present.
  const blocks = (cart.items || [])
    .filter((it) => !(hasHotel && it.type === 'hotel'))
    .map((it) => ({
      icon: ICONS[it.type] || 'shopping_bag',
      name: it.label,
      meta: it.sublabel,
      amount: it.amount,
    }))

  const hotels = hasHotel ? [buildHotelBlock(opts.hotel)] : []
  const policies = opts.policies || (hasHotel
    ? [{ hotel: 'Ticketing & event', items: TICKETING_POLICIES }, { hotel: opts.hotel.name, items: HOTEL_POLICIES }]
    : TICKETING_POLICIES)

  return {
    hotels,
    tone: opts.tone || 'success',
    bannerTitle: opts.bannerTitle || 'Success! Your order is confirmed.',
    bannerSub: opts.bannerSub,
    bannerCta: opts.bannerCta || 'View my orders',
    orderNumber: opts.orderNumber || 'EP-2B8H5W',
    contactName: 'Justin Girard',
    guest: 'Justin Girard',
    email: 'hello@girardjustin.com',
    reservedOn: 'Dec 1, 2026',
    event: {
      name: event.name,
      date: 'Sat, Dec 6, 2026 · 4:25 PM',
      venue: (event.venue?.name || 'Gillette Stadium') + ' · Foxborough, MA',
    },
    blocks,
    totalCharged: cart.total,
    valueProps: cart.ticketDetails || [],
    statusNote: opts.statusNote || null,
    policies,
  }
}
