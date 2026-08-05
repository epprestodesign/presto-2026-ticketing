// Aug 5 Changes / Option D / Room Package Card
import { computed, ref, watchEffect } from 'vue'
import RoomPackageCard from '../src/components/RoomPackageCard.vue'
import PackagePriceDialog from '../src/components/PackagePriceDialog.vue'
import { packages } from './_fixtures.js'
import { roomsFor } from '../src/packages.js'

const meta = {
  title: 'Aug 5 Changes/Option D/Room Package Card',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The card under **Room types at this property** on the hotel details page — the ' +
          'Aug 5 afternoon feedback, which asked for that section to select the package rather ' +
          'than dead-end in a `Price Details` link.\n\n' +
          '### Why this is not the library room card\n\n' +
          "The template's own `RoomCardReserve` is room-shaped all the way through: it prints " +
          '`$X USD / room / night`, `$Y USD total`, `N rooms · incl. taxes & fees`, and a ' +
          '`Reserve Room` CTA. Option D does not sell rooms — it sells one package per hotel. ' +
          'Pushing package numbers through those labels would produce sentences that are simply ' +
          'untrue (`$773 USD / room / night` for a per-person figure), and that card has no ' +
          'party-size control and no way to relabel its CTA without editing the library, which ' +
          'no prototype in this repo does.\n\n' +
          'So the card is Option D\'s, and its footer mirrors `PackageCard`\'s exactly — the same ' +
          'party-size select bound to the same store value, the same price block, a primary CTA, ' +
          'a secondary link. The **section** around it is still the library\'s: `RoomsCarousel` ' +
          'renders the heading, and this card is teleported into `#hdp-rooms` so the Rooms tab ' +
          'still scrolls to it.\n\n' +
          'The headline is the **package total, all in** — what checkout charges — with the room ' +
          'rate kept as a sub-line so the stay portion is still legible.',
      },
    },
  },
  argTypes: {
    people: { control: { type: 'range', min: 1, max: 12, step: 1 } },
    hotel: { control: { type: 'inline-radio' }, options: ['westin', 'ritz'] },
  },
}
export default meta

const render = (args) => ({
  components: { RoomPackageCard, PackagePriceDialog },
  setup () {
    const people = ref(args.people ?? 2)
    watchEffect(() => { people.value = args.people ?? 2 })
    const pkg = computed(
      () => packages(people.value).find((p) => p.hotel.id === (args.hotel || 'westin'))
    )
    const room = computed(() => roomsFor(args.hotel || 'westin')[0])
    const priceOpen = ref(args.priceOpen ?? false)
    return {
      people, pkg, room, priceOpen,
      setPeople: (n) => { people.value = n },
      onSelect: (p) => console.log('select package →', p.id, `${p.guests} guests`, `$${p.packagePrice}`),
    }
  },
  template: `
    <div style="padding:24px;font-family:var(--ds-font-family)">
      <room-package-card
        :room="room" :pkg="pkg" :people="people"
        @update:people="setPeople"
        @select="onSelect"
        @price-details="priceOpen = true"
      />
      <package-price-dialog v-model="priceOpen" :pkg="pkg" @select="onSelect" />
    </div>
  `,
})

/** The Westin's Deluxe King — sleeps 2, so a party of four takes two rooms. */
export const Westin = { render, args: { hotel: 'westin', people: 4 } }

/** The Ritz's Carlton Suite — sleeps 4, so the same party takes one. */
export const RitzCarlton = { render, args: { hotel: 'ritz', people: 4 } }

/**
 * **Price details**, opened. The library's own `PriceDetailsDialog` breaks down a
 * *room* — per-night lines, hotel fee, taxes — and would have totalled a different
 * number than the button above it. This one itemises the **package**: the four
 * inclusions, then the bundle discount that separates what the parts cost from
 * what you pay. Same `DsModal` shell as every other dialog in the system.
 */
export const PriceDetailsOpen = {
  render,
  args: { hotel: 'westin', people: 4, priceOpen: true },
  parameters: { layout: 'fullscreen' },
}

/** A large party — eight people is four rooms at the Westin, two at the Ritz. */
export const LargeParty = { render, args: { hotel: 'westin', people: 8 } }
