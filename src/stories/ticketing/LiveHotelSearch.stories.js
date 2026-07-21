// TICKETING & BUNDLES / Hotel Add-On / Live Search — Expedia "live mode" hotel
// discovery (scope H-05): searchable, filterable list with live pricing, reusing
// ContractedHotelCard for each result. Hotels are prototype data.
import LiveHotelSearch from '../../components/LiveHotelSearch.vue'

export default {
  title: 'Ticketing & Bundles/Hotel Add-On/Live Search',
  component: LiveHotelSearch,
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  render: () => ({
    components: { LiveHotelSearch },
    setup: () => ({ onSelect: () => {} }),
    template: `
      <div style="max-width:720px;margin:0 auto;padding:28px;">
        <LiveHotelSearch :nights="1" @select="onSelect" />
      </div>
    `,
  }),
}
