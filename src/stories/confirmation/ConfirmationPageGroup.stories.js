// CONFIRMATION / Confirmation Page / Group Block — the post-checkout success
// screen for the group-block flow: one card per hotel with rooms held by night.
import ConfirmationPage from '../../components/confirmation/ConfirmationPage.vue'
import { holdData } from './ConfirmationPage.stories.js'

export default {
  title: 'Confirmation/Confirmation Page/Group Block',
  component: ConfirmationPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Confirmation Page — Group Block
The post-checkout success screen for the group-block flow: the group block name +
teams, then one card per hotel with rooms held by night. Accents use the DS
primary (Navy).
` } },
  },
}

/** Group / team room block hold. */
export const GroupBlock = {
  name: 'Group Block',
  render: () => ({
    components: { ConfirmationPage },
    setup: () => ({ data: holdData }),
    template: `<confirmation-page mode="hold" :data="data" />`,
  }),
}
