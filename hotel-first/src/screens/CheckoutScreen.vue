<script setup>
// Stage 4 — Checkout. The real library CheckoutPage in `ticketing` mode: the
// stepped accordion (Contact → Payment → Review your order) beside the sticky
// order rail, the same checkout the sibling /prototype app uses for a hotel
// reservation.
//
// `ticketing` rather than `reservation` is the whole trick. The reservation
// checkout renders ONE hotel and its nights; the ticketing checkout hands its
// rail to CartReview, which groups an itemized cart under section headings by
// line type. Feed it a cart holding a hotel line, ticket lines and experience
// lines and the rail prints exactly what this edge case asks for — Hotel,
// Tickets and Experiences in one order, each line expandable, under one total —
// with no library change at all.
//
// `summary` is intentionally thin here: in ticketing mode the rail IS the cart,
// so the OrderSummary model only backs the final step's amount. The grouped price
// lines it also carries exist for the nav cart and for any future rail variant —
// they are built from the same cart, so they can never disagree with it.
//
// The final "Book Now" CTA advances to Confirmation (App shell click handler).
import { computed } from 'vue'
import CheckoutPage from '@lib/components/checkout/CheckoutPage.vue'
import { journey, activeHotel } from '../store.js'
import { buildCart, buildSummary } from '../itinerary.js'

const cart = computed(() => buildCart(journey, activeHotel.value))
const summary = computed(() => buildSummary(journey, activeHotel.value, cart.value))
</script>

<template>
  <div class="xco">
    <checkout-page mode="ticketing" :cart="cart" :summary="summary" :show-teams="false" />
  </div>
</template>

<style scoped>
.xco { display: flex; flex-direction: column; flex: 1; }
</style>
