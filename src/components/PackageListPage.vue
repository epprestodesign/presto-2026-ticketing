<script setup>
// PackageListPage — Browse Packages, laid out like the Browse Hotels list page
// (HotelListPage): a navy event hero with a tucked search bar, then a 3-column
// body — left filter rail (theme · price · hotel-included), middle results as
// horizontal PackageResultCards with a count + sort toolbar, and an optional
// right display-ad rail. Selecting a card's "Quick view" opens the condensed
// PackageQuickViewDialog; "Customize"/"Select" bubble up. Prototype data.
import { ref, computed, watch } from 'vue'
import defaultBg from '../../background-img/defaultBackgroundImage.png'
import epLogoWhite from '../assets/eventpipe logos/eventpipe-logo-fff.svg'
import PackageResultCard from './PackageResultCard.vue'
import PackageQuickViewDialog from './PackageQuickViewDialog.vue'
import PackageFilterRail from './PackageFilterRail.vue'
import SortDropdown from './browse/SortDropdown.vue'
import DisplayAd from './DisplayAd.vue'

const props = defineProps({
  event: { type: Object, required: true },
  packages: { type: Array, default: () => [] }, // generateExperiencePackages()/generatePackageGrid()
  host: { type: String, default: 'EventPipe' },
  eyebrow: { type: String, default: 'Client Appreciation' },
  // Optional right-rail skyscraper Display Ad, e.g. [160, 600].
  adSize: { type: Array, default: null },
  // Seed the search-bar guest count (e.g. from a "how many guests?" prompt).
  initialGuests: { type: Number, default: 2 },
})
const emit = defineEmits(['select', 'customize'])

