<script setup>
// TicketMap — the SeatGeek-style ticket browse experience for the Patriots game,
// built from our own assets. Two-pane: an "Authenticated NFL Tickets" listings
// rail on the left beside the interactive Gillette VenueMap (price pins) on the
// right. The filter bar has a native ticket-quantity select and opens the
// all-inclusive TicketFilters dialog. Selecting a listing swaps the rail for a
// seat-detail view (view-from-seat photo, section/row, price, quantity, Continue,
// and the ticket guarantees). Prototype data.
import { ref, computed } from 'vue'
import SeatListingRow from './SeatListingRow.vue'
import VenueMap from './VenueMap.vue'
import TicketFilters from './TicketFilters.vue'

const props = defineProps({
  event: { type: Object, required: true },
  listings: { type: Array, default: () => [] },
  pins: { type: Array, default: () => [] },
  host: { type: String, default: 'EventPipe' },
  maxQuantity: { type: Number, default: 6 },
})
const emit = defineEmits(['continue'])

const money = (n) => '$' + Number(Math.round(n) ?? 0).toLocaleString('en-US')
const qtyOptions = computed(() => Array.from({ length: props.maxQuantity }, (_, i) => i + 1))

// Ticket guarantees shown under the selected seat (EventPipe-framed).
const SEAT_INFO = [
  { icon: 'qr_code_2', title: 'Mobile tickets', text: 'Delivered to the EventPipe app before gameday and scanned at the gate.' },
  { icon: 'verified', title: 'Verified tickets', text: 'Reviewed and verified by the venue — sourced through EventPipe.' },
  { icon: 'verified_user', title: 'Every ticket protected', text: 'If something comes up with the event, EventPipe has you covered.' },
]

// --- Filters + sort ---
const qty = ref(2)
const sortBy = ref('top')
const SORTS = { top: 'Top picks', 'price-asc': 'Price · low to high', 'price-desc': 'Price · high to low', section: 'Section' }
const filtersOpen = ref(false)
const active = ref({ price: null, areas: [], levels: [] })

const filtered = computed(() => {
  let out = [...props.listings]
  if (active.value.price) out = out.filter((l) => l.priceWithFees >= active.value.price.min && l.priceWithFees <= active.value.price.max)
  if (sortBy.value === 'price-asc') out.sort((a, b) => a.priceWithFees - b.priceWithFees)
  else if (sortBy.value === 'price-desc') out.sort((a, b) => b.priceWithFees - a.priceWithFees)
  else if (sortBy.value === 'section') out.sort((a, b) => String(a.section).localeCompare(String(b.section)))
  return out
})

const onApply = (state) => {
  qty.value = state.quantity
  active.value = { price: state.price, areas: state.areas, levels: state.levels }
  filtersOpen.value = false
}
const onClearFilters = () => { active.value = { price: null, areas: [], levels: [] } }

// --- Selection ---
const selectedId = ref(null)
const selected = computed(() => props.listings.find((l) => l.id === selectedId.value) || null)
const detailQty = ref(2)
const pick = (l) => { selectedId.value = l.id; detailQty.value = qty.value }
const back = () => { selectedId.value = null }

// Map v-model — clicking a pin selects the listing whose section matches.
const mapSel = ref(null)
const onMap = (pinId) => {
  mapSel.value = pinId
  const pin = props.pins.find((p) => p.id === pinId)
  if (!pin) return
  const hit = props.listings.find((l) => String(l.section) === String(pin.label).replace(/[^0-9]/g, '')) || props.listings[0]
  if (hit) pick(hit)
}
</script>

