<script setup>
// BundleCart — the unified cart (scope 3.5): all selected components (tickets +
// hotel, if added) shown as itemized line items with one transparent total
// (subtotal, service fees, taxes). One charge, EP as merchant of record.
import { computed } from 'vue'
import BundleSavingsBadge from './BundleSavingsBadge.vue'

const props = defineProps({
  cart: { type: Object, required: true },       // buildBundleCart() result
  savings: { type: Number, default: 0 },         // optional bundle savings
})
const emit = defineEmits(['checkout'])

const ICON = { ticket: 'confirmation_number', hotel: 'hotel' }
function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: props.cart.currency || 'USD', maximumFractionDigits: 0 }).format(n) }
</script>

<template>
  <aside class="bcart">
    <h3 class="bcart__title">Your order</h3>

    <ul class="bcart__items">
      <li v-for="(item, i) in cart.items" :key="i" class="bcart__item">
        <q-icon :name="ICON[item.type] || 'shopping_bag'" size="20px" class="bcart__icon" />
        <div class="bcart__info">
          <div class="bcart__label">{{ item.label }}</div>
          <div v-if="item.sublabel" class="bcart__sub">{{ item.sublabel }}</div>
        </div>
        <div class="bcart__amt">{{ fmt(item.amount) }}</div>
      </li>
    </ul>

    <div v-if="savings > 0" class="bcart__savings">
      <BundleSavingsBadge :amount="savings" size="sm" />
    </div>

    <dl class="bcart__totals">
      <div><dt>Subtotal</dt><dd>{{ fmt(cart.subtotal) }}</dd></div>
      <div><dt>Service fees</dt><dd>{{ fmt(cart.fees) }}</dd></div>
      <div><dt>Taxes</dt><dd>{{ fmt(cart.taxes) }}</dd></div>
      <div class="bcart__grand"><dt>Total</dt><dd>{{ fmt(cart.total) }}</dd></div>
    </dl>

    <button type="button" class="bcart__cta" @click="emit('checkout')">Checkout · {{ fmt(cart.total) }}</button>
    <p class="bcart__note"><q-icon name="lock" size="12px" /> One secure charge · taxes &amp; fees shown above</p>
  </aside>
</template>

<style scoped>
.bcart {
  font-family: var(--ds-font-family); background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg);
  padding: var(--ds-space-5); display: flex; flex-direction: column; gap: var(--ds-space-4);
}
.bcart__title { margin: 0; font-size: var(--ds-font-size-lg); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.bcart__items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--ds-space-3); }
.bcart__item { display: flex; align-items: center; gap: var(--ds-space-3); }
.bcart__icon { color: var(--ds-color-icon-subtle); flex: none; }
.bcart__info { flex: 1; min-width: 0; }
.bcart__label { font-weight: var(--ds-font-weight-medium); color: var(--ds-color-text); }
.bcart__sub { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.bcart__amt { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); white-space: nowrap; }
.bcart__savings { display: flex; }

.bcart__totals { margin: 0; display: flex; flex-direction: column; gap: var(--ds-space-2); padding-top: var(--ds-space-3); border-top: 1px solid var(--ds-color-border); }
.bcart__totals div { display: flex; justify-content: space-between; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.bcart__totals dt, .bcart__totals dd { margin: 0; }
.bcart__grand { padding-top: var(--ds-space-2); border-top: 1px solid var(--ds-color-border); }
.bcart__grand dt, .bcart__grand dd { font-size: var(--ds-font-size-md); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }

.bcart__cta {
  cursor: pointer; border: none; font: inherit; font-weight: var(--ds-font-weight-bold);
  background: var(--ds-color-background-brand-bold); color: var(--ds-color-text-inverse);
  padding: 12px; border-radius: var(--ds-radius-button);
}
.bcart__note { margin: 0; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
</style>
