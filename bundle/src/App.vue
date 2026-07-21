<script setup>
// Ticket + Hotel BUNDLE prototype — a clickable end-to-end journey for the
// EventPipe client-appreciation outing (Patriots v Bills at Gillette), built
// entirely from the REAL library components via @lib. Prototype data throughout.
import { ref, computed } from 'vue'
import EventHero from '@lib/components/EventHero.vue'
import TicketTierList from '@lib/components/TicketTierList.vue'
import VenueMap from '@lib/components/VenueMap.vue'
import HotelAddOnStep from '@lib/components/HotelAddOnStep.vue'
import BundleCart from '@lib/components/BundleCart.vue'
import BundleConfirmation from '@lib/components/BundleConfirmation.vue'
import JourneyStepper from '@lib/components/JourneyStepper.vue'
import { fixtureEvents } from '@lib/lib/ticketmaster.js'
import { deriveTiers } from '@lib/lib/seatmap.js'
import { gillettePins } from '@lib/lib/gilletteMap.js'
import { buildBundleCart, CONTRACTED_HOTELS } from '@lib/lib/bundles.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const pins = gillettePins(event)
const hotels = CONTRACTED_HOTELS

const SCREENS = ['event', 'tickets', 'seats', 'hotel', 'cart', 'confirm']
const STEPS = ['Tickets', 'Seats', 'Hotel', 'Cart', 'Confirmed']
const screen = ref('event')
const stepIndex = computed(() => Math.max(0, SCREENS.indexOf(screen.value) - 1))

const tier = ref(null)
const quantity = ref(2)
const seatId = ref(null)
const hotel = ref(null)
const orderNumber = 'EP-6D2B9K'

const cart = computed(() =>
  tier.value ? buildBundleCart({ event, tier: tier.value, quantity: quantity.value, hotel: hotel.value, nights: 1 }) : null
)

function qtyOf(i) { return i ? (i.quantity ?? i.qty ?? i.count ?? 0) : 0 }
function onTicketsContinue(payload) {
  const items = payload?.items || []
  const top = [...items].sort((a, b) => qtyOf(b) - qtyOf(a))[0]
  quantity.value = payload?.totalQuantity || qtyOf(top) || 2
  const price = top && (top.price ?? top.unitPrice)
  tier.value = price
    ? { id: top.id || top.tierId || 'tier', name: top.name || top.tierName || 'Ticket', price, colorVar: top.colorVar || '--ds-palette-red-500', currency: 'USD' }
    : deriveTiers(event)[1]
  go('seats')
}
function selectHotel(h) { hotel.value = h }
function skipHotel() { hotel.value = null; go('cart') }

function go(s) { screen.value = s; window.scrollTo?.({ top: 0, behavior: 'smooth' }) }
function restart() { tier.value = null; quantity.value = 2; seatId.value = null; hotel.value = null; go('event') }
function stepperNav(i) { const target = SCREENS[i + 1]; if (target && SCREENS.indexOf(target) < SCREENS.indexOf(screen.value)) go(target) }
</script>

<template>
  <div class="bapp">
    <!-- App bar -->
    <header class="bapp__bar">
      <button class="bapp__brand" @click="restart">
        <span class="bapp__logo">EventPipe</span>
        <span class="bapp__tag">Client Appreciation</span>
      </button>
      <span class="bapp__pill">Ticket + Hotel Bundle · Prototype</span>
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
          <p>You're invited. EventPipe is treating our customers to the game — grab your seats and we'll bundle a nearby hotel so you're taken care of from kickoff to checkout.</p>
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
          <button class="bapp__cta" :disabled="!hotel" @click="go('cart')">Continue with hotel <q-icon name="arrow_forward" size="18px" /></button>
        </div>
      </section>

      <!-- 4 · Cart -->
      <section v-else-if="screen === 'cart'" class="bapp__step bapp__step--narrow">
        <h2 class="bapp__h">Review your order</h2>
        <BundleCart v-if="cart" :cart="cart" :savings="hotel ? 58 : 0" @checkout="go('confirm')" />
        <button class="bapp__back bapp__back--center" @click="go('hotel')">Back to hotel</button>
      </section>

      <!-- 5 · Confirmation -->
      <section v-else-if="screen === 'confirm'" class="bapp__step bapp__step--narrow">
        <BundleConfirmation
          v-if="cart" :order-number="orderNumber" :event="event" :cart="cart"
          email="hello@girardjustin.com" :variant="hotel ? 'bundle' : 'ticket-only'"
        />
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
