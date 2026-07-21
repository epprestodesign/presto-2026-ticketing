// COMPONENTS / Data Viz / Price Histogram — price distribution for listing filters.
import { ref } from 'vue'
import PriceHistogram from '../../components/PriceHistogram.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { generateListings, priceDistribution } from '../../lib/seatListings.js'

const listings = generateListings(fixtureEvents[1] || fixtureEvents[0], { count: 40 })
const dist = priceDistribution(listings)

export default {
  title: 'Components/Data Viz/Price Histogram',
  component: PriceHistogram,
  parameters: { layout: 'padded' },
}

export const Default = {
  render: () => ({
    components: { PriceHistogram },
    setup: () => ({ dist }),
    template: `<div style="max-width:420px;"><PriceHistogram :bins="dist.bins" :min="dist.min" :max="dist.max" /></div>`,
  }),
}

// With a selected price range: in-range bars stay brand-colored, others dim.
export const WithSelectedRange = {
  render: () => ({
    components: { PriceHistogram },
    setup() {
      const span = dist.max - dist.min
      const selectedMin = ref(Math.round(dist.min + span * 0.2))
      const selectedMax = ref(Math.round(dist.min + span * 0.65))
      return { dist, selectedMin, selectedMax }
    },
    template: `
      <div style="max-width:420px;display:flex;flex-direction:column;gap:14px;">
        <PriceHistogram :bins="dist.bins" :min="dist.min" :max="dist.max" :selected-min="selectedMin" :selected-max="selectedMax" />
        <div style="display:flex;gap:16px;font-family:var(--ds-font-family);font-size:14px;">
          <label>Min <input type="range" :min="dist.min" :max="dist.max" v-model.number="selectedMin" /></label>
          <label>Max <input type="range" :min="dist.min" :max="dist.max" v-model.number="selectedMax" /></label>
        </div>
      </div>
    `,
  }),
}
