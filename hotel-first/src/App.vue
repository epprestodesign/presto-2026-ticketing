<script setup>
// App shell. Two jobs, and deliberately nothing else.
//
// 1. THE FRAME. Every screen except Landing renders inside the library's real
//    PageFrame — the same Global Nav and footer the sibling /prototype app puts
//    around Browse, Details, Checkout and Confirmation. The fork this app came
//    from used a bare GlobalNav with no footer; PageFrame is what the booking
//    site actually ships, and the hotel side of this flow has to be that site.
//    The stepper sits inside the frame, under the nav, because a four-stage
//    journey needs an orientation the booking site's own screens don't carry.
//
//    The nav cart runs in `ticketing` mode against the live itinerary, so the
//    fly-out shows the room, the passes and the add-ons together from the moment
//    the first thing is chosen — the combined cart is visible three screens
//    before checkout, not revealed at it.
//
// 2. THE ROUTER. The library page components emit no navigation events (we make
//    ZERO library changes), so navigation is driven by ONE document-level,
//    capture-phase click handler that matches the clicked element. Capture phase
//    plus document scope also catches TELEPORTED nodes — the cart fly-out, menus,
//    the full-screen map dialog — that render outside the active screen's subtree.
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import PageFrame from '@lib/components/PageFrame.vue'
import AppStepper from '@lib/components/AppStepper.vue'
import { journey, activeHotel, STEP_LABELS, currentStage, showStepper, goToStage, openHotel, selectRoom, nav, resetJourney } from './store.js'
import { getHotelByName, getHotel } from './hotels.js'
import { buildCart } from './itinerary.js'

import LandingScreen from './screens/LandingScreen.vue'
import HotelBrowseScreen from './screens/HotelBrowseScreen.vue'
import HotelDetailsScreen from './screens/HotelDetailsScreen.vue'
import TicketsScreen from './screens/TicketsScreen.vue'
import AddOnsScreen from './screens/AddOnsScreen.vue'
import CheckoutScreen from './screens/CheckoutScreen.vue'
import ConfirmationScreen from './screens/ConfirmationScreen.vue'

const screens = {
  landing: LandingScreen,
  hotels: HotelBrowseScreen,
  hotelDetails: HotelDetailsScreen,
  tickets: TicketsScreen,
  addons: AddOnsScreen,
  checkout: CheckoutScreen,
  confirmation: ConfirmationScreen,
}
const current = computed(() => screens[journey.screen] || LandingScreen)
const isLanding = computed(() => journey.screen === 'landing')
const cart = computed(() => buildCart(journey, activeHotel.value))

// GlobalNav's badge is fed by the cart fly-out, which only mounts when opened —
// so the badge reads 0 until you click it. Patch the number directly instead:
// it's the no-library-change way to keep the count honest as items are added.
function syncBadge() {
  const n = cart.value.items.length
  nextTick(() => requestAnimationFrame(() => {
    document.querySelectorAll('.gnav__badge').forEach((b) => { b.textContent = String(n) })
  }))
}
watch([() => journey.screen, () => cart.value.items.length], syncBadge, { immediate: true })

// "Clear Cart" is confirmed, not immediate — the cart here holds a room, tickets
// AND attraction bookings, so an accidental clear costs three decisions.
const confirmClearOpen = ref(false)
function confirmClear() {
  confirmClearOpen.value = false
  resetJourney()
}

// Read the chosen room off the library room card's own DOM. RoomCardReserve emits
// `reserve` with no payload, and HotelDetailPage doesn't forward it — so the card
// itself is the only place the selection exists.
function readRoom(card) {
  if (!card) return null
  const nightly = parseFloat((card.querySelector('.rcr__per')?.textContent || '').replace(/[^0-9.]/g, ''))
  if (!nightly) return null
  return {
    type: card.querySelector('.rcr__title')?.textContent?.trim() || 'Room',
    bedConfig: card.querySelector('.rcr__bed')?.textContent?.trim() || '',
    sleeps: parseInt((card.querySelector('.rcr__occ')?.textContent || '').match(/(\d+)/)?.[1] || '2', 10),
    nightly,
  }
}

