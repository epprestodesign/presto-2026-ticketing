<script setup>
// Checkout step 3 — Add a payment method. Inline Payment Method form (card +
// billing information). Credit card only; no dialogs.
import PaymentForm from '../PaymentForm.vue'

defineProps({
  modelValue: { type: Object, default: () => ({}) },
  // Hold reassurance line shown above the card fields.
  reassurance: { type: String, default: '$0.00 due now. Payment information is only needed to hold your reservation.' },
})
const emit = defineEmits(['update:modelValue', 'next'])
</script>

<template>
  <div class="step">
    <payment-form :model-value="modelValue" :reassurance="reassurance" @update:model-value="emit('update:modelValue', $event)" />
    <q-btn unelevated no-caps class="step__next" label="Next" @click="emit('next')" />
  </div>
</template>

<style scoped>
.step__next { margin-top: 20px; height: 48px; padding: 0 28px; border-radius: var(--ds-radius-md); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 600; }
</style>
