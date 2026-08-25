<script setup>
// Stage 1 — Browse Hotels. Built the way the sibling /prototype app builds it,
// deliberately: hero banner → BookingWidget search band → filter rail + results
// toolbar + HotelCardReserve list, every piece the REAL library component, driven
// by the Orlando block dataset with real filter and sort logic.
//
// The library also ships HotelListPage, which renders this whole page in one tag —
// and the fork this app came from used it. It was dropped here because its event
// name, its venue and its fourteen sample hotels are hardcoded Foxborough: a
// tournament in Orlando cannot borrow that page without contradicting itself on
// screen. Composing the same parts costs this file and buys a page that is the
// booking site's Browse in every respect except its data.
//
// Card CTA or hotel name → that hotel's Details page.
//
// THE MAP IS A VIEW OF THIS PAGE, NOT A POP-UP (Aug 25). "View Map" in the rail
// used to open a full-screen DsModal. It now switches this column: the results
// list is replaced by HotelMapPanel, the filter rail stays put and keeps
// working, and "Back to list" switches back. Same amount of map, none of the
// modal — and the guest can still filter what the pins are showing, which they
// could not do behind a scrim.
import { ref, computed } from 'vue'
import ResultsToolbar from '@lib/components/browse/ResultsToolbar.vue'
import HotelCardReserve from '@lib/components/browse/HotelCardReserve.vue'
import BookingWidget from '@lib/components/BookingWidget.vue'
import epLogoWhite from '@lib/assets/eventpipe logos/eventpipe-logo-fff.svg'
import heroBg from '../../../background-img/defaultBackgroundImage.png'
import HotelFilters from '../components/HotelFilters.vue'
import HotelMapPanel from '../components/HotelMapPanel.vue'
import { HOTELS, filterHotels, sortHotels, countFilters, FULL_RADIUS } from '../hotels.js'
import { EVENT } from '../event.js'
import { openHotel } from '../store.js'

const heroStyle = { backgroundImage: `linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), url(${heroBg})` }

const filters = ref({})
const sort = ref('distance')
const railRef = ref(null)

const results = computed(() => sortHotels(filterHotels(HOTELS, filters.value), sort.value))
const filtersApplied = computed(() => countFilters(filters.value))

// Results are grouped into availability tiers — (1) match, (2) have availability
// but fall outside the filters, (3) sold out for the dates — each carrying the
// applied sort, with a firm line-break message between them. `results` is already
// filtered and sorted, so filtering each tier preserves the order.
const tier1 = computed(() => results.value.filter((h) => h.availability === 'available'))
const tier2 = computed(() => results.value.filter((h) => h.availability === 'unmatched'))
const tier3 = computed(() => results.value.filter((h) => h.availability === 'unavailable'))
const MSG_UNMATCHED = 'The below hotels have availability for your selected dates but do not match your selected filters'
const MSG_UNAVAILABLE = 'The below hotels do not have availability for your selected dates'

function cardProps(h) {
  return {
    name: h.name, city: h.city, stars: h.stars, distance: h.distance,
    preferred: h.preferred, refundable: h.refundable, lowRateGuarantee: h.lowRateGuarantee,
    seed: h.seed, imageCategories: h.imageCategories, rooms: h.rooms,
    fromNightly: h.fromNightly, total: h.total, availability: h.availability,
  }
}
const clearFilters = () => railRef.value?.clearAll()

// ── Map view ──
// The pending radius lives in the RAIL (see HotelFilters' defineExpose), not
// here: the map and the rail's own slider have to move the same number, and the
// rail is where every other pending filter already lives. Keeping a second copy
// on this screen would let the two disagree between Applies.
const mapOpen = ref(false)
const mapRadius = computed({
  get: () => railRef.value?.raw?.radius ?? FULL_RADIUS,
  set: (v) => { if (railRef.value?.raw) railRef.value.raw.radius = v },
})
// Applying from the map commits the radius through the rail's own Apply and
// returns to the list — the results the guest just narrowed are the thing they
// asked to see, so landing them back on the map would waste the click.
function applyFromMap() {
  railRef.value?.apply()
  mapOpen.value = false
}
</script>

