// CHECKOUT EXPERIENCE / Steps / Payment / Group Block — step 3.
import { ref } from 'vue'
import StepPayment from '../../components/checkout/steps/StepPayment.vue'
import { methods } from './_fixtures'

export default {
  title: 'Checkout Experience/Components/Steps/Payment/Group Block',
  component: StepPayment,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Step 3 — the Instacart-style PayWith selector (payment is identical across both flows).' } } },
}

const wrap = (inner, data) => ({ components: { StepPayment }, setup: () => data, template: `<div style="max-width:640px;margin:0 auto;padding:32px">${inner}</div>` })

export const GroupBlock = { name: 'Group Block', render: () => wrap(`<step-payment v-model="sel" :methods="methods" />`, { sel: ref('amex'), methods }) }
