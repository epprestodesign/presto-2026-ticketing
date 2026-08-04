// Aug 4 Changes / Option A / Package Details / Booking Summary
import BookingSummary from '../src/components/package/BookingSummary.vue'
import { pkgWithHotel, pkgOnly, hotels, rooms, price, TIERS, ROOM_EXTRAS, canvas } from './_fixtures.js'
import { STAY_LABEL } from '../src/event.js'

const meta = {
  title: 'Aug 4 Changes/Option A/Package Details/Booking Summary',
  component: BookingSummary,
  decorators: [canvas('420px')],
  parameters: {
    docs: {
      description: {
        component:
          'The card under the package details: party size, itemised line items, bundle ' +
          'savings, total and Reserve. Purely presentational — every number is handed in ' +
          'already priced by `priceConfig()`, so it never computes a total of its own.',
      },
    },
  },
  argTypes: { guests: { control: { type: 'range', min: 1, max: 12, step: 1 } } },
}
export default meta

const build = ({ pkg, guests = 2, tierId = 'club', hotel = null, room = null, extra = null, soldOut = false }) => {
  const tier = TIERS.find((t) => t.id === tierId) || TIERS[0]
  return {
    pkg,
    price: price(pkg, { tier, guests, hotel, room, extra }),
    tier,
    guests,
    nights: pkg.nights || 1,
    hasStay: !!pkg.hotel,
    activeHotel: hotel,
    room,
    extra,
    soldOut,
    stayLabel: STAY_LABEL,
  }
}

const render = (args) => ({
  components: { BookingSummary },
  setup: () => ({ bind: build(args) }),
  template: '<booking-summary v-bind="bind" />',
})

export const Playground = {
  render,
  args: { pkg: pkgWithHotel, guests: 2, tierId: 'club', hotel: hotels[0], room: rooms[0] },
}

/** Package + hotel, with the room the package includes. */
export const WithHotel = { render, args: { pkg: pkgWithHotel, hotel: hotels[0], room: rooms[0] } }

/** An upgraded room and a paid extra, both on their own line. */
export const UpgradedRoom = {
  render,
  args: { pkg: pkgWithHotel, hotel: hotels[0], room: rooms[2], extra: ROOM_EXTRAS[1] },
}

/** Package only — no stay line at all. */
export const PackageOnly = { render, args: { pkg: pkgOnly } }

/** Sold out: Reserve is disabled. */
export const SoldOut = { render, args: { pkg: pkgWithHotel, hotel: hotels[0], room: rooms[0], soldOut: true } }
