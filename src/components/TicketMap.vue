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
import PriceHistogram from './PriceHistogram.vue'
import { priceDistribution } from '../lib/seatListings.js'

const props = defineProps({
  event: { type: Object, required: true },
  listings: { type: Array, default: () => [] },
  pins: { type: Array, default: () => [] },
  host: { type: String, default: 'EventPipe' },
  maxQuantity: { type: Number, default: 6 },
  initialQuantity: { type: Number, default: 2 },
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
const qty = ref(props.initialQuantity)
const sortBy = ref('top')
const SORTS = { top: 'Top picks', 'price-asc': 'Price · low to high', 'price-desc': 'Price · high to low', section: 'Section' }
const filtersOpen = ref(false)
// Per-filter state — each rail control is its own dropdown; the tune icon opens
// the full TicketFilters dialog which writes back to the same state.
const dist = priceDistribution(props.listings)
const priceRange = ref({ min: dist.min, max: dist.max })
const priceActive = computed(() => priceRange.value.min > dist.min || priceRange.value.max < dist.max)
const sectionsSel = ref([])

const LEVEL_ORDER = ['Lower Level', 'Club Level', 'Mezzanine', 'Upper Level', 'Floor / GA']
const sectionGroups = computed(() => {
  const byTier = new Map()
  for (const l of props.listings) {
    const key = l.tierName || 'Other'
    if (!byTier.has(key)) byTier.set(key, new Set())
    byTier.get(key).add(l.section)
  }
  return [...byTier.entries()]
    .map(([tier, set]) => ({ tier, sections: [...set].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })) }))
    .sort((a, b) => (LEVEL_ORDER.indexOf(a.tier) + 1 || 99) - (LEVEL_ORDER.indexOf(b.tier) + 1 || 99))
})

const filtered = computed(() => {
  let out = props.listings.filter((l) => l.priceWithFees >= priceRange.value.min && l.priceWithFees <= priceRange.value.max)
  if (sectionsSel.value.length) out = out.filter((l) => sectionsSel.value.includes(l.section))
  if (sortBy.value === 'price-asc') out = out.slice().sort((a, b) => a.priceWithFees - b.priceWithFees)
  else if (sortBy.value === 'price-desc') out = out.slice().sort((a, b) => b.priceWithFees - a.priceWithFees)
  else if (sortBy.value === 'section') out = out.slice().sort((a, b) => String(a.section).localeCompare(String(b.section), undefined, { numeric: true }))
  return out
})

// Segment the rail by section (a header per section with its tier + count +
// from-price) instead of one flat list — whenever the guest filters to specific
// sections OR sorts by Section. Keeps picks organized by where they sit.
const isGrouped = computed(() => sectionsSel.value.length > 0 || sortBy.value === 'section')
const grouped = computed(() => {
  const by = new Map()
  for (const l of filtered.value) {
    if (!by.has(l.section)) by.set(l.section, [])
    by.get(l.section).push(l)
  }
  return [...by.entries()]
    .map(([section, listings]) => ({
      section,
      listings,
      tierName: listings[0]?.tierName,
      from: Math.min(...listings.map((x) => x.priceWithFees)),
    }))
    .sort((a, b) => String(a.section).localeCompare(String(b.section), undefined, { numeric: true }))
})

const onApply = (state) => {
  qty.value = state.quantity
  if (state.price) priceRange.value = { ...state.price }
  sectionsSel.value = state.sections || []
  if (state.sort) sortBy.value = state.sort
  filtersOpen.value = false
}
const onClearFilters = () => { priceRange.value = { min: dist.min, max: dist.max }; sectionsSel.value = [] }

// --- Map legend (stadium-location reference to orient the guest) ---
const legendOpen = ref(false)
const LEGEND_LEVELS = [
  { swatch: '--ds-palette-red-500', label: 'Lower Level', note: '100s · closest to the field' },
  { swatch: '--ds-palette-amber-500', label: 'Club Level', note: 'Premium mid-level · indoor lounge' },
  { swatch: '--ds-palette-blue-500', label: 'Mezzanine', note: '200s · elevated corners & sideline' },
  { swatch: '--ds-palette-green-600', label: 'Upper Level', note: '300s · highest, budget-friendly' },
]
const LEGEND_MARKS = [
  { icon: 'sports_football', label: 'Patriots End Zone', note: 'North end' },
  { icon: 'flag', label: 'Visitors End Zone', note: 'South end' },
  { icon: 'swap_horiz', label: 'Home & Away sidelines', note: 'East & west sides' },
]

