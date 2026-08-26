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
    // The one place a guest is told where nights and rooms went, at the moment
    // they would go looking — and it opens the peek rather than navigating, so
    // the page they were reading is still behind it.
    actions: [{ label: 'Nights & rooms', color: 'white', handler: () => openPeek() }],
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
  </div>
</template>

<style scoped>
.hs { display: flex; flex-direction: column; flex: 1; }

/* The detail page's section tabs are sticky at top:0, and so is TripBar — which
   is taller and wins on z-index, so the tabs would pin themselves underneath it.
   Offsetting by the bar's height is the fix that keeps both docked; hiding the
   trip bar on this screen was the alternative, and it is the one surface a guest
   most needs to see change when they add a room. */
.hs :deep(.hdp__tabs) { top: 59px; }

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
