// The trip catalogue and its pricing — everything this prototype can put in a
// cart, and what the cart costs once it's in there.
//
// Three catalogues, deliberately kept apart: STAYS, TIERS, ADDONS. They share no
// SKU, no bundle id, and no ordering. That separation is the whole argument of
// this prototype — a package would have made one object out of the three, and a
// guest who wanted to drop the tickets from a package has to leave the flow to do
// it. Here there is nothing to drop out of.
//
// Sourced from the library's own mock layer (contracted hotels, derived ticket
// tiers, the Ticketmaster fixture) so the numbers match the sibling prototypes.
// The add-ons are this prototype's, because nothing in the library sells an
// extra that isn't already welded into a package.
import { CONTRACTED_HOTELS, walkMinutes, hotelCartDetail, ticketDetails } from '@lib/lib/bundles.js'
import { deriveTiers } from '@lib/lib/seatmap.js'
import { fixtureEvents } from '@lib/lib/ticketmaster.js'
// The library's own hotel photography, imported by name. The four contracted
// properties arrive from CONTRACTED_HOTELS carrying an image already; the six
// written here need one, and reusing the library's bundled shots keeps this app
// free of its own asset folder.
import imgExterior from '@lib/assets/hotel/exterior.jpg'
import imgLobby from '@lib/assets/hotel/lobby.jpg'
import imgPool from '@lib/assets/hotel/pool.jpg'
import imgSpa from '@lib/assets/hotel/spa.jpg'
import imgDeluxeKing from '@lib/assets/hotel/deluxe-king.jpg'
import imgOceanSuite from '@lib/assets/hotel/ocean-suite.jpg'

// ── The event everything hangs off ──
export const EVENT = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
export const EVENT_DATE = 'Sat, Dec 6, 2026 · 4:25 PM'
export const EVENT_VENUE = `${EVENT.venue?.name || 'Gillette Stadium'} · Foxborough, MA`

// The stay window is the event weekend. Nights are chosen, not fixed — but they
// are chosen from three known dates, not a calendar, because a date picker is a
// second decision surface and this prototype is about the cart, not the search.
export const NIGHT_DATES = ['Fri, Dec 5, 2026', 'Sat, Dec 6, 2026', 'Sun, Dec 7, 2026']
export const CHECK_OUT_DATES = ['Sat, Dec 6, 2026', 'Sun, Dec 7, 2026', 'Mon, Dec 8, 2026']
export const MAX_NIGHTS = NIGHT_DATES.length
export const MAX_ROOMS = 4

// ── Stays ──
// Each contracted property gets the same three room types, derived from its own
// contracted rate. Same room ladder everywhere on purpose: the guest is choosing
// a hotel first and a room second, and a different ladder per property would turn
// the second choice back into a comparison of the first.
const ROOM_LADDER = [
  { id: 'standard', delta: 0, sleeps: 2, bed: '1 King Bed' },
  { id: 'double', name: 'Double Queen', delta: 40, sleeps: 4, bed: '2 Queen Beds' },
  { id: 'suite', name: 'Two-Room Suite', delta: 130, sleeps: 4, bed: '1 King Bed · separate living room' },
]

// ── The property block, as a BROWSE surface needs it ──
// CONTRACTED_HOTELS was shaped for a compact add-on tile: a name, a rate, a
// distance and a rating. A browse page needs stars, a review count, a parent
// brand, amenity keys, an availability tier and coordinates, so those are
// written here rather than patched into the library. Ids, names, rates and
// distances are taken from the library untouched, which is what keeps every
// deep link minted before this round resolving to the same stay at the same
// price.
const PARENT = { Marriott: 'Marriott International', Hilton: 'Hilton Worldwide', Hyatt: 'Hyatt Hotels' }

