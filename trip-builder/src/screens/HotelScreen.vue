<script setup>
// Hotel details — one property, its rooms, and the room that goes in the trip.
//
// AUG 25 FEEDBACK, and the reason this file exists at all: "I never want to have
// this as a pop-up … we're always going to want a clean page", and "I definitely
// wouldn't want it to be inconsistent between add-on and add hotel." Picking a
// hotel used to open StayEditDialog, a DsModal floating over the browse grid.
// That dialog is gone; this page replaced it, so choosing a hotel now goes to a
// page exactly the way choosing an add-on stays on one.
//
// THAT DID NOT CHANGE when the cart fly-out came back in the following review.
// The one overlay this prototype sanctions is the cart peek, for reasons that
// are specific to a cart (see TripFlyout). Room selection is not a glance at
// something with an address elsewhere — it IS the surface — so StayEditDialog
// stays deleted.
//
// ── THE STAY BAND IS GONE (Aug 25, third round) ──
// This screen used to carry a band above the detail page holding the back link,
// the room name, a NIGHTS 1·2·3 toggle, a ROOMS stepper, a stay total and an
// "Add to trip · $329" button. The stakeholder, looking at this page, asked for
// it removed: the screen should be the hotel's detail page and not much else.
//
// The band was the only place nights and rooms could be set, so deleting it
// outright would have quietly removed the ability to book two nights or two
// rooms. They were REHOMED rather than dropped, to the stay line in TripItems —
// the cart body both the peek and /trip render. Three reasons that is the right
// home and not a consolation prize:
//
//   • The cart is this prototype's spine and every other line is already edited
//     in place there. Nights and rooms are two more numbers on a line; a ticket
//     quantity has never needed its own page and neither do these.
//   • The figure they move is the stay total, which lives in the cart next to
//     the trip total they roll into. On this page it was a fourth price
//     competing with the three on every room card.
//   • It is reachable from here without navigating: the cart peek opens from the
//     nav on every screen, and the toast this page raises on a Reserve offers it
//     directly.
//
// ADDING still happens here, and only here: RoomCardReserve's "Reserve Room" is
// the one control that puts a property in the trip. What this page no longer
// does is price the stay — it REFLECTS the nights and rooms the trip already
// holds, so every room card's total is the total that line would charge.
//
// The alternative considered and rejected: keep a slimmer band with just the two
// steppers. That is the same band with fewer fields — still a second place a
// stay is priced, still contradicting the cart the moment one of them is wrong.
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import HotelDetailPage from '@lib/components/details/HotelDetailPage.vue'
import { getAmenities, amenityGroups } from '@lib/lib/amenities.js'
import { stayView, editingStay, replacingStay, stayLine, commitStay, openPeek, nav } from '../store.js'
import {
  stayById, roomById, money, checkInLabel, checkOutLabel, EVENT,
} from '../trip.js'

const $q = useQuasar()
const root = ref(null)

const hotel = computed(() => stayById(stayView.hotelId))
const line = computed(() => editingStay.value)
const replacing = computed(() => replacingStay.value)

// Nights and rooms are READ from the trip, never held here. There is no local
// draft any more because there is no control on this page that could move one —
// a mirror with no writer is just a stale copy waiting to disagree with the
// cart. StaysScreen already prices its browse cards off the same two values, so
// all three surfaces multiply by the same numbers.
//
// They are read off `stayLine` (the stay in the trip, whichever property it is
// at) rather than off `editingStay` (the stay at THIS property), so a guest who
// booked two nights elsewhere and is now comparing sees two-night totals here —
// and a swap carries the length of the stay across instead of silently resetting
// it to one night.
const nights = computed(() => stayLine.value?.nights || 1)
const rooms = computed(() => stayLine.value?.rooms || 1)

// A property with no availability for the dates still has a details page — the
// booking site shows one, and a guest who filtered it into view deserves to see
// why it is greyed out. What it doesn't have is a way into the cart, which the
// room cards enforce themselves by rendering their Unavailable state.
const soldOut = computed(() => hotel.value.soldOut)

/** Reserve puts this room in the trip: patches the line if there is one, adds if not. */
function pickRoom(roomId) {
  const had = !!line.value
  const name = hotel.value.rooms.find((r) => r.id === roomId)?.name || 'Room'
  commitStay({ roomId, nights: nights.value, rooms: rooms.value })
  $q.notify({
    message: had ? `Changed to ${name}.` : `${hotel.value.name} · ${name} added to your trip.`,
    icon: 'check_circle', color: 'grey-9', position: 'bottom', timeout: 3200,
    // Opens the peek rather than navigating, so the page they were reading is
    // still behind it. The label used to read "Nights & rooms", which named the
    // destination's contents instead of the move — it was the only forward
    // pointer on this screen and it read like a settings link. The peek it opens
    // is unchanged and the NIGHTS/ROOMS steppers are the first thing in it, so
    // nothing is lost by saying the trip rather than the two fields.
    actions: [{ label: 'Review trip', color: 'white', handler: () => openPeek() }],
  })
}

