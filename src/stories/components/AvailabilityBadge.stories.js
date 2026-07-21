// COMPONENTS / Feedback & Status / Availability Badge — ticket inventory status.
import AvailabilityBadge from '../../components/AvailabilityBadge.vue'

export default {
  title: 'Components/Feedback & Status/Availability Badge',
  component: AvailabilityBadge,
  parameters: { layout: 'centered' },
}

export const Statuses = {
  render: () => ({
    components: { AvailabilityBadge },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start;">
        <AvailabilityBadge status="available" :show-count="false" />
        <AvailabilityBadge status="limited" :show-count="false" />
        <AvailabilityBadge status="selling-fast" />
        <AvailabilityBadge status="sold-out" />
      </div>
    `,
  }),
}

// Derived from a count + threshold.
export const FromCount = {
  render: () => ({
    components: { AvailabilityBadge },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start;">
        <AvailabilityBadge :count="120" />
        <AvailabilityBadge :count="6" />
        <AvailabilityBadge :count="0" />
      </div>
    `,
  }),
}
