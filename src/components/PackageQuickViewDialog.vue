<script setup>
// PackageQuickViewDialog — a condensed "quick view" of a single Patriots
// experience package: hero image + theme, tagline, the bundle's inclusions
// (ticket tier · hotel · signature experiences), and the price with bundle
// savings. A lighter companion to the full PackageBookingDialog — it summarizes
// what's in the package and hands off to "Customize" (the full booking dialog)
// or "Select". Rendered as content inside a <q-dialog> by the parent.
import { computed } from 'vue'

const props = defineProps({
  pkg: { type: Object, required: true }, // generateExperiencePackages() item
})
const emit = defineEmits(['close', 'select', 'customize'])

const p = computed(() => props.pkg)
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: p.value.currency || 'USD', maximumFractionDigits: 0 }).format(n || 0)
const soldOut = computed(() => p.value.soldOut)
</script>

<template>
  <div class="pqv">
    <!-- Hero -->
    <div class="pqv__hero" :style="{ '--accent': `var(${p.accentVar || '--ds-palette-navy-700'})` }">
      <img v-if="p.image" :src="p.image" :alt="p.name" />
      <div v-else class="pqv__hero--empty"><q-icon name="confirmation_number" size="40px" /></div>
      <button class="pqv__close" aria-label="Close" @click="emit('close')"><q-icon name="close" size="20px" /></button>
      <span class="pqv__theme"><q-icon :name="p.icon || 'star'" size="15px" /> {{ p.theme }}</span>
    </div>

    <div class="pqv__body">
      <h2 class="pqv__title">{{ p.name }}</h2>
      <p v-if="p.tagline" class="pqv__tagline">{{ p.tagline }}</p>
      <p v-if="p.sponsor" class="pqv__sponsor">Presented by {{ p.sponsor }}</p>

      <!-- What's included -->
      <div class="pqv__label">What's included</div>
      <ul class="pqv__incl">
        <li>
          <span class="pqv__swatch" :style="{ background: `var(${p.ticket.colorVar})` }" />
          <span><strong>{{ p.ticket.tierName }}</strong> ticket<template v-if="p.quantity > 1"> × {{ p.quantity }}</template></span>
        </li>
        <li v-if="p.hotel">
          <q-icon name="hotel" size="16px" class="pqv__ic" />
          <span><strong>{{ p.hotel.name }}</strong> · {{ p.hotel.roomType }} · {{ p.nights }} night{{ p.nights === 1 ? '' : 's' }}</span>
        </li>
        <li v-for="(x, i) in p.experiences" :key="i">
          <q-icon :name="x.icon || 'star'" size="16px" class="pqv__ic" />
          <span>{{ x.label }}</span>
        </li>
      </ul>

      <!-- Price -->
      <div class="pqv__pricerow">
        <div class="pqv__price">
          <span v-if="p.componentsTotal > p.packagePrice" class="pqv__was">{{ fmt(p.componentsTotal) }}</span>
          <span class="pqv__now">{{ fmt(p.packagePrice) }}</span>
          <span class="pqv__unit">total{{ p.quantity > 1 ? ` · ${p.quantity} guests` : '' }}</span>
        </div>
        <span v-if="!soldOut && p.savings > 0" class="pqv__save">Save {{ fmt(p.savings) }}</span>
      </div>
    </div>

    <!-- Footer actions -->
    <footer class="pqv__foot">
      <button class="pqv__link" @click="emit('customize', p)">Customize</button>
      <q-btn unelevated no-caps class="pqv__cta" :disable="soldOut" :label="soldOut ? 'Sold out' : 'Select package'" @click="emit('select', p)" />
    </footer>
  </div>
</template>

<style scoped>
.pqv { display: flex; flex-direction: column; width: 100%; max-width: 460px; max-height: 88vh; background: var(--ds-color-surface); border-radius: var(--ds-radius-lg); overflow: hidden; box-shadow: var(--ds-shadow-4); font-family: var(--ds-font-family); }
.pqv__hero { position: relative; aspect-ratio: 16 / 9; background: var(--accent); flex: none; }
.pqv__hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pqv__hero--empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.8); }
.pqv__close { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border: 0; border-radius: 50%; background: rgba(255,255,255,0.92); color: var(--ds-color-text); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.pqv__close:hover { background: #fff; }
.pqv__theme { position: absolute; left: 12px; bottom: 12px; display: inline-flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.6); color: #fff; font-size: 0.8125rem; font-weight: 700; padding: 5px 11px; border-radius: var(--ds-radius-pill); }

.pqv__body { flex: 1; min-height: 0; overflow-y: auto; padding: 18px 20px 8px; }
.pqv__title { margin: 0; font-size: 1.375rem; font-weight: 700; color: var(--ds-color-text); }
.pqv__tagline { margin: 6px 0 0; color: var(--ds-color-text-subtle); line-height: 1.5; }
.pqv__sponsor { margin: 6px 0 0; font-size: 0.8125rem; font-weight: 700; color: var(--ds-color-text-brand); }
.pqv__label { margin: 18px 0 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ds-color-text-subtle); }
.pqv__incl { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.pqv__incl li { display: flex; align-items: flex-start; gap: 10px; color: var(--ds-color-text); line-height: 1.4; }
.pqv__ic { color: var(--ds-color-text); flex: none; margin-top: 1px; }
.pqv__swatch { width: 14px; height: 14px; border-radius: 4px; flex: none; margin-top: 3px; }

.pqv__pricerow { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 20px 0 4px; padding-top: 16px; border-top: 1px solid var(--ds-color-border); }
.pqv__price { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.pqv__was { color: var(--ds-color-text-subtle); text-decoration: line-through; }
.pqv__now { font-size: 1.375rem; font-weight: 700; color: var(--ds-color-text); }
.pqv__unit { font-size: 0.8125rem; color: var(--ds-color-text-subtle); }
.pqv__save { background: var(--ds-color-background-positive, #e6f4ea); color: var(--ds-color-text-positive, #1b7a3d); font-weight: 700; font-size: 0.8125rem; padding: 4px 10px; border-radius: var(--ds-radius-pill); white-space: nowrap; }

.pqv__foot { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 20px; border-top: 1px solid var(--ds-color-border); }
.pqv__link { background: none; border: 0; padding: 0; font: inherit; font-weight: 700; color: var(--ds-color-text); text-decoration: underline; cursor: pointer; }
.pqv__cta { height: 46px; padding: 0 22px; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; }
</style>