// RoomCardReserve emits `reserve` with no payload and HotelDetailPage does not
// forward it, so the press is caught on the way up instead. The room is
// identified by the card's POSITION rather than by scraping its title text: the
// cards are rendered from `roomArgs` in order, so the index is exact and cannot
// drift the way a string comparison would when a room gets renamed.
function onPageClick(e) {
  const t = e.target
  if (!(t instanceof Element)) return
  const cta = t.closest('.rcr__cta')
  if (!cta || cta.disabled) return
  const item = cta.closest('.rcar__item')
  const all = [...(root.value?.querySelectorAll('.rcar__item') || [])]
  const i = all.indexOf(item)
  if (i >= 0 && hotel.value.rooms[i]) pickRoom(hotel.value.rooms[i].id)
}

// ── THE WAY ON (Aug 26) ──
// THE BUG THIS FIXES. Of the three entry paths this prototype offers, two hand
// the guest forward once they have chosen and one did not:
//
//   • Tickets — TicketsScreen's `continue` calls nav('trip'). Automatic.
//   • Add-ons — AddonsScreen ends in a footer whose primary is "Go to your trip",
//     disabled until something is chosen. Explicit.
//   • Hotel   — added the stay, raised a 3.2-second toast, and STAYED PUT.
//
// So reserving a room left a guest on an unchanged-looking page: the three
// Reserve Room buttons still read "Reserve Room" (the library hard-codes that
// label and takes no prop for it), the only forward control was a 22px cart icon
// that had scrolled 1200px out of view, and the toast's one action expired. The
// trip was real and the total was right — there was simply nothing on screen
// that said so or moved you on. That is the dead end.
//
// THE FIX IS THE SIBLING'S PATTERN, NOT A NEW ONE. This footer is AddonsScreen's
// `as__foot` — same shape, same disabled-until-chosen primary, same two lateral
// alternatives — because "browse, pick, then continue" is a problem this app had
// already solved one screen over. Copying it makes the third path match the
// other two instead of inventing a fourth idea.
//
// WHY THIS IS NOT THE DELETED STAY BAND COMING BACK. The band the stakeholder
// removed in the third round sat ABOVE the detail page and carried a NIGHTS
// toggle, a ROOMS stepper and a stay total — a second place the stay was priced,
// which is what made it wrong. This is below the page, sets nothing, and prices
// nothing: it names the room that is in the trip and offers a way on. Money is
// still the cart's alone.
const footNote = computed(() => {
  const l = line.value
  if (!l) {
    return soldOut.value
      ? { title: 'Nothing to reserve here', sub: `${hotel.value.name} has no availability for ${checkInLabel()} — the other properties in the block do.` }
      : { title: 'No room reserved yet', sub: 'Pick a room above and it goes straight into your trip — nothing is held and nothing is charged.' }
  }
  const room = roomById(l.hotelId, l.roomId)
  return {
    title: `${room.name} at ${hotel.value.name} is in your trip`,
    sub: `${l.nights} night${l.nights === 1 ? '' : 's'} · ${l.rooms} room${l.rooms === 1 ? '' : 's'} · change either on the stay line in your trip.`,
  }
})

// ── The data HotelDetailPage is handed ──
const ABOUT = computed(() => {
  const h = hotel.value
  return [
    `${h.name} sits ${h.distanceMi} miles from ${EVENT.venue?.name || 'Gillette Stadium'} — about a ${h.walkMin}-minute walk — inside the contracted block for ${EVENT.name}. Game weekends fill the property with parties travelling together, so the front desk is staffed early and the lobby is set up for groups arriving at once.`,
    'Rooms come in three configurations: a king, a double queen for a party of four, and a two-room suite with a separate living room. Every room carries a fridge, blackout curtains and fast wi-fi.',
    'On site you will find a fitness room, laundry, and a breakfast service that opens early enough to beat the gate queue. A grab-and-go market covers what a tailgate forgets.',
    `Self-parking is discounted for block guests, and the stadium shuttle runs on a loop from two hours before kickoff — which is what makes ${h.name} workable for a group that would rather not drive on game day.`,
  ]
})

