<script setup>
// The room card under "Room types at this property" on the hotel details page.
//
// --- Why this isn't the library's RoomCardReserve --------------------------
// The template's own card is room-shaped all the way through: it prints
// "$X USD / room / night", "$Y USD total", "N rooms · incl. taxes & fees", and a
// "Reserve Room" CTA. Option D isn't selling rooms — it sells one package per
// hotel, and the Aug 5 feedback asked for this card to select that package with
// the same experience the package cards give.
//
// Forcing package numbers through room-shaped labels would have produced
// sentences that are simply untrue ("$773 USD / room / night" for a per-person
// figure), and the library card has no party-size control and no way to relabel
// its CTA without editing the library — which no prototype here does. So the
// card is Option D's, and it mirrors PackageCard's footer exactly: the same
// party-size select bound to the same store value, the same price block, a
// primary CTA, a secondary link.
//
// What stays the library's: the section around it (title, subtitle, rules) is
// still `RoomsCarousel`'s, and this card is teleported into its section so the
// Rooms tab still scrolls to the right place. See HotelDetailsScreen.
import { computed } from 'vue'

const props = defineProps({
  // The room type this hotel's package is priced around.
  room: { type: Object, required: true },
  // That hotel's package, priced for the current party.
  pkg: { type: Object, required: true },
  people: { type: Number, default: 2 },
  maxPeople: { type: Number, default: 12 },
})
const emit = defineEmits(['select', 'price-details', 'update:people'])

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

const peopleOptions = computed(() =>
  Array.from({ length: props.maxPeople }, (_, i) => ({
    label: `${i + 1} ${i === 0 ? 'person' : 'people'}`,
    value: i + 1,
  }))
)

// Same line the package card carries — what the party size bought here.
// Occupancy differs between the two hotels, so this is the sentence that
// explains why the same number of people costs different amounts.
const partyEffect = computed(() => {
  const { guests, rooms } = props.pkg
  return `${guests} ticket${guests === 1 ? '' : 's'} · ${rooms} room${rooms === 1 ? '' : 's'}`
})

const availability = computed(() => {
  const left = props.room.roomsLeft
  if (left === 0) return { cls: 'is-sold', text: 'Sold out' }
  if (left <= 3) return { cls: 'is-limited', text: `Only ${left} left` }
  return { cls: 'is-ok', text: `${left} rooms left` }
})
</script>

<template>
<article class="rpc">
  <div class="rpc__head">
    <h3 class="rpc__title">{{ room.name }}</h3>
    <p class="rpc__bed">{{ room.bed }}</p>
    <p class="rpc__occ"><q-icon name="bed" size="18px" /> Max occupancy: {{ room.sleeps }}</p>

    <ul class="rpc__facts">
      <li><span>Space</span><strong>{{ room.sqft }} sq ft</strong></li>
      <li><span>View</span><strong>{{ room.view }}</strong></li>
      <li><span>Availability</span><strong :class="availability.cls">{{ availability.text }}</strong></li>
    </ul>

    <p v-if="room.included" class="rpc__incl">
      <q-icon name="check_circle" size="17px" />
      This is the room the {{ pkg.name }} is priced around — it's included, not an upgrade.
    </p>
  </div>

  <!-- The package-card footer, verbatim in structure: party size on the left,
       the price it drives on the right. -->
  <div class="rpc__foot">
    <label class="rpc__people">
      <span class="rpc__people-label">Party size</span>
      <q-select
        outlined dense emit-value map-options
        :model-value="people" :options="peopleOptions"
        :aria-label="`Party size for the ${pkg.name}`"
        @update:model-value="(n) => emit('update:people', n)"
      />
      <small class="rpc__people-effect">{{ partyEffect }}</small>
    </label>

    <div class="rpc__price">
      <span class="rpc__was">{{ money(pkg.componentsTotal) }}</span>
      <strong class="rpc__now">{{ money(pkg.packagePrice) }}</strong>
      <small class="rpc__per">{{ money(pkg.perPerson) }} per person · all in</small>
      <!-- The room rate, demoted: it explains the stay portion without
           competing with the number the button actually charges. -->
      <small class="rpc__rate">Room rate {{ money(pkg.hotel.nightlyRate) }} / night, included</small>
    </div>
  </div>

  <div class="rpc__actions">
    <q-btn unelevated color="primary" class="rpc__cta" label="Select package"
      :disable="room.roomsLeft === 0" @click="emit('select', pkg)" />
    <q-btn flat dense color="primary" class="rpc__link" label="Price details"
      @click="emit('price-details', pkg)" />
  </div>
