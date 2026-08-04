// What the guest selected, resolved in one place.
//
// Option A resolves a configuration the guest ASSEMBLED in the package modal —
// tier, hotel, room type, paid extra, each stored as a loose id that has to be
// looked up and re-priced. Option C has no modal: a tile is already a complete
// SKU, so there is nothing to resolve. This module just reads the selected tile
// and re-prices it for the party size.
//
// The exported names match Option A's on purpose. CheckoutScreen and
// ConfirmationScreen are shared verbatim between the two prototypes, and they
// import from here — keeping the shape identical means Option C needs no
// special-casing in either screen.
import { computed } from 'vue'
import { packageGrid, priceTile, resolveRoom } from './packages.js'
import { journey } from './store.js'

/** The tile being bought — the first on the board when deep-linked cold. */
export const configuredPkg = computed(() => journey.activePkg || packageGrid.value[0])

/**
 * The stay. Baked into the tile, so this is just the tile's hotel — but it keeps
 * the `nights` / `name` shape the checkout summary reads.
 */
/** The room type chosen in the confirm dialog (or the hotel's contracted one). */
export const configuredRoomType = computed(() => {
  const pkg = configuredPkg.value
  return pkg ? resolveRoom(pkg.hotel.id, journey.roomId) : null
})

export const configuredHotel = computed(() => {
  const pkg = configuredPkg.value
  if (!pkg?.hotel) return null
  // Nights, rooms and the chosen room type all come from outside the tile —
  // restate them so the checkout summary reads the stay the guest actually chose.
  // Priced here rather than read off `priced` below, so this doesn't depend on
  // declaration order.
  const p = priceTile(pkg, journey.guests, journey.nights, configuredRoomType.value)
  return {
    ...pkg.hotel,
    roomType: configuredRoomType.value?.name || pkg.hotel.roomType,
    nightlyRate: p.nightly,
    nights: p.nights,
    rooms: p.rooms,
    hotelTotal: p.roomTotal,
  }
})

/**
 * The room. One room type per contracted hotel in this MVP — there is no room
 * picker, which is the point.
 */
export const configuredRoom = computed(() => {
  const r = configuredRoomType.value
  if (!r) return null
  return { id: r.id, name: r.name, bed: r.bed, sleeps: r.sleeps }
})

/**
 * Paid room extras are an Option A concept — "no complex options" rules them out
 * here. Kept as a stub so the shared checkout screen's `extra.id !== 'none'`
 * branch stays dead rather than throwing.
 */
export const configuredExtra = computed(() => ({ id: 'none', label: 'None', price: 0 }))

/** The ticket tier — the tile's, never chosen separately. */
export const configuredTier = computed(() => {
  const t = configuredPkg.value?.ticket
  return { id: t?.tierId, name: t?.tierName, price: t?.price, desc: t?.desc }
})

/**
 * The selection, priced. `pkgForCart` is the tile restated at the current party
 * size, which is exactly what buildPackageCart() consumes.
 */
export const priced = computed(() => {
  const pkg = configuredPkg.value
  if (!pkg) return null
  const p = priceTile(pkg, journey.guests, journey.nights, configuredRoomType.value)
  return {
    ...p,
    pkgForCart: {
      ...pkg,
      quantity: p.guests,
      nights: p.nights,
      hotel: { ...pkg.hotel, roomType: configuredRoomType.value?.name || pkg.hotel.roomType, nightlyRate: p.nightly, nights: p.nights, hotelTotal: p.roomTotal },
      componentsTotal: p.componentsTotal,
      packagePrice: p.packagePrice,
      savings: p.savings,
    },
  }
})
