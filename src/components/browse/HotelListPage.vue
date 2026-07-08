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
import FilterRail from './FilterRail.vue'
import SortDropdown from './SortDropdown.vue'
import HotelCardGroup from './HotelCardGroup.vue'
import DisplayAd from '../DisplayAd.vue'
import ResultsToolbar from './ResultsToolbar.vue'
import { sampleRooms } from '../../stories/browse/_rooms-sample.js'

const props = defineProps({
  flow: { type: String, default: 'reserve' }, // 'reserve' | 'group'
  showTeams: { type: Boolean, default: true }, // Teams vs Core booking widget
  // Optional right-rail skyscraper Display Ad, e.g. [160, 600] / [160, 320] /
  // [120, 600]. When null (default) the page renders with no ad rail.
  adSize: { type: Array, default: null },
})

const isGroup = computed(() => props.flow === 'group')

// "Exact Matches Only" (from the filter rail). When ON, it demonstrates the
// filtered edge case: nothing matches the strict filter, so the matching set
// empties (count → 0, "(1 filter applied)" messaging shows) and the results
// collapse to the "…do not match your selected filters" fallback section.
const exactOnly = ref(false)
const filtersApplied = computed(() => (exactOnly.value ? 1 : 0))

// When an ad size is provided, add a third right-rail column sized to the ad.
const gridStyle = computed(() =>
  props.adSize
    ? { gridTemplateColumns: `260px minmax(0, 1fr) ${props.adSize[0]}px` }
    : {}
)

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
      { name: 'Courtyard by Marriott Arena', stars: 3.5, distance: '0.8 mi from Main Arena', fromNightly: 169, total: 676, availability: 'available', seed: 7 },
      { name: 'Residence Inn Midtown', stars: 4, distance: '1.4 mi from Main Arena', fromNightly: 199, total: 796, availability: 'available', seed: 8 },
      { name: 'Hyatt Place Convention Center', stars: 4, distance: '0.9 mi from Main Arena', fromNightly: 209, total: 836, availability: 'available', seed: 9 },
      { name: 'La Quinta Inn & Suites', stars: 2.5, distance: '1.8 mi from Main Arena', fromNightly: 129, total: 516, availability: 'available', seed: 10 },
      { name: 'Aloft City Center', stars: 4, distance: '1.2 mi from Main Arena', fromNightly: 179, total: 716, availability: 'available', seed: 11 },
      { name: 'Sheraton Grand Downtown', stars: 4.5, distance: '0.5 mi from Main Arena', fromNightly: 239, total: 956, availability: 'available', seed: 12 },
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
      { name: 'Marriott Marquis', stars: 4.5, distance: '0.7 mi from Main Arena', startingPrice: 299, availability: 'matches', roomsAvailable: 12, seed: 7 },
      { name: 'Hilton Garden Inn', stars: 4, distance: '1.0 mi from Main Arena', startingPrice: 239, availability: 'matches', roomsAvailable: 6, seed: 8 },
      { name: 'Doubletree Convention Center', stars: 4, distance: '0.9 mi from Main Arena', startingPrice: 259, availability: 'matches', roomsAvailable: 9, seed: 9 },
      { name: 'The Westin Downtown', stars: 4.5, distance: '0.5 mi from Main Arena', startingPrice: 319, availability: 'matches', roomsAvailable: 7, seed: 12 },
      { name: 'Hyatt Regency', stars: 4, distance: '1.1 mi from Main Arena', startingPrice: 249, availability: 'matches', roomsAvailable: 10, seed: 11 },
      { name: 'Renaissance Hotel', stars: 4, distance: '1.3 mi from Main Arena', startingPrice: 279, availability: 'matches', roomsAvailable: 4, seed: 10 },
      { name: 'AC Hotel Midtown', stars: 4, distance: '1.5 mi from Main Arena', startingPrice: 229, availability: 'matches', roomsAvailable: 5, seed: 13 },
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

// Both flows render the Group Block card (horizontal) WITH the expandable
// Availability panel. Reserve-flow availability keys map onto the group card's
// states, and every hotel gets sample room-availability data.
const AVAIL_MAP = { available: 'matches', unmatched: 'partial', unavailable: 'unavailable' }
const displaySections = computed(() =>
  sections.value.map((s) => ({
    heading: s.heading,
    hotels: s.hotels.map((h) => ({
      name: h.name,
      stars: h.stars,
      distance: h.distance,
      preferred: h.preferred,
      seed: h.seed,
      imageCategories: h.imageCategories,
      startingPrice: h.startingPrice ?? h.fromNightly,
      availability: isGroup.value ? h.availability : (AVAIL_MAP[h.availability] || h.availability),
      roomsAvailable: h.roomsAvailable ?? 5,
      roomsMax: h.roomsMax ?? 4,
      roomsRequested: h.roomsRequested ?? 10,
      rooms: sampleRooms,
    })),
  }))
)
const resultCount = computed(() =>
  exactOnly.value ? 0 : sections.value.reduce((n, s) => n + s.hotels.length, 0)
)

