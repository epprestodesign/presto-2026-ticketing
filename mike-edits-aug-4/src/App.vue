<script setup>
// Experience app shell (Hotel + Packages) — a persistent Global Nav + AppStepper
// across the journey, with each library page rendered bare beneath (its own
// nav/frame dropped). The Landing screen is the full-bleed intro (LandingPage
// brings its own nav). There is NO footer action bar: forward navigation comes
// from each page's own CTAs (routed by the capture-phase click handler below) and
// from the clickable stepper. No library files are changed.
import { computed, onMounted, onBeforeUnmount } from 'vue'
import GlobalNav from '@lib/components/GlobalNav.vue'
import AppStepper from '@lib/components/AppStepper.vue'
import { journey, STEP_LABELS, currentStage, showStepper, goToStage, openHotel, nav, resetJourney } from './store.js'

import LandingScreen from './screens/LandingScreen.vue'
import HotelBrowseScreen from './screens/HotelBrowseScreen.vue'
import HotelDetailsScreen from './screens/HotelDetailsScreen.vue'
import PackagesBrowseScreen from './screens/PackagesBrowseScreen.vue'
import CheckoutScreen from './screens/CheckoutScreen.vue'
import ConfirmationScreen from './screens/ConfirmationScreen.vue'

const screens = {
  landing: LandingScreen,
  hotels: HotelBrowseScreen,
  hotelDetails: HotelDetailsScreen,
  packages: PackagesBrowseScreen,
  checkout: CheckoutScreen,
  confirmation: ConfirmationScreen,
}
const current = computed(() => screens[journey.screen] || LandingScreen)
const isLanding = computed(() => journey.screen === 'landing')

// Route each library page's native CTA to a navigation (capture-phase, document
// scope). No library page emits nav events — we match the clicked element here.
function onClickCapture(e) {
  const t = e.target
  if (!(t instanceof Element)) return

  // Global: the top-left EventPipe wordmark → Landing.
  if (t.closest('.gnav__brand')) { e.preventDefault(); nav('landing'); return }

  const screen = journey.screen
  if (screen === 'landing') {
    // Aug 4: the journey now opens on Packages, not Browse Hotels.
    if (t.closest('.bw__search')) nav('packages')
    return
  }
  // Browse Hotels is off the main path (a package's hotels are chosen on Package
  // Details) but still reachable by URL, so its CTAs keep working.
  if (screen === 'hotels') {
    // Hotel card → that hotel's Details screen. "Choose Your Room" lands on the
    // Rooms tab; the hotel name opens on Overview.
    const cta = t.closest('.hc__cta')
    const nameEl = t.closest('.hc__name')
    if (cta || nameEl) {
      const root = t.closest('.hc')
      const name = root?.querySelector('.hc__name')?.textContent?.trim()
      openHotel(name, cta ? 'rooms' : 'overview')
    }
    return
  }
  if (screen === 'hotelDetails') {
    // Read-only reference tab — nothing on this page books anything, so no CTA
    // is routed from here (the booking CTAs are hidden by the screen itself).
    return
  }
  if (screen === 'checkout') {
    // The final "Book Now" CTA → Confirmation.
    const btn = t.closest('button')
    if (btn && /book now|place order|pay now|confirm & pay/i.test((btn.textContent || '').trim())) nav('confirmation')
    return
  }
}
onMounted(() => document.addEventListener('click', onClickCapture, true))
onBeforeUnmount(() => document.removeEventListener('click', onClickCapture, true))
</script>

<template>
  <div class="xapp">
    <!-- Landing brings its own nav; every other screen shares this one. No cart
         button or fly-out anywhere in this app — the package modal is where a
         booking is assembled, and checkout shows the order. -->
    <global-nav v-if="!isLanding" brand="EventPipe" :show-cart="false" @manage="resetJourney" />
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
