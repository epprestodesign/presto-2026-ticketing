// TICKETING & BUNDLES / Packages Only — the complete screens for a PACKAGE
// purchase WITHOUT a hotel: pick a pre-built Patriots experience (ticket + a
// signature experience as one SKU) → cart → confirmation. The 2×2 pair of
// "Packages + Hotel". Prototype data.
import { ref } from 'vue'
import PackageCard from '../../components/PackageCard.vue'
import BundleCart from '../../components/BundleCart.vue'
import BundleConfirmation from '../../components/BundleConfirmation.vue'
import JourneyStepper from '../../components/JourneyStepper.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { generateExperiencePackages, stripHotel } from '../../lib/bundles.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
// Ticket + experience only — no hotel (see "Packages + Hotel" for the bundled stay).
const packages = generateExperiencePackages(event, { nights: 1 }).map(stripHotel)
const pkg = packages[0] // Legends Stadium Tour

// A package is a single SKU (scope PK-03): one cart line at the package price.
const fees = Math.round(pkg.packagePrice * 0.10)
const taxes = Math.round(pkg.packagePrice * 0.09)
const pkgCart = {
  items: [{ type: 'experience', label: pkg.name, sublabel: `${pkg.ticket.tierName} ticket · ${pkg.theme}`, amount: pkg.packagePrice }],
  subtotal: pkg.packagePrice, fees, taxes, total: pkg.packagePrice + fees + taxes, currency: 'USD',
}
const STEPS = ['Package', 'Cart', 'Confirmed']

export default {
  title: 'Ticketing & Bundles/Packages Only',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Full screens for a **package without a hotel** — a pre-built ticket + experience SKU added as one cart item (scope 3.4). The 2×2 pair of **Packages + Hotel**. Prototype pricing/inventory.' } },
  },
}

const shell = (inner) => `<div style="min-height:100vh;background:var(--ds-color-surface-canvas);font-family:var(--ds-font-family);">${inner}</div>`
const stepper = (i) => `<div style="max-width:680px;margin:0 auto;padding:24px 24px 0;"><JourneyStepper :steps="steps" :current="${i}" /></div>`

export const PackagesScreen = {
  name: '1 · Choose a package',
  render: () => ({
    components: { PackageCard, JourneyStepper },
    setup() {
      const selectedId = ref(pkg.id)
      return { packages, event, steps: STEPS, selectedId, pick: (p) => (selectedId.value = p.id) }
    },
    template: shell(`${stepper(0)}
      <div style="max-width:680px;margin:0 auto;padding:20px 24px 48px;">
        <h2 style="margin:0 0 4px;font-size:22px;color:var(--ds-color-text);">Choose your Patriots experience</h2>
        <p style="margin:0 0 20px;color:var(--ds-color-text-subtle);">EventPipe is treating you to {{ event.name }} — pick the experience that fits your crew. Add a hotel later, or keep it just the game.</p>
        <div style="display:flex;flex-direction:column;gap:18px;">
          <PackageCard v-for="p in packages" :key="p.id" :pkg="p" :selected="p.id === selectedId" @select="pick" />
        </div>
      </div>`),
  }),
}

export const CartScreen = {
  name: '2 · Cart',
  render: () => ({
    components: { BundleCart, JourneyStepper },
    setup: () => ({ cart: pkgCart, savings: pkg.savings, steps: STEPS }),
    template: shell(`${stepper(1)}
      <div style="max-width:420px;margin:0 auto;padding:24px;"><BundleCart :cart="cart" :savings="savings" /></div>`),
  }),
}

export const ConfirmationScreen = {
  name: '3 · Confirmation',
  render: () => ({
    components: { BundleConfirmation, JourneyStepper },
    setup: () => ({ event, cart: pkgCart, steps: STEPS }),
    template: shell(`${stepper(2)}
      <div style="display:flex;justify-content:center;padding:24px;"><BundleConfirmation order-number="EP-9F3K1P" :event="event" :cart="cart" email="hello@girardjustin.com" variant="package" /></div>`),
  }),
}
