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
// AUG 25, SECOND LOOK: THE SHELL MOUNTS EXACTLY ONE OVERLAY, AND ONLY ONE MAY
// EVER BE ADDED BACK. The first Aug 25 round emptied this file of two of them —
// a DsSidePanel trip fly-out and a DsModal stay editor — on the note "I never
// want to have this as a pop-up … we're always going to want a clean page". The
// next review asked for the cart specifically to be reachable as a peek with a
// full page behind it, so TripFlyout is back, hung here (the only place that is
// above every screen) and opened from the nav's cart icon.
//
// The rest of that round stands, and the difference matters to anyone editing
// this file:
//
//   • THE CART PEEK IS THE ONLY SANCTIONED OVERLAY. It is the cart, it is a view
//     of a page that still exists at `trip`, and it is opened from a control
//     that is visible on every screen.
//   • EVERYTHING ELSE IS STILL A PAGE. `hotel` is the HotelDetailPage screen —
//     StayEditDialog is NOT coming back; `stays` is the full Browse Hotels
//     experience. Adding a second modal here would be a regression, not a
//     symmetry.
//
// TripBar stays docked and is not an overlay: it takes its own row and scrolls
// nothing under a scrim. AUG 25, FOURTH ROUND: IT NO LONGER CARRIES A CART
// HANDLE. The stakeholder looked at the bar's "4 items / $803" button beside the
// nav's cart icon and called it — "there is a cart button that already exists
// from the global nav" — so the icon is the one cart control in this app and the
// bar keeps only the three Add doors and the summary of what the trip holds. The
// earlier "one action, two placements" argument is overruled, not forgotten; it
// and what replaced it are written out in TripBar itself.
import { computed, onMounted, onBeforeUnmount } from 'vue'
import TripNav from './components/TripNav.vue'
import TripBar from './components/TripBar.vue'
import TripFlyout from './components/TripFlyout.vue'
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
// is inside a library page this app doesn't own. (The nav's own two intercepts —
// wordmark and cart icon — used to live here too; they moved into TripNav, where
// they can listen on the nav subtree instead of on every click in the app.)
function onClickCapture(e) {
  const t = e.target
  if (!(t instanceof Element)) return
  if (trip.screen !== 'checkout') return
  const btn = t.closest('button')
  if (btn && /book now|place order|pay now|confirm & pay/i.test((btn.textContent || '').trim())) nav('confirmation')
}
onMounted(() => document.addEventListener('click', onClickCapture, true))
onBeforeUnmount(() => document.removeEventListener('click', onClickCapture, true))
</script>

<template>
  <div class="tbapp">
    <trip-nav />
    <trip-bar v-if="showBar" />

    <main class="tbapp__main">
      <component :is="current" />
    </main>

    <!-- The peek. Hung at the shell because it opens over every screen — which
         is the one thing a page cannot do, and the reason this single overlay
         earns its place. -->
    <trip-flyout />
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
