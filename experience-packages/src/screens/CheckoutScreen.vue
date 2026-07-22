<script setup>
// Review · Checkout — the real library CheckoutPage. Two variants:
//   • normal flow → mode="ticketing" (Packages + Hotel)
//   • "Skip, I don't need a package" → mode="reservation" (hotel-only Book
//     Reservation checkout)
// The final "Book Now" CTA advances to Confirmation (App shell click handler).
import { computed } from 'vue'
import CheckoutPage from '@lib/components/checkout/CheckoutPage.vue'
import { hotel, pkgHotel, packagesHotelCart, packagesHotelCartSplit } from '@lib/stories/ticketing/_ticketing-flow-carts.js'
import { makeSummary } from '@lib/stories/checkout/_ticketing-checkout-data.js'
import { journey } from '../store.js'

// Packages + Hotel (default) summary. The split cart breaks the hotel into its
// own "Included" section so the rail matches the Tickets + Hotel checkout.
const packageSummary = makeSummary(packagesHotelCart, [
  { label: 'Package', value: pkgHotel.name },
  { label: 'Experience', value: pkgHotel.theme },
  { label: 'Hotel', value: `${pkgHotel.hotel?.name || hotel.name} · 1 night` },
], { rrow1: `${pkgHotel.name} · ${pkgHotel.theme}` })

// Hotel-only Book Reservation cart + summary (used when the package is skipped).
const rate = hotel.nightlyRate
const taxes = 26
const bookingFee = 10
const hotelOnlyCart = {
  heldSeconds: 895,
  hotel: { name: hotel.name, address: '1 Patriot Pl, Foxborough, MA 02035' },
  imageCategories: ['exterior', 'rooms', 'lobby'], seed: 5,
  checkIn: { date: '12/05/2026', time: '3:00pm' }, checkOut: { date: '12/06/2026', time: '11:00am' }, nights: 1,
  roomType: hotel.roomType, bedConfig: '1 King Bed · Sleeps 2', sleeps: 2,
  amenities: [{ icon: 'wifi', label: 'Free WiFi' }, { icon: 'local_parking', label: 'Event parking' }],
  priceDetails: {
    nights: 1, rooms: 1, rate, subtotal: rate, taxes, propertyFee: 0, total: rate + taxes + bookingFee,
    lines: [
      { label: 'Check In', value: 'Fri, Dec 5, 2026', text: true },
      { label: 'Check Out', value: 'Sat, Dec 6, 2026', text: true },
      { label: 'Fri, Dec 5, 2026', value: rate },
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
  cancellation: 'Free cancellation before Dec 3, 2026.',
  rrow1: '1 room · 1 night',
  rows: [
    { label: 'Dates', value: 'Dec 5 – 6, 2026', change: true },
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
  : { mode: 'ticketing', cart: packagesHotelCartSplit, summary: packageSummary })
</script>

<template>
  <div class="xcheckout">
    <checkout-page :mode="view.mode" :cart="view.cart" :summary="view.summary" />
  </div>
</template>

<style scoped>
.xcheckout { display: flex; flex-direction: column; flex: 1; }
</style>