// Amenity keys are drawn from the library's own FILTER_AMENITY_KEYS / AMENITIES
// vocabulary, so a box ticked in the Amenities filter can actually match a
// property. A mix that used prettier words would render a rail that never
// matches anything.
const FAMILY = ['breakfast', 'parking', 'wifi', 'outdoor_pool', 'non_smoking', 'in_room_fridge', 'laundry']
const SUITE = ['kitchenette', 'microwave', 'connecting_rooms', 'rollaway_beds', 'laundry', 'wifi']
const RESORT = ['restaurant', 'bar', 'spa', 'fitness', 'room_service', 'concierge', 'valet', 'indoor_pool']
const BUSINESS = ['business_center', 'front_desk_24h', 'express_checkin', 'dry_cleaning', 'fitness', 'wifi']

const PROFILES = {
  courtyard: { stars: 3.5, reviews: 1240, availability: 'available', preferred: true, amenities: [...FAMILY, ...BUSINESS], imageCategories: ['exterior', 'rooms', 'lobby'] },
  westin: { stars: 4.5, reviews: 2180, availability: 'available', preferred: true, amenities: [...RESORT, ...BUSINESS, 'hot_tub'], imageCategories: ['lobby', 'suites', 'dining'] },
  'hilton-garden': { stars: 3, reviews: 960, availability: 'available', amenities: [...FAMILY, 'shuttle', 'restaurant'], imageCategories: ['pool', 'rooms', 'exterior'] },
  'hyatt-place': { stars: 3, reviews: 1420, availability: 'available', amenities: [...FAMILY, ...SUITE, 'shuttle'], imageCategories: ['dining', 'rooms', 'pool'] },
}

// Six properties beyond the contracted four. Four cards is enough to prove that
// a card renders and nowhere near enough to prove that a FILTER RAIL does — a
// brand checkbox, a star floor and a radius slider all read as decoration on a
// list short enough to take in whole. The extra six exist to give the rail
// something to remove, and to make the three availability tiers (match /
// off-filter / sold out) visible on one screen.
const EXTRA = [
  { id: 'renaissance', name: 'Renaissance Patriot Place', brand: 'Marriott International', distanceMi: 0.2, rating: 4.7, roomType: 'King Room', nightlyRate: 329, image: imgSpa, stars: 4.5, reviews: 3050, availability: 'available', preferred: true, amenities: [...RESORT, 'breakfast', 'valet'], imageCategories: ['spa', 'suites', 'dining'] },
  { id: 'holiday-inn-express', name: 'Holiday Inn Express Foxborough', brand: 'IHG Hotels & Resorts', distanceMi: 1.6, rating: 4.0, roomType: 'King Room', nightlyRate: 149, image: imgExterior, stars: 2.5, reviews: 780, availability: 'available', amenities: [...FAMILY, 'ev_charging'], imageCategories: ['exterior', 'rooms', 'bathroom'] },
  { id: 'residence-inn', name: 'Residence Inn Foxborough', brand: 'Marriott International', distanceMi: 2.4, rating: 4.4, roomType: 'Studio Queen', nightlyRate: 199, image: imgDeluxeKing, stars: 3.5, reviews: 1130, availability: 'available', amenities: [...SUITE, ...FAMILY, 'pet_friendly'], imageCategories: ['rooms', 'suites', 'lobby'] },
  { id: 'hampton-inn', name: 'Hampton Inn Mansfield', brand: 'Hilton Worldwide', distanceMi: 3.2, rating: 4.1, roomType: 'Double Queen', nightlyRate: 139, image: imgLobby, stars: 2.5, reviews: 640, availability: 'unmatched', amenities: [...FAMILY, 'shuttle'], imageCategories: ['lobby', 'rooms', 'exterior'] },
  { id: 'crowne-plaza', name: 'Crowne Plaza Foxborough', brand: 'IHG Hotels & Resorts', distanceMi: 3.8, rating: 3.9, roomType: 'King Room', nightlyRate: 169, image: imgPool, stars: 3.5, reviews: 890, availability: 'unmatched', amenities: [...BUSINESS, 'outdoor_pool', 'parking', 'bar'], imageCategories: ['pool', 'bar', 'rooms'] },
  { id: 'hyatt-regency', name: 'Hyatt Regency Gillette', brand: 'Hyatt Hotels', distanceMi: 4.2, rating: 4.5, roomType: 'Deluxe King', nightlyRate: 259, image: imgOceanSuite, stars: 4, reviews: 1960, availability: 'unavailable', amenities: [...RESORT, 'golf', 'tennis'], imageCategories: ['suites', 'spa', 'exterior'] },
]