<template>
  <div class="tm">
    <!-- LEFT: listings rail OR seat detail -->
    <aside class="tm__rail">
      <!-- ============ SEAT DETAIL ============ -->
      <template v-if="selected">
        <div class="tm__detail">
          <div class="tm__photo">
            <img v-if="selected.photo" :src="selected.photo" :alt="`View from Section ${selected.section}`" />
            <div v-else class="tm__photo--empty"><q-icon name="stadium" size="40px" /></div>
            <button class="tm__backbtn" aria-label="Back to listings" @click="back"><q-icon name="chevron_left" size="24px" /></button>
            <span class="tm__360"><q-icon name="threed_rotation" size="16px" /> Look around 360°</span>
          </div>

          <h3 class="tm__dtitle">Section {{ selected.section }}, Row {{ selected.row }}</h3>
          <div class="tm__dprice">{{ money(selected.priceWithFees) }} <small>each · incl. fees</small></div>

          <div class="tm__dactions">
            <div class="tm__selectwrap tm__selectwrap--sm">
              <select v-model.number="detailQty">
                <option v-for="n in qtyOptions" :key="n" :value="n">{{ n }} ticket{{ n === 1 ? '' : 's' }}</option>
              </select>
              <q-icon name="expand_more" size="18px" />
            </div>
            <q-btn unelevated no-caps class="tm__continue" :label="`Continue · ${money(selected.priceWithFees * detailQty)}`" @click="emit('continue', { listing: selected, quantity: detailQty })" />
          </div>

          <div class="tm__dinfo">
            <div v-for="(d, i) in SEAT_INFO" :key="i" class="tm__dinforow">
              <q-icon :name="d.icon" size="22px" class="tm__dinfoicon" />
              <div><span class="tm__dinfotitle">{{ d.title }}</span><span class="tm__dinfotext">{{ d.text }}</span></div>
            </div>
          </div>
        </div>
      </template>

      <!-- ============ LISTINGS ============ -->
      <template v-else>
        <div class="tm__filters">
          <button class="tm__tune" aria-label="All filters" @click="filtersOpen = true"><q-icon name="tune" size="20px" /></button>
          <div class="tm__selectwrap tm__selectwrap--sm tm__qty">
            <select v-model.number="qty">
              <option v-for="n in qtyOptions" :key="n" :value="n">{{ n }} ticket{{ n === 1 ? '' : 's' }}</option>
            </select>
            <q-icon name="expand_more" size="18px" />
          </div>
          <button class="tm__chip" @click="filtersOpen = true">Price <span>Incl. fees</span></button>
          <button class="tm__chip" @click="filtersOpen = true">Sections</button>
        </div>

        <div class="tm__railhead">
          <div class="tm__railtitle"><q-icon name="verified" size="18px" /> Authenticated NFL Tickets</div>
          <label class="tm__sort">
            <select v-model="sortBy"><option v-for="(label, val) in SORTS" :key="val" :value="val">{{ label }}</option></select>
            <q-icon name="unfold_more" size="16px" />
          </label>
        </div>
        <p class="tm__note">{{ filtered.length }} listings held for {{ host }} guests · {{ event.venue?.name }}</p>

        <div class="tm__list">
          <SeatListingRow v-for="l in filtered" :key="l.id" :listing="l" :selected="l.id === selectedId" @select="pick" />
        </div>
      </template>
    </aside>

    <!-- RIGHT: interactive map (full height, zoomed in a couple steps) -->
    <div class="tm__mapwrap">
      <VenueMap :pins="pins" fill :initial-scale="1.6" v-model="mapSel" @update:modelValue="onMap" />
    </div>

    <!-- All-inclusive filters dialog -->
    <q-dialog v-model="filtersOpen">
      <TicketFilters :listings="listings" :max-quantity="maxQuantity" @close="filtersOpen = false" @apply="onApply" @clear="onClearFilters" />
    </q-dialog>
  </div>
</template>

<style scoped>
.tm { display: grid; grid-template-columns: minmax(340px, 440px) 1fr; grid-template-rows: minmax(0, 1fr); height: 100vh; font-family: var(--ds-font-family); background: var(--ds-color-surface); }
.tm__rail { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid var(--ds-color-border); }

/* Filter bar */
.tm__filters { display: flex; align-items: center; gap: 8px; padding: 14px 16px; overflow-x: auto; border-bottom: 1px solid var(--ds-color-border); }
.tm__filters::-webkit-scrollbar { height: 0; }
.tm__tune { flex: none; width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--ds-color-border-bold); background: var(--ds-color-surface); color: var(--ds-color-text); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.tm__tune:hover { background: var(--ds-palette-slate-100); }
.tm__chip { display: inline-flex; align-items: center; gap: 5px; padding: 8px 14px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-pill); background: var(--ds-color-surface); color: var(--ds-color-text); font: inherit; font-size: 0.875rem; font-weight: 600; white-space: nowrap; cursor: pointer; flex: none; }
.tm__chip span { color: var(--ds-color-text-subtle); font-weight: 500; }
.tm__chip:hover { background: var(--ds-palette-slate-50); }

