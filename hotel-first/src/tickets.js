// Tournament admission — the ticket catalogue for Spirit Nationals.
//
// This is where the re-frame bites hardest. An NFL tier list sells you a LOCATION
// (Club, Lower Bowl, Mezzanine) for one kickoff; a youth tournament sells you
// ACCESS TO DAYS. So the axis of the list is the calendar, not the seat map, and
// the sibling seat-map/section browse is deliberately not used here — there is no
// section to choose when spectators sit on bleachers around eight competition mats.
//
// The two exceptions at the ends of the list are what make it read as a real
// tournament rather than a generic pass list: an athlete wristband (a credential,
// not a seat, priced low and rationed) and mat-side finals seating (the one
// genuinely scarce thing in the building, and sold out — which is the honest state
// for finals seating three months out).
//
// Counts are fixed, not generated, so the availability states (plentiful /
// limited / sold out) are the same on every load.
export const TICKET_TIERS = [
  {
    id: 'weekend',
    name: 'Weekend Spectator Pass',
    desc: 'All three competition days — Friday warm-ups through Sunday finals & awards.',
    price: 89,
    currency: 'USD',
    colorVar: '--ds-palette-navy-600',
    count: 240,
    days: 'Fri 2/12 – Sun 2/14',
    note: 'Best value if your athlete competes more than one day.',
  },
  {
    id: 'sunday',
    name: 'Sunday Finals Day Pass',
    desc: 'Finals and the awards ceremony. Doors 8:00 AM, awards from 4:30 PM.',
    price: 55,
    currency: 'USD',
    colorVar: '--ds-palette-blue-600',
    count: 88,
    days: 'Sun 2/14',
  },
  {
    id: 'saturday',
    name: 'Saturday Prelims Day Pass',
    desc: 'Level 4–6 preliminaries and semifinals across all eight mats.',
    price: 45,
    currency: 'USD',
    colorVar: '--ds-palette-teal-600',
    count: 140,
    days: 'Sat 2/13',
  },
  {
    id: 'athlete',
    name: 'Athlete Credential Wristband',
    desc: 'Required for every competing athlete. Includes warm-up hall and back-of-house access.',
    price: 25,
    currency: 'USD',
    colorVar: '--ds-palette-amber-600',
    count: 6,
    days: 'All days',
    note: 'Your gym may have already registered your athlete — check before adding.',
  },
  {
    id: 'matside',
    name: 'Mat-Side Finals Seating',
    desc: 'Reserved front-row chairs at Mat 1 for Sunday finals.',
    price: 149,
    currency: 'USD',
    colorVar: '--ds-palette-red-600',
    count: 0,
    days: 'Sun 2/14',
  },
]

export const TICKETS_BY_ID = Object.fromEntries(TICKET_TIERS.map((t) => [t.id, t]))

// ── PARTY SIZE IS THE BUDGET, NOT THE QUANTITY (Sep 1) ─────────────────────
// Each admission tier carries its own quantity again, and the SUM of them is
// capped at the party size.
//
// WHAT THIS REVERSES, AND WHY. An earlier round made a tier a pure in/out
// decision pinned to party size, to stop a family of four leaving checkout with
// three weekend passes and four park tickets — an order nobody at the door
// could explain. That reasoning holds for ADD-ONS, where every person needs the
// same thing, and add-ons still follow the party size unchanged.
//
// It does not hold for ADMISSION, because one party needs DIFFERENT
// credentials. A cheer family of four is normally one competing athlete and
// three spectators: one athlete wristband, three spectator passes. Under the
// pinned model that order could not be expressed at all — switching both tiers
// on bought four of each. Reported directly: "When made for 4 people, I can't
// actually make it work for 3 spectators and 1 participant. I can only do 4."
//
// The cap is what keeps the original guarantee. Quantities are free to differ
// per tier, but they cannot sum past the number of people on the room, so the
// order still describes a real party — and the screen says how many people are
// still uncovered rather than leaving it to be discovered at the doors.
//
// INVENTORY still bounds a tier on its own: the athlete credential is rationed
// to 6, so a party of 8 can buy at most 6 of them however the rest is split.
/**
 * The quantity a tier STARTS at when it is switched on — not the quantity it is
 * pinned to. Capped by inventory, and never more than the party has people left
 * to cover (see `remainingToCover` in store.js).
 */
export const tierQty = (t, guests) => (!t || t.count <= 0 ? 0 : Math.min(guests, t.count))

/** How many of a tier a guest may set: inventory, and the unassigned party. */
export const tierMax = (t, guests, assignedElsewhere = 0) =>
  !t || t.count <= 0 ? 0 : Math.max(0, Math.min(t.count, guests - assignedElsewhere))

/** The sentence a line prints under its stepper. */
export function tierQtyNote(t, guests, qty = 0, assignedElsewhere = 0) {
  const max = tierMax(t, guests, assignedElsewhere)
  if (t.count < guests && qty >= t.count) {
    return `${qty} of ${guests} — only ${t.count} credential${t.count === 1 ? '' : 's'} left`
  }
  if (qty === 0) return max === 0 ? 'Everyone in your party already has admission' : `Up to ${max} available`
  return `${qty} of ${guests} in your party`
}

// A tier is selectable only while it has inventory. TicketCategoryCard reads
// `soldOut` directly, so derive it here rather than hand-maintaining both.
export const ticketCategories = () => TICKET_TIERS.map((t) => ({ ...t, soldOut: t.count <= 0 }))

/** Selected quantities ({ tierId: qty }) → priced lines, in catalogue order. */
export function ticketLines(selection = {}) {
  return TICKET_TIERS
    .filter((t) => (selection[t.id] || 0) > 0)
    .map((t) => ({ ...t, qty: selection[t.id], amount: t.price * selection[t.id] }))
}

export const ticketCount = (selection = {}) =>
  TICKET_TIERS.reduce((n, t) => n + (selection[t.id] || 0), 0)

export const ticketSubtotal = (selection = {}) =>
  TICKET_TIERS.reduce((n, t) => n + (selection[t.id] || 0) * t.price, 0)
