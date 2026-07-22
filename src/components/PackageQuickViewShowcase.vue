<script setup>
// PackageQuickViewShowcase — an alternate "quick view" for a Patriots experience
// package, patterned after the Browse Hotels AvailabilityDialog: a compact
// high-level summary (photo · theme · name · tagline · quick facts) above a
// horizontal carousel that SHOWCASES the package's signature experiences as
// cards. A richer companion to the condensed PackageQuickViewDialog. Rendered as
// content inside a <q-dialog> by the parent.
import { computed } from 'vue'

const props = defineProps({
  pkg: { type: Object, required: true }, // generateExperiencePackages() item
})
const emit = defineEmits(['close', 'select', 'customize'])

const p = computed(() => props.pkg)
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: p.value.currency || 'USD', maximumFractionDigits: 0 }).format(n || 0)
const soldOut = computed(() => p.value.soldOut)
const experiences = computed(() => p.value.experiences || [])
</script>

<template>
  <div class="pqs">
    <!-- Title bar -->
    <header class="pqs__bar">
      <h2 class="pqs__title">Quick view</h2>
      <button class="pqs__close" aria-label="Close" @click="emit('close')"><q-icon name="close" size="22px" /></button>
    </header>

    <div class="pqs__body">
      <!-- High-level summary -->
      <div class="pqs__summary">
        <div class="pqs__photo" :style="{ '--accent': `var(${p.accentVar || '--ds-palette-navy-700'})` }">
          <img v-if="p.image" :src="p.image" :alt="p.name" />
          <div v-else class="pqs__photo--empty"><q-icon name="confirmation_number" size="28px" /></div>
        </div>
        <div class="pqs__info">
          <span class="pqs__theme"><q-icon :name="p.icon || 'star'" size="14px" /> {{ p.theme }}</span>
          <h3 class="pqs__name">{{ p.name }}</h3>
          <p v-if="p.tagline" class="pqs__tagline">{{ p.tagline }}</p>
          <div class="pqs__facts">
            <span class="pqs__fact"><span class="pqs__swatch" :style="{ background: `var(${p.ticket.colorVar})` }" /> {{ p.ticket.tierName }}<template v-if="p.quantity > 1"> ×{{ p.quantity }}</template></span>
            <span v-if="p.hotel" class="pqs__fact"><q-icon name="hotel" size="16px" /> {{ p.hotel.name }} · {{ p.nights }}n</span>
          </div>
        </div>
      </div>

      <!-- Signature experiences carousel -->
      <div class="pqs__section">
        <div class="pqs__sechead">
          <h4 class="pqs__sectitle">Signature experiences</h4>
          <span class="pqs__seccount">{{ experiences.length }} included</span>
        </div>
        <div v-if="experiences.length" class="pqs__carousel">
          <article v-for="(x, i) in experiences" :key="i" class="pqs__card">
            <span class="pqs__cardicon" :style="{ '--accent': `var(${p.accentVar || '--ds-palette-navy-700'})` }"><q-icon :name="x.icon || 'stars'" size="24px" /></span>
            <span class="pqs__cardlabel">{{ x.label }}</span>
            <span class="pqs__cardtag"><q-icon name="check_circle" size="14px" /> Included</span>
          </article>
        </div>
        <p v-else class="pqs__noexp">This package has no signature experiences.</p>
      </div>
    </div>

    <!-- Footer: price + actions -->
    <footer class="pqs__foot">
      <div class="pqs__price">
        <span v-if="p.componentsTotal > p.packagePrice" class="pqs__was">{{ fmt(p.componentsTotal) }}</span>
        <span class="pqs__now">{{ fmt(p.packagePrice) }}</span>
        <span v-if="!soldOut && p.savings > 0" class="pqs__save">Save {{ fmt(p.savings) }}</span>
      </div>
      <div class="pqs__actions">
        <button class="pqs__link" @click="emit('customize', p)">Customize</button>
        <q-btn unelevated no-caps class="pqs__cta" :disable="soldOut" :label="soldOut ? 'Sold out' : 'Select package'" @click="emit('select', p)" />
      </div>
    </footer>
  </div>
</template>

