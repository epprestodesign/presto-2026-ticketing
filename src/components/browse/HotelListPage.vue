<script setup>
// HotelListPage — the full Browse Hotels search-results page BODY (placed inside
// PageFrame, which supplies the Global Nav + footer). Two flows:
//   reserve → Book Reservation (HotelCardReserve, availability: available / unmatched / unavailable)
//   group   → Group Block      (HotelCardGroup,   availability: matches / partial / unavailable)
// Layout: Hero banner → Booking Widget search bar (tucked onto the hero) →
// results toolbar (count + Sort) → 3-column body (filters · results · ads).
import { ref, computed } from 'vue'
import defaultBg from '../../../background-img/defaultBackgroundImage.png'
import epLogoWhite from '../../assets/eventpipe logos/eventpipe-logo-fff.svg'
import BookingWidget from '../BookingWidget.vue'
import DisplayAd from '../DisplayAd.vue'
import BrowseFilter from './Filter.vue'
import SortDropdown from './SortDropdown.vue'
import HotelCardReserve from './HotelCardReserve.vue'
import HotelCardGroup from './HotelCardGroup.vue'

const props = defineProps({
  flow: { type: String, default: 'reserve' }, // 'reserve' | 'group'
})

const isGroup = computed(() => props.flow === 'group')

