<script setup>
// A room type on the hotel details tab, priced as a package.
//
// --- Why this isn't the library's RoomCardReserve ----------------------------
// The template's own card is room-shaped all the way through: "$X USD / room /
// night", "$Y USD total", "N rooms · incl. taxes & fees", "Reserve Room". This
// prototype isn't selling rooms — the room is one component of a package, and the
// number that matters is what the whole package costs with this room in it. There
// is no way to relabel that CTA or add a package total without editing the
// library, which no prototype here does.
//
// It also has to say something the library card has no slot for: what picking
// this room does to the price, in the same +/− language the customize screen
// uses. A guest arrives on this tab from the customize screen and goes back to
// it; the two surfaces have to price a room the same way, or the tab is a trap.
//
// What stays the library's: the section around these cards — title, subtitle,
// rules — is still `RoomsCarousel`'s. Only its grid of room cards is suppressed,
// and these are teleported into `#hdp-rooms` in its place. See HotelDetailsScreen.
import { computed } from 'vue'
import AvailabilityBadge from '@lib/components/AvailabilityBadge.vue'

const props = defineProps({
  room: { type: Object, required: true },
  hotel: { type: Object, required: true },
  // The package total if this room were the one in the configuration.
  packagePrice: { type: Number, required: true },
  // Change from what the guest currently holds. 0 when this IS the current room.
  delta: { type: Number, default: 0 },
  selected: { type: Boolean, default: false },
  // How many of this room the party needs, at its occupancy.
  roomsNeeded: { type: Number, default: 1 },
})
const emit = defineEmits(['select', 'price-details'])

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(n || 0))

const nightly = computed(() => props.hotel.nightlyRate + props.room.deltaPerNight)
const soldOut = computed(() => props.room.roomsLeft < props.roomsNeeded)

const deltaLabel = computed(() => {
  if (props.selected) return null
  if (props.delta === 0) return 'Same package price'
  return `${props.delta > 0 ? '+' : '−'}${money(props.delta)} on your package`
})
</script>

<template>
<article class="rpc" :class="{ 'is-selected': selected }">
  <div class="rpc__head">
    <h3 class="rpc__title">{{ room.name }}</h3>
    <p class="rpc__bed">{{ room.bed }}</p>
    <p class="rpc__occ">
      <q-icon name="bed" size="18px" /> Max occupancy: {{ room.sleeps }}
      · {{ roomsNeeded }} room{{ roomsNeeded === 1 ? '' : 's' }} for your party
    </p>

    <ul class="rpc__facts">
      <li><span>Space</span><strong>{{ room.sqft }} sq ft</strong></li>
      <li><span>View</span><strong>{{ room.view }}</strong></li>
      <li><span>Room rate</span><strong>{{ money(nightly) }} / night</strong></li>
      <li>
        <span>Availability</span>
        <!-- The library's own inventory pill, so this reads the same as it does
             on every other room surface in the system. -->
        <availability-badge :count="room.roomsLeft" :threshold="3" />
      </li>
    </ul>
  </div>

  <div class="rpc__foot">
    <div class="rpc__price">
      <!-- The PACKAGE total, all in — what checkout charges. A room rate on the
           button, landing on a four-figure checkout, would read as a
           bait-and-switch. The nightly rate survives as a fact above. -->
      <strong class="rpc__now">{{ money(packagePrice) }}</strong>
      <small class="rpc__per">package total with this room · {{ hotel.name }}</small>
      <small v-if="selected" class="rpc__current">This is the room in your package</small>
      <small v-else-if="deltaLabel" class="rpc__delta" :class="delta > 0 ? 'is-up' : delta < 0 ? 'is-down' : 'is-flat'">
        {{ deltaLabel }}
      </small>
    </div>
  </div>

  <div class="rpc__actions">
    <q-btn
      unelevated color="primary" class="rpc__cta"
      :label="selected ? 'Back to your package' : 'Use this room'"
      :disable="soldOut" @click="emit('select', room)"
    />
    <q-btn flat dense color="primary" class="rpc__link" label="Price details"
      @click="emit('price-details', room)" />
  </div>
</article>
</template>

<style scoped>
.rpc { display: flex; flex-direction: column; border: 1px solid var(--ds-color-border); border-radius: 12px; overflow: hidden; background: var(--ds-color-surface, #fff); box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 8px 20px rgba(0,0,0,.06); }
.rpc.is-selected { border-color: var(--ds-color-background-brand-bold, #01113E); box-shadow: 0 0 0 1px var(--ds-color-background-brand-bold, #01113E) inset; }

.rpc__head { display: flex; flex-direction: column; padding: 20px 22px 16px; }
.rpc__title { margin: 0; font-size: 1.25rem; font-weight: 700; line-height: 1.2; color: var(--ds-color-text-brand, #0b2545); }
.rpc__bed { margin: 6px 0 0; color: var(--ds-color-text-subtle); }
.rpc__occ { display: inline-flex; align-items: center; gap: 8px; margin: 8px 0 0; font-size: .875rem; color: var(--ds-color-text); }
.rpc__occ .q-icon { color: var(--ds-color-text-brand, #0b2545); }

.rpc__facts { list-style: none; margin: 14px 0 0; padding: 14px 0 0; border-top: 1px solid var(--ds-color-border); display: flex; flex-direction: column; gap: 8px; }
.rpc__facts li { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: .9375rem; }
.rpc__facts span { color: var(--ds-color-text-subtle); }
.rpc__facts strong { font-weight: 600; color: var(--ds-color-text); }

.rpc__foot { margin-top: auto; padding: 14px 22px 0; border-top: 1px solid var(--ds-color-border); }
.rpc__price { display: flex; flex-direction: column; }
.rpc__now { font-size: 1.625rem; font-weight: 800; line-height: 1.1; color: var(--ds-color-text); }
.rpc__per { font-size: .8125rem; color: var(--ds-color-text-subtle); }
.rpc__current { margin-top: 4px; font-size: .8125rem; font-weight: 700; color: var(--ds-color-text-success, #167a4a); }
.rpc__delta { margin-top: 4px; font-size: .875rem; font-weight: 800; font-variant-numeric: tabular-nums; }
.rpc__delta.is-up { color: var(--ds-color-text); }
.rpc__delta.is-down { color: var(--ds-color-text-success, #167a4a); }
.rpc__delta.is-flat { color: var(--ds-color-text-subtle); font-weight: 600; }

.rpc__actions { display: flex; align-items: center; gap: 10px; padding: 14px 22px 20px; }
.rpc__cta { flex: 1 1 auto; font-weight: 700; }
.rpc__link { flex: none; font-weight: 600; }

@media (max-width: 640px) {
  .rpc__actions { flex-direction: column-reverse; align-items: stretch; }
}
</style>
