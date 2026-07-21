// CHECKOUT EXPERIENCE / Steps / Contact Info / Group Block / Teams Block —
// every edge case / instance of the group teams-block widget broken out.
import { ref } from 'vue'
import GroupTeamsBlock from '../../components/checkout/GroupTeamsBlock.vue'

export default {
  title: 'Checkout Experience/Components/Group Block/Contact Info/Teams Block',
  component: GroupTeamsBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Teams Block — states
The group-block **Contact & Group Information** widget: primary contact + a
two-step groups flow (how many groups → select & add groups / add unlisted), plus
the "not holding for a group" path and validation. Each edge case is broken out
below.
` } } },
}

// Render the widget with a given set of initial-state props.
const state = (attrs) => () => ({
  components: { GroupTeamsBlock },
  setup: () => ({ m: ref({}), attrs }),
  template: `<div style="max-width:640px;margin:0 auto;padding:32px"><group-teams-block v-model="m" v-bind="attrs" /></div>`,
})

const SAMPLE_TEAMS = ['Summit Financial — Executive Group A', 'Harbor Capital — VIP Hospitality']

/** Step 1 of 2 — how many groups might share the block (stepper + "not holding"). */
export const Step1HowManyTeams = { name: 'Step 1 · How Many Teams', render: state({ initialView: 'count', initialExpected: 1 }) }

/** Step 2 of 2 — select & add groups (search + list), nothing added yet. */
export const Step2SelectTeams = { name: 'Step 2 · Select & Add Teams', render: state({ initialView: 'list', initialExpected: 3 }) }

/** Step 2 with groups already added — chips + status + Group Block Name field. */
export const TeamsAdded = { name: 'Step 2 · Teams Added', render: state({ initialView: 'list', initialExpected: 3, initialTeams: SAMPLE_TEAMS }) }

/** Multiple groups expected (checkbox multi-select with a remaining-count limit). */
export const MultipleTeams = { name: 'Multiple Teams (limit)', render: state({ initialView: 'list', initialExpected: 4, initialTeams: ['Summit Financial — Executive Group A'] }) }

/** Add an unlisted group — Company/Group name + Group type + Party size. */
export const AddUnlistedTeam = { name: 'Add Unlisted Team', render: state({ initialView: 'add', initialExpected: 2 }) }

/** "I am not holding for a team" after-state. */
export const NotHoldingForTeam = { name: 'Not Holding For A Team', render: state({ initialNotHolding: true }) }

/** Validation — required contact fields + "add at least one team" surfaced. */
export const ValidationErrors = { name: 'Validation Errors', render: state({ initialView: 'list', initialExpected: 2, showErrors: true }) }
