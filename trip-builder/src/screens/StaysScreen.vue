<script setup>
// Stays — Browse Hotels, the booking site's own surface.
//
// AUG 25 FEEDBACK. This screen used to be four ContractedHotelCard tiles in a
// grid. That card was built for the hotel ADD-ON step, where a hotel is a small
// thing you attach to an order that already exists — which is a fair description
// of an add-on and a poor description of the decision a guest is actually making
// here. The round asked for hotel search, details, room selection and checkout
// to match the real booking site, so this is now the real thing: hero band →
// BookingWidget search band → filter rail + ResultsToolbar + HotelCardReserve,
// every piece the library's own, composed the way /prototype's BrowseScreen and
// the sibling hotel-first compose them.
//
// WHY NOT the library's HotelListPage, which renders all of that from one tag:
// its event, its venue and its fourteen sample properties are its own, and its
// cards can only ever open its own hotels. A browse page whose results can't be
// driven by THIS app's catalogue cannot put a property into THIS app's trip.
// Composing the same parts costs this file and buys a page that is the booking
// site's Browse in every respect except whose data it shows.
import { ref, computed } from 'vue'
import ResultsToolbar from '@lib/components/browse/ResultsToolbar.vue'
import HotelCardReserve from '@lib/components/browse/HotelCardReserve.vue'
import BookingWidget from '@lib/components/BookingWidget.vue'
import epLogoWhite from '@lib/assets/eventpipe logos/eventpipe-logo-fff.svg'
import heroBg from '../../../background-img/defaultBackgroundImage.png'
import StayFilters from '../components/StayFilters.vue'
import { stayLine, openStay, nav } from '../store.js'
import { STAYS, EVENT, EVENT_DATE, EVENT_VENUE, stayById, lineTotal, money } from '../trip.js'
import { filterStays, sortStays, countFilters } from '../browse.js'

const heroStyle = { backgroundImage: `linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), url(${heroBg})` }

const filters = ref({})
const sort = ref('distance')
const railRef = ref(null)

// Cards are priced for the nights the trip already chose, so a guest who booked
// two nights and came back to compare is comparing two-night totals. Before
// there is a stay, one night is the honest floor rather than a guess.
const nights = computed(() => stayLine.value?.nights ?? 1)
const currentId = computed(() => stayLine.value?.hotelId ?? null)
const current = computed(() => (currentId.value ? stayById(currentId.value) : null))
// Priced from the line itself rather than re-derived here, so the number in this
// banner is the same number the cart, the rail and checkout are showing.
const stayTotal = computed(() => (stayLine.value ? lineTotal(stayLine.value) : 0))

const results = computed(() => sortStays(filterStays(STAYS, filters.value), sort.value))
const filtersApplied = computed(() => countFilters(filters.value))

// The three availability tiers the booking site groups results into — match,
// off-filter but bookable, sold out for the dates — each keeping the applied
// sort, with a firm line-break message between them. `results` is already
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
    seed: h.seed, imageCategories: h.imageCategories,
    // The Availability panel shows only the nights this stay actually covers —
    // a three-night grid under a one-night total would be answering a question
    // the guest hasn't asked yet.
    rooms: h.availByRoom.map((r) => ({ type: r.type, nightly: r.nightly, nights: r.nights.slice(0, nights.value) })),
    fromNightly: h.fromNightly,
    total: h.fromNightly * nights.value,
    availability: h.availability,
    // The property already in the trip says so on its own CTA. Adding and
    // editing are the same page, so they are also the same button — only its
    // label changes, because "Choose Your Room" would read as starting over.
    ctaLabel: h.id === currentId.value ? 'Edit your stay' : 'Choose Your Room',
  }
}

// The hotel NAME opens the same page the CTA does. HotelCardReserve emits
// `choose` from its button only, so the name is picked up from the click that
// bubbles out of it — no library file gains an event to make a heading a link.
function onResultsClick(e) {
  const el = e.target instanceof Element ? e.target.closest('.hc__name') : null
  if (!el) return
  const hotel = STAYS.find((s) => s.name === el.textContent.trim())
  if (hotel) openStay(hotel.id)
}
const clearFilters = () => railRef.value?.clearAll()
</script>

