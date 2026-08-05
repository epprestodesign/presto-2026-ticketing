<script setup>
// The "Price details" breakdown behind a package, on the library's DsModal.
//
// Why not the library's own `PriceDetailsDialog`? That one breaks down a ROOM:
// per-night line items, hotel fee, taxes. On the hotel page the headline figure
// is now the PACKAGE total, and a breakdown that added up to a different number
// than the button above it would be worse than no breakdown at all.
//
// So this itemises what the package price is actually made of — the same four
// inclusions the cards list, then the bundle discount that separates the
// components total from what you pay. Same modal shell as every other dialog in
// the system; only the contents are Option D's.
import { computed } from 'vue'
import DsModal from '@lib/components/DsModal.vue'
import { TRANSPORT_VALUE, HOSPITALITY_VALUE, STAY_SHORT, TIER } from '../packages.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  pkg: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'select'])

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

const lines = computed(() => {
  const p = props.pkg
  if (!p) return []
  const rooms = p.rooms
  const guests = p.guests
  return [
    {
      label: `${TIER.name} tickets`,
      note: `${guests} × ${money(p.ticket.price)}`,
      value: p.ticketsTotal,
    },
    {
      label: `${p.hotel.roomType} · ${STAY_SHORT}`,
      note: `${rooms} room${rooms === 1 ? '' : 's'} × ${p.nights} nights × ${money(p.hotel.nightlyRate)}`,
      value: p.stayTotal,
    },
    {
      label: 'Round-trip transportation',
      note: `${rooms} coach booking${rooms === 1 ? '' : 's'} × ${money(TRANSPORT_VALUE)}`,
      value: TRANSPORT_VALUE * rooms,
    },
    {
      label: 'Pregame hospitality',
      note: `${guests} × ${money(HOSPITALITY_VALUE)}`,
      value: HOSPITALITY_VALUE * guests,
    },
  ]
})
</script>

<template>
  <ds-modal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :title="pkg ? `${pkg.name} — price details` : 'Price details'"
    size="md"
  >
    <div v-if="pkg" class="ppd">
      <p class="ppd__head">
        Priced for {{ pkg.guests }} {{ pkg.guests === 1 ? 'person' : 'people' }} ·
        {{ pkg.rooms }} room{{ pkg.rooms === 1 ? '' : 's' }} at {{ pkg.hotel.name }}
      </p>

      <div class="ppd__lines">
        <div v-for="l in lines" :key="l.label" class="ppd__row">
          <span class="ppd__label">
            {{ l.label }}
            <small>{{ l.note }}</small>
          </span>
          <span class="ppd__amt">{{ money(l.value) }}</span>
        </div>
      </div>

      <hr class="ppd__rule" />

      <div class="ppd__row ppd__row--sub">
        <span class="ppd__label">Booked separately</span>
        <span class="ppd__amt">{{ money(pkg.componentsTotal) }}</span>
      </div>
      <div class="ppd__row ppd__row--save">
        <span class="ppd__label">Bundle discount</span>
        <span class="ppd__amt">−{{ money(pkg.savings) }}</span>
      </div>

      <hr class="ppd__rule" />

      <div class="ppd__row ppd__row--total">
        <span>Package total (USD)</span>
        <span>{{ money(pkg.packagePrice) }}</span>
      </div>
      <p class="ppd__per">{{ money(pkg.perPerson) }} per person · all in</p>

      <button type="button" class="ppd__cta" @click="emit('select', pkg)">Select package</button>
      <p class="ppd__note">Prototype pricing. Taxes and fees are included in every line.</p>
    </div>
  </ds-modal>
</template>

<style scoped>
.ppd { display: flex; flex-direction: column; }
.ppd__head { margin: 0 0 16px; color: var(--ds-color-text-subtle); font-size: .9375rem; }

.ppd__lines { display: flex; flex-direction: column; gap: 14px; }
.ppd__row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; font-size: 1rem; color: var(--ds-color-text); }
.ppd__label { display: flex; flex-direction: column; min-width: 0; }
.ppd__label small { margin-top: 2px; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.ppd__amt { font-variant-numeric: tabular-nums; white-space: nowrap; }

.ppd__rule { border: 0; border-top: 1px solid var(--ds-color-border); margin: 16px 0; width: 100%; }

.ppd__row--sub .ppd__amt { color: var(--ds-color-text-subtle); text-decoration: line-through; }
.ppd__row--save { margin-top: 10px; color: var(--ds-color-text-success, #167a4a); font-weight: 700; }
.ppd__row--save .ppd__amt { color: inherit; }

.ppd__row--total { font-size: 1.25rem; font-weight: 800; }
.ppd__per { margin: 4px 0 0; text-align: right; font-size: .8125rem; color: var(--ds-color-text-subtle); }

.ppd__cta {
  width: 100%; height: 52px; margin-top: 22px; border: 0; border-radius: var(--ds-radius-button);
  background: var(--ds-color-background-brand-bold); color: #fff; font-family: inherit;
  font-size: 1rem; font-weight: 700; cursor: pointer;
}
.ppd__cta:hover { background: var(--ds-palette-navy-800); }
.ppd__note { margin: 12px 0 0; font-size: .75rem; color: var(--ds-color-text-subtle); text-align: center; }
</style>
