<script setup>
// CartPeek — the cart slide-over.
//
// ⚠️ THIS IS THE ONE SANCTIONED OVERLAY IN THIS PROTOTYPE. Everything else here
// is page-based on purpose ("we almost never are going to want those modal
// pop-ups, we're always going to want a clean page") — the hotel map is an
// in-page panel (HotelMapPanel.vue) and the clear-cart confirmation is an
// in-page bar (App.vue), both converted away from DsModal/q-dialog on Aug 25.
// The cart is the deliberate, scoped exception the stakeholder asked back in: a
// cart you have to leave the page to look at is a cart nobody checks mid-flow,
// and the peek is what makes the running order glanceable from any step. If you
// are reading this while "fixing" a stray modal — do not convert this one. Do
// not add a second one either.
//
// WHY NOT THE LIBRARY'S CartFlyout. It was the first thing tried, and it is the
// right chrome for the Group Block flow it was built for, but two things stop it
// fitting here:
//   1. Its footer is a single hard-coded "Go to checkout" CTA with no click
//      event and no slot, so the peek could never offer the route to the full
//      cart page — which is the entire point of this round's change.
//   2. It carries a 15-minute "time left to book" countdown. That is a group-
//      block hold device; this flow holds no inventory, and a ticking clock the
//      order does not actually obey is the kind of thing a prototype gets
//      quoted back at it.
// What DOES get reused is the part that matters: the body is the library's real
// <CartReview> in `ticketing` mode — the same component the checkout rail
// renders — so the peek and the checkout cannot print different money.
//
// The peek is a PEEK, not a second copy of the cart page. It is fed
// `peekCart()` (see itinerary.js): the same items and the same totals to the
// dollar, with the per-line detail panels and the guarantees block stripped out.
// Compact by DATA rather than by re-implemented markup — a second row template
// would be one more place for the two surfaces to drift apart.
import { computed, watch, onBeforeUnmount } from 'vue'
import CartReview from '@lib/components/CartReview.vue'
import { peekCart } from '../itinerary.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  cart: { type: Object, default: () => ({}) },
  guests: { type: Number, default: 4 },
})
const emit = defineEmits(['close', 'view-cart', 'checkout', 'clear'])

const summaryCart = computed(() => peekCart(props.cart))
const lineCount = computed(() => (props.cart.items || []).length)
const money = (n) => '$' + Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Escape closes, and the page behind stops scrolling while the panel is open.
// Both are the minimum an overlay owes the keyboard; a panel you can only
// dismiss with the mouse is the reason overlays got banned from this prototype
// in the first place.
const onKey = (e) => { if (e.key === 'Escape') emit('close') }
watch(() => props.open, (v) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = v ? 'hidden' : ''
  if (v) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="peek">
      <div class="peek__scrim" @click="emit('close')" />
      <aside class="peek__panel" role="dialog" aria-modal="true" aria-labelledby="peek-title">
        <header class="peek__head">
          <div class="peek__headtext">
            <h2 id="peek-title" class="peek__title">Your cart</h2>
            <p class="peek__sub">{{ lineCount }} {{ lineCount === 1 ? 'item' : 'items' }} — room, passes and add-ons on one order</p>
          </div>
          <button type="button" class="peek__close" aria-label="Close cart" @click="emit('close')">
            <q-icon name="close" size="22px" />
          </button>
        </header>

        <div class="peek__body">
          <!-- The real library cart body, fed the stripped-detail projection. -->
          <cart-review mode="ticketing" :cart="summaryCart" readonly />
          <p class="peek__party">
            <q-icon name="group" size="16px" />
            <span>Every quantity on this order follows your party of {{ guests }}. Change the party, or remove a line, on the full cart.</span>
          </p>
        </div>

        <footer class="peek__foot">
          <!-- Full cart first, checkout second: the peek's job is to hand you to
               the page where the order can actually be edited, and the guest who
               opened the cart mid-flow is far more often checking than paying. -->
          <button type="button" class="peek__btn peek__btn--ghost" @click="emit('view-cart')">
            <q-icon name="shopping_basket" size="18px" /> View full cart
          </button>
          <button type="button" class="peek__btn peek__btn--primary" @click="emit('checkout')">
            <span>Go to checkout</span>
            <span class="peek__total">{{ money(cart.total) }}</span>
          </button>
          <button type="button" class="peek__clear" @click="emit('clear')">Clear cart &amp; start over</button>
        </footer>
      </aside>
    </div>
  </teleport>
</template>

<style scoped>
.peek { position: fixed; inset: 0; z-index: 3000; }
.peek__scrim { position: absolute; inset: 0; background: rgba(9, 9, 11, 0.5); animation: peek-fade 0.18s ease; }
.peek__panel { position: absolute; top: 0; right: 0; height: 100%; width: 460px; max-width: 94vw; background: var(--ds-color-surface); display: flex; flex-direction: column; box-shadow: var(--ds-shadow-4, 0 12px 40px rgba(0,0,0,0.28)); animation: peek-slide 0.22s var(--ds-ease-standard); }
@keyframes peek-fade { from { opacity: 0; } }
@keyframes peek-slide { from { transform: translateX(100%); } }

.peek__head { display: flex; align-items: flex-start; gap: 12px; padding: 18px 20px 14px; border-bottom: 1px solid var(--ds-color-border); flex: none; }
.peek__headtext { flex: 1; min-width: 0; }
.peek__title { margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--ds-color-text); }
.peek__sub { margin: 3px 0 0; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }
.peek__close { width: 36px; height: 36px; border: 0; border-radius: 50%; background: var(--ds-palette-slate-100); color: var(--ds-color-text); cursor: pointer; display: flex; align-items: center; justify-content: center; flex: none; }
.peek__close:hover { background: var(--ds-palette-slate-200); }

.peek__body { flex: 1; overflow-y: auto; }
.peek__party { display: flex; align-items: flex-start; gap: 8px; margin: 0; padding: 14px 20px 20px; font-size: 0.8125rem; line-height: 1.45; color: var(--ds-color-text-subtle); }
.peek__party :deep(.q-icon) { flex: none; margin-top: 1px; }

.peek__foot { flex: none; border-top: 1px solid var(--ds-color-border); padding: 14px 20px 18px; display: flex; flex-direction: column; gap: 10px; background: var(--ds-color-surface); }
.peek__btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 50px; border-radius: var(--ds-radius-button); font: inherit; font-weight: 700; font-size: 0.9375rem; cursor: pointer; }
.peek__btn--ghost { border: 1px solid var(--ds-color-border-bold); background: var(--ds-color-surface); color: var(--ds-color-text); }
.peek__btn--ghost:hover { background: var(--ds-palette-slate-100); }
.peek__btn--primary { border: 0; background: var(--ds-color-background-brand-bold); color: #fff; justify-content: space-between; padding: 0 18px; }
.peek__total { font-variant-numeric: tabular-nums; }
.peek__clear { border: 0; background: none; padding: 2px 0 0; font: inherit; font-size: 0.8125rem; font-weight: 700; color: var(--ds-color-text-danger, #a1242b); text-decoration: underline; cursor: pointer; align-self: center; }

@media (max-width: 520px) { .peek__panel { width: 100vw; } }
</style>