// Gillette Stadium. Coordinates are DERIVED from each property's stated distance
// rather than hand-typed, so the pin on the detail map and the number printed on
// the card can never disagree; the golden angle keeps them from stacking.
const VENUE_LAT = 42.0909
const VENUE_LNG = -71.2643
const COS_LAT = Math.cos((VENUE_LAT * Math.PI) / 180)
function coordsFor(i, distanceMi) {
  const ang = (i * 137.5 * Math.PI) / 180
  return {
    lat: VENUE_LAT + (distanceMi / 69) * Math.cos(ang),
    lng: VENUE_LNG + (distanceMi / (69 * COS_LAT)) * Math.sin(ang),
  }
}

// Rooms-left per night, derived from the property's index. Deterministic, and
// uneven on purpose: a game weekend sells the Saturday first, so a card that
// showed the same number on all three nights would look generated.
//
// The range starts at 1, never 0. A zero here would mean "this room is sold out
// on that night", which the detail page honours by disabling its Reserve button —
// so a stray zero would hand a bookable property a dead room for no stated
// reason. Selling out is a property-level statement in this catalogue
// (`availability: 'unavailable'`), made deliberately, on one property.
function nightsLeft(i, r) {
  return NIGHT_DATES.map((date, n) => ({ date, roomsLeft: 1 + ((i * 3 + r * 5 + n * 4) % 10) }))
}

const RAW_STAYS = [
  ...CONTRACTED_HOTELS.map((h) => ({ ...h, brand: PARENT[h.brand] || h.brand, ...PROFILES[h.id] })),
  ...EXTRA,
]

export const STAYS = RAW_STAYS.map((h, i) => {
  const rooms = ROOM_LADDER.map((r) => ({
    id: r.id,
    name: r.name || h.roomType,
    rate: h.nightlyRate + r.delta,
    sleeps: r.sleeps,
    bed: r.bed,
  }))
  const soldOut = h.availability === 'unavailable'
  return {
    ...h,
    walkMin: walkMinutes(h.distanceMi),
    rooms,
    // ── Browse / detail derivations, all from the fields above ──
    seed: i * 7,
    city: 'Foxborough, MA',
    address: `${100 + i * 40} Patriot Place, Foxborough, MA 02035`,
    distance: `${h.distanceMi} mi from Gillette Stadium`,
    // fromNightly is the CHEAPEST room in the ladder, which is the first one —
    // the card's "From $X nightly" has to be a price the detail page can
    // actually sell, or the two screens argue with each other.
    fromNightly: rooms[0].rate,
    refundable: i % 3 !== 2,
    lowRateGuarantee: i % 2 === 0,
    preferred: !!h.preferred,
    ...coordsFor(i, h.distanceMi),
    // Per-room availability, shared by the browse card's Availability panel and
    // the detail page's room cards, so the two never disagree about a sell-out.
    availByRoom: rooms.map((r, ri) => ({
      roomId: r.id,
      type: r.name,
      nightly: r.rate,
      nights: soldOut ? NIGHT_DATES.map((date) => ({ date, roomsLeft: 0 })) : nightsLeft(i, ri),
    })),
    soldOut,
  }
})
export const stayById = (id) => STAYS.find((s) => s.id === id) || STAYS[0]
export const roomById = (hotelId, roomId) => {
  const stay = stayById(hotelId)
  return stay.rooms.find((r) => r.id === roomId) || stay.rooms[0]
}

// ── Tickets ──
// The library's derived tiers, unchanged, so a ticket costs the same here as it
// does on the sibling prototypes' ticket screens.
export const TIERS = deriveTiers(EVENT)
export const tierById = (id) => TIERS.find((t) => t.id === id) || TIERS[0]
export const MAX_TICKETS = 12

