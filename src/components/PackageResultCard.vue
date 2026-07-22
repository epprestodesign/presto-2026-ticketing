<script setup>
// PackageResultCard — a horizontal package result row for the Browse Packages
// list, mirroring the Browse Hotels HotelCardGroup layout: photo left, details
// middle (theme · name · inclusions), price + CTAs right. Emits `quickview`
// (open the condensed dialog), `customize` (full booking dialog), and `select`.
import { computed } from 'vue'
import BundleSavingsBadge from './BundleSavingsBadge.vue'

const props = defineProps({
  pkg: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['quickview', 'customize', 'select'])

const p = computed(() => props.pkg)
const soldOut = computed(() => p.value.soldOut)
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: p.value.currency || 'USD', maximumFractionDigits: 0 }).format(n || 0)
const expCount = computed(() => (p.value.experiences || []).length)
</script>

<template>
  <div class="prc" :class="{ 'is-selected': selected, 'is-sold': soldOut }">
    <!-- Photo -->
    <button type="button" class="prc__media" :style="{ '--accent': `var(${p.accentVar || '--ds-palette-navy-700'})` }" @click="emit('quickview', p)">
      <img v-if="p.image" :src="p.image" :alt="p.name" loading="lazy" />
      <div v-else class="prc__media--empty"><q-icon name="confirmation_number" size="30px" /></div>
      <span class="prc__theme"><q-icon :name="p.icon || 'star'" size="14px" /> {{ p.theme }}</span>
      <span v-if="soldOut" class="prc__soldtag">Sold out</span>
    </button>

    <!-- Details -->
    <div class="prc__body">
      <button type="button" class="prc__name" @click="emit('quickview', p)">{{ p.name }}</button>
      <p v-if="p.tagline" class="prc__tagline">{{ p.tagline }}</p>
      <ul class="prc__incl">
        <li><span class="prc__swatch" :style="{ background: `var(${p.ticket.colorVar})` }" /><strong>{{ p.ticket.tierName }}</strong><template v-if="p.quantity > 1"> ×{{ p.quantity }}</template></li>
        <li v-if="p.hotel"><q-icon name="hotel" size="15px" /> {{ p.hotel.name }} · {{ p.nights }}n</li>
        <li v-if="expCount"><q-icon name="auto_awesome" size="15px" /> {{ expCount }} experience{{ expCount === 1 ? '' : 's' }}</li>
      </ul>
    </div>

    <!-- Price + actions -->
    <div class="prc__aside">
      <BundleSavingsBadge v-if="!soldOut && p.savings > 0" :amount="p.savings" size="sm" />
      <div class="prc__price">
        <span v-if="p.componentsTotal > p.packagePrice" class="prc__was">{{ fmt(p.componentsTotal) }}</span>
        <span class="prc__now">{{ fmt(p.packagePrice) }}</span>
        <span class="prc__unit">package total</span>
      </div>
      <button class="prc__quick" @click="emit('quickview', p)">Quick view</button>
      <q-btn unelevated no-caps class="prc__cta" :disable="soldOut" :label="soldOut ? 'Sold out' : 'Select'" @click="emit('select', p)" />
    </div>
  </div>
</template>

<style scoped>
.prc { display: grid; grid-template-columns: 220px minmax(0, 1fr) 200px; gap: 0; background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); overflow: hidden; font-family: var(--ds-font-family); transition: border-color var(--ds-duration-fast) var(--ds-ease-standard), box-shadow var(--ds-duration-fast) var(--ds-ease-standard); }
.prc:hover { border-color: var(--ds-color-border-bold); box-shadow: var(--ds-shadow-2, 0 4px 12px rgba(0,0,0,.08)); }
.prc.is-selected { border-color: var(--ds-color-border-brand); box-shadow: 0 0 0 1px var(--ds-color-border-brand); }
.prc.is-sold { opacity: 0.72; }

.prc__media { position: relative; border: 0; padding: 0; cursor: pointer; background: var(--accent); min-height: 168px; overflow: hidden; }
.prc__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.prc__media--empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.8); }
.prc__theme { position: absolute; left: 10px; top: 10px; display: inline-flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.6); color: #fff; font-size: 0.75rem; font-weight: 700; padding: 4px 9px; border-radius: var(--ds-radius-pill); }
.prc__soldtag { position: absolute; left: 10px; bottom: 10px; background: var(--ds-palette-slate-800, #1f2937); color: #fff; font-size: 0.75rem; font-weight: 700; padding: 3px 9px; border-radius: var(--ds-radius-pill); }

.prc__body { padding: 16px 18px; min-width: 0; display: flex; flex-direction: column; }
.prc__name { text-align: left; background: none; border: 0; padding: 0; font: inherit; font-size: 1.125rem; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }
.prc__name:hover { color: var(--ds-color-text-brand); text-decoration: underline; }
.prc__tagline { margin: 4px 0 10px; color: var(--ds-color-text-subtle); font-size: 0.9375rem; line-height: 1.4; }
.prc__incl { list-style: none; margin: auto 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 14px; }
.prc__incl li { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--ds-color-text); }
.prc__incl .q-icon { color: var(--ds-color-text-subtle); }
.prc__swatch { width: 12px; height: 12px; border-radius: 3px; flex: none; }

.prc__aside { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 8px; padding: 16px 18px; border-left: 1px solid var(--ds-color-border); text-align: right; }
.prc__price { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.15; }
.prc__was { color: var(--ds-color-text-subtle); text-decoration: line-through; font-size: 0.875rem; }
.prc__now { font-size: 1.375rem; font-weight: 700; color: var(--ds-color-text); }
.prc__unit { font-size: 0.75rem; color: var(--ds-color-text-subtle); }
.prc__quick { background: none; border: 0; padding: 0; font: inherit; font-weight: 700; font-size: 0.875rem; color: var(--ds-color-text); text-decoration: underline; cursor: pointer; }
.prc__cta { width: 100%; height: 42px; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; }

@media (max-width: 720px) {
  .prc { grid-template-columns: 1fr; }
  .prc__media { min-height: 160px; }
  .prc__aside { border-left: 0; border-top: 1px solid var(--ds-color-border); align-items: stretch; text-align: left; }
  .prc__price { align-items: flex-start; }
}
</style>
