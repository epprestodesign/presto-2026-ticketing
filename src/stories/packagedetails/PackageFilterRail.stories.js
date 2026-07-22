// PACKAGE DETAILS / Browse Packages / Components / Filter Rail — the Browse
// Packages left filter rail, extracted into its own reusable component: a "Hotels
// included only" toggle card, a Guests selector (moved here from the old tucked
// search bar), an Experience-type checklist, and a Price range with histogram.
import { ref } from 'vue'
import PackageFilterRail from '../../components/PackageFilterRail.vue'
import { packages } from './_pd-components-data.js'

// Derive the filter data from the package fixtures (same as PackageListPage).
const prices = packages.map((p) => p.packagePrice)
const bounds = { min: Math.min(...prices, 0), max: Math.max(...prices, 100) }
const themes = [...new Set(packages.map((p) => p.theme).filter(Boolean))]
const priceHistogram = (() => {
  const { min, max } = bounds
  const span = (max - min) || 1
  const bins = new Array(16).fill(0)
  for (const p of prices) bins[Math.min(15, Math.floor(((p - min) / span) * 16))]++
  return bins
})()

export default {
  title: 'Package Details/Browse Packages/Components/Filter Rail',
  component: PackageFilterRail,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'The **Filter Rail** for Browse Packages — a self-contained component driving the list filters: a **Hotels included only** toggle, a **Guests** selector (moved out of the old tucked search bar into the rail), an **Experience type** checklist, and a **Price** range with histogram. Driven by `themes` / `bounds` / `priceHistogram` props and four v-models (`hotelOnly` · `guests` · `selThemes` · `price`); the page owns the filtering logic.' } },
  },
}

export const Default = {
  name: 'Filter Rail',
  render: () => ({
    components: { PackageFilterRail },
    setup() {
      const hotelOnly = ref(false)
      const guests = ref(2)
      const selThemes = ref([])
      const price = ref({ min: bounds.min, max: bounds.max })
      return { themes, bounds, priceHistogram, hotelOnly, guests, selThemes, price }
    },
    template: `
      <div style="max-width:300px;padding:24px;background:var(--ds-color-surface-canvas);min-height:100vh;font-family:var(--ds-font-family);">
        <PackageFilterRail
          :themes="themes" :bounds="bounds" :price-histogram="priceHistogram"
          v-model:hotel-only="hotelOnly" v-model:guests="guests"
          v-model:sel-themes="selThemes" v-model:price="price"
        />
      </div>`,
  }),
}
