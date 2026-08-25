<script setup>
// Hotel details — one property, its rooms, and the stay that goes in the trip.
//
// AUG 25 FEEDBACK, and the reason this file exists at all: "I never want to have
// this as a pop-up … we're always going to want a clean page", and "I definitely
// wouldn't want it to be inconsistent between add-on and add hotel." Picking a
// hotel used to open StayEditDialog, a DsModal floating over the browse grid.
// That dialog is gone; this page replaced it, so choosing a hotel now goes to a
// page exactly the way choosing an add-on stays on one.
//
// The page itself is the library's HotelDetailPage, mounted as shipped —
// gallery, sticky section tabs, summary header, About, Amenities, Policies and
// the "Select Your Room" carousel in `reserve` flow. Matching the real booking
// site was the other half of this round's ask, so nothing here is re-styled;
// only the data is this event's.
//
// ADDING AND EDITING ARE STILL THE SAME SURFACE, which was the whole point of
// the old dialog and is preserved deliberately. Arriving from the browse grid
// with an empty trip and arriving from the cart's "Edit stay" land on the same
// page with the same controls in the same places; the only difference is that
// the second one arrives pre-filled and its controls write straight through to
// the line. That is the same bargain AddonCard makes — press Add once, and from
// then on the number on the surface IS the number in the cart.
import { ref, reactive, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import HotelDetailPage from '@lib/components/details/HotelDetailPage.vue'
import QuantityStepper from '@lib/components/QuantityStepper.vue'
import { getAmenities, amenityGroups } from '@lib/lib/amenities.js'
import { stayView, editingStay, replacingStay, commitStay, removeItem, restoreItem, nav } from '../store.js'
import {
  stayById, money, checkInLabel, checkOutLabel, lineTotal,
  MAX_NIGHTS, MAX_ROOMS, EVENT, EVENT_DATE,
} from '../trip.js'

const $q = useQuasar()
const root = ref(null)

const hotel = computed(() => stayById(stayView.hotelId))
const line = computed(() => editingStay.value)
const replacing = computed(() => replacingStay.value)

// The draft is what the page is proposing. When a line already exists it is a
// mirror of that line, not a second copy of it — every control writes through on
// the press, so there is no Save button to forget and no way for the page and
// the cart to disagree about a room.
const draft = reactive({ roomId: 'standard', nights: 1, rooms: 1 })
watch(
  [() => stayView.hotelId, line],
  () => {
    const l = line.value
    draft.roomId = l ? l.roomId : hotel.value.rooms[0].id
    draft.nights = l ? l.nights : 1
    draft.rooms = l ? l.rooms : 1
  },
  { immediate: true },
)

const room = computed(() => hotel.value.rooms.find((r) => r.id === draft.roomId) || hotel.value.rooms[0])
const subtotal = computed(() => room.value.rate * draft.nights * draft.rooms)
// The banner price when the stay is already in the trip is read off the LINE, so
// this page can never quote a figure the cart isn't charging.
const committed = computed(() => (line.value ? lineTotal(line.value) : 0))

// A property with no availability for the dates still has a details page — the
// booking site shows one, and a guest who filtered it into view deserves to see
// why it is greyed out. What it doesn't have is a way into the cart.
const soldOut = computed(() => hotel.value.soldOut)

/** Push the draft at the trip: patches the line if there is one, adds if not. */
function commit(message) {
  commitStay({ roomId: draft.roomId, nights: draft.nights, rooms: draft.rooms })
  if (message) $q.notify({ message, icon: 'check_circle', color: 'grey-9', position: 'bottom', timeout: 2600 })
}
// Nights and rooms only write through once the stay is IN the trip. Before that
// they are a proposal, because a page that added a hotel the moment someone
// nudged a stepper would put a $600 line in the cart as a side effect of looking.
function setNights(n) { draft.nights = n; if (line.value) commit() }
function setRooms(n) { draft.rooms = n; if (line.value) commit() }

function pickRoom(roomId) {
  const had = !!line.value
  draft.roomId = roomId
  const name = hotel.value.rooms.find((r) => r.id === roomId)?.name || 'Room'
  commit(had ? `Changed to ${name}.` : `${hotel.value.name} added to your trip.`)
}

function remove() {
  const l = line.value
  if (!l) return
  const removed = removeItem(l.uid)
  if (!removed) return
  $q.notify({
    message: `Removed ${hotel.value.name}.`,
    icon: 'undo', color: 'grey-9', position: 'bottom', timeout: 4000,
    actions: [{ label: 'Undo', color: 'white', handler: () => restoreItem(removed.item, removed.index) }],
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

function scrollToRooms() {
  root.value?.querySelector('#hdp-rooms')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  { title: 'Check-out', body: `Check-out by 11:00 AM on ${checkOutLabel(draft.nights)}. Bag storage is complimentary for block guests, so a late flight doesn't cost you the morning.` },
  { title: 'Cancellation Policy', body: 'Free cancellation until 48 hours before check-in. Cancellations after that are charged one night plus tax. No-shows are charged the full stay.' },
  { title: 'Deposit', body: 'A credit-card authorization of one night plus tax is held at check-in for incidentals and released at check-out.' },
  { title: 'Nothing is held yet', body: 'A stay sitting in your trip is not a reservation and is not on a clock. The hold starts when you check out, and until then every part of the trip stays editable.' },
])

// Availability is read from the SAME per-night record the browse card's
// Availability panel expands into, so a room cannot be "Only 2 left" on one
// screen and sold out on the next.
function availabilityOf(i) {
  if (soldOut.value) return 'soldout'
  const left = hotel.value.availByRoom[i].nights.slice(0, draft.nights).map((n) => n.roomsLeft)
  if (left.some((n) => n <= 0)) return 'soldout'
  return Math.min(...left) <= 3 ? 'limited' : 'available'
}

// The band's Add button can only ever add the room the band is showing, so it
// answers to that room's availability rather than the property's — otherwise a
// bookable hotel whose selected room happens to be gone would offer a button the
// room card two sections below has already disabled.
const roomSoldOut = computed(() => availabilityOf(hotel.value.rooms.findIndex((r) => r.id === draft.roomId)) === 'soldout')

const roomArgs = computed(() => hotel.value.rooms.map((r, i) => ({
  roomType: r.name,
  bedConfig: `${r.bed} · sleeps ${r.sleeps}`,
  maxOccupancy: r.sleeps * draft.rooms,
  pricePerNight: r.rate,
  // The card's total prices the ROOMS the guest asked for, not one room, so the
  // figure on the card is the figure that lands in the cart when it is pressed.
  total: r.rate * draft.nights * draft.rooms,
  roomCount: draft.rooms,
  availability: availabilityOf(i),
  nights: hotel.value.availByRoom[i].nights.slice(0, draft.nights),
})))

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
    roomsSubtitle: `Per room per night for ${checkInLabel()} → ${checkOutLabel(draft.nights)}. Pressing Reserve puts this room in your trip — it doesn't start a checkout.`,
  }
})
</script>

