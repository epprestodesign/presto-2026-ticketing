<script setup>
// SeatMapSummary — the selection / checkout rail that pairs with SeatMap.vue.
// Shows the event, the chosen section + price, a quantity stepper, and an order
// total (prototype service fee applied). Emits `continue` to advance the flow.
import { computed } from 'vue'

const props = defineProps({
  event: { type: Object, required: true },
  selection: { type: Object, default: null },   // { section, tier } from SeatMap @select
  modelValue: { type: Number, default: 2 },      // quantity
  maxQuantity: { type: Number, default: 8 },
  feeRate: { type: Number, default: 0.18 },       // prototype service fee
})
const emit = defineEmits(['update:modelValue', 'continue'])

const currency = computed(() => props.selection?.section?.currency || 'USD')
const unit = computed(() => props.selection?.section?.price ?? 0)
const subtotal = computed(() => unit.value * props.modelValue)
const fees = computed(() => Math.round(subtotal.value * props.feeRate))
const total = computed(() => subtotal.value + fees.value)
const ready = computed(() => !!props.selection?.section?.available)

function setQty(n) {
  emit('update:modelValue', Math.min(props.maxQuantity, Math.max(1, n)))
}
function fmt(n, cur = currency.value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n)
}
function fmtDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
</script>

<template>
  <aside class="smsum">
    <header class="smsum__head">
      <h3 class="smsum__title">{{ event.name }}</h3>
      <p class="smsum__meta">
        <template v-if="event.venue?.name">{{ event.venue.name }}<template v-if="event.venue?.city?.name"> · {{ event.venue.city.name }}</template></template>
        <template v-if="fmtDate(event.date)"> · {{ fmtDate(event.date) }}</template>
      </p>
    </header>

    <div v-if="ready" class="smsum__pick">
      <span class="smsum__swatch" :style="{ background: `var(${selection.section.colorVar})` }" />
      <div>
        <div class="smsum__tier">{{ selection.tier?.name || selection.section.tierName }}</div>
        <div class="smsum__sec">Section {{ selection.section.label }}</div>
      </div>
      <div class="smsum__unit">{{ fmt(unit) }}<span>/ea</span></div>
    </div>
    <div v-else class="smsum__empty">
      <q-icon name="touch_app" size="20px" />
      <span>Select an available section on the map to continue.</span>
    </div>

    <div class="smsum__qty" :class="{ 'is-disabled': !ready }">
      <span>Tickets</span>
      <div class="smsum__stepper">
        <button type="button" aria-label="Decrease quantity" :disabled="!ready || modelValue <= 1" @click="setQty(modelValue - 1)">−</button>
        <span class="smsum__qtyval">{{ modelValue }}</span>
        <button type="button" aria-label="Increase quantity" :disabled="!ready || modelValue >= maxQuantity" @click="setQty(modelValue + 1)">+</button>
      </div>
    </div>

    <dl class="smsum__totals">
      <div><dt>Subtotal</dt><dd>{{ fmt(subtotal) }}</dd></div>
      <div><dt>Service fees</dt><dd>{{ fmt(fees) }}</dd></div>
      <div class="smsum__grand"><dt>Total</dt><dd>{{ fmt(total) }}</dd></div>
    </dl>

    <q-btn
      unelevated color="primary" no-caps class="smsum__cta"
      :disable="!ready"
      :label="ready ? `Continue · ${fmt(total)}` : 'Select a section'"
      @click="emit('continue')"
    />
    <p class="smsum__fine">Prototype pricing. Fees are illustrative.</p>
  </aside>
</template>

<style scoped>
.smsum {
  background: var(--ds-color-surface); border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-lg); padding: var(--ds-space-5);
  display: flex; flex-direction: column; gap: var(--ds-space-4);
  font-family: var(--ds-font-family);
}
.smsum__head { display: flex; flex-direction: column; gap: 4px; }
.smsum__title { margin: 0; font-size: var(--ds-font-size-lg); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.smsum__meta { margin: 0; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }

.smsum__pick {
  display: flex; align-items: center; gap: var(--ds-space-3);
  padding: var(--ds-space-3); border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-md); background: var(--ds-color-surface-sunken);
}
.smsum__swatch { width: 14px; height: 36px; border-radius: var(--ds-radius-sm); flex: none; }
.smsum__tier { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.smsum__sec { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.smsum__unit { margin-left: auto; font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.smsum__unit span { font-size: var(--ds-font-size-sm); font-weight: 400; color: var(--ds-color-text-subtle); margin-left: 2px; }

.smsum__empty {
  display: flex; align-items: center; gap: var(--ds-space-2);
  padding: var(--ds-space-3); border: 1px dashed var(--ds-color-border-bold);
  border-radius: var(--ds-radius-md); color: var(--ds-color-text-subtle);
  font-size: var(--ds-font-size-sm);
}

.smsum__qty { display: flex; align-items: center; justify-content: space-between; color: var(--ds-color-text); }
.smsum__qty.is-disabled { opacity: 0.5; }
.smsum__stepper { display: flex; align-items: center; gap: var(--ds-space-3); }
.smsum__stepper button {
  width: 32px; height: 32px; border-radius: var(--ds-radius-button);
  border: 1px solid var(--ds-color-border-bold); background: var(--ds-color-surface);
  color: var(--ds-color-text); font-size: 18px; line-height: 1; cursor: pointer;
}
.smsum__stepper button:disabled { opacity: 0.4; cursor: not-allowed; }
.smsum__qtyval { min-width: 20px; text-align: center; font-weight: var(--ds-font-weight-bold); }

.smsum__totals { margin: 0; display: flex; flex-direction: column; gap: var(--ds-space-2); }
.smsum__totals div { display: flex; justify-content: space-between; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.smsum__totals dt, .smsum__totals dd { margin: 0; }
.smsum__grand { padding-top: var(--ds-space-2); border-top: 1px solid var(--ds-color-border); }
.smsum__grand dt, .smsum__grand dd { font-size: var(--ds-font-size-md); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }

.smsum__cta { border-radius: var(--ds-radius-button); font-weight: var(--ds-font-weight-bold); }
.smsum__fine { margin: 0; text-align: center; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtlest); }
</style>
