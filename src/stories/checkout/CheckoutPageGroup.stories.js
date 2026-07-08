// CHECKOUT EXPERIENCE / Checkout Page / Group Block — the group/team hold
// checkout (includes the group-details step).
import { ref, computed } from 'vue'
import { loadImagery } from '../../lib/imagery'
import CheckoutPage from '../../components/checkout/CheckoutPage.vue'
import PageFrame from '../../components/PageFrame.vue'

const useHero = (category, seed) => {
  const img = ref('')
  loadImagery().then((lib) => { const arr = lib[category] || lib.rooms || []; if (arr[seed]) img.value = arr[seed].url })
  return img
}

export default {
  title: 'Checkout Experience/Group Block',
  component: CheckoutPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: `
The **Checkout Page** (Group Block) is the Airbnb-style "Confirm and pay" flow
with the group-details step: a left stepped accordion beside a sticky **Order
Summary**. \`mode="group"\` shows the teams/block step.
` } } },
}

/** Group / team hold checkout — includes the group-details step. Rendered as a
 *  full page inside the app shell (Global Nav + footer). */
export const Page = {
  name: 'Group Block',
  render: () => ({
    components: { CheckoutPage, PageFrame },
    setup() {
      const img = useHero('suites', 1)
      const cart = {
        heldSeconds: 372, taxRate: 0.12, feePerNight: 30,
        hotels: [
          { name: 'Embassy Suites Chicago Downtown', imageCategories: ['suites', 'rooms'], seed: 0, rooms: [
            { type: 'Two-Room Suite King', summary: '1 King Bed · Sleeps 4', price: 269, nights: [{ date: 'Tue, Jun 23', qty: 4, roomsLeft: 6 }, { date: 'Wed, Jun 24', qty: 1, roomsLeft: 5 }] },
            { type: 'Two-Room Suite Double', summary: '2 Queen Beds · Sleeps 4', price: 289, nights: [{ date: 'Tue, Jun 23', qty: 1, roomsLeft: 5 }, { date: 'Wed, Jun 24', qty: 1, roomsLeft: 4 }] },
          ] },
          { name: 'The Concord Hotel', imageCategories: ['lobby', 'rooms'], seed: 2, rooms: [
            { type: 'King Studio', summary: '1 King Bed · Sleeps 2', price: 165, nights: [{ date: 'Tue, Jun 23', qty: 1, roomsLeft: 6 }] },
          ] },
        ],
      }
      const summary = computed(() => ({
        image: img.value,
        title: 'Group hold',
        subtitle: 'Embassy Suites + The Concord',
        rrow1: '8 rooms · 2 hotels',
        rows: [
          { label: 'Dates', value: 'Jun 23 – 25, 2026', change: true },
          { label: 'Rooms', value: '8 rooms · 2 hotels', change: true },
        ],
        priceLines: [
          { label: 'Room charges', value: 2088 },
          { label: 'Taxes', value: 250.56 },
          { label: 'Property fees', value: 240 },
        ],
        total: 2578.56,
        note: 'Rooms held — finish before the timer ends',
      }))
      return { cart, summary }
    },
    template: `<page-frame cart-mode="hold"><checkout-page mode="group" :cart="cart" :summary="summary" /></page-frame>`,
  }),
}
