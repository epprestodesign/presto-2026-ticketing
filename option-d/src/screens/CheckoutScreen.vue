<script setup>
// Review · Checkout — the real library checkout page, showing what the guest
// configured (Aug 4 rework):
//   • package + hotel → mode="ticketing", with the room they picked
//   • package only    → mode="ticketing", no stay in the cart
//   • ?skip=1 deep link → mode="reservation" (legacy hotel-only checkout)
// The final "Book Now" CTA advances to Confirmation (App shell click handler).
//
// --- ONE form, not a stepper (Aug 6 feedback) --------------------------------
// This used to mount `CheckoutPage`, whose left column is a stepped accordion:
// one section open, a "Next" button to advance, completed sections collapsing
// behind an Edit link. It now mounts `CheckoutPageExpanded` — every section open
// at once, all fields in their input state, and a single "Book Now" at the
// bottom.
//
// The rail is deliberately untouched: same sticky cart, same in-rail countdown,
// same order summary. Only the left column changed.
import { computed } from 'vue'
import CheckoutPage from '@lib/components/checkout/CheckoutPageExpanded.vue'
import { hotel, cartFor } from '../fixtures.js'
import { makeSummary } from '@lib/stories/checkout/_ticketing-checkout-data.js'
import { configuredPkg as pkg, configuredHotel as room, configuredRoom as roomType, configuredExtra as extra, configuredTier as tier, priced } from '../configured.js'
import { retime } from '../event.js'
import { journey } from '../store.js'

// What was configured in the package modal; falls back to the sample package so
// the checkout screen still renders when deep-linked cold.
const packageCart = computed(() => cartFor(priced.value.pkgForCart, extra.value))

const packageSummary = computed(() => {
  const p = pkg.value
  const stay = room.value
  const rows = [
    { label: 'Package', value: p.name },
    { label: 'Experience', value: p.theme },
    { label: 'Tickets', value: `${tier.value.name} × ${priced.value.guests}` },
  ]
  if (stay) {
    rows.push({ label: 'Hotel', value: `${stay.name} · ${stay.nights} night` })
    if (roomType.value) rows.push({ label: 'Room', value: `${roomType.value.name} · ${roomType.value.bed}` })
    if (extra.value?.id !== 'none') rows.push({ label: 'Room option', value: extra.value.label })
  } else {
    rows.push({ label: 'Stay', value: 'Not included — package only' })
  }
  return retime(makeSummary(packageCart.value, rows, { rrow1: `${p.name} · ${p.theme}` }))
})

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
    <checkout-page :mode="view.mode" :cart="view.cart" :summary="view.summary" />
  </div>
</template>

<style scoped>
.xcheckout { display: flex; flex-direction: column; flex: 1; }
</style>
