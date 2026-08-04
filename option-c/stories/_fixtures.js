// Shared fixtures for the "Aug 4 Changes / Option C" stories.
//
// Everything here comes from the prototype's own data layer, so a story shows the
// same six tiles — and the same numbers — the running app does, rather than
// hand-written stand-ins that drift.
import { packageGrid, HOTELS, GRID_TIERS, priceTile } from '../src/packages.js'

export const TILES = packageGrid.value

/** The two rows of the board, premium first. */
export const ROWS = HOTELS.map((hotel) => ({
  hotel,
  tiles: TILES.filter((t) => t.hotel.id === hotel.id),
}))

export const premiumTile = TILES.find((t) => t.hotel.id === 'ritz')
export const valueTile = TILES.find((t) => t.hotel.id === 'courtyard')

/**
 * Price a tile for a stay — the same call the board makes. Stories pass guests
 * and nights explicitly, because in the running app both come from the shared
 * search bar rather than from the tile.
 */
export const price = (pkg, guests = 2, nights = 1) => priceTile(pkg, guests, nights)

export { HOTELS, GRID_TIERS, priceTile }

/** Centre a component on a padded canvas, as a story decorator. */
export const canvas = (width = '760px') => () => ({
  template: `<div style="max-width:${width};margin:0 auto;padding:24px;font-family:var(--ds-font-family)"><story /></div>`,
})
