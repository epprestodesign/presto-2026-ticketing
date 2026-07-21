<script setup>
// PriceHistogram — a compact price-distribution bar chart (SeatGeek-style),
// used in listing filters. Display-focused primitive: pass bin counts + the
// price range they span; optionally pass a selected [min,max] to highlight the
// in-range bars and dim the rest. Single brand hue, theme-aware via DS tokens.
import { computed } from 'vue'

const props = defineProps({
  bins: { type: Array, required: true },      // bar heights (counts)
  min: { type: Number, required: true },       // price at the left edge
  max: { type: Number, required: true },       // price at the right edge
  selectedMin: { type: Number, default: null },
  selectedMax: { type: Number, default: null },
  height: { type: Number, default: 56 },
  currency: { type: String, default: 'USD' },
})

const peak = computed(() => Math.max(1, ...props.bins))
const lo = computed(() => props.selectedMin ?? props.min)
const hi = computed(() => props.selectedMax ?? props.max)

function binPrice(i) {
  const span = props.max - props.min || 1
  return props.min + ((i + 0.5) / props.bins.length) * span
}
const bars = computed(() =>
  props.bins.map((c, i) => ({
    h: Math.max(3, Math.round((c / peak.value) * props.height)),
    inRange: binPrice(i) >= lo.value && binPrice(i) <= hi.value,
  }))
)
function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: props.currency, maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <figure class="phist" :aria-label="`Price distribution from ${fmt(min)} to ${fmt(max)}`">
    <div class="phist__bars" :style="{ height: height + 'px' }">
      <span
        v-for="(b, i) in bars"
        :key="i"
        class="phist__bar"
        :class="{ 'is-muted': !b.inRange }"
        :style="{ height: b.h + 'px' }"
      />
    </div>
    <figcaption class="phist__axis">
      <span>{{ fmt(lo) }}</span>
      <span>{{ fmt(hi) }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.phist { margin: 0; font-family: var(--ds-font-family); }
.phist__bars { display: flex; align-items: flex-end; gap: 2px; }
.phist__bar {
  flex: 1; border-radius: 2px 2px 0 0; background: var(--ds-color-background-brand-bold);
  transition: opacity var(--ds-duration-fast) var(--ds-ease-standard);
}
.phist__bar.is-muted { background: var(--ds-color-border-bold); opacity: 0.6; }
.phist__axis {
  display: flex; justify-content: space-between; margin-top: 6px;
  font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle);
}
</style>
