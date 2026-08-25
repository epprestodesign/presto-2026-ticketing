<script setup>
// The one cart — tickets, the stay, and every extra as its own editable line.
//
// This replaces the library's BundleCart in this fork, and the reason is
// editing. BundleCart is a read-only summary: it maps cart.items to
// icon/label/amount rows and emits nothing but `checkout`. That is right for a
// two-line ticket+hotel order, where the only way to change anything is to walk
// back a step. With extras there can be six lines, four of which a guest is
// likely to change their mind about at exactly this screen — and "go back two
// steps to drop the parking" is how a trip gets abandoned instead of trimmed.
//
// The library's CartReview in `ticketing` mode was the other candidate, and it
// is closer: sections, expandable hotel detail, an editable ticket quantity.
// It stops short in two ways that matter here. Its `editableQty` covers ticket
// and package lines only, so an extra renders as a fixed row with no stepper
// and no way to remove it; and it owns its quantities in local state, emitting
// only `update:count`/`update:total` — so the extras step and the cart would
// each hold a private idea of how many tickets there are, and the per-guest
// extras (which scale off that number) would follow whichever one you edited
// last. This cart owns nothing: every control emits, and App.vue's state is the
// only copy of the trip.
//
// What it does keep from the library: QuantityStepper for both editable
// quantities, and BundleSavingsBadge for the credit.
import { computed } from 'vue'
import QuantityStepper from '@lib/components/QuantityStepper.vue'
import BundleSavingsBadge from '@lib/components/BundleSavingsBadge.vue'

const props = defineProps({
  cart: { type: Object, required: true },   // buildTripCart() result
  vehicles: { type: Number, default: 1 },
})
const emit = defineEmits(['checkout', 'edit', 'update:quantity', 'update:vehicles', 'remove-addon', 'remove-hotel'])

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
  { id: 'experience', title: 'Gameday extras', step: 'extras', editLabel: 'Edit extras' },
]

const groups = computed(() =>
  SECTIONS
    .map((s) => ({ ...s, items: props.cart.items.filter((i) => i.type === s.id) }))
    .filter((s) => s.items.length)
)

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
  <aside class="tcart">
    <h3 class="tcart__title">Your trip</h3>

    <div v-for="g in groups" :key="g.id" class="tcart__group">
      <div class="tcart__sechead">
        <span>{{ g.title }}</span>
        <button type="button" class="tcart__edit" @click="emit('edit', g.step)">{{ g.editLabel }}</button>
      </div>

      <div v-for="(item, i) in g.items" :key="i" class="tcart__item">
        <q-icon :name="iconFor(item)" size="20px" class="tcart__icon" />
        <div class="tcart__info">
          <div class="tcart__label">{{ item.label }}</div>
          <div v-if="item.sublabel" class="tcart__sub">{{ item.sublabel }}</div>

          <!-- The one control per line, and only where a number is genuinely
               the guest's to set. Per-guest extras have no stepper on purpose:
               their quantity is the ticket count, so the ticket stepper above
               is the control that moves them. -->
          <div class="tcart__ctl">
            <QuantityStepper
              v-if="item.type === 'ticket'"
              :model-value="item.qty" :min="1" :max="item.maxQty || 8" size="sm"
              @update:model-value="emit('update:quantity', $event)"
            />
            <QuantityStepper
              v-else-if="item.unit === 'vehicle'"
              :model-value="vehicles" :min="1" :max="4" size="sm" removable
              @update:model-value="setVehicles"
              @remove="emit('remove-addon', item.addOnId)"
            />
            <button v-else-if="item.type === 'experience'" type="button" class="tcart__remove" @click="emit('remove-addon', item.addOnId)">
              <q-icon name="delete_outline" size="16px" />Remove
            </button>
            <button v-else-if="item.type === 'hotel'" type="button" class="tcart__remove" @click="emit('remove-hotel')">
              <q-icon name="delete_outline" size="16px" />Remove
            </button>
            <span v-if="item.unitPrice && item.qty > 1" class="tcart__unit">{{ fmt(item.unitPrice) }} each</span>
          </div>
        </div>
        <div class="tcart__amt">{{ fmt(item.amount) }}</div>
      </div>
    </div>

    <dl class="tcart__totals">
      <div><dt>Subtotal</dt><dd>{{ fmt(cart.subtotal) }}</dd></div>
      <!-- The credit is deducted here, not shown as a struck-through "was"
           price: taxes below are charged on the reduced amount, so a guest
           adding it up by hand arrives at the same total. -->
      <div v-if="cart.credit > 0" class="tcart__credit"><dt>Bundle credit</dt><dd>−{{ fmt(cart.credit) }}</dd></div>
      <div><dt>Service fees</dt><dd>{{ fmt(cart.fees) }}</dd></div>
      <div><dt>Taxes</dt><dd>{{ fmt(cart.taxes) }}</dd></div>
      <div class="tcart__grand"><dt>Total</dt><dd>{{ fmt(cart.total) }}</dd></div>
    </dl>

    <div v-if="cart.credit > 0" class="tcart__savings">
      <BundleSavingsBadge :amount="cart.credit" label="Bundled &amp; saved" size="sm" />
    </div>

    <button type="button" class="tcart__cta" @click="emit('checkout')">Checkout · {{ fmt(cart.total) }}</button>
    <p class="tcart__note"><q-icon name="lock" size="12px" /> One secure charge — tickets, stay and extras together</p>
  </aside>
