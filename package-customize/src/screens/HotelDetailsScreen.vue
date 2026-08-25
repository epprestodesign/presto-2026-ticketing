<script setup>
// Hotel Details — the LIBRARY page template, with its rooms section made part of
// the customize surface.
//
// This is the design system's `Hotel Details / Book Reservation` page
// (`HotelDetailPage`) — gallery, tabs, summary header, rooms, amenities,
// policies, map. Any link to a hotel in this prototype opens it.
//
// It opens in its OWN TAB, so the customize screen behind it keeps every choice
// made so far. Looking a property up should never cost the guest their work.
//
// --- Not a dead end ----------------------------------------------------------
// The rooms section lists this hotel's real room types, each priced as THE WHOLE
// PACKAGE with that room in it, plus what switching would do to the total.
// Picking one writes the hotel AND the room into the configuration and continues
// to the customize screen in this tab.
//
// So the tab is a second door onto the same two choices the customize screen
// makes — which is why both price a room through `priceConfiguration()`. A room
// that costs one thing on the customize screen and another here would make the
// tab worse than useless.
//
// The cards are ours (see RoomPackageCard for why the library's room-shaped card
// couldn't carry package semantics), but the SECTION around them is still the
// template's: `RoomsCarousel` keeps rendering the heading and the rules, only its
// grid is suppressed, and these are teleported into `#hdp-rooms` so the Rooms tab
// still scrolls to the right place.
import { computed, ref, onMounted } from 'vue'
import HotelDetailPage from '@lib/components/details/HotelDetailPage.vue'
import { hotelBase } from '@lib/stories/details/_detail-data.js'
import { getAmenities } from '@lib/lib/amenities.js'
import RoomPackageCard from '../components/RoomPackageCard.vue'
import { journey, activeHotel, priced, setTab, useRoomFromHotelPage } from '../store.js'
import { priceConfiguration, roomsFor, NIGHTS, STAY_SHORT } from '../packages.js'

const AMENITY_KEYS = {
  ritz: ['wifi', 'valet', 'pool', 'restaurant', 'fitness', 'breakfast', 'spa', 'concierge'],
  westin: ['wifi', 'valet', 'pool', 'restaurant', 'fitness', 'concierge'],
  'foxborough-inn': ['wifi', 'parking', 'breakfast', 'fitness'],
}

const ADDRESS = {
  ritz: '10 Avenue de Lafayette, Boston, MA',
  westin: '425 Summer St, Boston, MA',
  'foxborough-inn': '35 Washington St, Foxborough, MA',
}

// A hypothetical configuration: the guest's current one, moved to this hotel and
// this room. Every price on this page is that object run through
// `priceConfiguration()` — the same function the customize screen prices with, so
// a room quoted here costs the same when they get back there.
const configWith = (roomId) => ({ ...journey.config, hotelId: activeHotel.value.id, roomId })

const roomCards = computed(() => {
  const hotel = activeHotel.value
  return roomsFor(hotel.id).map((room) => {
    // The whole priced object goes to the card, not three numbers picked off it:
    // the card now renders the breakdown as well as the total, and two paths to
    // the same figure is exactly the drift this tab exists to avoid.
    const p = priceConfiguration(configWith(room.id))
    return {
      room,
      hotel,
      priced: p,
      delta: p.packagePrice - priced.value.packagePrice,
      selected: journey.config.hotelId === hotel.id && journey.config.roomId === room.id,
    }
  })
})

// Rooms still go to the template so its section header and layout are unchanged;
// the grid itself is hidden in CSS below and these cards take its place.
const rooms = computed(() =>
  roomsFor(activeHotel.value.id).map((r) => ({
    roomType: r.name,
    bedConfig: r.bed,
    maxOccupancy: r.sleeps,
    imageCategories: [r.sleeps > 2 && r.sqft > 600 ? 'suites' : 'rooms'],
    seed: 0,
    pricePerNight: activeHotel.value.nightlyRate + r.deltaPerNight,
    total: (activeHotel.value.nightlyRate + r.deltaPerNight) * NIGHTS,
    roomCount: 1,
    availability: r.roomsLeft === 0 ? 'soldout' : r.roomsLeft <= 3 ? 'limited' : 'available',
  }))
)

const args = computed(() => {
  const hotel = activeHotel.value
  return {
    ...hotelBase,
    name: hotel.name,
    stars: Math.round(hotel.rating),
    score: hotel.rating,
    address: ADDRESS[hotel.id] || hotelBase.address,
    distance: `${hotel.distanceMi} mi from Gillette Stadium`,
    ratingLabel: hotel.rating >= 4.6 ? 'Exceptional' : 'Very good',
    popularAmenities: getAmenities(AMENITY_KEYS[hotel.id] || ['wifi', 'parking', 'breakfast']),
    rooms: rooms.value,
    roomsFlow: 'reserve',
    roomsTitle: 'Room types at this property',
    roomsSubtitle: `Each price below is your WHOLE package with that room in it — ${STAY_SHORT}, tickets and extras included — for your current party of ${priced.value.guests}.`,
  }
})

// Teleport needs its target in the DOM. HotelDetailPage renders synchronously, so
// one tick after mount is enough; the guard just keeps Vue from warning on the
// first render pass.
const mounted = ref(false)
onMounted(() => { mounted.value = true })

// "Price details" no longer opens anything of this screen's — each card unfolds
// its own breakdown in place, from the same priced object it renders its total
// from, so a room the guest doesn't hold still explains the price on ITS button
// rather than the one they have. See RoomPackageCard.
const select = (room) => useRoomFromHotelPage(activeHotel.value.id, room.id)
</script>

<template>
  <div class="xhd xhd--packaged">
    <p class="xhd__note">
      <q-icon name="open_in_new" size="18px" />
      <span>
        <strong>Opened in a new tab.</strong>
        Compare as long as you like — picking a room here puts it in your package and continues
        in this tab, and the tab you came from keeps everything you'd chosen.
      </span>
    </p>

    <hotel-detail-page v-bind="args" :initial-tab="journey.tab" @update:tab="setTab" />

    <!-- Into the template's own Rooms section, so the Rooms tab still lands on it
         and the heading above it is still the template's. -->
    <Teleport v-if="mounted" to="#hdp-rooms">
      <div class="xhd__rooms">
        <room-package-card
          v-for="c in roomCards" :key="c.room.id"
          :room="c.room" :hotel="c.hotel" :priced="c.priced"
          :delta="c.delta" :selected="c.selected"
          @select="select"
        />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.xhd { display: flex; flex-direction: column; flex: 1; }

.xhd__note { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 0; padding: 12px 24px; background: var(--ds-color-surface-sunken, #f1f2f4); border-bottom: 1px solid var(--ds-color-border); color: var(--ds-color-text); }

/* The template ships two affordances this flow has no destination for: a
   back-to-results link (there is no results list — the tab was opened cold) and
   a search band that would re-run a search (the stay is fixed). Both stay
   suppressed. */
.xhd--packaged :deep(.hdp__back),
.xhd--packaged :deep(.hdp__searchband) { display: none !important; }

/* The template's room-card grid gives way to the teleported package cards. The
   section heading and rules around them are still RoomsCarousel's. */
.xhd--packaged :deep(#hdp-rooms .rcar__grid) { display: none !important; }
.xhd--packaged :deep(#hdp-rooms) { display: flex; flex-direction: column; gap: 4px; }

.xhd__rooms { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px; align-items: stretch; }
</style>
