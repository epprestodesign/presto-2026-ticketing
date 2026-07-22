// PACKAGE DETAILS / Components / Policies — the ticketing & event policies block.
import PoliciesSection from '../../../components/details/PoliciesSection.vue'
import { policies, pad } from '../_pd-components-data.js'

export default {
  title: 'Package Details/Components/Policies',
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  name: 'Policies',
  render: () => ({ components: { PoliciesSection }, setup: () => ({ policies }), template: pad(`<PoliciesSection title="Ticketing & event policies" :policies="policies" />`, 760) }),
}
