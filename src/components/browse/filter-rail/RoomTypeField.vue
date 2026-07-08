<script setup>
// RoomTypeField — title + room-type checkboxes + apply button.
// `v-model` is an array of selected room-type labels.
import { computed } from 'vue'

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

const roomSel = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const ROOM_TYPES = ['King', 'Double', 'Queen', 'Suite']
</script>

<template>
  <div>
    <h3 class="fr__title">Room Type</h3>
    <q-checkbox v-for="r in ROOM_TYPES" :key="r" v-model="roomSel" :val="r" :label="r" color="primary" dense class="fr__check" />
    <button type="button" class="fr__apply">Apply Room Type Filters</button>
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

/* Checkboxes */
.fr__check { display: flex; margin: 2px 0; }

/* Apply / clear buttons */
.fr__apply {
  width: 100%; height: 44px; margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;
  border: 0; border-radius: var(--ds-radius-button); cursor: pointer;
  background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; font-size: 0.9375rem;
}
.fr__apply:hover { background: var(--ds-palette-navy-800, #0a1f4d); }
</style>
