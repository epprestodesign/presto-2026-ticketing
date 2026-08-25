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

// ── PARTY SIZE IS THE QUANTITY ──────────────────────────────────────────────
// A tier is now an in/out decision, not a number: whatever the party size on the
// room is, that is how many of the tier get bought. Two people means two passes.
//
// The rejected alternative was the per-tier stepper this screen used to carry.
// It let a family of four leave checkout holding three weekend passes and four
// park tickets — an order that is internally inconsistent and that nobody in the
// room could explain at the doors. One number for the whole trip cannot drift.
//
// The single honest exception is INVENTORY: the athlete credential is rationed
// to 6, so a party of 8 gets 6. The card and the cart both say so out loud
// rather than silently under-buying (see `tierQtyNote`).
export const tierQty = (t, guests) => (!t || t.count <= 0 ? 0 : Math.min(guests, t.count))

/** The sentence a line prints where its stepper used to be. */
export function tierQtyNote(t, guests) {
  const q = tierQty(t, guests)
  if (q < guests) return `${q} of ${guests} — only ${t.count} credential${t.count === 1 ? '' : 's'} left`
  return `${q} guest${q === 1 ? '' : 's'} — matches your party`
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
