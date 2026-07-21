<script setup>
// TicketFilters — the all-inclusive filters dialog for the Ticket Map experience:
// every mechanism a guest would use to narrow ticket offerings for this venue —
// number of tickets (native select, up to 6), price (histogram + range, incl.
// fees), section areas, seating levels, seat perks, and delivery. Reuses the
// PriceHistogram primitive and the browse filter conventions. Emits `apply` with
// the selected filter state and `clear`; the live match count drives the CTA.
import { ref, computed } from 'vue'
import PriceHistogram from './PriceHistogram.vue'
import { priceDistribution } from '../lib/seatListings.js'

const props = defineProps({
  listings: { type: Array, default: () => [] },
  currency: { type: String, default: 'USD' },
  maxQuantity: { type: Number, default: 6 },
})
const emit = defineEmits(['close', 'apply', 'clear'])

const dist = priceDistribution(props.listings)

// The actual sections the tickets fall into, grouped under their seating-level
// header (Lower / Club / Mezzanine / Upper) so a guest can pick real sections.
const LEVEL_ORDER = ['Lower Level', 'Club Level', 'Mezzanine', 'Upper Level', 'Floor / GA']
const sectionGroups = computed(() => {
  const byTier = new Map()
  for (const l of props.listings) {
    const key = l.tierName || 'Other'
    if (!byTier.has(key)) byTier.set(key, new Set())
    byTier.get(key).add(l.section)
  }
  return [...byTier.entries()]
    .map(([tier, set]) => ({ tier, sections: [...set].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })) }))
    .sort((a, b) => (LEVEL_ORDER.indexOf(a.tier) + 1 || 99) - (LEVEL_ORDER.indexOf(b.tier) + 1 || 99))
})

const quantity = ref(2)
const price = ref({ min: dist.min, max: dist.max })
const sections = ref([])

const money = (n) => '$' + Math.round(n ?? 0).toLocaleString('en-US')
const qtyOptions = computed(() => Array.from({ length: props.maxQuantity }, (_, i) => i + 1))

// Live match count reflects the price range + any chosen sections.
const matchCount = computed(() =>
  props.listings.filter((l) =>
    l.priceWithFees >= price.value.min && l.priceWithFees <= price.value.max &&
    (!sections.value.length || sections.value.includes(l.section)),
  ).length,
)

const clearAll = () => {
  quantity.value = 2
  price.value = { min: dist.min, max: dist.max }
  sections.value = []
  emit('clear')
}
const apply = () => emit('apply', {
  quantity: quantity.value, price: { ...price.value }, sections: sections.value,
})
</script>

<template>
  <div class="tf">
    <header class="tf__bar">
      <h2 class="tf__title">Filters</h2>
      <button class="tf__close" aria-label="Close" @click="emit('close')"><q-icon name="close" size="22px" /></button>
    </header>

    <div class="tf__body">
      <!-- Number of tickets -->
      <section class="tf__sec">
        <h3 class="tf__h">Number of tickets</h3>
        <p class="tf__sub">Find seats together for your group — up to {{ maxQuantity }}.</p>
        <div class="tf__selectwrap">
          <select v-model.number="quantity">
            <option v-for="n in qtyOptions" :key="n" :value="n">{{ n }} ticket{{ n === 1 ? '' : 's' }}</option>
          </select>
          <q-icon name="expand_more" size="20px" />
        </div>
      </section>

      <!-- Price (incl. fees) with histogram -->
      <section class="tf__sec">
        <div class="tf__hrow"><h3 class="tf__h">Price</h3><span class="tf__incl">Incl. fees</span></div>
        <PriceHistogram :bins="dist.bins" :min="dist.min" :max="dist.max" :selected-min="price.min" :selected-max="price.max" :currency="currency" />
        <q-range v-model="price" :min="dist.min" :max="dist.max" :step="5" color="primary" class="tf__range" />
        <div class="tf__rangevals"><span>{{ money(price.min) }}</span><span>{{ money(price.max) }}{{ price.max >= dist.max ? '+' : '' }}</span></div>
      </section>

      <!-- Sections — the real sections available, under their level header -->
      <section class="tf__sec">
        <h3 class="tf__h">Sections</h3>
        <p class="tf__sub">The sections these tickets fall into, grouped by seating level.</p>
        <div v-for="g in sectionGroups" :key="g.tier" class="tf__group">
          <div class="tf__grouphead">{{ g.tier }}</div>
          <div class="tf__checks tf__checks--sections">
            <q-checkbox v-for="s in g.sections" :key="s" v-model="sections" :val="s" :label="`Sec ${s}`" dense color="primary" />
          </div>
        </div>
      </section>
    </div>

    <footer class="tf__foot">
      <button class="tf__clear" @click="clearAll">Clear all</button>
      <q-btn unelevated no-caps class="tf__apply" :label="`View ${matchCount} listing${matchCount === 1 ? '' : 's'}`" @click="apply" />
    </footer>
  </div>
