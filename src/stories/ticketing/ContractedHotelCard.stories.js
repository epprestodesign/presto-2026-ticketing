// TICKETING & BUNDLES / Hotel Add-On / Contracted Hotel Card — one curated
// property with distance-from-venue, rating, room type, and nightly + stay total.
import { ref } from 'vue'
import ContractedHotelCard from '../../components/ContractedHotelCard.vue'
import { CONTRACTED_HOTELS } from '../../lib/bundles.js'

export default {
  title: 'Ticketing & Bundles/Hotel Add-On/Contracted Hotel Card',
  component: ContractedHotelCard,
  parameters: { layout: 'centered' },
}

export const Default = {
  render: () => ({
    components: { ContractedHotelCard },
    setup() {
      const selected = ref(false)
      return { hotel: CONTRACTED_HOTELS[0], selected }
    },
    template: `<div style="width:520px;max-width:100%;"><ContractedHotelCard :hotel="hotel" :nights="1" :selected="selected" @toggle="selected = !selected" /></div>`,
  }),
}
