// Destination add-ons — the step this prototype exists to test.
//
// The premise: a family flies to Orlando for a cheer tournament and, while they
// are there, buys the city. That second purchase is normally a separate trip to a
// separate site days later; here it is a step inside the same cart, between
// picking tickets and paying.
//
// Three rules the catalogue follows, because they are what keeps the step from
// feeling like an upsell wall:
//
//   1. EVERYTHING IS OPTIONAL AND STARTS AT ZERO. Nothing is pre-added. A guest
//      who wants only a hotel and a wristband can pass straight through.
//   2. EVERY ITEM SAYS WHEN IT FITS. A park day on Saturday is a park day the
//      athlete's family cannot take, so each add-on states the day it works
//      against the competition schedule rather than leaving the guest to plan it.
//   3. PRICING UNITS ARE EXPLICIT. Park tickets are per guest; a shared airport
//      van is per booking. The card shows which, so the total is never a surprise.
//
// Vendor names are real Orlando attractions used illustratively for a prototype;
// prices are representative, not quoted.
export const ADD_ONS = [
  {
    id: 'disney',
    name: 'Walt Disney World 1-Day Ticket',
    vendor: 'Walt Disney World Resort',
    price: 139,
    unit: 'guest',
    icon: 'castle',
    accentVar: '--ds-palette-purple-600',
    blurb: 'One park per day, valid any day of your stay — including the Monday after finals.',
    when: 'Best on Mon, Feb 15 — after awards',
    includes: [
      'Choice of Magic Kingdom, EPCOT, Hollywood Studios or Animal Kingdom',
      'Date-flexible within your stay window',
      'Linked to your EventPipe order — no separate ticket pickup',
    ],
    badge: 'Most added',
  },
  {
    id: 'universal',
    name: 'Universal Orlando Park-to-Park',
    vendor: 'Universal Orlando Resort',
    price: 199,
    unit: 'guest',
    icon: 'attractions',
    accentVar: '--ds-palette-blue-600',
    blurb: 'Both parks in one day with the Hogwarts Express between them.',
    when: 'Best on Fri, Feb 12 or Mon, Feb 15',
    includes: [
      'Universal Studios Florida + Islands of Adventure',
      'Hogwarts Express park-to-park transfer',
      'Mobile entry in the EventPipe app',
    ],
  },
  {
    id: 'seaworld',
    name: 'SeaWorld Orlando 1-Day Any-Day',
    vendor: 'SeaWorld Orlando',
    price: 109,
    unit: 'guest',
    icon: 'waves',
    accentVar: '--ds-palette-teal-600',
    blurb: 'A shorter park day — the one that fits between Friday warm-ups and Saturday prelims.',
    when: 'Any day of your stay',
    includes: [
      'All-day park admission',
      'Reserved seating at one show',
      'Under 10 minutes from the Convention Center',
    ],
  },
  {
    id: 'character',
    name: 'Character Breakfast',
    vendor: 'Hosted at your hotel',
    price: 59,
    unit: 'guest',
    icon: 'restaurant',
    accentVar: '--ds-palette-amber-600',
    blurb: 'Buffet with character meet-and-greets, seated 7:30 AM so you still make call time.',
    when: 'Sat, Feb 13 — before prelims',
    includes: [
      'Full buffet with a dedicated team table',
      'Four character visits and photos',
      'Ends 8:45 AM — ahead of the 10:00 AM warm-up block',
    ],
  },
  {
    id: 'transfer',
    name: 'MCO Airport Round-Trip Transfer',
    vendor: 'EventPipe Ground Transport',
    price: 145,
    unit: 'booking',
    icon: 'airport_shuttle',
    accentVar: '--ds-palette-green-600',
    blurb: 'Private van from Orlando International to your hotel and back, with room for uniform bags.',
    when: 'Arrival Fri, Feb 12 · return Mon, Feb 15',
    includes: [
      'Up to 6 passengers and 8 bags per van',
      'Meet-and-greet at baggage claim',
      'Return pickup timed to your flight',
    ],
  },
  {
    id: 'iconpark',
    name: 'ICON Park Wheel + Aquarium Combo',
    vendor: 'ICON Park International Drive',
    price: 32,
    unit: 'guest',
    icon: 'local_activity',
    accentVar: '--ds-palette-orange-600',
    blurb: 'Two hours, walking distance from the block — the evening option that is not a full park day.',
    when: 'Any evening of your stay',
    includes: [
      'The Wheel at ICON Park observation ride',
      'SEA LIFE Orlando Aquarium entry',
      '0.7 mi from the Convention Center',
    ],
  },
]

export const ADD_ONS_BY_ID = Object.fromEntries(ADD_ONS.map((a) => [a.id, a]))

/** Selected quantities ({ addOnId: qty }) → priced lines, in catalogue order. */
export function addOnLines(selection = {}) {
  return ADD_ONS
    .filter((a) => (selection[a.id] || 0) > 0)
    .map((a) => ({ ...a, qty: selection[a.id], amount: a.price * selection[a.id] }))
}

// How many DIFFERENT add-ons are on the order. Counting units instead would read
// as "9 add-ons" for a family of four buying two products plus a van — a number
// that is true of nothing the guest recognises.
export const addOnCount = (selection = {}) =>
  ADD_ONS.filter((a) => (selection[a.id] || 0) > 0).length

export const addOnSubtotal = (selection = {}) =>
  ADD_ONS.reduce((n, a) => n + (selection[a.id] || 0) * a.price, 0)

// The unit qualifier printed after the price, and in the cart sublabel.
export const unitLabel = (a) => (a.unit === 'booking' ? 'per booking' : 'per guest')
