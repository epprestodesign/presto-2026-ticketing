<script setup>
// Screen 1 — the packages page, which is also the LANDING page.
//
// "Packages page becomes screen 2, with a header and packages visible above the
//  fold. Two tiles side by side only: one per hotel option. Package contents are
//  identical across both; only the hotel differs."
//
// It has since become screen ONE: the separate "how many people are coming?"
// screen is gone. A screen that asks a single question before showing anything is
// a gate; asking it beside the thing it prices is not. There is no stepper here
// either — a progress bar above a landing page is orientation for progress not
// yet made.
//
// The Aug 5 afternoon feedback moved that headcount one step further in — off
// this header and onto the cards themselves (see PackageCard), so the control
// sits directly above the price it changes rather than 400px above two of them.
// It is still one number: both cards read and write the same store value.
//
// The same pass gave the cards a checkout CTA. This page is no longer a lobby
// that only opens doors — a guest who has decided can finish from here, and the
// detail page becomes the optional read rather than a mandatory second stop.
//
// Two consequences worth stating, because they drive the whole layout:
//
//   • TWO tiles, not a grid. With exactly two, side-by-side is a comparison, not
//     a board — so they get a fixed 2-column layout rather than the auto-fit grid
//     Option C uses for six. They collapse to one column only when the viewport
//     genuinely can't hold two.
//
//   • ABOVE THE FOLD. The header is the compact event strip (~90px), not Option
//     C's 300px branded hero. That hero existed for a landing page with nothing
//     else on it; here the landing page IS the pair, so the fold is worth more
//     than the artwork. This is the trade-off Option C left open, settled.
import { computed } from 'vue'
import EventHeaderBar from '../components/EventHeaderBar.vue'
import PackageCard from '../components/PackageCard.vue'
import { packages, journey, viewPackage, selectPackage, openHotelInNewTab, setPeople, MAX_PEOPLE } from '../store.js'
import { STAY_LABEL, STAY_SHORT } from '../packages.js'

// The party size — the only variable in the flow, and now rendered on each card
// rather than once in this header. Both cards bind to this same value, so a
// change on either re-prices both: two controls, one number.
const people = computed(() => journey.people)

// Both packages hold the same inclusions, so the difference between the two
// prices is entirely the hotel. Say so, rather than leaving it to be inferred.
const priceGap = computed(() => {
  const [a, b] = packages.value
  if (!a || !b) return 0
  return Math.abs(a.packagePrice - b.packagePrice)
})
const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)
</script>

<template>
  <div class="pkgs">
    <event-header-bar :note="`${STAY_SHORT} · ${STAY_LABEL} — everything below is already arranged.`" />

    <div class="pkgs__inner">
      <header class="pkgs__head">
        <h1 class="pkgs__title">Choose where you'd like to stay</h1>
        <p class="pkgs__sub">
          Both packages are <strong>identical</strong> — the same tickets, transportation and
          hospitality. The only difference is the hotel, and
          <template v-if="priceGap">{{ money(priceGap) }} in price.</template>
          <template v-else>right now they price the same.</template>
          Set your party size on either card and check out from it.
        </p>
      </header>

      <!-- Exactly two, side by side -->
      <div class="pkgs__pair">
        <package-card
          v-for="p in packages" :key="p.id" :pkg="p"
          :people="people" :max-people="MAX_PEOPLE"
          @update:people="setPeople"
          @select="selectPackage" @view="viewPackage" @open-hotel="openHotelInNewTab"
        />
      </div>

      <p class="pkgs__foot">
        Prototype pricing. Party size is shared — setting it on one card prices both.
        Hotel names open a read-only details page in a new tab, so you keep your place here.
      </p>
    </div>
  </div>
</template>

<style scoped>
.pkgs { display: flex; flex-direction: column; flex: 1; }
.pkgs__inner { width: 100%; max-width: min(1180px, 92%); margin: 0 auto; padding: 22px 0 56px; }

/* No control in the header any more — the party size moved onto the cards, so
   this is a title and a sentence. */
.pkgs__head { margin-bottom: 20px; }
.pkgs__title { margin: 0; font-size: 1.5rem; font-weight: 800; color: var(--ds-color-text); }
.pkgs__sub { margin: 6px 0 0; max-width: 68ch; color: var(--ds-color-text-subtle); }

/* TWO tiles, side by side. A fixed 2-column track rather than auto-fit: with
   exactly two cards this is a comparison, and auto-fit would let them drift to
   different widths as the viewport changes. */
.pkgs__pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; align-items: stretch; }

.pkgs__foot { margin: 26px 0 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }

@media (max-width: 900px) {
  .pkgs__pair { grid-template-columns: minmax(0, 1fr); }
}
</style>