/* Native selects */
.tm__selectwrap { position: relative; display: inline-flex; align-items: center; }
.tm__selectwrap select { appearance: none; font: inherit; color: var(--ds-color-text); background: var(--ds-color-surface); border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-pill); padding: 8px 34px 8px 14px; cursor: pointer; font-weight: 600; }
.tm__selectwrap select:focus { outline: none; border-color: var(--ds-color-border-brand); }
.tm__selectwrap .q-icon { position: absolute; right: 10px; color: var(--ds-color-text-subtle); pointer-events: none; }
.tm__selectwrap--sm select { font-size: 0.875rem; }
.tm__qty { flex: none; }

.tm__railhead { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 16px 4px; }
.tm__railtitle { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--ds-color-text); }
.tm__railtitle .q-icon { color: var(--ds-color-text-brand); }
.tm__sort { position: relative; display: inline-flex; align-items: center; }
.tm__sort select { appearance: none; font: inherit; font-size: 0.875rem; font-weight: 600; color: var(--ds-color-text); background: none; border: 0; padding-right: 20px; cursor: pointer; }
.tm__sort .q-icon { position: absolute; right: 0; color: var(--ds-color-text-subtle); pointer-events: none; }
.tm__note { margin: 0; padding: 0 16px 10px; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }
.tm__list { flex: 1; min-height: 0; overflow-y: auto; padding: 4px 16px 20px; display: flex; flex-direction: column; gap: 10px; }

/* Seat detail */
.tm__detail { flex: 1; min-height: 0; overflow-y: auto; padding: 16px 18px 24px; }
.tm__photo { position: relative; border-radius: var(--ds-radius-lg); overflow: hidden; aspect-ratio: 16 / 10; background: var(--ds-palette-slate-100); }
.tm__photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.tm__photo--empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--ds-color-text-disabled); }
.tm__backbtn { position: absolute; top: 12px; left: 12px; width: 38px; height: 38px; border: 0; border-radius: 50%; background: rgba(255,255,255,0.92); color: var(--ds-color-text); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,.3); }
.tm__backbtn:hover { background: #fff; }
.tm__360 { position: absolute; left: 12px; bottom: 12px; display: inline-flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.65); color: #fff; font-size: 0.8125rem; font-weight: 600; padding: 5px 11px; border-radius: var(--ds-radius-pill); }
.tm__dtitle { margin: 18px 0 2px; font-size: 1.375rem; font-weight: 700; color: var(--ds-color-text); }
.tm__dprice { font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-text); }
.tm__dprice small { font-weight: 500; font-size: 0.875rem; color: var(--ds-color-text-subtle); }
.tm__dactions { display: flex; align-items: center; gap: 12px; margin: 18px 0 6px; }
.tm__continue { flex: 1; height: 48px; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; }
.tm__dinfo { display: flex; flex-direction: column; gap: 18px; margin-top: 22px; padding-top: 20px; border-top: 1px solid var(--ds-color-border); }
.tm__dinforow { display: flex; align-items: flex-start; gap: 14px; }
.tm__dinfoicon { color: var(--ds-color-text); flex: none; margin-top: 1px; }
.tm__dinforow > div { display: flex; flex-direction: column; gap: 3px; }
.tm__dinfotitle { font-weight: 700; font-size: 0.9375rem; color: var(--ds-color-text); }
.tm__dinfotext { font-size: 0.8125rem; color: var(--ds-color-text-subtle); line-height: 1.45; }

.tm__mapwrap { min-width: 0; min-height: 0; overflow: hidden; background: var(--ds-color-surface-sunken); }
.tm__mapwrap :deep(.vmap) { height: 100%; }

@media (max-width: 860px) { .tm { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; height: auto; } }
</style>
