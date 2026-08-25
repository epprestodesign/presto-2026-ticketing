<script setup>
// EventStrip — the compact event header every building screen sits under.
//
// The one thing genuinely common to all three entry points: whatever you start
// with, it is for this game on this date. Carried at ~90px rather than as a hero,
// because on a screen whose job is to add something to a cart the fold is worth
// more than the artwork.
import { EVENT, EVENT_DATE, EVENT_VENUE } from '../trip.js'

defineProps({
  note: { type: String, default: '' },
})
</script>

<template>
  <header class="es">
    <div class="es__inner">
      <div>
        <h1 class="es__title">{{ EVENT.name }}</h1>
        <p class="es__meta">{{ EVENT_DATE }} · {{ EVENT_VENUE }}</p>
        <p v-if="note" class="es__note">{{ note }}</p>
      </div>
      <span class="es__pill"><q-icon name="shopping_basket" size="18px" /> Buy any part of it</span>
    </div>
  </header>
</template>

<style scoped>
.es { background: var(--ds-color-background-brand-bold, #01113E); color: #fff; }
.es__inner { max-width: min(1440px, 92%); margin: 0 auto; padding: 18px 0; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.es__title { margin: 0; font-size: 1.375rem; font-weight: 700; line-height: 1.2; }
.es__meta { margin: 2px 0 0; font-size: .9375rem; opacity: .85; }
.es__note { margin: 4px 0 0; font-size: .9375rem; font-weight: 600; }
.es__pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; background: rgba(255,255,255,.12); font-size: .9375rem; font-weight: 600; white-space: nowrap; }
</style>
