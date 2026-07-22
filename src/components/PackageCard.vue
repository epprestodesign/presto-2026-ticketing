<script setup>
// PackageCard — a pre-built ticket + hotel (+ experience) SKU (scope 3.4). Shows
// the package theme, its components (ticket tier + hotel + any signature
// experience), bundle savings, the single package price (a-la-carte total struck
// through), availability, and a Select CTA. Supports both plain ticket+hotel
// packages and the themed "Patriots experience" packages.
import { computed, ref, watch } from 'vue'
import BundleSavingsBadge from './BundleSavingsBadge.vue'
import QuantityStepper from './QuantityStepper.vue'

const props = defineProps({
  pkg: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  // Show a guests stepper on the card that re-prices the package live.
  guestsSelector: { type: Boolean, default: true },
  minGuests: { type: Number, default: 1 },
  maxGuests: { type: Number, default: 12 },
})
const emit = defineEmits(['select', 'title', 'update:guests'])

const soldOut = computed(() => props.pkg.soldOut)
const hasExperiences = computed(() => Array.isArray(props.pkg.experiences) && props.pkg.experiences.length > 0)
function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: props.pkg.currency || 'USD', maximumFractionDigits: 0 }).format(n) }

// --- Guests + live re-pricing ---------------------------------------------
// Scale the ticket portion by guests, keeping the hotel + baked-in experience
// value fixed (same convention as PackageBookingDialog), and preserve the bundle
// discount rate so the struck-through total and package price stay consistent.
const guests = ref(props.pkg.quantity || 2)
watch(() => props.pkg, (p) => { guests.value = p.quantity || 2 })
const origQty = computed(() => props.pkg.quantity || 2)
const ticketPrice = computed(() => props.pkg.ticket?.price ?? 0)
const hotelTotal = computed(() => props.pkg.hotel?.hotelTotal ?? 0)
const expValue = computed(() => Math.max(0, (props.pkg.componentsTotal ?? 0) - ticketPrice.value * origQty.value - hotelTotal.value))
const discountRate = computed(() => (props.pkg.componentsTotal ? (props.pkg.componentsTotal - props.pkg.packagePrice) / props.pkg.componentsTotal : 0))
const priced = computed(() => {
  const was = Math.round(ticketPrice.value * guests.value + hotelTotal.value + expValue.value)
  const now = Math.round(was * (1 - discountRate.value))
  return { was, now, savings: was - now }
})
watch(guests, (g) => emit('update:guests', g))
const onSelect = () => emit('select', { ...props.pkg, quantity: guests.value, componentsTotal: priced.value.was, packagePrice: priced.value.now, savings: priced.value.savings })
</script>

