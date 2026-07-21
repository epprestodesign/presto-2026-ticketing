<script setup>
// PackageCard — a pre-built ticket + hotel SKU (scope 3.4). Shows the package
// name, its two components (ticket tier + hotel/room), the bundle savings, the
// single package price (with the a-la-carte total struck through), availability,
// and a Select CTA. Selecting adds both components to the cart as one item.
import { computed } from 'vue'
import BundleSavingsBadge from './BundleSavingsBadge.vue'

const props = defineProps({
  pkg: { type: Object, required: true },       // generatePackages() item
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['select'])

const soldOut = computed(() => props.pkg.soldOut)
function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: props.pkg.currency || 'USD', maximumFractionDigits: 0 }).format(n) }
</script>

<template>
  <div class="pkg" :class="{ 'is-selected': selected, 'is-sold': soldOut }">
    <div class="pkg__top">
      <h4 class="pkg__name">{{ pkg.name }}</h4>
      <BundleSavingsBadge v-if="!soldOut" :amount="pkg.savings" size="sm" />
      <span v-else class="pkg__soldtag">Sold out</span>
    </div>

    <ul class="pkg__components">
      <li>
        <span class="pkg__swatch" :style="{ background: `var(${pkg.ticket.colorVar})` }" />
        <span><strong>{{ pkg.ticket.tierName }}</strong> ticket</span>
        <span class="pkg__c-price">{{ fmt(pkg.ticket.price) }}</span>
      </li>
      <li>
        <q-icon name="hotel" size="16px" class="pkg__hicon" />
        <span><strong>{{ pkg.hotel.name }}</strong> · {{ pkg.hotel.roomType }} · {{ pkg.nights }} night{{ pkg.nights === 1 ? '' : 's' }}</span>
        <span class="pkg__c-price">{{ fmt(pkg.hotel.hotelTotal) }}</span>
      </li>
    </ul>

    <div class="pkg__foot">
      <div class="pkg__pricing">
        <span class="pkg__was">{{ fmt(pkg.componentsTotal) }}</span>
        <span class="pkg__now">{{ fmt(pkg.packagePrice) }}</span>
      </div>
      <button type="button" class="pkg__cta" :disabled="soldOut" @click="emit('select', pkg)">
        {{ selected ? 'Selected' : soldOut ? 'Unavailable' : 'Select package' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.pkg {
  font-family: var(--ds-font-family); background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg);
  padding: var(--ds-space-4); display: flex; flex-direction: column; gap: var(--ds-space-3);
  transition: border-color var(--ds-duration-fast) var(--ds-ease-standard);
}
.pkg.is-selected { border-color: var(--ds-color-border-brand); box-shadow: 0 0 0 1px var(--ds-color-border-brand); }
.pkg.is-sold { opacity: 0.65; }
.pkg__top { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); }
.pkg__name { margin: 0; font-size: var(--ds-font-size-md); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.pkg__soldtag { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }

.pkg__components { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--ds-space-2); }
.pkg__components li { display: flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-sm); color: var(--ds-color-text); }
.pkg__swatch { width: 12px; height: 12px; border-radius: var(--ds-radius-sm); flex: none; }
.pkg__hicon { color: var(--ds-color-icon-subtle); flex: none; }
.pkg__c-price { margin-left: auto; color: var(--ds-color-text-subtle); white-space: nowrap; }

.pkg__foot { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); padding-top: var(--ds-space-2); border-top: 1px solid var(--ds-color-border); }
.pkg__pricing { display: flex; align-items: baseline; gap: var(--ds-space-2); }
.pkg__was { text-decoration: line-through; color: var(--ds-color-text-subtlest); font-size: var(--ds-font-size-sm); }
.pkg__now { font-size: var(--ds-font-size-lg); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.pkg__cta {
  cursor: pointer; border: none; font: inherit; font-weight: var(--ds-font-weight-bold);
  background: var(--ds-color-background-brand-bold); color: var(--ds-color-text-inverse);
  padding: 9px 18px; border-radius: var(--ds-radius-button);
}
.pkg__cta:disabled { background: var(--ds-color-background-neutral); color: var(--ds-color-text-disabled); cursor: not-allowed; }
</style>
