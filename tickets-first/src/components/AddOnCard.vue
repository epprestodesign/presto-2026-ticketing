<script setup>
// One optional extra in the extras step — the sibling of the library's
// ContractedHotelCard, deliberately built to the same skeleton (media, name,
// meta line, price + Add/Added toggle) so the two steps read as one flow.
//
// Two things had to differ, and both are the reason this isn't just
// ContractedHotelCard with different props:
//
//   • ICON, NOT A PHOTO. A hotel card is photo-led because you are choosing a
//     PLACE and the picture is evidence. An extra is a service — a parking
//     pass, a bus seat — and stock photography of a parking lot tells a guest
//     nothing they can act on. The tile carries the extra's icon instead, which
//     also stops four extras from looking like four more hotels.
//
//   • A QUANTITY THAT ONLY SOMETIMES EXISTS. Per-guest extras take the ticket
//     count and say so; per-vehicle extras get a stepper. Rendering a stepper on
//     all four would invite a guest to buy three tailgate wristbands for four
//     people (see addons.js).
import { computed } from 'vue'
import QuantityStepper from '@lib/components/QuantityStepper.vue'

const props = defineProps({
  addOn: { type: Object, required: true },        // an ADD_ONS entry
  guests: { type: Number, default: 2 },            // the ticket count
  vehicles: { type: Number, default: 1 },
  selected: { type: Boolean, default: false },
  // Set when the extra can't be offered yet — currently only the transfer,
  // which needs a hotel to leave from.
  unavailableReason: { type: String, default: null },
})
const emit = defineEmits(['toggle', 'update:vehicles'])

const isVehicle = computed(() => props.addOn.unit === 'vehicle')
const units = computed(() => (isVehicle.value ? props.vehicles : props.guests))
const total = computed(() => props.addOn.price * units.value)
const unavailable = computed(() => !!props.unavailableReason)

// What the quantity is, and why it's that number. Per-guest extras state the
// tie to the ticket count out loud — otherwise the price looks like it moved on
// its own when the guest changes tickets in the cart.
const unitLine = computed(() =>
  isVehicle.value
    ? `${props.vehicles} vehicle${props.vehicles === 1 ? '' : 's'}`
    : `${props.guests} guest${props.guests === 1 ? '' : 's'} — matches your tickets`
)

function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) }
</script>

<template>
  <div class="addon" :class="{ 'is-selected': selected, 'is-off': unavailable }">
    <div class="addon__tile"><q-icon :name="addOn.icon" size="30px" /></div>

    <div class="addon__body">
      <div class="addon__name">{{ addOn.name }}</div>
      <p class="addon__tagline">{{ addOn.tagline }}</p>
      <div class="addon__meta"><q-icon name="schedule" size="13px" />{{ addOn.meta }}</div>

      <p v-if="unavailable" class="addon__off">
        <q-icon name="info" size="14px" />{{ unavailableReason }}
      </p>

      <div class="addon__foot">
        <div class="addon__price">
          {{ fmt(addOn.price) }}<span>/{{ addOn.unit }} · {{ fmt(total) }} for {{ unitLine }}</span>
        </div>

        <div class="addon__actions">
          <!-- The stepper appears only once the extra is in the trip: a count
               on something not yet added is a number with nothing to multiply. -->
          <QuantityStepper
            v-if="isVehicle && selected && !unavailable"
            :model-value="vehicles" :min="1" :max="addOn.maxUnits || 4" size="sm"
            @update:model-value="emit('update:vehicles', $event)"
          />
          <button
            type="button" class="addon__btn" :class="{ 'is-on': selected }"
            :disabled="unavailable" @click="emit('toggle', addOn)"
          >
            <q-icon :name="selected ? 'check' : 'add'" size="16px" />{{ selected ? 'Added' : 'Add' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.addon {
  display: flex; gap: var(--ds-space-4); background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg);
  padding: var(--ds-space-3); font-family: var(--ds-font-family);
  transition: border-color var(--ds-duration-fast) var(--ds-ease-standard);
}
.addon.is-selected { border-color: var(--ds-color-border-brand); box-shadow: 0 0 0 1px var(--ds-color-border-brand); }
.addon.is-off { opacity: 0.72; }

/* The icon tile stands where ContractedHotelCard puts its photo, at the same
   size, so a column of hotels and a column of extras share a rhythm. */
.addon__tile {
  width: 132px; height: 108px; flex: none; border-radius: var(--ds-radius-md);
  display: flex; align-items: center; justify-content: center;
  background: var(--ds-color-surface-sunken); color: var(--ds-color-text-brand);
}
.addon.is-selected .addon__tile { background: var(--ds-color-background-info); }

.addon__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.addon__name { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.addon__tagline { margin: 0; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.addon__meta { display: inline-flex; align-items: center; gap: 4px; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtlest); }
.addon__off {
  display: inline-flex; align-items: center; gap: 5px; margin: 2px 0 0; align-self: flex-start;
  font-size: var(--ds-font-size-sm); color: var(--ds-color-text-info);
  background: var(--ds-color-background-info); border-radius: var(--ds-radius-pill); padding: 2px 10px;
}

.addon__foot { margin-top: auto; padding-top: var(--ds-space-2); display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); flex-wrap: wrap; }
.addon__price { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.addon__price span { font-weight: var(--ds-font-weight-regular); font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.addon__actions { display: flex; align-items: center; gap: var(--ds-space-3); }
.addon__btn {
  display: inline-flex; align-items: center; gap: 4px; cursor: pointer; font: inherit;
  font-weight: var(--ds-font-weight-bold); padding: 7px 16px; border-radius: var(--ds-radius-button);
  border: 1px solid var(--ds-color-border-bold); background: var(--ds-color-surface); color: var(--ds-color-text);
}
.addon__btn.is-on { background: var(--ds-color-background-brand-bold); border-color: transparent; color: var(--ds-color-text-inverse); }
.addon__btn:disabled { cursor: not-allowed; color: var(--ds-color-text-disabled); border-color: var(--ds-color-border); }

@media (max-width: 640px) {
  .addon { flex-direction: column; }
  .addon__tile { width: 100%; height: 72px; }
}
</style>
