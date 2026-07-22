<script setup>
// AppStepper — the App Shell progress bar that sits flush under the global nav /
// hero banner: a full-width row of underline-style step tabs (Stays · Event
// Tickets · Event Packages · Review). The top edge is a continuous progress
// line whose fill slides to the current step (animated) — so the bar reads as
// both a wayfinder and a progress indicator. Drive it with a `steps` array + a
// 0-based `current`; completed steps are clickable and emit `navigate` (set
// `allow-ahead` to let any step be clicked, e.g. for a preview/demo). Distinct
// from the numbered JourneyStepper (a compact dot stepper); this is the
// top-of-page journey nav.
import { computed } from 'vue'

const props = defineProps({
  // ['Stays','Event Tickets',…] or [{ label, id }]
  steps: { type: Array, default: () => ['Stays', 'Event Tickets', 'Event Packages', 'Review'] },
  current: { type: Number, default: 0 },        // 0-based index of the active step
  clickable: { type: Boolean, default: true },   // allow jumping back to completed steps
  allowAhead: { type: Boolean, default: false }, // allow clicking ANY step (preview/demo)
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

// Continuous fill covering the completed + current segments; slides (animated)
// whenever `current` changes.
const fillPct = computed(() => {
  const n = props.steps.length || 1
  const filled = Math.max(0, Math.min(n, props.current + 1))
  return `${(filled / n) * 100}%`
})

function canClick(item) {
  return props.clickable && (item.state === 'complete' || props.allowAhead)
}
function go(item) {
  if (canClick(item)) emit('navigate', item.index)
}
</script>

<template>
  <nav class="astep" aria-label="Booking progress">
    <!-- Continuous animated progress line along the top edge. -->
    <div class="astep__progress" aria-hidden="true">
      <div class="astep__fill" :style="{ width: fillPct }" />
    </div>

    <ol class="astep__list" role="list">
      <li
        v-for="item in items"
        :key="item.id"
        class="astep__item"
        :class="[`is-${item.state}`, { 'is-clickable': canClick(item) }]"
      >
        <button
          type="button"
          class="astep__tab"
          :disabled="!canClick(item)"
          :aria-current="item.state === 'current' ? 'step' : undefined"
          @click="go(item)"
        >
          <span class="astep__label">{{ item.label }}</span>
        </button>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.astep { position: relative; background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-border); font-family: var(--ds-font-family); }

/* Progress line: a neutral full-width track with a brand fill that animates its
   width as the current step changes. */
.astep__progress { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--ds-color-border); z-index: 1; }
.astep__fill { height: 100%; width: 0; background: var(--ds-palette-blue-600); transition: width 420ms var(--ds-ease-standard, cubic-bezier(0.4, 0, 0.2, 1)); }

.astep__list { list-style: none; margin: 0; padding: 0; display: flex; }
.astep__item { position: relative; flex: 1 1 0; min-width: 0; }

.astep__tab {
  width: 100%; height: 56px; padding: 0 12px; background: none; border: 0;
  font: inherit; cursor: default; display: flex; align-items: center; justify-content: center;
  color: var(--ds-color-text-brand); transition: color var(--ds-duration-fast) var(--ds-ease-standard);
}
.astep__item.is-clickable .astep__tab { cursor: pointer; }

.astep__label {
  font-size: var(--ds-font-size-md); font-weight: var(--ds-font-weight-medium);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center;
}
.astep__item.is-complete .astep__tab { color: var(--ds-color-text); }
.astep__item.is-clickable .astep__tab:hover .astep__label { text-decoration: underline; }
.astep__item.is-current .astep__tab { color: var(--ds-color-text); }
.astep__item.is-current .astep__label { font-weight: var(--ds-font-weight-bold); }

/* Respect reduced-motion — no sliding fill. */
@media (prefers-reduced-motion: reduce) {
  .astep__fill { transition: none; }
}

@media (max-width: 560px) {
  .astep__tab { height: 48px; padding: 0 6px; }
  .astep__label { font-size: var(--ds-font-size-sm); }
}
</style>
