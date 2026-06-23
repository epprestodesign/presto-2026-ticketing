<script setup>
// SavedFlyout — the right-side slide-over that brings in "Saved Hotels" when a
// hotel is bookmarked. The slide-over chrome (scrim, sliding panel, close, ESC,
// scroll-lock) is provided by DsSidePanel; this only supplies the recyclable
// <SavedItems> body and bubbles its `remove` so the parent owns the saved list.
import SavedItems from './SavedItems.vue'
import DsSidePanel from '../DsSidePanel.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Saved Hotels' },
  items: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'remove'])
</script>

<template>
  <ds-side-panel
    :model-value="modelValue"
    aria-label="Saved hotels"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <saved-items :title="title" :items="items" @remove="emit('remove', $event)" />
  </ds-side-panel>
</template>

<style scoped>
:deep(.sv) { max-width: 100%; }
</style>
