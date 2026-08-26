<script setup>
// Screen 1 — TICKETS, and since this round SEATS as well.
//
// It replaces TicketTierList (pick a price level, then pick seats on a separate
// VenueMap screen) with the library's TicketMap, mounted the way the sibling
// /experience prototype's TicketsScreen.vue mounts it: the Browse-Hotels hero
// banner over the two-pane browse — an "Authenticated NFL Tickets" listings rail
// beside the interactive Gillette map, every listing its own price pin.
//
// The map is a real offer, not a level: section, row, all-in price, and a
// view-from-that-seat photo. That is why the separate seats screen went away
// rather than moving — see the SCREENS note in App.vue.
//
// WHAT WAS DELIBERATELY NOT COPIED FROM /experience:
//
// - The "How many tickets?" TicketQuantityDialog it opens in a q-dialog on load.
//   Excluded by the same review that wrote this app's no-pop-ups rule: "we
//   almost never are going to want those modal pop-ups, we're always going to
//   want a clean page." Nothing is lost, because the rail's own ticket-quantity
//   select asks the identical question in place, and the seat detail repeats it
//   next to the Continue button that spends the money. The trip opens on the
//   same default the whole prototype uses (2), so a guest who never touches
//   either control is priced exactly as before.
//
// - Its "Skip, I don't need tickets" branch, which lived on that dialog. This is
//   the tickets-first flow: a trip with no tickets in it is the hotel-only
//   product, a different prototype.
//
// TicketMap ships one pop-up trigger of its own — the tune icon that opens the
// all-inclusive TicketFilters q-dialog — and it is HIDDEN here rather than
// removed from the library, which is read-only, the same way HotelDetails.vue
// hides the hotel page's two. It costs nothing a guest cannot do in the rail:
// price, sections and sort each have their own dropdown in the filter bar, and
// quantity is the select beside them.
//
// Aug 26 branding round — the hero band no longer builds itself here. It was
// the only copy of this treatment when it was written; the hotel property list
// now carries the same band, so the markup, the artwork and the scrim moved to
// EventBand.vue and this screen mounts it. Nothing about how it reads changed
// apart from the imagery, which is now the supplied 1440x240 Patriots crop.
import TicketMap from '@lib/components/TicketMap.vue'
import EventBand from './EventBand.vue'

defineProps({
  event: { type: Object, required: true },
  listings: { type: Array, default: () => [] },
  pins: { type: Array, default: () => [] },
  eventDates: { type: String, default: '' },
  // The ticket count the trip currently holds. Handed to the map as its opening
  // quantity; from the guest's first touch of the map's own select it is the map
  // that owns the number, and the payload of "Continue · $…" that reports it.
  quantity: { type: Number, default: 2 },
})
defineEmits(['continue'])

</script>

<template>
  <div class="tfmap">
    <!-- Event band — shared with the hotel property list, see EventBand.vue. -->
    <EventBand :event-name="event.name" :event-dates="eventDates" />

    <!-- Re-keyed on the ticket count so a guest who changed it in the cart and
         came back finds the map opening on the number their trip actually holds
         (the map copies `initialQuantity` into local state on mount only). -->
    <TicketMap
      :key="quantity"
      :event="event" :listings="listings" :pins="pins"
      :max-quantity="8" :initial-quantity="quantity"
      @continue="$emit('continue', $event)"
    />
  </div>
</template>

<style scoped>
.tfmap { display: flex; flex-direction: column; }

/* The one modal trigger on the library component — see the note at the top.
   The filter bar keeps its price, sections, sort and quantity controls, which
   are dropdowns and selects, not dialogs. */
.tfmap :deep(.tm__tune) { display: none; }

/* The map is the screen the pinned header costs the most.
   TicketMap is `height: 100vh` — a full viewport of two-pane surface, each pane
   scrolling internally. Under a header that pins at 129px, a 100vh map is 129px
   taller than the space left for it, and since the panes scroll THEMSELVES the
   page can never move the overflow back into view: scrolled to the bottom, the
   filter bar, the "N listings" rail head and the top of the map artwork sit
   permanently behind the header, and the Continue button sits below the fold.
   Shortening the map by the header's height makes the two exactly agree — the
   band scrolls away, the map comes to rest filling the gap under the header,
   and every control the map owns is inside it at both 1440x900 and 1440x700.
   Rejected: leaving 100vh and pushing the map down with margin, which only
   moves the overflow to the bottom edge and hides the Continue button instead.
   The fallback 0px keeps this honest if the property is ever missing. */
.tfmap :deep(.tm) { height: calc(100vh - var(--tf-chrome-h, 0px)); }
/* Below 860px TicketMap drops to `height: auto` and stacks its panes; nothing
   is pinned against then, so the subtraction must not re-impose a height. */
@media (max-width: 860px) {
  .tfmap :deep(.tm) { height: auto; }
}
</style>
