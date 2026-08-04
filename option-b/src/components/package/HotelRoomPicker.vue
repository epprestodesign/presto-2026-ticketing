<script setup>
// HotelRoomPicker — the hotels a package covers, each expanding to its room types,
// plus the amenities and paid extras for whichever room is chosen (Aug 4).
//
// Presentational: ids come in, intent goes out. Hotel and brand names emit
// `open-hotel` rather than navigating themselves, so the host decides that the
// read-only Hotel Details page opens in a new tab.
import { computed } from 'vue'
import { roomsFor, resolveRoomType, ROOM_EXTRAS } from '../../rooms.js'

const props = defineProps({
  hotels: { type: Array, default: () => [] },      // hotelOptionsFor(pkg)
  nights: { type: Number, default: 1 },
  guests: { type: Number, default: 2 },
  openHotelId: { type: String, default: null },    // which hotel is expanded
  roomTypeId: { type: String, default: null },     // chosen room type
  extraId: { type: String, default: 'none' },
  // The host owns this copy: v1 offers a choice of hotels, v2 arrives with one
  // already chosen in step 2 and only needs the room.
  title: { type: String, default: 'Choose your hotel & room' },
  subtitle: { type: String, default: '' },
})
const emit = defineEmits(['toggle-hotel', 'choose-room', 'open-hotel', 'set-extra'])

// Which hotel is actually CHOSEN (not merely expanded) — drives the radio.
const chosenHotelId = computed(() => activeHotel.value?.id || null)

const activeHotel = computed(
  () => props.hotels.find((h) => h.id === props.openHotelId) ||
        props.hotels.find((h) => h.included) || props.hotels[0] || null
)
const rooms = computed(() => (activeHotel.value ? roomsFor(activeHotel.value, props.nights) : []))
const room = computed(() => resolveRoomType(rooms.value, props.roomTypeId))
const extra = computed(() => ROOM_EXTRAS.find((e) => e.id === props.extraId) || ROOM_EXTRAS[0])
const openHotelId = computed(() => props.openHotelId || activeHotel.value?.id || null)
const tooManyGuests = computed(() => !!room.value && props.guests > room.value.sleeps)
const setExtra = (id) => emit('set-extra', id)

// This section only exists when the package covers hotels. (Previously this read
// `hasStay`, which lived in the modal — undefined here, so the whole section
// silently rendered as nothing.)
const hasHotels = computed(() => props.hotels.length > 0)
</script>

