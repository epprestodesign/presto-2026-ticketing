// PACKAGE DETAILS / Components / Quick View · Showcase — the AvailabilityDialog-
// style quick view with a signature-experiences carousel.
import PackageQuickViewShowcase from '../../../components/PackageQuickViewShowcase.vue'
import { packages } from '../_pd-components-data.js'

export default {
  title: 'Package Details/Components/Quick View · Showcase',
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  name: 'Quick View · Showcase',
  render: () => ({
    components: { PackageQuickViewShowcase },
    setup: () => ({ pkg: packages[0] }),
    template: `<div style="display:flex;justify-content:center;padding:32px;background:var(--ds-color-surface-sunken);min-height:100vh;"><PackageQuickViewShowcase :pkg="pkg" @close="() => {}" @select="() => {}" @customize="() => {}" /></div>`,
  }),
}
