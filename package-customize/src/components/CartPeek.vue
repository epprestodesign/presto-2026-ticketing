<script setup>
// CartPeek — the cart slide-over. THE ONE OVERLAY IN THIS PROTOTYPE.
//
// ⚠ Read this before "fixing" it back to a page.
//
// The Aug 25 review was blunt about dialogs — "I never want to have this as a
// pop-up... we almost never are going to want those modal pop-ups, we're always
// going to want a clean page" — and this app was rebuilt around that: the price
// dialog became the inline `PriceBreakdown`, and nothing else here floats.
//
// The stakeholder then asked, explicitly and separately, for the CART to be a
// slide-over peek WITH a full page behind it. That is a scoped reversal, not a
// change of mind about dialogs, and this file is the whole of it. The peek is a
// GLANCE — "what am I holding right now" — answerable from any screen without
// leaving the one you are on, which is the one job a page cannot do. Everything
// it links to is a page: `CartScreen` for the full cart, the customize screen for
// changes, checkout for the exit.
//
// So: the cart peek is the single sanctioned overlay. `PriceBreakdown` stays
// inline, `PackagePriceDialog` stays deleted, and nothing else in this app is
// allowed to become a dialog on the strength of this one existing.
//
// --- Why this REPLACES the library's CartFlyout ------------------------------
// It is wired in through this app's own `OVERRIDES` map in vite.config.js, which
// redirects `@lib/components/CartFlyout.vue` to this file for this app only. The
// library is untouched; `GlobalNav` is mounted exactly as it ships and opens
// "its" flyout, which is this. That is the mechanism the app already documents
// for "a library component can't carry package semantics", and it is the only way
// to reach inside `GlobalNav`, which has no slot and no cart events.
//
// Three things made the library `CartFlyout` the wrong body, all of them read
// off it rather than assumed:
//
//  1. THE BADGE COULD NEVER BE LIVE. `GlobalNav`'s count is an internal ref fed
//     by `@update:count` from the flyout, and the flyout's entire template — the
//     `CartReview` that emits that count — sits inside `v-if="modelValue"`. So the
//     count is 0 until the guest opens the cart once, on every screen, forever.
//     The brief asks for a live count; the library shape cannot produce one. This
//     component is always mounted and emits its count from a watcher, so the badge
//     is right before anything is clicked.
//  2. IT IS NOT A PEEK. In `ticketing` mode `CartReview` is the full checkout
//     review body: expandable per-line panels, a hotel sub-block with nightly
//     rows and policies, a Price details card, seat-delivery guarantees. Putting
//     that in the drawer makes the drawer the cart page, and then the cart page
//     it links to has nothing left to be.
//  3. ITS FOOTER IS A HOLD. A "Time left to book" countdown over a hardcoded
//     "Go to checkout" button — no hold exists in this flow, and there is no prop
//     or event to point that button at a cart page.
//
// --- What is in here, and what deliberately is not ---------------------------
// Lines, discount, total, forward. No notes under the lines, no expandable
// components, no fees or taxes card — every one of those is on `CartScreen`,
// which is a page and can hold them. A peek that itemises as hard as the page
// makes the page redundant, which is how a "cart" ends up being two of the same
// screen.
//
// The CTA is the same `CheckoutCta` as the rail, the review card and the narrow
// bar. Not a similar button — the same component, for the reason that file gives:
// one action stated four times has to look identical or it reads as four actions.
// The full-cart link below it is quiet and underlined, in the slot and the weight
// the rail's "Reset" link uses, so the peek cannot start competing with the
// checkout CTA it was added next to.
import { computed, watch, onMounted, onBeforeUnmount } from 'vue'
import DsEmptyState from '@lib/components/DsEmptyState.vue'
import CheckoutCta from './CheckoutCta.vue'
import { journey, basePackage, priced, isCustomized, changesFromPreset, checkout, openCart, nav } from '../store.js'
import { cartLines, cartCount, cartContext } from '../cart.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // GlobalNav passes these to whatever it thinks its flyout is. They are declared
  // so they don't fall through onto the root element, and ignored on purpose:
  // this cart reads the configuration, and the configuration is in the store. A
  // cart prop would be a second copy of the order, which is a second thing to be
  // wrong.
  mode: { type: String, default: 'reserve' },
  cart: { type: Object, default: () => ({}) },
  currency: { type: String, default: '$' },
})
const emit = defineEmits(['update:modelValue', 'update:count'])

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

