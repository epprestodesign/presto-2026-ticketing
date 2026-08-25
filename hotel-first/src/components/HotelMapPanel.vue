<script setup>
// The full map of the Orlando block — as a PAGE, not a pop-up.
//
// This replaced a `DsModal size="fullscreen"` on Aug 25. The map was the one
// thing in this prototype that took over the screen in a layer above it, and a
// fullscreen dialog is the worst version of that: it is the size of a page, it
// is a destination the guest spends real time in, and the only thing the modal
// wrapper adds is a scrim, a trapped scroll position and an X. Browse now simply
// SWITCHES: the results column becomes the map, the filter rail stays where it
// is and keeps working, and "Back to list" switches back.
//
// Two things fall out of that which the modal could not do, and they are the
// reason this is better rather than merely flatter:
//   • The rail is still on screen, so filtering and the map are the same view.
//     In the modal the rail was behind the scrim and the map showed pins the
//     guest could no longer filter.
//   • The page keeps its nav, its stepper and its URL. Nothing about the map is
//     a mode you can get stuck inside.
//
// Radius is edited here and committed by the rail's Apply, exactly like every
// other field in the rail — a map that silently re-filtered the results behind
// it would be the one control in the rail that doesn't wait for Apply.
import { toRef } from 'vue'
import HotelMap from '@lib/components/HotelMap.vue'
import { useMapHotels, eventLocation } from '../mapdata.js'

const props = defineProps({
  hotels: { type: Array, default: () => [] },
  radius: { type: Number, default: 3 },
})
const emit = defineEmits(['update:radius', 'apply', 'close'])

const { mapHotels, imgReady } = useMapHotels(toRef(props, 'hotels'))
</script>

<template>
  <section class="mpanel" aria-label="Hotels map">
    <header class="mpanel__head">
      <div class="mpanel__titles">
        <h2 class="mpanel__h2">Hotels near the Convention Center</h2>
        <p class="mpanel__sub">{{ mapHotels.length }} block hotels · searching within {{ radius }} mi</p>
      </div>
      <button type="button" class="mpanel__back" @click="emit('close')">
        <q-icon name="arrow_back" size="18px" /> Back to list
      </button>
    </header>

    <div class="mpanel__map">
      <hotel-map
        :key="imgReady"
        :hotels="mapHotels" :event-location="eventLocation" :zoom="12" height="100%"
        radius-unit="mi" :radius-min="0.25" :radius-step="0.25"
        :search-radius="radius" @update:search-radius="emit('update:radius', $event)" cluster
      />
    </div>

    <footer class="mpanel__foot">
      <div class="mpanel__radius">
        <div class="mpanel__radius-head"><span>Search radius</span><strong>{{ radius }} mi</strong></div>
        <q-slider
          :model-value="radius" :min="0.25" :max="10" :step="0.25"
          :label-value="radius + ' mi'" label color="dark" track-color="grey-4"
          @update:model-value="emit('update:radius', $event)"
        />
      </div>
      <button type="button" class="mpanel__apply" @click="emit('apply')">
        <q-icon name="tune" size="18px" /> Apply radius &amp; see results
      </button>
    </footer>
  </section>
</template>

<style scoped>
.mpanel { display: flex; flex-direction: column; background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); overflow: hidden; }

.mpanel__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 16px 20px; border-bottom: 1px solid var(--ds-color-border); }
.mpanel__h2 { margin: 0; font-size: 1.125rem; font-weight: 800; color: var(--ds-color-text); }
.mpanel__sub { margin: 2px 0 0; font-size: 0.875rem; color: var(--ds-color-text-subtle); }
.mpanel__back { display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 14px; flex: none; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button); background: var(--ds-color-surface); color: var(--ds-color-text); font: inherit; font-weight: 700; font-size: 0.875rem; cursor: pointer; }
.mpanel__back:hover { background: var(--ds-palette-slate-100); }

/* Tall enough to be worth switching to — the modal was full-screen, and a map
   that lands at 200px would make the switch feel like a downgrade. */
.mpanel__map { height: clamp(420px, 62vh, 680px); }

.mpanel__foot { display: flex; align-items: flex-end; gap: 20px; flex-wrap: wrap; padding: 12px 20px 16px; border-top: 1px solid var(--ds-color-border); }
.mpanel__radius { flex: 1; min-width: 240px; }
.mpanel__radius-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
.mpanel__radius-head span { font-weight: 700; color: var(--ds-color-text); }
.mpanel__radius-head strong { color: var(--ds-color-text); font-variant-numeric: tabular-nums; }
.mpanel__apply { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 18px; flex: none; border: 0; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
</style>
