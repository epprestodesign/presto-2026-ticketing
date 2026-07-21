<script setup>
// PackageCard — a pre-built ticket + hotel (+ experience) SKU (scope 3.4). Shows
// the package theme, its components (ticket tier + hotel + any signature
// experience), bundle savings, the single package price (a-la-carte total struck
// through), availability, and a Select CTA. Supports both plain ticket+hotel
// packages and the themed "Patriots experience" packages.
import { computed } from 'vue'
import BundleSavingsBadge from './BundleSavingsBadge.vue'

const props = defineProps({
  pkg: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['select'])

const soldOut = computed(() => props.pkg.soldOut)
const hasExperiences = computed(() => Array.isArray(props.pkg.experiences) && props.pkg.experiences.length > 0)
function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: props.pkg.currency || 'USD', maximumFractionDigits: 0 }).format(n) }
</script>

<template>
  <div class="pkg" :class="{ 'is-selected': selected, 'is-sold': soldOut }">
    <!-- Imagery hero (experience packages with a themed photo) -->
    <div v-if="pkg.image" class="pkg__hero" :style="{ '--accent': `var(${pkg.accentVar || '--ds-palette-navy-700'})` }">
      <img :src="pkg.image" :alt="pkg.name" loading="lazy" />
      <div class="pkg__heroover">
        <span class="pkg__themechip"><q-icon :name="pkg.icon || 'star'" size="15px" />{{ pkg.theme }}</span>
        <BundleSavingsBadge v-if="!soldOut" :amount="pkg.savings" size="sm" />
        <span v-else class="pkg__soldtag pkg__soldtag--onhero">Sold out</span>
      </div>
    </div>

    <!-- Theme banner (experience packages without a photo) -->
    <div v-else-if="pkg.theme" class="pkg__theme" :style="{ '--accent': `var(${pkg.accentVar || '--ds-palette-navy-700'})` }">
      <q-icon :name="pkg.icon || 'star'" size="18px" />
      <span>{{ pkg.theme }}</span>
      <BundleSavingsBadge v-if="!soldOut" :amount="pkg.savings" size="sm" class="pkg__themesavings" />
      <span v-else class="pkg__soldtag">Sold out</span>
    </div>

    <div class="pkg__head">
      <h4 class="pkg__name">{{ pkg.name }}</h4>
      <BundleSavingsBadge v-if="!pkg.theme && !soldOut" :amount="pkg.savings" size="sm" />
      <span v-else-if="!pkg.theme && soldOut" class="pkg__soldtag">Sold out</span>
    </div>
    <p v-if="pkg.tagline" class="pkg__tagline">{{ pkg.tagline }}</p>
    <p v-if="pkg.sponsor" class="pkg__sponsor"><q-icon name="handshake" size="14px" /> Presented by {{ pkg.sponsor }}</p>

    <ul class="pkg__components">
      <li>
        <span class="pkg__swatch" :style="{ background: `var(${pkg.ticket.colorVar})` }" />
        <span><strong>{{ pkg.ticket.tierName }}</strong> ticket<template v-if="pkg.quantity > 1"> × {{ pkg.quantity }}</template></span>
      </li>
      <li>
        <q-icon name="hotel" size="16px" class="pkg__icon" />
        <span><strong>{{ pkg.hotel.name }}</strong> · {{ pkg.hotel.roomType }} · {{ pkg.nights }} night{{ pkg.nights === 1 ? '' : 's' }}</span>
      </li>
      <li v-for="(x, i) in pkg.experiences" :key="i" class="pkg__exp">
        <q-icon :name="x.icon" size="16px" class="pkg__icon pkg__icon--accent" :style="{ color: `var(${pkg.accentVar || '--ds-palette-navy-700'})` }" />
        <span>{{ x.label }}</span>
      </li>
    </ul>

    <div class="pkg__foot">
      <div class="pkg__pricing">
        <span class="pkg__was">{{ fmt(pkg.componentsTotal) }}</span>
        <span class="pkg__now">{{ fmt(pkg.packagePrice) }}</span>
        <span v-if="pkg.quantity > 1" class="pkg__per">for {{ pkg.quantity }}</span>
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
  overflow: hidden; display: flex; flex-direction: column; gap: var(--ds-space-3);
  padding: var(--ds-space-4); transition: border-color var(--ds-duration-fast) var(--ds-ease-standard);
}
.pkg.is-selected { border-color: var(--ds-color-border-brand); box-shadow: 0 0 0 1px var(--ds-color-border-brand); }
.pkg.is-sold { opacity: 0.65; }

.pkg__hero { position: relative; margin: calc(-1 * var(--ds-space-4)) calc(-1 * var(--ds-space-4)) 2px; height: 148px; overflow: hidden; }
.pkg__hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pkg__heroover {
  position: absolute; inset: 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
  padding: 12px; background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.18) 100%);
}
.pkg__themechip {
  display: inline-flex; align-items: center; gap: 5px; background: var(--accent); color: #fff;
  font-weight: var(--ds-font-weight-bold); font-size: var(--ds-font-size-sm); padding: 4px 11px; border-radius: var(--ds-radius-pill);
}
.pkg__soldtag--onhero { background: rgba(0,0,0,0.6); color: #fff; padding: 3px 9px; border-radius: var(--ds-radius-sm); }

.pkg__theme {
  display: flex; align-items: center; gap: var(--ds-space-2); margin: calc(-1 * var(--ds-space-4)) calc(-1 * var(--ds-space-4)) 0;
  padding: 10px var(--ds-space-4); background: var(--accent); color: #fff;
  font-weight: var(--ds-font-weight-bold); font-size: var(--ds-font-size-sm);
}
.pkg__themesavings { margin-left: auto; }
.pkg__theme .pkg__soldtag { margin-left: auto; color: #fff; }

.pkg__head { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); }
.pkg__name { margin: 0; font-size: var(--ds-font-size-md); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.pkg__soldtag { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.pkg__tagline { margin: -6px 0 0; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.pkg__sponsor { margin: 0; display: flex; align-items: center; gap: 4px; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-brand); font-weight: var(--ds-font-weight-medium); }

.pkg__components { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--ds-space-2); }
.pkg__components li { display: flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-sm); color: var(--ds-color-text); }
.pkg__swatch { width: 12px; height: 12px; border-radius: var(--ds-radius-sm); flex: none; }
.pkg__icon { color: var(--ds-color-icon-subtle); flex: none; }
.pkg__exp { color: var(--ds-color-text); }

.pkg__foot { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); padding-top: var(--ds-space-3); border-top: 1px solid var(--ds-color-border); }
.pkg__pricing { display: flex; align-items: baseline; gap: var(--ds-space-2); }
.pkg__was { text-decoration: line-through; color: var(--ds-color-text-subtlest); font-size: var(--ds-font-size-sm); }
.pkg__now { font-size: var(--ds-font-size-lg); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.pkg__per { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.pkg__cta {
  cursor: pointer; border: none; font: inherit; font-weight: var(--ds-font-weight-bold);
  background: var(--ds-color-background-brand-bold); color: var(--ds-color-text-inverse);
  padding: 9px 18px; border-radius: var(--ds-radius-button); flex: none;
}
.pkg__cta:disabled { background: var(--ds-color-background-neutral); color: var(--ds-color-text-disabled); cursor: not-allowed; }
</style>
