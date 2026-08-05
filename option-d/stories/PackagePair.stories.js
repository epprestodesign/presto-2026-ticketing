// Aug 5 Changes / Option D / Package Pair
import { computed, ref, watchEffect } from 'vue'
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
          '### The Aug 5 afternoon revision\n\n' +
          '**Party size lives on the card**, above the price it drives, rather than once in the ' +
          'page header. It is still *one* number: both controls bind to the same store value, so ' +
          'setting it on either card re-prices both. Try it below — the two cards move together. ' +
          'Each card also states what that number bought *there* (`4 tickets · 2 rooms`), because ' +
          'occupancy differs between the hotels and the same party is a different room count on ' +
          'each.\n\n' +
          '**The card can check out.** `Select & Check Out` goes straight to Review; ' +
          '`View package details` is the optional drill-in beside it. The detail page is unchanged ' +
          'and still selects from its own CTA — it is now a longer route through the same decision ' +
          'rather than a toll gate in front of it.',
      },
    },
  },
  argTypes: {
    people: { control: { type: 'range', min: 1, max: 12, step: 1 } },
  },
}
export default meta

// The party size is LIVE in the story, and shared between the two cards — that
// shared-ness is the thing the revision has to demonstrate, and it can't be shown
// with a static prop. `people` here stands in for the store value the app binds.
const render = (args) => ({
  components: { PackageCard },
  setup () {
    const people = ref(args.people ?? 2)
    // Keep the story in step with the Controls panel without breaking the live
    // control: the args write in, the cards write back to the local ref.
    watchEffect(() => { people.value = args.people ?? 2 })
    return {
      people,
      pkgs: computed(() => packages(people.value)),
      setPeople: (n) => { people.value = n },
      onSelect: (p) => console.log('select & check out →', p.id, `${p.guests} guests`, `$${p.packagePrice}`),
      onView: (p) => console.log('view package details →', p.id, `${p.guests} guests`, `$${p.packagePrice}`),
      onHotel: (id) => console.log('open hotel details in a new tab:', id),
    }
  },
  template: `
    <div style="max-width:1180px;margin:0 auto;padding:24px;font-family:var(--ds-font-family)">
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;align-items:stretch">
        <package-card
          v-for="p in pkgs" :key="p.id" :pkg="p"
          :people="people"
          @update:people="setPeople"
          @select="onSelect" @view="onView" @open-hotel="onHotel"
        />
      </div>
    </div>
  `,
})

/**
 * The pair as the landing page renders it — a party of two. The party-size select
 * on each card is **live**: change it on one and watch the other re-price with it.
 */
export const TwoHotels = { render, args: { people: 2 } }

/**
 * A party of four — the case that makes the on-card control worth having. The
 * Ritz's Carlton Suite sleeps 4, so one room covers it; the Westin's Deluxe King
 * sleeps 2, so it takes two. The same number therefore means something different
 * on each card, and each card says which: `4 tickets · 1 room` beside
 * `4 tickets · 2 rooms`, right under the control that set it.
 */
export const PartyOfFour = { render, args: { people: 4 } }

/** A single traveller — one room either way, and the price gap is just the rate. */
export const SingleTraveller = { render, args: { people: 1 } }

/** A large group. Both hotels need several rooms; the per-person line carries the comparison. */
export const LargeGroup = { render, args: { people: 10 } }