<template>
<section v-if="hasHotels" class="pqv__rooms">
  <h3 class="pqv__h3">{{ title }}</h3>
  <p class="pqv__sub">
    <template v-if="subtitle">{{ subtitle }}</template>
    <template v-else>
      This package works at <strong>any of these {{ hotels.length }} hotels</strong> —
      pick the one you want, then its room. Prices are the difference against the
      hotel the package is priced around.
    </template>
    <slot name="sub-action" />
  </p>

  <div v-for="h in hotels" :key="h.id" class="hotel" :class="{ 'hotel--open': openHotelId === h.id, 'hotel--chosen': chosenHotelId === h.id }">
    <button type="button" class="hotel__head" :aria-pressed="chosenHotelId === h.id" @click="emit('toggle-hotel', h)">
      <span class="hotel__radio" :class="{ 'hotel__radio--on': chosenHotelId === h.id }" aria-hidden="true">
        <q-icon v-if="chosenHotelId === h.id" name="check" size="15px" />
      </span>
      <img v-if="h.photos.length" :src="h.photos[0].src" :alt="h.photos[0].alt" class="hotel__thumb" />
      <span class="hotel__meta">
        <span class="hotel__name">
          <!-- Hotel + brand names open the read-only details page in a new tab. -->
          <span class="hotel__link" role="link" tabindex="0"
            @click.stop="emit('open-hotel', h.name)" @keydown.enter.stop="emit('open-hotel', h.name)">
            {{ h.name }} <q-icon name="open_in_new" size="14px" />
          </span>
          <span class="hotel__brand" role="link" tabindex="0"
            @click.stop="emit('open-hotel', h.name)" @keydown.enter.stop="emit('open-hotel', h.name)">{{ h.brand }}</span>
        </span>
        <span class="hotel__facts">
          <q-icon name="star" size="14px" /> {{ h.rating }} ·
          {{ h.distanceMi }} mi · {{ h.walkMin }} min walk
        </span>
      </span>
      <span class="hotel__price" :class="{ 'hotel__price--inc': h.included }">
        {{ h.included ? 'Included' : h.deltaPerNight > 0 ? `+$${h.deltaPerNight}/night` : `Save $${Math.abs(h.deltaPerNight)}/night` }}
      </span>
      <q-icon :name="openHotelId === h.id ? 'expand_less' : 'expand_more'" size="22px" class="hotel__chev" />
    </button>

    <!-- Room types at this hotel -->
    <ul v-if="openHotelId === h.id" class="rooms">
      <li v-for="r in rooms" :key="r.id">
        <label class="room" :class="{ 'room--on': room?.id === r.id, 'room--out': !r.roomsLeft }">
          <input type="radio" class="room__radio" :checked="room?.id === r.id"
            :disabled="!r.roomsLeft" @change="emit('choose-room', r)" />
          <img v-if="r.photos.length" :src="r.photos[0].src" :alt="r.photos[0].alt" class="room__img" />
          <span class="room__body">
            <span class="room__name">{{ r.name }}</span>
            <span class="room__facts">
              <span><q-icon name="king_bed" size="15px" /> {{ r.bed }}</span>
              <span><q-icon name="straighten" size="15px" /> {{ r.sqft }} sq ft</span>
              <span><q-icon name="group" size="15px" /> Sleeps {{ r.sleeps }}</span>
              <span><q-icon name="visibility" size="15px" /> {{ r.view }}</span>
            </span>
            <span class="room__stock" :class="r.roomsLeft <= 3 ? 'room__stock--low' : ''">
              {{ r.roomsLeft ? (r.roomsLeft <= 3 ? `Only ${r.roomsLeft} left` : `${r.roomsLeft} rooms left`) : 'Sold out' }}
            </span>
          </span>
          <span class="room__price">
            {{ r.deltaPerNight ? `+$${r.deltaPerNight}/night` : 'Included' }}
            <small>${{ r.nightly }}/night</small>
          </span>
        </label>
      </li>
    </ul>
  </div>

  <!-- Selected room: amenities + extras -->
  <div v-if="room" class="chosen">
    <h4 class="pqv__h4">{{ room.name }} at {{ activeHotel.name }}</h4>
    <p v-if="tooManyGuests" class="chosen__warn">
      <q-icon name="info" size="16px" />
      This room sleeps {{ room.sleeps }} — you're booking for {{ guests }}. You'll need more than one room.
    </p>

    <div class="amen">
      <div v-for="g in room.amenities" :key="g.group" class="amen__group">
        <h5 class="amen__title"><q-icon :name="g.icon" size="18px" /> {{ g.group }}</h5>
        <ul><li v-for="it in g.items" :key="it">{{ it }}</li></ul>
      </div>
    </div>

    <div class="extras">
      <div class="extras__head"><h5 class="extras__title">Room options</h5><span>per stay</span></div>
      <label v-for="e in ROOM_EXTRAS" :key="e.id" class="extra" :class="{ 'extra--on': extra.id === e.id }">
        <input type="radio" :checked="extra.id === e.id" @change="setExtra(e.id)" />
        <span class="extra__label">{{ e.label }}</span>
        <span class="extra__price">+ ${{ e.price }}</span>
      </label>
    </div>
  </div>
</section>
</template>