const POLICIES = computed(() => [
  { title: 'Check-in', body: `Check-in from 3:00 PM on ${checkInLabel()}. Guests must be 18 or older with a valid photo ID and a credit card. Early check-in is subject to availability — game weekends run tight.` },
  { title: 'Check-out', body: `Check-out by 11:00 AM on ${checkOutLabel(nights.value)}. Bag storage is complimentary for block guests, so a late flight doesn't cost you the morning.` },
  { title: 'Cancellation Policy', body: 'Free cancellation until 48 hours before check-in. Cancellations after that are charged one night plus tax. No-shows are charged the full stay.' },
  { title: 'Deposit', body: 'A credit-card authorization of one night plus tax is held at check-in for incidentals and released at check-out.' },
  { title: 'Nothing is held yet', body: 'A stay sitting in your trip is not a reservation and is not on a clock. The hold starts when you check out, and until then every part of the trip — including how many nights and how many rooms — stays editable on the stay line in your trip.' },
])

// Availability is read from the SAME per-night record the browse card's
// Availability panel expands into, so a room cannot be "Only 2 left" on one
// screen and sold out on the next.
function availabilityOf(i) {
  if (soldOut.value) return 'soldout'
  const left = hotel.value.availByRoom[i].nights.slice(0, nights.value).map((n) => n.roomsLeft)
  if (left.some((n) => n <= 0)) return 'soldout'
  return Math.min(...left) <= 3 ? 'limited' : 'available'
}

const roomArgs = computed(() => hotel.value.rooms.map((r, i) => ({
  roomType: r.name,
  bedConfig: `${r.bed} · sleeps ${r.sleeps}`,
  maxOccupancy: r.sleeps * rooms.value,
  // The per-night rate is the card's own, and with the band's total gone it is
  // now the only place the room's price is stated on this page — so it stays
  // visible and unstyled, exactly as the library ships it.
  pricePerNight: r.rate,
  // The card's total prices the ROOMS and NIGHTS the trip is holding, not one
  // room for one night, so the figure on the card is the figure that lands on
  // the stay line when it is pressed.
  total: r.rate * nights.value * rooms.value,
  roomCount: rooms.value,
  availability: availabilityOf(i),
  nights: hotel.value.availByRoom[i].nights.slice(0, nights.value),
})))

// Everything the band used to say in labels, said once in the carousel's own
// subtitle instead. It is a library prop, so none of it is extra chrome: what
// the totals below cover, what pressing Reserve does, which room is already in
// the trip, what a swap would displace, and where the two quantities now live.
const roomsSubtitle = computed(() => {
  const n = nights.value
  const r = rooms.value
  const span = `${checkInLabel()} → ${checkOutLabel(n)} · ${n} night${n === 1 ? '' : 's'} · ${r} room${r === 1 ? '' : 's'} · totals below are for the whole stay.`
  if (soldOut.value) {
    return `${span} This property has no availability for ${checkInLabel()} — you can read the details, but there is nothing to add.`
  }
  // Said BEFORE the swap, not after, and the second sentence is the one that
  // matters: the rest of the trip is not part of this decision.
  if (replacing.value) {
    return `${span} Reserving here replaces ${replacing.value.name} in your trip — your tickets and add-ons stay exactly as they are. Nights and rooms are set on the stay line in your trip.`
  }
  if (line.value) {
    const current = roomById(line.value.hotelId, line.value.roomId)
    return `${span} ${current.name} at ${money(current.rate)}/night is in your trip — reserve another room to change it. Nights, rooms and the stay total are on the stay line in your trip.`
  }
  return `${span} Pressing Reserve puts that room in your trip — it doesn't start a checkout. Nights and rooms are then set on the stay line in your trip.`
})

const args = computed(() => {
  const h = hotel.value
  return {
    name: h.name,
    stars: h.stars,
    address: h.address,
    distance: h.distance,
    score: h.rating,
    reviews: h.reviews,
    ratingLabel: h.rating >= 4.6 ? 'Exceptional' : h.rating >= 4.3 ? 'Excellent' : h.rating >= 4.0 ? 'Very Good' : 'Good',
    preferred: h.preferred,
    lowRateGuarantee: h.lowRateGuarantee,
    checkInTime: '3:00 PM',
    checkOutTime: '11:00 AM',
    popularAmenities: getAmenities(h.amenities.slice(0, 6)),
    amenityGroups: amenityGroups(h.amenities),
    lat: h.lat,
    lng: h.lng,
    galleryCategories: h.imageCategories.concat(['dining', 'bar', 'pool', 'bathroom']).filter((c, i, a) => a.indexOf(c) === i),
    seed: h.seed,
    about: ABOUT.value,
    policies: POLICIES.value,
    rooms: roomArgs.value,
    roomsFlow: 'reserve',
    roomsTitle: 'Select Your Room',
    roomsSubtitle: roomsSubtitle.value,
  }
})
</script>

