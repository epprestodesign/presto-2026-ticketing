<script setup>
// One destination add-on.
//
// Hand-rolled rather than borrowed from the library's PackageCard, which is the
// closest existing card, because a package card sells a BUNDLE — its whole layout
// is a price comparison between what's inside and what it costs together. An
// add-on has no bundle to compare against; what a guest needs to decide is "does
// this fit my weekend and what does it cost my party", so the card leads with the
// day it fits and states its pricing unit next to the price.
//
// The card is a single Add / Added toggle — there is no stepper on it at all,
// at zero or after adding. Quantity is the party size (one per guest, or one van
// for the whole party) and the card STATES that number instead of offering it
// for editing.
//
// The rejected alternative is what this card shipped yesterday: Add committed
// the obvious quantity and then handed over a removable stepper "for the
// exceptions". It reads reasonably on one card and badly across six — a family
// of four could leave this screen with four park days, three breakfasts and two
// aquarium tickets, an order that no longer describes any trip anyone is taking,
// and one the checkout rail then has to print with a straight face. One number
// for the whole party is the trade: the one-parent-skips-the-park case is lost,
// and every other case becomes explainable.
import { computed } from 'vue'
import { unitLabel, addOnQty, addOnQtyNote } from '../addons.js'

const props = defineProps({
  addOn: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  // Party size — the quantity, not a default the guest can move off.
  guests: { type: Number, default: 4 },
})
const emit = defineEmits(['toggle'])

const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)
const perGuest = computed(() => props.addOn.unit !== 'booking')
const qty = computed(() => addOnQty(props.addOn, props.guests))
// The number this card follows and why — otherwise the total looks like it moved
// on its own the moment the party size changes on the other screen.
const qtyNote = computed(() => addOnQtyNote(props.addOn, props.guests))
const amount = computed(() => props.addOn.price * qty.value)
const accent = computed(() => `var(${props.addOn.accentVar})`)
</script>

<template>
  <article class="aoc" :class="{ 'aoc--added': selected }" :style="{ '--aoc-accent': accent }">
    <div class="aoc__rail" aria-hidden="true" />

    <div class="aoc__body">
      <header class="aoc__head">
        <span class="aoc__icon"><q-icon :name="addOn.icon" size="24px" /></span>
        <div class="aoc__title">
          <h3 class="aoc__name">{{ addOn.name }}</h3>
          <p class="aoc__vendor">{{ addOn.vendor }}</p>
        </div>
        <span v-if="addOn.badge" class="aoc__badge">{{ addOn.badge }}</span>
      </header>

      <p class="aoc__blurb">{{ addOn.blurb }}</p>

      <p class="aoc__when"><q-icon name="event" size="16px" /> {{ addOn.when }}</p>

      <!-- Where the stepper used to be: the quantity, stated, not editable. -->
      <p class="aoc__qty"><q-icon name="group" size="16px" /> {{ qtyNote }}</p>

      <ul class="aoc__includes">
        <li v-for="(line, i) in addOn.includes" :key="i">
          <q-icon name="check" size="16px" /> <span>{{ line }}</span>
        </li>
      </ul>
    </div>

    <footer class="aoc__foot">
      <div class="aoc__price">
        <span class="aoc__amount">{{ money(addOn.price) }}</span>
        <span class="aoc__unit">{{ unitLabel(addOn) }}</span>
      </div>

      <div class="aoc__action">
        <span class="aoc__total">{{ money(amount) }}</span>
        <button type="button" class="aoc__add" :class="{ 'is-on': selected }" @click="emit('toggle', addOn)">
          <q-icon :name="selected ? 'check' : 'add'" size="18px" />
          <template v-if="selected">Added</template>
          <template v-else>Add<template v-if="perGuest"> for {{ qty }}</template></template>
        </button>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.aoc {
  position: relative; display: flex; flex-direction: column; overflow: hidden;
  font-family: var(--ds-font-family);
  background: var(--ds-color-surface); border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-lg);
}
/* The accent is a rail, not a fill — six saturated attraction-brand colours as
   card backgrounds would read as six ads competing with each other. */
.aoc__rail { position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--aoc-accent); }
.aoc--added { border-color: var(--aoc-accent); box-shadow: 0 0 0 1px var(--aoc-accent); }

.aoc__body { padding: 16px 18px 12px 20px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.aoc__head { display: flex; align-items: flex-start; gap: 12px; }
.aoc__icon { flex: none; width: 40px; height: 40px; display: grid; place-items: center; border-radius: var(--ds-radius-md, 8px); background: color-mix(in srgb, var(--aoc-accent) 12%, transparent); color: var(--aoc-accent); }
.aoc__title { min-width: 0; flex: 1; }
.aoc__name { margin: 0; font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-text); line-height: 1.25; }
.aoc__vendor { margin: 2px 0 0; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }
.aoc__badge { flex: none; align-self: flex-start; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; padding: 4px 8px; border-radius: 999px; background: color-mix(in srgb, var(--aoc-accent) 14%, transparent); color: var(--aoc-accent); }

.aoc__blurb { margin: 0; font-size: 0.9375rem; color: var(--ds-color-text); line-height: 1.45; }
.aoc__when { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 0.8125rem; font-weight: 700; color: var(--ds-color-text-subtle); }

.aoc__includes { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 5px; }
.aoc__includes li { display: flex; align-items: flex-start; gap: 6px; font-size: 0.8125rem; color: var(--ds-color-text-subtle); line-height: 1.4; }
.aoc__includes .q-icon { color: var(--aoc-accent); margin-top: 1px; flex: none; }

.aoc__foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 18px 14px 20px; border-top: 1px solid var(--ds-color-border); }
.aoc__price { display: flex; flex-direction: column; }
.aoc__amount { font-weight: 800; color: var(--ds-color-text); }
.aoc__unit { font-size: 0.75rem; color: var(--ds-color-text-subtle); }
.aoc__action { display: flex; align-items: center; gap: 10px; }
.aoc__total { font-weight: 800; color: var(--ds-color-text); font-variant-numeric: tabular-nums; }

.aoc__add { display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 16px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button); background: var(--ds-color-surface); color: var(--ds-color-text); font: inherit; font-weight: 700; font-size: 0.875rem; cursor: pointer; }
.aoc__add:hover { background: var(--ds-palette-slate-100); border-color: var(--aoc-accent); color: var(--aoc-accent); }
.aoc__add.is-on { background: var(--aoc-accent); border-color: var(--aoc-accent); color: #fff; }
.aoc__add.is-on:hover { background: var(--aoc-accent); color: #fff; opacity: 0.9; }

/* The locked quantity line sits with the schedule line, not with the price:
   both answer "does this fit us", which is the decision the card is for. */
.aoc__qty { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 0.8125rem; font-weight: 700; color: var(--ds-color-text); }
.aoc__qty .q-icon { color: var(--ds-color-text-subtle); }
</style>
