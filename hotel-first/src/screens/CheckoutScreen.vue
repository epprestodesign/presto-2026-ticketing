<script setup>
// Stage 4 — Checkout. The real library CheckoutPageExpanded in `ticketing` mode:
// ONE long form — Contact, Payment, Review your order and Policies all open at
// once, every field in its input state — beside the same sticky order rail.
//
// EXPANDED, NOT STEPPED (Aug 25). This screen mounted the stepped CheckoutPage
// until this round: one section open at a time, a Next between each, completed
// sections collapsing behind an Edit. It was replaced because a stepper is the
// wrong instrument for this particular checkout. The order being confirmed here
// is three purchases from three fulfilments — a room, tournament passes and
// attraction tickets — and the guest's actual question at this point is "is all
// of that right, together, before I pay". A flow that shows them a third of it
// at a time and asks them to advance answers that question last, in the smallest
// possible box, after the other two thirds have folded shut.
//
// The rejected alternative was keeping the accordion and auto-opening every
// step. CheckoutPage's state — current step, furthest step, per-step summaries,
// the Edit affordances, the Next handler — all stays live under that, and the
// page ends up carrying a stepper's mechanics with none of its behaviour.
// CheckoutPageExpanded is the library's own answer, shares the SAME rail and the
// same step components, and only replaces the left column.
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
// The single "Book Now" at the bottom advances to Confirmation (App shell click
// handler) — one submit for the whole order, no per-section commit.
import { computed } from 'vue'
import CheckoutPage from '@lib/components/checkout/CheckoutPageExpanded.vue'
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