// The badge. Emitted on mount and on every change — this component stays mounted
// whether or not the drawer is open, which is the whole point (see 1 above).
// From `onMounted` rather than an `immediate` watcher: the first emit writes to a
// ref inside GlobalNav, and doing that during this component's SETUP would be
// mutating the parent halfway through the render that is mounting the child.
// After mount it is an ordinary queued update.
watch(cartCount, (v) => emit('update:count', v))

const empty = computed(() => !journey.inCart)
const discountPct = computed(() => Math.round(priced.value.discountRate * 100))
// On the cart page itself the "open the full cart" link would point at the page
// under the drawer. It says so instead of pretending to go somewhere.
const onCartPage = computed(() => journey.screen === 'cart')

// Same problem, one screen further on. The cart is now visible on CHECKOUT (the
// configuration strip and the "Back to your package" link were both taken off the
// top of that screen, and the nav cart is what replaces them as the route back —
// see App.vue's NO_CART note). "Continue to checkout" over the checkout page is a
// button that closes the drawer and does nothing, and a filled navy CTA floating
// over `CheckoutPageExpanded`'s "Book Now" is the peek competing with the one
// action the review asked to make obvious. So on checkout the footer keeps the
// total and drops the CTA: what the guest needs from the cart THERE is a way
// BACK to the package, which is the quiet link below.
const onCheckout = computed(() => journey.screen === 'checkout')

const close = () => emit('update:modelValue', false)
const go = (fn) => { close(); fn() }

// Navigating away closes it. Every link in here leads somewhere, and a drawer
// still hanging over the screen it just sent you to is a drawer you have to
// dismiss before you can read what you asked for.
watch(() => journey.screen, close)

