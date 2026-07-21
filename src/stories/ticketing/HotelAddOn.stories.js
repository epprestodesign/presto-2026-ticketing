// TICKETING & BUNDLES / Hotel Add-On / Add-On Step — the native hotel step after
// ticket selection (scope 3.3). Curated contracted-block properties + an
// always-present skip. Hotels are prototype data; distances are relative to the
// event venue.
import { ref } from 'vue'
import HotelAddOnStep from '../../components/HotelAddOnStep.vue'
import { CONTRACTED_HOTELS } from '../../lib/bundles.js'
import { fixtureEvents } from '../../lib/ticketmaster.js'

const event = fixtureEvents.find((e) => /stadium|field/i.test(e.venue?.name || '')) || fixtureEvents[1] || fixtureEvents[0]

export default {
  title: 'Ticket Map/Components/Hotel Add-On/Add-On Step',
  component: HotelAddOnStep,
  parameters: { layout: 'fullscreen' },
}

export const ContractedMode = {
  name: 'Add-On Step',
  render: () => ({
    components: { HotelAddOnStep },
    setup() {
      const selectedHotelId = ref(null)
      return {
        event, hotels: CONTRACTED_HOTELS, selectedHotelId,
        onSelect: (h) => (selectedHotelId.value = h?.id ?? null),
      }
    },
    template: `
      <div style="max-width:720px;margin:0 auto;padding:28px;">
        <HotelAddOnStep :hotels="hotels" :event-name="event.name"
          check-in="2026-08-13" check-out="2026-08-14" :nights="1"
          source-mode="contracted" :selected-hotel-id="selectedHotelId"
          @select="onSelect" @skip="() => {}" />
      </div>
    `,
  }),
}

export const LiveMode = {
  name: 'Live (Expedia) mode',
  render: () => ({
    components: { HotelAddOnStep },
    setup: () => ({ event, hotels: CONTRACTED_HOTELS }),
    template: `
      <div style="max-width:720px;margin:0 auto;padding:28px;">
        <HotelAddOnStep :hotels="hotels" :event-name="event.name"
          check-in="2026-08-13" check-out="2026-08-14" :nights="1"
          source-mode="live" @skip="() => {}" />
      </div>
    `,
  }),
}
