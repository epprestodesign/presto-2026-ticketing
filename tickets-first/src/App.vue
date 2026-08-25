<script setup>
// TICKETS-FIRST prototype — the whole trip assembled in the order a fan
// actually decides it: the game first, then somewhere to sleep, then the extras
// around kickoff, then one cart and one charge.
//
// Forked from /bundle, which ended at tickets → seats → hotel → cart. The gap
// this fork closes is the EXTRAS step: parking, a tailgate, a stadium transfer,
// pregame hospitality — each optional, each priced, each landing in the same
// cart as its own removable line. Everything else about the journey is
// unchanged, and every screen is still a real library component via @lib.
//
// Why extras come after the hotel and not beside the tickets: one of them (the
// round-trip transfer) leaves from the hotel lobby, so the offer itself depends
// on an answer the hotel step gives. Putting extras earlier would mean either
// hiding that card or offering a bus from nowhere.
//
// Aug 25 round — two stakeholder asks changed the shape of the flow:
//
//   "Can there be a checkout? Like, I want to pay."  → a real CHECKOUT screen
//   between the cart and the confirmation, collecting contact and payment. It
//   mounts the library's EXPANDED checkout (every section open, one submit),
//   not the stepped one: "I don't want this next. I want one big form."
//
//   "I want to pick the hotel... I want to dig in. I want to pick the room
//   type."  → the hotel step splits in two. The list picks a PROPERTY and opens
//   the booking site's own full hotel page; the room ladder on that page is what
//   puts a rate in the cart. So `hotel` alone is no longer enough state — a stay
//   is a property AND a room, and every price downstream follows the room.
//
// Both arrive as PAGES. No dialogs anywhere in this app, by instruction: "we
// almost never are going to want those modal pop-ups, we're always going to want
// a clean page." The two the library's hotel page ships with are hidden in
// HotelDetails.vue.
import { ref, computed, watch } from 'vue'
import EventHero from '@lib/components/EventHero.vue'
import TicketTierList from '@lib/components/TicketTierList.vue'
import VenueMap from '@lib/components/VenueMap.vue'
import BundleConfirmation from '@lib/components/BundleConfirmation.vue'
import JourneyStepper from '@lib/components/JourneyStepper.vue'
import { fixtureEvents } from '@lib/lib/ticketmaster.js'
import { deriveTiers } from '@lib/lib/seatmap.js'
import { gillettePins } from '@lib/lib/gilletteMap.js'
import AddOnStep from './components/AddOnStep.vue'
import HotelPickStep from './components/HotelPickStep.vue'
import HotelDetails from './components/HotelDetails.vue'
import TripCart from './components/TripCart.vue'
import TripCheckout from './components/TripCheckout.vue'
import TripItinerary from './components/TripItinerary.vue'
import { addOnById, buildTripCart } from './addons.js'
import { HOTELS, hotelById, roomFor, defaultRoom, STAY } from './hotels.js'
import { readDeepLink, writeDeepLink } from './deeplink.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const pins = gillettePins(event)
const hotels = HOTELS
const tiers = deriveTiers(event)

const SCREENS = ['event', 'tickets', 'seats', 'hotel', 'hotelDetails', 'extras', 'cart', 'checkout', 'confirm']
const STEPS = ['Tickets', 'Seats', 'Hotel', 'Extras', 'Review', 'Checkout', 'Confirmed']
// The stepper is not the screen list any more: the property list and the hotel
// detail page are one STEP ("Hotel") in two screens, because a guest browsing
// rooms has not finished the hotel step — they are in the middle of it. The map
// is explicit rather than derived from an index so the two lists can be
// reordered independently.
const STEP_OF = { tickets: 0, seats: 1, hotel: 2, hotelDetails: 2, extras: 3, cart: 4, checkout: 5, confirm: 6 }
const STEP_SCREEN = ['tickets', 'seats', 'hotel', 'extras', 'cart', 'checkout', 'confirm']
const screen = ref('event')
const stepIndex = computed(() => STEP_OF[screen.value] ?? 0)

