// PACKAGE DETAILS / Components / Quick View · Showcase — the AvailabilityDialog-
// style package browser: a high-level offering summary above a carousel of full
// PackageCards (each with its own guests stepper + Select CTA).
import PackageQuickViewShowcase from '../../../components/PackageQuickViewShowcase.vue'
import { packages, event } from '../_pd-components-data.js'

const eventDate = new Date(event.date || event.dateTime || Date.parse('2026-12-06'))
const meta = `${event.venue?.name || 'Gillette Stadium'} · ${isNaN(+eventDate) ? 'Sat, Dec 6, 2026' : eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`

export default {
  title: 'Package Details/Components/Quick View · Showcase',
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  name: 'Quick View · Showcase',
  render: () => ({
    components: { PackageQuickViewShowcase },
    setup: () => ({ packages, meta }),
    template: `<div style="display:flex;justify-content:center;padding:32px;background:var(--ds-color-surface-sunken);min-height:100vh;"><PackageQuickViewShowcase :packages="packages" title="Patriots v Bills experience packages" theme="Client Appreciation" :meta="meta" @close="() => {}" @select="() => {}" @title="() => {}" /></div>`,
  }),
}
