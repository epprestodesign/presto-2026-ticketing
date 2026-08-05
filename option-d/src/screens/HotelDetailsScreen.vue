<script setup>
// Hotel Details — a READ-ONLY reference view, on the LIBRARY page template.
//
// This is the design system's `Hotel Details / Book Reservation` page
// (`HotelDetailPage`), the same template Option A opens from its package modal —
// gallery, tabs, summary header, rooms, amenities, policies, map. Any link to a
// hotel details page in this prototype uses it; nothing hand-rolled.
//
// Never a stage of the journey. It opens in its OWN TAB when a hotel name is
// clicked on the board, so the grid behind it keeps its dates and party size —
// looking up a property should never cost the guest their place in the flow.
//
// Read-only means read-only. The template ships booking affordances (per-room
// "Reserve Room" CTAs, a back-to-results link, a search band that would re-run a
// search); all three are suppressed in CSS below and a banner says why, because
// the booking decision belongs to the tile in the other tab.
import { computed } from 'vue'
import HotelDetailPage from '@lib/components/details/HotelDetailPage.vue'
import { hotelBase } from '@lib/stories/details/_detail-data.js'
import { getAmenities } from '@lib/lib/amenities.js'
import { activeHotel, journey, setTab } from '../store.js'
import { roomsFor, NIGHTS } from '../packages.js'

const AMENITY_KEYS = {
  ritz: ['wifi', 'valet', 'pool', 'restaurant', 'fitness', 'breakfast', 'spa', 'concierge'],
  westin: ['wifi', 'valet', 'pool', 'restaurant', 'fitness', 'concierge'],
}

const ADDRESS = {
  ritz: '10 Avenue de Lafayette, Boston, MA',
  westin: '425 Summer St, Boston, MA',
}

// Option C's own room types, mapped into the shape the template's room cards
// read. `total` is the nightly rate for the CURRENT stay, so the page agrees
// with the board it was opened from.
const rooms = computed(() => {
  const hotel = activeHotel.value
  if (!hotel) return []
  const nights = NIGHTS
  return roomsFor(hotel.id).map((r, i) => ({
    roomType: r.name,
    bedConfig: r.bed,
    maxOccupancy: r.sleeps,
    imageCategories: [r.sleeps > 2 && r.sqft > 600 ? 'suites' : 'rooms'],
    seed: i,
    features: [
      { label: 'Space', value: `${r.sqft} sq ft` },
      { label: 'View', value: r.view },
      ...(r.included ? [{ label: 'Included', value: 'The room this package is priced around' }] : []),
    ],
    pricePerNight: hotel.nightlyRate + r.deltaPerNight,
    total: (hotel.nightlyRate + r.deltaPerNight) * nights,
    roomCount: 1,
    availability: r.roomsLeft === 0 ? 'soldout' : r.roomsLeft <= 3 ? 'limited' : 'available',
  }))
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
    roomsSubtitle:
      'Rates are for the two-night stay. To book, choose your package in the other tab.',
  }
})
</script>

<template>
  <div class="xhd xhd--readonly">
    <p class="xhd__note">
      <q-icon name="info" size="18px" />
      <span>
        <strong>Information only.</strong>
        This page is here to help you compare — pick your package in the other tab.
      </span>
    </p>

    <hotel-detail-page v-bind="args" :initial-tab="journey.tab" @update:tab="setTab" />
  </div>
</template>

<style scoped>
.xhd { display: flex; flex-direction: column; flex: 1; }

.xhd__note { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 0; padding: 12px 24px; background: var(--ds-color-surface-sunken, #f1f2f4); border-bottom: 1px solid var(--ds-color-border); color: var(--ds-color-text); }

/* Read-only: strip the booking affordances the template ships — the per-room
   "Reserve Room" CTAs, the back-to-results link, and the search band that would
   re-run a search. Same suppression Option A's read-only view uses. */
.xhd--readonly :deep(.rcr__cta),
.xhd--readonly :deep(.hdp__back),
.xhd--readonly :deep(.hdp__searchband) { display: none !important; }
</style>
