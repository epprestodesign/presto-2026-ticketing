<script setup>
// SeatMapStatic — Tier A: renders the REAL static seat map image that the
// Ticketmaster Discovery API returns on `event.seatmap.staticUrl`, plus a price
// legend. This is 100% real data (the image is Ticketmaster's own venue map);
// it is not clickable. For an interactive prototype layer, see SeatMap.vue.
import { computed, ref } from 'vue'
import { deriveTiers } from '../lib/seatmap.js'

const props = defineProps({
  event: { type: Object, required: true },        // normalized event (needs seatmapUrl)
  kind: { type: String, default: 'stadium' },
  showLegend: { type: Boolean, default: true },
})

const tiers = computed(() => deriveTiers(props.event, props.kind))
const url = computed(() => props.event?.seatmapUrl ?? null)
const failed = ref(false)

function fmt(n, cur = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <figure class="smstatic">
    <div class="smstatic__frame">
      <img
        v-if="url && !failed"
        :src="url"
        :alt="`Official seat map for ${event.name}`"
        class="smstatic__img"
        loading="lazy"
        @error="failed = true"
      />
      <div v-else class="smstatic__fallback">
        <q-icon name="map" size="28px" />
        <p>No official seat map available for this event.</p>
      </div>
    </div>

    <figcaption class="smstatic__caption">
      Official Ticketmaster seat map · {{ event.venue?.name || 'Venue' }}
    </figcaption>

    <ul v-if="showLegend" class="smstatic__legend">
      <li v-for="t in tiers" :key="t.id">
        <span class="smstatic__swatch" :style="{ background: `var(${t.colorVar})` }" />
        {{ t.name }} <span class="smstatic__from">from {{ fmt(t.price, t.currency) }}</span>
      </li>
    </ul>
  </figure>
</template>

<style scoped>
.smstatic { margin: 0; display: flex; flex-direction: column; gap: var(--ds-space-3); }
.smstatic__frame {
  background: var(--ds-color-surface-sunken); border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-lg); overflow: hidden; display: flex;
  align-items: center; justify-content: center; min-height: 240px;
}
.smstatic__img { width: 100%; height: auto; display: block; }
.smstatic__fallback {
  display: flex; flex-direction: column; align-items: center; gap: var(--ds-space-2);
  color: var(--ds-color-text-subtle); padding: var(--ds-space-6);
  font-family: var(--ds-font-family); font-size: var(--ds-font-size-sm);
}
.smstatic__caption {
  font-family: var(--ds-font-family); font-size: var(--ds-font-size-sm);
  color: var(--ds-color-text-subtle);
}
.smstatic__legend {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-wrap: wrap; gap: var(--ds-space-2) var(--ds-space-4);
}
.smstatic__legend li {
  display: flex; align-items: center; gap: var(--ds-space-2);
  font-family: var(--ds-font-family); font-size: var(--ds-font-size-sm); color: var(--ds-color-text);
}
.smstatic__from { color: var(--ds-color-text-subtle); }
.smstatic__swatch { width: 12px; height: 12px; border-radius: var(--ds-radius-sm); display: inline-block; flex: none; }
</style>
