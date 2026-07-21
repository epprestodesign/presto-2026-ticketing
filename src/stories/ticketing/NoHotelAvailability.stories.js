// TICKETING & BUNDLES / Hotel Add-On / No Availability — empty state when no
// rooms are available for the chosen dates (scope H-08). Clear messaging plus a
// prominent skip to ticket-only checkout and a secondary change-dates option.
import NoHotelAvailability from '../../components/NoHotelAvailability.vue'

export default {
  title: 'Ticketing & Bundles/Hotel Add-On/No Availability',
  component: NoHotelAvailability,
  parameters: { layout: 'centered' },
}

export const Default = {
  render: () => ({
    components: { NoHotelAvailability },
    setup: () => ({ onSkip: () => {}, onChangeDates: () => {} }),
    template: `
      <NoHotelAvailability
        event-name="Patriots vs. Jets"
        date-range="Thu, Aug 13 → Fri, Aug 14"
        @skip="onSkip"
        @change-dates="onChangeDates" />
    `,
  }),
}
