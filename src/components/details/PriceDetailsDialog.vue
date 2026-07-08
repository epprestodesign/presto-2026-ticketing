<script setup>
// PriceDetailsDialog — the "Price Details" breakdown modal opened from a reserve
// room card. Shows the per-night line items, hotel fee, taxes, a grand total,
// and a Reserve Room CTA. Built on DsModal.
//
// Breakdown is derived from the room-card prop object:
//   subtotal = roomCount × nights × pricePerNight
//   hotelFee = room.hotelFee ?? $6 per room-night
//   taxes    = room.taxes    ?? 18% of subtotal
//   total    = subtotal + hotelFee + taxes
import { computed } from 'vue'
import DsModal from '../DsModal.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  room: { type: Object, default: null },
  currency: { type: String, default: '$' },
})
const emit = defineEmits(['update:modelValue', 'reserve'])

const nights = computed(() => props.room?.nights || [])
const perNight = computed(() => props.room?.pricePerNight ?? 0)
const roomCount = computed(() => props.room?.roomCount ?? 1)

const lines = computed(() => nights.value.map((n) => ({ date: n.date, price: perNight.value })))
const subtotal = computed(() => roomCount.value * lines.value.length * perNight.value)
const round2 = (n) => Math.round(n * 100) / 100
const hotelFee = computed(() => props.room?.hotelFee ?? lines.value.length * roomCount.value * 6)
const taxes = computed(() => props.room?.taxes ?? round2(subtotal.value * 0.18))
const total = computed(() => round2(subtotal.value + hotelFee.value + taxes.value))

const money = (n) => props.currency + Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const nightsCount = computed(() => lines.value.length)
const reserve = () => { emit('reserve', props.room); emit('update:modelValue', false) }
</script>

<template>
  <ds-modal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    title="Price Details"
    size="md"
    aria-label="Price details"
  >
    <div class="pd">
      <div class="pd__head">
        {{ roomCount }} room{{ roomCount === 1 ? '' : 's' }} × {{ nightsCount }} night{{ nightsCount === 1 ? '' : 's' }}
      </div>

      <div class="pd__lines">
        <div v-for="l in lines" :key="l.date" class="pd__row pd__row--night">
          <span class="pd__date">{{ l.date }}</span>
          <span class="pd__amt">{{ money(l.price) }}</span>
        </div>
        <div class="pd__row">
          <span>Hotel fee</span>
          <span class="pd__amt">{{ money(hotelFee) }}</span>
        </div>
        <div class="pd__row">
          <span>Taxes</span>
          <span class="pd__amt">{{ money(taxes) }}</span>
        </div>
      </div>

      <hr class="pd__rule" />

      <div class="pd__row pd__row--total">
        <span>Total Cost (USD)</span>
        <span>{{ money(total) }}</span>
      </div>

      <button type="button" class="pd__cta" @click="reserve">Reserve Room</button>
    </div>
  </ds-modal>
</template>

<style scoped>
.pd { display: flex; flex-direction: column; }
.pd__head { font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-text); margin-bottom: 14px; }

.pd__lines { display: flex; flex-direction: column; gap: 12px; }
.pd__row { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: 1.0625rem; color: var(--ds-color-text); }
.pd__row--night { padding-left: 24px; }
.pd__date { color: var(--ds-color-text); }
.pd__amt { color: var(--ds-color-text); font-variant-numeric: tabular-nums; }

.pd__rule { border: 0; border-top: 1px solid var(--ds-color-border); margin: 18px 0; }

.pd__row--total { font-size: 1.25rem; font-weight: 800; color: var(--ds-color-text); }

.pd__cta {
  width: 100%; height: 60px; margin-top: 22px; border: 0; border-radius: var(--ds-radius-button);
  background: var(--ds-color-background-brand-bold); color: #fff; font-family: inherit;
  font-size: 1.125rem; font-weight: 700; cursor: pointer;
  transition: background var(--ds-duration-fast) var(--ds-ease-standard);
}
.pd__cta:hover { background: var(--ds-palette-navy-800); }
</style>
