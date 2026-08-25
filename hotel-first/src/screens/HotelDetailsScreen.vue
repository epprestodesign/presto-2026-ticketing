<script setup>
// Stage 1 (cont.) — Hotel Details & room selection. The real library
// HotelDetailPage, exactly as the sibling /prototype app mounts it: gallery,
// summary header, section tabs, about, amenities, policies, and the "Select Your
// Room" carousel in `reserve` flow. This is the screen the constraint about
// matching the booking site is really about, so nothing here is re-styled — only
// the data is Orlando's.
//
// `back` is a real event → Browse. The room CTA emits `reserve` with no payload,
// so App.vue reads the chosen card's own DOM and hands it to the store; that is
// the no-library-change way to carry a room into the cart.
import { computed } from 'vue'
import HotelDetailPage from '@lib/components/details/HotelDetailPage.vue'
import { getAmenities, amenityGroups } from '@lib/lib/amenities.js'
import { EVENT, STAY, DETAIL_NIGHTS } from '../event.js'
import { journey, activeHotel, nav, setTab } from '../store.js'

// Room types priced off the property's own from-rate, so a $389 resort and a $139
// airport hotel never show the same room list. The Double Queen leads because it
// is what a party of four is sold, and it is the room the store defaults to — the
// two have to agree or the cart would price a room the page never showed.
const ROOM_TYPES = [
  { roomType: 'Double Queen - 2 Queen', bedConfig: '2 Queen Beds', maxOccupancy: 4, delta: 30, availability: 'available', left: [7, 4, 6] },
  { roomType: 'King Bed - 1 King', bedConfig: '1 King Bed', maxOccupancy: 2, delta: 0, availability: 'available', left: [9, 6, 8] },
  { roomType: 'Two-Room Suite', bedConfig: '1 King Bed · Sofa Bed', maxOccupancy: 6, delta: 80, availability: 'limited', left: [3, 1, 2] },
  { roomType: 'Deluxe King', bedConfig: '1 King Bed · Balcony', maxOccupancy: 2, delta: 55, availability: 'available', left: [5, 3, 4] },
  { roomType: 'Accessible Queen', bedConfig: '1 Queen Bed · Roll-in Shower', maxOccupancy: 2, delta: 15, availability: 'soldout', left: [0, 0, 0] },
]

const ABOUT = computed(() => {
  const h = activeHotel.value
  return [
    `${h.name} sits ${h.distance.replace(' from the Convention Center', '')} from the ${EVENT.venue}, inside the official Spirit Nationals block. Competition weekends fill the property with programs travelling together, so check-in is staffed early and the lobby is set up for teams arriving by the busload.`,
    'Rooms are sized for families rather than business travellers: two queens as standard, connecting rooms on request, a fridge for the cooler bag, and blackout curtains for athletes who compete at 8:00 AM and are asleep by nine.',
    'On site you will find a heated outdoor pool, a fitness room, laundry, and a breakfast service that opens at 6:00 AM on competition days — early enough for a call time. A grab-and-go market covers mat-side snacks and water.',
    `Self-parking is discounted for block guests and a Convention Center shuttle runs every twenty minutes Friday through Sunday, which is what makes ${h.name} workable for a program with eight athletes and a gear cart.`,
  ]
})

const POLICIES = computed(() => {
  const h = activeHotel.value
  return [
    { title: 'Check-in', body: `Check-in from ${STAY.checkIn.time}. Guests must be 18 or older with a valid photo ID and a credit card at check-in. Early check-in is subject to availability — competition weekends run tight.` },
    { title: 'Check-out', body: `Check-out by ${STAY.checkOut.time}. Bag storage on finals day is complimentary for block guests, so you can compete after check-out.` },
    { title: 'Cancellation Policy', body: 'Free cancellation until Feb 10, 2027. Cancellations after that are charged one night plus tax. No-shows are charged the full stay.' },
    { title: 'Deposit', body: 'A credit-card authorization of one night plus tax is held at check-in for incidentals and released at check-out.' },
    { title: 'Minors & chaperones', body: `${h.name} requires one adult chaperone per room for guests under 18. Coaches travelling with a program can register the roster at the front desk on arrival.` },
  ]
})

const args = computed(() => {
  const h = activeHotel.value
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
    checkInTime: STAY.checkIn.time,
    checkOutTime: STAY.checkOut.time,
    popularAmenities: getAmenities(h.amenities.slice(0, 6)),
    amenityGroups: amenityGroups(h.amenities),
    lat: h.lat,
    lng: h.lng,
    galleryCategories: ['exterior', 'rooms', 'suites', 'pool', 'dining', 'bar', 'lobby', 'spa', 'bathroom'],
    seed: h.seed,
    about: ABOUT.value,
    policies: POLICIES.value,
    rooms: ROOM_TYPES.map((r) => ({
      roomType: r.roomType,
      bedConfig: r.bedConfig,
      maxOccupancy: r.maxOccupancy,
      pricePerNight: h.fromNightly + r.delta,
      total: (h.fromNightly + r.delta) * STAY.nights,
      roomCount: 1,
      availability: r.availability,
      nights: DETAIL_NIGHTS.map((date, i) => ({ date, roomsLeft: r.left[i] })),
    })),
    roomsFlow: 'reserve',
    roomsTitle: 'Select Your Room',
    roomsSubtitle: `Prices are per room per night for ${STAY.range} — the three nights of the tournament.`,
  }
})
</script>

<template>
  <div class="xhd">
    <hotel-detail-page v-bind="args" :initial-tab="journey.tab" @update:tab="setTab" @back="nav('hotels')" />
  </div>
</template>

<style scoped>
.xhd { display: flex; flex-direction: column; flex: 1; }
</style>
