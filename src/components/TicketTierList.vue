<script setup>
// TicketTierList — the ticket-type picker for an event (scope T-02/T-03/T-04).
// Derives the event's price tiers, assigns each a deterministic remaining
// `count` (some plentiful, some limited, one sold out) so every availability
// state is visible, and renders a TicketCategoryCard per tier. Per-tier
// quantities are tracked in a reactive map; the footer shows a running subtotal
// and a Continue button that stays disabled until at least one ticket is chosen.
import { reactive, computed } from 'vue'
import TicketCategoryCard from './TicketCategoryCard.vue'
import { deriveTiers } from '../lib/seatmap.js'

const props = defineProps({
  event: { type: Object, required: true },
  max: { type: Number, default: 8 },
})
const emit = defineEmits(['continue'])

// Deterministic remaining counts so states are always visible in the prototype:
// plentiful, plentiful, limited, then a sold-out tier.
const COUNTS = [48, 26, 6, 0]

const categories = computed(() =>
  deriveTiers(props.event).map((tier, i) => {
    const count = COUNTS[i % COUNTS.length]
    return { ...tier, count, soldOut: count <= 0 }
  }),
)

const qty = reactive({})
function getQty(id) { return qty[id] ?? 0 }
function setQty(id, n) { qty[id] = n }

const currency = computed(() => categories.value[0]?.currency || 'USD')
const totalQty = computed(() => categories.value.reduce((s, c) => s + getQty(c.id), 0))
const subtotal = computed(() => categories.value.reduce((s, c) => s + getQty(c.id) * c.price, 0))

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.value, maximumFractionDigits: 0 }).format(n)
}

function onContinue() {
  if (totalQty.value <= 0) return
  const selection = categories.value
    .filter((c) => getQty(c.id) > 0)
    .map((c) => ({ id: c.id, name: c.name, price: c.price, currency: c.currency, quantity: getQty(c.id) }))
  emit('continue', { event: props.event, items: selection, totalQuantity: totalQty.value, subtotal: subtotal.value, currency: currency.value })
}
</script>

<template>
  <section class="ttl">
    <div class="ttl__list">
      <TicketCategoryCard
        v-for="c in categories"
        :key="c.id"
        :category="c"
        :max="max"
        :model-value="getQty(c.id)"
        @update:model-value="(n) => setQty(c.id, n)"
      />
    </div>

    <footer class="ttl__foot">
      <div class="ttl__totals">
        <span class="ttl__label">{{ totalQty }} ticket{{ totalQty === 1 ? '' : 's' }}</span>
        <span class="ttl__sub">{{ fmt(subtotal) }}</span>
      </div>
      <button type="button" class="ttl__cta" :disabled="totalQty <= 0" @click="onContinue">Continue</button>
    </footer>
  </section>
</template>

<style scoped>
.ttl {
  font-family: var(--ds-font-family); display: flex; flex-direction: column; gap: var(--ds-space-4);
}
.ttl__list { display: flex; flex-direction: column; gap: var(--ds-space-3); }

.ttl__foot {
  display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-4);
  padding-top: var(--ds-space-4); border-top: 1px solid var(--ds-color-border);
}
.ttl__totals { display: flex; flex-direction: column; gap: 2px; }
.ttl__label { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.ttl__sub { font-size: var(--ds-font-size-lg); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.ttl__cta {
  cursor: pointer; border: none; font: inherit; font-weight: var(--ds-font-weight-bold);
  background: var(--ds-color-background-brand-bold); color: var(--ds-color-text-inverse);
  padding: 11px 22px; border-radius: var(--ds-radius-button); flex: none;
}
.ttl__cta:disabled { background: var(--ds-color-background-neutral); color: var(--ds-color-text-disabled); cursor: not-allowed; }
</style>