const tier = ref(null)
const quantity = ref(2)
const seatId = ref(null)
const hotel = ref(null)      // the property
const roomId = ref(null)     // the room type chosen on that property's page
const addOns = ref([])       // chosen add-on ids, in click order
const vehicles = ref(1)      // parking is the one extra that doesn't follow headcount
const orderNumber = 'EP-7T4F1M'

// The stay in the trip: a property plus a room. Resolved through roomFor() so an
// unknown or stale room id lands on the property's contracted block room rather
// than on nothing — the same fallback the tickets step uses for an unknown tier.
const room = computed(() => (hotel.value ? roomFor(hotel.value, roomId.value) : null))

const cart = computed(() =>
  tier.value
    ? buildTripCart({ event, tier: tier.value, quantity: quantity.value, hotel: hotel.value, room: room.value, nights: STAY.nights, addOns: addOns.value, vehicles: vehicles.value })
    : null
)

function qtyOf(i) { return i ? (i.quantity ?? i.qty ?? i.count ?? 0) : 0 }
function onTicketsContinue(payload) {
  const items = payload?.items || []
  const top = [...items].sort((a, b) => qtyOf(b) - qtyOf(a))[0]
  quantity.value = payload?.totalQuantity || qtyOf(top) || 2
  const price = top && (top.price ?? top.unitPrice)
  tier.value = price
    ? { id: top.id || top.tierId || 'tier', name: top.name || top.tierName || 'Ticket', price, colorVar: top.colorVar || '--ds-palette-red-500', currency: 'USD' }
    : tiers[1]
  go('seats')
}

// Opening a property is not choosing it: the trip only gains a stay when a ROOM
// is picked on the detail page. So this sets nothing but which page to show —
// backing out of a hotel you were reading leaves the trip exactly as it was.
const browsing = ref(null)
// Where picking a room should land. Empty on the way THROUGH the flow (the next
// step is extras); 'cart' when the guest came back from the cart to change the
// room, because dropping them at extras would make them walk the rest of the
// flow again to get back to the screen they left.
const returnTo = ref(null)

function startHotelStep() { returnTo.value = null; go('hotel') }
/** "Continue with hotel" — forward to extras, or back to the cart it came from. */
function continueFromHotel() { const back = returnTo.value; returnTo.value = null; go(back || 'extras') }
function openHotel(h) { browsing.value = h; go('hotelDetails') }
function skipHotel() { returnTo.value = null; setHotel(null); go('extras') }

/** A room card on the detail page — the click that actually buys a stay. */
function selectRoom(r) {
  setHotel(browsing.value)
  roomId.value = r.id
  const back = returnTo.value
  returnTo.value = null
  go(back || 'extras')
}

/**
 * Set (or clear) the stay. Clearing it also drops any extra that needs one —
 * currently the transfer, which departs from the hotel lobby.
 *
 * buildTripCart() already filters those out of the cart, so leaving the id in
 * state would price correctly; it would just be a lie on the extras screen,
 * where the card would still read "Added" while contributing nothing, and would
 * silently reappear on the bill if a hotel were chosen again.
 */
function setHotel(h) {
  hotel.value = h
  // A room belongs to a property, so changing or clearing the property drops the
  // room with it — carrying one across would price a room the new hotel doesn't
  // sell. The contracted block room is the landing spot; selectRoom() overwrites
  // it with the one actually clicked a line later.
  roomId.value = h ? defaultRoom(h)?.id ?? null : null
  if (!h) addOns.value = addOns.value.filter((id) => !addOnById(id)?.requiresHotel)
}

function toggleAddOn(addOn) {
  addOns.value = addOns.value.includes(addOn.id)
    ? addOns.value.filter((id) => id !== addOn.id)
    : [...addOns.value, addOn.id]
}
function removeAddOn(id) { addOns.value = addOns.value.filter((x) => x !== id) }

function go(s) { screen.value = s; window.scrollTo?.({ top: 0, behavior: 'smooth' }) }

