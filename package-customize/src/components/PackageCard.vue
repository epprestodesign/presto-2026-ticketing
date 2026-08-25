<script setup>
// One pre-built package on the browse screen.
//
// --- What it is, and what it isn't -------------------------------------------
// This card sells a package somebody else assembled. It is deliberately NOT a
// configurator: no tier picker, no room list, no extra toggles. Three tiles each
// carrying five controls would turn a browse screen into three half-finished
// customize screens, and the guest would have to build all three to compare them.
//
// So the card states the package as SOLD — its ticket level, its hotel and room,
// its extras — at a fixed party size, and hands the editing to a screen that has
// room for it.
//
// That is the one real departure from Option D's card, which carries the party
// size on the tile because party size is Option D's only variable. Here it is one
// of five, and singling it out on the browse screen would suggest the other four
// are fixed — the opposite of what this prototype is about. The board is priced
// at a party of four (see DEFAULT_PARTY) so the three tiles stay comparable, and
// the number becomes editable on the screen where everything else is.
//
// --- Two ways out ------------------------------------------------------------
// "View package details" leads, because the brief's flow is browse → details →
// customize and the detail page is where "everything included" is spelled out.
// "Customize" sits beside it for a guest who already knows this package and only
// wants to change it — the detail page is a route through, not a toll gate.
//
// --- "Price details" opens IN the card (Aug 25) ------------------------------
// It used to open a `DsModal`. The review: "I never want to have this as a
// pop-up... we almost never are going to want those modal pop-ups, we're always
// going to want a clean page." So the link is now a disclosure and the breakdown
// unfolds between the price and the buttons, a few pixels under the number it is
// explaining — where a dialog used to cover that number up.
//
// The open state is the CARD's, not the board's. A single `openId` on the screen
// would have made the three tiles mutually exclusive, and comparing two
// breakdowns side by side is the one thing a board of three is for; the modal
// couldn't do it at all. The cost is that an open tile grows the grid row — see
// PriceBreakdown for why that trade was taken.
import { computed, ref } from 'vue'
import BundleSavingsBadge from '@lib/components/BundleSavingsBadge.vue'
import PriceBreakdown from './PriceBreakdown.vue'

const props = defineProps({
  pkg: { type: Object, required: true },
})
const emit = defineEmits(['view', 'customize', 'open-hotel'])

const showPrice = ref(false)
const priceContext = computed(() => {
  const p = props.pkg
  return `Priced for ${p.guests} ${p.guests === 1 ? 'person' : 'people'} · ${p.rooms} room${p.rooms === 1 ? '' : 's'} at ${p.hotel.name}`
})

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: props.pkg.currency || 'USD', maximumFractionDigits: 0 }).format(n || 0)

// The card lists what the package HOLDS, capped, with the remainder counted. A
// package with five inclusions and one with two shouldn't produce tiles of wildly
// different heights when the difference between them is a wristband.
const SHOWN = 4
const shown = computed(() => props.pkg.inclusions.slice(0, SHOWN))
const moreCount = computed(() => Math.max(0, props.pkg.inclusions.length - SHOWN))
</script>

<template>
<article class="pc" :class="{ 'pc--featured': pkg.featured }">
  <div class="pc__hero">
    <img v-if="pkg.image" :src="pkg.image" :alt="`${pkg.hotel.name} — ${pkg.room.name}`" loading="lazy" />
    <span v-if="pkg.featured" class="pc__flag">Most booked</span>
  </div>

  <div class="pc__body">
    <p class="pc__theme"><q-icon :name="pkg.icon" size="15px" /> {{ pkg.theme }}</p>
    <h3 class="pc__name">{{ pkg.name }}</h3>
    <p class="pc__tagline">{{ pkg.tagline }}</p>

    <p class="pc__hotel">
      <button type="button" class="pc__hotellink" @click="emit('open-hotel', pkg.hotel.id)">
        {{ pkg.hotel.name }}<q-icon name="open_in_new" size="13px" />
      </button>
      <span class="pc__hotelmeta">
        <q-icon name="star" size="14px" /> {{ pkg.hotel.rating }}
        · {{ pkg.hotel.distanceMi }} mi · {{ pkg.hotel.walkMin }} min walk
      </span>
    </p>

    <ul class="pc__inc">
      <li v-for="i in shown" :key="i.label">
        <q-icon :name="i.icon" size="18px" />
        <span>
          <strong>{{ i.label }}</strong>
          <small>{{ i.note }}</small>
        </span>
      </li>
      <li v-if="moreCount" class="pc__more">
        <q-icon name="add" size="18px" />
        <span><strong>{{ moreCount }} more included</strong></span>
      </li>
    </ul>

    <div class="pc__foot">
      <div class="pc__price">
        <span class="pc__was">{{ money(pkg.componentsTotal) }}</span>
        <strong class="pc__now">{{ money(pkg.packagePrice) }}</strong>
        <small class="pc__per">
          {{ money(pkg.perPerson) }} per person · priced for {{ pkg.guests }}
        </small>
      </div>
      <bundle-savings-badge :amount="pkg.savings" size="sm" />
      <button
        type="button" class="pc__pricelink"
        :aria-expanded="showPrice" :aria-controls="`pc-breakdown-${pkg.id}`"
        @click="showPrice = !showPrice"
      >
        Price details
        <q-icon :name="showPrice ? 'expand_less' : 'expand_more'" size="16px" />
      </button>
    </div>

    <!-- Id keyed by package: three of these cards are on the board at once, and
         `aria-controls` has to point at THIS one. -->
    <div v-if="showPrice" :id="`pc-breakdown-${pkg.id}`" class="pc__breakdown">
      <price-breakdown :priced="pkg" :context="priceContext" />
    </div>

    <div class="pc__actions">
      <q-btn unelevated color="primary" class="pc__cta" label="View package details"
        @click="emit('view', pkg)" />
      <q-btn outline color="primary" class="pc__alt" label="Customize"
        @click="emit('customize', pkg)" />
    </div>
  </div>
