<script setup>
// TicketCategoryCard — one selectable ticket tier row (scope T-02/T-03/T-04).
// Shows a tier color swatch, name + description, price, an AvailabilityBadge
// (driven by remaining count), and a quantity stepper (− {qty} +). When the
// tier is sold out (category.soldOut or count ≤ 0) the row is greyed out, the
// stepper is disabled, and a plain "Sold out" label replaces it — not selectable.
import { computed } from 'vue'
import AvailabilityBadge from './AvailabilityBadge.vue'

const props = defineProps({
  category: { type: Object, required: true }, // a deriveTiers() tier + { count, soldOut? }
  modelValue: { type: Number, default: 0 },   // selected quantity
  max: { type: Number, default: 8 },
})
const emit = defineEmits(['update:modelValue'])

const count = computed(() => props.category.count ?? 0)
const soldOut = computed(() => props.category.soldOut === true || count.value <= 0)
const currency = computed(() => props.category.currency || 'USD')
const cap = computed(() => Math.min(props.max, Math.max(0, count.value)))

function setQty(n) {
  if (soldOut.value) return
  emit('update:modelValue', Math.min(cap.value, Math.max(0, n)))
}
function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.value, maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <div class="tcc" :class="{ 'is-sold': soldOut }">
    <div class="tcc__main">
      <span class="tcc__swatch" :style="{ background: `var(${category.colorVar})` }" />
      <div class="tcc__info">
        <div class="tcc__name">{{ category.name }}</div>
        <div v-if="category.desc" class="tcc__desc">{{ category.desc }}</div>
      </div>
    </div>

    <div class="tcc__side">
      <div class="tcc__price">{{ fmt(category.price) }}<span>/ea</span></div>
      <AvailabilityBadge :count="count" />
      <div v-if="soldOut" class="tcc__soldtag">Sold out</div>
      <div v-else class="tcc__stepper">
        <button type="button" aria-label="Decrease quantity" :disabled="modelValue <= 0" @click="setQty(modelValue - 1)">−</button>
        <span class="tcc__qty">{{ modelValue }}</span>
        <button type="button" aria-label="Increase quantity" :disabled="modelValue >= cap" @click="setQty(modelValue + 1)">+</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tcc {
  display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-4);
  font-family: var(--ds-font-family); background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg);
  padding: var(--ds-space-4);
}
.tcc.is-sold { opacity: 0.6; }

.tcc__main { display: flex; align-items: flex-start; gap: var(--ds-space-3); min-width: 0; }
.tcc__swatch { width: 14px; height: 36px; border-radius: var(--ds-radius-sm); flex: none; margin-top: 2px; }
.tcc__info { min-width: 0; }
.tcc__name { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); font-size: var(--ds-font-size-md); }
.tcc__desc { margin-top: 2px; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }

.tcc__side { display: flex; flex-direction: column; align-items: flex-end; gap: var(--ds-space-2); flex: none; }
.tcc__price { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.tcc__price span { font-size: var(--ds-font-size-sm); font-weight: 400; color: var(--ds-color-text-subtle); margin-left: 2px; }

.tcc__soldtag { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); font-weight: var(--ds-font-weight-medium); }

.tcc__stepper { display: flex; align-items: center; gap: var(--ds-space-3); }
.tcc__stepper button {
  width: 32px; height: 32px; border-radius: var(--ds-radius-button);
  border: 1px solid var(--ds-color-border-bold); background: var(--ds-color-surface);
  color: var(--ds-color-text); font-size: 18px; line-height: 1; cursor: pointer;
}
.tcc__stepper button:disabled { opacity: 0.4; cursor: not-allowed; }
.tcc__qty { min-width: 20px; text-align: center; font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
</style>
