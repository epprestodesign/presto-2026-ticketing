// Aug 4 Changes / Option C / Event Hero
import EventHero from '../src/components/EventHero.vue'
import BookingWidget from '../src/components/BookingWidget.vue'

const meta = {
  title: 'Aug 4 Changes/Option C/Event Hero',
  component: EventHero,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The branded event hero above the package board — scrim over the event artwork, the ' +
          'EventPipe wordmark, the matchup and the date.\n\n' +
          'Rebuilt here rather than mounting the library\'s `LandingPage`, which also brings a ' +
          'booking widget, an ad rail and a "Who\'s Attending" section — none of which belong ' +
          'above a one-click board. Option A mounts the whole page and overrides the background ' +
          'image to re-skin it; Option C takes only the hero, so no library override is needed.\n\n' +
          '**Height is the trade-off.** The library hero is `min-height: 400px`, which pushes the ' +
          'first row of packages well below the fold — the opposite of what the Aug 4 feedback ' +
          'asks for. This one runs 300px and lets the search card overlap its bottom edge, so the ' +
          'branding is intact and the board still starts near the fold. *Event Header Bar* is the ' +
          'other end of that trade — ~90px, no artwork.',
      },
    },
  },
}
export default meta

/** The hero on its own. */
export const Default = {
  render: () => ({ components: { EventHero }, template: '<event-hero />' }),
}

/**
 * How the board actually renders it — the search card tucked up onto the hero's
 * bottom edge, the library landing-page treatment.
 */
export const WithSearchCard = {
  render: () => ({
    components: { EventHero, BookingWidget },
    template: `
      <div style="display:flex;flex-direction:column">
        <event-hero />
        <div style="width:100%;max-width:min(1240px,92%);margin:-44px auto 0;position:relative;z-index:2">
          <booking-widget :tabs="false" :show-mode="false" :show-teams="false" show-dates />
        </div>
        <div style="height:40px"></div>
      </div>
    `,
  }),
}
