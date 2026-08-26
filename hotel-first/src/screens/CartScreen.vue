<script setup>
// The full cart — a real page, not a bigger overlay.
//
// This is the screen the peek hands you to. It is the only place the order can
// be CHANGED, and it is a page for the same reason every other surface in this
// prototype is a page: editing a three-part itinerary inside a 460px slide-over
// is how people end up removing the wrong thing.
//
// ── WHAT "EDITABLE IN PLACE" MEANS HERE ────────────────────────────────────
// Party size locks every quantity (Aug 25 — `setTicketQty` / `setAddOnQty` were
// deleted so no caller can hand in an arbitrary number). So this page carries no
// per-line stepper, and it never will. What it offers instead is the two edits
// that cannot make the order disagree with itself:
//
//   1. THE PARTY SIZE, at the top, as the single quantity control. Changing it
//      re-derives every remaining line in one pass (store.js `repriceForParty`),
//      so four passes and four park days become two and two together.
//   2. IN OR OUT, per line. "Remove" is `toggleTicket(id, false)` /
//      `toggleAddOn(id, false)` — the exact same in/out control the Tickets and
//      Add-Ons cards already expose, just placed where the guest is looking.
//      Nothing here can set a line to a number.
//
// A removed line is not replaced with a "0 ×" row you can nudge back up; the
// section falls back to an empty state that links to the step it came from. That
// is deliberate — an "add" affordance in the cart is one product decision away
// from being a quantity affordance again.
//
// The ROOM has no Remove. The room is why this order exists (hotel-first: the
// stay is allowed to be the whole purchase, but the purchase is never allowed to
// be everything EXCEPT the stay), so it offers "Change room" and "Change hotel"
// instead, and the way to end up with no room at all is the same Clear cart &
// start over that has always meant that. The rejected alternative was a Remove
// that empties the cart implicitly — a destructive action wearing the same word
// as the two next to it that only drop a $59 breakfast.
//
// The rail is the library's real OrderSummary, fed the SAME `buildSummary()` the
// checkout page passes it. Not a lookalike: the same component and the same
// numbers, which is what makes "cart, rail and confirmation agree to the dollar"
// a property of the data rather than a thing to re-check by eye.
import { computed, ref } from 'vue'
import OrderSummary from '@lib/components/checkout/OrderSummary.vue'
import PartySizeField from '../components/PartySizeField.vue'
import { STAY } from '../event.js'
import { ticketLines, tierQtyNote, TICKETS_BY_ID } from '../tickets.js'
import { addOnLines, addOnQtyNote, unitLabel } from '../addons.js'
import { buildCart, buildSummary } from '../itinerary.js'
import {
  journey, activeHotel, setGuests, toggleTicket, toggleAddOn,
  nav, openHotel, leaveCart, RETURN_LABELS,
} from '../store.js'

const emit = defineEmits(['request-clear'])

const cart = computed(() => buildCart(journey, activeHotel.value))
const summary = computed(() => buildSummary(journey, activeHotel.value, cart.value))
const tickets = computed(() => ticketLines(journey.tickets))
const addOns = computed(() => addOnLines(journey.addOns))
const lineCount = computed(() => cart.value.items.length)
const roomTotal = computed(() => journey.room.nightly * STAY.nights)
const backLabel = computed(() => RETURN_LABELS[journey.returnScreen] || 'your trip')

const money = (n) => '$' + Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// OrderSummary's "Change" buttons emit the row label. Dates live on the search,
// and the party lives on this page — so "Change" on Party scrolls to the one
// control rather than sending the guest somewhere else to find it.
const partyRef = ref(null)
function onChange(label) {
  if (label === 'Party') partyRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  else nav('hotels')
}
</script>

