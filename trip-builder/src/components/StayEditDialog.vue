<script setup>
// StayEditDialog — the room, the nights and the room count for one property.
//
// ADDING AND EDITING ARE THE SAME DIALOG, on purpose. If the edit surface were a
// different screen from the add surface, "change my room" would mean re-entering
// the hotel flow, which is exactly the restart this prototype is arguing against.
// It opens from the browse grid (nothing in the trip yet) and from the stay line
// in the cart (something in the trip already) with the same controls in the same
// places; only the title and the footer differ.
//
// Built on the library's DsModal — the design system's canonical dialog shell —
// so the chrome, ESC handling and mobile collapse are not re-invented here. The
// body is ours because no library dialog edits a room, a length of stay and a
// room count together: RoomBookingDialog is a per-room reserve flow that ends in
// a booking, not an amendment to a line already in a cart.
import { ref, computed, watch } from 'vue'
import DsModal from '@lib/components/DsModal.vue'
import QuantityStepper from '@lib/components/QuantityStepper.vue'
import { stayById, money, checkInLabel, checkOutLabel, MAX_NIGHTS, MAX_ROOMS } from '../trip.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  hotelId: { type: String, default: null },
  // The stay line being edited, or null when this is an add.
  line: { type: Object, default: null },
  // The stay this one would replace — named so the swap is never a surprise.
  replacing: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'save', 'remove', 'browse'])

const hotel = computed(() => stayById(props.hotelId))
const draft = ref({ roomId: 'standard', nights: 1, rooms: 1 })

// The draft is seeded on OPEN, not on every prop change: a guest halfway through
// picking a suite shouldn't have their choice reset by anything happening behind
// the modal. Nothing is written to the trip until Save.
watch(() => props.modelValue, (open) => {
  if (!open) return
  draft.value = props.line
    ? { roomId: props.line.roomId, nights: props.line.nights, rooms: props.line.rooms }
    : { roomId: hotel.value.rooms[0].id, nights: 1, rooms: 1 }
}, { immediate: true })

const room = computed(() => hotel.value.rooms.find((r) => r.id === draft.value.roomId) || hotel.value.rooms[0])
const subtotal = computed(() => room.value.rate * draft.value.nights * draft.value.rooms)
const isEdit = computed(() => !!props.line)

function save() {
  emit('save', { hotelId: hotel.value.id, ...draft.value })
  emit('update:modelValue', false)
}
function remove() {
  emit('remove', props.line)
  emit('update:modelValue', false)
}
</script>

<template>
  <ds-modal
    :model-value="modelValue" size="md"
    :title="isEdit ? 'Edit your stay' : 'Add a stay'"
    :subtitle="`${hotel.name} · ${hotel.distanceMi} mi from the venue · ${hotel.walkMin} min walk`"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Said before the swap happens, not after. The sentence that matters is the
         second one: the rest of the trip is not part of this decision. -->
    <p v-if="replacing" class="sed__swap">
      <q-icon name="swap_horiz" size="18px" />
      This replaces <strong>{{ replacing }}</strong> in your trip. Your tickets and add-ons stay exactly as they are.
    </p>

    <fieldset class="sed__group">
      <legend class="sed__legend">Room</legend>
      <label v-for="r in hotel.rooms" :key="r.id" class="sed__room" :class="{ 'is-on': r.id === draft.roomId }">
        <input type="radio" name="sed-room" :value="r.id" :checked="r.id === draft.roomId" @change="draft.roomId = r.id" />
        <span class="sed__roominfo">
          <span class="sed__roomname">{{ r.name }}</span>
          <span class="sed__roommeta">{{ r.bed }} · sleeps {{ r.sleeps }}</span>
        </span>
        <span class="sed__roomrate">{{ money(r.rate) }}<small>/night</small></span>
      </label>
    </fieldset>

    <div class="sed__row">
      <fieldset class="sed__group">
        <legend class="sed__legend">Nights</legend>
        <div class="sed__nights">
          <button
            v-for="n in MAX_NIGHTS" :key="n" type="button"
            class="sed__night" :class="{ 'is-on': n === draft.nights }"
            @click="draft.nights = n"
          >{{ n }} night{{ n === 1 ? '' : 's' }}</button>
        </div>
        <p class="sed__dates">{{ checkInLabel() }} → {{ checkOutLabel(draft.nights) }}</p>
      </fieldset>

      <fieldset class="sed__group sed__group--rooms">
        <legend class="sed__legend">Rooms</legend>
        <quantity-stepper :model-value="draft.rooms" :min="1" :max="MAX_ROOMS" @update:model-value="(n) => (draft.rooms = n)" />
        <p class="sed__dates">Sleeps {{ room.sleeps * draft.rooms }} in total</p>
      </fieldset>
    </div>

    <div class="sed__total">
      <span>{{ money(room.rate) }} × {{ draft.nights }} night{{ draft.nights === 1 ? '' : 's' }} × {{ draft.rooms }} room{{ draft.rooms === 1 ? '' : 's' }}</span>
      <strong>{{ money(subtotal) }}</strong>
    </div>
    <p class="sed__note">Taxes are added in the trip total. Free cancellation until 48 hours before check-in.</p>

    <template #footer>
      <div class="sed__foot">
        <!-- Removing lives here as well as on the line, because a guest who opened
             this dialog to fix a stay may decide the answer is "not this trip". -->
        <button v-if="isEdit" type="button" class="sed__rm" @click="remove">Remove stay</button>
        <button type="button" class="sed__alt" @click="emit('browse')">Choose a different hotel</button>
        <button type="button" class="sed__save" @click="save">
          {{ isEdit ? 'Save changes' : 'Add to trip' }} · {{ money(subtotal) }}
        </button>
      </div>
    </template>
  </ds-modal>
