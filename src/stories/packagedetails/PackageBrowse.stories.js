// PACKAGE DETAILS / Browse Packages — the Patriots experience packages laid out
// like the Browse Hotels search-results page (hero → tucked search → filter rail ·
// horizontal package result cards · optional ad rail). "Quick view" on a card
// opens the condensed PackageQuickViewDialog; "Customize" opens the full
// PackageBookingDialog. Prototype data.
import { ref, computed } from 'vue'
import GlobalNav from '../../components/GlobalNav.vue'
import PackageListPage from '../../components/PackageListPage.vue'
import PackageBookingDialog from '../../components/PackageBookingDialog.vue'
import TicketQuantityDialog from '../../components/TicketQuantityDialog.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { generatePackageGrid, CONTRACTED_HOTELS } from '../../lib/bundles.js'
import { deriveTiers } from '../../lib/seatmap.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const tiers = deriveTiers(event, 'stadium')
const ADDONS = [
  { id: 'parking', label: 'Reserved VIP parking', price: 45, note: 'Steps from the gate' },
  { id: 'merch', label: 'Team merchandise pack', price: 60, popular: true },
  { id: 'transfer', label: 'Round-trip stadium transfer', price: 35 },
]

export default {
  title: 'Package Details/Browse Packages',
  component: PackageListPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component:
      'Browse the Patriots experience packages in the **Browse Hotels layout** — a navy event hero with a tucked search bar, a left filter rail (experience type · price · hotel-included), and horizontal package result cards with a count + sort toolbar. **Quick view** opens the condensed [PackageQuickViewDialog]; **Customize** opens the full [PackageBookingDialog]. Prototype pricing/inventory.' } },
  },
  argTypes: {
    count: { name: 'Packages (count)', description: 'How many package SKUs to browse.', control: { type: 'range', min: 3, max: 40, step: 1 } },
  },
  args: { count: 9 },
}

const makePage = (adSize) => (args) => ({
  components: { GlobalNav, PackageListPage, PackageBookingDialog },
  setup() {
    const packages = computed(() => generatePackageGrid(event, { count: args.count, nights: 1 }))
    const bookOpen = ref(false)
    const bookPkg = ref(null)
    const customize = (p) => { bookPkg.value = p; bookOpen.value = true }
    return { event, packages, adSize, tiers, hotels: CONTRACTED_HOTELS, addOns: ADDONS, bookOpen, bookPkg, customize }
  },
  template: `
    <div style="min-height:100vh;background:var(--ds-color-surface-canvas);">
      <global-nav brand="EventPipe" />
      <package-list-page :event="event" :packages="packages" :ad-size="adSize" @customize="customize" @select="() => {}" />
      <q-dialog v-model="bookOpen">
        <package-booking-dialog v-if="bookPkg" :pkg="bookPkg" :tiers="tiers" :hotels="hotels" :add-ons="addOns" @close="bookOpen = false" @add="bookOpen = false" />
      </q-dialog>
    </div>`,
})

/** Browse Packages — Core layout (no ad rail). */
export const CoreBookingWidget = { name: 'Browse Packages', render: makePage(null) }

/** Browse Packages — with a right-rail Display Ad (160×600). */
export const WithDisplayAd = { name: 'With Display Ad', render: makePage([160, 600]) }

/**
 * Browse Packages with the "how many guests?" prompt overlaid on load — the guest
 * picks a party size before browsing, which seeds the search bar's guest count
 * (mirrors the Ticket Map's "With Quantity Prompt").
 */
export const WithGuestPrompt = {
  name: 'With Guest Prompt',
  render: (args) => ({
    components: { GlobalNav, PackageListPage, PackageBookingDialog, TicketQuantityDialog },
    setup() {
      const packages = computed(() => generatePackageGrid(event, { count: args.count, nights: 1 }))
      const bookOpen = ref(false)
      const bookPkg = ref(null)
      const customize = (p) => { bookPkg.value = p; bookOpen.value = true }
      const promptOpen = ref(true)
      const guests = ref(2)
      const onSelect = (n) => { guests.value = n; promptOpen.value = false }
      return { event, packages, tiers, hotels: CONTRACTED_HOTELS, addOns: ADDONS, bookOpen, bookPkg, customize, promptOpen, guests, onSelect }
    },
    template: `
      <div style="min-height:100vh;background:var(--ds-color-surface-canvas);">
        <global-nav brand="EventPipe" />
        <package-list-page :key="guests" :event="event" :packages="packages" :initial-guests="guests" @customize="customize" @select="() => {}" />
        <q-dialog v-model="bookOpen">
          <package-booking-dialog v-if="bookPkg" :pkg="bookPkg" :tiers="tiers" :hotels="hotels" :add-ons="addOns" @close="bookOpen = false" @add="bookOpen = false" />
        </q-dialog>
        <q-dialog v-model="promptOpen">
          <ticket-quantity-dialog
            title="How many guests?"
            subtitle="Everyone in your group is included in the package."
            icon="group"
            :selected="guests" :available="8" :max="8" cap-plus
            skip-label="Skip, browse all packages"
            @select="onSelect" @skip="promptOpen = false" @close="promptOpen = false"
          />
        </q-dialog>
      </div>`,
  }),
}
