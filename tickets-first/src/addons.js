// The gameday extras, and the cart they feed.
//
// Aug 25 (evening): these used to be a STEP between the hotel and the cart.
// They are now sold from inside the cart itself — the nav's peek and the review
// screen, both through TripCartBody → CartAddOns — because the stepper was cut
// to three labels (Tickets · Hotel · Review). NOTHING IN THIS FILE CHANGED for
// that move: same four offers, same prices, same units, same hotel dependency,
// same cart arithmetic. The offers outlived the screen that introduced them,
// which is the point of keeping the model here rather than in the step.
//
// PROTOTYPE DATA. The library ships hotels (CONTRACTED_HOTELS) and pre-baked
// ticket+hotel+experience SKUs (generateExperiencePackages), but nothing for
// extras a guest adds ONE AT A TIME to a trip they are already assembling. A
// package's experiences are welded to it — you take the SKU or you don't. Here
// each extra is its own decision with its own price and its own cart line, so
// they need their own model.
//
// Every extra is priced per unit and scaled by something the guest already
// decided, not by a free-floating number:
//
//   unit: 'guest'   → quantity IS the ticket count. Four tickets, four tailgate
//                     wristbands; change the ticket count in the cart and these
//                     re-price with it. A per-guest extra whose quantity could
//                     drift from the ticket count would let a guest buy three
//                     hospitality passes for four people, which the venue would
//                     not honour anyway.
//   unit: 'vehicle' → its own count, because cars don't follow headcount: four
//                     people can arrive in one car or three.
//
// `requiresHotel` is the one dependency between the parts of a trip: a
// round-trip transfer leaves from the hotel lobby, so with no hotel in the trip
// there is nowhere for it to leave from. It used to be why extras came AFTER the
// hotel step; with the step gone, the ordering no longer states it and the offer
// has to. CartAddOns renders the transfer disabled with that reason and a link
// to the hotel step — never absent — and setHotel(null) in App.vue drops it back
// off the trip when the stay is removed.
import { hotelCartDetail, ticketDetails } from '@lib/lib/bundles.js'

// Kickoff is Sun Dec 6, 2026 at 4:25 PM ET (the event fixture's real start
// time). Every "opens/departs" note below is derived from it by hand rather
// than computed, so the copy reads like a venue wrote it.
export const ADD_ONS = [
  {
    id: 'parking',
    name: 'Prepaid Gameday Parking',
    icon: 'local_parking',
    unit: 'vehicle',
    price: 65,
    tagline: 'Skip the cash lane — your pass is scanned at the gate.',
    meta: 'Lot 6 · 4 min walk to Gate A',
    // Shown in the cart line and on the confirmation itinerary.
    note: 'Lots open 12:25 PM. Pass lands in your EventPipe wallet on gameday morning.',
    maxUnits: 4,
  },
  {
    id: 'tailgate',
    name: 'Ultimate Tailgate Party',
    icon: 'outdoor_grill',
    unit: 'guest',
    price: 95,
    tagline: 'The full pregame party — catered, hosted, and three hours long.',
    meta: 'Patriot Place Lot 22 · opens 1:25 PM',
    note: 'All-you-can-eat New England BBQ, craft beer garden (21+), and games until kickoff.',
  },
  {
    id: 'transfer',
    name: 'Round-Trip Stadium Transfer',
    icon: 'directions_bus',
    unit: 'guest',
    price: 42,
    tagline: 'Motorcoach from your hotel lobby and back after the final whistle.',
    meta: 'Departs 2:00 PM · returns 30 min after the game',
    note: 'Reserved seats on the EventPipe coach. No parking, no driving, no waiting on a rideshare surge.',
    // Only offerable once a hotel is in the trip — see the note at the top.
    requiresHotel: true,
  },
  {
    id: 'hospitality',
    name: 'Pregame Hospitality Club',
    icon: 'restaurant',
    unit: 'guest',
    price: 120,
    tagline: 'An indoor pregame with a chef-attended buffet and an open bar.',
    meta: 'Optum Field Lounge · opens 2:25 PM',
    note: 'Climate-controlled, seated, and a two-minute walk from your section.',
  },
]

export const addOnById = (id) => ADD_ONS.find((a) => a.id === id) || null

