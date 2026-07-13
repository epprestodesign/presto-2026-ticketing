<script setup>
// Stage 3 — Checkout ("Confirm and pay"). The real CheckoutPage in the minimal
// "Secure Checkout" nav. Mode is cart-driven: 1 reserved hotel → 'reservation'
// (single); 2+ → 'reservations' (multiple); group flow → 'group' (hold, no
// payment). The final CTA ("Book Now"/"Hold Group Block Now") is intercepted
// globally (App.vue) → Confirmation.
import { computed } from 'vue'
import { journey, cartMode, checkoutMode } from '../store.js'
import { cartFor, summaryFor } from '../fixtures.js'
import PageFrame from '@lib/components/PageFrame.vue'
import CheckoutPage from '@lib/components/checkout/CheckoutPage.vue'

const cart = computed(() => cartFor(journey.cart, checkoutMode.value))
const summary = computed(() => summaryFor(journey.cart, checkoutMode.value))
</script>

<template>
  <page-frame brand="Secure Checkout" minimal-nav :cart-mode="cartMode">
    <checkout-page :mode="checkoutMode" :cart="cart" :summary="summary" :show-teams="false" />
  </page-frame>
</template>
