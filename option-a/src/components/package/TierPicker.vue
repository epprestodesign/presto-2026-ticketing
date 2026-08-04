<script setup>
// TierPicker — choose the ticket tier for a package (Aug 4).
//
// The tier drives the ticket price, so each row carries its per-ticket rate and
// what that becomes for the current party size. Presentational: the selected id
// comes in, a new one goes out.
import { TIERS } from '../../pricing.js'

defineProps({
  modelValue: { type: String, default: null },   // selected tier id
  guests: { type: Number, default: 2 },
  tiers: { type: Array, default: () => TIERS },
})
const emit = defineEmits(['update:modelValue'])
const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)
</script>

<template>
<!-- TIER PICKER — always shown; the tier drives the ticket price. -->
<section class="tiers">
  <h3 class="pqv__h3">Choose your tier</h3>
  <p class="pqv__sub">Per-ticket pricing for {{ guests }} guest{{ guests === 1 ? '' : 's' }} — change the party size in the summary.</p>

  <ul class="tiers__list">
    <li v-for="t in tiers" :key="t.id">
      <label class="tier" :class="{ 'tier--on': t.id === modelValue }">
        <input type="radio" :checked="t.id === modelValue" @change="emit('update:modelValue', t.id)" />
        <span class="tier__swatch" :style="{ background: `var(${t.colorVar})` }" />
        <span class="tier__body">
          <span class="tier__name">{{ t.name }}</span>
          <span class="tier__desc">{{ t.desc }}</span>
          <span class="tier__perks">
            <span v-for="perk in t.perks" :key="perk" class="tier__perk">
              <q-icon name="check" size="14px" /> {{ perk }}
            </span>
          </span>
        </span>
        <span class="tier__price">
          {{ money(t.price) }}<small>per ticket</small>
          <small class="tier__total">{{ money(t.price * guests) }} for {{ guests }}</small>
        </span>
      </label>
    </li>
  </ul>
</section>
</template>

<style scoped>
.tiers { margin-bottom: 32px; }
.tiers__list { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.tier { display: grid; grid-template-columns: auto 6px minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 14px; border: 1px solid var(--ds-color-border); border-radius: 10px; cursor: pointer; transition: border-color .15s, box-shadow .15s; }
.tier:hover { border-color: var(--ds-color-border-bold, #9aa3ae); }
.tier--on { border-color: var(--ds-color-border-brand, #0b2545); box-shadow: 0 0 0 1px var(--ds-color-border-brand, #0b2545) inset; }
.tier__swatch { width: 6px; align-self: stretch; border-radius: 3px; }
.tier__body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.tier__name { font-weight: 700; font-size: 1.0625rem; }
.tier__desc { color: var(--ds-color-text-subtle); font-size: .875rem; }
.tier__perks { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 4px; }
.tier__perk { display: inline-flex; align-items: center; gap: 4px; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.tier__perk .q-icon { color: var(--ds-color-text-success, #167a4a); }
.tier__price { text-align: right; font-weight: 700; font-size: 1.125rem; white-space: nowrap; }
.tier__price small { display: block; font-weight: 400; font-size: .75rem; color: var(--ds-color-text-subtle); }
.tier__total { margin-top: 2px; }
.pqv__h3 { margin: 0 0 4px; font-size: 1.375rem; font-weight: 700; }
.pqv__sub { margin: 0 0 16px; color: var(--ds-color-text-subtle); }
</style>
