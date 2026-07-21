// TICKETING & BUNDLES / Components / Packages / Package Dialog — a full-screen
// package customization modal (mirrors the Hotel Details Room Booking Dialog):
// option selectors (ticket level, hotel, nights) + a quantity selector + optional
// experience add-ons, with the package price re-pricing live. Opens when the
// PackageCard title is clicked. Prototype data.
import { ref } from 'vue'
import PackageCard from '../../components/PackageCard.vue'
import PackageBookingDialog from '../../components/PackageBookingDialog.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { generateExperiencePackages, CONTRACTED_HOTELS } from '../../lib/bundles.js'
import { deriveTiers } from '../../lib/seatmap.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const packages = generateExperiencePackages(event, { nights: 1 })
const tiers = deriveTiers(event)
const addOns = [
  { id: 'parking', label: 'Premium parking pass', price: 60, note: 'Reserved lot near the gate' },
  { id: 'merch', label: 'Team merch pack', price: 85, note: 'Cap + scarf for every guest' },
  { id: 'catering', label: 'Premium catering upgrade', price: 120, note: 'All-inclusive food & drink' },
  { id: 'shuttle', label: 'Round-trip shuttle', price: 45, note: 'From your hotel to Gillette' },
]

export default {
  title: 'Ticket Map/Components/Packages/Package Dialog',
  component: PackageBookingDialog,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'A package customization modal in the style of the Hotel Details **Room Booking Dialog** — option selectors (ticket level, hotel, nights), a quantity selector, and optional add-ons, with the package price updating live. Opens from the **PackageCard title**. Prototype pricing/inventory.' } },
  },
}

// Interactive — click a package title to open the dialog.
export const FromCard = {
  name: 'From Card (click title)',
  render: () => ({
    components: { PackageCard, PackageBookingDialog },
    setup() {
      const open = ref(false)
      const current = ref(packages[0])
      const onTitle = (p) => { current.value = p; open.value = true }
      return { packages, tiers, hotels: CONTRACTED_HOTELS, addOns, open, current, onTitle }
    },
    template: `
      <div style="max-width:680px;margin:0 auto;padding:24px;background:var(--ds-color-surface-canvas);min-height:100vh;font-family:var(--ds-font-family);">
        <p style="margin:0 0 16px;color:var(--ds-color-text-subtle);">Click a package <strong>title</strong> to customize it.</p>
        <div style="display:flex;flex-direction:column;gap:18px;">
          <PackageCard v-for="p in packages" :key="p.id" :pkg="p" @title="onTitle" @select="() => {}" />
        </div>
        <q-dialog v-model="open">
          <PackageBookingDialog :pkg="current" :tiers="tiers" :hotels="hotels" :add-ons="addOns" @close="open = false" @add="open = false" />
        </q-dialog>
      </div>`,
  }),
}

// The dialog on its own (for review).
export const Dialog = {
  name: 'Dialog',
  render: () => ({
    components: { PackageBookingDialog },
    setup: () => ({ pkg: packages[0], tiers, hotels: CONTRACTED_HOTELS, addOns }),
    template: `
      <div style="display:flex;justify-content:center;align-items:flex-start;padding:24px;background:var(--ds-color-surface-sunken);min-height:100vh;">
        <PackageBookingDialog :pkg="pkg" :tiers="tiers" :hotels="hotels" :add-ons="addOns" @close="() => {}" @add="() => {}" />
      </div>`,
  }),
}