const EVENT_NAME = computed(() => props.event?.name || 'New England Patriots v Buffalo Bills')
const EVENT_DATES = computed(() => props.event?.dateLabel || 'Sat, Dec 6, 2026')
const scrim = 'linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5))'
const heroStyle = { backgroundImage: `${scrim}, url(${defaultBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
const gridStyle = computed(() => (props.adSize ? { gridTemplateColumns: `260px minmax(0, 1fr) ${props.adSize[0]}px` } : {}))

const money = (n) => '$' + Math.round(n || 0).toLocaleString('en-US')

// --- Filter state ---
const themes = computed(() => [...new Set(props.packages.map((p) => p.theme).filter(Boolean))])
const prices = computed(() => props.packages.map((p) => p.packagePrice))
const bounds = computed(() => ({ min: Math.min(...prices.value, 0), max: Math.max(...prices.value, 100) }))
const priceHistogram = computed(() => {
  const { min, max } = bounds.value
  const span = (max - min) || 1
  const bins = new Array(16).fill(0)
  for (const p of prices.value) bins[Math.min(15, Math.floor(((p - min) / span) * 16))]++
  return bins
})

const selThemes = ref([])
const price = ref({ min: 0, max: 0 })
const hotelOnly = ref(false)
const sort = ref('recommended')
const guests = ref(props.initialGuests)
// Keep the rail's Guests selector in sync when the seed changes (e.g. the guest
// picks a party size in the "How many guests?" prompt after the page has mounted).
watch(() => props.initialGuests, (v) => { if (v != null) guests.value = v })
// Seed the price range once packages are known.
const seedPrice = () => { price.value = { min: bounds.value.min, max: bounds.value.max } }
seedPrice()

const SORTS = { recommended: 'Recommended', 'price-asc': 'Price · low to high', 'price-desc': 'Price · high to low', savings: 'Biggest savings' }
const sortOptions = computed(() => Object.entries(SORTS).map(([value, label]) => ({ value, label })))
const filtersApplied = computed(() =>
  (selThemes.value.length ? 1 : 0) + (hotelOnly.value ? 1 : 0) +
  ((price.value.min > bounds.value.min || price.value.max < bounds.value.max) ? 1 : 0),
)

const filtered = computed(() => {
  let out = props.packages.filter((p) =>
    (!selThemes.value.length || selThemes.value.includes(p.theme)) &&
    (!hotelOnly.value || !!p.hotel) &&
    p.packagePrice >= price.value.min && p.packagePrice <= price.value.max,
  )
  if (sort.value === 'price-asc') out = out.slice().sort((a, b) => a.packagePrice - b.packagePrice)
  else if (sort.value === 'price-desc') out = out.slice().sort((a, b) => b.packagePrice - a.packagePrice)
  else if (sort.value === 'savings') out = out.slice().sort((a, b) => (b.savings || 0) - (a.savings || 0))
  return out
})
const clearFilters = () => { selThemes.value = []; hotelOnly.value = false; seedPrice() }

// --- Quick view dialog ---
const quickOpen = ref(false)
const quickPkg = ref(null)
const selectedId = ref(null)
const openQuick = (p) => { quickPkg.value = p; quickOpen.value = true; selectedId.value = p.id }
const onSelect = (p) => { selectedId.value = p.id; quickOpen.value = false; emit('select', p) }
const onCustomize = (p) => { quickOpen.value = false; emit('customize', p) }
</script>

<template>
  <div class="plp">
    <!-- HERO — centered EventPipe wordmark + event name + date (Hero Banner / Hotel Listings style) -->
    <section class="plp__hero" :style="heroStyle">
      <div class="plp__hero-inner">
        <img :src="epLogoWhite" alt="EventPipe" class="plp__hero-logo" />
        <div class="text-h5 plp__event">{{ EVENT_NAME }}</div>
        <div class="text-body1 plp__dates">{{ EVENT_DATES }}</div>
      </div>
    </section>

    <!-- BODY: filters · results · (optional) ad rail -->
    <div class="plp__container">
      <div class="plp__grid" :style="gridStyle">
        <!-- LEFT: filter rail (extracted component; guests moved here) -->
        <PackageFilterRail
          :themes="themes" :bounds="bounds" :price-histogram="priceHistogram"
          v-model:hotel-only="hotelOnly" v-model:guests="guests"
          v-model:sel-themes="selThemes" v-model:price="price"
        />

        <!-- MIDDLE: toolbar + results -->
        <div class="plp__results">
          <div class="plp__toolbar">
            <div class="plp__count">
              <strong>{{ filtered.length }}</strong> package{{ filtered.length === 1 ? '' : 's' }} available<button
                v-if="filtersApplied > 0" type="button" class="plp__clear" @click="clearFilters">({{ filtersApplied }} filter{{ filtersApplied === 1 ? '' : 's' }} applied)</button>
            </div>
            <SortDropdown v-model="sort" :options="sortOptions" label="Sort By" variant="box" />
          </div>

          <div v-if="filtered.length" class="plp__list">
            <PackageResultCard
              v-for="p in filtered" :key="p.id" :pkg="p" :selected="p.id === selectedId"
              @quickview="openQuick" @customize="onCustomize" @select="onSelect"
            />
          </div>
          <div v-else class="plp__empty">
            <q-icon name="search_off" size="40px" />
            <p>No packages match your filters.</p>
            <button type="button" class="plp__clear" @click="clearFilters">Clear filters</button>
          </div>
        </div>

        <!-- RIGHT: optional ad rail -->
        <aside v-if="adSize" class="plp__adrail">
          <DisplayAd :width="adSize[0]" :height="adSize[1]" />
        </aside>
      </div>
    </div>

    <!-- Condensed quick-view dialog -->
    <q-dialog v-model="quickOpen">
      <PackageQuickViewDialog v-if="quickPkg" :pkg="quickPkg" @close="quickOpen = false" @select="onSelect" @customize="onCustomize" />
    </q-dialog>
  </div>
</template>

<style scoped>
.plp { font-family: var(--ds-font-family); background: var(--ds-color-surface-canvas); min-height: 100vh; }
/* Hero — identical to the Browse Hotels hero (browse/HotelListPage .hlp__hero):
   same 200px height, centered layout, logo size, and text-h5 / text-body1 type. */
.plp__hero { position: relative; min-height: 200px; display: flex; align-items: center; justify-content: center; text-align: center; color: #fff; background-color: #000; overflow: hidden; }
.plp__hero-inner { padding: 24px; max-width: 760px; }
.plp__hero-logo { height: 30px; width: auto; display: block; margin: 0 auto 12px; }
.plp__event { font-weight: 700; line-height: 1.15; margin: 0; }
.plp__dates { margin-top: 6px; }

/* Body width matches Browse Hotels (1400px container · 260px rail · 24px gap). */
.plp__container { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
.plp__grid { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 24px; align-items: start; padding: 28px 0 60px; }

.plp__results { min-width: 0; }
.plp__toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.plp__count { color: var(--ds-color-text); }
.plp__clear { background: none; border: 0; padding: 0 0 0 6px; font: inherit; color: var(--ds-color-text-brand); font-weight: 700; text-decoration: underline; cursor: pointer; }
.plp__sort { display: inline-flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--ds-color-text-subtle); }
.plp__sort select { appearance: none; font: inherit; font-weight: 700; color: var(--ds-color-text); background: none; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-md); padding: 7px 12px; cursor: pointer; }
.plp__list { display: flex; flex-direction: column; gap: 16px; }
.plp__empty { text-align: center; color: var(--ds-color-text-subtle); padding: 60px 20px; }
.plp__empty .q-icon { color: var(--ds-color-text-disabled); }
.plp__empty p { margin: 12px 0; }

.plp__adrail { justify-self: end; }

@media (max-width: 900px) {
  .plp__grid { grid-template-columns: 1fr !important; }
  .plp__adrail { display: none; }
}
</style>
