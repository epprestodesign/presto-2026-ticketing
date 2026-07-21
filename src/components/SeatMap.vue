<script setup>
// SeatMap — an interactive stadium/arena "bowl" for prototyping seat selection.
//
// PROTOTYPE NOTE: Ticketmaster's Discovery API provides only a STATIC seatmap
// image (see SeatMapStatic.vue) — no seat geometry or (usually) pricing. This
// bowl and its price tiers are generated deterministically from the real event
// (src/lib/seatmap.js) so you can prototype a clickable "pick your section"
// flow. For production seat selection, use Ticketmaster's Presence/Seat Map SDK.
import { computed, ref } from 'vue'
import { deriveTiers, buildBowlSections } from '../lib/seatmap.js'

const props = defineProps({
  // Pass either a normalized event (tiers derived) or explicit tiers.
  event: { type: Object, default: () => ({}) },
  tiers: { type: Array, default: null },
  kind: { type: String, default: 'stadium' },     // stadium | arena
  centerLabel: { type: String, default: 'FIELD' },  // e.g. FIELD / STAGE / COURT
  modelValue: { type: String, default: null },      // selected section id
})
const emit = defineEmits(['update:modelValue', 'select'])

const tiers = computed(() => props.tiers ?? deriveTiers(props.event, props.kind))
const sections = computed(() =>
  buildBowlSections(tiers.value, { seed: props.event?.id || 'bowl' })
)
const synthetic = computed(() => tiers.value.some((t) => t.synthetic))

const hoverId = ref(null)
const active = computed(() =>
  sections.value.find((s) => s.id === (hoverId.value ?? props.modelValue)) ?? null
)

function pick(section) {
  if (!section.available) return
  emit('update:modelValue', section.id)
  emit('select', { section, tier: tiers.value.find((t) => t.id === section.tierId) })
}
function fmt(n, cur = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <div class="seatmap">
    <svg class="seatmap__svg" viewBox="0 0 600 440" role="group" aria-label="Interactive seat map">
      <!-- Center field / stage -->
      <rect x="250" y="185" width="100" height="70" rx="8"
            class="seatmap__center" />
      <text x="300" y="224" text-anchor="middle" class="seatmap__center-label">{{ centerLabel }}</text>

      <!-- Sections -->
      <path
        v-for="s in sections"
        :key="s.id"
        :d="s.path"
        class="seatmap__section"
        :class="{
          'is-selected': s.id === modelValue,
          'is-unavailable': !s.available,
        }"
        :style="{ '--sec-color': `var(${s.colorVar})` }"
        :tabindex="s.available ? 0 : -1"
        :aria-label="`${s.tierName} section ${s.label}, ${s.available ? fmt(s.price, s.currency) : 'unavailable'}`"
        :aria-disabled="!s.available"
        @mouseenter="hoverId = s.id"
        @mouseleave="hoverId = null"
        @focus="hoverId = s.id"
        @blur="hoverId = null"
        @click="pick(s)"
        @keydown.enter.prevent="pick(s)"
        @keydown.space.prevent="pick(s)"
      />
    </svg>

    <!-- Live read-out of hovered / selected section -->
    <div class="seatmap__readout" aria-live="polite">
      <template v-if="active">
        <span class="seatmap__swatch" :style="{ background: `var(${active.colorVar})` }" />
        <strong>{{ active.tierName }}</strong>
        <span class="seatmap__sec">· Sec {{ active.label }}</span>
        <span v-if="active.available" class="seatmap__price">{{ fmt(active.price, active.currency) }}</span>
        <span v-else class="seatmap__soldout">Unavailable</span>
      </template>
      <span v-else class="seatmap__hint">Hover or tap a section to see pricing</span>
    </div>

    <!-- Tier legend -->
    <ul class="seatmap__legend">
      <li v-for="t in tiers" :key="t.id">
        <span class="seatmap__swatch" :style="{ background: `var(${t.colorVar})` }" />
        {{ t.name }}
        <span class="seatmap__from">from {{ fmt(t.price, t.currency) }}</span>
      </li>
    </ul>

    <p v-if="synthetic" class="seatmap__disclaimer">
      Prototype pricing &amp; sections — the Ticketmaster Discovery API provides the
      static seat map only, not live seat data.
    </p>
  </div>
</template>

<style scoped>
.seatmap { display: flex; flex-direction: column; gap: var(--ds-space-3); }
.seatmap__svg { width: 100%; height: auto; display: block; }

.seatmap__center { fill: var(--ds-color-background-neutral); stroke: var(--ds-color-border-bold); }
.seatmap__center-label {
  fill: var(--ds-color-text-subtle); font-family: var(--ds-font-family);
  font-size: 14px; font-weight: var(--ds-font-weight-bold); letter-spacing: 0.08em;
}

.seatmap__section {
  fill: var(--sec-color); fill-opacity: 0.5;
  stroke: var(--ds-color-surface); stroke-width: 1.5;
  cursor: pointer; transition: fill-opacity var(--ds-duration-fast) var(--ds-ease-standard);
  outline: none;
}
.seatmap__section:hover,
.seatmap__section:focus-visible { fill-opacity: 0.85; }
.seatmap__section.is-selected {
  fill-opacity: 1; stroke: var(--ds-color-text); stroke-width: 2;
}
.seatmap__section.is-unavailable {
  fill: var(--ds-palette-gray-300); fill-opacity: 0.5; cursor: not-allowed;
}

.seatmap__readout {
  display: flex; align-items: center; gap: var(--ds-space-2); min-height: 24px;
  font-family: var(--ds-font-family); font-size: var(--ds-font-size-sm); color: var(--ds-color-text);
}
.seatmap__sec { color: var(--ds-color-text-subtle); }
.seatmap__price { margin-left: auto; font-weight: var(--ds-font-weight-bold); }
.seatmap__soldout { margin-left: auto; color: var(--ds-color-text-subtle); }
.seatmap__hint { color: var(--ds-color-text-subtlest); }

.seatmap__legend {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-wrap: wrap; gap: var(--ds-space-2) var(--ds-space-4);
}
.seatmap__legend li {
  display: flex; align-items: center; gap: var(--ds-space-2);
  font-family: var(--ds-font-family); font-size: var(--ds-font-size-sm); color: var(--ds-color-text);
}
.seatmap__from { color: var(--ds-color-text-subtle); }
.seatmap__swatch {
  width: 12px; height: 12px; border-radius: var(--ds-radius-sm); display: inline-block; flex: none;
}
.seatmap__disclaimer {
  margin: 0; font-family: var(--ds-font-family);
  font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtlest);
}
</style>
