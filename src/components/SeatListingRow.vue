<script setup>
// SeatListingRow — one offer in the SeatGeek-style listings rail: a view-from-
// seat thumbnail, section/row, quantity, a deal score, value flags (best deal /
// cheapest in section), and price incl. fees. Emits `select` on click.
import { computed } from 'vue'
import DealScoreBadge from './DealScoreBadge.vue'

const props = defineProps({
  listing: { type: Object, required: true }, // a generateListings() item
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['select'])

const l = computed(() => props.listing)
function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: l.value.currency || 'USD', maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <button type="button" class="slrow" :class="{ 'is-selected': selected }" @click="emit('select', l)">
    <img :src="l.photo.thumb" :alt="l.photo.alt || `View from section ${l.section}`" class="slrow__thumb" loading="lazy" />

    <div class="slrow__body">
      <div class="slrow__top">
        <span class="slrow__section">Section {{ l.section }}</span>
        <span class="slrow__price">{{ fmt(l.priceWithFees) }}</span>
      </div>
      <div class="slrow__sub">
        <span>Row {{ l.row }} · {{ l.quantityAvailable }} ticket{{ l.quantityAvailable === 1 ? '' : 's' }}</span>
        <span class="slrow__fees">incl. fees</span>
      </div>
      <div class="slrow__flags">
        <DealScoreBadge :score="l.dealScore" size="sm" />
        <DealScoreBadge v-if="l.bestDeal" flag="best-deal" size="sm" />
        <DealScoreBadge v-else-if="l.cheapestInSection" flag="cheapest-in-section" size="sm" />
        <span v-for="p in l.perks" :key="p" class="slrow__perk">{{ p }}</span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.slrow {
  display: flex; gap: var(--ds-space-3); width: 100%; text-align: left; cursor: pointer;
  background: var(--ds-color-surface); border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-md); padding: var(--ds-space-3); font-family: var(--ds-font-family);
  transition: border-color var(--ds-duration-fast) var(--ds-ease-standard), box-shadow var(--ds-duration-fast) var(--ds-ease-standard);
}
.slrow:hover { border-color: var(--ds-color-border-bold); box-shadow: var(--ds-shadow-2, 0 4px 12px rgba(0,0,0,.08)); }
.slrow.is-selected { border-color: var(--ds-color-border-brand); box-shadow: 0 0 0 1px var(--ds-color-border-brand); }

.slrow__thumb { width: 88px; height: 66px; object-fit: cover; border-radius: var(--ds-radius-sm); flex: none; background: var(--ds-color-surface-sunken); }
.slrow__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.slrow__top { display: flex; align-items: baseline; justify-content: space-between; gap: var(--ds-space-2); }
.slrow__section { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.slrow__price { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.slrow__sub { display: flex; align-items: baseline; justify-content: space-between; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.slrow__fees { font-size: 11px; }
.slrow__flags { display: flex; align-items: center; gap: var(--ds-space-3); flex-wrap: wrap; margin-top: 2px; }
.slrow__perk {
  font-size: 11px; color: var(--ds-color-text-subtle); background: var(--ds-color-background-neutral);
  padding: 1px 6px; border-radius: var(--ds-radius-pill);
}
</style>
