<script setup>
// SearchRadiusField — title + slider (0–25) + read-only "Any / miles" input +
// apply button. `v-model` is the radius number.
import { computed } from 'vue'

const props = defineProps({ modelValue: { type: Number, default: 0 } })
const emit = defineEmits(['update:modelValue'])

const radius = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
const radiusLabel = computed(() => (radius.value ? radius.value : ''))
</script>

<template>
  <div>
    <h3 class="fr__title">Search Radius</h3>
    <q-slider v-model="radius" :min="0" :max="25" :step="0.25" color="primary" class="fr__slider" />
    <div class="fr__radius-row">
      <q-input v-model="radiusLabel" outlined dense readonly placeholder="Any" class="fr__radius-input" />
      <span class="fr__radius-unit">miles</span>
    </div>
    <button type="button" class="fr__apply">Apply Radius Filter</button>
  </div>
</template>

<style scoped>
.fr__title {
  margin: 0 0 2px;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  color: var(--ds-color-text-brand);
}

/* Apply / clear buttons */
.fr__apply {
  width: 100%; height: 44px; margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;
  border: 0; border-radius: var(--ds-radius-button); cursor: pointer;
  background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; font-size: 0.9375rem;
}
.fr__apply:hover { background: var(--ds-palette-navy-800, #0a1f4d); }

/* Radius */
.fr__slider { margin: 4px 4px 12px; }
.fr__radius-row { display: flex; align-items: center; gap: 8px; }
.fr__radius-input { flex: 1; }
.fr__radius-unit { color: var(--ds-color-text-subtle); font-size: 0.9375rem; }
</style>