</template>

<style scoped>
.sed__swap { display: flex; align-items: flex-start; gap: 8px; margin: 0 0 18px; padding: 12px 14px; border-radius: var(--ds-radius-md, 8px); background: var(--ds-palette-amber-100, #fff5db); color: var(--ds-color-text); font-size: .9375rem; }

.sed__group { margin: 0 0 20px; padding: 0; border: 0; }
.sed__legend { padding: 0 0 8px; font-size: .75rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-color-text-subtle); }

.sed__room { display: flex; align-items: center; gap: 12px; padding: 12px 14px; margin-bottom: 8px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md, 8px); cursor: pointer; }
.sed__room.is-on { border-color: var(--ds-color-border-brand, #01113E); box-shadow: 0 0 0 1px var(--ds-color-border-brand, #01113E) inset; }
.sed__room input { accent-color: var(--ds-color-background-brand-bold, #01113E); }
.sed__roominfo { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.sed__roomname { font-weight: 700; color: var(--ds-color-text); }
.sed__roommeta { font-size: .8125rem; color: var(--ds-color-text-subtle); }
.sed__roomrate { font-weight: 700; white-space: nowrap; color: var(--ds-color-text); }
.sed__roomrate small { font-weight: 400; font-size: .75rem; color: var(--ds-color-text-subtle); }

.sed__row { display: flex; gap: 28px; flex-wrap: wrap; }
.sed__group--rooms { min-width: 160px; }
.sed__nights { display: flex; gap: 8px; flex-wrap: wrap; }
.sed__night { height: 38px; padding: 0 16px; border: 1px solid var(--ds-color-border-bold); border-radius: 999px; background: var(--ds-color-surface); font: inherit; font-size: .875rem; font-weight: 600; color: var(--ds-color-text); cursor: pointer; }
.sed__night.is-on { background: var(--ds-color-background-brand-bold, #01113E); border-color: var(--ds-color-background-brand-bold, #01113E); color: #fff; }
.sed__dates { margin: 8px 0 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }

.sed__total { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding-top: 14px; border-top: 1px solid var(--ds-color-border); font-size: .9375rem; color: var(--ds-color-text-subtle); }
.sed__total strong { font-size: 1.25rem; color: var(--ds-color-text); }
.sed__note { margin: 6px 0 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }

.sed__foot { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.sed__rm { appearance: none; padding: 0; border: 0; background: none; font: inherit; font-weight: 600; color: var(--ds-color-text-danger, #b3261e); text-decoration: underline; cursor: pointer; }
.sed__alt { appearance: none; padding: 0; border: 0; background: none; font: inherit; font-weight: 600; color: var(--ds-color-text-subtle); text-decoration: underline; cursor: pointer; margin-right: auto; }
.sed__save { flex: none; height: 46px; padding: 0 22px; border: 0; border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }

@media (max-width: 620px) {
  .sed__foot { flex-direction: column; align-items: stretch; }
  .sed__alt { margin-right: 0; }
  .sed__save { width: 100%; }
}
</style>
