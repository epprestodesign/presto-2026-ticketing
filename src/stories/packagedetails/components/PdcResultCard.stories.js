// PACKAGE DETAILS / Components / Result Card — the horizontal browse result card.
import PackageResultCard from '../../../components/PackageResultCard.vue'
import { packages, pad } from '../_pd-components-data.js'

export default {
  title: 'Package Details/Components/Result Card',
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  name: 'Result Card',
  render: () => ({
    components: { PackageResultCard },
    setup: () => ({ packages }),
    template: pad(`<div style="display:flex;flex-direction:column;gap:16px;"><PackageResultCard v-for="p in packages.slice(0,4)" :key="p.id" :pkg="p" @quickview="() => {}" @customize="() => {}" @select="() => {}" /></div>`, 860),
  }),
}