</article>
</template>

<style scoped>
.rpc { display: flex; flex-direction: column; max-width: 560px; border: 1px solid var(--ds-color-border); border-radius: 12px; overflow: hidden; background: var(--ds-color-surface, #fff); box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 8px 20px rgba(0,0,0,.06); }

.rpc__head { display: flex; flex-direction: column; padding: 20px 22px 16px; }
.rpc__title { margin: 0; font-size: 1.375rem; font-weight: 700; line-height: 1.2; color: var(--ds-color-text-brand, #0b2545); }
.rpc__bed { margin: 6px 0 0; color: var(--ds-color-text-subtle); }
.rpc__occ { display: inline-flex; align-items: center; gap: 8px; margin: 8px 0 0; color: var(--ds-color-text); }
.rpc__occ .q-icon { color: var(--ds-color-text-brand, #0b2545); }

.rpc__facts { list-style: none; margin: 14px 0 0; padding: 14px 0 0; border-top: 1px solid var(--ds-color-border); display: flex; flex-direction: column; gap: 8px; }
.rpc__facts li { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; font-size: .9375rem; }
.rpc__facts span { color: var(--ds-color-text-subtle); }
.rpc__facts strong { font-weight: 600; color: var(--ds-color-text); }
.rpc__facts .is-ok { color: var(--ds-color-text-success, #167a4a); }
.rpc__facts .is-limited { color: var(--ds-palette-orange-600, #b45309); }
.rpc__facts .is-sold { color: var(--ds-color-text-danger, #b3261e); }

.rpc__incl { display: flex; align-items: flex-start; gap: 8px; margin: 14px 0 0; font-size: .875rem; color: var(--ds-color-text-subtle); }
.rpc__incl .q-icon { color: var(--ds-color-text-success, #167a4a); flex: none; margin-top: 1px; }

/* --- The package card's footer, same structure and same rhythm ------------- */
.rpc__foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: auto; padding: 14px 22px 0; border-top: 1px solid var(--ds-color-border); }

.rpc__people { display: flex; flex-direction: column; gap: 4px; width: 152px; flex: none; }
.rpc__people-label { font-size: .75rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.rpc__people-effect { font-size: .75rem; color: var(--ds-color-text-subtle); }

.rpc__price { display: flex; flex-direction: column; min-width: 0; text-align: right; margin-left: auto; }
.rpc__was { font-size: .875rem; color: var(--ds-color-text-subtle); text-decoration: line-through; }
.rpc__now { font-size: 1.75rem; font-weight: 800; line-height: 1.1; color: var(--ds-color-text); }
.rpc__per { font-size: .8125rem; color: var(--ds-color-text-subtle); }
.rpc__rate { margin-top: 2px; font-size: .75rem; color: var(--ds-color-text-subtlest, #6b7280); }

.rpc__actions { display: flex; align-items: center; gap: 10px; padding: 14px 22px 20px; }
.rpc__cta { flex: 1 1 auto; font-weight: 700; }
.rpc__link { flex: none; font-weight: 600; }

@media (max-width: 640px) {
  .rpc__foot { flex-direction: column; align-items: stretch; }
  .rpc__people { width: 100%; }
  .rpc__price { text-align: left; margin-left: 0; }
  .rpc__actions { flex-direction: column-reverse; align-items: stretch; }
}
</style>