<template>
  <!-- The screen is the library's HotelDetailPage and nothing else: gallery,
       tabs, summary, about, rooms, amenities, policies. -->
  <div ref="root" class="hs" @click="onPageClick">
    <hotel-detail-page v-bind="args" @back="nav('stays')" />

    <!-- The way on. See THE WAY ON above: this is AddonsScreen's footer, so the
         hotel path ends the way the add-on path already did. -->
    <footer class="hs__foot">
      <div class="hs__footinfo">
        <strong>{{ footNote.title }}</strong>
        <span>{{ footNote.sub }}</span>
      </div>
      <div class="hs__footacts">
        <button type="button" class="hs__alt" @click="nav('stays')">Other hotels</button>
        <button type="button" class="hs__alt" @click="nav('tickets')">Add tickets</button>
        <button type="button" class="hs__cta" :disabled="!line" @click="nav('trip')">
          Go to your trip <q-icon name="arrow_forward" size="17px" />
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.hs { display: flex; flex-direction: column; flex: 1; }

/* The detail page's section tabs are sticky at top:0, and so is the app chrome —
   which is taller and wins on z-index, so the tabs would pin themselves
   underneath it. Offsetting by the chrome's height keeps both docked; hiding the
   trip bar on this screen was the alternative, and it is the one surface a guest
   most needs to see change when they add a room.
   The offset used to be a hard-coded 59px, which was the trip bar's height back
   when the bar was the only sticky thing. The nav pins with it now (see App.vue:
   the cart icon may not scroll away), so the number is read from the block that
   actually sets it. The fallback covers the first paint before the observer has
   published a value. */
.hs :deep(.hdp__tabs) { top: var(--tb-chrome-h, 124px); }

/* AddonsScreen's `as__foot`, to the pixel — the same component in a second
   place, not a variation on it. If one is restyled the other should be. */
.hs__foot { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; max-width: min(1440px, 92%); margin: 24px auto 40px; padding: 18px 20px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg, 12px); background: var(--ds-palette-slate-100, #f1f2f4); font-family: var(--ds-font-family); }
.hs__footinfo { display: flex; flex-direction: column; gap: 2px; }
.hs__footinfo strong { font-size: 1.0625rem; color: var(--ds-color-text); }
.hs__footinfo span { font-size: .875rem; color: var(--ds-color-text-subtle); }
.hs__footacts { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.hs__alt { height: 42px; padding: 0 16px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-surface); font: inherit; font-weight: 600; color: var(--ds-color-text); cursor: pointer; }
.hs__alt:hover { background: var(--ds-palette-slate-100, #f1f2f4); }
.hs__cta { display: inline-flex; align-items: center; gap: 8px; height: 42px; padding: 0 18px; border: 0; border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.hs__cta:disabled { background: var(--ds-palette-slate-200, #e2e4e8); color: var(--ds-color-text-subtlest); cursor: not-allowed; }

/* HotelDetailPage's OWN "Back to Hotel listing" button is now the way back to
   browse — it used to be hidden here because the stay band carried an "All
   hotels" crumb 40px above it and two back links stacked is one too many. The
   band is gone, so the library's link is let through and wired to the browse
   screen via @back rather than hand-rolling a second one. */

/* The room count and the "incl. taxes & fees" caption under each price. The tax
   half is the reason it stays hidden even now that the band is gone: this trip
   levies tax ONCE, on the whole trip, so a per-room "incl. taxes & fees" would
   be contradicted by the checkout rail two screens later. The room count it also
   carries is stated in the carousel's subtitle above the cards, where it is one
   statement for the section rather than the same number on three cards. */
.hs :deep(.rcr__sub) { display: none; }

/* The LAST pop-up reachable from this prototype, closed. RoomCardReserve's
   "Price Details ›" link opens the library's PriceDetailsDialog — a DsModal —
   and "no modal pop-ups, anywhere" is not honoured by a page that still has one
   sitting on its primary card. The breakdown it shows (rate × nights × rooms,
   then taxes) is now spelled out on the stay line in the cart and owned, to the
   dollar, by the trip rail; hiding the link removes a duplicate, not an answer.
   The library file is untouched — this is a style rule in this app. */
.hs :deep(.rcr__pricelink) { display: none; }
.hs :deep(.rcr__actions) { justify-content: flex-end; }
</style>