</template>

<style scoped>
.tcart {
  font-family: var(--ds-font-family); background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg);
  padding: var(--ds-space-5); display: flex; flex-direction: column; gap: var(--ds-space-4);
}
.tcart__title { margin: 0; font-size: var(--ds-font-size-lg); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }

.tcart__group { display: flex; flex-direction: column; gap: var(--ds-space-3); }
.tcart__sechead {
  display: flex; align-items: baseline; justify-content: space-between; gap: var(--ds-space-3);
  font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold);
  letter-spacing: .04em; text-transform: uppercase; color: var(--ds-color-text-subtle);
  padding-top: var(--ds-space-3); border-top: 1px solid var(--ds-color-border);
}
.tcart__edit {
  background: none; border: none; padding: 0; cursor: pointer; font: inherit; text-transform: none;
  letter-spacing: normal; color: var(--ds-color-link); text-decoration: underline;
}

.tcart__item { display: flex; align-items: flex-start; gap: var(--ds-space-3); }
.tcart__icon { color: var(--ds-color-icon-subtle); flex: none; margin-top: 2px; }
.tcart__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.tcart__label { font-weight: var(--ds-font-weight-medium); color: var(--ds-color-text); }
.tcart__sub { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.tcart__ctl { display: flex; align-items: center; gap: var(--ds-space-3); margin-top: 4px; flex-wrap: wrap; }
.tcart__unit { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtlest); }
.tcart__remove {
  display: inline-flex; align-items: center; gap: 3px; background: none; border: none; padding: 0;
  cursor: pointer; font: inherit; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle);
}
.tcart__remove:hover { color: var(--ds-color-text-danger); }
.tcart__amt { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); white-space: nowrap; }

.tcart__totals { margin: 0; display: flex; flex-direction: column; gap: var(--ds-space-2); padding-top: var(--ds-space-3); border-top: 1px solid var(--ds-color-border); }
.tcart__totals div { display: flex; justify-content: space-between; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.tcart__totals dt, .tcart__totals dd { margin: 0; }
.tcart__credit dt, .tcart__credit dd { color: var(--ds-color-text-success); font-weight: var(--ds-font-weight-bold); }
.tcart__grand { padding-top: var(--ds-space-2); border-top: 1px solid var(--ds-color-border); }
.tcart__grand dt, .tcart__grand dd { font-size: var(--ds-font-size-md); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.tcart__savings { display: flex; }

.tcart__cta {
  cursor: pointer; border: none; font: inherit; font-weight: var(--ds-font-weight-bold);
  background: var(--ds-color-background-brand-bold); color: var(--ds-color-text-inverse);
  padding: 12px; border-radius: var(--ds-radius-button);
}
.tcart__note { margin: 0; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
</style>
