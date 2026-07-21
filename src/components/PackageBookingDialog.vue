<script setup>
// PackageBookingDialog — a full package-detail modal that mirrors the Hotel
// Details RoomBookingDialog (large image left, scrollable detail right, sticky
// live-total CTA), but for a Patriots experience package. Adds OPTION selectors
// (ticket level, hotel, nights) and a QUANTITY selector to customize the package,
// plus optional experience add-ons. The package price re-prices live off the
// selections, keeping the bundle discount.
import { ref, computed } from 'vue'
import QuantityStepper from './QuantityStepper.vue'

const props = defineProps({
  pkg: { type: Object, required: true },      // generateExperiencePackages() item
  tiers: { type: Array, default: () => [] },  // deriveTiers(event) — [{ id, name, price, colorVar, desc }]
  hotels: { type: Array, default: () => [] }, // CONTRACTED_HOTELS
  addOns: { type: Array, default: () => [] }, // [{ id, label, price, note, popular }]
  currency: { type: String, default: '$' },
})
const emit = defineEmits(['close', 'add'])

const money = (n) => props.currency + Number(Math.round(n) ?? 0).toLocaleString('en-US')

// --- Selections (seed from the package's default configuration) ---
const tierId = ref(props.pkg.ticket?.tierId || props.tiers[0]?.id)
const hotelId = ref(props.pkg.hotel?.id || '')
const nights = ref(props.pkg.nights || 1)
const qty = ref(props.pkg.quantity || 2)
const picked = ref(Object.fromEntries(props.addOns.map((a) => [a.id, false])))
const toggle = (id) => { picked.value[id] = !picked.value[id] }

// --- Derived values ---
const tier = computed(() => props.tiers.find((t) => t.id === tierId.value) || props.tiers[0] || { name: props.pkg.ticket?.tierName, price: props.pkg.ticket?.price })
const hotel = computed(() => props.hotels.find((h) => h.id === hotelId.value) || null)

// The signature-experience value baked into the package (flat), derived from the
// package's own a-la-carte breakdown so the discount stays consistent.
const expValue = computed(() => {
  const base = props.pkg.componentsTotal
    - (props.pkg.ticket?.price ?? 0) * (props.pkg.quantity ?? 2)
    - (props.pkg.hotel?.hotelTotal ?? 0)
  return Math.max(0, Math.round(base))
})
const discountRate = computed(() => (props.pkg.componentsTotal ? props.pkg.savings / props.pkg.componentsTotal : 0.1))

const addOnsTotal = computed(() => props.addOns.filter((a) => picked.value[a.id]).reduce((s, a) => s + a.price, 0))
const hotelTotal = computed(() => (hotel.value ? hotel.value.nightlyRate * nights.value : 0))
const aLaCarte = computed(() => (tier.value?.price ?? 0) * qty.value + hotelTotal.value + expValue.value + addOnsTotal.value)
const packageTotal = computed(() => Math.round(aLaCarte.value * (1 - discountRate.value)))
const savings = computed(() => aLaCarte.value - packageTotal.value)

const hotelOptions = computed(() => [{ id: '', name: 'No hotel — tickets & experience only' }, ...props.hotels])

const onAdd = () => emit('add', {
  pkg: props.pkg, tierId: tierId.value, hotelId: hotelId.value || null,
  nights: hotel.value ? nights.value : 0, quantity: qty.value,
  addOns: props.addOns.filter((a) => picked.value[a.id]).map((a) => a.id),
  total: packageTotal.value,
})
</script>

