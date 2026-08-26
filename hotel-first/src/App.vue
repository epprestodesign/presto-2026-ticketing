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
//    THE CART, in three pieces that are the same cart: the nav's cart button
//    with a live count of the lines on the order (GlobalNav, `ticketing` mode,
//    fed the live itinerary) → CartPeek, the slide-over summary → the full cart
//    PAGE, where the order can actually be changed. The combined cart is visible
//    three screens before checkout, not revealed at it.
//
//    CartPeek is the ONLY overlay in this prototype and it is sanctioned: the
//    map is an in-page panel, the clear-cart confirmation is an in-page bar, and
//    both were converted away from modals on Aug 25. See CartPeek.vue for why
//    the exception was asked back in — and do not add a second one.
//
// 2. THE ROUTER. The library page components emit no navigation events (we make
//    ZERO library changes), so navigation is driven by ONE document-level,
//    capture-phase click handler that matches the clicked element. Capture phase
//    plus document scope also catches TELEPORTED nodes — the cart fly-out, menus,
//    the full-screen map dialog — that render outside the active screen's subtree.
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import PageFrame from '@lib/components/PageFrame.vue'
import AppStepper from '@lib/components/AppStepper.vue'
import { journey, activeHotel, STEP_LABELS, currentStage, showStepper, goToStage, openHotel, selectRoom, nav, goToCart, resetJourney, setGuests } from './store.js'
import { getHotelByName, getHotel } from './hotels.js'
import { buildCart } from './itinerary.js'

import CartPeek from './components/CartPeek.vue'
import LandingScreen from './screens/LandingScreen.vue'
import HotelBrowseScreen from './screens/HotelBrowseScreen.vue'
import HotelDetailsScreen from './screens/HotelDetailsScreen.vue'
import TicketsScreen from './screens/TicketsScreen.vue'
import AddOnsScreen from './screens/AddOnsScreen.vue'
import CheckoutScreen from './screens/CheckoutScreen.vue'
import ConfirmationScreen from './screens/ConfirmationScreen.vue'
import CartScreen from './screens/CartScreen.vue'

const screens = {
  landing: LandingScreen,
  hotels: HotelBrowseScreen,
  hotelDetails: HotelDetailsScreen,
  tickets: TicketsScreen,
  addons: AddOnsScreen,
  checkout: CheckoutScreen,
  confirmation: ConfirmationScreen,
  cart: CartScreen,
}
const current = computed(() => screens[journey.screen] || LandingScreen)
const isLanding = computed(() => journey.screen === 'landing')
const cart = computed(() => buildCart(journey, activeHotel.value))

// THE COUNT. GlobalNav's badge is fed by whatever cart body it has open, and it
// has none until you click — so left alone it reads 0 for the whole flow. Patch
// the number directly instead: it is the no-library-change way to keep the count
// honest, and it is doubly required here because the nav's own fly-out is never
// the thing that opens (see the click handler below).
//
// The number is LINES ON THE ORDER, not units. A family of four with a room, a
// weekend pass and two park days is "4", not "13" — 13 is a number that is true
// of nothing the guest recognises, and it is the same call addons.js already
// made for `addOnCount`.
function syncBadge() {
  const n = cart.value.items.length
  nextTick(() => requestAnimationFrame(() => {
    document.querySelectorAll('.gnav__badge').forEach((b) => { b.textContent = String(n) })
  }))
}
watch([() => journey.screen, () => cart.value.items.length], syncBadge, { immediate: true })

// "Clear Cart" is confirmed, not immediate — the cart here holds a room, tickets
// AND attraction bookings, so an accidental clear costs three decisions.
//
// The confirmation is an IN-PAGE BAR, not a dialog (Aug 25). It was a q-dialog
// until this round, and it went the same way the map's DsModal did: this
// prototype now has no pop-up layers at all, so the one remaining one would have
// been the exception that made the rule look accidental. The bar takes the top
// of the frame, above the stepper, where the guest is already looking after
// clicking something in the nav — it is unmissable without being modal, and the
// page underneath stays readable, which for a "you are about to delete a room,
// four passes and three bookings" question is the useful part.
//
// The rejected alternative was clearing immediately with an Undo toast. Undo is
// the right pattern when the action is cheap to redo; re-picking a property, a
// room, five tiers and three add-ons is not.
const confirmClearOpen = ref(false)
function confirmClear() {
  confirmClearOpen.value = false
  resetJourney()
}
// Asked from inside the peek, the peek has to get out of the way first — the bar
// lives in the page, and the peek's scrim would have hidden the question.
function requestClear() {
  peekOpen.value = false
  confirmClearOpen.value = true
}

