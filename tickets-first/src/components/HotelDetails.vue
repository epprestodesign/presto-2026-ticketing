<script setup>
// Step 3b — the full hotel page. Aug 25: "I want to dig in. I want to pick the
// room type."
//
// The page itself is the library's HotelDetailPage, mounted exactly as the
// booking site's own /prototype app mounts it: gallery mosaic, sticky section
// tabs, summary header with the mini-map, about, the room ladder, amenities by
// category, policies. Nothing here restyles it — that is the whole point of the
// round's hotel-consistency ask, so only the data is this trip's.
//
// TWO local decisions sit around it.
//
// 1. HOW THE ROOM GETS OUT. RoomCardReserve emits `reserve` with no payload and
//    HotelDetailPage does not forward it, so the selection exists nowhere but
//    the card. A sibling prototype solves this by reading the room's PRICE out
//    of the DOM; this one matches the clicked card BY POSITION and then reads
//    the room from `rooms` — the same array it just rendered from. The price a
//    guest clicks and the price they are charged are then the same object rather
//    than two values that agree until someone edits a template. The listener is
//    scoped to this wrapper, not the document, so nothing outside this screen
//    can trip it.
//
// 2. THE TWO POP-UPS ARE HIDDEN. Stakeholder, same round: "we almost never are
//    going to want those modal pop-ups, we're always going to want a clean
//    page." The library page has exactly two triggers — a room card's "Price
//    Details ›" (which opens a DsModal) and the gallery's "See all N photos".
//    Both are hidden here rather than removed from the library, which is
//    read-only. It costs the photo grid; the mosaic still shows five, and the
//    price breakdown is one night at one rate, which the card already states
//    twice (per night and total).
import { ref, computed } from 'vue'
import HotelDetailPage from '@lib/components/details/HotelDetailPage.vue'
import { detailPropsFor, roomsFor, STAY } from '../hotels.js'

const props = defineProps({
  hotel: { type: Object, required: true },
  eventName: { type: String, default: '' },
  // The room already in the trip, if any — a returning guest should not have to
  // re-read five cards to find out which one they chose.
  roomId: { type: String, default: null },
  guests: { type: Number, default: 2 },
})
const emit = defineEmits(['back', 'select'])

const root = ref(null)
const args = computed(() => detailPropsFor(props.hotel))
const rooms = computed(() => roomsFor(props.hotel))
const chosen = computed(() => rooms.value.find((r) => r.id === props.roomId) || null)

function onClick(e) {
  const cta = e.target instanceof Element ? e.target.closest('.rcr__cta') : null
  if (!cta || cta.disabled) return
  const card = cta.closest('.rcr')
  const cards = Array.from(root.value?.querySelectorAll('.rcr') || [])
  const room = rooms.value[cards.indexOf(card)]
  if (room) emit('select', room)
}
</script>

<template>
  <div ref="root" class="hdet" @click="onClick">
    <!-- Why this bar: the library page is the booking site's, and the booking
         site's hotel page has no idea a football game is attached to it. The
         guest arrived here mid-journey and the dates are not theirs to change —
         saying both once is cheaper than a header they have to interpret. -->
    <div class="hdet__bar">
      <div class="hdet__barinfo">
        <span class="hdet__eyebrow">Your stay for {{ eventName }}</span>
        <strong>{{ STAY.range }} · {{ STAY.nights }} night · {{ guests }} guest{{ guests === 1 ? '' : 's' }}</strong>
      </div>
      <span v-if="chosen" class="hdet__chosen">
        <q-icon name="check_circle" size="16px" /> In your trip: {{ chosen.name }}
      </span>
    </div>

    <HotelDetailPage v-bind="args" @back="emit('back')" />
  </div>
</template>

<style scoped>
.hdet { display: flex; flex-direction: column; font-family: var(--ds-font-family); }

.hdet__bar {
  display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-4); flex-wrap: wrap;
  max-width: 1180px; width: 100%; margin: 0 auto; padding: 14px 24px 0;
}
.hdet__barinfo { display: flex; flex-direction: column; color: var(--ds-color-text); }
.hdet__eyebrow { font-size: 0.6875rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.hdet__chosen {
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: var(--ds-radius-pill);
  background: var(--ds-color-background-success); color: var(--ds-color-text-success);
  font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold);
}

/* The two modal triggers on the library page — see note 2 at the top. */
.hdet :deep(.rcr__pricelink) { display: none; }
.hdet :deep(.gh__pill) { display: none; }
/* With the price link gone the room card's action row has one button; keep it
   on the right where the CTA has always been rather than letting it stretch. */
.hdet :deep(.rcr__actions) { justify-content: flex-end; }
</style>
