<script setup>
// The trip, rendered — sections, lines, the extras picker and the totals. The
// BODY only: no title, no savings badge, no CTA.
//
// WHY IT EXISTS, AND WHY IT STILL DOES WITH ONE CALLER. It was split out of
// TripCart when the trip started being shown in two places — the cart screen and
// the nav's slide-over — so that neither could own its own row template and
// start quoting a different price for one trip.
//
// Aug 25, that evening, the stakeholder collapsed the two:
//
//   "make sure the review screen is the checkout. i want the review to be the
//    cart flyout."
//
// The cart SCREEN is deleted and TripCart with it, so CartPeek is the only
// caller. This file stays split from it anyway, for two reasons that are not
// "we might need it later": the panel owns chrome (scrim, header, footer,
// escape/scroll-lock) and the cart owns money, and mixing the two is how a
// scroll-lock bug turns into a totals diff in review. And the extras picker
// underneath reads its inputs off `cart` — one component between the lines and
// the offers is what keeps the picker's "× 2 guests" and the ticket line's
// "2 ×" the same number by construction.
//
// `readonly` IS GONE. It named the difference between the peek (a glance) and
// the cart screen (the edit surface), then narrowed to "no STEP controls" when
// the extras moved in. With the screen deleted there is no second surface for it
// to describe: the peek IS the cart, and a flag whose only remaining effect
// would be to make the one cart less capable than itself is a flag that gets
// passed by accident. So every control renders, always — the ticket quantity
// stepper, the stay's Remove, the per-section Edit links, the extras' Remove and
// parking's vehicle stepper.
//
// The rejected alternative was keeping `readonly: false` as the default and
// leaving the prop in place "in case a summary is wanted". A summary of the only
// cart is a cart the guest cannot use, and the prop would be the reason.
import { computed } from 'vue'
import QuantityStepper from '@lib/components/QuantityStepper.vue'
import CartAddOns from './CartAddOns.vue'

const props = defineProps({
  cart: { type: Object, required: true },   // buildTripCart() result
  vehicles: { type: Number, default: 1 },
})
const emit = defineEmits(['edit', 'update:quantity', 'update:vehicles', 'add-addon', 'remove-addon', 'remove-hotel'])

// Grouped rather than flat, so "tickets", "stay" and "extras" each get one
// heading and one Edit link back to the step that owns them. A per-line Edit
// link would repeat the same destination up to four times under Extras.
const SECTIONS = [
  { id: 'ticket', title: 'Tickets', step: 'tickets', editLabel: 'Change seats' },
  // The stay's Edit goes to the property's own DETAIL page, not the list: since
  // Aug 25 a stay is a property AND a room, and the room is the half more likely
  // to be second-guessed at the cart. The detail page's own "Back to Hotel
  // listing" is one click from there, so the property is still reachable —
  // whereas from the list, the room is two.
  { id: 'hotel', title: 'Your stay', step: 'hotelDetails', editLabel: 'Change hotel or room' },
  // No Edit link on the extras any more: there is nowhere for it to go. The
  // step it used to open was deleted this round, and the picker that replaced
  // it is a few lines further down this same component — a link that scrolls
  // you to the bottom of the thing you are already reading is worse than none.
  { id: 'experience', title: 'Gameday extras', step: null, editLabel: null },
]

const groups = computed(() =>
  SECTIONS
    .map((s) => ({ ...s, items: props.cart.items.filter((i) => i.type === s.id) }))
    .filter((s) => s.items.length)
)

// The picker reads its inputs off the CART rather than taking props of its own.
// Three surfaces now render extras (peek, cart screen, and whatever comes next)
// and the ticket count is the multiplier for three of the four offers — deriving
// it from the ticket line means the picker's "× 2 guests" and the ticket line's
// "2 ×" are the same number by construction, not by two callers remembering to
// pass the same prop. Same for the hotel: the transfer's dependency is on a stay
// being IN THE ORDER, which is precisely what a hotel line is.
const addedIds = computed(() => props.cart.items.filter((i) => i.type === 'experience').map((i) => i.addOnId))
const guests = computed(() => props.cart.items.find((i) => i.type === 'ticket')?.qty || 1)
const hasHotel = computed(() => props.cart.items.some((i) => i.type === 'hotel'))

const ICON = { ticket: 'confirmation_number', hotel: 'hotel', experience: 'stars' }
const iconFor = (item) => item.icon || ICON[item.type] || 'shopping_bag'

