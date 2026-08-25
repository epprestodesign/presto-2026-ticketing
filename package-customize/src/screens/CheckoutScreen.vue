<script setup>
// Review · Checkout — the real library checkout page, billing exactly the
// configuration the customize screen produced.
//
// `CheckoutPageExpanded`: every section open at once, all fields in their input
// state, one "Book Now" at the bottom (which the App shell intercepts to advance
// to Confirmation). The rail is the library's own sticky cart, countdown and
// order summary, untouched.
//
// --- The configuration strip above it ----------------------------------------
// `CheckoutPageExpanded` reads only `summary.total` off the summary object — its
// rail is the cart, and the `rows` that `OrderSummary` would render never reach
// the page. That is fine for a fixed package, whose cart line says everything
// there is to say. It is not fine here: a guest who downgraded to Upper Level and
// dropped the coach transfer has to see both facts before paying, or the last
// screen before payment describes a package they deliberately stopped buying.
//
// So this screen carries its own strip above the library page, naming every
// switchable component with its CONFIGURED value, and saying which package it
// started from and how many changes were made to it. The name on an order and the
// contents of an order have to be reconcilable, and after customization the name
// alone no longer does that.
//
// The alternative — patching the library page to render summary rows — was
// rejected on the rule every prototype here follows: the library is read-only,
// and anything it can't do gets built alongside it rather than into it.
//
// The cart line still carries the same facts in its expandable "what's inside"
// list (see `experiences` in configured.js), so the two agree; the strip is what
// makes them legible without expanding anything.
import { computed } from 'vue'
import CheckoutPage from '@lib/components/checkout/CheckoutPageExpanded.vue'
import { hotel, cartFor } from '../fixtures.js'
import { makeSummary } from '@lib/stories/checkout/_ticketing-checkout-data.js'
import { configuredPkg as pkg, configuredHotel as stay, configuredRoom as roomType, configuredExtras as extras, configuredTier as tier, priced } from '../configured.js'
import { retime } from '../event.js'
import { journey, basePackage, isCustomized, changesFromPreset, nav } from '../store.js'
import { STAY_SHORT } from '../packages.js'

const packageCart = computed(() => cartFor(priced.value.pkgForCart))

// One row per component the customize screen could change, in the same order it
// presents them — so a guest scanning this strip is re-reading the screen they
// just left, not decoding a new one.
//
// Extras get a row EACH rather than a comma-joined list. A dropped extra is the
// change most likely to be regretted at the door, and a row that simply isn't
// there reads louder than a shorter sentence.
const configRows = computed(() => [
  { label: 'Party', value: `${priced.value.guests} ${priced.value.guests === 1 ? 'person' : 'people'}` },
  { label: 'Tickets', value: `${tier.value.name} × ${priced.value.guests}` },
  { label: 'Hotel', value: `${stay.value.name} · ${STAY_SHORT}` },
  { label: 'Room', value: `${priced.value.rooms} × ${roomType.value.name} · ${roomType.value.bed}` },
  ...extras.value.map((e) => ({ label: e.group === 'transport' ? 'Getting there' : 'Extra', value: e.label })),
])

// The library page uses this for its total only — the rows above are rendered by
// this screen, not by it.
const packageSummary = computed(() =>
  retime(makeSummary(packageCart.value, configRows.value, { rrow1: `${basePackage.value.name} · ${pkg.value.theme}` }))
)