function onClickCapture(e) {
  const t = e.target
  if (!(t instanceof Element)) return

  // Global: the top-left wordmark → Landing.
  if (t.closest('.gnav__brand')) { e.preventDefault(); nav('landing'); return }

  // Global: the cart fly-out's "Clear Cart" → confirm first. Stop the library
  // handler so nothing is cleared while the dialog is still a question.
  const menuItem = t.closest('.q-item')
  if (menuItem && /clear cart/i.test(menuItem.textContent || '')) {
    e.preventDefault(); e.stopPropagation()
    confirmClearOpen.value = true
    return
  }

  // Global: a map tooltip's hotel link (the sentinel href our map field writes).
  const pin = t.closest('a[href^="#hotel-"]')
  if (pin) {
    e.preventDefault()
    const h = getHotel(pin.getAttribute('href').replace('#hotel-', ''))
    if (h) openHotel(h.id, 'rooms')
    return
  }

  const screen = journey.screen
  if (screen === 'landing') {
    if (t.closest('.bw__search')) nav('hotels')
    return
  }
  if (screen === 'hotels') {
    // The hotel NAME opens on Overview; the card's "Choose Your Room" CTA is a
    // real `choose` event handled by the screen and lands on the Rooms tab.
    const nameEl = t.closest('.hc__name')
    if (nameEl) {
      const h = getHotelByName(nameEl.textContent?.trim())
      if (h) openHotel(h.id, 'overview')
    }
    return
  }
  if (screen === 'hotelDetails') {
    const rcta = t.closest('.rcr__cta')
    if (rcta && !rcta.disabled) selectRoom(readRoom(rcta.closest('.rcr')))
    return
  }
  if (screen === 'checkout') {
    const btn = t.closest('button')
    if (btn && /book now|place order|pay now|confirm & pay/i.test((btn.textContent || '').trim())) nav('confirmation')
    return
  }
}
onMounted(() => document.addEventListener('click', onClickCapture, true))
onBeforeUnmount(() => document.removeEventListener('click', onClickCapture, true))
</script>

<template>
  <div class="hfapp">
    <!-- Landing brings its own nav and footer (LandingPage is a whole page). -->
    <component :is="current" v-if="isLanding" />

    <!-- PageFrame doesn't forward GlobalNav's `manage` event, so no listener is
         bound here — a stray one would land on the frame's root element as an
         attribute rather than doing anything. -->
    <page-frame v-else brand="Presto" cart-mode="ticketing" :cart="cart" :show-cart="true">
      <div v-if="showStepper" class="hfapp__stepper">
        <app-stepper :steps="STEP_LABELS" :current="currentStage" clickable allow-ahead @navigate="goToStage" />
      </div>
      <main class="hfapp__main">
        <component :is="current" />
      </main>
    </page-frame>

    <!-- Clear Cart confirmation — the DS "Cancel reservation" danger dialog. -->
    <q-dialog v-model="confirmClearOpen" persistent>
      <q-card class="ds-dialog">
        <h2 class="ds-dialog__title">Clear cart &amp; start over?</h2>
        <p class="ds-dialog__body">This removes your room, your tournament passes and any Orlando add-ons, and returns you to the start. This <strong>can't be undone</strong>.</p>
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
.hfapp { min-height: 100vh; background: var(--ds-color-surface); display: flex; flex-direction: column; }
.hfapp__main { display: flex; flex-direction: column; }

/* Cap the global nav content to the shared column, edge-to-edge bar (the same
   treatment the /prototype app uses). The wordmark reads as a link. */
.gnav-wrap { background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-border); }
.gnav { max-width: min(1440px, 92%) !important; margin-inline: auto !important; padding-inline: 0 !important; background: transparent !important; border-bottom: 0 !important; }
.gnav__brand { cursor: pointer; }
</style>
