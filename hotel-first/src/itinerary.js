// One trip, three purchases, one cart.
//
// This module is the join. The hotel comes from the Book Reservation side of the
// booking site, the passes from the tournament, the add-ons from Orlando — and
// the whole point of the edge case is that the guest sees them as a single
// itinerary rather than three receipts. So every downstream surface (the nav cart
// fly-out, the checkout cart, the checkout rail, the confirmation) is built from
// the SAME `journey` state here, and the money is computed once.
//
// Cart shape is the library's ticketing cart verbatim — CartReview, CheckoutPage
// and ConfirmationPage all consume it as-is, which is why the hotel-side screens
// and the ticketing screens can share a checkout without a single library change.
//
// PRICING RULES (kept in one place so the rail and the cart can never disagree):
//   subtotal = every line
//   fees     = 12% of the NON-HOTEL lines — the ticketing service fee. Hotel is
//              excluded because its taxes/fees are quoted in the nightly rate,
//              and because CartReview's own fee base excludes it too — keeping
//              the two bases identical is what stops the rail and this file from
//              ever printing different totals for the same cart.
//   taxes    = 9% of the subtotal (Orange County sales + tourist development)
//   total    = subtotal + fees + taxes
// All rounding is Math.round on whole dollars — deterministic, no drift.
import { EVENT, STAY, DETAIL_NIGHTS, CONF_NIGHTS } from './event.js'
import { ticketLines, ticketCount, ticketSubtotal } from './tickets.js'
import { addOnLines, addOnCount, addOnSubtotal, unitLabel } from './addons.js'

// Every line's quantity is the party size (see store.js). The cart says so on
// each line rather than assuming the guest remembers the rule from two screens
// back — and it says it in the same words the cards use.
const partyNote = (qty, guests) =>
  (qty < guests
    ? `${qty} of ${guests} in your party — limited availability`
    : `${qty} guest${qty === 1 ? '' : 's'} — matches your party`)

export const FEE_RATE = 0.12
export const TAX_RATE = 0.09

const HOTEL_CART_POLICIES = [
  { title: 'Check-in / Check-out', body: `Check-in from ${STAY.checkIn.time} on ${STAY.checkIn.long}; check-out by ${STAY.checkOut.time} on ${STAY.checkOut.long}.` },
  { title: 'Cancellation', body: 'Free cancellation until Feb 10, 2027. After that, one night plus tax is charged.' },
  { title: 'Tournament block', body: 'This rate is part of the Spirit Nationals contracted block — the front desk has your team on file.' },
]

/** The hotel line: the room the guest chose, priced across the three nights. */
function hotelItem(hotel, room) {
  const nights = DETAIL_NIGHTS.map((date) => ({ date, price: room.nightly }))
  return {
    type: 'hotel',
    label: `${hotel.name} · ${room.type}`,
    sublabel: `${STAY.nights} nights · ${STAY.range}`,
    amount: room.nightly * STAY.nights,
    imageCategories: hotel.imageCategories,
    seed: hotel.seed,
    hotelDetail: {
      name: hotel.name,
      address: hotel.address,
      imageCategories: hotel.imageCategories,
      seed: hotel.seed,
      roomType: room.type,
      note: `${room.bedConfig} · Sleeps ${room.sleeps} · ${hotel.distance}`,
      checkIn: `${STAY.checkIn.long} · ${STAY.checkIn.time}`,
      checkOut: `${STAY.checkOut.long} · ${STAY.checkOut.time}`,
      nights,
      rate: room.nightly,
      total: room.nightly * STAY.nights,
      policies: HOTEL_CART_POLICIES,
    },
  }
}

/**
 * Admission lines.
 *
 * `unitPrice` + `maxQty` are deliberately NOT set. CartReview turns a ticket line
 * into an editable quantity dropdown exactly when `unitPrice` is present, and an
 * editable quantity in the rail is the last place a line could still break away
 * from the party size — a guest could arrive at checkout with four park tickets
 * and three passes after everything upstream had been locked. Dropping the field
 * is what closes that door, with no library change: the rail prints the line
 * amount and the party note instead.
 */
function ticketItems(selection, guests) {
  return ticketLines(selection).map((t) => ({
    type: 'ticket',
    label: t.name,
    sublabel: `${EVENT.venueShort} · ${t.days} · ${partyNote(t.qty, guests)}`,
    amount: t.amount,
    details: [
      { icon: 'confirmation_number', title: `${t.qty} × ${t.name}`, text: t.desc },
      { icon: 'group', title: partyNote(t.qty, guests), text: 'Pass quantities follow the party size on your room — change it on the Tickets step and the whole order re-prices.' },
      { icon: 'qr_code_2', title: 'Mobile entry', text: 'Delivered to the EventPipe app and scanned at the West Building doors.' },
    ],
  }))
}