// --- Selection ---
const selectedId = ref(null)
const selected = computed(() => props.listings.find((l) => l.id === selectedId.value) || null)
const detailQty = ref(2)
// Selecting a listing (rail row or map pin) highlights + focuses its map pin.
const pick = (l) => { selectedId.value = l.id; mapSel.value = l.id; detailQty.value = qty.value }
const back = () => { selectedId.value = null; mapSel.value = null }

// Map v-model — pins carry their listing id, so a pin click selects that exact
// offer. (Falls back to section match for legacy pin sets.)
const mapSel = ref(null)
const onMap = (pinId) => {
  mapSel.value = pinId
  const direct = props.listings.find((l) => l.id === pinId)
  if (direct) return pick(direct)
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
            <img v-if="selected.photo" :src="selected.photo.url || selected.photo" :alt="selected.photo.alt || `View from Section ${selected.section}`" />
            <div v-else class="tm__photo--empty"><q-icon name="stadium" size="40px" /></div>
            <button class="tm__backbtn" aria-label="Back to listings" @click="back"><q-icon name="chevron_left" size="24px" /></button>
            <span class="tm__360"><q-icon name="threed_rotation" size="16px" /> Look around 360°</span>
            <a v-if="selected.photo && selected.photo.photographer" class="tm__credit" :href="selected.photo.photoUrl" target="_blank" rel="noopener">
              Photo · {{ selected.photo.photographer }} / Unsplash
            </a>
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

          <!-- Quantity — native select -->
          <div class="tm__selectwrap tm__selectwrap--sm tm__qty">
            <select v-model.number="qty">
              <option v-for="n in qtyOptions" :key="n" :value="n">{{ n }} ticket{{ n === 1 ? '' : 's' }}</option>
            </select>
            <q-icon name="expand_more" size="18px" />
          </div>

          <!-- Price — its own dropdown (histogram + range) -->
          <button class="tm__chip" :class="{ 'is-on': priceActive }">
            Price <q-icon name="expand_more" size="16px" />
            <q-menu anchor="bottom left" self="top left" :offset="[0, 8]">
              <div class="tm__pop">
                <div class="tm__poptitle">Price <small>Incl. fees</small></div>
                <PriceHistogram :bins="dist.bins" :min="dist.min" :max="dist.max" :selected-min="priceRange.min" :selected-max="priceRange.max" />
                <q-range v-model="priceRange" :min="dist.min" :max="dist.max" :step="5" color="primary" class="tm__poprange" />
                <div class="tm__poprangevals"><span>{{ money(priceRange.min) }}</span><span>{{ money(priceRange.max) }}{{ priceRange.max >= dist.max ? '+' : '' }}</span></div>
              </div>
            </q-menu>
          </button>

          <!-- Sections — its own dropdown (grouped by level) -->
          <button class="tm__chip" :class="{ 'is-on': sectionsSel.length }">
            Sections<template v-if="sectionsSel.length"> · {{ sectionsSel.length }}</template> <q-icon name="expand_more" size="16px" />
            <q-menu anchor="bottom left" self="top left" :offset="[0, 8]">
              <div class="tm__pop tm__pop--sections">
                <div v-for="g in sectionGroups" :key="g.tier" class="tm__popgroup">
                  <div class="tm__popgrouphead">{{ g.tier }}</div>
                  <div class="tm__popchecks">
                    <q-checkbox v-for="s in g.sections" :key="s" v-model="sectionsSel" :val="s" :label="`Sec ${s}`" dense color="primary" />
                  </div>
                </div>
                <div class="tm__popfoot"><button class="tm__popclear" @click="sectionsSel = []">Clear sections</button></div>
              </div>
            </q-menu>
          </button>

          <!-- Sort — its own dropdown, in the same row -->
          <button class="tm__chip">
            Sort <span>{{ SORTS[sortBy] }}</span> <q-icon name="expand_more" size="16px" />
            <q-menu anchor="bottom left" self="top left" :offset="[0, 8]">
              <div class="tm__pop tm__pop--sort">
                <button v-for="(label, val) in SORTS" :key="val" v-close-popup class="tm__sortopt" :class="{ 'is-sel': sortBy === val }" @click="sortBy = val">
                  <q-icon :name="sortBy === val ? 'check' : 'remove'" size="18px" :class="sortBy === val ? 'tm__sortcheck' : 'tm__sortblank'" />{{ label }}
                </button>
              </div>
            </q-menu>
          </button>
        </div>

        <div class="tm__railhead">
          <div class="tm__railcount">{{ filtered.length }} Listing{{ filtered.length === 1 ? '' : 's' }}</div>
          <div class="tm__nofees"><q-icon name="check" size="16px" /> No hidden fees – taxes and fees included.</div>
        </div>

        <div class="tm__list">
          <!-- Segmented by section when the guest has filtered to sections -->
          <template v-if="isGrouped">
            <section v-for="g in grouped" :key="g.section" class="tm__seg">
              <header class="tm__seghead">
                <span class="tm__segsec">Section {{ g.section }}</span>
                <span class="tm__segmeta">{{ g.tierName }} · {{ g.listings.length }} listing{{ g.listings.length === 1 ? '' : 's' }} · from {{ money(g.from) }}</span>
              </header>
              <SeatListingRow v-for="l in g.listings" :key="l.id" :listing="l" :selected="l.id === selectedId" @select="pick" />
            </section>
          </template>
          <template v-else>
            <SeatListingRow v-for="l in filtered" :key="l.id" :listing="l" :selected="l.id === selectedId" @select="pick" />
          </template>
        </div>
      </template>
    </aside>

    <!-- RIGHT: interactive map (full height, zoomed in a couple steps) -->
    <div class="tm__mapwrap">
      <VenueMap :pins="pins" fill :initial-scale="1.6" :focus-id="selectedId" v-model="mapSel" @update:modelValue="onMap" />

      <!-- Location legend — orients the guest to the areas of the stadium. -->
      <div class="tm__legend" :class="{ 'is-open': legendOpen }">
        <button class="tm__legendhead" @click="legendOpen = !legendOpen">
          <span>Legend</span><q-icon :name="legendOpen ? 'expand_more' : 'expand_less'" size="20px" />
        </button>
        <div v-if="legendOpen" class="tm__legendbody">
          <div class="tm__legendgroup">
            <div v-for="row in LEGEND_LEVELS" :key="row.label" class="tm__legendrow">
              <span class="tm__legendswatch" :style="{ background: `var(${row.swatch})` }" />
              <div class="tm__legendinfo"><span class="tm__legendlabel">{{ row.label }}</span><span class="tm__legendnote">{{ row.note }}</span></div>
            </div>
          </div>
          <div class="tm__legendgroup">
            <div v-for="row in LEGEND_MARKS" :key="row.label" class="tm__legendrow">
              <q-icon :name="row.icon" size="18px" class="tm__legendicon" />
              <div class="tm__legendinfo"><span class="tm__legendlabel">{{ row.label }}</span><span class="tm__legendnote">{{ row.note }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All-inclusive filters dialog -->
    <q-dialog v-model="filtersOpen">
      <TicketFilters :listings="listings" :max-quantity="maxQuantity" :sort="sortBy" @close="filtersOpen = false" @apply="onApply" @clear="onClearFilters" />
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

/* Filter dropdown popovers */
.tm__pop { width: 300px; max-width: 90vw; padding: 16px; font-family: var(--ds-font-family); }
.tm__poptitle { font-weight: 700; font-size: 1rem; color: var(--ds-color-text); margin-bottom: 12px; }
.tm__poptitle small { font-weight: 500; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }
.tm__poprange { margin-top: 4px; }
.tm__poprangevals { display: flex; justify-content: space-between; font-weight: 700; font-size: 0.9375rem; color: var(--ds-color-text); }
.tm__pop--sections { width: 320px; max-height: 60vh; overflow-y: auto; }
.tm__popgroup + .tm__popgroup { margin-top: 12px; }
.tm__popgrouphead { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ds-color-text-subtle); margin: 4px 0; }
.tm__popchecks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 10px; }
.tm__popfoot { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--ds-color-border); }
.tm__popclear { background: none; border: 0; padding: 0; font: inherit; font-weight: 700; color: var(--ds-color-text); text-decoration: underline; cursor: pointer; }
.tm__chip.is-on { border-color: var(--ds-color-background-brand-bold); color: var(--ds-color-text-brand); }

