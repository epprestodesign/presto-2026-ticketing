// Cart fixtures for this prototype, rebuilt around THIS app's event.
//
// The library's @lib/stories/ticketing/_ticketing-flow-carts.js exports carts
// already built from its sample Patriots v Bills fixture. This module runs the
// same builders with our Steelers at Patriots event, then `retime()`s the result
// so the hotel-stay dates baked into @lib/lib/bundles.js (the December gameday
// weekend) land on this game's Sat Sep 19 → Sun Sep 20 stay.
//
// Same exports, same shapes as the library module — screens import from here.
import {
  buildPackageCart,
  ticketDetails,
  CONTRACTED_HOTELS,
  generateExperiencePackages,
  stripHotel,
} from '@lib/lib/bundles.js'
import { deriveTiers } from '@lib/lib/seatmap.js'
import { EVENT, retime } from './event.js'

export const event = EVENT
export const tier = deriveTiers(event)[1] // Club
export const hotel = CONTRACTED_HOTELS[1] // The Westin

export const pkgOnly = retime(stripHotel(generateExperiencePackages(event, { nights: 1 })[0]))
export const pkgHotel = retime(generateExperiencePackages(event, { nights: 1 })[0])

// Shared seat-detail rows (ticket info; EventPipe-framed).
const detail = { ticketDetails: ticketDetails({ section: 'CL10', row: '12' }) }

export const packagesHotelCart = retime({ ...buildPackageCart(pkgHotel), ...detail })
// Same package + hotel with the stay broken out into its own "Included" cart
// section, so the checkout rail matches the Tickets + Hotel one.
export const packagesHotelCartSplit = retime({
  ...buildPackageCart(pkgHotel, { separateHotel: true }),
  ...detail,
})

/**
 * The cart for a CONFIGURED package — the one `priceConfig()` reshaped with the
 * chosen tier, party size, hotel and room. All the arithmetic already happened
 * there; this just builds the cart and appends any paid extra as its own line.
 *
 * @param {object} pkgForCart from priceConfig().pkgForCart
 * @param {object|null} extra an entry from ROOM_EXTRAS
 */
export function cartFor(pkgForCart, extra = null) {
  if (!pkgForCart) return packagesHotelCartSplit
  const cart = pkgForCart.hotel
    ? retime({ ...buildPackageCart(pkgForCart, { separateHotel: true }), ...detail })
    : retime({ ...buildPackageCart(pkgForCart), ...detail })

  const extraCost = extra && extra.id !== 'none' && pkgForCart.hotel ? extra.price : 0
  if (extraCost && Array.isArray(cart.items)) {
    cart.items = [...cart.items, { type: 'extra', label: extra.label, sublabel: 'Room option · per stay', amount: extraCost, qty: 1 }]
  }
  return cart
}
