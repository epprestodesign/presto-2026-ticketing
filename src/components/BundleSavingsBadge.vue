<script setup>
// BundleSavingsBadge — "Save $X vs. booking separately" (scope PK-04). Shown on
// package cards and in the bundle cart to make the discount legible.
import { computed } from 'vue'

const props = defineProps({
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  label: { type: String, default: 'Bundle & save' }, // leading text
  size: { type: String, default: 'md' },              // sm | md
})
const formatted = computed(() =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: props.currency, maximumFractionDigits: 0 }).format(props.amount)
)
</script>

<template>
  <span v-if="amount > 0" class="savings" :class="`savings--${size}`">
    <q-icon name="savings" size="14px" />{{ label }} {{ formatted }}
  </span>
</template>

<style scoped>
.savings {
  display: inline-flex; align-items: center; gap: 5px; font-family: var(--ds-font-family);
  font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text-success);
  background: var(--ds-color-background-success); border-radius: var(--ds-radius-pill);
  padding: 2px 10px;
}
.savings--md { font-size: var(--ds-font-size-sm); }
.savings--sm { font-size: 11px; padding: 1px 8px; }
</style>
