// Aug 4 Changes / Option A / Package Details / Tier Picker
import { ref } from 'vue'
import TierPicker from '../src/components/package/TierPicker.vue'
import { TIERS, canvas } from './_fixtures.js'

const meta = {
  title: 'Aug 4 Changes/Option A/Package Details/Tier Picker',
  component: TierPicker,
  decorators: [canvas('620px')],
  parameters: {
    docs: {
      description: {
        component:
          'Choosing the ticket tier is what drives the ticket portion of the package ' +
          'price, so each row shows both the per-ticket rate and what it becomes for the ' +
          'current party size. Tiers and their descriptions come from the library ' +
          '(`deriveTiers`); the perk lines are prototype copy.',
      },
    },
  },
  argTypes: {
    guests: { control: { type: 'range', min: 1, max: 12, step: 1 } },
    modelValue: { control: 'inline-radio', options: TIERS.map((t) => t.id), name: 'selected tier' },
  },
}
export default meta

const render = (args) => ({
  components: { TierPicker },
  setup() {
    const sel = ref(args.modelValue)
    return { sel, guests: args.guests }
  },
  template: '<tier-picker v-model="sel" :guests="guests" />',
})

export const Playground = { render, args: { modelValue: 'club', guests: 2 } }

/** Two guests — the default party. */
export const TwoGuests = { render, args: { modelValue: 'club', guests: 2 } }

/** Eight guests: per-ticket rates hold, party totals scale. */
export const LargeParty = { render, args: { modelValue: 'lower', guests: 8 } }
