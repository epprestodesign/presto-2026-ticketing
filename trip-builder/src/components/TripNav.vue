<script setup>
// TripNav — the app's top bar: the library's GlobalNav, with its cart icon
// switched ON and pointed at this prototype's trip.
//
// WHY A WRAPPER EXISTS AT ALL. GlobalNav's cart button is hard-wired to its own
// CartFlyout, and two things about that are wrong here — neither reachable
// through a prop, and no library file may be edited:
//
//   1. THE COUNT. The badge number comes from CartReview, which only mounts once
//      the library fly-out is already open. So the badge reads 0 for the entire
//      life of the page unless you open the very thing the badge is meant to
//      advertise. The live count is put in its place from out here.
//   2. THE DESTINATION. CartFlyout's body cannot remove a line (see TripItems).
//      A cart icon that opens a cart you can't edit would contradict the whole
//      prototype, so the press opens TripFlyout — our peek — instead.
//
// Both are corrected from outside the library:
//
//   • The click is caught in the CAPTURE phase ON THIS WRAPPER — not on
//     document, so no click anywhere else in the app is ever inspected — and
//     stopped before it reaches the button's own handler. GlobalNav's `cartOpen`
//     therefore never flips and its CartFlyout never renders. Belt and braces,
//     the unscoped rule at the bottom of this file makes the library fly-out
//     unpaintable even if that interception ever misses.
//   • The count is a real reactive element teleported into the same button, with
//     the library's stuck-at-0 badge hidden underneath it. (It is presentational:
//     the button keeps GlobalNav's own "Open cart" accessible name, which wins
//     over any text inside it. A count in the accessible name would need a
//     library prop, and adding one is out of scope for a prototype.)
//
// REJECTED: `:show-cart="false"` plus a cart button of our own next to the nav's
// actions. It avoids both hacks and costs a local re-draw of the library's icon
// button — which means the four Aug 25 prototypes would each carry their own
// copy of the one affordance this round exists to make identical across them.
// The library's button, driven from outside, is the same pixels everywhere.
import { computed, onMounted, ref, watch } from 'vue'
import GlobalNav from '@lib/components/GlobalNav.vue'
import { trip, count, openPeek, nav } from '../store.js'

// AUG 25, FOURTH ROUND: THIS ICON IS NOW THE ONLY CART CONTROL IN THE APP. The
// trip bar's "4 items / $803" handle was removed on a direct stakeholder note —
// "there is a cart button that already exists from the global nav" — so this is
// the single way into the peek from every screen, and the pattern the other
// three Aug 25 prototypes already share. It carries more weight than it did:
// with checkout's "Edit trip" bar gone too, this icon is the route back to an
// editable trip FROM CHECKOUT. Do not hide it there.
//
// No cart on the confirmation: the order is placed, there is no trip left to
// open, and a badge over a finished purchase invites a screen that can't honour
// it. Same rule as TripBar, for the same reason.
const cartVisible = computed(() => trip.screen !== 'confirmation')

// On the trip page the cart IS the page. Pressing the icon there would drop a
// peek on top of the thing it is a peek AT, so instead the button marks itself
// as the current place and does nothing.
const onTripPage = computed(() => trip.screen === 'trip')

// The badge is teleported into a button the library renders, so the target has
// to exist before the Teleport is patched. `mounted` covers first paint;
// the post-flush watch covers the confirmation → landing return, where the
// button reappears in the same tick the Teleport would have been mounted in.
const mounted = ref(false)
const cartMounted = ref(cartVisible.value)
onMounted(() => { mounted.value = true })
watch(cartVisible, (v) => { cartMounted.value = v }, { flush: 'post' })

function onNavClickCapture(e) {
  const el = e.target instanceof Element ? e.target : null
  if (!el) return
  // The wordmark reads as a link home; GlobalNav renders it as an inert anchor.
  if (el.closest('.gnav__brand')) { e.preventDefault(); e.stopPropagation(); nav('landing'); return }
  if (!el.closest('.gnav__iconbtn')) return
  e.preventDefault()
  e.stopPropagation() // ← GlobalNav's own @click never runs: CartFlyout stays shut
  if (!onTripPage.value) openPeek()
}
</script>

<template>
  <div class="tbnav" :class="{ 'tbnav--current': onTripPage }" @click.capture="onNavClickCapture">
    <global-nav brand="EventPipe" :show-cart="cartVisible" @manage="nav('trip')" />

    <teleport v-if="mounted && cartMounted" to=".gnav__iconbtn">
      <span class="tbnav__badge" :class="{ 'is-zero': count === 0 }">{{ count }}</span>
    </teleport>
  </div>
</template>

<style scoped>
/* Ours sits exactly where the library's does — see the unscoped block below for
   why the library's is hidden rather than fed. */
.tbnav__badge { position: absolute; top: -2px; right: -2px; min-width: 22px; height: 22px; padding: 0 5px; border-radius: var(--ds-radius-pill, 999px); background: var(--ds-color-background-danger-bold, #b3261e); color: #fff; font-family: var(--ds-font-family); font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
/* An empty trip is a normal state here, not a thing to alarm anyone about. */
.tbnav__badge.is-zero { background: var(--ds-palette-slate-200, #e2e4e8); color: var(--ds-color-text-subtle); }
</style>

<style>
/* Unscoped: these reach into GlobalNav's own scoped rules, so they need the
   weight. Nothing in the library is modified — this is the wrapper paying for
   the two behaviours it takes over. */

/* The library badge is fed by CartFlyout and is therefore permanently 0. */
.tbnav .gnav__badge { display: none !important; }

/* The trip page: current, not disabled — the button is where you already are. */
.tbnav--current .gnav__iconbtn { background: var(--ds-palette-navy-50, #eef1f8) !important; cursor: default !important; }

/* The library cart fly-out can no longer be opened (the capture handler above
   eats the only press that would). This makes it unable to PAINT either, so
   "the cart peek is the only overlay in this app" holds even if that handler is
   ever refactored away. `body >` on purpose: CartFlyout teleports its root to
   the body, while this prototype's ConfirmationScreen also uses a `.cf` root
   deep inside #app and must not be caught by this. */
body > .cf { display: none !important; }
</style>