const onKey = (e) => { if (e.key === 'Escape' && props.modelValue) close() }
onMounted(() => {
  emit('update:count', cartCount.value)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
<teleport to="body">
  <div v-if="modelValue" class="cpk">
    <div class="cpk__scrim" @click="close" />
    <aside class="cpk__panel" role="dialog" aria-modal="true" aria-label="Your cart">
      <header class="cpk__top">
        <h2 class="cpk__title">Your cart</h2>
        <button type="button" class="cpk__close" aria-label="Close cart" @click="close">
          <q-icon name="close" size="22px" />
        </button>
      </header>

      <div v-if="empty" class="cpk__body cpk__body--empty">
        <ds-empty-state
          icon="shopping_cart"
          title="Your cart is empty"
          description="Pick one of the three pre-built packages and start changing it — it lands here the moment you open it."
        >
          <template #action>
            <button type="button" class="cpk__emptybtn" @click="go(() => nav('packages'))">
              See the packages
            </button>
          </template>
        </ds-empty-state>
      </div>

      <template v-else>
        <div class="cpk__body">
          <div class="cpk__pkg">
            <p class="cpk__eyebrow">
              Your package
              <span v-if="isCustomized" class="cpk__tag">Customised</span>
            </p>
            <h3 class="cpk__name">{{ basePackage.name }}</h3>
            <p class="cpk__context">{{ cartContext }}</p>
            <p v-if="isCustomized" class="cpk__changes">
              <q-icon name="edit" size="13px" />
              {{ changesFromPreset.length }} change{{ changesFromPreset.length === 1 ? '' : 's' }}
              from the original
            </p>
          </div>

          <!-- Labels and amounts only. The notes, the components and the
               per-line actions are the cart page's job. -->
          <ul class="cpk__lines">
            <li v-for="l in cartLines" :key="l.key" class="cpk__row">
              <span class="cpk__label">{{ l.label }}</span>
              <span class="cpk__amt">{{ money(l.value) }}</span>
            </li>
          </ul>

          <div class="cpk__totals">
            <div class="cpk__row cpk__row--sub">
              <span class="cpk__label">Booked separately</span>
              <span class="cpk__amt">{{ money(priced.componentsTotal) }}</span>
            </div>
            <div class="cpk__row cpk__row--save">
              <span class="cpk__label">Bundle discount · {{ discountPct }}%</span>
              <span class="cpk__amt">−{{ money(priced.savings) }}</span>
            </div>
          </div>
        </div>

        <footer class="cpk__foot">
          <div class="cpk__row cpk__row--total">
            <span>Package total</span>
            <span>{{ money(priced.packagePrice) }}</span>
          </div>
          <p class="cpk__per">{{ money(priced.perPerson) }} per person · all in, USD</p>

          <!-- No forward CTA on checkout — the page under the drawer IS the
               forward action. -->
          <checkout-cta v-if="!onCheckout" class="cpk__cta" :total="priced.packagePrice" @click="go(checkout)" />

          <!-- The route back out of checkout, in the quiet weight the full-cart
               link already uses. This is the ONLY place it lives now: it costs
               the top of the checkout screen nothing, which is the whole reason
               the link that used to sit up there was removed. -->
          <button v-if="onCheckout" type="button" class="cpk__full cpk__full--lead" @click="go(() => nav('customize'))">
            <q-icon name="arrow_back" size="15px" />Change your package
          </button>

          <p v-if="onCartPage" class="cpk__here">
            <q-icon name="check_circle" size="15px" /> You're looking at the full cart.
          </p>
          <button v-else type="button" class="cpk__full" @click="go(openCart)">
            Open the full cart<q-icon name="arrow_forward" size="15px" />
          </button>
        </footer>
      </template>
    </aside>
  </div>
</teleport>
</template>

<style scoped>
/* z-index above everything else fixed in the app: the customize screen's
   narrow-viewport action bar (30) and, on checkout, the HoldTimerPill (2000).
   The pill is furniture and the peek is the one overlay, so the peek covers it —
   a countdown floating on top of an open drawer would read as a second layer of
   chrome fighting the first. */
.cpk { position: fixed; inset: 0; z-index: 3000; }
.cpk__scrim { position: absolute; inset: 0; background: rgba(9, 9, 11, .5); animation: cpk-fade .18s ease; }
.cpk__panel { position: absolute; top: 0; right: 0; height: 100%; width: 420px; max-width: 94vw; background: var(--ds-color-surface, #fff); display: flex; flex-direction: column; box-shadow: var(--ds-shadow-4, 0 12px 40px rgba(0, 0, 0, .28)); animation: cpk-slide .22s var(--ds-ease-standard, cubic-bezier(.2, 0, 0, 1)); }
@keyframes cpk-fade { from { opacity: 0; } }
@keyframes cpk-slide { from { transform: translateX(100%); } }

.cpk__top { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px 14px; border-bottom: 1px solid var(--ds-color-border); }
.cpk__title { margin: 0; font-size: 1.125rem; font-weight: 800; color: var(--ds-color-text); }
.cpk__close { width: 36px; height: 36px; border: 0; border-radius: 50%; background: var(--ds-palette-slate-100, #f1f2f4); color: var(--ds-color-text); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.cpk__close:hover { background: var(--ds-palette-slate-200, #e3e5e8); }

.cpk__body { flex: 1; overflow-y: auto; padding: 16px 18px 20px; }
.cpk__body--empty { display: flex; align-items: center; }
.cpk__emptybtn { padding: 11px 18px; border: 0; border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }

.cpk__pkg { padding-bottom: 14px; border-bottom: 1px solid var(--ds-color-border); }
.cpk__eyebrow { display: flex; align-items: center; gap: 8px; margin: 0; font-size: .6875rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.cpk__tag { padding: 2px 8px; border-radius: var(--ds-radius-pill, 999px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; letter-spacing: .03em; }
.cpk__name { margin: 5px 0 0; font-size: 1.1875rem; font-weight: 800; color: var(--ds-color-text); }
.cpk__context { margin: 4px 0 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.cpk__changes { display: flex; align-items: center; gap: 5px; margin: 8px 0 0; font-size: .8125rem; font-weight: 600; color: var(--ds-color-text-subtle); }

.cpk__lines { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 11px; }
.cpk__totals { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--ds-color-border); display: flex; flex-direction: column; gap: 8px; }

.cpk__row { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; font-size: .9375rem; color: var(--ds-color-text); }
.cpk__label { min-width: 0; }
.cpk__amt { font-variant-numeric: tabular-nums; white-space: nowrap; }
.cpk__row--sub .cpk__amt { color: var(--ds-color-text-subtle); text-decoration: line-through; }
.cpk__row--save { color: var(--ds-color-text-success, #167a4a); font-weight: 700; }
.cpk__row--save .cpk__amt { color: inherit; }

/* Same 2px brand rule as the price rail's foot, for the same reason: what is
   above explains, what is below acts. */
.cpk__foot { flex: none; padding: 14px 18px 18px; border-top: 2px solid var(--ds-color-background-brand-bold, #01113E); background: var(--ds-color-surface-sunken, #f7f8f9); }
.cpk__row--total { font-size: 1.375rem; font-weight: 800; }
.cpk__per { margin: 2px 0 0; text-align: right; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.cpk__cta { margin-top: 12px; }

.cpk__full--lead { margin-top: 14px; }
.cpk__full { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; margin-top: 10px; padding: 8px; border: 0; background: none; font: inherit; font-size: .875rem; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }
.cpk__here { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 12px 0 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.cpk__here .q-icon { color: var(--ds-color-text-success, #167a4a); }

@media (max-width: 460px) { .cpk__panel { width: 100vw; } }
</style>
