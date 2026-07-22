<script setup>
// Experience app shell — a persistent Global Nav + AppStepper across the journey,
// with each library page rendered bare beneath (its own nav/frame dropped). The
// Landing screen is the full-bleed intro (LandingPage brings its own nav). There
// is NO footer action bar: forward navigation comes from each page's own CTAs
// (routed by the capture-phase click handler below) and from the clickable
// stepper, exactly like the sibling /prototype app. No library files are changed.
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import GlobalNav from '@lib/components/GlobalNav.vue'
import AppStepper from '@lib/components/AppStepper.vue'
import { ticketsHotelCart } from '@lib/stories/ticketing/_ticketing-flow-carts.js'
import { journey, STEP_LABELS, currentStage, showStepper, goToStage, openHotel, nav, resetJourney } from './store.js'

import LandingScreen from './screens/LandingScreen.vue'
import HotelBrowseScreen from './screens/HotelBrowseScreen.vue'
import HotelDetailsScreen from './screens/HotelDetailsScreen.vue'
import TicketsScreen from './screens/TicketsScreen.vue'
import CartScreen from './screens/CartScreen.vue'
import CheckoutScreen from './screens/CheckoutScreen.vue'
import ConfirmationScreen from './screens/ConfirmationScreen.vue'

const screens = {
  landing: LandingScreen,
  hotels: HotelBrowseScreen,
  hotelDetails: HotelDetailsScreen,
  tickets: TicketsScreen,
  cart: CartScreen,
  checkout: CheckoutScreen,
  confirmation: ConfirmationScreen,
}
const current = computed(() => screens[journey.screen] || LandingScreen)
const isLanding = computed(() => journey.screen === 'landing')

// GlobalNav's cart badge only updates when its (lazy) fly-out mounts CartReview,
// and each screen re-mounts the nav — so keep the badge in sync with the cart's
// item count directly (matches the sibling /prototype app's approach).
const cartCount = ticketsHotelCart.items?.length || 0
function syncBadge() {
  nextTick(() => requestAnimationFrame(() => {
    document.querySelectorAll('.gnav__badge').forEach((b) => { b.textContent = String(cartCount) })
  }))
}
watch(() => journey.screen, syncBadge, { immediate: true })

// "Clear Cart" confirmation (red danger dialog → clears and starts over on Landing).
const confirmClearOpen = ref(false)
function confirmClear() {
  confirmClearOpen.value = false
  resetJourney() // back to the Landing page, fresh start
}

// Route each library page's native CTA to a navigation, capture-phase + document
// scope so teleported nodes (menus, dialogs) are caught too. No library page
// emits nav events — we match the clicked element here, changing zero library code.
function onClickCapture(e) {
  const t = e.target
  if (!(t instanceof Element)) return

  // Global: the top-left EventPipe wordmark → Landing.
  if (t.closest('.gnav__brand')) { e.preventDefault(); nav('landing'); return }

  // Global: the cart fly-out's "Clear Cart" → confirm first (red dialog) instead
  // of clearing immediately. Stop the library handler so nothing clears yet.
  const menuItem = t.closest('.q-item')
  if (menuItem && /clear cart/i.test(menuItem.textContent || '')) {
    e.preventDefault(); e.stopPropagation()
    confirmClearOpen.value = true
    return
  }

  const screen = journey.screen
  if (screen === 'landing') {
    if (t.closest('.bw__search')) nav('hotels')
    return
  }
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
    // A room's "Reserve Room" CTA → continue to Tickets.
    const rcta = t.closest('.rcr__cta')
    if (rcta && !rcta.disabled) nav('tickets')
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
    <!-- Landing brings its own nav; every other screen shares this one. The
         ticketing cart button (with count badge + fly-out) sits by Contact Us. -->
    <global-nav v-if="!isLanding" brand="EventPipe" cart-mode="ticketing" :cart="ticketsHotelCart" :show-cart="true" @manage="resetJourney" />
    <div v-if="showStepper" class="xapp__stepper">
      <app-stepper :steps="STEP_LABELS" :current="currentStage" clickable allow-ahead @navigate="goToStage" />
    </div>
    <main class="xapp__main">
      <component :is="current" />
    </main>

    <!-- Clear Cart confirmation — matches the DS "Cancel reservation" danger dialog. -->
    <q-dialog v-model="confirmClearOpen" persistent>
      <q-card class="ds-dialog">
        <h2 class="ds-dialog__title">Clear cart &amp; start over?</h2>
        <p class="ds-dialog__body">This removes your tickets and hotel from the cart and returns you to the start. This <strong>can't be undone</strong>.</p>
        <div class="ds-dialog__actions">
          <q-btn unelevated no-caps class="ds-dialog__btn ds-btn--secondary" label="Keep cart" v-close-popup />
          <q-btn unelevated no-caps class="ds-dialog__btn ds-btn--danger" label="Clear cart & start over" @click="confirmClear" />
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<style>
html, body { margin: 0; }
html { scrollbar-gutter: stable both-edges; }
body { background: var(--ds-palette-slate-100, #f1f2f4); }
.xapp { min-height: 100vh; background: var(--ds-color-surface, #fff); display: flex; flex-direction: column; }
.xapp__main { flex: 1; display: flex; flex-direction: column; }

/* Cap the global nav content to the shared column, edge-to-edge bar (same
   treatment the /prototype app uses). The wordmark reads as a link. */
.gnav-wrap { background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-border); }
.gnav { max-width: min(1440px, 92%) !important; margin-inline: auto !important; padding-inline: 0 !important; background: transparent !important; border-bottom: 0 !important; }
.gnav__brand { cursor: pointer; }
</style>