// Bundling credit — 10% off the parts EventPipe actually contracts (the room
// block and the extras). Ticket face value is set by the team and never
// discounted, which is also why it is excluded here rather than folded into one
// blended percentage: a guest comparing the ticket line against Ticketmaster
// should find the same number.
export const BUNDLE_CREDIT_RATE = 0.1
// Ticketing service fee, charged on tickets only — the same rate the library's
// buildBundleCart() uses, so a ticket line prices identically in both carts.
export const FEE_RATE = 0.18
export const TAX_RATE = 0.09

/**
 * How many units of an extra a trip buys: per-guest extras take the ticket
 * count, per-vehicle extras take the count the guest set on the card.
 */
export function unitsFor(addOn, { guests = 2, vehicles = 1 } = {}) {
  return addOn.unit === 'vehicle' ? vehicles : guests
}

/** Is this extra offerable given what's in the trip so far? */
export function isOfferable(addOn, { hotel = null } = {}) {
  return !addOn.requiresHotel || !!hotel
}

/**
 * The unified trip cart: tickets, the optional stay, and every chosen extra as
 * its own line, in the library's cart item shape so BundleConfirmation and the
 * library's ticketing CartReview can both read it.
 *
 * The library's buildBundleCart() was the obvious starting point and was
 * rejected: it takes exactly one ticket line plus one optional hotel and
 * derives subtotal/fees/taxes/total inside itself, with no seam for extra lines
 * or the bundle credit. Rebuilding the totals around it would leave two
 * functions computing the same total from different inputs. Its two genuinely
 * reusable pieces — hotelCartDetail() and ticketDetails() — are imported above
 * instead, so the hotel sub-block and the ticket guarantees are the library's.
 */
export function buildTripCart({
  event, tier, quantity = 2, hotel = null, room = null, nights = 1,
  addOns = [], vehicles = 1, section = 'CL10', row = '12',
}) {
  const items = []

  // The stay is the PROPERTY with the chosen ROOM's name and rate written over
  // it. Everything downstream — the cart line, hotelCartDetail(), the itinerary,
  // the checkout rail — already reads `roomType` and `nightlyRate` off a hotel
  // object, so overlaying the room here means the room reaches all four without
  // any of them learning a new shape. Falling back to the property's own
  // contracted room keeps a link that names no room priced exactly as this
  // prototype priced it before rooms existed.
  const stay = hotel ? { ...hotel, roomType: room?.name || hotel.roomType, nightlyRate: room?.nightly ?? hotel.nightlyRate } : null

  const ticketSubtotal = (tier?.price ?? 0) * quantity
  items.push({
    type: 'ticket',
    label: `${tier?.name ?? 'Ticket'} ticket`,
    sublabel: `${event?.venue?.name ?? 'Venue'} · Section ${section}, Row ${row}`,
    amount: ticketSubtotal, unitPrice: tier?.price ?? 0, qty: quantity, maxQty: 8,
  })

  const hotelTotal = stay ? stay.nightlyRate * nights : 0
  if (stay) {
    items.push({
      type: 'hotel',
      label: `${stay.name} · ${stay.roomType}`,
      sublabel: `${nights} night${nights === 1 ? '' : 's'} · ${stay.distanceMi} mi from the venue`,
      amount: hotelTotal, image: stay.image,
      // hotelCartDetail() is the library's, and its `note` is the one field it
      // hard-codes ("1 King Bed · Sleeps 2") — true of the fixture it was written
      // for and false the moment a guest picks the two-queen. Overwritten here
      // rather than patched there: the library is read-only, and the bed a guest
      // just chose is the one thing on that block they will check.
      hotelDetail: room
        ? { ...hotelCartDetail(stay, nights), note: `${room.bed} · Sleeps ${room.sleeps} · Near Gillette Stadium` }
        : hotelCartDetail(stay, nights),
    })
  }

  // Extras keep source order (ADD_ONS), not click order. That mattered on the
  // old extras step and matters more now that they are added FROM the cart: a
  // list that reshuffled itself as you added to it would move the next row out
  // from under the cursor.
  const chosen = ADD_ONS.filter((a) => addOns.includes(a.id) && isOfferable(a, { hotel }))
  let addOnTotal = 0
  for (const addOn of chosen) {
    const units = unitsFor(addOn, { guests: quantity, vehicles })
    const amount = addOn.price * units
    addOnTotal += amount
    items.push({
      // 'experience' rather than an 'addon' type of our own: the library's cart
      // and confirmation already icon and section that type, and an unknown
      // type would fall back to a generic shopping bag in both.
      type: 'experience',
      addOnId: addOn.id, icon: addOn.icon, unit: addOn.unit, note: addOn.note,
      label: addOn.name,
      sublabel: `${units} × ${addOn.unit === 'vehicle' ? 'vehicle' : 'guest'}${units === 1 ? '' : 's'} · ${addOn.meta}`,
      amount, unitPrice: addOn.price, qty: units,
    })
  }

  const subtotal = ticketSubtotal + hotelTotal + addOnTotal
  // The credit applies to the contracted parts only (see BUNDLE_CREDIT_RATE),
  // and it is a real deduction, not a struck-through "was" price — taxes are
  // charged on what's left after it.
  const credit = Math.round((hotelTotal + addOnTotal) * BUNDLE_CREDIT_RATE)
  const fees = Math.round(ticketSubtotal * FEE_RATE)
  const taxes = Math.round((subtotal - credit) * TAX_RATE)

  return {
    items, ticketSubtotal, hotelTotal, addOnTotal,
    subtotal, credit, fees, taxes,
    total: subtotal - credit + fees + taxes,
    savings: credit, currency: 'USD', feeRate: FEE_RATE, taxRate: TAX_RATE,
    ticketDetails: ticketDetails({ section, row }),
  }
}

