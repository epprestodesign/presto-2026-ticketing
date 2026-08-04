<script setup>
// BookingSummary — the booking card under the package details (Aug 4): party size,
// itemised line items, bundle savings, total and Reserve.
//
// Every number is handed in already priced (see ../../pricing.js) so this stays a
// presentational card — it never computes a total of its own.
defineProps({
  pkg: { type: Object, required: true },
  price: { type: Object, required: true },        // priceConfig() result
  tier: { type: Object, required: true },
  guests: { type: Number, default: 2 },
  nights: { type: Number, default: 1 },
  hasStay: { type: Boolean, default: false },
  activeHotel: { type: Object, default: null },
  room: { type: Object, default: null },
  extra: { type: Object, default: null },
  soldOut: { type: Boolean, default: false },
  stayLabel: { type: String, default: '' },
})
const emit = defineEmits(['update:guests', 'reserve'])
const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)
</script>

<template>
<!-- Booking summary — prices, quantities and the CTA, under the package
     details rather than in a footer bar. -->
<section class="book">
  <h3 class="book__title">Your package</h3>

  <!-- Party size — the control lives with the price it drives. -->
  <div class="book__guests">
    <span class="book__guestlabel">
      <q-icon name="group" size="18px" />
      Guests included
    </span>
    <span class="book__stepper">
      <button type="button" aria-label="Fewer guests" :disabled="guests <= 1" @click="emit('update:guests', Math.max(1, guests - 1))">
        <q-icon name="remove" size="18px" />
      </button>
      <strong>{{ guests }}</strong>
      <button type="button" aria-label="More guests" :disabled="guests >= 12" @click="emit('update:guests', Math.min(12, guests + 1))">
        <q-icon name="add" size="18px" />
      </button>
    </span>
  </div>

  <div class="book__rows">
    <div class="book__row">
      <span>{{ tier.name }} ticket × {{ guests }}</span>
      <span>{{ money(price.ticketTotal) }}</span>
    </div>
    <div v-if="price.experienceValue" class="book__row">
      <span>{{ pkg.theme }} experience</span>
      <span>{{ money(price.experienceValue) }}</span>
    </div>
    <div v-if="hasStay && activeHotel" class="book__row">
      <span>{{ activeHotel.name }}<template v-if="room"> · {{ room.name }}</template> · {{ nights }} night{{ nights === 1 ? '' : 's' }}</span>
      <span>{{ money(price.hotelTotal) }}</span>
    </div>
    <div v-if="price.extraCost" class="book__row">
      <span>{{ extra.label }}</span>
      <span>+{{ money(price.extraCost) }}</span>
    </div>
    <div v-if="price.savings > 0" class="book__row book__row--save">
      <span>Bundle savings</span><span>−{{ money(price.savings) }}</span>
    </div>
  </div>

  <div class="book__total">
    <span>Total</span>
    <strong>{{ money(price.total) }}</strong>
  </div>
  <p class="book__note">
    {{ tier.name }}<template v-if="hasStay"> · {{ stayLabel }}</template>
  </p>

  <q-btn unelevated no-caps color="primary" class="book__cta"
    :disable="soldOut" :label="soldOut ? 'Sold out' : 'Reserve'" @click="emit('reserve')" />
  <p class="book__fine">You won't be charged yet.</p>
</section>
</template>

<style scoped>
.book__guests { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid var(--ds-color-border); }
.book__guestlabel { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; }
.book__stepper { display: inline-flex; align-items: center; gap: 10px; }
.book__stepper button { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid var(--ds-color-border-bold, #9aa3ae); border-radius: 50%; background: none; color: var(--ds-color-text); cursor: pointer; }
.book__stepper button:disabled { opacity: .35; cursor: default; }
.book__stepper strong { min-width: 22px; text-align: center; font-size: 1.0625rem; }
.book { margin: 24px 28px 0; padding: 20px; border: 1px solid var(--ds-color-border); border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,.06); }
.book__title { margin: 0 0 12px; font-size: 1.125rem; font-weight: 700; }
.book__rows { display: flex; flex-direction: column; gap: 8px; }
.book__row { display: flex; justify-content: space-between; gap: 18px; color: var(--ds-color-text); }
.book__row span:first-child { color: var(--ds-color-text-subtle); }
.book__row--save span { color: var(--ds-color-text-success, #167a4a); font-weight: 600; }
.book__inc { color: var(--ds-color-text-success, #167a4a); font-weight: 600; }
.book__total { display: flex; justify-content: space-between; align-items: baseline; gap: 18px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--ds-color-border); font-size: 1.0625rem; font-weight: 700; }
.book__total strong { font-size: 1.5rem; }
.book__note { margin: 6px 0 0; font-size: .875rem; color: var(--ds-color-text-subtle); }
.book__cta { width: 100%; height: 52px; margin-top: 16px; font-size: 1rem; font-weight: 700; }
.book__fine { margin: 8px 0 0; text-align: center; font-size: .8125rem; color: var(--ds-color-text-subtle); }
</style>
