// Shared fixtures for the "Aug 4 Changes" stories.
//
// Everything here comes from the prototype's own data layer, so a story shows the
// same numbers the running app does rather than hand-written stand-ins.
import { packageGrid } from '../src/packages.js'
import { hotelOptionsFor } from '../src/hotelOptions.js'
import { roomsFor, ROOM_EXTRAS } from '../src/rooms.js'
import { TIERS, priceConfig, resolveTier } from '../src/pricing.js'
import { inclusionsFor } from '../src/packageDetail.js'

export const PACKAGES = packageGrid.value
export const HOTEL_PACKAGES = PACKAGES.filter((p) => p.hotel)
export const ONLY_PACKAGES = PACKAGES.filter((p) => !p.hotel)

export const pkgWithHotel = HOTEL_PACKAGES[0]
export const pkgOnly = ONLY_PACKAGES[0]
export const pkgSoldOut = { ...pkgWithHotel, soldOut: true }

export const hotels = hotelOptionsFor(pkgWithHotel)
export const rooms = roomsFor(hotels[0], pkgWithHotel.nights || 1)
export { ROOM_EXTRAS, TIERS, inclusionsFor, hotelOptionsFor, roomsFor, resolveTier }

/** Price a package the way the modal does, for stories that need a breakdown. */
export const price = (pkg, cfg = {}) =>
  priceConfig(pkg, { tier: TIERS[0], guests: 2, ...cfg })

/** The package-name options a story control offers. */
export const packageNames = PACKAGES.map((p) => p.name)
export const byName = (name) => PACKAGES.find((p) => p.name === name) || pkgWithHotel

/** Centre a component on a padded canvas, as a story decorator. */
export const canvas = (width = '760px') => () => ({
  template: `<div style="max-width:${width};margin:0 auto;padding:24px;font-family:var(--ds-font-family)"><story /></div>`,
})
