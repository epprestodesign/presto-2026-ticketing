<script setup>
// PackageQuickViewShowcase — a package browser patterned directly after the
// Browse Hotels AvailabilityDialog: a compact high-level summary of the offering
// (photo · theme · name · meta · quick facts) above a horizontal carousel that
// SHOWCASES the available experience packages as full PackageCards (each with its
// own guests stepper + Select CTA), with prev/next arrows and scroll-snap. Where
// AvailabilityDialog pairs a hotel summary with a RoomsCarousel, this pairs an
// offering summary with a carousel of packages. Rendered as content inside a
// <q-dialog> by the parent.
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import PackageCard from './PackageCard.vue'

const props = defineProps({
  // The packages shown in the carousel.
  packages: { type: Array, default: () => [] },
  // High-level offering summary (with sensible fallbacks derived from packages).
  title: { type: String, default: 'Experience packages' },
  theme: { type: String, default: '' },
  meta: { type: String, default: '' },
  tagline: { type: String, default: 'Pre-built ticket + hotel + signature experience bundles — pick the one that fits your group.' },
  image: { type: String, default: '' },
  icon: { type: String, default: 'confirmation_number' },
  accentVar: { type: String, default: '--ds-palette-navy-700' },
  currency: { type: String, default: 'USD' },
  carouselTitle: { type: String, default: 'Choose your package' },
  carouselSubtitle: { type: String, default: '' },
})
const emit = defineEmits(['close', 'select', 'title'])

const list = computed(() => props.packages || [])
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: props.currency, maximumFractionDigits: 0 }).format(n || 0)

// Header photo falls back to the first package's hero image.
const heroImage = computed(() => props.image || list.value.find((p) => p.image)?.image || '')
// Quick facts: how many packages, and the best available savings across them.
const bestSavings = computed(() => list.value.reduce((m, p) => (!p.soldOut && p.savings > m ? p.savings : m), 0))
const startingFrom = computed(() => {
  const prices = list.value.filter((p) => !p.soldOut).map((p) => p.packagePrice)
  return prices.length ? Math.min(...prices) : 0
})

