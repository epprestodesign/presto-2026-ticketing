<script setup>
// JourneyStepper — a reusable, journey-agnostic progress bar. Drive it with a
// `steps` array + `current` index; it renders numbered steps with complete /
// current / upcoming states and connectors. Used by both the hotel-booking and
// ticketing+hotel-bundle journeys. Set `compact` (or let it fall back on
// narrow screens) for a "Step 2 of 5" summary with a progress bar.
import { computed } from 'vue'

const props = defineProps({
  steps: { type: Array, required: true },     // ['Tickets','Hotel',…] or [{label,id}]
  current: { type: Number, default: 0 },       // 0-based index of the active step
  compact: { type: Boolean, default: false },
  clickable: { type: Boolean, default: false }, // allow jumping to completed steps
})
const emit = defineEmits(['navigate'])

const items = computed(() =>
  props.steps.map((s, i) => ({
    label: typeof s === 'string' ? s : s.label,
    id: typeof s === 'string' ? i : (s.id ?? i),
    index: i,
    state: i < props.current ? 'complete' : i === props.current ? 'current' : 'upcoming',
  }))
)
const currentLabel = computed(() => items.value[props.current]?.label ?? '')
const pct = computed(() => (props.steps.length <= 1 ? 100 : (props.current / (props.steps.length - 1)) * 100))

function go(item) {
  if (props.clickable && item.state === 'complete') emit('navigate', item.index)
}
</script>

<template>
  <!-- Compact: "Step N of M" + progress bar -->
  <div v-if="compact" class="jstep-compact" role="group" aria-label="Progress">
    <div class="jstep-compact__row">
      <span class="jstep-compact__count">Step {{ current + 1 }} of {{ steps.length }}</span>
      <span class="jstep-compact__label">{{ currentLabel }}</span>
    </div>
    <div class="jstep-compact__track"><div class="jstep-compact__fill" :style="{ width: pct + '%' }" /></div>
  </div>

  <!-- Full: numbered horizontal stepper -->
  <ol v-else class="jstep" role="list" aria-label="Progress">
    <li
      v-for="(item, i) in items"
      :key="item.id"
      class="jstep__item"
      :class="[`is-${item.state}`, { 'is-clickable': clickable && item.state === 'complete' }]"
      :aria-current="item.state === 'current' ? 'step' : undefined"
    >
      <span v-if="i > 0" class="jstep__line" aria-hidden="true" />
      <button type="button" class="jstep__node" :disabled="!clickable || item.state !== 'complete'" @click="go(item)">
        <span class="jstep__marker">
          <svg v-if="item.state === 'complete'" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M13 4.5 6.5 11 3 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <template v-else>{{ i + 1 }}</template>
        </span>
        <span class="jstep__label">{{ item.label }}</span>
      </button>
    </li>
  </ol>
</template>

<style scoped>
.jstep { list-style: none; margin: 0; padding: 0; display: flex; font-family: var(--ds-font-family); }
.jstep__item { position: relative; flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 0; }
.jstep__line {
  position: absolute; top: 15px; right: 50%; width: 100%; height: 2px;
  background: var(--ds-color-border-bold);
}
.jstep__item.is-complete .jstep__line,
.jstep__item.is-current .jstep__line { background: var(--ds-color-background-brand-bold); }

.jstep__node {
  position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center;
  gap: 6px; background: none; border: none; padding: 0; cursor: default; font: inherit; color: inherit;
}
.jstep__item.is-clickable .jstep__node { cursor: pointer; }

.jstep__marker {
  width: 32px; height: 32px; border-radius: var(--ds-radius-pill);
  display: flex; align-items: center; justify-content: center;
  font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold);
  background: var(--ds-color-surface); border: 2px solid var(--ds-color-border-bold);
  color: var(--ds-color-text-subtle); transition: all var(--ds-duration-fast) var(--ds-ease-standard);
}
.jstep__item.is-complete .jstep__marker {
  background: var(--ds-color-background-brand-bold); border-color: var(--ds-color-background-brand-bold);
  color: var(--ds-color-text-inverse);
}
.jstep__item.is-current .jstep__marker {
  border-color: var(--ds-color-background-brand-bold); color: var(--ds-color-text-brand);
  box-shadow: 0 0 0 4px var(--ds-color-background-brand-subtlest);
}
.jstep__label {
  font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle);
  text-align: center; max-width: 12ch; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.jstep__item.is-current .jstep__label { color: var(--ds-color-text); font-weight: var(--ds-font-weight-bold); }
.jstep__item.is-complete .jstep__label { color: var(--ds-color-text); }

/* Auto-compact on narrow containers: hide labels, shrink markers. */
@media (max-width: 560px) {
  .jstep__label { display: none; }
  .jstep__marker { width: 26px; height: 26px; }
}

.jstep-compact { font-family: var(--ds-font-family); display: flex; flex-direction: column; gap: 8px; }
.jstep-compact__row { display: flex; align-items: baseline; gap: 8px; }
.jstep-compact__count { font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.jstep-compact__label { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.jstep-compact__track { height: 6px; border-radius: var(--ds-radius-pill); background: var(--ds-color-background-neutral); overflow: hidden; }
.jstep-compact__fill { height: 100%; border-radius: inherit; background: var(--ds-color-background-brand-bold); transition: width var(--ds-duration-base) var(--ds-ease-standard); }
</style>
