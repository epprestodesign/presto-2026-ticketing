<script setup>
// One switchable component of the package — a ticket level, a hotel, a room type,
// a transport option, an add-on.
//
// --- Why one component for five different lists -----------------------------
// The customize screen asks the same question five times: here is a thing you
// currently have, here are the alternatives, here is what each one does to the
// price. Five bespoke lists would have drifted apart in exactly the place it
// matters most — the delta — and a guest comparing a room upgrade against a
// ticket upgrade would be reading two differently-shaped answers to the same
// question. So the row is one component and the lists differ only in their data.
//
// The library has no equivalent. `TicketCategoryCard` is the closest, but it
// carries a quantity stepper (each tier is bought in some number) where this is a
// single choice, and `DsListItem` has no price column at all. Both would have had
// to be bent further than they bend.
//
// --- Why the delta is a PACKAGE delta ---------------------------------------
// `delta` is the change to what the guest PAYS — the bundle-discounted package
// total — not the change to the component's own price. Those differ by 12%, and
// the discounted one is the only figure that matches the number the row is sitting
// next to. A "+$60/night" room label beside a rail that moves by $211 would make
// the two look unrelated.
import { computed } from 'vue'

const props = defineProps({
  selected: { type: Boolean, default: false },
  // radio: one of the group. check: independent. Only the control differs — the
  // parent owns the mutual exclusion, because it owns the configuration.
  mode: { type: String, default: 'radio' },
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  // Small factual chips under the subtitle — sleeps 4 · 620 sq ft · City view.
  meta: { type: Array, default: () => [] },
  // The component's own price, already worded: "$359 per ticket".
  price: { type: String, default: '' },
  // Change to the package total if this row were selected. Null hides the column.
  delta: { type: Number, default: null },
  badge: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle'])

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(n || 0))

const deltaLabel = computed(() => {
  if (props.selected || props.delta === null) return null
  if (props.delta === 0) return 'Same price'
  return `${props.delta > 0 ? '+' : '−'}${money(props.delta)}`
})
const deltaClass = computed(() =>
  props.delta > 0 ? 'is-up' : props.delta < 0 ? 'is-down' : 'is-flat'
)
</script>

<template>
<button
  type="button" class="orow"
  :class="{ 'is-selected': selected, 'is-disabled': disabled }"
  :aria-pressed="mode === 'check' ? selected : undefined"
  :aria-checked="mode === 'radio' ? selected : undefined"
  :role="mode === 'radio' ? 'radio' : undefined"
  :disabled="disabled"
  @click="emit('toggle')"
>
  <span class="orow__mark" :class="`orow__mark--${mode}`" aria-hidden="true">
    <q-icon v-if="mode === 'check' && selected" name="check" size="15px" />
  </span>

  <span class="orow__body">
    <span class="orow__title">
      <q-icon v-if="icon" :name="icon" size="18px" />
      {{ title }}
      <span v-if="badge" class="orow__badge">{{ badge }}</span>
    </span>
    <small v-if="subtitle" class="orow__sub">{{ subtitle }}</small>
    <span v-if="meta.length" class="orow__meta">
      <span v-for="m in meta" :key="m">{{ m }}</span>
    </span>
  </span>

  <span class="orow__right">
    <span v-if="price" class="orow__price">{{ price }}</span>
    <!-- The selected row shows what it IS; the others show what switching costs.
         Printing a delta on the row you already hold would be a $0 that reads as
         "free", not as "you have this". -->
    <span v-if="selected" class="orow__current">In your package</span>
    <span v-else-if="deltaLabel" class="orow__delta" :class="deltaClass">{{ deltaLabel }}</span>
  </span>
</button>
</template>

<style scoped>
.orow { display: flex; align-items: flex-start; gap: 14px; width: 100%; padding: 14px 16px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md, 8px); background: var(--ds-color-surface, #fff); font: inherit; text-align: left; cursor: pointer; }
.orow + .orow { margin-top: 10px; }
.orow:hover:not(.is-disabled) { border-color: var(--ds-color-border-bold); }
.orow.is-selected { border-color: var(--ds-color-background-brand-bold, #01113E); box-shadow: 0 0 0 1px var(--ds-color-background-brand-bold, #01113E) inset; }
.orow.is-disabled { opacity: .5; cursor: not-allowed; }

/* The control is drawn rather than a real input: the whole row is the hit target,
   and a nested input inside a button is invalid markup. ARIA carries the state. */
.orow__mark { flex: none; width: 20px; height: 20px; margin-top: 2px; display: inline-flex; align-items: center; justify-content: center; border: 2px solid var(--ds-color-border-bold, #9aa0a6); background: var(--ds-color-surface, #fff); color: #fff; }
.orow__mark--radio { border-radius: 50%; }
.orow__mark--check { border-radius: 4px; }
.orow.is-selected .orow__mark { border-color: var(--ds-color-background-brand-bold, #01113E); background: var(--ds-color-background-brand-bold, #01113E); }
.orow.is-selected .orow__mark--radio::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #fff; }

.orow__body { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.orow__title { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 1rem; font-weight: 700; color: var(--ds-color-text); }
.orow__title .q-icon { color: var(--ds-color-text-subtle); }
.orow__badge { padding: 2px 8px; border-radius: var(--ds-radius-pill, 999px); background: var(--ds-color-background-success, #e6f4ec); color: var(--ds-color-text-success, #167a4a); font-size: .6875rem; font-weight: 800; letter-spacing: .03em; text-transform: uppercase; }
.orow__sub { font-size: .875rem; line-height: 1.35; color: var(--ds-color-text-subtle); }
.orow__meta { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-top: 2px; font-size: .75rem; color: var(--ds-color-text-subtlest, #6b7280); }
.orow__meta span { display: inline-flex; align-items: center; }
.orow__meta span + span::before { content: '·'; margin-right: 10px; }

.orow__right { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; text-align: right; }
.orow__price { font-size: .875rem; font-weight: 600; color: var(--ds-color-text); white-space: nowrap; }
.orow__current { font-size: .75rem; font-weight: 700; color: var(--ds-color-text-success, #167a4a); white-space: nowrap; }
.orow__delta { font-size: .875rem; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.orow__delta.is-up { color: var(--ds-color-text); }
.orow__delta.is-down { color: var(--ds-color-text-success, #167a4a); }
.orow__delta.is-flat { color: var(--ds-color-text-subtle); font-weight: 600; }

@media (max-width: 620px) {
  .orow { flex-wrap: wrap; }
  .orow__right { width: 100%; align-items: flex-start; text-align: left; padding-left: 34px; }
}
</style>