// --- Carousel scroll (mirrors RoomsCarousel) ------------------------------
const track = ref(null)
const scrollable = ref(false)
const atStart = ref(true)
const atEnd = ref(false)
const STEP = (320 + 18) * 1.5 // one card + track gap, ~1.5 cards per click
const update = () => {
  const el = track.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  scrollable.value = max > 1
  atStart.value = el.scrollLeft <= 1
  atEnd.value = el.scrollLeft >= max - 1
}
const scroll = (dir) => track.value?.scrollBy({ left: dir * STEP, behavior: 'smooth' })
let ro
onMounted(async () => {
  await nextTick()
  update()
  if (window.ResizeObserver) { ro = new ResizeObserver(update); ro.observe(track.value) }
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div class="pqs">
    <!-- Title bar -->
    <header class="pqs__bar">
      <h2 class="pqs__title">{{ title }}</h2>
      <button class="pqs__close" aria-label="Close" @click="emit('close')"><q-icon name="close" size="22px" /></button>
    </header>

    <div class="pqs__body">
      <!-- High-level offering summary -->
      <div class="pqs__summary">
        <div class="pqs__photo" :style="{ '--accent': `var(${accentVar})` }">
          <img v-if="heroImage" :src="heroImage" :alt="title" />
          <div v-else class="pqs__photo--empty"><q-icon :name="icon" size="28px" /></div>
        </div>
        <div class="pqs__info">
          <span v-if="theme" class="pqs__theme"><q-icon :name="icon" size="14px" /> {{ theme }}</span>
          <h3 class="pqs__name">{{ title }}</h3>
          <p v-if="meta" class="pqs__meta">{{ meta }}</p>
          <p v-if="tagline" class="pqs__tagline">{{ tagline }}</p>
          <div class="pqs__facts">
            <span class="pqs__fact"><q-icon name="apps" size="16px" /> {{ list.length }} package{{ list.length === 1 ? '' : 's' }}</span>
            <span v-if="startingFrom" class="pqs__fact"><q-icon name="sell" size="16px" /> From {{ fmt(startingFrom) }}</span>
            <span v-if="bestSavings > 0" class="pqs__fact pqs__fact--save"><q-icon name="savings" size="16px" /> Save up to {{ fmt(bestSavings) }}</span>
          </div>
        </div>
      </div>

      <!-- Packages carousel -->
      <section class="pqs__carsec">
        <header class="pqs__carhead">
          <div class="pqs__carheading">
            <h4 class="pqs__cartitle">{{ carouselTitle }}</h4>
            <p v-if="carouselSubtitle" class="pqs__carsub">{{ carouselSubtitle }}</p>
          </div>
          <div v-if="scrollable" class="pqs__nav">
            <button type="button" class="pqs__arrow" :disabled="atStart" aria-label="Previous packages" @click="scroll(-1)"><q-icon name="chevron_left" size="22px" /></button>
            <button type="button" class="pqs__arrow" :disabled="atEnd" aria-label="More packages" @click="scroll(1)"><q-icon name="chevron_right" size="22px" /></button>
          </div>
        </header>

        <div v-if="list.length" ref="track" class="pqs__track" @scroll="update">
          <div v-for="p in list" :key="p.id" class="pqs__item">
            <PackageCard :pkg="p" @select="emit('select', $event)" @title="emit('title', $event)" />
          </div>
        </div>
        <p v-else class="pqs__empty">No packages available.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.pqs { display: flex; flex-direction: column; width: 100%; max-width: 860px; max-height: 90vh; background: var(--ds-color-surface); border-radius: var(--ds-radius-lg); overflow: hidden; box-shadow: var(--ds-shadow-4); font-family: var(--ds-font-family); }
.pqs__bar { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--ds-color-border); flex: none; }
.pqs__title { margin: 0; font-size: 1.125rem; font-weight: 700; color: var(--ds-color-text); }
.pqs__close { width: 36px; height: 36px; border: 0; border-radius: 50%; background: var(--ds-palette-slate-100); color: var(--ds-color-text); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.pqs__close:hover { background: var(--ds-palette-slate-200); }

.pqs__body { flex: 1; min-height: 0; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 24px; }

/* Summary */
.pqs__summary { display: flex; gap: 18px; }
.pqs__photo { flex: 0 0 220px; height: 140px; border-radius: var(--ds-radius-md); overflow: hidden; background: var(--accent); }
.pqs__photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pqs__photo--empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.8); }
.pqs__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.pqs__theme { display: inline-flex; align-items: center; gap: 5px; align-self: flex-start; background: var(--ds-palette-slate-100); color: var(--ds-color-text); font-size: 0.75rem; font-weight: 700; padding: 3px 9px; border-radius: var(--ds-radius-pill); }
.pqs__name { margin: 0; font-size: 1.375rem; font-weight: 700; line-height: 1.2; color: var(--ds-color-text); }
.pqs__meta { margin: 0; color: var(--ds-color-text); font-size: 0.9375rem; font-weight: 600; }
.pqs__tagline { margin: 0; color: var(--ds-color-text-subtle); font-size: 0.9375rem; line-height: 1.45; }
.pqs__facts { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 4px; }
.pqs__fact { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--ds-color-text); }
.pqs__fact .q-icon { color: var(--ds-color-text-subtle); }
.pqs__fact--save { color: var(--ds-color-text-positive, #1b7a3d); font-weight: 700; }
.pqs__fact--save .q-icon { color: currentColor; }

/* Packages carousel — mirrors RoomsCarousel */
.pqs__carsec { display: flex; flex-direction: column; gap: 14px; }
.pqs__carhead { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
.pqs__cartitle { margin: 0; font-size: 1.1875rem; font-weight: 700; color: var(--ds-color-text); }
.pqs__carsub { margin: 4px 0 0; color: var(--ds-color-text-subtle); font-size: 0.9375rem; }
.pqs__nav { display: flex; gap: 8px; flex: 0 0 auto; }
.pqs__arrow { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--ds-color-border-bold); background: var(--ds-color-surface); color: var(--ds-color-text); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background var(--ds-duration-fast) var(--ds-ease-standard); }
.pqs__arrow:hover:not(:disabled) { background: var(--ds-color-surface-sunken); }
.pqs__arrow:disabled { opacity: 0.4; cursor: default; }

.pqs__track { display: flex; gap: 18px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-left: 2px; padding: 4px 2px 8px; margin: -4px -2px -8px; scrollbar-width: thin; }
.pqs__item { scroll-snap-align: start; flex: 0 0 320px; }
.pqs__item > :deep(.pkg) { height: 100%; }
.pqs__empty { color: var(--ds-color-text-subtle); font-size: 0.9375rem; margin: 0; }

@media (max-width: 620px) {
  .pqs__summary { flex-direction: column; }
  .pqs__photo { flex: none; width: 100%; height: 170px; }
  .pqs__item { flex-basis: 84%; }
}
</style>
