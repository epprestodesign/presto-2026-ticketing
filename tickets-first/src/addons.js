// The gameday extras offered after the hotel step, and the cart they feed.
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
// `requiresHotel` is the one dependency between steps: a round-trip transfer
// leaves from the hotel lobby, so with no hotel in the trip there is nowhere
// for it to leave from. That is why extras come AFTER the hotel step rather
// than beside the tickets — the hotel answer changes what can be offered.
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
  event, tier, quantity = 2, hotel = null, nights = 1,
  addOns = [], vehicles = 1, section = 'CL10', row = '12',
}) {
  const items = []

  const ticketSubtotal = (tier?.price ?? 0) * quantity
  items.push({
    type: 'ticket',
    label: `${tier?.name ?? 'Ticket'} ticket`,
    sublabel: `${event?.venue?.name ?? 'Venue'} · Section ${section}, Row ${row}`,
    amount: ticketSubtotal, unitPrice: tier?.price ?? 0, qty: quantity, maxQty: 8,
  })

  const hotelTotal = hotel ? hotel.nightlyRate * nights : 0
  if (hotel) {
    items.push({
      type: 'hotel',
      label: `${hotel.name} · ${hotel.roomType}`,
      sublabel: `${nights} night${nights === 1 ? '' : 's'} · ${hotel.distanceMi} mi from the venue`,
      amount: hotelTotal, image: hotel.image,
      hotelDetail: hotelCartDetail(hotel, nights),
    })
  }

  // Extras keep source order (ADD_ONS), not click order, so the cart doesn't
  // reshuffle as a guest adds and removes things at the extras step.
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
