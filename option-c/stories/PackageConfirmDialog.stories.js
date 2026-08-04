// Aug 4 Changes / Option C / Package Confirm Dialog
import { ref } from 'vue'
import PackageConfirmDialog from '../src/components/PackageConfirmDialog.vue'
import { resolveRoom } from '../src/packages.js'
import { premiumTile, valueTile } from './_fixtures.js'

const meta = {
  title: 'Aug 4 Changes/Option C/Package Confirm Dialog',
  component: PackageConfirmDialog,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The step between picking a tile and paying. **One component, two jobs**, decided by ' +
          'the hotel:\n\n' +
          '| Hotel | Room types | What the dialog does |\n' +
          '| --- | --- | --- |\n' +
          '| The Ritz-Carlton (premium) | 5 | Offers the **choice** — each room priced as a ' +
          'per-night difference against the room the package is priced around |\n' +
          '| Courtyard by Marriott (value) | 1 | Pure **confirmation** — here is exactly what ' +
          'you are buying, for these dates, at this price |\n\n' +
          'Either way this is a *confirmation* step, not a *configuration* one. The ticket tier, ' +
          'the hotel and the free-ticket model stay baked into the tile — the guest is never ' +
          'asked to assemble a package, only to see it before paying. That keeps the Aug 4 "no ' +
          'complex options" line intact while giving the premium block the room choice it needs.\n\n' +
          'Choosing a smaller room can change the room *count*: a Deluxe King sleeps 2, so a ' +
          'party of four in one takes two rooms, and the total follows.',
      },
    },
  },
}
export default meta

const render = (args) => ({
  components: { PackageConfirmDialog },
  setup() {
    const roomId = ref(args.roomId ?? null)
    return {
      pkg: args.pkg,
      guests: args.guests ?? 2,
      nights: args.nights ?? 1,
      range: args.range ?? { from: '2026/09/19', to: '2026/09/20' },
      room: ref(resolveRoom(args.pkg.hotel.id, args.roomId)),
      roomId,
      onSetRoom(id) { roomId.value = id; this.room = resolveRoom(args.pkg.hotel.id, id) },
      onClose: () => console.log('close'),
      onConfirm: () => console.log('confirm → checkout'),
      onHotel: (id) => console.log('open hotel details in a new tab:', id),
    }
  },
  computed: {
    resolved() { return resolveRoom(this.pkg.hotel.id, this.roomId) },
  },
  template: `
    <package-confirm-dialog
      :pkg="pkg" :room="resolved" :guests="guests" :nights="nights" :range="range"
      @close="onClose" @set-room="onSetRoom" @confirm="onConfirm" @open-hotel="onHotel"
    />
  `,
})

/** **Premium stay** — five contracted room types, so the dialog offers the choice. */
export const ChooseYourRoom = { render, args: { pkg: premiumTile, guests: 2, nights: 1 } }

/**
 * **Value stay** — one contracted room type, so there is nothing to choose. The
 * dialog confirms the final details of the package and nothing else.
 */
export const ConfirmOnly = { render, args: { pkg: valueTile, guests: 2, nights: 1 } }

/**
 * An upgrade picked at the premium hotel — the Executive Suite carries a
 * per-night difference, and the total re-prices live.
 */
export const UpgradedRoom = {
  render,
  args: { pkg: premiumTile, guests: 2, nights: 1, roomId: 'executive-suite' },
}

/**
 * A smaller room changes the room COUNT: the Deluxe King sleeps 2, so a party of
 * four in one takes two rooms, and the total follows.
 */
export const SmallerRoomNeedsTwo = {
  render,
  args: { pkg: premiumTile, guests: 4, nights: 1, roomId: 'deluxe-king' },
}

/** A three-night stay — nights multiply the room, never the free tickets. */
export const ThreeNights = {
  render,
  args: { pkg: premiumTile, guests: 2, nights: 3, range: { from: '2026/09/18', to: '2026/09/21' } },
}