<template>
  <div ref="root" class="hs" @click="onPageClick">
    <!-- The stay band. It sits ABOVE the detail page rather than floating over
         it, which is the whole change this round asked for: the nights and the
         room count are page furniture now, not dialog fields. -->
    <section class="hs__band" :class="{ 'is-in': !!line }">
      <div class="hs__bandinner">
        <div class="hs__ctx">
          <button type="button" class="hs__crumb" @click="nav('stays')">
            <q-icon name="chevron_left" size="18px" /> All hotels
          </button>
          <p class="hs__event">{{ EVENT.name }} · {{ EVENT_DATE }}</p>
        </div>

        <div class="hs__fields">
          <div class="hs__field">
            <span class="hs__label">Room</span>
            <div class="hs__room">
              <strong>{{ room.name }}</strong>
              <button type="button" class="hs__link" @click="scrollToRooms">Change room</button>
            </div>
            <span class="hs__hint">{{ room.bed }} · {{ money(room.rate) }}/night</span>
          </div>

          <div class="hs__field">
            <span class="hs__label">Nights</span>
            <div class="hs__nights">
              <button
                v-for="n in MAX_NIGHTS" :key="n" type="button"
                class="hs__night" :class="{ 'is-on': n === draft.nights }"
                @click="setNights(n)"
              >{{ n }}</button>
            </div>
            <span class="hs__hint">{{ checkInLabel() }} → {{ checkOutLabel(draft.nights) }}</span>
          </div>

          <div class="hs__field">
            <span class="hs__label">Rooms</span>
            <quantity-stepper :model-value="draft.rooms" :min="1" :max="MAX_ROOMS" size="sm" @update:model-value="setRooms" />
            <span class="hs__hint">Sleeps {{ room.sleeps * draft.rooms }} in total</span>
          </div>

          <div class="hs__field hs__field--act">
            <span class="hs__label">{{ line ? 'In your trip' : 'Stay total' }}</span>
            <strong class="hs__total">{{ money(line ? committed : subtotal) }}</strong>
            <span class="hs__hint">before taxes · nothing held until checkout</span>
          </div>

          <div class="hs__acts">
            <template v-if="line">
              <span class="hs__in"><q-icon name="check_circle" size="18px" /> Added</span>
              <button type="button" class="hs__alt" @click="nav('trip')">View trip</button>
              <button type="button" class="hs__rm" @click="remove">Remove stay</button>
            </template>
            <template v-else>
              <button type="button" class="hs__cta" :disabled="roomSoldOut" @click="pickRoom(draft.roomId)">
                Add to trip · {{ money(subtotal) }}
              </button>
              <button type="button" class="hs__alt" @click="scrollToRooms">See all rooms</button>
            </template>
          </div>
        </div>

        <!-- Said before the swap, not after, and the second sentence is the one
             that matters: the rest of the trip is not part of this decision. -->
        <p v-if="replacing" class="hs__swap">
          <q-icon name="swap_horiz" size="18px" />
          Adding this replaces <strong>{{ replacing.name }}</strong> in your trip. Your tickets and add-ons stay exactly as they are.
        </p>
        <p v-else-if="soldOut" class="hs__swap hs__swap--out">
          <q-icon name="event_busy" size="18px" />
          This property has no availability for {{ checkInLabel() }}. You can read the details, but there is nothing to add.
        </p>
      </div>
    </section>

    <hotel-detail-page v-bind="args" @back="nav('stays')" />
  </div>