/**
 * The same trip, reshaped for the CHECKOUT rail — the library's CartReview in
 * `ticketing` mode, mounted inside CheckoutPageExpanded.
 *
 * CartReview does not read a total; it derives its own from the lines it is
 * given, and the two places its arithmetic differs from this trip's are the two
 * things this function fixes.
 *
 * 1. IT RE-PRICES EDITABLE LINES. Any line carrying a `unitPrice` becomes a
 *    control — a ticket dropdown that re-prices CartReview's own deep copy of
 *    the cart. On the review step that is the point; on the payment page it is a
 *    number the trip never sees, and the cart, the rail and the confirmation
 *    would stop agreeing halfway through paying. So the checkout lines carry
 *    amounts only. Editing belongs one screen back, in the one place that owns
 *    the trip, and the checkout says so with a link rather than a stepper.
 *
 * 2. IT CHARGES ITS OWN FEES AND TAXES:
 *      fees  = round(Σ non-hotel lines × feeRate)
 *      taxes = round(Σ every line      × taxRate)
 *    The tax base already agrees — with the credit as a line, Σ every line IS
 *    the after-credit subtotal this trip taxes. The fee base does not: the
 *    service fee here is charged on TICKETS ONLY (see FEE_RATE), and CartReview
 *    would spread it over the extras too. So the rail is handed the rate that
 *    reproduces this trip's fee from the rail's own base.
 *
 *    The two alternatives were both worse. Charging fees on the extras so the
 *    library's formula happens to fit changes what a guest pays to suit a
 *    component's arithmetic. Patching CartReview breaks the rule every prototype
 *    here follows — the library is read-only.
 */
export function buildCheckoutCart(cart) {
  if (!cart) return null

  const items = cart.items.map(({ unitPrice, maxQty, ...line }) => line)

  if (cart.credit > 0) {
    items.push({
      // The credit inherits the TYPE of the line above it deliberately.
      // CartReview starts a new section whenever a line's type maps to a
      // different section heading, and a deduction is not a section: inheriting
      // puts it under "Hotel" when it follows the stay and under "Experiences"
      // when it follows the extras — which is where it was earned either way.
      type: items[items.length - 1]?.type || 'ticket',
      label: 'Bundle credit',
      sublabel: `${Math.round(BUNDLE_CREDIT_RATE * 100)}% off your stay and gameday extras`,
      amount: -cart.credit,
    })
  }

  const feeBase = items.filter((i) => i.type !== 'hotel').reduce((s, i) => s + i.amount, 0)

  return {
    ...cart,
    items,
    feeRate: feeBase ? cart.fees / feeBase : 0,
    taxRate: TAX_RATE,
    // The credit is a LINE on this rail, not a badge. `savings` would render a
    // second "Bundle savings −$54" under a total that has already deducted it.
    savings: 0,
    // The rail's hold countdown. Fixed, not derived from the clock, so a demo
    // opens on the same number every time.
    heldSeconds: 895,
  }
}
