// TICKETING & BUNDLES / Packages / Package Card — a single ticket + hotel SKU.
import { ref } from 'vue'
import PackageCard from '../../components/PackageCard.vue'
import { generatePackages } from '../../lib/bundles.js'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /stadium|field/i.test(e.venue?.name || '')) || fixtureEvents[1] || fixtureEvents[0]
const packages = generatePackages(event, { nights: 1 })

export default {
  title: 'Ticket Map/Components/Packages/Package Card',
  component: PackageCard,
  parameters: { layout: 'centered' },
}

export const Default = {
  render: () => ({
    components: { PackageCard },
    setup() {
      const selected = ref(false)
      return { pkg: packages[0], selected }
    },
    template: `<div style="width:460px;max-width:100%;"><PackageCard :pkg="pkg" :selected="selected" @select="selected = !selected" /></div>`,
  }),
}

export const SoldOut = {
  render: () => ({
    components: { PackageCard },
    setup: () => ({ pkg: { ...packages[1], soldOut: true } }),
    template: `<div style="width:460px;max-width:100%;"><PackageCard :pkg="pkg" /></div>`,
  }),
}
