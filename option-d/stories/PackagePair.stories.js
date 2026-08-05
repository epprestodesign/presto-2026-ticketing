// Aug 5 Changes / Option D / Package Pair
import PackageCard from '../src/components/PackageCard.vue'
import { packages } from './_fixtures.js'

const meta = {
  title: 'Aug 5 Changes/Option D/Package Pair',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Screen 1 — **two tiles side by side, one per hotel**. This page is also the ' +
          '**landing page**: there is no headcount screen in front of it and no stepper above ' +
          'it, because a progress bar over a landing page is orientation for progress not yet ' +
          'made. The party size lives in this page\'s header, beside the prices it drives.\n\n' +
          'The Aug 5 feedback cut Option C\'s six-tile board down to the single decision that ' +
          'matters for a pre-invited group: *where do you want to stay?* There is no ticket-tier ' +
          'axis any more, because both packages carry the **same** inclusions — the same tickets, ' +
          'the same transportation, the same hospitality, the same two nights. They are named for ' +
          'the only thing that separates them.\n\n' +
          'The inclusion list is deliberately word-for-word identical on both cards. The ' +
          'repetition is the point: it is what makes *"these are the same package, in two places"* ' +
          'legible at a glance. Anything phrased differently would imply a difference that isn\'t ' +
          'there.\n\n' +
          'A **fixed two-column** track, not the auto-fit grid Option C uses for six. With exactly ' +
          'two cards this is a comparison, and auto-fit would let them drift to different widths ' +
          'as the viewport changes. They collapse to one column only under 900px.\n\n' +
          'The CTA is **View Package**, not "Choose" — the card is a summary, and the booking ' +
          'decision happens on the package template page it opens (*Package Details*).',
      },
    },
  },
  argTypes: {
    people: { control: { type: 'range', min: 1, max: 12, step: 1 } },
  },
}
export default meta

const render = (args) => ({
  components: { PackageCard },
  setup: () => ({
    pkgs: packages(args.people ?? 2),
    onView: (p) => console.log('view package →', p.id, `${p.guests} guests`, `$${p.packagePrice}`),
    onHotel: (id) => console.log('open hotel details in a new tab:', id),
  }),
  template: `
    <div style="max-width:1180px;margin:0 auto;padding:24px;font-family:var(--ds-font-family)">
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;align-items:stretch">
        <package-card v-for="p in pkgs" :key="p.id" :pkg="p" @view="onView" @open-hotel="onHotel" />
      </div>
    </div>
  `,
})

/** The pair as the landing page renders it — a party of two. */
export const TwoHotels = { render, args: { people: 2 } }

/**
 * A party of four. The Ritz's Carlton Suite sleeps 4, so one room covers it; the
 * Westin's Deluxe King sleeps 2, so it takes two. That occupancy difference is a
 * real distinction between the options, and each card states its own room count
 * rather than letting the price move unexplained.
 */
export const PartyOfFour = { render, args: { people: 4 } }

/** A single traveller — one room either way, and the price gap is just the rate. */
export const SingleTraveller = { render, args: { people: 1 } }

/** A large group. Both hotels need several rooms; the per-person line carries the comparison. */
export const LargeGroup = { render, args: { people: 10 } }
