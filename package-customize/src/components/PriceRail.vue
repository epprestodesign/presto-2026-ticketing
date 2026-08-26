<script setup>
// The live price rail on the customize screen.
//
// --- Why the whole breakdown is on the page, not behind a link --------------
// The sibling prototypes put the itemised price in a modal ("Price details"),
// which is right when the price is a fixed number and the breakdown is reference
// material you consult once. Here the price is the feedback loop: the brief is
// "see package pricing update live as components change", and a total that moves
// while its explanation is hidden behind a dialog tells the guest THAT something
// changed without telling them WHAT. So every line is on the rail, and toggling
// an extra visibly adds or removes its own row.
//
// The rail is `position: sticky` for the same reason — a breakdown that scrolls
// away while the guest is editing the thing that drives it is a breakdown they
// have to go and find.
//
// Built on the library's `DsCard` (the standard bordered surface) and
// `BundleSavingsBadge` (the system's "save $X vs. booking separately" pill), so
// the discount reads the same here as it does on a package card.
//
// --- The foot is a commit block (Aug 25) -------------------------------------
// The review said the checkout button "should just go right to checkout. And if I
// didn't know to look for this, I might not see it." Two things were in its way,
// and both were in this file.
//
// FIRST, the savings badge sat between the total and the button, so the eye went
// total → green pill → button and the pill broke the run. The badge has moved up
// beside the discount row it is actually about, which is where it belonged
// anyway; the foot is now an uninterrupted total → per-person → GO.
//
// SECOND, the button was a stock `q-btn` indistinguishable from every other
// button in the flow. It is now `CheckoutCta` — see that file for the full
// reasoning — and it carries the total, so the last thing under the guest's eye
// is the number and the way out, in one control.
//
// The reset link stays, deliberately quiet and BELOW the CTA. It is the undo, not
// the exit; giving it equal weight is how a rail ends up with two buttons of the
// same size pointing in opposite directions.
import { computed } from 'vue'
import DsCard from '@lib/components/DsCard.vue'
import BundleSavingsBadge from '@lib/components/BundleSavingsBadge.vue'
import CheckoutCta from './CheckoutCta.vue'
import { breakdownLines, STAY_LABEL } from '../packages.js'

const props = defineProps({
  // priceConfiguration() output.
  priced: { type: Object, required: true },
  // The preset it started from, for the name at the top.
  packageName: { type: String, default: '' },
  customized: { type: Boolean, default: false },
  /**
   * Show the per-component rows. On for the customize screen, where the rail IS
   * the itemisation. Off on the cart page, where the same rows are the page's
   * main column with a "Change" on each — a rail restating them three feet to the
   * right would be the same list twice, and the guest would have to work out
   * which copy is the editable one.
   *
   * A prop rather than a second summary component: the total, the discount, the
   * per-person line and the CTA are identical on both screens, and two files
   * spelling them out is how a rail and a summary start disagreeing about what a
   * package costs.
   */
  itemised: { type: Boolean, default: true },
})
const emit = defineEmits(['continue', 'reset'])

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

// One row per component, in the order the screen edits them. The rows themselves
// come from `breakdownLines()` in packages.js, shared with the two on-demand
// breakdowns — see the comment there for why they aren't three copies.
const lines = computed(() => breakdownLines(props.priced, money))

const discountPct = computed(() => Math.round(props.priced.discountRate * 100))
</script>

<template>
<ds-card class="prail" :class="{ 'prail--slim': !itemised }" padding="none">
  <header class="prail__head">
    <p class="prail__eyebrow">
      Your package
      <span v-if="customized" class="prail__tag">Customised</span>
    </p>
    <h2 class="prail__name">{{ packageName }}</h2>
    <p class="prail__stay"><q-icon name="event" size="14px" /> {{ STAY_LABEL }}</p>
  </header>

  <div v-if="itemised" class="prail__lines">
    <div v-for="l in lines" :key="l.key" class="prail__row">
      <span class="prail__label">
        {{ l.label }}
        <small>{{ l.note }}</small>
      </span>
      <span class="prail__amt">{{ money(l.value) }}</span>
    </div>
  </div>

  <div class="prail__totals">
    <div class="prail__row prail__row--sub">
      <span class="prail__label">Booked separately</span>
      <span class="prail__amt">{{ money(priced.componentsTotal) }}</span>
    </div>
    <div class="prail__row prail__row--save">
      <span class="prail__label">Bundle discount · {{ discountPct }}%</span>
      <span class="prail__amt">−{{ money(priced.savings) }}</span>
    </div>
    <!-- Beside the discount it restates, not between the total and the CTA. -->
    <bundle-savings-badge :amount="priced.savings" size="sm" />
  </div>

  <div class="prail__foot">
    <div class="prail__row prail__row--total">
      <span>Package total</span>
      <span>{{ money(priced.packagePrice) }}</span>
    </div>
    <p class="prail__per">{{ money(priced.perPerson) }} per person · all in, USD</p>

    <checkout-cta class="prail__cta" :total="priced.packagePrice" @click="emit('continue')" />
    <button v-if="customized" type="button" class="prail__reset" @click="emit('reset')">
      <q-icon name="restart_alt" size="16px" /> Reset to the original package
    </button>
    <p class="prail__note">Prototype pricing. Taxes and fees are included in every line.</p>
  </div>
