// PACKAGE DETAILS / Components / Packages — the package cards grid.
import PackageCard from '../../../components/PackageCard.vue'
import { packages, pad } from '../_pd-components-data.js'

export default {
  title: 'Package Details/Components/Packages',
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  name: 'Packages',
  render: () => ({
    components: { PackageCard },
    setup: () => ({ packages }),
    template: pad(`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px;"><PackageCard v-for="p in packages" :key="p.id" :pkg="p" @select="() => {}" @title="() => {}" /></div>`),
  }),
}
