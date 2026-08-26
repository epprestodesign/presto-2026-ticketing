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
// --- The nav cart (Aug 25, second pass) --------------------------------------
// The nav now carries the library GlobalNav's cart button with a live count, and
// clicking it opens a slide-over peek that links to a full cart page.
//
// The peek is THE ONLY OVERLAY IN THIS PROTOTYPE, and it is there because the
// stakeholder asked for it by name after asking for everything else to be a page.
// Nothing else may follow it: the price breakdown stays inline, and
// `PackagePriceDialog` stays deleted. The argument, and what was rejected, is at
// the top of CartPeek.vue.
//
// GlobalNav renders its own `CartFlyout`, which this app redirects to `CartPeek`
// through the OVERRIDES map in vite.config.js — the library is untouched and the
// nav is mounted exactly as it ships. The redirect is what makes the badge live:
// the library flyout only mounts its body while OPEN, so its count is 0 until the
// guest opens the cart. See vite.config.js and CartPeek.vue.
//
// The cart is hidden on CONFIRMATION and nowhere else. That order has been
// bought; a cart icon over a placed order invites the guest to go back and change
// something that is no longer changeable.
//
// CHECKOUT USED TO BE HIDDEN TOO, AND IS NOT ANY MORE (Aug 25, third pass). The
// argument for hiding it was that checkout already carried the order twice — this
// screen's configuration strip AND the library page's sticky rail — so a cart in
// the nav would be a third, competing exit from the one page whose only job is to
// be finished. Both halves of that argument have since been deleted:
//
//  · the configuration strip is gone (the stakeholder wanted the top of checkout
//    clean), so the order is stated once, in the rail;
//  · the quiet "Back to your package" link that replaced it is now gone too, on
//    the same instruction — and it was the ONLY route from checkout back to the
//    thing checkout is charging for.
//
// Leaving the cart hidden on top of those two removals would make checkout a dead
// end: no strip, no back link, no cart — the guest could reach the payment form
// and have no way to return to their package short of the browser Back button.
// Restoring the strip or the link was the alternative and is exactly what was
// rejected, twice. The cart icon is the one exit that costs the top of the screen
// NOTHING: it is chrome the nav already carries on every other screen, it sits in
// furniture that is there regardless, and it puts nothing between the nav and
// "Confirm and pay". Its peek offers "Open the full cart", the cart page offers
// "Back to customizing", so the route back exists and is two clicks.
//
// It still does not compete with the checkout CTA: an icon in the nav bar is not
// a button on the page, and `CheckoutPageExpanded`'s full-width "Book Now" remains
// the only filled primary surface in the flow.
//
// Everywhere else — checkout now included — it stays visible even when it is
// EMPTY, showing 0 on the browse
// board. Hiding it until the guest takes a package was the alternative and was
// rejected for the same reason the stepper went: chrome that appears and
// disappears mid-flow reads as a rendering bug, and a cart that only exists once
// it is full can't be the thing you check before it is.
import { computed, onMounted, onBeforeUnmount } from 'vue'
import GlobalNav from '@lib/components/GlobalNav.vue'
import { journey, nav, resetJourney } from './store.js'

import PackagesScreen from './screens/PackagesScreen.vue'
import PackageDetailsScreen from './screens/PackageDetailsScreen.vue'
import CustomizeScreen from './screens/CustomizeScreen.vue'
import CartScreen from './screens/CartScreen.vue'
import CheckoutScreen from './screens/CheckoutScreen.vue'
import ConfirmationScreen from './screens/ConfirmationScreen.vue'
import HotelDetailsScreen from './screens/HotelDetailsScreen.vue'

const screens = {
  // The packages page is the landing page.
  packages: PackagesScreen,
  packageDetails: PackageDetailsScreen,
  // The screen this prototype exists for.
  customize: CustomizeScreen,
  // The full cart behind the nav peek — reachable from anywhere, part of no step.
  cart: CartScreen,
  checkout: CheckoutScreen,
  confirmation: ConfirmationScreen,
  // Optional, informational, opened in its own tab from any hotel name.
  hotelDetails: HotelDetailsScreen,
}
const current = computed(() => screens[journey.screen] || PackagesScreen)

const NO_CART = ['confirmation']
const cartVisible = computed(() => !NO_CART.includes(journey.screen))

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
    <global-nav brand="EventPipe" :show-cart="cartVisible" @manage="resetJourney" />
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
