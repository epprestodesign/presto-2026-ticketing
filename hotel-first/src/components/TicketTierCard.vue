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
import { tierQtyNote } from '../tickets.js'

const props = defineProps({
  tier: { type: Object, required: true },      // a ticketCategories() entry
  guests: { type: Number, default: 4 },        // party size — the BUDGET, not the quantity
  selected: { type: Boolean, default: false },
  qty: { type: Number, default: 0 },           // this tier's own allocation
  max: { type: Number, default: 0 },           // inventory ∩ what the party has spare
})
const emit = defineEmits(['toggle', 'update:qty'])

const count = computed(() => props.tier.count ?? 0)
const soldOut = computed(() => props.tier.soldOut === true || count.value <= 0)
// `qty` is now the PROP — this row's own allocation, owned by the store. There
// is no local computed shadowing it: the card is told its number and asks for a
// new one, which is what stops two surfaces disagreeing about the same line.
//
// `max` is what is still assignable INCLUDING this row's current allocation, so
// the plus button disables exactly when the party is fully covered.
const atMax = computed(() => props.qty >= props.max)
const assignedElsewhere = computed(() => props.guests - props.max)
// The number this row is following, and WHY it is that number. Without the
// sentence the price looks like it moved on its own when the party changes.
const qtyNote = computed(() => tierQtyNote(props.tier, props.guests, props.qty, assignedElsewhere.value))
const step = (n) => emit('update:qty', Math.max(0, Math.min(props.max, props.qty + n)))
const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: props.tier.currency || 'USD', maximumFractionDigits: 0 }).format(n || 0)
</script>

<template>
  <div class="ttc" :class="{ 'is-sold': soldOut, 'is-on': selected && !soldOut }">
    <span class="ttc__swatch" :style="{ background: `var(${tier.colorVar})` }" />

    <div class="ttc__info">
      <div class="ttc__name">{{ tier.name }}</div>
      <div v-if="tier.desc" class="ttc__desc">{{ tier.desc }}</div>
      <!-- THE STEPPER IS BACK, capped. A party needs different credentials for
           different people (3 spectators + 1 athlete), which the pinned model
           could not express — see tickets.js. The cap is what keeps the order
           describing a real party. -->
      <div v-if="!soldOut" class="ttc__qtyrow">
        <div class="ttc__stepper" role="group" :aria-label="`Quantity for ${tier.name}`">
          <button type="button" class="ttc__step" :disabled="qty <= 0"
                  :aria-label="`One fewer ${tier.name}`" @click="step(-1)">
            <q-icon name="remove" size="16px" />
          </button>
          <span class="ttc__stepval" aria-live="polite">{{ qty }}</span>
          <button type="button" class="ttc__step" :disabled="atMax"
                  :aria-label="`One more ${tier.name}`" @click="step(1)">
            <q-icon name="add" size="16px" />
          </button>
        </div>
        <span class="ttc__qty"><q-icon name="group" size="15px" /> {{ qtyNote }}</span>
      </div>
      <div v-if="tier.note" class="ttc__hint">{{ tier.note }}</div>
    </div>

    <div class="ttc__side">
      <div class="ttc__price">{{ money(tier.price) }}<span>/ea</span></div>
      <availability-badge :count="count" />
      <div v-if="soldOut" class="ttc__soldtag">Sold out</div>
      <template v-else>
        <div class="ttc__line">{{ qty }} × {{ money(tier.price) }} = <strong>{{ money(qty * tier.price) }}</strong></div>
        <!-- Still one press to cover whoever is left over — the stepper is for
             splitting a party, not a replacement for the common case. -->
        <button type="button" class="ttc__btn" :class="{ 'is-on': selected }"
                :disabled="!selected && max <= 0" @click="emit('toggle', tier)">
          <q-icon :name="selected ? 'check' : 'add'" size="16px" />
          {{ selected ? 'Added' : max > 0 ? `Add for ${max}` : 'Party covered' }}
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
.ttc__qtyrow { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
.ttc__stepper { display: inline-flex; align-items: center; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); overflow: hidden; }
.ttc__step { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: 0; background: var(--ds-color-surface); color: var(--ds-color-text); cursor: pointer; }
.ttc__step:hover:not(:disabled) { background: var(--ds-palette-slate-100, #f1f2f4); }
.ttc__step:disabled { color: var(--ds-color-text-subtlest); cursor: not-allowed; }
.ttc__stepval { min-width: 30px; text-align: center; font-weight: 800; font-size: 0.9375rem; font-variant-numeric: tabular-nums; border-inline: 1px solid var(--ds-color-border); align-self: stretch; display: flex; align-items: center; justify-content: center; }
.ttc__qty { display: inline-flex; align-items: center; gap: 5px; font-size: 0.8125rem; font-weight: 700; color: var(--ds-color-text); }
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
