// Aug 4 Changes / Option C / Event Header Bar
import EventHeaderBar from '../src/components/EventHeaderBar.vue'

const meta = {
  title: 'Aug 4 Changes/Option C/Event Header Bar',
  component: EventHeaderBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The compact event strip, carried over from Option B.\n\n' +
          '**Not currently mounted by the board** — *Event Hero* is. It is kept and documented ' +
          'because the two are the ends of a real trade-off the Aug 4 feedback puts in tension:\n\n' +
          '| | Event Hero | Event Header Bar |\n' +
          '| --- | --- | --- |\n' +
          '| Height | 300px | ~90px |\n' +
          '| Carries | artwork, wordmark, matchup, date | matchup, date, venue, stay dates |\n' +
          '| First tile row | just below the fold on a laptop | comfortably above it |\n\n' +
          'The feedback asks for *"packages just below the header, visible without scrolling"*, ' +
          'which argues for this strip; the branded hero was asked for separately. Swapping them ' +
          'is a one-line change in `PackageGridScreen.vue`.',
      },
    },
  },
}
export default meta

/** As the grid screen renders it — the free-ticket promise as the context line. */
export const Default = {
  args: { note: "Every package includes your ticket free — you're paying for the room." },
}

/** Without a note: event, date and venue only. */
export const NoNote = { args: { note: '' } }