</template>

<style scoped>
.hs { display: flex; flex-direction: column; flex: 1; }

/* ── The stay band ── */
.hs__band { background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-border); }
.hs__band.is-in { background: var(--ds-palette-slate-100, #f1f2f4); }
.hs__bandinner { max-width: 1180px; margin-inline: auto; padding: 14px 24px 18px; font-family: var(--ds-font-family); }

.hs__ctx { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 12px; }
.hs__crumb { display: inline-flex; align-items: center; gap: 4px; padding: 0; border: 0; background: none; font: inherit; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }
.hs__crumb:hover { color: var(--ds-color-text-brand); }
.hs__event { margin: 0; font-size: .875rem; color: var(--ds-color-text-subtle); }

.hs__fields { display: flex; align-items: flex-start; gap: 28px; flex-wrap: wrap; }
.hs__field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.hs__label { font-size: .75rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.hs__hint { font-size: .8125rem; color: var(--ds-color-text-subtle); }
.hs__room { display: flex; align-items: baseline; gap: 10px; }
.hs__room strong { font-size: 1.0625rem; color: var(--ds-color-text); }
.hs__link { appearance: none; padding: 0; border: 0; background: none; font: inherit; font-size: .8125rem; font-weight: 600; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }

.hs__nights { display: flex; gap: 6px; }
.hs__night { width: 38px; height: 34px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-surface); font: inherit; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }
.hs__night.is-on { background: var(--ds-color-background-brand-bold, #01113E); border-color: var(--ds-color-background-brand-bold, #01113E); color: #fff; }

.hs__field--act .hs__total { font-size: 1.375rem; font-weight: 800; color: var(--ds-color-text); }

.hs__acts { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-left: auto; padding-top: 18px; }
.hs__cta { height: 46px; padding: 0 22px; border: 0; border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.hs__cta:disabled { background: var(--ds-palette-slate-200, #e2e4e8); color: var(--ds-color-text-subtlest); cursor: not-allowed; }
.hs__alt { height: 46px; padding: 0 18px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-surface); font: inherit; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }
.hs__in { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--ds-color-text-success, #17672f); }
.hs__rm { appearance: none; padding: 0; border: 0; background: none; font: inherit; font-weight: 600; color: var(--ds-color-text-subtle); text-decoration: underline; cursor: pointer; }
.hs__rm:hover { color: var(--ds-color-text-danger, #b3261e); }

.hs__swap { display: flex; align-items: center; gap: 8px; margin: 14px 0 0; padding: 10px 14px; border-radius: var(--ds-radius-md, 8px); background: var(--ds-palette-amber-100, #fff5db); font-size: .9375rem; color: var(--ds-color-text); }
.hs__swap--out { background: var(--ds-palette-slate-200, #e2e4e8); }

/* The detail page's section tabs are sticky at top:0, and so is TripBar — which
   is taller and wins on z-index, so the tabs would pin themselves underneath it.
   Offsetting by the bar's height is the fix that keeps both docked; hiding the
   trip bar on this screen was the alternative, and it is the one surface a guest
   most needs to see change when they add a room. */
.hs :deep(.hdp__tabs) { top: 59px; }

/* HotelDetailPage ships its own "Back to Hotel listing" button; the band above
   already carries one, and two back links stacked 40px apart is one too many. */
.hs :deep(.hdp__back) { display: none; }

/* Same reason the browse card's caption is hidden: the trip levies tax once, on
   the whole trip, so a per-room "incl. taxes & fees" would be contradicted by
   the rail two screens later. The room count it also carries is stated in the
   band above, where it is the control rather than a caption. */
.hs :deep(.rcr__sub) { display: none; }

/* The LAST pop-up reachable from this prototype, closed. RoomCardReserve's
   "Price Details ›" link opens the library's PriceDetailsDialog — a DsModal —
   and "no modal pop-ups, anywhere" is not honoured by a page that still has one
   sitting on its primary card. The breakdown it shows (rate × nights × rooms,
   then taxes) is already spelled out in the band above and owned, to the dollar,
   by the trip rail; hiding the link removes a duplicate, not an answer. The
   library file is untouched — this is a style rule in this app. */
.hs :deep(.rcr__pricelink) { display: none; }
.hs :deep(.rcr__actions) { justify-content: flex-end; }

@media (max-width: 900px) {
  .hs__acts { margin-left: 0; width: 100%; }
}
</style>
