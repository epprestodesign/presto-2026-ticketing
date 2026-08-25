<script setup>
// AddonCard — one add-on, with the trip's own quantity on it.
//
// The stepper is bound to the TRIP, not to a local draft: the number on this card
// IS the number in the cart, so browsing add-ons after adding some shows what you
// already bought rather than a reset zero. That also means this card removes —
// step it to zero and the line leaves the trip — which is the same behaviour the
// cart gives, on a browse screen. There is no "Add" / "Added" toggle to fall out
// of sync with the cart, because there is no second copy of the number.
import QuantityStepper from '@lib/components/QuantityStepper.vue'
import { money } from '../trip.js'

defineProps({
  addon: { type: Object, required: true },
  qty: { type: Number, default: 0 },
})
const emit = defineEmits(['update:qty'])
</script>

<template>
  <article class="ac" :class="{ 'is-on': qty > 0 }">
    <span class="ac__icon"><q-icon :name="addon.icon" size="24px" /></span>
    <div class="ac__body">
      <h3 class="ac__name">{{ addon.name }}</h3>
      <p class="ac__blurb">{{ addon.blurb }}</p>
      <p class="ac__price">{{ money(addon.price) }} <small>per {{ addon.per }}</small></p>
    </div>
    <div class="ac__act">
      <button v-if="qty === 0" type="button" class="ac__add" @click="emit('update:qty', 1)">
        <q-icon name="add" size="17px" /> Add
      </button>
      <template v-else>
        <!-- `removable` is on here, unlike in the cart: this card has no Remove
             button beside it, so the stepper's trash at 1 is the only way out and
             is not competing with anything. -->
        <quantity-stepper
          :model-value="qty" :min="1" :max="addon.max" removable
          @update:model-value="(n) => emit('update:qty', n)" @remove="emit('update:qty', 0)"
        />
        <span class="ac__line">{{ money(addon.price * qty) }} in your trip</span>
      </template>
    </div>
  </article>
</template>

<style scoped>
.ac { display: flex; gap: 16px; align-items: flex-start; padding: 18px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg, 12px); background: var(--ds-color-surface); font-family: var(--ds-font-family); }
.ac.is-on { border-color: var(--ds-color-border-brand, #01113E); box-shadow: 0 0 0 1px var(--ds-color-border-brand, #01113E) inset; }
.ac__icon { display: inline-flex; align-items: center; justify-content: center; width: 46px; height: 46px; flex: none; border-radius: var(--ds-radius-md, 8px); background: var(--ds-palette-slate-100, #f1f2f4); color: var(--ds-color-background-brand-bold, #01113E); }
.ac__body { flex: 1; min-width: 0; }
.ac__name { margin: 0 0 4px; font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-text); }
.ac__blurb { margin: 0 0 8px; font-size: .875rem; color: var(--ds-color-text-subtle); }
.ac__price { margin: 0; font-weight: 700; color: var(--ds-color-text); }
.ac__price small { font-weight: 400; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.ac__act { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.ac__add { display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 16px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-surface); font: inherit; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }
.ac__add:hover { background: var(--ds-palette-slate-100, #f1f2f4); }
.ac__line { font-size: .75rem; font-weight: 600; color: var(--ds-color-text-subtle); white-space: nowrap; }

@media (max-width: 620px) {
  .ac { flex-wrap: wrap; }
  .ac__act { align-items: stretch; width: 100%; }
}
</style>
