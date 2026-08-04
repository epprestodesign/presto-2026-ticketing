<script setup>
// Option C app shell — a persistent Global Nav + AppStepper over three screens.
//
// Much thinner than Option A's shell. That one had to route the native CTAs of
// four library pages (landing hero, hotel cards, hotel details tabs) through a
// capture-phase click handler, because none of them emit navigation events.
// Option C renders its own grid and emits its own selection, so the only CTA
// still needing interception is checkout's "Book Now" — the one button that
// lives inside a library page.
import { computed, onMounted, onBeforeUnmount } from 'vue'
import GlobalNav from '@lib/components/GlobalNav.vue'
import AppStepper from '@lib/components/AppStepper.vue'
import { journey, STEP_LABELS, currentStage, showStepper, goToStage, nav, resetJourney } from './store.js'

import PackageGridScreen from './screens/PackageGridScreen.vue'
import CheckoutScreen from './screens/CheckoutScreen.vue'
import ConfirmationScreen from './screens/ConfirmationScreen.vue'
import HotelDetailsScreen from './screens/HotelDetailsScreen.vue'

const screens = {
  packages: PackageGridScreen,
  checkout: CheckoutScreen,
  confirmation: ConfirmationScreen,
  // Read-only reference view, opened in its own tab from a hotel name.
  hotelDetails: HotelDetailsScreen,
}
const current = computed(() => screens[journey.screen] || PackageGridScreen)

function onClickCapture(e) {
  const t = e.target
  if (!(t instanceof Element)) return

  // Global: the top-left EventPipe wordmark → back to the board.
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
    <!-- The grid IS the landing page, so the nav is present from the first
         screen. No cart button or fly-out: a tile goes straight to checkout. -->
    <global-nav brand="EventPipe" :show-cart="false" @manage="resetJourney" />
    <!-- The stepper is orientation for a flow in progress, so it starts at
         CHECKOUT. On the board nothing is selected yet, and "Packages | Review"
         above a landing page is a progress bar for progress not yet made. -->
    <div v-if="showStepper && journey.screen !== 'packages'" class="xapp__stepper">
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