</article>
</template>

<style scoped>
.pc { display: flex; flex-direction: column; border: 1px solid var(--ds-color-border); border-radius: 12px; overflow: hidden; background: var(--ds-color-surface, #fff); }
.pc:hover { box-shadow: 0 6px 18px rgba(0, 0, 0, .08); }
.pc--featured { border-color: var(--ds-color-border-brand, #0b2545); box-shadow: 0 0 0 1px var(--ds-color-border-brand, #0b2545) inset; }

.pc__hero { position: relative; height: 170px; flex: none; background: var(--ds-palette-slate-100, #f1f2f4); }
.pc__hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pc__flag { position: absolute; top: 12px; left: 12px; padding: 4px 11px; border-radius: var(--ds-radius-pill, 999px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font-size: .6875rem; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }

.pc__body { display: flex; flex-direction: column; flex: 1; padding: 16px 20px 20px; }
.pc__theme { display: inline-flex; align-items: center; gap: 6px; margin: 0 0 4px; font-size: .75rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.pc__name { margin: 0 0 4px; font-size: 1.25rem; font-weight: 800; color: var(--ds-color-text); }
.pc__tagline { margin: 0 0 10px; font-size: .9375rem; color: var(--ds-color-text-subtle); }

.pc__hotel { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 4px; }
.pc__hotellink { appearance: none; -webkit-appearance: none; display: inline-flex; align-items: center; gap: 4px; padding: 0; border: 0; background: none; font: inherit; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }
.pc__hotelmeta { display: inline-flex; align-items: center; gap: 5px; font-size: .8125rem; color: var(--ds-color-text-subtle); }

.pc__inc { list-style: none; margin: 12px 0 14px; padding: 14px 0 0; border-top: 1px solid var(--ds-color-border); display: flex; flex-direction: column; gap: 11px; }
.pc__inc li { display: flex; align-items: flex-start; gap: 10px; }
.pc__inc li .q-icon { color: var(--ds-color-text-success, #167a4a); margin-top: 1px; flex: none; }
.pc__inc span { display: flex; flex-direction: column; min-width: 0; }
.pc__inc strong { font-size: .9375rem; font-weight: 600; color: var(--ds-color-text); }
.pc__inc small { font-size: .8125rem; color: var(--ds-color-text-subtle); }
.pc__more .q-icon { color: var(--ds-color-text-subtle) !important; }

.pc__foot { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; margin-top: auto; padding-top: 14px; border-top: 1px solid var(--ds-color-border); }
.pc__price { display: flex; flex-direction: column; min-width: 0; }
.pc__was { font-size: .875rem; color: var(--ds-color-text-subtle); text-decoration: line-through; }
.pc__now { font-size: 1.75rem; font-weight: 800; line-height: 1.1; color: var(--ds-color-text); }
.pc__per { font-size: .8125rem; color: var(--ds-color-text-subtle); }
.pc__pricelink { display: inline-flex; align-items: center; gap: 2px; margin-left: auto; padding: 0; border: 0; background: none; font: inherit; font-size: .8125rem; font-weight: 600; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }

/* Tinted rather than bordered: a box with a border inside a bordered card is the
   dialog's frame smuggled back in. The tint says "this belongs to the price above
   it" without drawing a second card. */
.pc__breakdown { margin-top: 12px; padding: 14px 14px 12px; border-radius: var(--ds-radius-md, 8px); background: var(--ds-color-surface-sunken, #f7f8f9); }

.pc__actions { display: flex; align-items: stretch; gap: 10px; padding-top: 14px; }
.pc__cta { flex: 1 1 auto; font-weight: 700; }
.pc__alt { flex: 0 1 auto; font-weight: 600; }

@media (max-width: 760px) {
  .pc__actions { flex-direction: column; }
}
</style>
