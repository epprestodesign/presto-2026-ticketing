// Aug 4 Changes / Option C / Package Tile
import PackageTile from '../src/components/PackageTile.vue'
import { premiumTile, valueTile, price, canvas } from './_fixtures.js'

const meta = {
  title: 'Aug 4 Changes/Option C/Package Tile',
  component: PackageTile,
  decorators: [canvas('380px')],
  parameters: {
    docs: {
      description: {
        component:
          'One complete SKU on the Option C board — a ticket tier at a contracted hotel, ' +
          'sold as the room with the tickets thrown in.\n\n' +
          'The framing is the inverse of the library `PackageCard` it replaces. PackageCard ' +
          'says *"here is a bundle, and here is what you saved by bundling"*; PackageTile says ' +
          '*"here is a room, and your tickets are free"*.\n\n' +
          '**The tile carries no controls.** The dates and the party size both live in the ' +
          'search bar above the board, because both re-price all six tiles at once — putting ' +
          'either on the tile would mean six copies of the same decision. The tile receives an ' +
          'already-priced `priced` object so every tile on the board agrees.\n\n' +
          '**Badges are rationed.** The hero used to carry two on every tile — a stay-tier ' +
          'badge (which repeated the row heading, tinted with the *ticket* tier\'s accent, so ' +
          'one row showed the same "Value stay" in three colours) and "Tickets free" (true of ' +
          'all six). Both are gone. The optional `flag` prop takes at most one badge, and the ' +
          'board hands it to a single tile.',
      },
    },
  },
}
export default meta

const render = (args) => ({
  components: { PackageTile },
  setup: () => ({
    pkg: args.pkg,
    priced: price(args.pkg, args.guests, args.nights),
    flag: args.flag || null,
    onSelect: (p) => console.log('select →', p.id, `${p.guests} guests`, `$${p.packagePrice}`),
    onHotel: (id) => console.log('open hotel details in a new tab:', id),
  }),
  template: `<package-tile :pkg="pkg" :priced="priced" :flag="flag" @select="onSelect" @open-hotel="onHotel" />`,
})

/** The premium row — a suite at The Ritz-Carlton with the ticket included. */
export const PremiumStay = { render, args: { pkg: premiumTile, guests: 2, nights: 1 } }

/** The same ticket at the value property. This pairing IS the two-tier model. */
export const ValueStay = { render, args: { pkg: valueTile, guests: 2, nights: 1 } }

/**
 * A three-night stay. Nights multiply the room and nothing else — the tickets
 * stay free however long the stay runs, so the saving is unchanged from
 * `PremiumStay` while the price triples.
 */
export const ThreeNights = { render, args: { pkg: premiumTile, guests: 2, nights: 3 } }

/**
 * A party larger than one room holds. Occupancy caps the tickets per ROOM, so six
 * guests take two rooms rather than being refused — the tile says so instead of
 * silently doubling the price.
 */
export const NeedsTwoRooms = { render, args: { pkg: premiumTile, guests: 6, nights: 1 } }

/**
 * The one badge the board hands out. Navy, never the tier accent — the accent
 * means "ticket tier" everywhere else, and reusing it is what made the old stay
 * badge read as a distinction it never was.
 */
export const WithBadge = {
  render,
  args: { pkg: valueTile, guests: 2, nights: 1, flag: { label: 'Best value per guest', icon: 'savings' } },
}

/** A single guest — the saving is one ticket's face value. */
export const SingleGuest = { render, args: { pkg: premiumTile, guests: 1, nights: 1 } }
