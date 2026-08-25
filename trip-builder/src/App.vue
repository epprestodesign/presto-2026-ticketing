<script setup>
// Trip Builder app shell — a nav, a trip bar, and a screen.
//
// What is NOT here is the point. The /experience fork this was cut from mounted
// an AppStepper under the nav (Stays · Tickets · Review) and routed each library
// page's native CTA to the next screen with a capture-phase click handler. Both
// are gone:
//
//   • No stepper. A three-dot progress rail asserts an order, and this flow
//     doesn't have one — a guest who buys a parking pass and nothing else never
//     "skipped" two steps. TripBar took its place: it shows what the cart holds
//     and offers all three categories on every screen, which is orientation
//     without a sequence.
//
//   • No global click router. Screens are driven by real props and events
//     (HotelCardReserve's `choose`, TicketTierList's `continue`), so almost
//     nothing has to be intercepted by matching CSS classes on the way up. Two
//     library CTAs emit nothing a parent can hear — checkout's Book Now and the
//     room card's Reserve Room — and each is caught where it happens: Book Now
//     here, Reserve Room inside HotelScreen. Neither is a routing layer.
//
// GlobalNav is mounted with its cart hidden. Its cart button opens CartFlyout,
// whose body can't remove a line; a cart icon that opens a cart you can't edit
// would quietly contradict the prototype. The trip lives in TripBar instead.
//
// AUG 25: THE SHELL NO LONGER MOUNTS ANY OVERLAY. It used to carry two — a
// DsSidePanel trip fly-out and a DsModal stay editor — both hung here precisely
// so they could open over any screen. Stakeholder feedback was blunt about it:
// "I never want to have this as a pop-up … we're always going to want a clean
// page", and "I definitely wouldn't want it to be inconsistent between add-on
// and add hotel." Both are now screens (`hotel` and the `trip` page that already
// existed), so the shell is a nav, a bar and a page. What is left docked is
// TripBar, which is not an overlay: it takes up its own row, scrolls nothing
// under a scrim, and is the cart spine this prototype is built on.
import { computed, onMounted, onBeforeUnmount } from 'vue'
import GlobalNav from '@lib/components/GlobalNav.vue'
import TripBar from './components/TripBar.vue'
import { trip, nav } from './store.js'

import LandingScreen from './screens/LandingScreen.vue'
import StaysScreen from './screens/StaysScreen.vue'
import HotelScreen from './screens/HotelScreen.vue'
import TicketsScreen from './screens/TicketsScreen.vue'
import AddonsScreen from './screens/AddonsScreen.vue'
import TripScreen from './screens/TripScreen.vue'
import CheckoutScreen from './screens/CheckoutScreen.vue'
import ConfirmationScreen from './screens/ConfirmationScreen.vue'

const screens = {
  landing: LandingScreen,
  stays: StaysScreen,
  hotel: HotelScreen,
  tickets: TicketsScreen,
  addons: AddonsScreen,
  trip: TripScreen,
  checkout: CheckoutScreen,
  confirmation: ConfirmationScreen,
}
const current = computed(() => screens[trip.screen] || LandingScreen)

// The trip bar is on every screen except the confirmation — once an order is
// placed there is no trip left to add to, and a bar offering to add tickets to a
// finished purchase would be an invitation to a screen that can't honour it.
const showBar = computed(() => trip.screen !== 'confirmation')

// CheckoutPage's final Book Now is the one CTA in the app with no event to bind
// to, so it is caught here. Capture phase and document scope because the button
// is inside a library page this app doesn't own.
function onClickCapture(e) {
  const t = e.target
  if (!(t instanceof Element)) return
  if (t.closest('.gnav__brand')) { e.preventDefault(); nav('landing'); return }
  if (trip.screen !== 'checkout') return
  const btn = t.closest('button')
  if (btn && /book now|place order|pay now|confirm & pay/i.test((btn.textContent || '').trim())) nav('confirmation')
}
onMounted(() => document.addEventListener('click', onClickCapture, true))
onBeforeUnmount(() => document.removeEventListener('click', onClickCapture, true))
</script>

<template>
  <div class="tbapp">
    <global-nav brand="EventPipe" :show-cart="false" @manage="nav('trip')" />
    <trip-bar v-if="showBar" />

    <main class="tbapp__main">
      <component :is="current" />
    </main>
  </div>
</template>

<style>
html, body { margin: 0; }
html { scrollbar-gutter: stable both-edges; }
body { background: var(--ds-palette-slate-100, #f1f2f4); }
.tbapp { min-height: 100vh; background: var(--ds-color-surface, #fff); display: flex; flex-direction: column; }
.tbapp__main { flex: 1; display: flex; flex-direction: column; }

/* Cap the global nav content to the shared column, edge-to-edge bar — the same
   treatment the sibling prototypes use. The wordmark reads as a link home. */
.gnav-wrap { background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-border); }
.gnav { max-width: min(1440px, 92%) !important; margin-inline: auto !important; padding-inline: 0 !important; background: transparent !important; border-bottom: 0 !important; }
.gnav__brand { cursor: pointer; }
</style>
