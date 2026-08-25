<script setup>
// One tournament admission tier.
//
// This is the library's TicketCategoryCard with ONE part removed and one part
// added, rebuilt here rather than mounted from `@lib` because the part that had
// to go is the part that component exists to render: its − qty + stepper.
//
// WHY it had to go: party size now locks every quantity in this flow. A tier is
// bought for the whole party or not at all, so a stepper on this row would be a
// control whose only possible use is to make the order disagree with itself —
// three passes for a family of four, and a cart nobody can explain at the doors.
//
// The rejected alternative was mounting TicketCategoryCard and hiding its
// stepper with CSS. That leaves a live keyboard-reachable control behind an
// invisible surface, and it would have been a change to how a library component
// behaves made from outside it — the library here is read-only, and anything it
// can't do gets built alongside it instead of styled over.
//
// Everything else is kept to the library card's grammar on purpose — the colour
// swatch, the same AvailabilityBadge (mounted unmodified), the same price/ea
// treatment, the same greyed sold-out state — so a limited tier and a sold-out
// tier still read identically here and in the seat-map flows.
import { computed } from 'vue'
import AvailabilityBadge from '@lib/components/AvailabilityBadge.vue'
import { tierQty, tierQtyNote } from '../tickets.js'

const props = defineProps({
  tier: { type: Object, required: true },      // a ticketCategories() entry
  guests: { type: Number, default: 4 },        // party size — the quantity
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle'])

const count = computed(() => props.tier.count ?? 0)
const soldOut = computed(() => props.tier.soldOut === true || count.value <= 0)
const qty = computed(() => tierQty(props.tier, props.guests))
// The number this row is following, and WHY it is that number. Without the
// sentence the price looks like it moved on its own when the party changes.
const qtyNote = computed(() => tierQtyNote(props.tier, props.guests))
const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: props.tier.currency || 'USD', maximumFractionDigits: 0 }).format(n || 0)
</script>

<template>
  <div class="ttc" :class="{ 'is-sold': soldOut, 'is-on': selected && !soldOut }">
    <span class="ttc__swatch" :style="{ background: `var(${tier.colorVar})` }" />

    <div class="ttc__info">
      <div class="ttc__name">{{ tier.name }}</div>
      <div v-if="tier.desc" class="ttc__desc">{{ tier.desc }}</div>
      <!-- Where the stepper used to be: the quantity, stated, not editable. -->
      <div v-if="!soldOut" class="ttc__qty">
        <q-icon name="group" size="15px" /> {{ qtyNote }}
      </div>
      <div v-if="tier.note" class="ttc__hint">{{ tier.note }}</div>
    </div>

    <div class="ttc__side">
      <div class="ttc__price">{{ money(tier.price) }}<span>/ea</span></div>
      <availability-badge :count="count" />
      <div v-if="soldOut" class="ttc__soldtag">Sold out</div>
      <template v-else>
        <div class="ttc__line">{{ qty }} × {{ money(tier.price) }} = <strong>{{ money(qty * tier.price) }}</strong></div>
        <button type="button" class="ttc__btn" :class="{ 'is-on': selected }" @click="emit('toggle', tier)">
          <q-icon :name="selected ? 'check' : 'add'" size="16px" />
          {{ selected ? 'Added' : `Add for ${qty}` }}
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.ttc {
  display: flex; align-items: flex-start; justify-content: space-between; gap: var(--ds-space-4);
  font-family: var(--ds-font-family); background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg);
  padding: var(--ds-space-4);
}
.ttc.is-sold { opacity: 0.6; }
.ttc.is-on { border-color: var(--ds-color-border-brand, #01113E); box-shadow: 0 0 0 1px var(--ds-color-border-brand, #01113E); }

.ttc__swatch { width: 14px; height: 36px; border-radius: var(--ds-radius-sm); flex: none; margin-top: 2px; }
.ttc__info { min-width: 0; flex: 1; }
.ttc__name { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); font-size: var(--ds-font-size-md); }
.ttc__desc { margin-top: 2px; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.ttc__qty { display: inline-flex; align-items: center; gap: 5px; margin-top: 8px; font-size: 0.8125rem; font-weight: 700; color: var(--ds-color-text); }
.ttc__qty .q-icon { color: var(--ds-color-text-subtle); }
.ttc__hint { margin-top: 4px; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }

.ttc__side { display: flex; flex-direction: column; align-items: flex-end; gap: var(--ds-space-2); flex: none; }
.ttc__price { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.ttc__price span { font-size: var(--ds-font-size-sm); font-weight: 400; color: var(--ds-color-text-subtle); margin-left: 2px; }
.ttc__line { font-size: 0.8125rem; color: var(--ds-color-text-subtle); font-variant-numeric: tabular-nums; white-space: nowrap; }
.ttc__line strong { color: var(--ds-color-text); }
.ttc__soldtag { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); font-weight: var(--ds-font-weight-medium); }

.ttc__btn { display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 16px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button); background: var(--ds-color-surface); color: var(--ds-color-text); font: inherit; font-weight: 700; font-size: 0.875rem; cursor: pointer; white-space: nowrap; }
.ttc__btn:hover { background: var(--ds-palette-slate-100); }
.ttc__btn.is-on { background: var(--ds-color-background-brand-bold, #01113E); border-color: var(--ds-color-background-brand-bold, #01113E); color: #fff; }

@media (max-width: 560px) {
  .ttc { flex-wrap: wrap; }
  .ttc__side { align-items: flex-start; width: 100%; }
}
</style>