/**
 * The cart's per-section Edit links. Everything but the stay is a plain jump.
 *
 * The stay reopens the property that is IN THE TRIP, which is not necessarily
 * the last one browsed — a guest can read the Hyatt, decline it, and still be
 * booked at the Westin. Without this the Edit link would open the page they
 * walked away from.
 */
function editStep(step) {
  if (step === 'hotelDetails') {
    returnTo.value = 'cart'
    if (!hotel.value) return go('hotel')
    browsing.value = hotel.value
  }
  go(step)
}
function restart() {
  tier.value = null; quantity.value = 2; seatId.value = null
  hotel.value = null; roomId.value = null; browsing.value = null; returnTo.value = null
  addOns.value = []; vehicles.value = 1
  go('event')
}
// Backwards only, and through STEP_SCREEN rather than SCREENS: step 2 ("Hotel")
// returns to the property list, never to a detail page for a property the guest
// may since have replaced.
function stepperNav(i) {
  const target = STEP_SCREEN[i]
  if (!target || SCREENS.indexOf(target) >= SCREENS.indexOf(screen.value)) return
  // Jumping back through the stepper is leaving the cart behind, not editing it.
  returnTo.value = null
  go(target)
}

// --- Deep links -------------------------------------------------------------
// Restore from ?screen=…&tier=…&qty=…&hotel=…&addons=…&cars=… on boot, then
// keep the URL current. A cart or confirmation link with no tier named would
// otherwise land on an empty cart, so those get the default Club tier — the
// same one the tickets step falls back to.
const saved = readDeepLink()
if (saved.quantity) quantity.value = saved.quantity
if (saved.vehicles) vehicles.value = saved.vehicles
if (saved.tier) tier.value = tiers.find((t) => t.id === saved.tier) || null
if (saved.hotel) hotel.value = hotelById(saved.hotel)
// The room is resolved lazily by the `room` computed, so an id that names a room
// this property doesn't sell falls through to its contracted block room rather
// than failing the link.
if (hotel.value) { roomId.value = saved.room || defaultRoom(hotel.value)?.id || null; browsing.value = hotel.value }
if (saved.addOns) addOns.value = saved.addOns.filter((id) => addOnById(id))
if (saved.screen && SCREENS.includes(saved.screen)) {
  screen.value = saved.screen
  if (!tier.value && screen.value !== 'event' && screen.value !== 'tickets') tier.value = tiers[1]
  // A detail-page link with no hotel named has no property to render; the list
  // is the honest landing, not a blank page.
  if (screen.value === 'hotelDetails' && !browsing.value) screen.value = 'hotel'
}
// Extras added from a link without a hotel would be dropped by the same rule
// setHotel() enforces — apply it once here so the two paths can't disagree.
if (!hotel.value) addOns.value = addOns.value.filter((id) => !addOnById(id)?.requiresHotel)