<template>
  <div class="bhotels">
    <!-- Hero band — the library HeroBanner "Hotel Listings" treatment. -->
    <section class="bhero" :style="heroStyle">
      <div class="bhero__inner">
        <img :src="epLogoWhite" alt="EventPipe" class="bhero__logo" />
        <h1 class="bhero__event">{{ EVENT.name }}</h1>
        <p class="bhero__dates">{{ EVENT.dates }} · {{ EVENT.venueShort }}</p>
      </div>
    </section>

    <!-- Search band -->
    <div class="bwrap">
      <div class="bsearch">
        <booking-widget mode="reservations" :tabs="false" :show-mode="false" :show-teams="true" :show-dates="true" />
      </div>
    </div>

    <!-- Results -->
    <div class="bcontainer">
      <div class="bgrid">
        <hotel-filters ref="railRef" class="brail" :hotels="results" @update:filters="filters = $event" @expand="mapOpen = true" />

        <!-- Map view — the same column, switched. No dialog, no scrim. -->
        <hotel-map-panel
          v-if="mapOpen" class="bmap"
          :hotels="results" :radius="mapRadius"
          @update:radius="mapRadius = $event" @apply="applyFromMap" @close="mapOpen = false"
        />

        <div v-else class="bresults">
          <results-toolbar v-model="sort" :count="results.length" :filters-applied="filtersApplied" @clear-filters="clearFilters" />
          <div v-if="results.length" class="bgroups">
            <div v-if="tier1.length" class="bcards">
              <hotel-card-reserve v-for="h in tier1" :key="h.id" v-bind="cardProps(h)" @choose="openHotel(h.id, 'rooms')" />
            </div>
            <template v-if="tier2.length">
              <p class="bbreak">{{ MSG_UNMATCHED }}</p>
              <div class="bcards">
                <hotel-card-reserve v-for="h in tier2" :key="h.id" v-bind="cardProps(h)" @choose="openHotel(h.id, 'rooms')" />
              </div>
            </template>
            <template v-if="tier3.length">
              <p class="bbreak">{{ MSG_UNAVAILABLE }}</p>
              <div class="bcards">
                <hotel-card-reserve v-for="h in tier3" :key="h.id" v-bind="cardProps(h)" @choose="openHotel(h.id, 'rooms')" />
              </div>
            </template>
          </div>
          <div v-else class="bempty">
            <h3>No properties match your search</h3>
            <p>Try adjusting your filters, widening your search radius, or changing your dates to see more of the tournament block.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bhotels { display: flex; flex-direction: column; flex: 1; }

/* Hero band — full-bleed, inner content in the shared column. */
.bhero { background-color: #000; background-size: cover; background-position: center; color: #fff; }
.bhero__inner { max-width: 1180px; margin-inline: auto; padding: 30px 24px; text-align: center; }
.bhero__logo { height: 30px; width: auto; margin-bottom: 12px; opacity: 0.95; }
.bhero__event { margin: 0; font-size: 1.5rem; font-weight: 700; line-height: 1.15; }
.bhero__dates { margin: 6px 0 0; opacity: 0.85; font-size: 1rem; }

/* Widget band — full-bleed white, inner content in the column. */
.bwrap { background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-border); }
.bsearch { max-width: 1180px; margin-inline: auto; padding: 16px 24px; }
/* The band supplies the white surface, so drop the widget's own card chrome —
   the fields read directly on the band, as they do on the booking site's Browse. */
.bsearch :deep(.bw) { border: 0; border-radius: 0; padding: 0; background: transparent; }

.bcontainer { max-width: 1180px; margin-inline: auto; padding: 28px 24px 48px; }
.bgrid { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 28px; align-items: start; }
.bresults { min-width: 0; display: flex; flex-direction: column; gap: 18px; }
/* The map takes the results column's slot; it brings its own internal rhythm,
   so it gets width constraints only. */
.bmap { min-width: 0; }
.bgroups { display: flex; flex-direction: column; gap: 20px; }
.bcards { display: flex; flex-direction: column; gap: 20px; }
.bbreak { margin: 4px 0; padding-top: 22px; border-top: 1px solid var(--ds-color-border); color: var(--ds-color-text-subtle); font-size: 0.9375rem; font-weight: 600; line-height: 1.4; }
.bempty { padding: 48px 24px; text-align: center; color: var(--ds-color-text-subtle); }
.bempty h3 { color: var(--ds-color-text-brand); margin: 0 0 8px; font-size: 1.25rem; }

/* The hotel name reads as a link to its Details page (routed in App.vue). */
.bresults :deep(.hc__name) { cursor: pointer; }
.bresults :deep(.hc__name:hover) { text-decoration: underline; }

@media (max-width: 900px) { .bgrid { grid-template-columns: 1fr; } }
</style>
