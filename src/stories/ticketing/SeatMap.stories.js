// TICKETING & BUNDLES / Seat Map & View / Seat Map — the interactive bowl.
import { ref } from 'vue'
import SeatMap from '../../components/SeatMap.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const stadiumEvent = fixtureEvents.find((e) => /stadium|field/i.test(e.venue?.name || '')) || fixtureEvents[1] || fixtureEvents[0]
const arenaEvent = fixtureEvents.find((e) => /sphere|arena|garden/i.test(e.venue?.name || '')) || fixtureEvents[0]

export default {
  title: 'Ticketing & Bundles/Components/Seat Map & View/Seat Map',
  component: SeatMap,
  parameters: { layout: 'fullscreen' },
  args: { kind: 'stadium', centerLabel: 'FIELD' },
  argTypes: {
    kind: { control: 'select', options: ['stadium', 'arena'] },
    centerLabel: { control: 'text' },
  },
}

export const Interactive = {
  render: (args) => ({
    components: { SeatMap },
    setup() {
      const event = args.kind === 'arena' ? arenaEvent : stadiumEvent
      const selectedId = ref(null)
      return { args, event, selectedId }
    },
    template: `<div style="max-width:640px;margin:0 auto;padding:28px;"><SeatMap :event="event" :kind="args.kind" :center-label="args.centerLabel" v-model="selectedId" /></div>`,
  }),
}
