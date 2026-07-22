<script setup>
// PackageListPage — Browse Packages, laid out like the Browse Hotels list page
// (HotelListPage): a navy event hero with a tucked search bar, then a 3-column
// body — left filter rail (theme · price · hotel-included), middle results as
// horizontal PackageResultCards with a count + sort toolbar, and an optional
// right display-ad rail. Selecting a card's "Quick view" opens the condensed
// PackageQuickViewDialog; "Customize"/"Select" bubble up. Prototype data.
import { ref, computed } from 'vue'
import defaultBg from '../../background-img/defaultBackgroundImage.png'
import epLogoWhite from '../assets/eventpipe logos/eventpipe-logo-fff.svg'
import PackageResultCard from './PackageResultCard.vue'
import PackageQuickViewDialog from './PackageQuickViewDialog.vue'
import PriceHistogram from './PriceHistogram.vue'
import DisplayAd from './DisplayAd.vue'

const props = defineProps({
  event: { type: Object, required: true },
  packages: { type: Array, default: () => [] }, // generateExperiencePackages()/generatePackageGrid()
  host: { type: String, default: 'EventPipe' },
  eyebrow: { type: String, default: 'Client Appreciation' },
  // Optional right-rail skyscraper Display Ad, e.g. [160, 600].
  adSize: { type: Array, default: null },
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
const guests = ref(2)
// Seed the price range once packages are known.
const seedPrice = () => { price.value = { min: bounds.value.min, max: bounds.value.max } }
seedPrice()

const SORTS = { recommended: 'Recommended', 'price-asc': 'Price · low to high', 'price-desc': 'Price · high to low', savings: 'Biggest savings' }
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
        <div class="plp__event">{{ EVENT_NAME }}</div>
        <div class="plp__dates">{{ EVENT_DATES }}</div>
      </div>
    </section>

    <!-- SEARCH BAR — tucked onto the hero -->
    <div class="plp__searchwrap">
      <div class="plp__search">
        <div class="plp__field">
          <q-icon name="confirmation_number" size="20px" />
          <div><span class="plp__flabel">Experience</span><span class="plp__fval">Patriots packages</span></div>
        </div>
        <div class="plp__field">
          <q-icon name="group" size="20px" />
          <div>
            <span class="plp__flabel">Guests</span>
            <select v-model.number="guests" class="plp__guests"><option v-for="n in 12" :key="n" :value="n">{{ n }} guest{{ n === 1 ? '' : 's' }}</option></select>
          </div>
        </div>
        <q-btn unelevated no-caps class="plp__searchbtn" label="Find packages" />
      </div>
    </div>

    <!-- BODY: filters · results · (optional) ad rail -->
    <div class="plp__container">
      <div class="plp__grid" :style="gridStyle">
        <!-- LEFT: filter rail -->
        <aside class="plp__rail">
          <!-- Hotels-included toggle — a self-contained card at the top -->
          <div class="plp__hotelcard">
            <q-toggle v-model="hotelOnly" color="primary" size="sm" />
            <div class="plp__hotelcard-text">
              <h3 class="plp__hotelcard-title">Hotels included only</h3>
              <p class="plp__hotelcard-sub">Only show packages with a hotel stay</p>
            </div>
          </div>

          <div class="plp__filtblock">
            <h3 class="plp__filth">Experience type</h3>
            <q-checkbox v-for="t in themes" :key="t" v-model="selThemes" :val="t" :label="t" dense color="primary" class="plp__check" />
          </div>
          <div class="plp__filtblock">
            <h3 class="plp__filth">Price</h3>
            <PriceHistogram :bins="priceHistogram" :min="bounds.min" :max="bounds.max" :selected-min="price.min" :selected-max="price.max" />
            <q-range v-model="price" :min="bounds.min" :max="bounds.max" :step="10" color="primary" />
            <div class="plp__pricevals"><span>{{ money(price.min) }}</span><span>{{ money(price.max) }}{{ price.max >= bounds.max ? '+' : '' }}</span></div>
          </div>
        </aside>

        <!-- MIDDLE: toolbar + results -->
        <div class="plp__results">
          <div class="plp__toolbar">
            <div class="plp__count">
              <strong>{{ filtered.length }}</strong> package{{ filtered.length === 1 ? '' : 's' }} available<button
                v-if="filtersApplied > 0" type="button" class="plp__clear" @click="clearFilters">({{ filtersApplied }} filter{{ filtersApplied === 1 ? '' : 's' }} applied)</button>
            </div>
            <label class="plp__sort">Sort by
              <select v-model="sort"><option v-for="(label, val) in SORTS" :key="val" :value="val">{{ label }}</option></select>
            </label>
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
.plp__hero { color: #fff; padding: 40px 24px 64px; }
.plp__hero-inner { max-width: 760px; margin: 0 auto; text-align: center; }
.plp__hero-logo { height: 34px; width: auto; display: block; margin: 0 auto 16px; }
.plp__event { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; line-height: 1.15; }
.plp__dates { opacity: 0.9; margin-top: 8px; }

.plp__searchwrap { max-width: 1180px; margin: -34px auto 0; padding: 0 24px; }
.plp__search { display: flex; align-items: center; gap: 8px; background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); box-shadow: var(--ds-shadow-2, 0 4px 16px rgba(0,0,0,.12)); padding: 12px 14px; }
.plp__field { display: flex; align-items: center; gap: 10px; padding: 4px 14px; flex: 1; border-right: 1px solid var(--ds-color-border); }
.plp__field:last-of-type { border-right: 0; }
.plp__field .q-icon { color: var(--ds-color-text-subtle); }
.plp__field > div { display: flex; flex-direction: column; }
.plp__flabel { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ds-color-text-subtle); }
.plp__fval { font-weight: 700; color: var(--ds-color-text); }
.plp__guests { appearance: none; border: 0; background: none; font: inherit; font-weight: 700; color: var(--ds-color-text); padding: 0; cursor: pointer; }
.plp__searchbtn { height: 48px; padding: 0 24px; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; }

.plp__container { max-width: 1180px; margin: 0 auto; padding: 28px 24px 60px; }
.plp__grid { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 28px; align-items: start; }

.plp__rail { display: flex; flex-direction: column; gap: 22px; }
.plp__hotelcard { display: flex; align-items: center; gap: 12px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); background: var(--ds-color-surface); padding: 14px 16px; }
.plp__hotelcard > .q-toggle { flex: 0 0 auto; }
.plp__hotelcard-text { flex: 1; min-width: 0; }
.plp__hotelcard-title { margin: 0; font-size: 1rem; font-weight: 600; line-height: 1.25; color: var(--ds-color-text-brand); }
.plp__hotelcard-sub { margin: 3px 0 0; font-size: 0.875rem; color: var(--ds-color-text-subtle); line-height: 1.35; }
.plp__filtblock { border-bottom: 1px solid var(--ds-color-border); padding-bottom: 20px; }
.plp__filtblock:last-child { border-bottom: 0; }
.plp__filth { margin: 0 0 10px; font-size: 1rem; font-weight: 700; color: var(--ds-color-text); }
.plp__check { display: flex; }
.plp__pricevals { display: flex; justify-content: space-between; font-weight: 700; font-size: 0.9375rem; color: var(--ds-color-text); margin-top: 2px; }

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
  .plp__search { flex-wrap: wrap; }
}
</style>