// A removable QuantityStepper emits `update:modelValue` 0 alongside `remove`
// when its trash can is pressed. Letting the 0 through would leave the vehicle
// count at zero, so re-adding parking later would price it at nothing — the
// removal is the whole message, and the count it left behind is not.
function setVehicles(n) { if (n >= 1) emit('update:vehicles', n) }

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: props.cart.currency || 'USD', maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <div class="tcbody">
    <div v-for="g in groups" :key="g.id" class="tcbody__group">
      <div class="tcbody__sechead">
        <span>{{ g.title }}</span>
        <button v-if="g.step" type="button" class="tcbody__edit" @click="emit('edit', g.step)">{{ g.editLabel }}</button>
      </div>

      <div v-for="(item, i) in g.items" :key="i" class="tcbody__item">
        <q-icon :name="iconFor(item)" size="20px" class="tcbody__icon" />
        <div class="tcbody__info">
          <div class="tcbody__label">{{ item.label }}</div>
          <div v-if="item.sublabel" class="tcbody__sub">{{ item.sublabel }}</div>

          <!-- One control per line, and only where a number is genuinely the
               guest's to set. Per-guest extras have no stepper on purpose:
               their quantity is the ticket count, so the ticket stepper above
               is the control that moves them. Parking is the exception (per
               VEHICLE, not per guest) and keeps its own, whose trash can is
               also what takes it back off the trip.

               Every branch renders unconditionally since `readonly` went: this
               is the only cart, so a control missing here is a control the
               guest does not have. -->
          <div class="tcbody__ctl">
            <QuantityStepper
              v-if="item.unit === 'vehicle'"
              :model-value="vehicles" :min="1" :max="4" size="sm" removable
              @update:model-value="setVehicles"
              @remove="emit('remove-addon', item.addOnId)"
            />
            <button v-else-if="item.type === 'experience'" type="button" class="tcbody__remove" @click="emit('remove-addon', item.addOnId)">
              <q-icon name="delete_outline" size="16px" />Remove
            </button>
            <QuantityStepper
              v-else-if="item.type === 'ticket'"
              :model-value="item.qty" :min="1" :max="item.maxQty || 8" size="sm"
              @update:model-value="emit('update:quantity', $event)"
            />
            <button v-else-if="item.type === 'hotel'" type="button" class="tcbody__remove" @click="emit('remove-hotel')">
              <q-icon name="delete_outline" size="16px" />Remove
            </button>
            <span v-if="item.unitPrice && item.qty > 1" class="tcbody__unit">{{ fmt(item.unitPrice) }} each</span>
          </div>
        </div>
        <div class="tcbody__amt">{{ fmt(item.amount) }}</div>
      </div>
    </div>

    <!-- The shelf, under the order and above the money — the Extras step, moved
         in here. Under the lines because it is an offer, not part of the trip
         yet; above the totals because the number it changes is the one directly
         below it. Rendered in the peek and on the cart screen alike, from this
         one component, so the two can't offer different extras at different
         prices. -->
    <CartAddOns
      :added="addedIds" :guests="guests" :vehicles="vehicles" :has-hotel="hasHotel"
      @add="emit('add-addon', $event)" @edit="emit('edit', $event)"
    />

    <dl class="tcbody__totals">
      <div><dt>Subtotal</dt><dd>{{ fmt(cart.subtotal) }}</dd></div>
      <!-- The credit is deducted here, not shown as a struck-through "was"
           price: taxes below are charged on the reduced amount, so a guest
           adding it up by hand arrives at the same total. -->
      <div v-if="cart.credit > 0" class="tcbody__credit"><dt>Bundle credit</dt><dd>−{{ fmt(cart.credit) }}</dd></div>
      <div><dt>Service fees</dt><dd>{{ fmt(cart.fees) }}</dd></div>
      <div><dt>Taxes</dt><dd>{{ fmt(cart.taxes) }}</dd></div>
      <div class="tcbody__grand"><dt>Total</dt><dd>{{ fmt(cart.total) }}</dd></div>
    </dl>
  </div>
</template>

<style scoped>
.tcbody { display: flex; flex-direction: column; gap: var(--ds-space-4); font-family: var(--ds-font-family); }

.tcbody__group { display: flex; flex-direction: column; gap: var(--ds-space-3); }
.tcbody__sechead {
  display: flex; align-items: baseline; justify-content: space-between; gap: var(--ds-space-3);
  font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold);
  letter-spacing: .04em; text-transform: uppercase; color: var(--ds-color-text-subtle);
  padding-top: var(--ds-space-3); border-top: 1px solid var(--ds-color-border);
}
.tcbody__edit {
  background: none; border: none; padding: 0; cursor: pointer; font: inherit; text-transform: none;
  letter-spacing: normal; color: var(--ds-color-link); text-decoration: underline;
}

.tcbody__item { display: flex; align-items: flex-start; gap: var(--ds-space-3); }
.tcbody__icon { color: var(--ds-color-icon-subtle); flex: none; margin-top: 2px; }
.tcbody__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.tcbody__label { font-weight: var(--ds-font-weight-medium); color: var(--ds-color-text); }
.tcbody__sub { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.tcbody__ctl { display: flex; align-items: center; gap: var(--ds-space-3); margin-top: 4px; flex-wrap: wrap; }
.tcbody__ctl:empty { display: none; margin-top: 0; }
.tcbody__qty { font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text-subtle); }
.tcbody__unit { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtlest); }
.tcbody__remove {
  display: inline-flex; align-items: center; gap: 3px; background: none; border: none; padding: 0;
  cursor: pointer; font: inherit; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle);
}
.tcbody__remove:hover { color: var(--ds-color-text-danger); }
.tcbody__amt { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); white-space: nowrap; }

.tcbody__totals { margin: 0; display: flex; flex-direction: column; gap: var(--ds-space-2); padding-top: var(--ds-space-3); border-top: 1px solid var(--ds-color-border); }
.tcbody__totals div { display: flex; justify-content: space-between; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.tcbody__totals dt, .tcbody__totals dd { margin: 0; }
.tcbody__credit dt, .tcbody__credit dd { color: var(--ds-color-text-success); font-weight: var(--ds-font-weight-bold); }
.tcbody__grand { padding-top: var(--ds-space-2); border-top: 1px solid var(--ds-color-border); }
.tcbody__grand dt, .tcbody__grand dd { font-size: var(--ds-font-size-md); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
</style>
