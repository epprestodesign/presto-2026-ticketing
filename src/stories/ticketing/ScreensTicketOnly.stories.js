// TICKETING & BUNDLES / Full Screens / Ticket Only — the complete screens for a
// TICKET-ONLY purchase (no hotel): event page → seats → cart → confirmation.
// Ticketmaster fulfills the tickets (no EP hotel email). Prototype data.
import { ref } from 'vue'
import EventHero from '../../components/EventHero.vue'
import TicketTierList from '../../components/TicketTierList.vue'
import VenueMap from '../../components/VenueMap.vue'
import SeatMapSummary from '../../components/SeatMapSummary.vue'
import BundleCart from '../../components/BundleCart.vue'
import BundleConfirmation from '../../components/BundleConfirmation.vue'
import JourneyStepper from '../../components/JourneyStepper.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { deriveTiers } from '../../lib/seatmap.js'
import { gillettePins } from '../../lib/gilletteMap.js'
import { buildBundleCart } from '../../lib/bundles.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const tier = deriveTiers(event)[1] // Club
const pins = gillettePins(event)
const cart = buildBundleCart({ event, tier, quantity: 2 })
const selection = {
  section: { id: 'club-10', label: 'CL10', tierName: tier.name, colorVar: tier.colorVar, price: tier.price, currency: 'USD', available: true },
  tier: { id: tier.id, name: tier.name },
}
const STEPS = ['Tickets', 'Seats', 'Cart', 'Confirmed']

export default {
  title: 'Ticketing & Bundles/Tickets Only',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Full screens for a **ticket-only** purchase — no hotel. Ticketmaster fulfills the tickets; EventPipe sends no hotel confirmation. Prototype pricing/inventory.' } },
  },
}

const shell = (inner) => `<div style="min-height:100vh;background:var(--ds-color-surface-canvas);font-family:var(--ds-font-family);">${inner}</div>`
const stepper = (i) => `<div style="max-width:760px;margin:0 auto;padding:24px 24px 0;"><JourneyStepper :steps="steps" :current="${i}" /></div>`

export const EventPageScreen = {
  name: '1 · Event & tickets',
  render: () => ({
    components: { EventHero, TicketTierList, JourneyStepper },
    setup: () => ({ event, steps: STEPS }),
    template: shell(`
      <EventHero :event="event" />
      ${stepper(0)}
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

export const CartScreen = {
  name: '3 · Cart',
  render: () => ({
    components: { BundleCart, JourneyStepper },
    setup: () => ({ cart, steps: STEPS }),
    template: shell(`${stepper(2)}
      <div style="max-width:420px;margin:0 auto;padding:24px;"><BundleCart :cart="cart" /></div>`),
  }),
}

export const ConfirmationScreen = {
  name: '4 · Confirmation',
  render: () => ({
    components: { BundleConfirmation, JourneyStepper },
    setup: () => ({ event, cart, steps: STEPS }),
    template: shell(`${stepper(3)}
      <div style="display:flex;justify-content:center;padding:24px;"><BundleConfirmation order-number="EP-2B8H5W" :event="event" :cart="cart" email="hello@girardjustin.com" variant="ticket-only" /></div>`),
  }),
}
