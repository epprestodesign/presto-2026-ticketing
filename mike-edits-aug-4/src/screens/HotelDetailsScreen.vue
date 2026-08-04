<script setup>
// Hotel Details — a READ-ONLY reference view (Aug 4 rework v2).
//
// This screen is no longer part of the journey. It opens in its own tab when a
// hotel or brand name is clicked in the package modal, purely to help someone
// decide: photos, amenities, rooms, location, policies. Nothing here is
// selectable — the room choice belongs to the package modal in the other tab, so
// the booking CTAs are suppressed and a banner says why.
import { computed } from 'vue'
import HotelDetailPage from '@lib/components/details/HotelDetailPage.vue'
import { hotelBase, reserveRooms } from '@lib/stories/details/_detail-data.js'
import { journey, setTab } from '../store.js'

const args = computed(() => ({
  ...hotelBase,
  name: journey.activeHotel || hotelBase.name,
  rooms: reserveRooms,
  roomsFlow: 'reserve',
  roomsSubtitle: 'Room types at this property. To book, choose your room on the package in the other tab.',
}))
</script>

<template>
  <div class="xhd xhd--readonly">
    <p class="xhd__note">
      <q-icon name="info" size="18px" />
      <span>
        <strong>Information only.</strong>
        This page is here to help you compare — pick your hotel and room on the package itself.
      </span>
    </p>

    <hotel-detail-page v-bind="args" :initial-tab="journey.tab" @update:tab="setTab" />
  </div>
</template>

<style scoped>
.xhd { display: flex; flex-direction: column; flex: 1; }

.xhd__note { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 0; padding: 12px 24px; background: var(--ds-color-surface-sunken, #f1f2f4); border-bottom: 1px solid var(--ds-color-border); color: var(--ds-color-text); }

/* Read-only: strip the booking affordances — the room "Reserve Room" CTAs, the
   back-to-results link, and the search band that would re-run a search. */
.xhd--readonly :deep(.rcr__cta),
.xhd--readonly :deep(.hdp__back),
.xhd--readonly :deep(.hdp__searchband) { display: none !important; }
</style>