<template>
  <div class="pbd">
    <div class="pbd__bar">
      <button class="pbd__icon" aria-label="Close" @click="emit('close')"><q-icon name="close" size="22px" /></button>
      <button class="pbd__icon" aria-label="Share"><q-icon name="ios_share" size="20px" /></button>
    </div>

    <div class="pbd__body">
      <!-- LEFT: package image -->
      <div class="pbd__media">
        <div class="pbd__hero" :style="{ '--accent': `var(${pkg.accentVar || '--ds-palette-navy-700'})` }">
          <img v-if="pkg.image" :src="pkg.image" :alt="pkg.name" class="pbd__img" />
          <div v-else class="pbd__img pbd__img--empty"><q-icon name="image" size="40px" /></div>
          <span class="pbd__themechip"><q-icon :name="pkg.icon || 'star'" size="15px" />{{ pkg.theme }}</span>
        </div>
      </div>

      <!-- RIGHT: scrollable detail -->
      <div class="pbd__content">
        <h2 class="pbd__title">{{ pkg.name }}</h2>
        <p v-if="pkg.tagline" class="pbd__desc">{{ pkg.tagline }}</p>
        <p v-if="pkg.sponsor" class="pbd__sponsor"><q-icon name="handshake" size="15px" /> Presented by {{ pkg.sponsor }}</p>

        <!-- What's included -->
        <div v-if="pkg.experiences?.length" class="pbd__sec">
          <h3 class="pbd__h">What's included</h3>
          <ul class="pbd__incl">
            <li v-for="(x, i) in pkg.experiences" :key="i"><q-icon :name="x.icon" size="18px" /> {{ x.label }}</li>
          </ul>
        </div>

        <!-- OPTIONS -->
        <div class="pbd__sec">
          <h3 class="pbd__h">Customize your package</h3>
          <p class="pbd__sub">Choose your seats, stay, and party size — the price updates live.</p>

          <label class="pbd__field">
            <span class="pbd__label">Ticket level</span>
            <div class="pbd__selectwrap">
              <select v-model="tierId">
                <option v-for="t in tiers" :key="t.id" :value="t.id">{{ t.name }} · {{ money(t.price) }}/ea</option>
              </select>
              <q-icon name="expand_more" size="20px" />
            </div>
          </label>

          <label class="pbd__field">
            <span class="pbd__label">Hotel stay</span>
            <div class="pbd__selectwrap">
              <select v-model="hotelId">
                <option v-for="h in hotelOptions" :key="h.id" :value="h.id">{{ h.name }}<template v-if="h.nightlyRate"> · {{ h.roomType }} · {{ money(h.nightlyRate) }}/night</template></option>
              </select>
              <q-icon name="expand_more" size="20px" />
            </div>
          </label>

          <div class="pbd__steppers">
            <div v-if="hotel" class="pbd__stepper">
              <span class="pbd__label">Nights</span>
              <quantity-stepper v-model="nights" :min="1" :max="5" size="sm" />
            </div>
            <div class="pbd__stepper">
              <span class="pbd__label">Guests</span>
              <quantity-stepper v-model="qty" :min="1" :max="10" size="sm" />
            </div>
          </div>
        </div>

        <!-- Add-ons -->
        <div v-if="addOns.length" class="pbd__sec">
          <h3 class="pbd__h">Enhance your day</h3>
          <p class="pbd__sub">Optional · Add as many as you like</p>
          <div v-for="a in addOns" :key="a.id" class="pbd__extra">
            <div class="pbd__extra-info">
              <span class="pbd__extra-label">{{ a.label }}</span>
              <span v-if="a.note" class="pbd__extra-note">{{ a.note }}</span>
              <span class="pbd__extra-price">+{{ money(a.price) }}</span>
            </div>
            <button class="pbd__add" :class="{ 'is-on': picked[a.id] }" :aria-pressed="picked[a.id]" :aria-label="(picked[a.id] ? 'Remove ' : 'Add ') + a.label" @click="toggle(a.id)">
              <q-icon :name="picked[a.id] ? 'check' : 'add'" size="20px" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- sticky footer: live price + CTA -->
    <div class="pbd__foot">
      <div class="pbd__pricing">
        <span class="pbd__was">{{ money(aLaCarte) }}</span>
        <span class="pbd__now">{{ money(packageTotal) }}</span>
        <span class="pbd__savings">Save {{ money(savings) }}</span>
      </div>
      <q-btn unelevated no-caps class="pbd__cta" :label="`Add to Cart · ${money(packageTotal)}`" @click="onAdd" />
    </div>
  </div>
</template>

