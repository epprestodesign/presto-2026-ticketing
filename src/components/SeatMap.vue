<script setup>
// SeatMap — an interactive stadium "bowl" for prototyping seat selection, tuned
// to an NFL venue (Gillette Stadium / New England Patriots by default). Renders a
// real football field (yard lines + team end zones) inside a rounded-rectangle
// bowl of numbered sections.
//
// PROTOTYPE NOTE: Ticketmaster's Discovery API provides only a STATIC seatmap
// image (see SeatMapStatic.vue) — no seat geometry or (usually) pricing. This
// bowl, its sections, and prices are generated deterministically from the real
// event (src/lib/seatmap.js). For production seat selection use Ticketmaster's
// Presence / Seat Map SDK.
import { computed, ref } from 'vue'
import { deriveTiers, buildBowlSections, BOWL } from '../lib/seatmap.js'

const props = defineProps({
  event: { type: Object, default: () => ({}) },
  tiers: { type: Array, default: null },
  kind: { type: String, default: 'stadium' },      // stadium | arena
  homeTeam: { type: String, default: null },         // overrides team parsed from event.name
  awayTeam: { type: String, default: null },
  modelValue: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue', 'select'])

const tiers = computed(() => props.tiers ?? deriveTiers(props.event, props.kind))
const sections = computed(() => buildBowlSections(tiers.value, { seed: props.event?.id || 'bowl' }))
const synthetic = computed(() => tiers.value.some((t) => t.synthetic))

// Parse "… Patriots v Colts" → home / away for the end-zone labels.
const teams = computed(() => {
  const name = (props.event?.name || '').replace(/^[^:]*:\s*/, '')
  const parts = name.split(/\s+(?:v\.?|vs\.?|at)\s+/i)
  const last = (s) => (s || '').trim().split(/\s+/).slice(-1)[0] || ''
  return {
    home: (props.homeTeam ?? last(parts[0])) || 'HOME',
    away: (props.awayTeam ?? last(parts[1])) || 'AWAY',
  }
})

// Field geometry from the shared bowl layout (so field + rings line up).
const F = BOWL
const field = computed(() => {
  const ezW = F.fieldA * 0.19
  const inner = F.fieldA - ezW
  const yardLines = Array.from({ length: 9 }, (_, i) => F.cx - inner + ((i + 1) * (inner * 2)) / 10)
  return { ezW, inner, yardLines }
})

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
    <svg class="seatmap__svg" viewBox="0 0 760 500" role="group" aria-label="Interactive stadium seat map">
      <!-- Sections (drawn first, field sits on top in the middle) -->
      <g class="seatmap__sections">
        <path
          v-for="s in sections"
          :key="s.id"
          :d="s.path"
          class="seatmap__section"
          :class="{ 'is-selected': s.id === modelValue, 'is-unavailable': !s.available }"
          :style="{ '--sec-color': `var(${s.colorVar})` }"
          :tabindex="s.available ? 0 : -1"
          :aria-label="`${s.tierName} section ${s.label}, ${s.available ? fmt(s.price, s.currency) : 'unavailable'}`"
          :aria-disabled="!s.available"
          @mouseenter="hoverId = s.id" @mouseleave="hoverId = null"
          @focus="hoverId = s.id" @blur="hoverId = null"
          @click="pick(s)" @keydown.enter.prevent="pick(s)" @keydown.space.prevent="pick(s)"
        />
      </g>
      <!-- Section numbers -->
      <g class="seatmap__labels" aria-hidden="true">
        <text v-for="s in sections" :key="s.id" :x="s.labelX" :y="s.labelY + 2.4">{{ s.label }}</text>
      </g>

      <!-- Football field -->
      <g class="seatmap__field" aria-hidden="true">
        <rect :x="F.cx - F.fieldA" :y="F.cy - F.fieldB" :width="F.fieldA * 2" :height="F.fieldB * 2" rx="6" class="seatmap__turf" />
        <!-- End zones -->
        <rect :x="F.cx - F.fieldA" :y="F.cy - F.fieldB" :width="field.ezW" :height="F.fieldB * 2" class="seatmap__ez seatmap__ez--home" />
        <rect :x="F.cx + F.fieldA - field.ezW" :y="F.cy - F.fieldB" :width="field.ezW" :height="F.fieldB * 2" class="seatmap__ez seatmap__ez--away" />
        <!-- Yard lines -->
        <line v-for="(x, i) in field.yardLines" :key="i" :x1="x" :y1="F.cy - F.fieldB + 4" :x2="x" :y2="F.cy + F.fieldB - 4" class="seatmap__yard" />
        <!-- Team names in the end zones -->
        <text :x="F.cx - F.fieldA + field.ezW / 2" :y="F.cy" class="seatmap__team"
              :transform="`rotate(-90 ${F.cx - F.fieldA + field.ezW / 2} ${F.cy})`">{{ teams.home.toUpperCase() }}</text>
        <text :x="F.cx + F.fieldA - field.ezW / 2" :y="F.cy" class="seatmap__team"
              :transform="`rotate(90 ${F.cx + F.fieldA - field.ezW / 2} ${F.cy})`">{{ teams.away.toUpperCase() }}</text>
      </g>
    </svg>

    <!-- Live read-out -->
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
        {{ t.name }} <span class="seatmap__from">from {{ fmt(t.price, t.currency) }}</span>
      </li>
    </ul>

    <p v-if="synthetic" class="seatmap__disclaimer">
      Prototype sections &amp; pricing — the Ticketmaster Discovery API provides the
      static seat map only, not live seat data.
    </p>
  </div>
</template>

<style scoped>
.seatmap { display: flex; flex-direction: column; gap: var(--ds-space-3); font-family: var(--ds-font-family); }
.seatmap__svg { width: 100%; height: auto; display: block; }

.seatmap__section {
  fill: var(--sec-color); fill-opacity: 0.82;
  stroke: var(--ds-color-surface); stroke-width: 1; stroke-linejoin: round;
  cursor: pointer; outline: none;
  transition: fill-opacity var(--ds-duration-fast) var(--ds-ease-standard), filter var(--ds-duration-fast) var(--ds-ease-standard);
}
.seatmap__section:hover,
.seatmap__section:focus-visible { fill-opacity: 1; filter: brightness(1.05); }
.seatmap__section.is-selected { fill-opacity: 1; stroke: var(--ds-color-text); stroke-width: 2.5; }
.seatmap__section.is-unavailable { fill: var(--ds-palette-gray-300); fill-opacity: 0.55; cursor: not-allowed; }

.seatmap__labels text {
  font-size: 7px; fill: #fff; fill-opacity: 0.85; text-anchor: middle;
  pointer-events: none; font-weight: 600; paint-order: stroke;
}

.seatmap__turf { fill: #2f8b4c; }
.seatmap__ez--home { fill: var(--ds-palette-navy-900, #01113e); }
.seatmap__ez--away { fill: #7a1420; }
.seatmap__yard { stroke: #ffffff; stroke-opacity: 0.4; stroke-width: 1; }
.seatmap__team { fill: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.06em; text-anchor: middle; dominant-baseline: middle; }

.seatmap__readout {
  display: flex; align-items: center; gap: var(--ds-space-2); min-height: 24px;
  font-size: var(--ds-font-size-sm); color: var(--ds-color-text);
}
.seatmap__sec { color: var(--ds-color-text-subtle); }
.seatmap__price { margin-left: auto; font-weight: var(--ds-font-weight-bold); }
.seatmap__soldout { margin-left: auto; color: var(--ds-color-text-subtle); }
.seatmap__hint { color: var(--ds-color-text-subtlest); }

.seatmap__legend { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--ds-space-2) var(--ds-space-4); }
.seatmap__legend li { display: flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-sm); color: var(--ds-color-text); }
.seatmap__from { color: var(--ds-color-text-subtle); }
.seatmap__swatch { width: 12px; height: 12px; border-radius: var(--ds-radius-sm); display: inline-block; flex: none; }
.seatmap__disclaimer { margin: 0; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtlest); }
</style>