<style scoped>
.pqv__rooms { margin: 0; padding: 0; }
.pqv__h3 { margin: 0 0 4px; font-size: 1.375rem; font-weight: 700; }
.pqv__h4 { margin: 0 0 10px; font-size: 1.0625rem; font-weight: 700; }
.pqv__sub { margin: 0 0 16px; color: var(--ds-color-text-subtle); }
.hotel { border: 1px solid var(--ds-color-border); border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
.hotel--open { border-color: var(--ds-color-border-bold, #9aa3ae); }
.hotel--chosen { border-color: var(--ds-color-border-brand, #0b2545); box-shadow: 0 0 0 1px var(--ds-color-border-brand, #0b2545) inset; }
.hotel__radio { width: 22px; height: 22px; display: grid; place-items: center; border: 2px solid var(--ds-color-border-bold, #9aa3ae); border-radius: 50%; color: #fff; }
.hotel__radio--on { border-color: var(--ds-color-background-brand-bold, #0b2545); background: var(--ds-color-background-brand-bold, #0b2545); }
.hotel__head { display: grid; grid-template-columns: 22px 84px minmax(0, 1fr) auto auto; align-items: center; gap: 14px; width: 100%; padding: 12px 14px; background: none; border: 0; text-align: left; cursor: pointer; font: inherit; }
.hotel__thumb { width: 84px; height: 64px; object-fit: cover; border-radius: 8px; }
.hotel__meta { min-width: 0; }
.hotel__name { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.hotel__link { display: inline-flex; align-items: center; gap: 4px; font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }
.hotel__brand { font-size: .8125rem; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }
.hotel__facts { display: flex; align-items: center; gap: 6px; font-size: .875rem; color: var(--ds-color-text-subtle); }
.hotel__price { font-weight: 700; white-space: nowrap; }
.hotel__price--inc { color: var(--ds-color-text-success, #167a4a); }
.hotel__chev { color: var(--ds-color-text-subtle); }
.rooms { list-style: none; margin: 0; padding: 0 14px 14px; display: flex; flex-direction: column; gap: 8px; }
.room { display: grid; grid-template-columns: auto 110px minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 10px; border: 1px solid var(--ds-color-border); border-radius: 8px; cursor: pointer; }
.room--on { border-color: var(--ds-color-border-brand, #0b2545); box-shadow: 0 0 0 1px var(--ds-color-border-brand, #0b2545) inset; }
.room--out { opacity: .55; cursor: not-allowed; }
.room__img { width: 110px; height: 76px; object-fit: cover; border-radius: 6px; }
.room__body { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.room__name { font-weight: 700; }
.room__facts { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.room__facts span { display: inline-flex; align-items: center; gap: 4px; }
.room__stock { font-size: .8125rem; color: var(--ds-color-text-success, #167a4a); font-weight: 600; }
.room__stock--low { color: var(--ds-palette-orange-600, #b45309); }
.room__price { text-align: right; font-weight: 700; white-space: nowrap; }
.room__price small { display: block; font-weight: 400; color: var(--ds-color-text-subtle); }
.chosen { margin-top: 18px; padding: 16px; border-radius: 10px; background: var(--ds-color-surface-sunken, #f1f2f4); }
.chosen__warn { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; color: var(--ds-palette-orange-600, #b45309); font-weight: 600; }
.amen { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px 28px; }
.amen__title { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font-size: .9375rem; font-weight: 700; }
.amen ul { margin: 0; padding-left: 20px; color: var(--ds-color-text-subtle); font-size: .875rem; }
.amen li { margin-bottom: 2px; }
.extras { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--ds-color-border); }
.extras__head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; color: var(--ds-color-text-subtle); font-size: .875rem; }
.extras__title { margin: 0; font-size: 1rem; font-weight: 700; color: var(--ds-color-text); }
.extra { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; }
.extra--on { background: var(--ds-color-surface, #fff); box-shadow: 0 0 0 1px var(--ds-color-border-brand, #0b2545) inset; }
.extra__price { font-weight: 700; white-space: nowrap; }
@media (max-width: 860px) {
  .room { grid-template-columns: auto 1fr; }
  .room__img, .room__price { grid-column: 2; text-align: left; }
}
</style>
