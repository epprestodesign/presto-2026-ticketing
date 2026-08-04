// What the guest has configured, resolved in one place.
//
// The package modal writes its choices to the journey store as plain ids; this
// turns those back into objects, prices the result, and hands every screen the
// same numbers. Fallbacks keep each screen renderable when deep-linked cold.
import { computed } from 'vue'
import { pkgHotel } from './fixtures.js'
import { resolveRoom } from './hotelOptions.js'
import { roomsFor, resolveRoomType, ROOM_EXTRAS } from './rooms.js'
import { priceConfig, resolveTier } from './pricing.js'
import { journey } from './store.js'

export const configuredPkg = computed(() => journey.activePkg || pkgHotel)

/** The hotel chosen for the package (null when the package has no stay). */
export const configuredHotel = computed(() => resolveRoom(configuredPkg.value, journey.roomHotelId))

/** The room type chosen at that hotel. */
export const configuredRoom = computed(() => {
  const hotel = configuredHotel.value
  if (!hotel) return null
  return resolveRoomType(roomsFor(hotel, configuredPkg.value.nights || 1), journey.roomTypeId)
})

/** The paid extra chosen for that room. */
export const configuredExtra = computed(
  () => ROOM_EXTRAS.find((e) => e.id === journey.extraId) || ROOM_EXTRAS[0]
)

/** The ticket tier chosen, defaulting to the one the package ships with. */
export const configuredTier = computed(
  () => resolveTier(journey.tierId, configuredPkg.value.ticket?.tierId)
)

/** The whole configuration, priced — the single source for carts and summaries. */
export const priced = computed(() =>
  priceConfig(configuredPkg.value, {
    tier: configuredTier.value,
    guests: journey.guests,
    hotel: configuredHotel.value,
    room: configuredRoom.value,
    extra: configuredExtra.value,
  })
)
