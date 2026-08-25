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
import { ref, computed, watch } from 'vue'
import EventHero from '@lib/components/EventHero.vue'
import TicketTierList from '@lib/components/TicketTierList.vue'
import VenueMap from '@lib/components/VenueMap.vue'
import HotelAddOnStep from '@lib/components/HotelAddOnStep.vue'
import BundleConfirmation from '@lib/components/BundleConfirmation.vue'
import JourneyStepper from '@lib/components/JourneyStepper.vue'
import { fixtureEvents } from '@lib/lib/ticketmaster.js'
import { deriveTiers } from '@lib/lib/seatmap.js'
import { gillettePins } from '@lib/lib/gilletteMap.js'
import { CONTRACTED_HOTELS } from '@lib/lib/bundles.js'
import AddOnStep from './components/AddOnStep.vue'
import TripCart from './components/TripCart.vue'
import TripItinerary from './components/TripItinerary.vue'
import { addOnById, buildTripCart } from './addons.js'
import { readDeepLink, writeDeepLink } from './deeplink.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const pins = gillettePins(event)
const hotels = CONTRACTED_HOTELS
const tiers = deriveTiers(event)

const SCREENS = ['event', 'tickets', 'seats', 'hotel', 'extras', 'cart', 'confirm']
const STEPS = ['Tickets', 'Seats', 'Hotel', 'Extras', 'Review', 'Confirmed']
const screen = ref('event')
const stepIndex = computed(() => Math.max(0, SCREENS.indexOf(screen.value) - 1))

const tier = ref(null)
const quantity = ref(2)
const seatId = ref(null)
const hotel = ref(null)
const addOns = ref([])       // chosen add-on ids, in click order
const vehicles = ref(1)      // parking is the one extra that doesn't follow headcount
const orderNumber = 'EP-7T4F1M'

const cart = computed(() =>
  tier.value
    ? buildTripCart({ event, tier: tier.value, quantity: quantity.value, hotel: hotel.value, nights: 1, addOns: addOns.value, vehicles: vehicles.value })
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

function selectHotel(h) { setHotel(h) }
function skipHotel() { setHotel(null); go('extras') }

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
  if (!h) addOns.value = addOns.value.filter((id) => !addOnById(id)?.requiresHotel)
}

function toggleAddOn(addOn) {
  addOns.value = addOns.value.includes(addOn.id)
    ? addOns.value.filter((id) => id !== addOn.id)
    : [...addOns.value, addOn.id]
}
function removeAddOn(id) { addOns.value = addOns.value.filter((x) => x !== id) }

function go(s) { screen.value = s; window.scrollTo?.({ top: 0, behavior: 'smooth' }) }
function restart() {
  tier.value = null; quantity.value = 2; seatId.value = null
  hotel.value = null; addOns.value = []; vehicles.value = 1
  go('event')
}
function stepperNav(i) { const target = SCREENS[i + 1]; if (target && SCREENS.indexOf(target) < SCREENS.indexOf(screen.value)) go(target) }

// --- Deep links -------------------------------------------------------------
// Restore from ?screen=…&tier=…&qty=…&hotel=…&addons=…&cars=… on boot, then
// keep the URL current. A cart or confirmation link with no tier named would
// otherwise land on an empty cart, so those get the default Club tier — the
// same one the tickets step falls back to.
const saved = readDeepLink()
if (saved.quantity) quantity.value = saved.quantity
if (saved.vehicles) vehicles.value = saved.vehicles
if (saved.tier) tier.value = tiers.find((t) => t.id === saved.tier) || null
if (saved.hotel) hotel.value = hotels.find((h) => h.id === saved.hotel) || null
if (saved.addOns) addOns.value = saved.addOns.filter((id) => addOnById(id))
if (saved.screen && SCREENS.includes(saved.screen)) {
  screen.value = saved.screen
  if (!tier.value && screen.value !== 'event' && screen.value !== 'tickets') tier.value = tiers[1]
}
// Extras added from a link without a hotel would be dropped by the same rule
// setHotel() enforces — apply it once here so the two paths can't disagree.
if (!hotel.value) addOns.value = addOns.value.filter((id) => !addOnById(id)?.requiresHotel)

watch(
  [screen, tier, quantity, hotel, addOns, vehicles],
  () => writeDeepLink({
    screen: screen.value, tier: tier.value?.id, quantity: quantity.value,
    hotel: hotel.value?.id, addOns: addOns.value, vehicles: vehicles.value,
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
          <button class="bapp__cta" @click="go('hotel')">Continue to hotel <q-icon name="arrow_forward" size="18px" /></button>
        </div>
      </section>

      <!-- 3 · Hotel add-on -->
      <section v-else-if="screen === 'hotel'" class="bapp__step">
        <HotelAddOnStep
          :hotels="hotels" :event-name="event.name"
          check-in="2026-12-05" check-out="2026-12-06" :nights="1"
          source-mode="contracted" :selected-hotel-id="hotel?.id || null"
          @select="selectHotel" @skip="skipHotel"
        />
        <div class="bapp__nav">
          <button class="bapp__back" @click="go('seats')">Back</button>
          <button class="bapp__cta" :disabled="!hotel" @click="go('extras')">Continue with hotel <q-icon name="arrow_forward" size="18px" /></button>
        </div>
      </section>

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
          @checkout="go('confirm')" @edit="go"
          @update:quantity="quantity = $event" @update:vehicles="vehicles = $event"
          @remove-addon="removeAddOn" @remove-hotel="setHotel(null)"
        />
        <button class="bapp__back bapp__back--center" @click="go('extras')">Back to extras</button>
      </section>

      <!-- 6 · Confirmation — the library receipt, then the combined itinerary -->
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
