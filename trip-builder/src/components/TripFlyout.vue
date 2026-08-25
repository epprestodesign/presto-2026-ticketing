<script setup>
// TripFlyout — the trip cart, reachable from every screen without leaving it.
//
// Chrome is the library's DsSidePanel (scrim, slide-in, header, ESC, scroll lock,
// footer slot); the body is TripItems, the same component the Trip screen mounts.
// Same lines, same steppers, same Remove — so adding tickets and then fixing the
// room you chose ten minutes ago never costs a screen change.
//
// CartFlyout, the library's own version of this, wraps CartReview with no way to
// swap the body, and its footer runs a hold countdown. A trip you are invited to
// keep editing can't also be expiring, so nothing is held until checkout — where
// the library's own timer takes over, correctly. DsSidePanel is the part of
// CartFlyout worth reusing, and the library already factored it out.
import DsSidePanel from '@lib/components/DsSidePanel.vue'
import TripItems from './TripItems.vue'
import TripTotals from './TripTotals.vue'
import { trip, isEmpty, closeTrip, nav } from '../store.js'

const emit = defineEmits(['edit-stay'])

function checkout() {
  closeTrip()
  nav('checkout')
}
</script>

<template>
  <ds-side-panel
    :model-value="trip.flyoutOpen" title="Your trip" width="520px"
    @update:model-value="!$event && closeTrip()"
  >
    <trip-items variant="panel" @edit-stay="(line) => emit('edit-stay', line)" />

    <template v-if="!isEmpty" #footer>
      <div class="tf__foot">
        <trip-totals compact />
        <button type="button" class="tf__cta" @click="checkout">Checkout</button>
        <button type="button" class="tf__alt" @click="closeTrip">Keep building</button>
      </div>
    </template>
  </ds-side-panel>
</template>

<style scoped>
.tf__foot { display: flex; flex-direction: column; gap: 12px; font-family: var(--ds-font-family); }
.tf__cta { height: 50px; border: 0; border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font: inherit; font-weight: 700; font-size: 1rem; cursor: pointer; }
.tf__alt { appearance: none; height: 34px; border: 0; background: none; font: inherit; font-weight: 600; color: var(--ds-color-text-subtle); text-decoration: underline; cursor: pointer; }
</style>
