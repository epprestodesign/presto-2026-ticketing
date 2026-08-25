<script setup>
// The party size — the ONE quantity control left in the flow.
//
// After the Aug 25 round every downstream line (tournament passes, park days,
// character breakfasts, the airport van) is priced off this number and carries
// no stepper of its own. That makes this control load-bearing in a way it wasn't
// before, so it appears on BOTH quantity-bearing screens rather than only on the
// first one: a guest who changes their mind on the add-ons step must not have to
// walk back to Tickets to change a number that re-prices the page in front of
// them.
//
// It is one control, not two — both mounts read and write `journey.guests`, so
// there is no second copy to fall out of sync. The alternative, a party field
// per screen with its own state, is exactly the divergence this round removed
// one level down.
import QuantityStepper from '@lib/components/QuantityStepper.vue'

defineProps({
  guests: { type: Number, default: 4 },
  // What this number is currently driving, said plainly. Each screen passes its
  // own sentence because "re-prices your passes" and "re-prices every add-on"
  // are different promises and a generic one would be true of neither.
  note: { type: String, default: '' },
})
defineEmits(['update:guests'])
</script>

<template>
  <div class="party">
    <div class="party__text">
      <span class="party__label"><q-icon name="group" size="18px" /> Your party</span>
      <span class="party__note">{{ note }}</span>
    </div>
    <quantity-stepper :model-value="guests" :min="1" :max="12" @update:model-value="$emit('update:guests', $event)" />
  </div>
</template>

<style scoped>
.party { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); padding: 14px 16px; }
.party__label { display: flex; align-items: center; gap: 6px; font-weight: 700; color: var(--ds-color-text); }
.party__note { display: block; margin-top: 2px; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }
</style>
