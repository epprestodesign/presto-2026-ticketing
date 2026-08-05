<script setup>
// Option D app shell — landing, packages, checkout, confirmation, plus one
// off-flow reference view.
//
// Thinner than Option C's, which is itself thinner than Option A's. Option D
// renders every one of its own screens except checkout and confirmation, so the
// only CTA still needing interception is CheckoutPage's "Book Now" — the one
// button that lives inside a library page.
import { computed, onMounted, onBeforeUnmount } from 'vue'
import GlobalNav from '@lib/components/GlobalNav.vue'
import AppStepper from '@lib/components/AppStepper.vue'
import { journey, STEP_LABELS, currentStage, showStepper, goToStage, nav, resetJourney } from './store.js'

import PackagesScreen from './screens/PackagesScreen.vue'
import PackageDetailsScreen from './screens/PackageDetailsScreen.vue'
import CheckoutScreen from './screens/CheckoutScreen.vue'
import ConfirmationScreen from './screens/ConfirmationScreen.vue'
import HotelDetailsScreen from './screens/HotelDetailsScreen.vue'

const screens = {
  // The packages page is the landing page.
  packages: PackagesScreen,
  packageDetails: PackageDetailsScreen,
  checkout: CheckoutScreen,
  confirmation: ConfirmationScreen,
  // Optional, informational, opened in its own tab from any hotel name.
  hotelDetails: HotelDetailsScreen,
}
const current = computed(() => screens[journey.screen] || PackagesScreen)

function onClickCapture (e) {
  const t = e.target
  if (!(t instanceof Element)) return

  // The top-left EventPipe wordmark → back to the start.
  if (t.closest('.gnav__brand')) { e.preventDefault(); resetJourney(); return }

  // CheckoutPage's final CTA is a plain library button — match it by label.
  if (journey.screen === 'checkout') {
    const btn = t.closest('button')
    if (btn && /book now|place order|pay now|confirm & pay/i.test((btn.textContent || '').trim())) nav('confirmation')
  }
}
onMounted(() => document.addEventListener('click', onClickCapture, true))
onBeforeUnmount(() => document.removeEventListener('click', onClickCapture, true))
</script>

<template>
  <div class="xapp">
    <global-nav brand="EventPipe" :show-cart="false" @manage="resetJourney" />
    <!-- The stepper starts once a package is opened. The packages page is the
         landing page, and a progress bar above a landing page is orientation for
         progress not yet made. -->
    <div v-if="showStepper" class="xapp__stepper">
      <app-stepper :steps="STEP_LABELS" :current="currentStage" clickable allow-ahead @navigate="goToStage" />
    </div>
    <main class="xapp__main">
      <component :is="current" />
    </main>
  </div>
</template>

<style>
html, body { margin: 0; }
html { scrollbar-gutter: stable both-edges; }
body { background: var(--ds-palette-slate-100, #f1f2f4); }
.xapp { min-height: 100vh; background: var(--ds-color-surface, #fff); display: flex; flex-direction: column; }
.xapp__main { flex: 1; display: flex; flex-direction: column; }

.gnav-wrap { background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-border); }
.gnav { max-width: min(1440px, 92%) !important; margin-inline: auto !important; padding-inline: 0 !important; background: transparent !important; border-bottom: 0 !important; }
.gnav__brand { cursor: pointer; }
</style>
