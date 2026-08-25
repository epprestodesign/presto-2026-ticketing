<script setup>
// The itemised price behind a package total, rendered IN PLACE.
//
// --- Why this replaced PackagePriceDialog ------------------------------------
// It used to be a `DsModal`. The Aug 25 review was unambiguous: "I never want to
// have this as a pop-up... we almost never are going to want those modal pop-ups,
// we're always going to want a clean page." So the dialog is gone, and this is
// the same content as a plain block a card opens inside itself.
//
// The exchange is a real one and worth naming. A modal could be big, centred and
// always the same size regardless of what opened it; an in-card panel has to live
// in a column that is a third of the browse board wide, and opening it grows the
// row. That is the cost, and it buys the thing that was actually wrong with the
// modal: the breakdown now appears ATTACHED to the price it explains, with that
// price still on screen above it. A dialog covered the card whose number it was
// itemising, which is a strange way to answer "where does this come from".
//
// --- Why a breakdown surface still exists at all -----------------------------
// The obvious move after the review was to delete it outright: the customize
// screen's PriceRail already itemises the live configuration, permanently and on
// the page, so on THAT screen a second breakdown would be a duplicate. It isn't
// rendered there, and shouldn't be.
//
// But the rail belongs to a price in motion, and it only exists on one of five
// screens. The two surfaces this does serve have no rail and no motion: three
// browse tiles the guest hasn't opened yet, and a hotel tab quoting rooms the
// guest doesn't hold. Making the breakdown permanent on those would triple the
// height of three tiles to explain numbers nobody has questioned yet — and on the
// browse board that pushes the packages themselves below the fold, which is the
// thing the Aug 5 round asked to fix. So: permanent where the number moves,
// on-demand and in-place where it doesn't. Both read the same
// `priceConfiguration()`, through the same `breakdownLines()`.
import { computed } from 'vue'
import { breakdownLines } from '../packages.js'

const props = defineProps({
  // A `priceConfiguration()` result (or a `buildPackage()` result, which spreads
  // one). Everything below is read off it — nothing here re-does arithmetic.
  priced: { type: Object, default: null },
  // Optional context line: "Priced for 4 people · 2 rooms at The Westin".
  context: { type: String, default: '' },
})

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

const lines = computed(() => breakdownLines(props.priced, money))
</script>

<template>
<div v-if="priced" class="pbd">
  <p v-if="context" class="pbd__context">{{ context }}</p>

  <div class="pbd__lines">
    <div v-for="l in lines" :key="l.key" class="pbd__row">
      <span class="pbd__label">
        {{ l.label }}
        <small>{{ l.note }}</small>
      </span>
      <span class="pbd__amt">{{ money(l.value) }}</span>
    </div>
  </div>

  <div class="pbd__totals">
    <div class="pbd__row pbd__row--sub">
      <span class="pbd__label">Booked separately</span>
      <span class="pbd__amt">{{ money(priced.componentsTotal) }}</span>
    </div>
    <div class="pbd__row pbd__row--save">
      <span class="pbd__label">Bundle discount · {{ Math.round(priced.discountRate * 100) }}%</span>
      <span class="pbd__amt">−{{ money(priced.savings) }}</span>
    </div>
    <div class="pbd__row pbd__row--total">
      <span class="pbd__label">Package total</span>
      <span class="pbd__amt">{{ money(priced.packagePrice) }}</span>
    </div>
  </div>

  <p class="pbd__note">
    {{ money(priced.perPerson) }} per person · every line above is editable on the customize
    screen, including the party size this is priced for.
  </p>
</div>
</template>

<style scoped>
/* No shell of its own — no border, no shadow, no card. The surface it opens
   inside already IS the card, and a bordered box inside a bordered box is the
   modal's frame smuggled back in. */
.pbd { display: flex; flex-direction: column; }
.pbd__context { margin: 0 0 10px; font-size: .8125rem; color: var(--ds-color-text-subtle); }

.pbd__lines { display: flex; flex-direction: column; gap: 10px; }
.pbd__totals { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--ds-color-border); display: flex; flex-direction: column; gap: 8px; }

.pbd__row { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; font-size: .875rem; color: var(--ds-color-text); }
.pbd__label { display: flex; flex-direction: column; min-width: 0; }
.pbd__label small { margin-top: 2px; font-size: .75rem; color: var(--ds-color-text-subtle); }
.pbd__amt { font-variant-numeric: tabular-nums; white-space: nowrap; }

.pbd__row--sub .pbd__amt { color: var(--ds-color-text-subtle); text-decoration: line-through; }
.pbd__row--save { color: var(--ds-color-text-success, #167a4a); font-weight: 700; }
.pbd__row--save .pbd__amt { color: inherit; }
.pbd__row--total { margin-top: 2px; padding-top: 8px; border-top: 1px solid var(--ds-color-border); font-size: 1rem; font-weight: 800; }

.pbd__note { margin: 10px 0 0; font-size: .75rem; line-height: 1.4; color: var(--ds-color-text-subtle); }
</style>
