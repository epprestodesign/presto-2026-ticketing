<script setup>
// Stage 2 — Hotel Details & room selection. The real HotelDetailPage, populated
// from fixtures keyed on the hotel chosen in Browse (name/city carry through).
// `back` is a real event → return to Browse. The room CTA ("Reserve Room" /
// "Add N to Cart") is intercepted globally (App.vue) → add to cart → back to
// Browse (cart-driven accumulation).
import { computed } from 'vue'
import { journey, cartMode, roomsFlow, cartVisible, checkoutMode, nav } from '../store.js'
import { detailProps, cartFor } from '../fixtures.js'
import PageFrame from '@lib/components/PageFrame.vue'
import HotelDetailPage from '@lib/components/details/HotelDetailPage.vue'

const detail = computed(() => detailProps(journey.active || { name: 'Hotel', city: '' }, roomsFlow.value))
const navCart = computed(() => (journey.cart.length ? cartFor(journey.cart, checkoutMode.value) : {}))
</script>

<template>
  <page-frame brand="Presto" :cart-mode="cartMode" :show-cart="cartVisible" :cart="navCart">
    <hotel-detail-page v-bind="detail" @back="nav('browse')" />
  </page-frame>
</template>
