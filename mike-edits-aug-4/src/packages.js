// The package board for this prototype (Aug 4 rework).
//
// The library generates every package as ticket + hotel + experience. This flow
// leads with packages and offers BOTH shapes side by side, so the grid strips the
// stay out of some of them:
//
//   • package + hotel → the guest picks the room from the package's hotels
//     (see hotelOptions.js) on Package Details.
//   • package only    → straight to checkout, no stay.
//
// stripHotel() is the library's own helper, so the package-only SKUs are priced
// consistently (hotel value removed, the same bundle discount re-applied).
import { computed } from 'vue'
import { generatePackageGrid, stripHotel } from '@lib/lib/bundles.js'
import { EVENT, retime } from './event.js'

// Alternating with/without keeps both shapes visible without scrolling: of the
// nine cards, five include a stay and four are package-only. Deterministic, so
// a given card is always the same in demos and screenshots.
const HOTEL_EVERY = 2

export const packageGrid = computed(() =>
  retime(generatePackageGrid(EVENT, { count: 9, nights: 1 })).map((pkg, i) =>
    i % HOTEL_EVERY === 0 ? pkg : stripHotel(pkg)
  )
)

/** The package matching an id (used to restore state from a deep link). */
export function packageById(id) {
  return packageGrid.value.find((p) => p.id === id) || null
}
