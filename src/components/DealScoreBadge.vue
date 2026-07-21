<script setup>
// DealScoreBadge — SeatGeek-style value indicator: a numbered score (1–10) with
// a label (Amazing / Great / Good / …), colored by how good the deal is. Also
// supports flag variants ("Best in section", "Cheapest in section", "Best deal").
import { computed } from 'vue'
import { dealMeta } from '../lib/seatListings.js'

const props = defineProps({
  score: { type: Number, default: null },        // 1–10; when set, renders the numbered badge
  label: { type: String, default: null },         // overrides the auto label
  flag: { type: String, default: null },          // 'best-in-section' | 'cheapest-in-section' | 'best-deal'
  size: { type: String, default: 'md' },          // sm | md
})

const meta = computed(() => (props.score != null ? dealMeta(props.score) : null))
const text = computed(() => props.label ?? meta.value?.label ?? '')

const FLAGS = {
  'best-in-section': { text: 'Best in section', icon: 'local_fire_department' },
  'cheapest-in-section': { text: 'Cheapest in section', icon: 'payments' },
  'best-deal': { text: 'Best deal', icon: 'local_fire_department' },
}
const flag = computed(() => (props.flag ? FLAGS[props.flag] : null))
</script>

<template>
  <span v-if="flag" class="dealflag" :class="`dealflag--${size}`">
    <q-icon :name="flag.icon" size="14px" />{{ flag.text }}
  </span>
  <span
    v-else-if="score != null"
    class="dealscore"
    :class="`dealscore--${size}`"
    :style="{ '--deal-color': `var(${meta.colorVar})` }"
    :aria-label="`Deal score ${score} out of 10, ${text}`"
  >
    <span class="dealscore__num">{{ score }}</span>
    <span class="dealscore__label">{{ text }}</span>
  </span>
</template>

<style scoped>
.dealscore { display: inline-flex; align-items: center; gap: 6px; font-family: var(--ds-font-family); }
.dealscore__num {
  background: var(--deal-color); color: #fff; border-radius: var(--ds-radius-sm);
  font-weight: var(--ds-font-weight-bold); line-height: 1; display: inline-flex;
  align-items: center; justify-content: center;
}
.dealscore__label { color: var(--deal-color); font-weight: var(--ds-font-weight-bold); }
.dealscore--md .dealscore__num { min-width: 22px; height: 22px; padding: 0 5px; font-size: var(--ds-font-size-sm); }
.dealscore--md .dealscore__label { font-size: var(--ds-font-size-sm); }
.dealscore--sm .dealscore__num { min-width: 18px; height: 18px; padding: 0 4px; font-size: 11px; }
.dealscore--sm .dealscore__label { font-size: 11px; }

.dealflag {
  display: inline-flex; align-items: center; gap: 4px; font-family: var(--ds-font-family);
  color: var(--ds-color-text-warning); font-weight: var(--ds-font-weight-bold);
}
.dealflag--md { font-size: var(--ds-font-size-sm); }
.dealflag--sm { font-size: 11px; }
</style>
