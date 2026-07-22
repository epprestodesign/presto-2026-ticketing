// PACKAGE DETAILS / Components / Quick View — the condensed quick-view dialog.
import PackageQuickViewDialog from '../../../components/PackageQuickViewDialog.vue'
import { packages } from '../_pd-components-data.js'

export default {
  title: 'Package Details/Components/Quick View',
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  name: 'Quick View',
  render: () => ({
    components: { PackageQuickViewDialog },
    setup: () => ({ pkg: packages[0] }),
    template: `<div style="display:flex;justify-content:center;padding:32px;background:var(--ds-color-surface-sunken);min-height:100vh;"><PackageQuickViewDialog :pkg="pkg" @close="() => {}" @select="() => {}" @customize="() => {}" /></div>`,
  }),
}
