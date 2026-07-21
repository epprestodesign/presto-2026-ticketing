// COMPONENTS / Feedback & Status / Deal Score — SeatGeek-style value indicator.
import DealScoreBadge from '../../components/DealScoreBadge.vue'

export default {
  title: 'Components/Feedback & Status/Deal Score',
  component: DealScoreBadge,
  parameters: { layout: 'centered' },
}

export const Scores = {
  render: () => ({
    components: { DealScoreBadge },
    setup: () => ({ scores: [10, 8, 6, 4, 2] }),
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start;">
        <DealScoreBadge v-for="s in scores" :key="s" :score="s" />
      </div>
    `,
  }),
}

export const Flags = {
  render: () => ({
    components: { DealScoreBadge },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start;">
        <DealScoreBadge flag="best-deal" />
        <DealScoreBadge flag="best-in-section" />
        <DealScoreBadge flag="cheapest-in-section" />
      </div>
    `,
  }),
}