// The cart peek. Opened by the nav cart button (intercepted below), and the only
// route to the full cart page — so a glance at the order never costs the guest
// the step they were on.
const peekOpen = ref(false)
function openFullCart() {
  peekOpen.value = false
  goToCart()
}
function peekToCheckout() {
  peekOpen.value = false
  nav('checkout')
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

// The landing page's Travelers field is the first number the guest types, and
// until now it was thrown away: BookingWidget keeps `rooms` in local state and
// exposes NO v-model and NO emit, so a parent cannot read it. Search therefore
// navigated with the party still at its default, and the guest had to say how
// many people were coming a second time on the Tickets step — having already
// answered on the screen before.
//
// Party size is the ONE quantity in this flow (see `journey.guests`), so the
// landing's answer has to become that value or it means nothing. With no event
// to listen to, the number is read off the rendered control at the moment Search
// is pressed — the same technique this app already uses for the room CTA, and
// the one `/prototype` uses for the same class of library gap.
//
// Rejected: overriding BookingWidget through the OVERRIDES map. It would give a
// clean prop, but forks a 300-line library component with a date picker and a
// teams block to reach one integer — and the fork then silently stops tracking
// the real widget. Reading the label costs one selector and stays honest about
// which component owns the field.
function carryTravelers() {
  if (typeof document === 'undefined') return
  // "1 traveler, 1 room" / "4 travelers, 2 rooms" — the label BookingWidget
  // renders from its own `travelersTotal`.
  for (const input of document.querySelectorAll('.bw__input input')) {
    const m = /(\d+)\s+traveler/.exec(input.value || '')
    if (m) { setGuests(parseInt(m[1], 10)); return }
  }
}

function onClickCapture(e) {
  const t = e.target
  if (!(t instanceof Element)) return

  // Global: the top-left wordmark → Landing.
  if (t.closest('.gnav__brand')) { e.preventDefault(); nav('landing'); return }

  // Global: the nav's cart button opens OUR peek, not GlobalNav's own fly-out.
  //
  // GlobalNav hard-wires that button to the library CartFlyout and exposes no
  // prop or event to redirect it, so the click is caught here in the capture
  // phase and stopped before it ever reaches the button's own Vue listener.
  // GlobalNav's `cartOpen` therefore stays false for the life of the app and its
  // CartFlyout never renders — which is what guarantees the peek is the only
  // overlay rather than one of two stacked ones.
  //
  // The rejected alternative was passing `show-cart="false"` and building a nav
  // of our own. That trades one intercepted click for a forked component, and
  // the nav is exactly the thing that is supposed to be identical across these
  // prototypes.
  if (t.closest('.gnav__iconbtn')) {
    e.preventDefault(); e.stopPropagation()
    peekOpen.value = true
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
    if (t.closest('.bw__search')) { carryTravelers(); nav('hotels') }
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
  <!-- `hfapp--held` only while the checkout screen is up: that is the one screen
       that mounts the fixed HoldTimerPill, and the class buys the page footer
       clearance so the pill never comes to rest on the legal line. See the rule
       at the bottom of this file. -->
  <div class="hfapp" :class="{ 'hfapp--held': journey.screen === 'checkout' }">
    <!-- Landing brings its own nav and footer (LandingPage is a whole page). -->
    <component :is="current" v-if="isLanding" />

    <!-- PageFrame doesn't forward GlobalNav's `manage` event, so no listener is
         bound here — a stray one would land on the frame's root element as an
         attribute rather than doing anything. -->
    <page-frame v-else brand="Presto" cart-mode="ticketing" :cart="cart" :show-cart="true">
      <!-- Clear Cart confirmation — an in-page bar, never a pop-up. -->
      <div v-if="confirmClearOpen" class="hfapp__confirm" role="alertdialog" aria-labelledby="hfclear-title">
        <div class="hfapp__confirm-inner">
          <q-icon name="warning" size="22px" class="hfapp__confirm-icon" />
          <div class="hfapp__confirm-text">
            <strong id="hfclear-title">Clear cart &amp; start over?</strong>
            <span>This removes your room, your tournament passes and any Orlando add-ons, and returns you to the start. This can't be undone.</span>
          </div>
          <div class="hfapp__confirm-actions">
            <button type="button" class="hfapp__confirm-btn" @click="confirmClearOpen = false">Keep cart</button>
            <button type="button" class="hfapp__confirm-btn hfapp__confirm-btn--danger" @click="confirmClear">Clear cart &amp; start over</button>
          </div>
        </div>
      </div>

      <div v-if="showStepper" class="hfapp__stepper">
        <app-stepper :steps="STEP_LABELS" :current="currentStage" clickable allow-ahead @navigate="goToStage" />
      </div>
      <main class="hfapp__main">
        <!-- `request-clear` is the cart page asking for the confirmation bar.
             Screens that don't emit it just ignore the listener. -->
        <component :is="current" @request-clear="requestClear" />
      </main>
    </page-frame>

    <!-- The one sanctioned overlay. Mounted outside PageFrame so it survives a
         screen change, and teleported to <body> by the component itself. -->
    <cart-peek
      :open="peekOpen" :cart="cart" :guests="journey.guests"
      @close="peekOpen = false" @view-cart="openFullCart" @checkout="peekToCheckout" @clear="requestClear"
    />
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

/* The clear-cart confirmation bar — full-bleed under the nav, in the page. */
.hfapp__confirm { background: var(--ds-color-background-danger, #fdecec); border-bottom: 1px solid var(--ds-color-border-danger, #e5b4b4); }
.hfapp__confirm-inner { max-width: min(1440px, 92%); margin-inline: auto; padding: 14px 0; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.hfapp__confirm-icon { color: var(--ds-color-text-danger, #a1242b); flex: none; }
.hfapp__confirm-text { flex: 1; min-width: 240px; display: flex; flex-direction: column; }
.hfapp__confirm-text strong { color: var(--ds-color-text-danger, #a1242b); font-size: 0.9375rem; }
.hfapp__confirm-text span { color: var(--ds-color-text, #1a1a1a); font-size: 0.875rem; }
.hfapp__confirm-actions { display: flex; gap: 10px; flex: none; }
.hfapp__confirm-btn { height: 40px; padding: 0 16px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button); background: var(--ds-color-surface); color: var(--ds-color-text); font: inherit; font-weight: 700; font-size: 0.875rem; cursor: pointer; }
.hfapp__confirm-btn--danger { background: var(--ds-color-background-danger-bold, #a1242b); border-color: var(--ds-color-background-danger-bold, #a1242b); color: #fff; }

/* CLEARANCE FOR THE HOLD PILL (checkout only). CheckoutScreen mounts the fixed
   HoldTimerPill bottom-right; at full scroll the last thing in the document is
   PageFrame's footer, whose right-aligned "© 2026 EventPipe · Terms · Privacy ·
   Contact" line lands inside the pill's band and is covered by it. Everything
   the guest acts on is already clear — Book Now and the whole form sit in the
   left column, the rail's totals stop above the band — so this is the only
   collision, and it is a resting one rather than a passing one: no amount of
   scrolling reveals the line again.
   Fixed by making the footer taller ON THIS SCREEN, not by moving the pill: the
   stakeholder asked for the corner, and lifting the pill off it would just park
   it on top of the rail instead. Padding the footer is also why this rule lives
   here rather than in CheckoutScreen's scoped block — the footer is PageFrame's,
   a sibling of the screen slot, so no :deep() from inside the screen reaches it.
   Applied via a class rather than globally so no other screen carries dead space
   below its footer. */
/* 96px, not 76: at 1440x900 the legal line's baseline landed 2px inside the
   pill's top edge — clear to the eye, but an actual intersection, and the
   kind that reappears the moment the pill's copy wraps to a third line.
   Sized to clear the pill's 59px band plus a real gap rather than to just
   miss it. */
.hfapp--held .pf__footer-inner { padding-bottom: 96px; }
</style>
