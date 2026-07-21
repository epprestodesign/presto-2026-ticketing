// TICKETING & BUNDLES / Packages / Package List — pre-built ticket + hotel SKUs
// (scope 3.4). Each package adds both components to the cart as one item and is
// priced below the a-la-carte total. Prototype data on a real event.
import { ref } from 'vue'
import PackageCard from '../../components/PackageCard.vue'
import { generatePackages } from '../../lib/bundles.js'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /stadium|field/i.test(e.venue?.name || '')) || fixtureEvents[1] || fixtureEvents[0]
const packages = generatePackages(event, { nights: 1 })

export default {
  title: 'Ticketing & Bundles/Packages/Package List',
  parameters: { layout: 'fullscreen' },
}

export const List = {
  render: () => ({
    components: { PackageCard },
    setup() {
      const selectedId = ref(null)
      return { event, packages, selectedId, pick: (p) => (selectedId.value = p.id) }
    },
    template: `
      <div style="max-width:640px;margin:0 auto;padding:28px;">
        <h2 style="font-family:var(--ds-font-family);margin:0 0 4px;font-size:22px;color:var(--ds-color-text);">Choose a package</h2>
        <p style="font-family:var(--ds-font-family);margin:0 0 20px;color:var(--ds-color-text-subtle);">Ticket + hotel, bundled and discounted for {{ event.name }}.</p>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <PackageCard v-for="p in packages" :key="p.id" :pkg="p" :selected="p.id === selectedId" @select="pick" />
        </div>
      </div>
    `,
  }),
}