/**
 * Destination add-on lines. Typed 'experience' so CartReview files them under
 * their own "Experiences" section heading — the guest sees three named groups
 * (Hotel · Tickets · Experiences), which is the combined-itinerary read.
 */
function addOnItems(selection, guests) {
  return addOnLines(selection).map((a) => ({
    type: 'experience',
    label: a.name,
    sublabel: `${a.vendor} · ${a.qty} × ${unitLabel(a)}`,
    amount: a.amount,
    details: [
      { icon: 'event', title: a.when, text: a.blurb },
      {
        icon: 'group',
        title: a.unit === 'booking' ? '1 booking — covers your whole party' : partyNote(a.qty, guests),
        text: 'Add-on quantities follow the party size on your room, so this line can never disagree with your passes.',
      },
      ...a.includes.map((line) => ({ icon: 'check_circle', title: line })),
    ],
  }))
}

/** The one cart every surface reads. */
export function buildCart(journey, hotel) {
  const items = [
    hotelItem(hotel, journey.room),
    ...ticketItems(journey.tickets, journey.guests),
    ...addOnItems(journey.addOns, journey.guests),
  ]
  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const feeBase = items.filter((i) => i.type !== 'hotel').reduce((s, i) => s + i.amount, 0)
  const fees = Math.round(feeBase * FEE_RATE)
  const taxes = Math.round(subtotal * TAX_RATE)
  return {
    items,
    subtotal,
    fees,
    taxes,
    total: subtotal + fees + taxes,
    currency: 'USD',
    feeRate: FEE_RATE,
    taxRate: TAX_RATE,
    heldSeconds: 895,
    // Shown once under the price card — the guarantees that apply to the whole
    // itinerary, not to any single line.
    ticketDetails: [
      { icon: 'qr_code_2', title: 'One order, one app', text: 'Room confirmation, tournament passes and add-on tickets all live in the same EventPipe order.' },
      { icon: 'verified', title: 'Official tournament block', text: 'Rates and passes are contracted directly with Spirit Nationals and the Convention Center.' },
      { icon: 'event_available', title: 'Free hotel cancellation until Feb 10', text: 'Change or cancel the room without touching the rest of the itinerary.' },
      { icon: 'family_restroom', title: 'Your party stays together', text: 'Everyone on this order is booked into the same property and the same entry group — passes and add-ons are bought for the whole party, not line by line.' },
    ],
  }
}

/** The sticky checkout rail. Its price lines are the cart's, grouped for a human. */
export function buildSummary(journey, hotel, cart, image = '') {
  const tickets = ticketCount(journey.tickets)
  const addOns = addOnCount(journey.addOns)
  const parts = [
    `1 room · ${STAY.nights} nights`,
    `${tickets} ${tickets === 1 ? 'pass' : 'passes'}`,
    addOns ? `${addOns} add-${addOns === 1 ? 'on' : 'ons'}` : null,
  ].filter(Boolean)

  const priceLines = [
    { label: `${STAY.nights} nights × $${journey.room.nightly}`, value: journey.room.nightly * STAY.nights },
    { label: `Tournament admission (${tickets})`, value: ticketSubtotal(journey.tickets) },
  ]
  if (addOns) priceLines.push({ label: `Destination add-ons (${addOns})`, value: addOnSubtotal(journey.addOns) })
  priceLines.push({ label: 'Fees', value: cart.fees })
  priceLines.push({ label: 'Taxes', value: cart.taxes })

  return {
    image,
    title: hotel.name,
    subtitle: `${journey.room.type} · ${EVENT.city}`,
    rating: String(hotel.rating),
    cancellation: 'Free hotel cancellation until Feb 10, 2027.',
    rrow1: parts.join(' · '),
    rows: [
      { label: 'Dates', value: STAY.range, change: true },
      // The party size is the number every line above is priced from, so the rail
      // names it rather than leaving it as trip trivia beside the dates.
      { label: 'Party', value: `${journey.guests} guest${journey.guests === 1 ? '' : 's'} — sets every quantity`, change: true },
      { label: 'Event', value: EVENT.shortName },
    ],
    priceLines,
    total: cart.total,
    note: `${hotel.distance} — the closest block rooms go first.`,
  }
}