// ── Add-ons ──
// Five extras that are genuinely independent purchases: none of them needs a
// room, and only the shuttle even implies one. A guest who lives twenty minutes
// away can buy a parking pass and nothing else, and that is a valid order.
export const ADDONS = [
  { id: 'shuttle', name: 'Round-trip stadium shuttle', icon: 'directions_bus', price: 28, unit: 'seat', per: 'person', max: 12, blurb: 'Runs from the hotel block two hours before kickoff, and back from the north gate after the game.' },
  { id: 'parking', name: 'Event-day parking pass', icon: 'local_parking', price: 45, unit: 'pass', per: 'car', max: 4, blurb: 'Reserved lot P4 — a seven-minute walk to the gate, in and out all day.' },
  { id: 'tailgate', name: 'Pregame tailgate party', icon: 'outdoor_grill', price: 85, unit: 'ticket', per: 'person', max: 12, blurb: 'Hosted New England BBQ and a craft beer garden (21+), three hours before kickoff.' },
  { id: 'tour', name: 'Legends stadium tour', icon: 'tour', price: 120, unit: 'spot', per: 'person', max: 12, blurb: 'Locker room, tunnel and the Hall of Fame, guided, on the morning of the game.' },
  { id: 'lounge', name: 'Field Lounge access', icon: 'workspace_premium', price: 160, unit: 'pass', per: 'person', max: 12, blurb: 'All-game access to the field-level lounge, with premium catering included.' },
]
export const addonById = (id) => ADDONS.find((a) => a.id === id) || ADDONS[0]

// ── Pricing ──
// Every rate is a whole dollar and every derived figure is rounded once, so a
// total never drifts by a cent as lines come and go. Three rules:
//
//   • The trip saving exists ONLY when a stay and tickets are in the cart
//     together. It is a reward for combining, never a requirement to combine —
//     drop the tickets and the saving goes with them while the stay stands.
//   • The service fee applies to the ticketed items (tickets + add-ons). Lodging
//     doesn't carry it.
//   • Tax applies to the whole subtotal, after the saving.
//
// The shape is deliberately the one the library's CartReview computes in
// 'ticketing' mode (fees on the non-hotel lines, tax on the subtotal), so the
// checkout page can be handed these lines and arrive at the same total on its
// own arithmetic. A cart that totals differently on two screens would sink the
// demo faster than any missing feature.
export const FEE_RATE = 0.12
export const TAX_RATE = 0.09
export const BUNDLE_RATE = 0.08

export const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

/** What one trip line costs on its own — the only place a line price is decided. */
export function lineTotal(item) {
  if (item.kind === 'stay') return roomById(item.hotelId, item.roomId).rate * item.nights * item.rooms
  if (item.kind === 'ticket') return tierById(item.tierId).price * item.qty
  return addonById(item.addonId).price * item.qty
}

/** Whole-trip pricing, recomputed from the lines every time — never accumulated. */
export function priceTrip(items = []) {
  const of = (kind) => items.filter((i) => i.kind === kind).reduce((s, i) => s + lineTotal(i), 0)
  const stay = of('stay')
  const tickets = of('ticket')
  const addons = of('addon')
  const savings = stay > 0 && tickets > 0 ? Math.round(stay * BUNDLE_RATE) : 0
  const netStay = stay - savings
  const subtotal = netStay + tickets + addons
  const fees = Math.round((tickets + addons) * FEE_RATE)
  const taxes = Math.round(subtotal * TAX_RATE)
  return { stay, netStay, tickets, addons, savings, subtotal, fees, taxes, total: subtotal + fees + taxes }
}

// ── Line descriptions ──
// One place that turns a line into words, shared by the trip surfaces, the
// checkout cart and the confirmation blocks — so the same room never gets
// described three different ways on three screens.
export function lineTitle(item) {
  if (item.kind === 'stay') return stayById(item.hotelId).name
  if (item.kind === 'ticket') return `${tierById(item.tierId).name} ticket`
  return addonById(item.addonId).name
}
export function lineDetail(item) {
  if (item.kind === 'stay') {
    const room = roomById(item.hotelId, item.roomId)
    return `${room.name} · ${item.nights} night${item.nights === 1 ? '' : 's'} · ${item.rooms} room${item.rooms === 1 ? '' : 's'}`
  }
  if (item.kind === 'ticket') return `${item.qty} × ${money(tierById(item.tierId).price)} · ${EVENT.venue?.name || 'Gillette Stadium'}`
  const addon = addonById(item.addonId)
  return `${item.qty} × ${money(addon.price)} per ${addon.per}`
}

