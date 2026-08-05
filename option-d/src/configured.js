// What the guest selected, resolved in one place.
//
// The exported names match Option A's and C's on purpose: CheckoutScreen and
// ConfirmationScreen are shared verbatim across the prototypes and import from
// here, so keeping the shape identical means Option D needs no special-casing in
// either screen.
//
// There is very little to resolve. Option A assembles a configuration in a modal
// (tier, hotel, room type, paid extra); Option C bakes it into a tile and adds
// dates. Option D has one package and one number.
import { computed } from 'vue'
import { journey, activePkg } from './store.js'
import { resolveRoom, NIGHTS } from './packages.js'

/** The package being bought. */
export const configuredPkg = computed(() => activePkg.value)

/** The room type the package covers — one per hotel, never chosen. */
export const configuredRoomType = computed(() => {
  const pkg = configuredPkg.value
  return pkg ? resolveRoom(pkg.hotel.id) : null
})

/** The stay. Fixed at two nights; rooms follow the hotel's occupancy. */
export const configuredHotel = computed(() => {
  const pkg = configuredPkg.value
  if (!pkg?.hotel) return null
  return {
    ...pkg.hotel,
    roomType: configuredRoomType.value?.name || pkg.hotel.roomType,
    nights: NIGHTS,
    rooms: pkg.rooms,
    hotelTotal: pkg.stayTotal,
  }
})

export const configuredRoom = computed(() => {
  const r = configuredRoomType.value
  if (!r) return null
  return { id: r.id, name: r.name, bed: r.bed, sleeps: r.sleeps }
})

/**
 * Paid room extras don't exist in Option D — the package is the package. Kept as
 * a stub so the shared checkout screen's `extra.id !== 'none'` branch stays dead
 * rather than throwing.
 */
export const configuredExtra = computed(() => ({ id: 'none', label: 'None', price: 0 }))

/** The ticket tier — one tier, fixed, identical on both packages. */
export const configuredTier = computed(() => {
  const t = configuredPkg.value?.ticket
  return { id: t?.tierId, name: t?.tierName, price: t?.price, desc: t?.desc }
})

/**
 * The selection, priced. `pkgForCart` is the package in the shape
 * buildPackageCart() consumes.
 */
export const priced = computed(() => {
  const pkg = configuredPkg.value
  if (!pkg) return null
  return {
    guests: pkg.guests,
    nights: NIGHTS,
    rooms: pkg.rooms,
    componentsTotal: pkg.componentsTotal,
    packagePrice: pkg.packagePrice,
    savings: pkg.savings,
    pkgForCart: {
      ...pkg,
      theme: 'Gameday package',
      quantity: pkg.guests,
      nights: NIGHTS,
      hotel: {
        ...pkg.hotel,
        roomType: configuredRoomType.value?.name || pkg.hotel.roomType,
        nights: NIGHTS,
        hotelTotal: pkg.stayTotal,
      },
      componentsTotal: pkg.componentsTotal,
      packagePrice: pkg.packagePrice,
      savings: pkg.savings,
    },
  }
})