const ADMISSION_POLICIES = [
  { title: 'Mobile passes', body: 'Passes are delivered to the EventPipe app the week of the event and scanned at the West Building doors. Wristbands are issued once on your first scan.' },
  { title: 'Re-entry', body: 'Day and weekend passes allow same-day re-entry; keep your wristband on for the whole day.' },
  { title: 'Athlete credentials', body: 'Athlete wristbands are non-transferable and must match the roster your gym filed with Spirit Nationals.' },
  { title: 'Schedule changes', body: 'Mat assignments and performance times are set by the event producer and can move. We email you when your athlete’s block changes.' },
]

const ADDON_POLICIES = [
  { title: 'Attraction tickets', body: 'Park tickets are date-flexible within your stay window unless the confirmation says otherwise, and are valid for one entry per guest per day.' },
  { title: 'Changes & refunds', body: 'Add-ons can be cancelled up to 72 hours before their scheduled date for a full refund. Same-day changes are handled by the attraction.' },
  { title: 'Transfers', body: 'Ground transport is confirmed against the flight details on this order — update them in Manage Booking if your flight moves.' },
]

const HOTEL_POLICIES = [
  { title: 'Check-in / Check-out', body: `Check-in from ${STAY.checkIn.time}, check-out by ${STAY.checkOut.time}. Photo ID and the card used for booking are required at check-in.` },
  { title: 'Cancellation Policy', body: 'Free cancellation until Feb 10, 2027. After that, one night’s room rate plus tax is charged.' },
  { title: 'Tournament block', body: 'Your room is part of the Spirit Nationals contracted block — ask the front desk about early bag storage on finals day.' },
  { title: 'Parking & Amenities', body: 'Complimentary Wi-Fi is included. Self-parking is discounted for block guests; the Convention Center shuttle runs every 20 minutes on competition days.' },
]

const ICONS = { ticket: 'confirmation_number', hotel: 'hotel', experience: 'stars' }

/** ConfirmationPage `data` — the itinerary, read back as one document. */
export function buildConfirmation(journey, hotel, cart) {
  const blocks = cart.items
    .filter((it) => it.type !== 'hotel') // the room gets the full reservation block below
    .map((it) => ({ icon: ICONS[it.type] || 'shopping_bag', name: it.label, meta: it.sublabel, amount: it.amount }))

  const hotelBlock = {
    name: hotel.name,
    stars: Math.round(hotel.stars),
    address: hotel.address,
    seed: hotel.seed,
    checkIn: `${STAY.checkIn.long} · ${STAY.checkIn.time}`,
    checkOut: `${STAY.checkOut.long} · ${STAY.checkOut.time}`,
    rooms: [{
      type: `${journey.room.type} · ${journey.room.bedConfig}`,
      note: `Sleeps ${journey.room.sleeps} · ${hotel.distance}`,
      nights: CONF_NIGHTS.map((date) => ({ date, qty: 1, price: journey.room.nightly })),
    }],
  }

  return {
    tone: 'success',
    idLabel: 'Itinerary',
    orderNumber: 'EP-4TN9K2',
    bannerTitle: 'Your Orlando itinerary is confirmed.',
    bannerSub: `${hotel.name} · ${ticketCount(journey.tickets)} tournament passes${addOnCount(journey.addOns) ? ' · ' + addOnCount(journey.addOns) + ' destination add-ons' : ''}`,
    bannerCta: 'View my itinerary',
    contactName: 'Dana Whitfield',
    guest: 'Dana Whitfield — (407) 555-0148',
    email: 'hello@girardjustin.com',
    reservedOn: 'Mon, 11/16/2026 09:42 AM EST',
    event: {
      name: EVENT.name,
      date: `${EVENT.dates} · Doors 7:30 AM daily`,
      venue: `${EVENT.venue} · ${EVENT.city}`,
    },
    hotels: [hotelBlock],
    blocks,
    totalCharged: cart.total,
    valuePropsLabel: 'What travels with this itinerary',
    valueProps: cart.ticketDetails,
    statusNote: {
      title: 'One payment, three confirmations',
      body: 'Your room is confirmed with the hotel now. Tournament passes are issued by the event producer and attraction tickets by each park — both arrive in their own email within the hour. Everything is already paid for on this order.',
    },
    policies: [
      { hotel: 'Tournament admission', items: ADMISSION_POLICIES },
      { hotel: hotel.name, items: HOTEL_POLICIES },
      { hotel: 'Destination add-ons', items: ADDON_POLICIES },
    ],
  }
}
