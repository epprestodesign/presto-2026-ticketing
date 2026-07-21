// TICKETING & BUNDLES / Event & Tickets / Ticket Category Card — a single ticket
// tier row: color swatch, name + description, price, availability badge, and a
// quantity stepper. The SoldOut story shows the greyed, unselectable state.
import { ref } from 'vue'
import TicketCategoryCard from '../../components/TicketCategoryCard.vue'
import { deriveTiers } from '../../lib/seatmap.js'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const sample = deriveTiers(event)[1]

export default {
  title: 'Ticketing & Bundles/Event & Tickets/Ticket Category Card',
  component: TicketCategoryCard,
  parameters: { layout: 'centered' },
}

export const Available = {
  render: () => ({
    components: { TicketCategoryCard },
    setup() {
      const qty = ref(2)
      const category = { ...sample, count: 6 }
      return { category, qty }
    },
    template: `<div style="width:520px;max-width:100%;"><TicketCategoryCard :category="category" v-model="qty" /></div>`,
  }),
}

export const SoldOut = {
  render: () => ({
    components: { TicketCategoryCard },
    setup() {
      const category = { ...sample, count: 0, soldOut: true }
      return { category }
    },
    template: `<div style="width:520px;max-width:100%;"><TicketCategoryCard :category="category" /></div>`,
  }),
}