watch(
  [screen, tier, quantity, hotel, roomId, addOns, vehicles],
  () => writeDeepLink({
    screen: screen.value, tier: tier.value?.id, quantity: quantity.value,
    hotel: hotel.value?.id, room: roomId.value, addOns: addOns.value, vehicles: vehicles.value,
  }),
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="bapp">
    <!-- App bar -->
    <header class="bapp__bar">
      <button class="bapp__brand" @click="restart">
        <span class="bapp__logo">EventPipe</span>
        <span class="bapp__tag">Client Appreciation</span>
      </button>
      <span class="bapp__pill">Tickets → Hotel → Extras · Prototype</span>
    </header>

    <!-- Stepper (hidden on the intro) -->
    <div v-if="screen !== 'event'" class="bapp__stepper">
      <JourneyStepper :steps="STEPS" :current="stepIndex" clickable @navigate="stepperNav" />
    </div>

    <main class="bapp__main">
      <!-- 0 · Event intro -->
      <template v-if="screen === 'event'">
        <EventHero :event="event" />
        <div class="bapp__intro">
          <p>You're invited. EventPipe is treating our customers to the game — grab your seats, add a nearby hotel, and pick up parking, a tailgate or a ride to the stadium on the way out. One cart, one charge.</p>
          <button class="bapp__cta" @click="go('tickets')">Get started <q-icon name="arrow_forward" size="18px" /></button>
        </div>
      </template>

      <!-- 1 · Tickets -->
      <section v-else-if="screen === 'tickets'" class="bapp__step">
        <h2 class="bapp__h">How many, and where?</h2>
        <p class="bapp__sub">Pick a level — we'll fine-tune exact seats on the map next.</p>
        <TicketTierList :event="event" @continue="onTicketsContinue" />
      </section>

      <!-- 2 · Seats -->
      <section v-else-if="screen === 'seats'" class="bapp__step">
        <h2 class="bapp__h">Pick your seats</h2>
        <p class="bapp__sub">Drag to pan, scroll to zoom, tap a price to preview the view.</p>
        <VenueMap :event="event" :pins="pins" v-model="seatId" />
        <div class="bapp__nav">
          <button class="bapp__back" @click="go('tickets')">Back</button>
          <button class="bapp__cta" @click="startHotelStep">Continue to hotel <q-icon name="arrow_forward" size="18px" /></button>
        </div>
      </section>

      <!-- 3a · Pick the property -->
      <section v-else-if="screen === 'hotel'" class="bapp__step bapp__step--wide">
        <HotelPickStep
          :hotels="hotels" :event-name="event.name"
          :chosen="hotel ? { hotel, room } : null"
          @open="openHotel" @skip="skipHotel" @remove="setHotel(null)"
        />
        <div class="bapp__nav">
          <button class="bapp__back" @click="go('seats')">Back</button>
          <!-- Enabled only once a ROOM is in the trip. A property with no room
               has no rate, so "continue with hotel" would carry a stay the cart
               cannot price. -->
          <button class="bapp__cta" :disabled="!hotel" @click="continueFromHotel">
            {{ returnTo === 'cart' ? 'Back to your trip' : 'Continue with hotel' }} <q-icon name="arrow_forward" size="18px" />
          </button>
        </div>
      </section>

      <!-- 3b · The full hotel page — gallery, amenities, policies, rooms.
           Full-bleed: this is the booking site's own page and it lays itself out
           to 1180px, so the 820px step wrapper would crush it. -->
      <HotelDetails
        v-else-if="screen === 'hotelDetails' && browsing"
        :hotel="browsing" :event-name="event.name" :room-id="hotel?.id === browsing.id ? roomId : null"
        :guests="quantity" @back="go('hotel')" @select="selectRoom"
      />

      <!-- 4 · Gameday extras — the step this fork exists to add -->
      <section v-else-if="screen === 'extras'" class="bapp__step">
        <AddOnStep
          :selected="addOns" :guests="quantity" :vehicles="vehicles"
          :hotel="hotel" :event-name="event.name"
          @toggle="toggleAddOn" @update:vehicles="vehicles = $event" @skip="go('cart')"
        />
        <div class="bapp__nav">
          <button class="bapp__back" @click="go('hotel')">Back</button>
          <!-- Never disabled: adding nothing is a valid answer, and the button
               says which one it's carrying so "Continue" isn't a guess. -->
          <button class="bapp__cta" @click="go('cart')">
            {{ addOns.length ? `Continue with ${addOns.length} extra${addOns.length === 1 ? '' : 's'}` : 'Continue to review' }}
            <q-icon name="arrow_forward" size="18px" />
          </button>
        </div>
      </section>

      <!-- 5 · One cart -->
      <section v-else-if="screen === 'cart'" class="bapp__step bapp__step--narrow">
        <h2 class="bapp__h">Review your trip</h2>
        <p class="bapp__sub">Change anything here — the totals follow.</p>
        <TripCart
          v-if="cart" :cart="cart" :vehicles="vehicles"
          @checkout="go('checkout')" @edit="editStep"
          @update:quantity="quantity = $event" @update:vehicles="vehicles = $event"
          @remove-addon="removeAddOn" @remove-hotel="setHotel(null)"
        />
        <button class="bapp__back bapp__back--center" @click="go('extras')">Back to extras</button>
      </section>

      <!-- 6 · Checkout — the library's EXPANDED checkout page, full-bleed.
           Not wrapped in bapp__step: it is a two-column page with its own
           sticky rail and its own 1040px measure. -->
      <TripCheckout
        v-else-if="screen === 'checkout' && cart"
        :cart="cart" :event="event" @back="go('cart')" @submit="go('confirm')"
      />

      <!-- 7 · Confirmation — the library receipt, then the combined itinerary -->
      <section v-else-if="screen === 'confirm'" class="bapp__step bapp__step--narrow">
        <BundleConfirmation
          v-if="cart" :order-number="orderNumber" :event="event" :cart="cart"
          email="hello@girardjustin.com" :variant="hotel ? 'bundle' : 'ticket-only'"
        />
        <TripItinerary v-if="cart" :event="event" :cart="cart" class="bapp__itinerary" />
        <button class="bapp__cta bapp__cta--center" @click="restart">Start over</button>
      </section>
    </main>
  </div>
</template>

<style scoped>
.bapp { min-height: 100vh; background: var(--ds-color-surface-canvas); font-family: var(--ds-font-family); }
.bapp__bar {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 12px 24px; background: var(--ds-palette-navy-900, #01113e); color: #fff;
}
.bapp__brand { display: flex; align-items: baseline; gap: 8px; background: none; border: none; cursor: pointer; color: #fff; }
.bapp__logo { font-weight: 800; font-size: 18px; }
.bapp__tag { font-size: 12px; opacity: 0.8; }
.bapp__pill { font-size: 12px; background: rgba(255, 255, 255, 0.15); padding: 4px 10px; border-radius: var(--ds-radius-pill); }

.bapp__stepper { max-width: 760px; margin: 24px auto 0; padding: 0 24px; }
.bapp__main { padding-bottom: 64px; }

.bapp__intro { max-width: 720px; margin: 0 auto; padding: 24px; text-align: center; }
.bapp__intro p { color: var(--ds-color-text-subtle); font-size: var(--ds-font-size-md); line-height: 1.6; margin: 0 0 20px; }

.bapp__step { max-width: 820px; margin: 0 auto; padding: 28px 24px; }
.bapp__step--narrow { max-width: 560px; }
/* The property list mounts the booking site's own search-result card, which is
   built for a results page and reads as a postage stamp at 820px. */
.bapp__step--wide { max-width: 1100px; }
.bapp__h { margin: 0 0 4px; font-size: 24px; color: var(--ds-color-text); }
.bapp__sub { margin: 0 0 20px; color: var(--ds-color-text-subtle); }
/* The receipt and the itinerary are two cards, not one — the first is what was
   charged, the second is where to be. */
.bapp__itinerary { margin-top: 20px; }

.bapp__nav { display: flex; justify-content: space-between; margin-top: 24px; }
.bapp__cta {
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer; border: none; font: inherit;
  font-weight: var(--ds-font-weight-bold); background: var(--ds-color-background-brand-bold);
  color: var(--ds-color-text-inverse); padding: 12px 22px; border-radius: var(--ds-radius-button);
}
.bapp__cta:disabled { background: var(--ds-color-background-neutral); color: var(--ds-color-text-disabled); cursor: not-allowed; }
.bapp__cta--center { display: flex; margin: 24px auto 0; }
.bapp__back { background: none; border: 1px solid var(--ds-color-border-bold); color: var(--ds-color-text); font: inherit; font-weight: var(--ds-font-weight-bold); padding: 12px 20px; border-radius: var(--ds-radius-button); cursor: pointer; }
.bapp__back--center { display: block; margin: 16px auto 0; border: none; color: var(--ds-color-link); text-decoration: underline; }
</style>
