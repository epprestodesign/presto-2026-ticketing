<script setup>
// TicketMap — the SeatGeek-style ticket browse experience for the Patriots game,
// built from our own assets: a two-pane layout with an "Authenticated NFL
// Tickets" listings rail on the left (filter bar + sort + SeatListingRow list)
// and the interactive Gillette VenueMap with price pins on the right. Selecting a
// listing (or a map pin) drives the sticky "Continue" summary. Prototype data.
import { ref, computed } from 'vue'
import SeatListingRow from './SeatListingRow.vue'
import VenueMap from './VenueMap.vue'
import QuantityStepper from './QuantityStepper.vue'

const props = defineProps({
  event: { type: Object, required: true },
  listings: { type: Array, default: () => [] }, // generateListings() items
  pins: { type: Array, default: () => [] },      // gillettePins()
  host: { type: String, default: 'EventPipe' },
})
const emit = defineEmits(['continue'])

const money = (n) => '$' + Number(Math.round(n) ?? 0).toLocaleString('en-US')

// --- Filters + sort ---
const qty = ref(2)
const sortBy = ref('top') // top | price-asc | price-desc | section
const SORTS = { top: 'Top picks', 'price-asc': 'Price · low to high', 'price-desc': 'Price · high to low', section: 'Section' }
const seatPerks = ref(false)
const instant = ref(false)

const filtered = computed(() => {
  let out = [...props.listings]
  if (seatPerks.value) out = out.filter((l) => (l.perks || []).length)
  if (instant.value) out = out.filter((l) => l.instant !== false)
  if (sortBy.value === 'price-asc') out.sort((a, b) => a.priceWithFees - b.priceWithFees)
  else if (sortBy.value === 'price-desc') out.sort((a, b) => b.priceWithFees - a.priceWithFees)
  else if (sortBy.value === 'section') out.sort((a, b) => String(a.section).localeCompare(String(b.section)))
  return out
})

// --- Selection ---
const selectedId = ref(null)
const selected = computed(() => filtered.value.find((l) => l.id === selectedId.value) || null)
const pick = (l) => { selectedId.value = l.id }
// Map v-model — clicking a pin selects the listing whose section matches.
const mapSel = ref(null)
const onMap = (pinId) => {
  mapSel.value = pinId
  const pin = props.pins.find((p) => p.id === pinId)
  if (!pin) return
  const hit = filtered.value.find((l) => String(l.section) === String(pin.label).replace(/[^0-9]/g, '')) || filtered.value[0]
  if (hit) selectedId.value = hit.id
}
</script>

<template>
  <div class="tm">
    <!-- LEFT: listings rail -->
    <aside class="tm__rail">
      <!-- filter bar -->
      <div class="tm__filters">
        <div class="tm__qty"><q-icon name="tune" size="18px" /><quantity-stepper v-model="qty" :min="1" :max="10" size="sm" /><span class="tm__qtylabel">ticket{{ qty === 1 ? '' : 's' }}</span></div>
        <button class="tm__chip" :class="{ 'is-on': false }">Price <span>Incl. fees</span></button>
        <button class="tm__chip" :class="{ 'is-on': seatPerks }" @click="seatPerks = !seatPerks">Seat Perks</button>
        <button class="tm__chip" :class="{ 'is-on': instant }" @click="instant = !instant"><q-icon name="bolt" size="16px" /> Instant delivery</button>
      </div>

      <!-- header + sort -->
      <div class="tm__railhead">
        <div class="tm__railtitle"><q-icon name="verified" size="18px" /> Authenticated NFL Tickets</div>
        <label class="tm__sort">
          <select v-model="sortBy"><option v-for="(label, val) in SORTS" :key="val" :value="val">{{ label }}</option></select>
          <q-icon name="unfold_more" size="16px" />
        </label>
      </div>
      <p class="tm__note">{{ filtered.length }} listings held for {{ host }} guests · {{ event.venue?.name }}</p>

      <!-- listings -->
      <div class="tm__list">
        <SeatListingRow v-for="l in filtered" :key="l.id" :listing="l" :selected="l.id === selectedId" @select="pick" />
      </div>

      <!-- sticky continue -->
      <div v-if="selected" class="tm__foot">
        <div class="tm__footinfo">
          <span class="tm__footsec">Section {{ selected.section }} · Row {{ selected.row }}</span>
          <span class="tm__footprice">{{ money(selected.priceWithFees) }} <small>/ea · incl. fees</small></span>
        </div>
        <q-btn unelevated no-caps class="tm__cta" :label="`Continue · ${money(selected.priceWithFees * qty)}`" @click="emit('continue', { listing: selected, quantity: qty })" />
      </div>
    </aside>

    <!-- RIGHT: interactive map -->
    <div class="tm__mapwrap">
      <VenueMap :event="event" :pins="pins" v-model="mapSel" @update:modelValue="onMap" />
    </div>
  </div>