.tm__railhead { display: flex; flex-direction: column; gap: 3px; padding: 16px 16px 10px; }
.tm__railcount { font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-text); }
.tm__nofees { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }
.tm__nofees .q-icon { color: var(--ds-color-text-positive, #1b7a3d); }

/* Sort dropdown */
.tm__pop--sort { width: 240px; padding: 8px; }
.tm__sortopt { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; background: none; border: 0; border-radius: var(--ds-radius-md); font: inherit; font-size: 0.9375rem; color: var(--ds-color-text); text-align: left; cursor: pointer; }
.tm__sortopt:hover { background: var(--ds-palette-slate-100); }
.tm__sortopt.is-sel { font-weight: 700; }
.tm__sortcheck { color: var(--ds-color-text-brand); }
.tm__sortblank { visibility: hidden; }
.tm__list { flex: 1; min-height: 0; overflow-y: auto; padding: 4px 16px 20px; display: flex; flex-direction: column; gap: 10px; }
.tm__seg { display: flex; flex-direction: column; gap: 10px; }
.tm__seg + .tm__seg { margin-top: 8px; }
.tm__seghead { position: sticky; top: 0; z-index: 1; display: flex; flex-direction: column; gap: 1px; padding: 8px 0 6px; background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-border); }
.tm__segsec { font-weight: 700; font-size: 0.9375rem; color: var(--ds-color-text); }
.tm__segmeta { font-size: 0.75rem; color: var(--ds-color-text-subtle); }

/* Seat detail */
.tm__detail { flex: 1; min-height: 0; overflow-y: auto; padding: 16px 18px 24px; }
.tm__photo { position: relative; border-radius: var(--ds-radius-lg); overflow: hidden; aspect-ratio: 16 / 10; background: var(--ds-palette-slate-100); }
.tm__photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.tm__photo--empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--ds-color-text-disabled); }
.tm__backbtn { position: absolute; top: 12px; left: 12px; width: 38px; height: 38px; border: 0; border-radius: 50%; background: rgba(255,255,255,0.92); color: var(--ds-color-text); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,.3); }
.tm__backbtn:hover { background: #fff; }
.tm__360 { position: absolute; left: 12px; bottom: 12px; display: inline-flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.65); color: #fff; font-size: 0.8125rem; font-weight: 600; padding: 5px 11px; border-radius: var(--ds-radius-pill); }
.tm__credit { position: absolute; right: 10px; bottom: 10px; font-size: 11px; color: #fff; background: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: var(--ds-radius-pill); text-decoration: none; }
.tm__credit:hover { background: rgba(0,0,0,0.7); }
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

.tm__mapwrap { position: relative; min-width: 0; min-height: 0; overflow: hidden; background: var(--ds-color-surface-sunken); }
.tm__mapwrap :deep(.vmap) { height: 100%; }

/* Location legend overlay */
.tm__legend { position: absolute; left: 16px; bottom: 16px; z-index: 4; width: 264px; max-width: calc(100% - 32px); background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); box-shadow: var(--ds-shadow-2, 0 4px 16px rgba(0,0,0,.14)); overflow: hidden; }
.tm__legend:not(.is-open) { width: auto; }
.tm__legendhead { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; padding: 12px 16px; background: none; border: 0; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 0.9375rem; color: var(--ds-color-text); }
.tm__legendhead:hover { background: var(--ds-palette-slate-50); }
.tm__legendbody { padding: 4px 16px 14px; border-top: 1px solid var(--ds-color-border); max-height: 320px; overflow-y: auto; }
.tm__legendgroup { padding: 10px 0; }
.tm__legendgroup + .tm__legendgroup { border-top: 1px solid var(--ds-color-border); }
.tm__legendrow { display: flex; align-items: flex-start; gap: 10px; padding: 5px 0; }
.tm__legendswatch { width: 14px; height: 14px; border-radius: 4px; flex: none; margin-top: 2px; }
.tm__legendicon { color: var(--ds-color-text); flex: none; }
.tm__legendinfo { display: flex; flex-direction: column; min-width: 0; }
.tm__legendlabel { font-weight: 600; font-size: 0.875rem; color: var(--ds-color-text); }
.tm__legendnote { font-size: 0.75rem; color: var(--ds-color-text-subtle); }

@media (max-width: 860px) { .tm { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; height: auto; } }
</style>