<template>
  <div class="cart">
    <div class="cart__inner">
      <button type="button" class="cart__back" @click="leaveCart">
        <q-icon name="arrow_back" size="18px" /> Back to {{ backLabel }}
      </button>

      <header class="cart__head">
        <p class="cart__eyebrow"><q-icon name="shopping_basket" size="16px" /> One order</p>
        <h1 class="cart__h1">Your cart</h1>
        <p class="cart__sub">
          {{ lineCount }} {{ lineCount === 1 ? 'item' : 'items' }} — the room, the tournament passes and any Orlando
          add-ons, on one payment. Change your party size or drop a line here; nothing restarts.
        </p>
      </header>

      <div class="cart__grid">
        <div class="cart__main">
          <!-- The single quantity control on the page. -->
          <div ref="partyRef">
            <party-size-field
              :guests="journey.guests"
              note="This is the only quantity on the order — every pass, park day and breakfast below is priced for this many people."
              @update:guests="setGuests"
            />
          </div>

          <!-- ── Stay ── -->
          <section class="cart__sec">
            <h2 class="cart__sech">Stay</h2>
            <div class="cart__row">
              <span class="cart__icon"><q-icon name="hotel" size="20px" /></span>
              <div class="cart__info">
                <span class="cart__name">{{ activeHotel.name }}</span>
                <span class="cart__meta">{{ journey.room.type }} · {{ journey.room.bedConfig }} · Sleeps {{ journey.room.sleeps }}</span>
                <span class="cart__meta">{{ STAY.nights }} nights · {{ STAY.range }} · ${{ journey.room.nightly }}/night</span>
                <span class="cart__note"><q-icon name="verified" size="14px" /> Spirit Nationals contracted block · free cancellation until Feb 10, 2027</span>
              </div>
              <div class="cart__end">
                <span class="cart__amt">{{ money(roomTotal) }}</span>
                <div class="cart__acts">
                  <button type="button" class="cart__act" @click="openHotel(journey.hotelId, 'rooms')">Change room</button>
                  <button type="button" class="cart__act" @click="nav('hotels')">Change hotel</button>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Tournament admission ── -->
          <section class="cart__sec">
            <h2 class="cart__sech">Tournament admission</h2>
            <div v-if="tickets.length" class="cart__rows">
              <div v-for="t in tickets" :key="t.id" class="cart__row">
                <span class="cart__icon"><q-icon name="confirmation_number" size="20px" /></span>
                <div class="cart__info">
                  <span class="cart__name">{{ t.name }}</span>
                  <span class="cart__meta">{{ t.days }} · {{ money(t.price) }} per guest</span>
                  <span class="cart__note"><q-icon name="group" size="14px" /> {{ tierQtyNote(TICKETS_BY_ID[t.id], journey.guests) }}</span>
                </div>
                <div class="cart__end">
                  <span class="cart__amt">{{ money(t.amount) }}</span>
                  <div class="cart__acts">
                    <button type="button" class="cart__act cart__act--rm" @click="toggleTicket(t.id, false)">Remove</button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="cart__empty">
              <p>No tournament passes on this order. Your room stays booked either way — plenty of families only need the bed.</p>
              <button type="button" class="cart__emptycta" @click="nav('tickets')">Add passes</button>
            </div>
          </section>

          <!-- ── Orlando add-ons ── -->
          <section class="cart__sec">
            <h2 class="cart__sech">Orlando add-ons</h2>
            <div v-if="addOns.length" class="cart__rows">
              <div v-for="a in addOns" :key="a.id" class="cart__row">
                <span class="cart__icon"><q-icon :name="a.icon" size="20px" /></span>
                <div class="cart__info">
                  <span class="cart__name">{{ a.name }}</span>
                  <span class="cart__meta">{{ a.vendor }} · {{ a.when }}</span>
                  <span class="cart__note"><q-icon name="group" size="14px" /> {{ addOnQtyNote(a, journey.guests) }} · {{ money(a.price) }} {{ unitLabel(a) }}</span>
                </div>
                <div class="cart__end">
                  <span class="cart__amt">{{ money(a.amount) }}</span>
                  <div class="cart__acts">
                    <button type="button" class="cart__act cart__act--rm" @click="toggleAddOn(a.id, false)">Remove</button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="cart__empty">
              <p>Nothing added. Park days, a character breakfast and the airport van are all optional, and all cancellable up to 72 hours out.</p>
              <button type="button" class="cart__emptycta" @click="nav('addons')">Browse add-ons</button>
            </div>
          </section>

          <p class="cart__foot">
            Prototype pricing. Quantities are not editable line by line on purpose: the party size above sets every
            one of them, so the cart, the checkout rail and your confirmation can never print different numbers.
          </p>
        </div>

        <aside class="cart__rail">
          <!-- The library's real checkout rail, on the same summary object the
               checkout page uses. -->
          <order-summary :summary="summary" @change="onChange" />
          <button type="button" class="cart__cta" @click="nav('checkout')">
            Go to checkout <q-icon name="arrow_forward" size="18px" />
          </button>
          <button type="button" class="cart__continue" @click="leaveCart">Keep shopping</button>
          <button type="button" class="cart__clear" @click="emit('request-clear')">Clear cart &amp; start over</button>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart { display: flex; flex-direction: column; flex: 1; background: var(--ds-palette-slate-50, #f8fafc); }
.cart__inner { width: 100%; max-width: 1180px; margin-inline: auto; padding: 22px 24px 56px; }

.cart__back { display: inline-flex; align-items: center; gap: 6px; border: 0; background: none; padding: 0; margin-bottom: 14px; font: inherit; font-weight: 700; font-size: 0.875rem; color: var(--ds-color-text-brand); cursor: pointer; }
.cart__back:hover { text-decoration: underline; }

.cart__head { margin-bottom: 22px; }
.cart__eyebrow { display: flex; align-items: center; gap: 6px; margin: 0 0 6px; font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ds-color-text-subtle); }
.cart__h1 { margin: 0; font-size: 1.75rem; font-weight: 800; color: var(--ds-color-text); }
.cart__sub { margin: 8px 0 0; max-width: 74ch; color: var(--ds-color-text-subtle); }

.cart__grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 32px; align-items: start; }
.cart__main { min-width: 0; display: flex; flex-direction: column; gap: 20px; }