</ds-card>
</template>

<style scoped>
/* 24px clears the sticky section-tab bars the library pages use, so the rail
   never tucks under one when this screen is opened from a deep link. */
.prail { position: sticky; top: 24px; }

.prail__head { padding: 18px 20px 16px; border-bottom: 1px solid var(--ds-color-border); }
.prail__eyebrow { display: flex; align-items: center; gap: 8px; margin: 0; font-size: .75rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.prail__tag { padding: 2px 8px; border-radius: var(--ds-radius-pill, 999px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; letter-spacing: .03em; }
.prail__name { margin: 6px 0 0; font-size: 1.25rem; font-weight: 800; color: var(--ds-color-text); }
.prail__stay { display: flex; align-items: center; gap: 6px; margin: 6px 0 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }

.prail__lines { display: flex; flex-direction: column; gap: 12px; padding: 16px 20px; }
.prail__totals { padding: 14px 20px; border-top: 1px solid var(--ds-color-border); display: flex; flex-direction: column; align-items: stretch; gap: 8px; }
/* Without the lines between them, the head's own border and the totals' border
   stack into one 2px rule that reads as a heavier divider than either intends. */
.prail--slim .prail__totals { border-top: 0; padding-top: 16px; }
/* The badge is a pill, not a row — it must not stretch to the column's width.
   (Scoped CSS stamps this component's scope id onto a child's root element, so
   the badge's own class is reachable from here without `:deep`.) */
.prail__totals .savings { align-self: flex-start; margin-top: 2px; }

.prail__row { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; font-size: .9375rem; color: var(--ds-color-text); }
.prail__label { display: flex; flex-direction: column; min-width: 0; }
.prail__label small { margin-top: 2px; font-size: .75rem; color: var(--ds-color-text-subtle); }
.prail__amt { font-variant-numeric: tabular-nums; white-space: nowrap; }

.prail__row--sub .prail__amt { color: var(--ds-color-text-subtle); text-decoration: line-through; }
.prail__row--save { color: var(--ds-color-text-success, #167a4a); font-weight: 700; }
.prail__row--save .prail__amt { color: inherit; }

/* The commit block. A 2px brand rule rather than the 1px hairline the other
   sections use — the foot is a different KIND of thing from the lines above it
   (those explain, this one acts), and the heavier rule is what says so before any
   of the words are read. */
.prail__foot { padding: 16px 20px 20px; border-top: 2px solid var(--ds-color-background-brand-bold, #01113E); background: var(--ds-color-surface-sunken, #f7f8f9); }
.prail__row--total { font-size: 1.5rem; font-weight: 800; }
.prail__per { margin: 2px 0 0; text-align: right; font-size: .8125rem; color: var(--ds-color-text-subtle); }

.prail__cta { margin-top: 14px; }
/* Quiet, and below the CTA: this is the undo, not the exit. Two buttons of equal
   weight pointing opposite ways is how a rail stops having a primary action. */
.prail__reset { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; margin-top: 10px; padding: 8px; border: 0; background: none; font: inherit; font-size: .8125rem; font-weight: 600; color: var(--ds-color-text-subtle); text-decoration: underline; cursor: pointer; }
.prail__reset:hover { color: var(--ds-color-link, #1b4ed8); }
.prail__note { margin: 10px 0 0; font-size: .75rem; color: var(--ds-color-text-subtle); text-align: center; }
</style>