<style scoped>
.pbd { display: flex; flex-direction: column; width: 100%; max-width: 1040px; max-height: 88vh; background: var(--ds-color-surface); border-radius: var(--ds-radius-lg); overflow: hidden; box-shadow: var(--ds-shadow-4); font-family: var(--ds-font-family); }
.pbd__bar { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; flex: none; }
.pbd__icon { width: 36px; height: 36px; border-radius: 50%; border: 0; background: var(--ds-palette-slate-100); color: var(--ds-color-text); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.pbd__icon:hover { background: var(--ds-palette-slate-200); }

.pbd__body { display: flex; flex: 1; min-height: 0; overflow: hidden; }
.pbd__media { flex: 0 0 44%; padding: 0 24px 24px; }
.pbd__hero { position: relative; border-radius: var(--ds-radius-md); overflow: hidden; }
.pbd__img { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; display: block; background: var(--ds-palette-slate-100); }
.pbd__img--empty { display: flex; align-items: center; justify-content: center; color: var(--ds-color-text-disabled); }
.pbd__themechip { position: absolute; top: 12px; left: 12px; display: inline-flex; align-items: center; gap: 5px; background: var(--accent); color: #fff; font-weight: 700; font-size: 0.8125rem; padding: 5px 12px; border-radius: var(--ds-radius-pill); }

.pbd__content { flex: 1; min-width: 0; overflow-y: auto; padding: 4px 28px 28px; }
.pbd__title { font-size: 1.75rem; font-weight: 700; line-height: 1.15; margin: 0; color: var(--ds-color-text); }
.pbd__desc { color: var(--ds-color-text-subtle); margin: 12px 0 0; font-size: 0.9375rem; }
.pbd__sponsor { margin: 8px 0 0; display: inline-flex; align-items: center; gap: 5px; font-size: 0.875rem; color: var(--ds-color-text-brand); font-weight: 600; }

.pbd__sec { margin-top: 22px; padding-top: 22px; border-top: 1px solid var(--ds-color-border); }
.pbd__h { font-size: 1.1875rem; font-weight: 700; margin: 0; color: var(--ds-color-text); }
.pbd__sub { color: var(--ds-color-text-subtle); font-size: 0.875rem; margin: 4px 0 0; }
.pbd__incl { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.pbd__incl li { display: flex; align-items: center; gap: 8px; font-size: 0.9375rem; color: var(--ds-color-text); }
.pbd__incl .q-icon { color: var(--ds-color-text-brand); flex: none; }

.pbd__field { display: block; margin-top: 14px; }
.pbd__label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--ds-color-text); margin-bottom: 6px; }
.pbd__selectwrap { position: relative; display: flex; align-items: center; }
.pbd__selectwrap select { width: 100%; appearance: none; font: inherit; font-size: 0.9375rem; color: var(--ds-color-text); background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); padding: 11px 40px 11px 14px; cursor: pointer; }
.pbd__selectwrap select:focus { outline: none; border-color: var(--ds-color-border-brand); }
.pbd__selectwrap .q-icon { position: absolute; right: 12px; color: var(--ds-color-text-subtle); pointer-events: none; }
.pbd__steppers { display: flex; gap: 32px; margin-top: 16px; }
.pbd__stepper { display: flex; flex-direction: column; gap: 6px; }

.pbd__extra { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--ds-color-border); }
.pbd__extra:last-child { border-bottom: 0; }
.pbd__extra-info { display: flex; flex-direction: column; }
.pbd__extra-label { font-weight: 500; color: var(--ds-color-text); font-size: 0.9375rem; }
.pbd__extra-note { color: var(--ds-color-text-subtle); font-size: 0.8125rem; margin-top: 1px; }
.pbd__extra-price { color: var(--ds-color-text-subtle); font-size: 0.875rem; margin-top: 2px; }
.pbd__add { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--ds-color-border-bold); background: var(--ds-color-surface); color: var(--ds-color-text); cursor: pointer; display: flex; align-items: center; justify-content: center; flex: none; }
.pbd__add:hover { background: var(--ds-palette-slate-100); }
.pbd__add.is-on { background: var(--ds-color-background-brand-bold); border-color: var(--ds-color-background-brand-bold); color: #fff; }

.pbd__foot { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 16px 24px; border-top: 1px solid var(--ds-color-border); background: var(--ds-color-surface); }
.pbd__pricing { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.pbd__was { text-decoration: line-through; color: var(--ds-color-text-subtlest); font-size: 0.9375rem; }
.pbd__now { font-size: 1.5rem; font-weight: 700; color: var(--ds-color-text); }
.pbd__savings { background: var(--ds-palette-green-600); color: #fff; font-weight: 600; font-size: 0.8125rem; padding: 3px 10px; border-radius: var(--ds-radius-sm); }
.pbd__cta { height: 52px; padding: 0 28px; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; font-size: 1rem; flex: none; }

@media (max-width: 760px) {
  .pbd__body { flex-direction: column; overflow-y: auto; }
  .pbd__media { flex: none; padding: 0 20px 16px; }
  .pbd__content { overflow: visible; }
  .pbd__foot { flex-wrap: wrap; }
}
</style>