</template>

<style scoped>
.tf { display: flex; flex-direction: column; width: 100%; max-width: 520px; max-height: 86vh; background: var(--ds-color-surface); border-radius: var(--ds-radius-lg); overflow: hidden; box-shadow: var(--ds-shadow-4); font-family: var(--ds-font-family); }
.tf__bar { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--ds-color-border); flex: none; }
.tf__title { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--ds-color-text); }
.tf__close { width: 36px; height: 36px; border: 0; border-radius: 50%; background: var(--ds-palette-slate-100); color: var(--ds-color-text); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.tf__close:hover { background: var(--ds-palette-slate-200); }

.tf__body { flex: 1; min-height: 0; overflow-y: auto; padding: 4px 20px 8px; }
.tf__sec { padding: 18px 0; border-bottom: 1px solid var(--ds-color-border); }
.tf__sec:last-child { border-bottom: 0; }
.tf__h { margin: 0; font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-text); }
.tf__sub { margin: 4px 0 12px; font-size: 0.875rem; color: var(--ds-color-text-subtle); }
.tf__hrow { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.tf__incl { font-size: 0.8125rem; color: var(--ds-color-text-subtle); }

.tf__selectwrap { position: relative; display: flex; align-items: center; }
.tf__selectwrap select { width: 100%; appearance: none; font: inherit; font-size: 0.9375rem; color: var(--ds-color-text); background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); padding: 11px 40px 11px 14px; cursor: pointer; }
.tf__selectwrap select:focus { outline: none; border-color: var(--ds-color-border-brand); }
.tf__selectwrap .q-icon { position: absolute; right: 12px; color: var(--ds-color-text-subtle); pointer-events: none; }

.tf__range { margin-top: 4px; }
.tf__rangevals { display: flex; justify-content: space-between; font-weight: 700; font-size: 0.9375rem; color: var(--ds-color-text); }

.tf__checks { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 12px; }
.tf__checks--sections { grid-template-columns: repeat(3, 1fr); }
.tf__group + .tf__group { margin-top: 12px; }
.tf__grouphead { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ds-color-text-subtle); margin: 8px 0 4px; }

.tf__toggle { display: inline-flex; align-items: center; gap: 8px; font-size: 0.9375rem; color: var(--ds-color-text); cursor: pointer; }
.tf__toggle .q-icon { color: var(--ds-color-text-brand); }

.tf__foot { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 20px; border-top: 1px solid var(--ds-color-border); }
.tf__clear { background: none; border: 0; padding: 0; font: inherit; font-weight: 700; color: var(--ds-color-text); text-decoration: underline; cursor: pointer; }
.tf__apply { height: 46px; padding: 0 24px; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; }

@media (max-width: 560px) { .tf__checks { grid-template-columns: 1fr; } }
</style>
