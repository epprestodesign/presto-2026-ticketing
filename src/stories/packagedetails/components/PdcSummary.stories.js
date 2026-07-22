// PACKAGE DETAILS / Components / Summary — the event summary header building block.
import PackageSummary from '../../../components/PackageSummary.vue'
import { event, pad } from '../_pd-components-data.js'

export default {
  title: 'Package Details/Components/Summary',
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  name: 'Summary',
  render: () => ({ components: { PackageSummary }, setup: () => ({ event }), template: pad(`<PackageSummary :event="event" />`, 760) }),
}
