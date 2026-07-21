// COMPONENTS / Navigation / Journey Stepper — reusable progress bar for any
// multi-step journey (hotel booking, ticketing+hotel bundle).
import { ref } from 'vue'
import JourneyStepper from '../../components/JourneyStepper.vue'

const BUNDLE_STEPS = ['Tickets', 'Seats', 'Hotel', 'Cart', 'Checkout', 'Confirmation']

export default {
  title: 'Components/Navigation/Journey Stepper',
  component: JourneyStepper,
  parameters: { layout: 'padded' },
  argTypes: {
    current: { control: { type: 'number', min: 0, max: 5 } },
    compact: { control: 'boolean' },
    clickable: { control: 'boolean' },
  },
}

export const Default = {
  args: { steps: BUNDLE_STEPS, current: 2, compact: false, clickable: false },
  render: (args) => ({
    components: { JourneyStepper },
    setup: () => ({ args }),
    template: `<div style="max-width:720px;"><JourneyStepper v-bind="args" /></div>`,
  }),
}

export const Compact = {
  args: { steps: BUNDLE_STEPS, current: 2, compact: true },
  render: (args) => ({
    components: { JourneyStepper },
    setup: () => ({ args }),
    template: `<div style="max-width:360px;"><JourneyStepper v-bind="args" /></div>`,
  }),
}

// Interactive: advance / go back, click completed steps to jump.
export const Interactive = {
  render: () => ({
    components: { JourneyStepper },
    setup() {
      const current = ref(1)
      const steps = BUNDLE_STEPS
      const next = () => (current.value = Math.min(steps.length - 1, current.value + 1))
      const back = () => (current.value = Math.max(0, current.value - 1))
      return { current, steps, next, back }
    },
    template: `
      <div style="max-width:720px;display:flex;flex-direction:column;gap:20px;">
        <JourneyStepper :steps="steps" :current="current" clickable @navigate="current = $event" />
        <div style="display:flex;gap:8px;">
          <button @click="back" style="padding:8px 16px;">← Back</button>
          <button @click="next" style="padding:8px 16px;">Next →</button>
        </div>
      </div>
    `,
  }),
}
