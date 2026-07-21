// TICKETING & BUNDLES / Packages / Package List — pre-built ticket + hotel (+
// experience) SKUs (scope 3.4), themed for the EventPipe client-appreciation
// Patriots outing: stadium tour, sponsored tailgate, family day, VIP, value.
import { ref, computed } from 'vue'
import PackageCard from '../../components/PackageCard.vue'
import { generatePackages, generatePackageGrid } from '../../lib/bundles.js'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const plainPackages = generatePackages(event, { nights: 1 })

export default {
  title: 'Ticket Map/Components/Packages/Package List',
  parameters: { layout: 'fullscreen' },
  argTypes: {
    count: {
      name: 'Packages (count)',
      description: 'Number of package SKUs — scale the list up to stress-test the cards + layout.',
      control: { type: 'range', min: 1, max: 40, step: 1 },
    },
  },
  args: { count: 5 },
}

// The headline: themed Patriots-experience packages. The `count` control scales
// the board — the first five mirror the curated set, beyond that recombine
// ticket tier + hotel + party size.
export const PatriotsExperiences = {
  name: 'Patriots Experiences',
  render: (args) => ({
    components: { PackageCard },
    setup() {
      const selectedId = ref(null)
      const packages = computed(() => generatePackageGrid(event, { count: args.count, nights: 1 }))
      return { event, packages, selectedId, pick: (p) => (selectedId.value = p.id) }
    },
    template: `
      <div style="max-width:680px;margin:0 auto;padding:28px;">
        <h2 style="font-family:var(--ds-font-family);margin:0 0 4px;font-size:22px;color:var(--ds-color-text);">Choose your Patriots experience</h2>
        <p style="font-family:var(--ds-font-family);margin:0 0 20px;color:var(--ds-color-text-subtle);">EventPipe is treating you to {{ event.name }} — pick the package that fits your crew. <strong>{{ packages.length }}</strong> packages available.</p>
        <div style="display:flex;flex-direction:column;gap:18px;">
          <PackageCard v-for="p in packages" :key="p.id" :pkg="p" :selected="p.id === selectedId" @select="pick" />
        </div>
      </div>
    `,
  }),
}

// Plain ticket + hotel packages (no signature experience).
export const TicketPlusHotel = {
  name: 'Ticket + Hotel',
  render: () => ({
    components: { PackageCard },
    setup() {
      const selectedId = ref(null)
      return { packages: plainPackages, selectedId, pick: (p) => (selectedId.value = p.id) }
    },
    template: `
      <div style="max-width:640px;margin:0 auto;padding:28px;display:flex;flex-direction:column;gap:16px;">
        <PackageCard v-for="p in packages" :key="p.id" :pkg="p" :selected="p.id === selectedId" @select="pick" />
      </div>
    `,
  }),
}