/** Check-in / check-out labels for a stay line, from the fixed event weekend. */
export const checkInLabel = () => NIGHT_DATES[0]
export const checkOutLabel = (nights) => CHECK_OUT_DATES[Math.min(nights, MAX_NIGHTS) - 1]

// ── Handing the trip to the library ──
// Checkout and confirmation are the library's own pages, and both read the shared
// "ticketing cart" shape ({ items: [{ type, label, sublabel, amount }], subtotal,
// fees, taxes, total }). This is the one translation between the two models, and
// it exists so those pages can be mounted as shipped rather than re-implemented
// here — a trip of any composition arrives as an ordinary itemized order.
//
// The stay line carries the NET amount with the saving named in its sublabel,
// rather than a gross line plus a discount line. CartReview sums its lines to get
// the subtotal and has no negative-line rendering, so a discount line would print
// as "$-46.00" and, worse, would be taxed as if it were a purchase.
export function buildTripCart(itemsIn = []) {
  const t = priceTrip(itemsIn)
  const items = []

  for (const line of itemsIn) {
    if (line.kind === 'stay') {
      const stay = stayById(line.hotelId)
      const room = roomById(line.hotelId, line.roomId)
      const nightsText = `${line.nights} night${line.nights === 1 ? '' : 's'} · ${line.rooms} room${line.rooms === 1 ? '' : 's'}`
      items.push({
        type: 'hotel',
        label: `${stay.name} · ${room.name}`,
        sublabel: t.savings ? `${nightsText} · ${money(t.savings)} trip saving applied` : nightsText,
        amount: t.netStay,
        image: stay.image,
        imageCategories: ['exterior', 'rooms', 'lobby'],
        // The per-night rows price the ROOMS the guest booked, not one room, so
        // the breakdown multiplies out to the stay the line is charging for.
        // hotelCartDetail() hard-codes a one-night King stay in its dates and its
        // room note — true for the fixture it was written for, not for a trip
        // whose nights and rooms are both variable. The three fields that depend
        // on those are re-stated here rather than patched in the library.
        hotelDetail: {
          ...hotelCartDetail({ ...stay, roomType: room.name, nightlyRate: room.rate * line.rooms }, line.nights),
          note: `${room.bed} · sleeps ${room.sleeps * line.rooms}${line.rooms > 1 ? ` across ${line.rooms} rooms` : ''} · near Gillette Stadium`,
          checkIn: `${checkInLabel()} · 3:00 PM`,
          checkOut: `${checkOutLabel(line.nights)} · 11:00 AM`,
        },
      })
    } else if (line.kind === 'ticket') {
      const t2 = tierById(line.tierId)
      items.push({
        type: 'ticket',
        // The quantity is in the LABEL rather than passed as an editable
        // unitPrice + qty: CartReview's quantity dropdown edits its own deep copy
        // of the cart, which would leave checkout showing a number the trip never
        // heard about. Quantities are edited in the trip; checkout states them.
        label: `${line.qty} × ${t2.name} ticket`,
        sublabel: `${money(t2.price)} each · ${EVENT.venue?.name || 'Gillette Stadium'}`,
        amount: lineTotal(line),
      })
    } else {
      const a = addonById(line.addonId)
      items.push({
        type: 'experience',
        label: `${line.qty} × ${a.name}`,
        sublabel: `${money(a.price)} per ${a.per}`,
        amount: lineTotal(line),
      })
    }
  }

  return {
    items,
    subtotal: t.subtotal, fees: t.fees, taxes: t.taxes, total: t.total,
    currency: 'USD', feeRate: FEE_RATE, taxRate: TAX_RATE,
    // The guarantees block is about tickets — an add-ons-only order has no seats
    // to reassure anyone about, so it isn't shown one.
    ticketDetails: itemsIn.some((i) => i.kind === 'ticket') ? ticketDetails({ section: 'CL10', row: '12' }) : [],
  }
}
