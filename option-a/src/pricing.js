// Live package pricing (Aug 4 rework v3).
//
// A package is no longer a fixed SKU: inside the modal you pick the ticket TIER,
// how many PEOPLE are included, and — when the package has a stay — the hotel,
// the room type, and any paid extra. Every one of those re-prices the package.
//
// The arithmetic follows the library's own convention (see PackageCard): the
// ticket portion scales with the party, the baked-in experience value stays put,
// and the package's original bundle-discount RATE is re-applied to the new
// components total, so the struck-through "value" and the price stay consistent.
//
//   components = tier.price × guests + room.nightly × nights + experience value
//   package    = round(components × (1 − discountRate))
//   total      = package + paid extras            (add-ons sit outside the bundle)
import { deriveTiers } from '@lib/lib/seatmap.js'
import { EVENT } from './event.js'

// What each tier gets you, beyond the library's one-line description.
const TIER_PERKS = {
  lower: ['Closest to the field', 'Sideline & end-zone views', 'Fastest gate access'],
  club: ['Indoor climate-controlled lounge', 'In-seat wait service', 'Upscale club dining'],
  mezz: ['Elevated corner & sideline views', 'Covered concourse', 'Shorter concession lines'],
  upper: ['The full-stadium view', 'Best value of the four', 'Same gameday experiences'],
}

/** The event's ticket tiers, most expensive first, with prototype perk copy. */
export const TIERS = deriveTiers(EVENT, 'stadium')
  .map((t) => ({ ...t, perks: TIER_PERKS[t.id] || [] }))
  .sort((a, b) => b.price - a.price)

export const resolveTier = (tierId, fallbackTierId) =>
  TIERS.find((t) => t.id === tierId) ||
  TIERS.find((t) => t.id === fallbackTierId) ||
  TIERS[0]

/**
 * Price a package against a configuration.
 *
 * @param {object} pkg   a package from ./packages.js
 * @param {object} cfg   { tier, guests, hotel, room, extra }
 * @returns {object} the price breakdown plus `pkgForCart` — the package reshaped
 *                   with the configured values, ready for the cart builders.
 */
export function priceConfig(pkg, cfg = {}) {
  if (!pkg) return null
  const { tier, guests = pkg.quantity || 2, hotel = null, room = null, extra = null } = cfg

  const nights = pkg.hotel ? (pkg.nights || 1) : 0
  const origTicketTotal = (pkg.ticket?.price ?? 0) * (pkg.quantity || 2)
  const origHotelTotal = pkg.hotel?.hotelTotal ?? 0

  // Whatever the package bundles beyond tickets and the room — held constant.
  const experienceValue = Math.max(0, (pkg.componentsTotal ?? 0) - origTicketTotal - origHotelTotal)
  const discountRate = pkg.componentsTotal
    ? (pkg.componentsTotal - pkg.packagePrice) / pkg.componentsTotal
    : 0

  const activeTier = tier || resolveTier(null, pkg.ticket?.tierId)
  const ticketTotal = (activeTier?.price ?? 0) * guests

  // A chosen room sets the nightly rate; otherwise the package's own hotel does.
  const nightly = room?.nightly ?? hotel?.nightlyRate ?? pkg.hotel?.nightlyRate ?? 0
  const hotelTotal = pkg.hotel ? nightly * nights : 0

  const componentsTotal = ticketTotal + hotelTotal + experienceValue
  const packagePrice = Math.round(componentsTotal * (1 - discountRate))
  const extraCost = extra && extra.id !== 'none' && pkg.hotel ? extra.price : 0
  const total = packagePrice + extraCost

  return {
    tier: activeTier,
    guests,
    nights,
    ticketTotal,
    hotelTotal,
    experienceValue,
    componentsTotal,
    packagePrice,
    savings: componentsTotal - packagePrice,
    extraCost,
    total,
    // The package as configured — what the cart/confirmation builders consume.
    pkgForCart: {
      ...pkg,
      quantity: guests,
      ticket: { tierId: activeTier.id, tierName: activeTier.name, price: activeTier.price, colorVar: activeTier.colorVar },
      hotel: pkg.hotel
        ? {
            ...pkg.hotel,
            ...(hotel ? { id: hotel.id, name: hotel.name, nightlyRate: nightly } : {}),
            roomType: room ? `${room.name} · ${room.bed}` : (hotel?.roomType ?? pkg.hotel.roomType),
            nightlyRate: nightly,
            hotelTotal,
          }
        : null,
      nights,
      componentsTotal,
      packagePrice,
      savings: componentsTotal - packagePrice,
    },
  }
}
