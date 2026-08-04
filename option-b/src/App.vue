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
import { journey, STEP_LABELS, currentStage, showStepper, goToStage, bookRoomOnly, chooseHotelForPackages, openHotelDetails, nav, resetJourney } from './store.js'
import { HOTELS } from './hotelSelection.js'

// The library cards carry only a name, so map it back to our hotel record.
const hotelByName = (name) =>
  HOTELS.find((h) => name && name.toLowerCase().includes(h.name.toLowerCase())) || HOTELS[0]

import LandingScreen from './screens/LandingScreen.vue'
import HotelSelectScreen from './screens/HotelSelectScreen.vue'
import HotelDetailsScreen from './screens/HotelDetailsScreen.vue'
import PackagesBrowseScreen from './screens/PackagesBrowseScreen.vue'
import CheckoutScreen from './screens/CheckoutScreen.vue'
import ConfirmationScreen from './screens/ConfirmationScreen.vue'

const screens = {
  landing: LandingScreen,
  hotels: HotelSelectScreen,
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
    // Option B: the RSVP page hands off to step 2, Hotel Selection.
    if (t.closest('.bw__search')) nav('hotels')
    return
  }
  if (screen === 'hotels') {
    // Step 2 uses the library's Browse Hotels cards, which emit nothing upward —
    // so the two paths are matched here by what was clicked:
    //   the hotel NAME    → that hotel's details page (one room type)
    //   "Choose Your Room" → packages scoped to that hotel
    const nameEl = t.closest('.hc__name')
    const cta = t.closest('.hc__cta')
    if (!nameEl && !cta) return
    const root = t.closest('.hc')
    const name = root?.querySelector('.hc__name')?.textContent?.trim()
    const hotel = hotelByName(name)
    e.preventDefault()
    if (nameEl) openHotelDetails(hotel)
    else chooseHotelForPackages(hotel)
    return
  }
  if (screen === 'hotelDetails') {
    // The other path: "Reserve Room" books the stay on its own and lands on the
    // same checkout the packages path reaches.
    const rcta = t.closest('.rcr__cta')
    if (rcta && !rcta.disabled) { e.preventDefault(); bookRoomOnly() }
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
