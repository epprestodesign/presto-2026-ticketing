// Aug 4 Changes / Option A / Package Details / Hotel & Room Selection
import { ref } from 'vue'
import HotelRoomPicker from '../src/components/package/HotelRoomPicker.vue'
import { hotels, ROOM_EXTRAS, canvas } from './_fixtures.js'

const meta = {
  title: 'Aug 4 Changes/Option A/Package Details/Hotel & Room Selection',
  component: HotelRoomPicker,
  decorators: [canvas('760px')],
  parameters: {
    docs: {
      description: {
        component:
          "The hotels a package covers, each expanding to its room types, then the chosen " +
          "room's amenities and paid extras. Presentational: ids come in, intent goes out — " +
          '`open-hotel` is emitted rather than navigated, so the host decides that the ' +
          'read-only Hotel Details page opens in a new tab.',
      },
    },
  },
  argTypes: {
    guests: { control: { type: 'range', min: 1, max: 12, step: 1 } },
    openHotelId: { control: 'select', options: hotels.map((h) => h.id), name: 'expanded hotel' },
  },
}
export default meta

const render = (args) => ({
  components: { HotelRoomPicker },
  setup() {
    const openHotelId = ref(args.openHotelId ?? hotels[0].id)
    const roomTypeId = ref(args.roomTypeId ?? null)
    const extraId = ref(args.extraId ?? 'none')
    return {
      hotels, openHotelId, roomTypeId, extraId, guests: args.guests ?? 2,
      onToggle: (h) => { openHotelId.value = openHotelId.value === h.id ? null : h.id },
      onRoom: (r) => { roomTypeId.value = r.typeId },
      onExtra: (id) => { extraId.value = id },
      onHotel: (name) => console.log('open hotel details in a new tab:', name),
    }
  },
  template: `
    <hotel-room-picker
      :hotels="hotels" :nights="1" :guests="guests"
      :open-hotel-id="openHotelId" :room-type-id="roomTypeId" :extra-id="extraId"
      @toggle-hotel="onToggle" @choose-room="onRoom" @set-extra="onExtra" @open-hotel="onHotel"
    />`,
})

export const Playground = { render, args: { openHotelId: hotels[0].id, guests: 2 } }

/** The package's own hotel expanded — its rooms are "Included". */
export const PackageHotelOpen = { render, args: { openHotelId: hotels[0].id } }

/** A cheaper hotel expanded: its rooms carry the saving. */
export const AlternateHotel = { render, args: { openHotelId: hotels[1].id } }

/** A room chosen, with amenities and the extras block revealed. */
export const RoomChosen = { render, args: { openHotelId: hotels[0].id, roomTypeId: 'junior-suite', extraId: ROOM_EXTRAS[1].id } }

/** A party larger than the room sleeps triggers the nudge. */
export const PartyTooLarge = { render, args: { openHotelId: hotels[0].id, roomTypeId: 'king', guests: 6 } }