.cart__sec { display: flex; flex-direction: column; gap: 10px; }
.cart__sech { margin: 0; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ds-color-text-subtle); }
.cart__rows { display: flex; flex-direction: column; gap: 10px; }

.cart__row { display: flex; align-items: flex-start; gap: 14px; background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); padding: 16px; }
.cart__icon { flex: none; width: 40px; height: 40px; border-radius: var(--ds-radius-md); background: var(--ds-palette-slate-100); color: var(--ds-color-text); display: flex; align-items: center; justify-content: center; }
.cart__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.cart__name { font-weight: 700; color: var(--ds-color-text); }
.cart__meta { font-size: 0.875rem; color: var(--ds-color-text-subtle); }
.cart__note { display: inline-flex; align-items: center; gap: 6px; margin-top: 3px; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }
.cart__note :deep(.q-icon) { flex: none; }
.cart__end { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.cart__amt { font-weight: 800; color: var(--ds-color-text); font-variant-numeric: tabular-nums; white-space: nowrap; }
.cart__acts { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.cart__act { border: 0; background: none; padding: 0; font: inherit; font-size: 0.8125rem; font-weight: 700; color: var(--ds-color-text-brand); text-decoration: underline; cursor: pointer; }
.cart__act--rm { color: var(--ds-color-text-danger, #a1242b); }

.cart__empty { background: var(--ds-color-surface); border: 1px dashed var(--ds-color-border-bold); border-radius: var(--ds-radius-lg); padding: 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.cart__empty p { margin: 0; flex: 1; min-width: 240px; font-size: 0.875rem; color: var(--ds-color-text-subtle); }
.cart__emptycta { height: 40px; padding: 0 18px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button); background: var(--ds-color-surface); color: var(--ds-color-text); font: inherit; font-weight: 700; font-size: 0.875rem; cursor: pointer; }
.cart__emptycta:hover { background: var(--ds-palette-slate-100); }

.cart__foot { margin: 4px 0 0; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }

.cart__rail { position: sticky; top: 16px; display: flex; flex-direction: column; gap: 12px; }
.cart__cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 50px; border: 0; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.cart__continue { width: 100%; height: 44px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button); background: var(--ds-color-surface); color: var(--ds-color-text); font: inherit; font-weight: 700; cursor: pointer; }
.cart__continue:hover { background: var(--ds-palette-slate-100); }
.cart__clear { border: 0; background: none; padding: 0; font: inherit; font-size: 0.8125rem; font-weight: 700; color: var(--ds-color-text-danger, #a1242b); text-decoration: underline; cursor: pointer; align-self: center; }

@media (max-width: 980px) {
  .cart__grid { grid-template-columns: 1fr; }
  .cart__rail { position: static; }
}
</style>
