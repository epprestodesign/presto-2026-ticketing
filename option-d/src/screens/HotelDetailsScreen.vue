<script setup>
// Hotel Details — the LIBRARY page template, with one section made actionable.
//
// This is the design system's `Hotel Details / Book Reservation` page
// (`HotelDetailPage`) — gallery, tabs, summary header, rooms, amenities,
// policies, map. Any link to a hotel details page in this prototype uses it.
//
// It opens in its OWN TAB when a hotel name is clicked, so the board behind it
// keeps its party size — looking up a property should never cost the guest their
// place in the flow.
//
// --- Aug 5 (afternoon) feedback ---------------------------------------------
// "Room types at this property" used to end in a Price Details link and nothing
// else: the template's per-room "Reserve Room" CTA was suppressed, because the
// booking decision belonged to the other tab. That made this a dead end — you
// could read everything about a hotel and still have to go back to act on it.
//
// The room card now SELECTS THE PACKAGE, with the same experience the package
// cards give: the same party-size select bound to the same store value, the same
// price block showing the package total, a primary CTA, and Price details
// demoted to the secondary link beside it. Selecting navigates THIS tab to
// checkout; the tab it was opened from is untouched.
//
// The card itself is Option D's (see RoomPackageCard for why the library's
// room-shaped card couldn't carry package semantics) — but the SECTION around it
// is still the template's. `RoomsCarousel` keeps rendering the heading and the
// rules; only its grid of room cards is suppressed, and this card is teleported
// into `#hdp-rooms` in its place so the Rooms tab still scrolls to it.
import { computed, ref, onMounted } from 'vue'
import HotelDetailPage from '@lib/components/details/HotelDetailPage.vue'
import { hotelBase } from '@lib/stories/details/_detail-data.js'
import { getAmenities } from '@lib/lib/amenities.js'
import RoomPackageCard from '../components/RoomPackageCard.vue'
import PackagePriceDialog from '../components/PackagePriceDialog.vue'
import {
  activeHotel, journey, setTab, packages, setPeople,
  selectPackageForHotel, MAX_PEOPLE,
} from '../store.js'
import { roomsFor, NIGHTS, STAY_SHORT } from '../packages.js'

const AMENITY_KEYS = {
  ritz: ['wifi', 'valet', 'pool', 'restaurant', 'fitness', 'breakfast', 'spa', 'concierge'],
  westin: ['wifi', 'valet', 'pool', 'restaurant', 'fitness', 'concierge'],
}

const ADDRESS = {
  ritz: '10 Avenue de Lafayette, Boston, MA',
  westin: '425 Summer St, Boston, MA',
}

// Option D sells one room type per hotel — the one the package covers.
const room = computed(() => roomsFor(activeHotel.value?.id)[0] || null)

// This hotel's package, priced for the current party. The card's headline is the
// package total, so it has to come from the same place the board's does.
const pkg = computed(() => packages.value.find((p) => p.hotel.id === activeHotel.value?.id) || null)

const people = computed(() => journey.people)

// Rooms still go to the template so its section header and layout are unchanged;
// the grid itself is hidden in CSS below and this card takes its place.
const rooms = computed(() => {
  const hotel = activeHotel.value
  const r = room.value
  if (!hotel || !r) return []
  return [{
    roomType: r.name,
    bedConfig: r.bed,
    maxOccupancy: r.sleeps,
    imageCategories: [r.sleeps > 2 && r.sqft > 600 ? 'suites' : 'rooms'],
    seed: 0,
    pricePerNight: hotel.nightlyRate + r.deltaPerNight,
    total: (hotel.nightlyRate + r.deltaPerNight) * NIGHTS,
    roomCount: 1,
    availability: r.roomsLeft === 0 ? 'soldout' : r.roomsLeft <= 3 ? 'limited' : 'available',
  }]
})

const args = computed(() => {
  const hotel = activeHotel.value
  return {
    ...hotelBase,
    name: hotel?.name || hotelBase.name,
    stars: Math.round(hotel?.rating ?? 4),
    score: hotel?.rating ?? null,
    address: ADDRESS[hotel?.id] || hotelBase.address,
    distance: `${hotel?.distanceMi} mi from Gillette Stadium`,
    ratingLabel: (hotel?.rating ?? 0) >= 4.6 ? 'Exceptional' : 'Very good',
    popularAmenities: getAmenities(AMENITY_KEYS[hotel?.id] || ['wifi', 'parking', 'breakfast']),
    rooms: rooms.value,
    roomsFlow: 'reserve',
    roomsTitle: 'Room types at this property',
    roomsSubtitle: `One room type is held for this package. The price shown is the whole package for your party — ${STAY_SHORT}, tickets, transportation and hospitality included.`,
  }
})

// Teleport needs its target in the DOM. HotelDetailPage renders synchronously,
// so one tick after mount is enough; the guard just keeps Vue from warning on
// the first render pass.
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const priceOpen = ref(false)
const openPrice = () => { priceOpen.value = true }
const select = () => selectPackageForHotel(activeHotel.value?.id)
</script>

<template>
  <div class="xhd xhd--packaged">
    <p class="xhd__note">
      <q-icon name="open_in_new" size="18px" />
      <span>
        <strong>Opened in a new tab.</strong>
        Compare as long as you like — selecting the package here continues in this tab,
        and the tab you came from keeps its place.
      </span>
    </p>

    <hotel-detail-page v-bind="args" :initial-tab="journey.tab" @update:tab="setTab" />

    <!-- Into the template's own Rooms section, so the Rooms tab still lands on
         it and the heading above it is still the template's. -->
    <Teleport v-if="mounted && room && pkg" to="#hdp-rooms">
      <room-package-card
        :room="room" :pkg="pkg"
        :people="people" :max-people="MAX_PEOPLE"
        @update:people="setPeople"
        @select="select"
        @price-details="openPrice"
      />
    </Teleport>

    <package-price-dialog v-model="priceOpen" :pkg="pkg" @select="select" />
  </div>
</template>

<style scoped>
.xhd { display: flex; flex-direction: column; flex: 1; }

.xhd__note { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 0; padding: 12px 24px; background: var(--ds-color-surface-sunken, #f1f2f4); border-bottom: 1px solid var(--ds-color-border); color: var(--ds-color-text); }

/* The template ships two affordances this flow has no destination for: a
   back-to-results link (there is no results list — the tab was opened cold) and
   a search band that would re-run a search (the stay is fixed). Both stay
   suppressed. The room CTA is no longer among them: the card below now selects
   the package. */
.xhd--packaged :deep(.hdp__back),
.xhd--packaged :deep(.hdp__searchband) { display: none !important; }

/* The template's room-card grid gives way to the teleported package card. The
   section heading and rules around it are still RoomsCarousel's. */
.xhd--packaged :deep(#hdp-rooms .rcar__grid) { display: none !important; }
/* The teleported card lands as a sibling of `.rcar` inside the section. */
.xhd--packaged :deep(#hdp-rooms) { display: flex; flex-direction: column; gap: 4px; }
</style>