// Hotel-only Book Reservation cart + summary (used when the package is skipped).
const rate = hotel.nightlyRate
const taxes = 26
const bookingFee = 10
const hotelOnlyCart = {
  heldSeconds: 895,
  hotel: { name: hotel.name, address: '1 Patriot Pl, Foxborough, MA 02035' },
  imageCategories: ['exterior', 'rooms', 'lobby'], seed: 5,
  checkIn: { date: '09/19/2026', time: '3:00pm' }, checkOut: { date: '09/20/2026', time: '11:00am' }, nights: 1,
  roomType: hotel.roomType, bedConfig: '1 King Bed · Sleeps 2', sleeps: 2,
  amenities: [{ icon: 'wifi', label: 'Free WiFi' }, { icon: 'local_parking', label: 'Event parking' }],
  priceDetails: {
    nights: 1, rooms: 1, rate, subtotal: rate, taxes, propertyFee: 0, total: rate + taxes + bookingFee,
    lines: [
      { label: 'Check In', value: 'Sat, Sep 19, 2026', text: true },
      { label: 'Check Out', value: 'Sun, Sep 20, 2026', text: true },
      { label: 'Sat, Sep 19, 2026', value: rate },
      { label: 'Booking Fee', value: bookingFee },
      { label: 'Taxes', value: taxes },
    ],
  },
  roomsLeft: 1,
}
const hotelOnlySummary = {
  title: hotel.name,
  subtitle: `${hotel.roomType} · Sleeps 2`,
  rating: '4.6',
  cancellation: 'Free cancellation before Sep 17, 2026.',
  rrow1: '1 room · 1 night',
  rows: [
    { label: 'Dates', value: 'Sep 19 – 20, 2026', change: true },
    { label: 'Guests', value: '2 adults', change: true },
  ],
  priceLines: [
    { label: `1 night × $${rate}`, value: rate },
    { label: 'Booking fee', value: bookingFee },
    { label: 'Taxes', value: taxes },
  ],
  total: rate + taxes + bookingFee,
  note: 'Near Gillette Stadium',
}

const view = computed(() => journey.skipPackage
  ? { mode: 'reservation', cart: hotelOnlyCart, summary: hotelOnlySummary }
  : { mode: 'ticketing', cart: packageCart.value, summary: packageSummary.value })
</script>

<template>
  <div class="xcheckout">
    <section v-if="!journey.skipPackage" class="xco-strip">
      <div class="xco-strip__inner">
        <div class="xco-strip__head">
          <p class="xco-strip__eyebrow">Booking</p>
          <h2 class="xco-strip__name">
            {{ basePackage.name }}
            <span v-if="isCustomized" class="xco-strip__tag">
              {{ changesFromPreset.length }} change{{ changesFromPreset.length === 1 ? '' : 's' }}
            </span>
          </h2>
          <button type="button" class="xco-strip__back" @click="nav('customize')">
            <q-icon name="tune" size="15px" /> Change something
          </button>
        </div>

        <dl class="xco-strip__rows">
          <div v-for="(r, i) in configRows" :key="`${r.label}-${i}`" class="xco-strip__row">
            <dt>{{ r.label }}</dt>
            <dd>{{ r.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <checkout-page :mode="view.mode" :cart="view.cart" :summary="view.summary" />
  </div>
</template>

<style scoped>
.xcheckout { display: flex; flex-direction: column; flex: 1; }

.xco-strip { background: var(--ds-color-surface-sunken, #f1f2f4); border-bottom: 1px solid var(--ds-color-border); }
.xco-strip__inner { width: 100%; max-width: min(1180px, 92%); margin: 0 auto; padding: 16px 0 18px; display: flex; gap: 28px; align-items: flex-start; flex-wrap: wrap; }

.xco-strip__head { flex: none; max-width: 260px; }
.xco-strip__eyebrow { margin: 0; font-size: .6875rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.xco-strip__name { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 4px 0 0; font-size: 1.125rem; font-weight: 800; color: var(--ds-color-text); }
.xco-strip__tag { padding: 2px 8px; border-radius: var(--ds-radius-pill, 999px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font-size: .6875rem; font-weight: 800; letter-spacing: .03em; text-transform: uppercase; }
.xco-strip__back { display: inline-flex; align-items: center; gap: 5px; margin-top: 6px; padding: 0; border: 0; background: none; font: inherit; font-size: .875rem; font-weight: 700; color: var(--ds-color-link, #1b4ed8); cursor: pointer; }

/* The rows wrap into as many columns as fit rather than stacking: at checkout
   this is a glance, not a read. */
.xco-strip__rows { flex: 1; min-width: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px 22px; }
.xco-strip__row { display: flex; flex-direction: column; min-width: 0; }
.xco-strip__row dt { font-size: .6875rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.xco-strip__row dd { margin: 2px 0 0; font-size: .875rem; font-weight: 600; color: var(--ds-color-text); }
</style>
