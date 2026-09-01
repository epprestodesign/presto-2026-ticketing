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
// THREE local decisions sit around it.
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
//    WHAT `select` DOES ON THE OTHER END CHANGED on Aug 25 (evening) and this
//    file did not have to: it emits the room, and App.vue now commits the stay
//    and opens the cart peek over this page rather than navigating on. That is
//    the point of emitting a room instead of a route — this screen states what
//    was chosen and nothing about where the flow goes next.
//
// 2. THE TWO POP-UPS ARE HIDDEN. Stakeholder, same round: "we almost never are
//    going to want those modal pop-ups, we're always going to want a clean
//    page." The library page has exactly two triggers — a room card's "Price
//    Details ›" (which opens a DsModal) and the gallery's "See all N photos".
//    Both are hidden here rather than removed from the library, which is
//    read-only. It costs the photo grid; the mosaic still shows five, and the
//    price breakdown is one night at one rate, which the card already states
//    twice (per night and total).
//
// 3. NO EVENT BAND — Aug 26 branding round. Why this page does not get the
//    Patriots header the property list one screen back does.
//
//    The ask was "the hotel pages get the 1440x240 banner as the header
//    background", and on the list that is exactly right: the list has no imagery
//    of its own, so the band is the only thing telling a guest what trip these
//    hotels belong to. This page is the opposite case. HotelDetailPage OPENS on a
//    gallery mosaic — five photos of the property, full width, above everything —
//    and that mosaic is not decoration, it is the first half of the decision the
//    page exists to ask ("is this where I want to sleep?"). Putting the stadium
//    band above it stacks two hero images in the first screenful, and the one on
//    top is about the game rather than the hotel: it pushes the actual subject of
//    the page below the fold to say something the guest already knows.
//
//    That argument used to lean on the stay bar carrying the event context in a
//    line of type above the gallery. The bar was removed on Aug 26, so it no
//    longer does — and the conclusion survives anyway: the stepper shows Hotel as
//    the active step, the peek states the whole trip, and the chosen room is
//    marked on its own card. None of that needs a band to repeat it.
//
//    This is a judgement call and a reversible one: mounting <EventBand> at the
//    top of this component is a two-line change if the review disagrees.
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
    <!-- The stay bar that sat here is gone (Aug 26). It named the event, the
         dates and the party size above the library page, on the reasoning that
         the booking site's hotel page has no idea a football game is attached
         to it. That was true, and it was still one more band above the thing
         the guest came to look at — the seventh such strip cut from these
         prototypes in one review. The gallery is the page's subject and now
         opens it.

         Nothing is lost that is not said elsewhere: the stepper shows Hotel as
         the active step, the cart peek states the trip in full, and the room
         actually chosen is marked on its own card by the library page. -->

    <HotelDetailPage v-bind="args" @back="emit('back')" />
  </div>
</template>

<style scoped>
.hdet { display: flex; flex-direction: column; font-family: var(--ds-font-family); }

/* The two modal triggers on the library page — see note 2 at the top. */
.hdet :deep(.rcr__pricelink) { display: none; }
.hdet :deep(.gh__pill) { display: none; }
/* With the price link gone the room card's action row has one button; keep it
   on the right where the CTA has always been rather than letting it stretch. */
.hdet :deep(.rcr__actions) { justify-content: flex-end; }

/* TWO STICKY BARS, STACKED — see the `.bapp__chrome` note in App.vue.
   HotelDetailPage pins its own section tabs (Property · Rooms · Amenities ·
   Policies) at `top: 0`, which was right when nothing was above them and is now
   the app header's row: left alone the tabs pin BEHIND it and the page loses its
   navigation exactly when a guest starts scrolling for the room ladder. Pushing
   their offset down by the measured header height stacks the two instead — app
   chrome, then page tabs, both readable at once.
   `--tf-chrome-h` also carries the stepper, which is visible on this screen, so
   the offset is the full 129px and not just the nav's 72.
   Sticky offsets resolve against the MARGIN box, and the library gives the tab
   bar `margin: 24px 0` — so the raw property would park it 24px too low and open
   a strip of scrolling page between the two bars. The margin is moved to a
   wrapper-side padding instead of being subtracted here, because a subtraction
   silently breaks the day that margin changes. */
.hdet :deep(.hdp__tabs) { top: var(--tf-chrome-h, 0px); margin-top: 0; padding-top: 24px; }

/* The tab clicks are `scrollIntoView({ block: 'start' })`, which puts a section
   flush against the viewport top — i.e. behind both pinned bars. scroll-margin
   is the one-line fix and the only one that leaves the library's scroll call
   alone; the alternative was intercepting the click and doing our own scroll
   arithmetic, which forks behaviour we would then own forever.
   48px is the tab bar's own height (12px padding, a 20px line, a 2px underline)
   plus its 24px of lead-in, so a section lands just under the tabs, not under
   them. */
.hdet :deep(.hdp),
.hdet :deep(.hdp__section) { scroll-margin-top: calc(var(--tf-chrome-h, 0px) + 72px); }
</style>
