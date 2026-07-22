// PACKAGE DETAILS / Components / Experiences — the signature experiences grid.
import PackageExperiences from '../../../components/PackageExperiences.vue'
import { experiences, pad } from '../_pd-components-data.js'

export default {
  title: 'Package Details/Components/Experiences',
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  name: 'Experiences',
  render: () => ({ components: { PackageExperiences }, setup: () => ({ experiences }), template: pad(`<PackageExperiences :experiences="experiences" />`) }),
}
