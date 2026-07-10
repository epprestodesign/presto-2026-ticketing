<script setup>
// RoomCardGroup — "Group Block" vertical room card for the Hotel Details
// "Select Your Room" section. Header (room type, bed config, occupancy) + a
// "Rooms per Night" list with per-night quantity steppers + starting price + an
// "Add to Cart" CTA (muted until a room is picked). No room-type image or
// amenities list. When a room is sold out (at least one night unavailable), the
// footer shows an "Unavailable" state.
import { ref, computed } from 'vue'
import QuantityStepper from '../QuantityStepper.vue'

const props = defineProps({
  roomType: { type: String, default: 'Room' },
  bedConfig: { type: String, default: '' },
  maxOccupancy: { type: Number, default: null },
  features: { type: Array, default: () => [] },   // accepted but not rendered
  nights: { type: Array, default: () => [] },      // [{ date, roomsLeft, price }]
  currency: { type: String, default: '$' },
  availability: { type: String, default: 'available' }, // available | limited | soldout
  // Image props accepted for compatibility; room-type images are not shown.
  image: { type: String, default: '' },
  imageCategories: { type: Array, default: () => [] },
  seed: { type: Number, default: 0 },
})
const emit = defineEmits(['add'])

const soldout = computed(() => props.availability === 'soldout')
const money = (n) => props.currency + Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const leftLabel = (n) => (n <= 0 ? 'Sold Out' : n <= 3 ? `Only ${n} left` : `${n} left`)
const leftClass = (n) => (n <= 0 ? 'is-sold' : n <= 3 ? 'is-limited' : 'is-ok')

const qty = ref(props.nights.map(() => 0))
const totalSelected = computed(() => qty.value.reduce((a, b) => a + b, 0))
const startingPrice = computed(() => (props.nights.length ? Math.min(...props.nights.map((n) => n.price)) : 0))
</script>

<template>
  <div class="rcg">
    <!-- HEAD -->
    <div class="rcg__head">
      <h3 class="rcg__title">{{ roomType }}</h3>
      <div v-if="bedConfig" class="rcg__bed">{{ bedConfig }}</div>
      <div v-if="maxOccupancy != null" class="rcg__occ"><q-icon name="bed" size="18px" /> <span>Max Occupancy: {{ maxOccupancy }}</span></div>
    </div>

    <!-- ROOMS PER NIGHT -->
    <div v-if="nights.length" class="rcg__sec">
      <h4 class="rcg__h">Rooms per Night</h4>
      <div v-for="(n, i) in nights" :key="n.date" class="rcg__night">
        <div class="rcg__ndate">
          <span class="rcg__date">{{ n.date }}</span>
          <span class="rcg__nrate">{{ money(n.price) }} / night</span>
        </div>
        <span class="rcg__left" :class="leftClass(n.roomsLeft)">{{ leftLabel(n.roomsLeft) }}</span>
        <quantity-stepper v-model="qty[i]" :min="0" :max="soldout ? 0 : n.roomsLeft" size="sm" />
      </div>
    </div>

    <!-- FOOT — starting price + CTA, or the Unavailable state when sold out -->
    <div class="rcg__foot">
      <template v-if="!soldout">
        <div class="rcg__starting">STARTING PRICE</div>
        <div class="rcg__amount"><strong>{{ money(startingPrice) }}</strong> <span>/ night</span></div>
        <button type="button" class="rcg__cta" :class="{ 'rcg__cta--ready': totalSelected > 0 }" :disabled="totalSelected === 0" @click="emit('add', totalSelected)">
          {{ totalSelected > 0 ? `Add ${totalSelected} to Cart` : 'Add to Cart' }}
        </button>
      </template>
      <template v-else>
        <button type="button" class="rcg__unavail" disabled>Unavailable</button>
        <p class="rcg__soldnote"><q-icon name="error" size="18px" /> <span>At least one night in your selected range is sold out at this property</span></p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.rcg { display: flex; flex-direction: column; width: 360px; background: var(--ds-color-surface); border: 1px solid rgba(0,0,0,0.04); border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 20px rgba(0,0,0,0.06); }

/* Head grows to fill, pushing the Rooms-per-Night + footer to a consistent
   baseline so they align across equal-height cards in the grid. */
.rcg__head { flex: 1; padding: 20px 22px 16px; display: flex; flex-direction: column; gap: 8px; }
.rcg__title { margin: 0; font-size: 1.375rem; font-weight: 700; color: var(--ds-color-text-brand); line-height: 1.2; }
.rcg__bed { color: var(--ds-color-text-subtle); font-size: 1rem; }
.rcg__occ { display: inline-flex; align-items: center; gap: 8px; color: var(--ds-color-text); font-size: 1rem; }
.rcg__occ .q-icon { color: var(--ds-color-text-brand); }

.rcg__sec { padding: 14px 22px; border-top: 1px solid var(--ds-color-border); }
.rcg__h { margin: 0 0 10px; font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-text-brand); }
.rcg__night { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 12px; padding: 8px 0; }
.rcg__ndate { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rcg__date { color: var(--ds-color-text-brand); font-weight: 700; font-size: 1rem; }
.rcg__nrate { color: var(--ds-color-text-subtlest); font-size: 0.8125rem; }
.rcg__left { font-weight: 700; font-size: 0.9375rem; white-space: nowrap; }
.rcg__left.is-ok { color: var(--ds-color-text-success); }
.rcg__left.is-limited { color: var(--ds-palette-orange-600); }
.rcg__left.is-sold { color: var(--ds-color-text-danger); }

.rcg__foot { padding: 16px 22px 20px; border-top: 1px solid var(--ds-color-border); }
.rcg__starting { color: var(--ds-color-text-subtle); font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.04em; }
.rcg__amount { color: var(--ds-color-text-brand); margin-top: 2px; }
.rcg__amount strong { font-size: 1.5rem; font-weight: 700; }
.rcg__amount span { color: var(--ds-color-text-subtle); font-size: 0.9375rem; }
.rcg__cta { width: 100%; height: 46px; margin-top: 14px; border: 0; border-radius: var(--ds-radius-button); background: var(--ds-palette-slate-300); color: #fff; font-family: inherit; font-size: 1rem; font-weight: 700; cursor: default; transition: background var(--ds-duration-fast) var(--ds-ease-standard); }
.rcg__cta--ready { background: var(--ds-color-background-brand-bold); cursor: pointer; }
.rcg__cta--ready:hover { background: var(--ds-palette-navy-800); }

/* Sold-out / unavailable state */
.rcg__unavail { width: 100%; height: 48px; border: 0; border-radius: var(--ds-radius-button); background: var(--ds-color-background-danger-bold); color: #fff; font-family: inherit; font-size: 1rem; font-weight: 700; cursor: default; }
.rcg__soldnote { display: flex; align-items: flex-start; gap: 8px; margin: 12px 0 0; color: var(--ds-color-text-danger); font-size: 0.875rem; line-height: 1.4; }
.rcg__soldnote .q-icon { color: var(--ds-color-text-danger); flex: none; margin-top: 1px; }
</style>
