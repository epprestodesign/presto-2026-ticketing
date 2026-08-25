<script setup>
// App shell — packages → package details → customize → checkout → confirmation,
// plus one off-flow reference view.
//
// Every screen is this app's own except the package template, checkout and
// confirmation, which are library pages mounted as shipped. So the only CTA still
// needing interception is CheckoutPageExpanded's "Book Now" — the one button that
// lives inside a library page and has nowhere else to send the guest.
//
// --- No stepper, anywhere (Aug 25) -------------------------------------------
// This shell used to render the library's `AppStepper` — Package · Customize ·
// Review — above every screen past the landing page. The Aug 25 review threw it
// out on the customize screen: "I don't like this review thing at the top", "I
// don't love that... it's a little confusing. We have this other thing on the side
// here", "once I get here, I don't think I need this at the top. I think I should
// just be here confirming."
//
// It is removed from the WHOLE prototype, not only from the screen it was
// criticised on. Deleting it on customize alone was the smaller change and was
// rejected: the stepper would then appear over the package page, vanish on
// customize, and reappear over checkout — chrome that flickers in and out reads as
// a rendering bug, and it would have made the one screen the guest spends longest
// on the odd one out.
//
// Nothing is lost by dropping it. It was never the flow's real orientation: the
// price rail states which package is being built and what it costs, every screen
// carries its own named back link ("Back to The Club Weekend"), and the library
// checkout page brings its own progression. The stepper was a fourth voice
// describing a four-screen flow — the "other thing on the side" already does the
// job, which is exactly what the review said.
import { computed, onMounted, onBeforeUnmount } from 'vue'
import GlobalNav from '@lib/components/GlobalNav.vue'
import { journey, nav, resetJourney } from './store.js'

import PackagesScreen from './screens/PackagesScreen.vue'
import PackageDetailsScreen from './screens/PackageDetailsScreen.vue'
import CustomizeScreen from './screens/CustomizeScreen.vue'
import CheckoutScreen from './screens/CheckoutScreen.vue'
import ConfirmationScreen from './screens/ConfirmationScreen.vue'
import HotelDetailsScreen from './screens/HotelDetailsScreen.vue'

const screens = {
  // The packages page is the landing page.
  packages: PackagesScreen,
  packageDetails: PackageDetailsScreen,
  // The screen this prototype exists for.
  customize: CustomizeScreen,
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