<template>
  <div class="bh">
    <!-- Hero band — the library HeroBanner "Hotel Listings" treatment. -->
    <section class="bhero" :style="heroStyle">
      <div class="bhero__inner">
        <img :src="epLogoWhite" alt="EventPipe" class="bhero__logo" />
        <h1 class="bhero__event">{{ EVENT.name }}</h1>
        <p class="bhero__dates">{{ EVENT_DATE }} · {{ EVENT_VENUE }}</p>
        <p class="bhero__note">A room is one line in your trip. It doesn't require tickets, and tickets don't require it.</p>
      </div>
    </section>

    <!-- Search band. `show-teams` is off: the widget's Registered Team(s) field
         opens an add-a-group MODAL, and this round removed every modal from the
         prototype. The Core widget — booking type, dates, travellers — is the
         one this flow can honour anyway. -->
    <div class="bwrap">
      <div class="bsearch">
        <booking-widget mode="reservations" :tabs="false" :show-mode="false" :show-teams="false" :show-dates="true" />
      </div>
    </div>

    <div class="bcontainer">
      <p v-if="stayLine" class="bswap">
        <q-icon name="swap_horiz" size="18px" />
        Your trip already holds <strong>{{ current.name }}</strong> —
        {{ stayLine.nights }} night{{ stayLine.nights === 1 ? '' : 's' }},
        {{ stayLine.rooms }} room{{ stayLine.rooms === 1 ? '' : 's' }}, {{ money(stayTotal) }}.
        Choosing another property swaps it; your tickets and add-ons are untouched.
      </p>

      <div class="bgrid">
        <stay-filters ref="railRef" class="brail" :nights="nights" @update:filters="filters = $event" />

        <div class="bresults" @click="onResultsClick">
          <results-toolbar v-model="sort" :count="results.length" :filters-applied="filtersApplied" @clear-filters="clearFilters" />

          <div v-if="results.length" class="bgroups">
            <div v-if="tier1.length" class="bcards">
              <hotel-card-reserve v-for="h in tier1" :key="h.id" v-bind="cardProps(h)" @choose="openStay(h.id)" />
            </div>
            <template v-if="tier2.length">
              <p class="bbreak">{{ MSG_UNMATCHED }}</p>
              <div class="bcards">
                <hotel-card-reserve v-for="h in tier2" :key="h.id" v-bind="cardProps(h)" @choose="openStay(h.id)" />
              </div>
            </template>
            <template v-if="tier3.length">
              <p class="bbreak">{{ MSG_UNAVAILABLE }}</p>
              <div class="bcards">
                <hotel-card-reserve v-for="h in tier3" :key="h.id" v-bind="cardProps(h)" @choose="openStay(h.id)" />
              </div>
            </template>
          </div>

          <div v-else class="bempty">
            <h3>No properties match your search</h3>
            <p>Try widening the radius, lifting the star floor, or clearing a brand — the block is ten properties deep.</p>
          </div>

          <p class="bfoot">
            Rates are per room per night, before taxes.
            <button type="button" class="bfoot__link" @click="nav('tickets')">Tickets</button> and
            <button type="button" class="bfoot__link" @click="nav('addons')">add-ons</button>
            are bought separately, whenever you feel like it.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bh { display: flex; flex-direction: column; flex: 1; }

/* Hero band — full-bleed, inner content in the shared column. */
.bhero { background-color: #000; background-size: cover; background-position: center; color: #fff; }
.bhero__inner { max-width: 1180px; margin-inline: auto; padding: 30px 24px; text-align: center; }
.bhero__logo { height: 30px; width: auto; margin-bottom: 12px; opacity: .95; }
.bhero__event { margin: 0; font-size: 1.5rem; font-weight: 700; line-height: 1.15; }
.bhero__dates { margin: 6px 0 0; opacity: .85; font-size: 1rem; }
.bhero__note { margin: 10px 0 0; font-size: .9375rem; font-weight: 600; opacity: .95; }

/* Widget band — full-bleed white, inner content in the column. */
.bwrap { background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-border); }
.bsearch { max-width: 1180px; margin-inline: auto; padding: 16px 24px; }
/* The band supplies the white surface, so the widget's own card chrome comes
   off — the fields read directly on the band, as they do on Browse. */
.bsearch :deep(.bw) { border: 0; border-radius: 0; padding: 0; background: transparent; }

.bcontainer { width: 100%; max-width: 1180px; margin-inline: auto; padding: 24px 24px 48px; }
.bswap { display: flex; align-items: center; gap: 8px; margin: 0 0 18px; padding: 10px 14px; border-radius: var(--ds-radius-md, 8px); background: var(--ds-palette-amber-100, #fff5db); font-size: .9375rem; color: var(--ds-color-text); }
.bswap__q { font-weight: 600; }

.bgrid { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 28px; align-items: start; }
.bresults { min-width: 0; display: flex; flex-direction: column; gap: 18px; }
.bgroups { display: flex; flex-direction: column; gap: 20px; }
.bcards { display: flex; flex-direction: column; gap: 20px; }
.bbreak { margin: 4px 0; padding-top: 22px; border-top: 1px solid var(--ds-color-border); color: var(--ds-color-text-subtle); font-size: .9375rem; font-weight: 600; line-height: 1.4; }
.bempty { padding: 48px 24px; text-align: center; color: var(--ds-color-text-subtle); }
.bempty h3 { color: var(--ds-color-text-brand); margin: 0 0 8px; font-size: 1.25rem; }

.bfoot { margin: 6px 0 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.bfoot__link { appearance: none; padding: 0; border: 0; background: none; font: inherit; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }

/* The card's total is the stay's PRE-TAX total here, because this prototype
   levies tax once, on the whole trip, at the trip level. The library caption
   "Total includes taxes & fees" is true on the booking site and would be a
   number the trip rail then contradicts, so it is dropped rather than the
   figure being inflated to match it. */
.bresults :deep(.hc__taxes) { display: none; }

/* The hotel name reads as a link to its details page. */
.bresults :deep(.hc__name) { cursor: pointer; }
.bresults :deep(.hc__name:hover) { text-decoration: underline; }

@media (max-width: 900px) { .bgrid { grid-template-columns: 1fr; } }
</style>
