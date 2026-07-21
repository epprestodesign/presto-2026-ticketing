// COMPONENTS / Feedback & Status / Savings Badge — bundle discount indicator.
import BundleSavingsBadge from '../../components/BundleSavingsBadge.vue'

export default {
  title: 'Components/Feedback & Status/Savings Badge',
  component: BundleSavingsBadge,
  parameters: { layout: 'centered' },
}

export const Default = {
  render: () => ({
    components: { BundleSavingsBadge },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start;">
        <BundleSavingsBadge :amount="64" />
        <BundleSavingsBadge :amount="120" label="Save" />
        <BundleSavingsBadge :amount="42" size="sm" />
      </div>
    `,
  }),
}