<style scoped>
.pqs { display: flex; flex-direction: column; width: 100%; max-width: 640px; max-height: 88vh; background: var(--ds-color-surface); border-radius: var(--ds-radius-lg); overflow: hidden; box-shadow: var(--ds-shadow-4); font-family: var(--ds-font-family); }
.pqs__bar { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--ds-color-border); flex: none; }
.pqs__title { margin: 0; font-size: 1.125rem; font-weight: 700; color: var(--ds-color-text); }
.pqs__close { width: 36px; height: 36px; border: 0; border-radius: 50%; background: var(--ds-palette-slate-100); color: var(--ds-color-text); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.pqs__close:hover { background: var(--ds-palette-slate-200); }

.pqs__body { flex: 1; min-height: 0; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 22px; }

/* Summary */
.pqs__summary { display: flex; gap: 18px; }
.pqs__photo { flex: 0 0 200px; height: 132px; border-radius: var(--ds-radius-md); overflow: hidden; background: var(--accent); }
.pqs__photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pqs__photo--empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.8); }
.pqs__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.pqs__theme { display: inline-flex; align-items: center; gap: 5px; align-self: flex-start; background: var(--ds-palette-slate-100); color: var(--ds-color-text); font-size: 0.75rem; font-weight: 700; padding: 3px 9px; border-radius: var(--ds-radius-pill); }
.pqs__name { margin: 0; font-size: 1.375rem; font-weight: 700; line-height: 1.2; color: var(--ds-color-text); }
.pqs__tagline { margin: 0; color: var(--ds-color-text-subtle); font-size: 0.9375rem; line-height: 1.45; }
.pqs__facts { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 2px; }
.pqs__fact { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--ds-color-text); }
.pqs__fact .q-icon { color: var(--ds-color-text-subtle); }
.pqs__swatch { width: 12px; height: 12px; border-radius: 3px; flex: none; }

/* Experiences carousel */
.pqs__sechead { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.pqs__sectitle { margin: 0; font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-text); }
.pqs__seccount { font-size: 0.8125rem; color: var(--ds-color-text-subtle); }
.pqs__carousel { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 6px; scroll-snap-type: x mandatory; }
.pqs__carousel::-webkit-scrollbar { height: 6px; }
.pqs__carousel::-webkit-scrollbar-thumb { background: var(--ds-color-border-bold); border-radius: 3px; }
.pqs__card { scroll-snap-align: start; flex: 0 0 172px; display: flex; flex-direction: column; gap: 10px; padding: 16px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); background: var(--ds-color-surface); }
.pqs__cardicon { width: 46px; height: 46px; border-radius: var(--ds-radius-md); display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent); }
.pqs__cardlabel { font-weight: 700; font-size: 0.9375rem; color: var(--ds-color-text); line-height: 1.3; flex: 1; }
.pqs__cardtag { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 700; color: var(--ds-color-text-positive, #1b7a3d); }
.pqs__noexp { color: var(--ds-color-text-subtle); font-size: 0.9375rem; margin: 0; }

/* Footer */
.pqs__foot { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 20px; border-top: 1px solid var(--ds-color-border); flex-wrap: wrap; }
.pqs__price { display: flex; align-items: baseline; gap: 10px; }
.pqs__was { color: var(--ds-color-text-subtle); text-decoration: line-through; }
.pqs__now { font-size: 1.375rem; font-weight: 700; color: var(--ds-color-text); }
.pqs__save { background: var(--ds-color-background-positive, #e6f4ea); color: var(--ds-color-text-positive, #1b7a3d); font-weight: 700; font-size: 0.8125rem; padding: 4px 10px; border-radius: var(--ds-radius-pill); }
.pqs__actions { display: flex; align-items: center; gap: 16px; margin-left: auto; }
.pqs__link { background: none; border: 0; padding: 0; font: inherit; font-weight: 700; color: var(--ds-color-text); text-decoration: underline; cursor: pointer; }
.pqs__cta { height: 46px; padding: 0 22px; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; }

@media (max-width: 560px) {
  .pqs__summary { flex-direction: column; }
  .pqs__photo { flex: none; width: 100%; height: 160px; }
}
</style>