// Hero content.
const EVENT_NAME = 'Summer Soccer Classic 2027'
const EVENT_DATES = 'Wed, 6/16/2027 - Sat, 6/19/2027'
const scrim = 'linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5))'
const heroStyle = {
  backgroundImage: `${scrim}, url(${defaultBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}

// --- Sample results ----------------------------------------------------------
// Book Reservation cards (name · stars · availability · from-nightly / total).
const reserveSections = [
  {
    heading: null,
    hotels: [
      { name: 'The Grand Riverside Hotel', stars: 4, distance: '0.3 mi from Main Arena', preferred: true, fromNightly: 189, total: 756, availability: 'available', seed: 1 },
      { name: 'Omni Downtown Suites', stars: 4.5, distance: '0.6 mi from Main Arena', fromNightly: 219, total: 876, availability: 'available', seed: 2 },
      { name: 'Hampton Inn & Suites', stars: 3, distance: '1.1 mi from Main Arena', fromNightly: 149, total: 596, availability: 'available', seed: 4 },
    ],
  },
  {
    heading: 'The below hotels do not match your filters',
    hotels: [
      { name: 'Kimpton Gray Hotel', stars: null, distance: '2.4 mi from Main Arena', fromNightly: 249, total: 996, availability: 'unmatched', seed: 3 },
      { name: 'The Whitman Boutique', stars: 4, distance: '2.9 mi from Main Arena', fromNightly: 279, total: 1116, availability: 'unmatched', seed: 6 },
    ],
  },
  {
    heading: 'The below hotels do not have availability for your selected dates',
    hotels: [
      { name: 'Holiday Inn Express Chicago', stars: 2, distance: '3.5 mi from Main Arena', fromNightly: 109, total: 436, availability: 'unavailable', seed: 5 },
    ],
  },
]

// Group Block cards (name · stars · rooms-availability · starting price / night).
const groupSections = [
  {
    heading: null,
    hotels: [
      { name: 'Embassy Suites Downtown', stars: 4, distance: '0.3 mi from Main Arena', preferred: true, startingPrice: 269, availability: 'matches', roomsAvailable: 8, seed: 2 },
      { name: 'The Grand Riverside Hotel', stars: 4.5, distance: '0.6 mi from Main Arena', startingPrice: 289, availability: 'matches', roomsAvailable: 5, seed: 1 },
    ],
  },
  {
    heading: 'The hotels below have availability but may not match your selected filters or have enough rooms for all nights selected.',
    hotels: [
      { name: 'Kimpton Gray Hotel', stars: null, distance: '2.4 mi from Main Arena', startingPrice: 249, availability: 'partial', roomsMax: 4, roomsRequested: 10, seed: 3 },
      { name: 'Hampton Inn & Suites', stars: 3, distance: '1.1 mi from Main Arena', startingPrice: 179, availability: 'partial', roomsMax: 6, roomsRequested: 10, seed: 4 },
      { name: 'Holiday Inn Express Chicago', stars: 2, distance: '3.5 mi from Main Arena', startingPrice: 109, availability: 'unavailable', seed: 5 },
    ],
  },
]

const sections = computed(() => (isGroup.value ? groupSections : reserveSections))
const cardComponent = computed(() => (isGroup.value ? HotelCardGroup : HotelCardReserve))
const resultCount = computed(() =>
  sections.value.reduce((n, s) => n + s.hotels.length, 0)
)

// Filter sidebar v-models.
const fBudget = ref({ min: 20, max: 522 })
const fStars = ref([4, 5])
const fAmenities = ref(['Free WiFi', 'Free Breakfast'])
const fBrands = ref(['Cambria', 'Comfort'])
const priceHistogram = [8, 14, 11, 24, 38, 52, 47, 61, 44, 70, 56, 66, 51, 43, 47, 31, 35, 27, 31, 22, 28, 34, 30, 24, 18, 14, 22, 10, 7, 5]

// Sort control.
const sort = ref('recommended')
</script>

<template>
  <div class="hlp">
    <!-- HERO -->
    <section class="hlp__hero" :style="heroStyle">
      <div class="hlp__hero-inner">
        <img :src="epLogoWhite" alt="EventPipe" class="hlp__hero-logo" />
        <div class="text-h5 hlp__event">{{ EVENT_NAME }}</div>
        <div class="text-body1 hlp__dates">{{ EVENT_DATES }}</div>
      </div>
    </section>

    <!-- SEARCH BAR — tucked up onto the hero -->
    <div class="hlp__searchwrap">
      <div class="hlp__search">
        <booking-widget :mode="isGroup ? 'group' : 'reservations'" :tabs="false" />
      </div>
    </div>

    <!-- RESULTS TOOLBAR -->
    <div class="hlp__container">
      <div class="hlp__toolbar">
        <div class="hlp__count">
          <strong>{{ resultCount }} hotels</strong> for your selected dates
        </div>
        <sort-dropdown v-model="sort" />
      </div>

      <!-- 3-COLUMN BODY -->
      <div class="hlp__grid">
        <!-- LEFT: filters sidebar -->
        <aside class="hlp__rail hlp__rail--left">
          <div class="hlp__filters">
            <h2 class="hlp__filters-title">Filters</h2>
            <hr class="hlp__divider" />
            <browse-filter type="budget" :min="20" :max="850" :histogram="priceHistogram" v-model="fBudget" />
            <hr class="hlp__divider" />
            <browse-filter type="starRating" v-model="fStars" />
            <hr class="hlp__divider" />
            <browse-filter type="amenities" v-model="fAmenities" :collapse-after="8" />
            <hr class="hlp__divider" />
            <browse-filter type="brands" v-model="fBrands" />
          </div>
        </aside>

        <!-- MIDDLE: results list with availability sections -->
        <div class="hlp__results">
          <template v-for="(section, si) in sections" :key="si">
            <div v-if="section.heading" class="hlp__section">
              <hr class="hlp__section-rule" />
              <h3 class="hlp__section-heading">{{ section.heading }}</h3>
            </div>
            <component
              :is="cardComponent"
              v-for="(hotel, hi) in section.hotels"
              :key="si + '-' + hi"
              v-bind="hotel"
              class="hlp__card"
            />
          </template>
        </div>

        <!-- RIGHT: display ads -->
        <aside class="hlp__rail hlp__rail--right">
          <div class="hlp__ads">
            <display-ad :width="340" :height="215" />
            <display-ad :width="340" :height="215" />
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hlp { background: var(--ds-color-surface); }

/* hero */
.hlp__hero {
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  background-color: #000;
  overflow: hidden;
}
.hlp__hero-inner { padding: 24px; max-width: 760px; }
.hlp__hero-logo { height: 30px; width: auto; margin: 0 auto 12px; display: block; }
.hlp__event { font-weight: 700; line-height: 1.15; margin: 0; }
.hlp__dates { margin-top: 6px; }

/* search bar tucked onto the hero */
.hlp__searchwrap { padding: 0 24px; }
.hlp__search {
  max-width: 1120px;
  margin: -44px auto 0;
  position: relative;
  z-index: 2;
  background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-lg, 0 16px 40px rgba(0, 0, 0, 0.16));
  padding: 16px;
}

/* content container */
.hlp__container { max-width: 1400px; margin: 0 auto; padding: 0 24px; }

/* toolbar */
.hlp__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin: 32px 0 20px;
}
.hlp__count { font-size: 1rem; color: var(--ds-color-text-subtle); }
.hlp__count strong { color: var(--ds-color-text); font-weight: 700; }

/* 3-column grid */
.hlp__grid {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 360px;
  gap: 24px;
  align-items: start;
  padding-bottom: 24px;
}

/* left rail — filters card */
.hlp__filters {
  border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-lg);
  background: var(--ds-color-surface);
  padding: 20px 20px 24px;
}
.hlp__filters-title { margin: 0 0 4px; font-size: 1.25rem; font-weight: 800; color: var(--ds-color-text); }
.hlp__divider { border: 0; border-top: 1px solid var(--ds-color-border); margin: 18px 0; }

/* middle — results list */
.hlp__results { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.hlp__section { margin-top: 8px; }
.hlp__section-rule { border: 0; border-top: 1px solid var(--ds-color-border); margin: 0 0 16px; }
.hlp__section-heading {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--ds-color-text);
  line-height: 1.35;
}
.hlp__card { width: 100%; }

/* right rail — sticky ads */
.hlp__rail--right { position: sticky; top: 24px; }
.hlp__ads { display: flex; flex-direction: column; align-items: center; gap: 20px; }

/* responsive-ish: collapse rails under ~1080px */
@media (max-width: 1200px) {
  .hlp__grid { grid-template-columns: 260px minmax(0, 1fr); }
  .hlp__rail--right { display: none; }
}
@media (max-width: 820px) {
  .hlp__grid { grid-template-columns: 1fr; }
  .hlp__rail--left { display: none; }
}
</style>