// Group Block searches for a set number of rooms — surfaced in the results
// toolbar as "N properties available — searching for R rooms".
const roomsRequested = 2

// --- Pagination -------------------------------------------------------------
// The primary (matching) results section paginates; the trailing "don't match" /
// "no availability" sections show once, on the last page.
const PER_PAGE = 4
const page = ref(1)
const mainSection = computed(() => displaySections.value[0] || { hotels: [] })
const tailSections = computed(() => displaySections.value.slice(1))
// Exact Matches ON → no hotels match the strict filter, so the matching set is
// empty and only the fallback (tail) sections show.
const matchingHotels = computed(() => (exactOnly.value ? [] : mainSection.value.hotels))
const pageCount = computed(() => Math.max(1, Math.ceil(matchingHotels.value.length / PER_PAGE)))
const pagedMain = computed(() => {
  const start = (page.value - 1) * PER_PAGE
  return matchingHotels.value.slice(start, start + PER_PAGE)
})
const isLastPage = computed(() => page.value >= pageCount.value)

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
        <booking-widget :mode="isGroup ? 'group' : 'reservations'" :tabs="false" :show-mode="false" :show-teams="showTeams" :show-dates="true" />
      </div>
    </div>

    <!-- BODY: filters · results · (optional) ad rail -->
    <div class="hlp__container">
      <div class="hlp__grid" :style="gridStyle">
        <!-- LEFT: filter rail module -->
        <aside class="hlp__rail hlp__rail--left">
          <filter-rail v-model:exact-only="exactOnly" />
        </aside>

        <!-- MIDDLE: results toolbar + paginated list -->
        <div class="hlp__results">
          <!-- toolbar lives in the results column, aligned to the cards -->
          <results-toolbar
            v-model="sort"
            :count="resultCount"
            :filters-applied="filtersApplied"
            :rooms="isGroup ? roomsRequested : 0"
            class="hlp__toolbar"
            @clear-filters="exactOnly = false"
          />

          <!-- primary (matching) results — paginated -->
          <hotel-card-group
            v-for="(hotel, hi) in pagedMain"
            :key="'main-' + hi"
            v-bind="hotel"
            class="hlp__card"
          />

          <!-- trailing availability sections — shown on the last page -->
          <template v-if="isLastPage">
            <template v-for="(section, si) in tailSections" :key="'tail-' + si">
              <div v-if="section.heading" class="hlp__section">
                <hr class="hlp__section-rule" />
                <h3 class="hlp__section-heading">{{ section.heading }}</h3>
              </div>
              <hotel-card-group
                v-for="(hotel, hi) in section.hotels"
                :key="'tail-' + si + '-' + hi"
                v-bind="hotel"
                class="hlp__card"
              />
            </template>
          </template>

          <!-- pagination -->
          <div v-if="pageCount > 1" class="hlp__pagination">
            <q-pagination
              v-model="page"
              :max="pageCount"
              :max-pages="6"
              boundary-numbers
              direction-links
              color="primary"
            />
          </div>
        </div>

        <!-- RIGHT: optional sticky skyscraper Display Ad -->
        <aside v-if="adSize" class="hlp__rail hlp__rail--right">
          <div class="hlp__ads">
            <display-ad :width="adSize[0]" :height="adSize[1]" />
          </div>
        </aside>

      </div>
    </div>
  </div>
</template>

<style scoped>
.hlp { background: var(--ds-color-surface-sunken); }

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

/* search bar — white band directly under the hero */
.hlp__searchwrap { padding: 0; background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-border); }
.hlp__search {
  margin: 0;
  position: relative;
  z-index: 2;
}
/* The widget sits on the plain white band — drop its own card border/rounded
   corners; keep the individual field borders. */
.hlp__search :deep(.bw) { border: 0; border-radius: 0; }

/* content container */
.hlp__container { max-width: 1400px; margin: 0 auto; padding: 0 24px; }

/* results toolbar (sits at the top of the results column, aligned to cards) */
.hlp__toolbar { margin-bottom: 20px; }

/* pagination */
.hlp__pagination { display: flex; justify-content: center; margin-top: 12px; }

/* 3-column grid */
.hlp__grid {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  padding: 28px 0 40px;
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
