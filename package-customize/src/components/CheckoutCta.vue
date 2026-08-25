<script setup>
// The Continue-to-checkout action, as ONE component.
//
// --- Why this isn't a stock `q-btn` any more ---------------------------------
// The Aug 25 review found the old one and couldn't: "these buttons might need a
// little bit more of a punch up, because it should just go right to checkout.
// And if I didn't know to look for this, I might not see it."
//
// The old CTA was a plain `q-btn unelevated color="primary"` — the same shape,
// height and weight as "View package details" two screens earlier and "Use this
// room" one tab across — parked under a savings badge that came between it and
// the total it commits to. Nothing about it said "this is the way out".
//
// Three things changed, and only the first is size:
//
//  1. It carries the number. "Continue to checkout" alone is a navigation label;
//     "Continue to checkout · $6,842" is the decision, stated on the control that
//     makes it. The guest never has to look up to the total and back down.
//  2. It is the only filled navy surface on the customize screen. The dark event
//     strip that used to run across the top — and out-contrasted every control
//     below it — is gone (see CustomizeScreen), so the CTA is now the darkest,
//     densest thing on the page by a distance. Contrast is relative; the cheapest
//     way to make a button loud was to stop shouting over it.
//  3. It points. The arrow slides on hover, so the affordance reads as "go" and
//     not "open something".
//
// Simply enlarging it was rejected. A bigger button in the same place, under the
// same badge, with the same label is still a button that has to be FOUND — and
// the complaint was about finding it, not about hitting it. What makes it
// findable is that nothing else on the screen is shaped like it.
//
// One component rather than the same markup inlined in the rail and the review
// card, because two CTAs for the SAME action that don't look identical read as
// two different actions — and the guest then has to work out which one is the
// real one.
import { computed } from 'vue'

const props = defineProps({
  // The package total this commits to. Rendered on the button itself.
  total: { type: Number, default: 0 },
  // Compact drops the amount line — for the narrow-viewport bar, where the total
  // is already stated beside the button and printing it twice is noise.
  compact: { type: Boolean, default: false },
  label: { type: String, default: 'Continue to checkout' },
})
defineEmits(['click'])

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

const amount = computed(() => money(props.total))
</script>

<template>
<button
  type="button" class="ccta" :class="{ 'ccta--compact': compact }"
  @click="$emit('click')"
>
  <span class="ccta__line">
    <span class="ccta__label">{{ label }}</span>
    <q-icon class="ccta__arrow" name="arrow_forward" size="20px" />
  </span>
  <span v-if="!compact" class="ccta__amount">{{ amount }} · package total, all in</span>
</button>
</template>

<style scoped>
.ccta {
  display: flex; flex-direction: column; align-items: stretch; gap: 2px;
  width: 100%; padding: 15px 20px;
  border: 0; border-radius: var(--ds-radius-button, 8px);
  background: var(--ds-color-background-brand-bold, #01113E); color: #fff;
  font: inherit; text-align: left; cursor: pointer;
  /* The lift is what separates it from the flat cards it sits among — every
     other surface on this screen is a 1px border on white. */
  box-shadow: 0 2px 4px rgba(1, 17, 62, .22), 0 10px 22px rgba(1, 17, 62, .20);
  transition: background .15s ease, box-shadow .15s ease, transform .15s ease;
}
.ccta:hover {
  background: var(--ds-palette-navy-800, #0b2a6b);
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(1, 17, 62, .26), 0 14px 28px rgba(1, 17, 62, .26);
}
.ccta:active { transform: translateY(0); }
/* A visible ring on a navy button needs a light halo as well as the dark
   outline, or the outline disappears into the button on a dark surround. */
.ccta:focus-visible { outline: 3px solid var(--ds-color-border-brand, #0b2545); outline-offset: 3px; box-shadow: 0 0 0 3px #fff inset; }

.ccta__line { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.ccta__label { font-size: 1.0625rem; font-weight: 800; letter-spacing: .01em; }
.ccta__arrow { flex: none; transition: transform .15s ease; }
.ccta:hover .ccta__arrow { transform: translateX(4px); }

.ccta__amount { font-size: .875rem; font-weight: 600; opacity: .82; font-variant-numeric: tabular-nums; }

/* The compact variant shrink-wraps. `width: auto` belongs HERE rather than in the
   bar that uses it: a parent's scoped rule and this file's `.ccta { width: 100% }`
   have identical specificity, so which one won would depend on stylesheet order —
   deterministic only by accident. Same file, later rule, always wins. */
.ccta--compact { width: auto; padding: 13px 18px; }
.ccta--compact .ccta__label { font-size: 1rem; }

@media (prefers-reduced-motion: reduce) {
  .ccta, .ccta__arrow { transition: none; }
  .ccta:hover { transform: none; }
  .ccta:hover .ccta__arrow { transform: none; }
}
</style>