<template>
  <div class="pkg" :class="{ 'is-selected': selected, 'is-sold': soldOut }">
    <!-- Imagery hero (experience packages with a themed photo) -->
    <div v-if="pkg.image" class="pkg__hero" :style="{ '--accent': `var(${pkg.accentVar || '--ds-palette-navy-700'})` }">
      <img :src="pkg.image" :alt="pkg.name" loading="lazy" />
      <div class="pkg__heroover">
        <span class="pkg__themechip"><q-icon :name="pkg.icon || 'star'" size="15px" />{{ pkg.theme }}</span>
        <BundleSavingsBadge v-if="!soldOut" :amount="priced.savings" size="sm" />
        <span v-else class="pkg__soldtag pkg__soldtag--onhero">Sold out</span>
      </div>
    </div>

    <!-- Theme banner (experience packages without a photo) -->
    <div v-else-if="pkg.theme" class="pkg__theme" :style="{ '--accent': `var(${pkg.accentVar || '--ds-palette-navy-700'})` }">
      <q-icon :name="pkg.icon || 'star'" size="18px" />
      <span>{{ pkg.theme }}</span>
      <BundleSavingsBadge v-if="!soldOut" :amount="priced.savings" size="sm" class="pkg__themesavings" />
      <span v-else class="pkg__soldtag">Sold out</span>
    </div>

    <div class="pkg__head">
      <button type="button" class="pkg__name pkg__name--btn" @click="emit('title', pkg)">{{ pkg.name }}<q-icon name="tune" size="15px" /></button>
      <BundleSavingsBadge v-if="!pkg.theme && !soldOut" :amount="priced.savings" size="sm" />
      <span v-else-if="!pkg.theme && soldOut" class="pkg__soldtag">Sold out</span>
    </div>
    <p v-if="pkg.tagline" class="pkg__tagline">{{ pkg.tagline }}</p>
    <p v-if="pkg.sponsor" class="pkg__sponsor"><q-icon name="handshake" size="14px" /> Presented by {{ pkg.sponsor }}</p>

    <ul class="pkg__components">
      <li>
        <span class="pkg__swatch" :style="{ background: `var(${pkg.ticket.colorVar})` }" />
        <span><strong>{{ pkg.ticket.tierName }}</strong> ticket<template v-if="guests > 1"> × {{ guests }}</template></span>
      </li>
      <li v-if="pkg.hotel">
        <q-icon name="hotel" size="16px" class="pkg__icon" />
        <span><strong>{{ pkg.hotel.name }}</strong> · {{ pkg.hotel.roomType }} · {{ pkg.nights }} night{{ pkg.nights === 1 ? '' : 's' }}</span>
      </li>
      <li v-for="(x, i) in pkg.experiences" :key="i" class="pkg__exp">
        <q-icon :name="x.icon" size="16px" class="pkg__icon pkg__icon--accent" :style="{ color: `var(${pkg.accentVar || '--ds-palette-navy-700'})` }" />
        <span>{{ x.label }}</span>
      </li>
    </ul>

    <!-- Guests selector — re-prices the package live -->
    <div v-if="guestsSelector" class="pkg__guests">
      <span class="pkg__guestslabel"><q-icon name="group" size="16px" /> Guests</span>
      <QuantityStepper v-model="guests" :min="minGuests" :max="maxGuests" :disabled="soldOut" size="sm" />
    </div>

    <div class="pkg__foot">
      <div class="pkg__pricing">
        <span class="pkg__was">{{ fmt(priced.was) }}</span>
        <span class="pkg__nowline">
          <span class="pkg__now">{{ fmt(priced.now) }}</span>
          <span v-if="guests > 1" class="pkg__per">for {{ guests }}</span>
        </span>
      </div>
      <button type="button" class="pkg__cta" :disabled="soldOut" @click="onSelect">
        {{ selected ? 'Selected' : soldOut ? 'Unavailable' : 'Select package' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.pkg {
  font-family: var(--ds-font-family); background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg);
  overflow: hidden; display: flex; flex-direction: column; gap: var(--ds-space-3);
  padding: var(--ds-space-4); transition: border-color var(--ds-duration-fast) var(--ds-ease-standard);
}
.pkg.is-selected { border-color: var(--ds-color-border-brand); box-shadow: 0 0 0 1px var(--ds-color-border-brand); }
.pkg.is-sold { opacity: 0.65; }

.pkg__hero { position: relative; margin: calc(-1 * var(--ds-space-4)) calc(-1 * var(--ds-space-4)) 2px; height: 148px; overflow: hidden; }
.pkg__hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pkg__heroover {
  position: absolute; inset: 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
  padding: 12px; background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.18) 100%);
}
.pkg__themechip {
  display: inline-flex; align-items: center; gap: 5px; background: var(--accent); color: #fff;
  font-weight: var(--ds-font-weight-bold); font-size: var(--ds-font-size-sm); padding: 4px 11px; border-radius: var(--ds-radius-pill);
}
.pkg__soldtag--onhero { background: rgba(0,0,0,0.6); color: #fff; padding: 3px 9px; border-radius: var(--ds-radius-sm); }

.pkg__theme {
  display: flex; align-items: center; gap: var(--ds-space-2); margin: calc(-1 * var(--ds-space-4)) calc(-1 * var(--ds-space-4)) 0;
  padding: 10px var(--ds-space-4); background: var(--accent); color: #fff;
  font-weight: var(--ds-font-weight-bold); font-size: var(--ds-font-size-sm);
}
.pkg__themesavings { margin-left: auto; }
.pkg__theme .pkg__soldtag { margin-left: auto; color: #fff; }

.pkg__head { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); }
.pkg__name { margin: 0; font-size: var(--ds-font-size-md); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
/* Clickable title — opens the package customization dialog. */
.pkg__name--btn { display: inline-flex; align-items: center; gap: 6px; padding: 0; background: none; border: 0; font-family: inherit; text-align: left; cursor: pointer; }
.pkg__name--btn .q-icon { color: var(--ds-color-icon-subtle); }
.pkg__name--btn:hover { color: var(--ds-color-text-brand); text-decoration: underline; }
.pkg__name--btn:hover .q-icon { color: var(--ds-color-text-brand); }
.pkg__soldtag { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.pkg__tagline { margin: -6px 0 0; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.pkg__sponsor { margin: 0; display: flex; align-items: center; gap: 4px; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-brand); font-weight: var(--ds-font-weight-medium); }

.pkg__components { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--ds-space-2); }
.pkg__components li { display: flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-sm); color: var(--ds-color-text); }
.pkg__swatch { width: 12px; height: 12px; border-radius: var(--ds-radius-sm); flex: none; }
.pkg__icon { color: var(--ds-color-icon-subtle); flex: none; }
.pkg__exp { color: var(--ds-color-text); }

/* Guests selector row — sits just above the pinned footer. */
.pkg__guests { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); margin-top: auto; }
.pkg__guestslabel { display: inline-flex; align-items: center; gap: 6px; font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.pkg__guestslabel .q-icon { color: var(--ds-color-icon-subtle); }
/* When the guests row is present it absorbs the free space, so the footer no
   longer needs margin-top:auto. */
.pkg__guests + .pkg__foot { margin-top: 0; }

/* Footer pinned to the bottom of the card so pricing + CTA align across cards
   of differing content height (margin-top:auto absorbs the free space above). */
.pkg__foot { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); margin-top: auto; padding-top: var(--ds-space-3); border-top: 1px solid var(--ds-color-border); }
/* Stack the struck-through a-la-carte total above the discounted package price. */
.pkg__pricing { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
.pkg__was { text-decoration: line-through; color: var(--ds-color-text-subtlest); font-size: var(--ds-font-size-sm); line-height: 1.2; }
.pkg__nowline { display: inline-flex; align-items: baseline; gap: 6px; }
.pkg__now { font-size: var(--ds-font-size-lg); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.pkg__per { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.pkg__cta {
  cursor: pointer; border: none; font: inherit; font-weight: var(--ds-font-weight-bold);
  background: var(--ds-color-background-brand-bold); color: var(--ds-color-text-inverse);
  padding: 9px 18px; border-radius: var(--ds-radius-button); flex: none;
}
.pkg__cta:disabled { background: var(--ds-color-background-neutral); color: var(--ds-color-text-disabled); cursor: not-allowed; }
</style>
