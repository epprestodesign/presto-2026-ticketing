<script setup>
// CartPeek — the cart slide-over, opened from the Global Nav's cart button.
//
// ⚠️ THIS IS THE ONE SANCTIONED OVERLAY IN THIS PROTOTYPE, AND IT IS NOT A
// MISTAKE. Everything else here is a page on purpose — "we almost never are
// going to want those modal pop-ups, we're always going to want a clean page" —
// and the four suppressions that rule produced are all still in force:
// HotelDetails.vue hides the room card's Price Details and the gallery's "See
// all photos", TicketMapStep.vue hides the map's tune/filters q-dialog, and
// LandingStep.vue passes show-teams="false" so BookingWidget's "Add a group"
// dialog is never mounted. The cart is a deliberate, scoped reversal the
// stakeholder asked back in on Aug 25 — a slide-over cart — and then asked for
// again by name the same evening: "i want the review to be the cart flyout."
// A cart you have to leave the step to look at is a cart nobody checks mid-flow.
//
// So: if you are reading this while tidying up a stray modal — do not convert
// this one back to a page, and do not add a second one.
//
// WHY NOT THE LIBRARY'S CartFlyout. It was the first thing tried, it is the
// right chrome for the Group Block flow it was built for, and three things stop
// it fitting here:
//   1. Its body is CartReview, which is read-only but for a ticket-quantity
//      control it owns in a deep copy of the cart. This panel is now where the
//      whole trip is edited — every line, the extras, the routes back — and a
//      cart that edits its own copy prints a number the trip never sees.
//   2. Its footer is one hard-coded "Go to checkout" q-btn with no click event
//      and no slot, so the panel could offer nothing else and say nothing about
//      what it can do.
//   3. It carries a 15-minute "time left to book" countdown. That is a group-
//      block hold device; nothing in this flow holds inventory, and a ticking
//      clock the order does not actually obey is the kind of detail a prototype
//      gets quoted back at it. (The checkout rail's countdown is the library's
//      own CheckoutPageExpanded and stays as shipped.)
//
// AUG 25, THAT EVENING — THE PEEK GAINED A JOB: the Extras step was deleted and
// its four offers moved in here ("i think we can put extras in the flyout cart").
//
// AUG 25, LATER THE SAME EVENING — THE PEEK IS THE CART:
//
//   "make sure the review screen is the checkout. i want the review to be the
//    cart flyout."
//
// The cart SCREEN is deleted. Everything it offered is in this panel: the ticket
// quantity stepper, the stay's Remove and "Change hotel or room", the extras
// picker with add and remove, parking's vehicle stepper, the totals breakdown,
// the bundle-credit badge, the routes back to Tickets and Hotel, and the button
// that goes to checkout. The stepper's "Review" label now lights on the CHECKOUT
// screen, which is where the finished order is stated and paid for.
//
// So this panel is no longer "the cart you can reach without leaving the step
// you're on" — it is the only cart there is, and that is why it has to be
// reachable from every screen the trip can still change on (App.vue carries it
// on the nav everywhere but the landing, which gets a pill of its own, and the
// confirmation, where the order is paid).
//
// TripCartBody's `readonly` prop went with the cart screen. It named the
// difference between this panel and that page; with no page there is no
// difference to name, and a flag whose only remaining job would be to make the
// one cart less capable than itself is a flag that will eventually be passed by
// accident. The body renders one way now.
import { computed, watch, onBeforeUnmount } from 'vue'
import BundleSavingsBadge from '@lib/components/BundleSavingsBadge.vue'
import TripCartBody from './TripCartBody.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  // Null until the trip has tickets in it — the peek then shows its empty state
  // rather than an empty-looking cart with a $0 total.
  cart: { type: Object, default: null },
  vehicles: { type: Number, default: 1 },
  // False on the checkout screen: a button that navigates to the page you are
  // already on reads as broken. The panel still opens there, and still edits —
  // it is the only way to change the order mid-payment, and the checkout no
  // longer carries a bar of its own pointing at it.
  showCheckout: { type: Boolean, default: true },
})
const emit = defineEmits([
  'close', 'checkout', 'browse', 'edit',
  'update:quantity', 'update:vehicles', 'add-addon', 'remove-addon', 'remove-hotel',
])

const lineCount = computed(() => props.cart?.items?.length ?? 0)
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: props.cart?.currency || 'USD', maximumFractionDigits: 0 }).format(n)