</template>

<style scoped>
.tm { display: grid; grid-template-columns: minmax(340px, 440px) 1fr; height: 100vh; font-family: var(--ds-font-family); background: var(--ds-color-surface); }

.tm__rail { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid var(--ds-color-border); }
.tm__filters { display: flex; align-items: center; gap: 8px; padding: 14px 16px; overflow-x: auto; border-bottom: 1px solid var(--ds-color-border); }
.tm__filters::-webkit-scrollbar { height: 0; }
.tm__qty { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 8px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-pill); flex: none; }
.tm__qty > .q-icon { color: var(--ds-color-text); }
.tm__qtylabel { font-size: 0.8125rem; color: var(--ds-color-text-subtle); }
.tm__chip { display: inline-flex; align-items: center; gap: 5px; padding: 8px 14px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-pill); background: var(--ds-color-surface); color: var(--ds-color-text); font: inherit; font-size: 0.875rem; font-weight: 600; white-space: nowrap; cursor: pointer; flex: none; }
.tm__chip span { color: var(--ds-color-text-subtle); font-weight: 500; }
.tm__chip:hover { background: var(--ds-palette-slate-50); }
.tm__chip.is-on { border-color: var(--ds-color-background-brand-bold); background: var(--ds-palette-navy-50, var(--ds-color-surface)); color: var(--ds-color-text-brand); }

.tm__railhead { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 16px 4px; }
.tm__railtitle { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--ds-color-text); }
.tm__railtitle .q-icon { color: var(--ds-color-text-brand); }
.tm__sort { position: relative; display: inline-flex; align-items: center; }
.tm__sort select { appearance: none; font: inherit; font-size: 0.875rem; font-weight: 600; color: var(--ds-color-text); background: none; border: 0; padding-right: 20px; cursor: pointer; }
.tm__sort .q-icon { position: absolute; right: 0; color: var(--ds-color-text-subtle); pointer-events: none; }
.tm__note { margin: 0; padding: 0 16px 10px; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }

.tm__list { flex: 1; min-height: 0; overflow-y: auto; padding: 4px 16px 20px; display: flex; flex-direction: column; gap: 10px; }

.tm__foot { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 14px 16px; border-top: 1px solid var(--ds-color-border); background: var(--ds-color-surface); }
.tm__footinfo { display: flex; flex-direction: column; min-width: 0; }
.tm__footsec { font-weight: 600; font-size: 0.875rem; color: var(--ds-color-text); }
.tm__footprice { font-weight: 700; color: var(--ds-color-text); }
.tm__footprice small { font-weight: 500; font-size: 0.75rem; color: var(--ds-color-text-subtle); }
.tm__cta { height: 46px; padding: 0 22px; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; flex: none; }

.tm__mapwrap { min-width: 0; overflow: hidden; background: var(--ds-color-surface-sunken); display: flex; align-items: stretch; }
.tm__mapwrap :deep(.vm) { flex: 1; }

@media (max-width: 860px) {
  .tm { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; height: auto; }
}
</style>
