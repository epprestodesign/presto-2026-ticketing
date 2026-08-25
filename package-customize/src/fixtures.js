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
 * The cart for a CONFIGURED package — the one `priced.pkgForCart` reshaped with
 * the chosen tier, party size, hotel, room and extras. All the arithmetic already
 * happened in `priceConfiguration()`; this only builds the cart.
 *
 * No extras are appended as their own cart lines, unlike the sibling prototypes.
 * There, the one room upsell sits OUTSIDE the bundle and has to be charged
 * separately; here every extra is inside the package price, so a line with its
 * own amount would bill it twice. They appear instead as rows inside the
 * package's expandable "what's inside" list (see `experiences` in configured.js).
 *
 * @param {object} pkgForCart from configured.js `priced.pkgForCart`
 */
export function cartFor(pkgForCart) {
  if (!pkgForCart) return packagesHotelCartSplit
  const cart = retime({ ...buildPackageCart(pkgForCart, { separateHotel: true }), ...detail })

  // `buildPackageCart` attaches re-pricing metadata so the checkout cart can show
  // a party-size stepper. Stripped here: that stepper re-prices with the
  // LIBRARY's formula — scale the tickets, hold everything else — which is right
  // for a package whose extras are baked in, and wrong for this one, where a
  // hospitality wristband and a lounge pass are per head. Two controls disagreeing
  // about the same number is worse than one control in the right place, and the
  // right place is the customize screen.
  cart.items = cart.items.map((it) => (it.reprice ? { ...it, reprice: null, qty: pkgForCart.quantity } : it))
  return cart
}
