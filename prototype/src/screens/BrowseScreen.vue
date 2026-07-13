<script setup>
// Stage 1 — Browse Hotels (prototype-built, data-driven). Full fidelity using the
// REAL library pieces — hero + BookingWidget + filter fields + ResultsToolbar +
// hotel cards — but driven by the 60-hotel dataset with real filter + sort logic.
// Card CTA / hotel name → that hotel's Details page. Zero library changes.
import { ref, computed } from 'vue'
import { journey, cartMode, roomsFlow, cartVisible, checkoutMode, openHotel } from '../store.js'
import { HOTELS, filterHotels, sortHotels, countFilters, groupAvailability, getHotelByName } from '../hotels.js'
import { cartFor, EVENT } from '../fixtures.js'
import PageFrame from '@lib/components/PageFrame.vue'
import BookingWidget from '@lib/components/BookingWidget.vue'
import ResultsToolbar from '@lib/components/browse/ResultsToolbar.vue'
import HotelCardReserve from '@lib/components/browse/HotelCardReserve.vue'
import HotelCardGroup from '@lib/components/browse/HotelCardGroup.vue'
import BrowseFilters from '../BrowseFilters.vue'
import epLogoWhite from '@lib/assets/eventpipe logos/eventpipe-logo-fff.svg'
// Same banner asset the library HeroBanner "Hotel Listings" story uses — a
// background image behind a dark scrim (event name + dates overlay).
import heroBg from '@lib/../background-img/defaultBackgroundImage.png'
const heroStyle = { backgroundImage: `linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), url(${heroBg})` }

const filters = ref({})
const sort = ref('distance')
const railRef = ref(null)
const isGroup = computed(() => journey.flow === 'group')

const results = computed(() => sortHotels(filterHotels(HOTELS, filters.value, roomsFlow.value), sort.value, roomsFlow.value))
const filtersApplied = computed(() => countFilters(filters.value))
const navCart = computed(() => (journey.cart.length ? cartFor(journey.cart, checkoutMode.value) : {}))

// A hotel record → the props its card expects (reserve vs group differ).
function cardProps(h) {
  const base = { name: h.name, city: h.city, stars: h.stars, distance: h.distance, preferred: h.preferred, seed: h.seed, imageCategories: h.imageCategories, rooms: h.rooms }
  if (isGroup.value) {
    return { ...base, flow: 'group', startingPrice: h.startingPrice, availability: groupAvailability(h.availability), roomsAvailable: h.roomsAvailable, roomsMax: h.roomsMax, roomsRequested: 1, refundable: h.refundable, lowRateGuarantee: h.lowRateGuarantee }
  }
  return { ...base, fromNightly: h.fromNightly, total: h.total, availability: h.availability }
}
const open = (h) => openHotel(getHotelByName(h.name) || h)
const clearFilters = () => railRef.value?.clearAll()
</script>

<template>
  <page-frame brand="Presto" :cart-mode="cartMode" :show-cart="cartVisible" :cart="navCart">
    <!-- Hero band (Hotel Listings banner: bg image + scrim) -->
    <section class="bhero" :style="heroStyle">
      <div class="bhero__inner">
        <img :src="epLogoWhite" alt="EventPipe" class="bhero__logo" />
        <h1 class="bhero__event">{{ EVENT.name }}</h1>
        <p class="bhero__dates">{{ EVENT.dates }}</p>
      </div>
    </section>

    <!-- Booking widget band -->
    <div class="bwrap">
      <div class="bsearch">
        <booking-widget :mode="isGroup ? 'group' : 'reservations'" :tabs="false" :show-mode="false" :show-teams="false" :show-dates="true" />
      </div>
    </div>

    <!-- Results -->
    <div class="bcontainer">
      <div class="bgrid">
        <browse-filters ref="railRef" class="brail" :hotels="results" @update:filters="filters = $event" />
        <div class="bresults">
          <results-toolbar v-model="sort" :count="results.length" :filters-applied="filtersApplied" @clear-filters="clearFilters" />
          <div v-if="results.length" class="bcards">
            <component
              :is="isGroup ? HotelCardGroup : HotelCardReserve"
              v-for="h in results" :key="h.id"
              v-bind="cardProps(h)"
              @choose="open(h)" @select="open(h)"
            />
          </div>
          <div v-else class="bempty">
            <h3>No properties match your search</h3>
            <p>Try adjusting your filters, widening your search radius, or changing your dates to see more hotels.</p>
          </div>
        </div>
      </div>
    </div>
  </page-frame>
</template>

<style scoped>
/* Hero band — full-bleed navy, inner content in the shared column. */
.bhero { background-color: #000; background-size: cover; background-position: center; color: #fff; }
/* Compact banner matching the library HeroBanner "Hotel Listings" variant —
   logo, event name and dates sit close together (not vertically spread). */
.bhero__inner { max-width: var(--col); margin-inline: auto; padding: 30px 24px; text-align: center; }
.bhero__logo { height: 30px; width: auto; margin-bottom: 12px; opacity: 0.95; }
.bhero__event { margin: 0; font-size: 1.5rem; font-weight: 700; line-height: 1.15; }
.bhero__dates { margin: 6px 0 0; opacity: 0.85; font-size: 1rem; }

/* Widget band — full-bleed white, inner content in the column. */
.bwrap { background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-border); }
.bsearch { max-width: var(--col); margin-inline: auto; padding: 16px 24px; }
/* Browse band sits inside its own white strip, so drop the BookingWidget's inner
   card chrome (border, rounded corners, background, inner padding) — the fields
   read directly on the band. Browse only; the landing page keeps its card. */
.bsearch :deep(.bw) { border: 0; border-radius: 0; padding: 0; background: transparent; }

/* Results container — the shared column. */
.bcontainer { max-width: var(--col); margin-inline: auto; padding: 28px 24px 48px; }
.bgrid { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 28px; align-items: start; }
.bresults { min-width: 0; display: flex; flex-direction: column; gap: 18px; }
.bcards { display: flex; flex-direction: column; gap: 20px; }
.bempty { padding: 48px 24px; text-align: center; color: var(--ds-color-text-subtle); }
.bempty h3 { color: var(--ds-color-text-brand); margin: 0 0 8px; font-size: 1.25rem; }

@media (max-width: 900px) { .bgrid { grid-template-columns: 1fr; } }
</style>
