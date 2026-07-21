// TICKETING & BUNDLES / Full Screens / Ticket + Hotel — the complete screens for
// a BUILD-YOUR-OWN ticket + hotel bundle: event page → seats → hotel add-on →
// unified cart → confirmation (dual-email v1). Prototype data.
import { ref } from 'vue'
import EventHero from '../../components/EventHero.vue'
import TicketTierList from '../../components/TicketTierList.vue'
import VenueMap from '../../components/VenueMap.vue'
import SeatMapSummary from '../../components/SeatMapSummary.vue'
import HotelAddOnStep from '../../components/HotelAddOnStep.vue'
import BundleCart from '../../components/BundleCart.vue'
import BundleConfirmation from '../../components/BundleConfirmation.vue'
import JourneyStepper from '../../components/JourneyStepper.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { deriveTiers } from '../../lib/seatmap.js'
import { gillettePins } from '../../lib/gilletteMap.js'
import { buildBundleCart, CONTRACTED_HOTELS } from '../../lib/bundles.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const tier = deriveTiers(event)[1]
const pins = gillettePins(event)
const hotel = CONTRACTED_HOTELS[1]
const cart = buildBundleCart({ event, tier, quantity: 2, hotel, nights: 1 })
const selection = {
  section: { id: 'club-10', label: 'CL10', tierName: tier.name, colorVar: tier.colorVar, price: tier.price, currency: 'USD', available: true },
  tier: { id: tier.id, name: tier.name },
}
const STEPS = ['Tickets', 'Seats', 'Hotel', 'Cart', 'Confirmed']

export default {
  title: 'Ticketing & Bundles/Tickets + Hotel',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Full screens for a **build-your-own ticket + hotel** bundle — tickets and a nearby hotel in one order (scope 3.3 + 3.5), confirmed via the v1 dual-email model. Prototype pricing/inventory.' } },
  },
}

const shell = (inner) => `<div style="min-height:100vh;background:var(--ds-color-surface-canvas);font-family:var(--ds-font-family);">${inner}</div>`
const stepper = (i) => `<div style="max-width:760px;margin:0 auto;padding:24px 24px 0;"><JourneyStepper :steps="steps" :current="${i}" /></div>`

export const EventPageScreen = {
  name: '1 · Event & tickets',
  render: () => ({
    components: { EventHero, TicketTierList, JourneyStepper },
    setup: () => ({ event, steps: STEPS }),
    template: shell(`<EventHero :event="event" />${stepper(0)}
      <div style="max-width:720px;margin:0 auto;padding:24px;">
        <h2 style="margin:0 0 16px;font-size:22px;color:var(--ds-color-text);">Choose your tickets</h2>
        <TicketTierList :event="event" />
      </div>`),
  }),
}

export const SeatsScreen = {
  name: '2 · Seats',
  render: () => ({
    components: { VenueMap, SeatMapSummary, JourneyStepper },
    setup: () => ({ event, pins, selection, qty: ref(2), steps: STEPS }),
    template: shell(`${stepper(1)}
      <div style="max-width:1080px;margin:0 auto;padding:24px;display:grid;grid-template-columns:1.6fr 1fr;gap:28px;align-items:start;">
        <VenueMap :event="event" :pins="pins" />
        <SeatMapSummary :event="event" :selection="selection" v-model="qty" />
      </div>`),
  }),
}

export const HotelScreen = {
  name: '3 · Hotel add-on',
  render: () => ({
    components: { HotelAddOnStep, JourneyStepper },
    setup: () => ({ event, hotels: CONTRACTED_HOTELS, hotelId: hotel.id, steps: STEPS }),
    template: shell(`${stepper(2)}
      <div style="max-width:720px;margin:0 auto;padding:24px;">
        <HotelAddOnStep :hotels="hotels" :event-name="event.name" check-in="2026-12-05" check-out="2026-12-06" :nights="1" source-mode="contracted" :selected-hotel-id="hotelId" />
      </div>`),
  }),
}

export const CartScreen = {
  name: '4 · Cart',
  render: () => ({
    components: { BundleCart, JourneyStepper },
    setup: () => ({ cart, steps: STEPS }),
    template: shell(`${stepper(3)}
      <div style="max-width:420px;margin:0 auto;padding:24px;"><BundleCart :cart="cart" :savings="58" /></div>`),
  }),
}

export const ConfirmationScreen = {
  name: '5 · Confirmation',
  render: () => ({
    components: { BundleConfirmation, JourneyStepper },
    setup: () => ({ event, cart, steps: STEPS }),
    template: shell(`${stepper(4)}
      <div style="display:flex;justify-content:center;padding:24px;"><BundleConfirmation order-number="EP-7Q4M2X" :event="event" :cart="cart" email="hello@girardjustin.com" variant="bundle" /></div>`),
  }),
}
