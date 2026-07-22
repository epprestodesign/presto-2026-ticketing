<script setup>
// Review · Checkout — the real library CheckoutPage. Two variants:
//   • normal flow → mode="ticketing" (Tickets + Hotel)
//   • "Skip, I don't need tickets" → mode="reservation" (hotel-only Book
//     Reservation checkout)
// The final "Book Now" CTA advances to Confirmation (App shell click handler).
import { computed } from 'vue'
import CheckoutPage from '@lib/components/checkout/CheckoutPage.vue'
import { tier, hotel, ticketsHotelCart } from '@lib/stories/ticketing/_ticketing-flow-carts.js'
import { makeSummary } from '@lib/stories/checkout/_ticketing-checkout-data.js'
import { journey } from '../store.js'

// Tickets + Hotel (default) summary.
const ticketingSummary = makeSummary(ticketsHotelCart, [
  { label: 'Seats', value: 'Club · Sec CL10' },
  { label: 'Tickets', value: `2 × ${tier.name}` },
  { label: 'Hotel', value: `${hotel.name} · 1 night` },
], { rrow1: `2 × ${tier.name} + ${hotel.name}` })

// Hotel-only Book Reservation cart + summary (used when tickets are skipped).
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

const view = computed(() => journey.skipTickets
  ? { mode: 'reservation', cart: hotelOnlyCart, summary: hotelOnlySummary }
  : { mode: 'ticketing', cart: ticketsHotelCart, summary: ticketingSummary })
</script>

<template>
  <div class="xcheckout">
    <checkout-page :mode="view.mode" :cart="view.cart" :summary="view.summary" />
  </div>
</template>

<style scoped>
.xcheckout { display: flex; flex-direction: column; flex: 1; }
</style>