// Escape closes, and the page behind stops scrolling while the panel is open.
// Both are the minimum an overlay owes the keyboard; a panel you can only
// dismiss with the mouse is the reason overlays were ruled out of this
// prototype in the first place.
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
            <h2 id="peek-title" class="peek__title">Your trip</h2>
            <!-- "Change anything here" is a promise the panel can now keep, and
                 the header is where a guest opening it decides whether it is
                 worth reading. -->
            <p class="peek__sub">
              <template v-if="lineCount">{{ lineCount }} {{ lineCount === 1 ? 'line' : 'lines' }} on one order — change anything here</template>
              <template v-else>Nothing in it yet</template>
            </p>
          </div>
          <button type="button" class="peek__close" aria-label="Close cart" @click="emit('close')">
            <q-icon name="close" size="22px" />
          </button>
        </header>

        <div class="peek__body">
          <template v-if="cart">
            <!-- The cart, whole: lines, controls, extras picker and totals. No
                 `readonly` — there is no other cart for it to be read-only
                 against any more. -->
            <TripCartBody
              :cart="cart" :vehicles="vehicles"
              @update:quantity="emit('update:quantity', $event)"
              @update:vehicles="emit('update:vehicles', $event)"
              @add-addon="emit('add-addon', $event)"
              @remove-addon="emit('remove-addon', $event)"
              @remove-hotel="emit('remove-hotel')"
              @edit="emit('edit', $event)"
            />
            <!-- The credit, said out loud. It was on the cart screen and nowhere
                 else, and a deduction buried in a totals column is a discount the
                 guest never notices they were given. The checkout rail carries it
                 as its own line (see buildCheckoutCart), so the badge is the one
                 thing that needed rehousing when the screen went. -->
            <div v-if="cart.credit > 0" class="peek__savings">
              <BundleSavingsBadge :amount="cart.credit" label="Bundled &amp; saved" size="sm" />
            </div>
          </template>
          <!-- The trip is empty until a seat is taken off the map, which is the
               one thing this flow cannot start without — so the empty state
               names that, rather than saying "your cart is empty" and leaving
               the guest to work out what fills it. -->
          <div v-else class="peek__empty">
            <q-icon name="confirmation_number" size="34px" class="peek__empty-icon" />
            <p class="peek__empty-h">Your trip starts with the seats</p>
            <p class="peek__empty-p">Pick your seats on the ticket map — the hotel comes next, and the gameday extras are added right here, on this panel, whenever you want them.</p>
          </div>
        </div>

        <footer class="peek__foot">
          <template v-if="cart">
              <!-- ONE ROUTE OUT, not two. "View full cart" pointed at a screen
                   that no longer exists — this panel IS the full cart — so what
                   is left is the way forward to paying for it.
                   On the checkout itself there is nowhere forward to go, so the
                   same button becomes the way back to the form: the panel is
                   opened over it from the nav's cart button, and closing is what
                   returns the guest to what they were filling in. -->
              <button
                type="button" class="peek__btn peek__btn--primary"
                @click="showCheckout ? emit('checkout') : emit('close')"
              >
                <span>{{ showCheckout ? 'Go to checkout' : 'Back to checkout' }}</span>
                <span class="peek__total">{{ fmt(cart.total) }}</span>
              </button>
              <!-- Says what this panel is, now that the answer is "all of it".
                   The alternative was saying nothing: a guest who has never seen
                   a cart that edits in place will look for the page. -->
              <p class="peek__note">Tickets, room and extras are all changed here — the totals follow.</p>
          </template>
          <button v-else type="button" class="peek__btn peek__btn--primary peek__btn--solo" @click="emit('browse')">
            Browse tickets
          </button>
        </footer>
      </aside>
    </div>
  </teleport>
</template>

<style scoped>
.peek { position: fixed; inset: 0; z-index: 3000; font-family: var(--ds-font-family); }
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

.peek__body { flex: 1; overflow-y: auto; padding: 18px 20px 24px; }
/* The body's first section heading draws its own top rule; inside the panel it
   would sit right under the header's, so the first one is dropped. */
.peek__body :deep(.tcbody__group:first-child .tcbody__sechead) { padding-top: 0; border-top: 0; }
/* The credit badge sits under the totals, where it did on the cart screen. */
.peek__savings { display: flex; margin-top: var(--ds-space-4); }

.peek__empty { text-align: center; padding: 40px 12px; }
.peek__empty-icon { color: var(--ds-color-icon-subtle); }
.peek__empty-h { margin: 12px 0 6px; font-size: 1rem; font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.peek__empty-p { margin: 0; font-size: 0.875rem; line-height: 1.5; color: var(--ds-color-text-subtle); }

.peek__foot { flex: none; border-top: 1px solid var(--ds-color-border); padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; background: var(--ds-color-surface); }
.peek__btn {
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; min-height: 50px;
  padding: 0 18px; border-radius: var(--ds-radius-button); font: inherit;
  font-weight: var(--ds-font-weight-bold); cursor: pointer;
}
.peek__btn--ghost { background: var(--ds-color-surface); border: 1px solid var(--ds-color-border-bold); color: var(--ds-color-text); }
.peek__btn--ghost:hover { background: var(--ds-palette-slate-100); }
.peek__btn--primary { border: none; background: var(--ds-color-background-brand-bold); color: var(--ds-color-text-inverse); justify-content: space-between; }
.peek__btn--solo { justify-content: center; }
.peek__total { font-variant-numeric: tabular-nums; }
.peek__note { margin: 2px 0 0; text-align: center; font-size: 0.75rem; color: var(--ds-color-text-subtlest); }

@media (max-width: 520px) { .peek__panel { width: 100vw; } }
</style>
