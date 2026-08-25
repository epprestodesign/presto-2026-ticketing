// What the guest configured, reshaped for the library's checkout and
// confirmation pages.
//
// The export NAMES match the sibling prototypes' on purpose — CheckoutScreen and
// ConfirmationScreen are close cousins across all of them — but what they resolve
// is different in kind. In Option D there is almost nothing to resolve: the
// package is fixed and the "configuration" is a party size. Here everything below
// is derived from `journey.config`, and the only reason this file exists is that
// the library pages want a different SHAPE (a `hotel` object with `hotelTotal`, a
// `pkgForCart`) than the one the customize screen edits.
//
// Nothing here does arithmetic. Every number comes out of `priceConfiguration()`
// via the store — one place to be wrong, and it isn't this one.
import { computed } from 'vue'
import { priced as pricedConfig, basePackage } from './store.js'
import { NIGHTS, STAY_SHORT } from './packages.js'

/** The ticket tier, as configured. */
export const configuredTier = computed(() => pricedConfig.value.tier)

/** The room type, as configured. */
export const configuredRoom = computed(() => {
  const r = pricedConfig.value.room
  return { id: r.id, name: r.name, bed: r.bed, sleeps: r.sleeps }
})

/** The stay — the hotel, the room it holds, and what the stay portion costs. */
export const configuredHotel = computed(() => {
  const p = pricedConfig.value
  return {
    ...p.hotel,
    roomType: p.room.name,
    nightlyRate: p.nightly,
    nights: NIGHTS,
    rooms: p.rooms,
    hotelTotal: p.stayTotal,
  }
})

/**
 * The extras, as configured — a LIST, where the sibling prototypes have a single
 * optional room upsell. That is the substance of this prototype: extras are
 * individually switchable, so checkout has to be able to name all of them.
 */
export const configuredExtras = computed(() => pricedConfig.value.extras)

/** The package as configured, in card shape. */
export const configuredPkg = computed(() => {
  const p = pricedConfig.value
  return {
    id: basePackage.value.id,
    name: basePackage.value.name,
    theme: `${p.hotel.name} · ${STAY_SHORT}`,
  }
})

/**
 * The selection, priced, plus `pkgForCart` — the package in the shape
 * `buildPackageCart()` consumes.
 *
 * `experiences` carries every inclusion, because that array becomes the
 * expandable "what's inside" rows on the checkout cart line. With extras
 * switchable, those rows are the only place at checkout that a dropped extra is
 * visibly absent.
 */
export const priced = computed(() => {
  const p = pricedConfig.value
  return {
    ...p,
    pkgForCart: {
      id: basePackage.value.id,
      name: basePackage.value.name,
      theme: `${p.hotel.name} · ${STAY_SHORT}`,
      quantity: p.guests,
      nights: NIGHTS,
      currency: 'USD',
      ticket: { tierId: p.tier.id, tierName: p.tier.name, price: p.tier.price, colorVar: p.tier.colorVar },
      hotel: {
        ...p.hotel,
        roomType: p.room.name,
        nightlyRate: p.nightly,
        nights: NIGHTS,
        hotelTotal: p.stayTotal,
      },
      experiences: [
        { icon: 'hotel', label: `${p.rooms} × ${p.room.name} at ${p.hotel.name} · ${STAY_SHORT}` },
        ...p.extras.filter((e) => e.price > 0).map((e) => ({ icon: e.icon, label: e.label })),
      ],
      componentsTotal: p.componentsTotal,
      packagePrice: p.packagePrice,
      savings: p.savings,
    },
  }
})
