<script setup>
// Screen 1 — the pre-built packages, which is also the LANDING page.
//
// Three tiles across the range: a value package, the one most groups book, and a
// top-end one. Three rather than Option D's two because the axis being compared
// is different. Option D compared two identical packages that differed only by
// hotel, so a pair was a comparison and a third would have been noise. Here each
// tile is a whole configuration — a ticket level, a hotel, a room, a set of
// extras — and two points don't establish a range. Three do, and the range is
// what tells a guest which end to start customizing from.
//
// There is no stepper above this page — or above any other, as of the Aug 25
// review. See App.vue.
//
// The event strip IS kept here, and only here. This is the landing page, where a
// guest may genuinely not yet know which game they are looking at; by the time
// they reach the customize screen they have opened a package and read its detail
// page, and the strip there was restating an answered question in reverse video
// over the top of the decision. See CustomizeScreen.
//
// The party size is NOT on these cards — see PackageCard for why. The board is
// quoted at a party of four so the three prices mean the same thing.
import { computed } from 'vue'
import EventHeaderBar from '../components/EventHeaderBar.vue'
import PackageCard from '../components/PackageCard.vue'
import { packages, viewPackage, customizePackage, openHotelInNewTab } from '../store.js'
import { STAY_LABEL, STAY_SHORT, DEFAULT_PARTY } from '../packages.js'

const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

// The spread between the cheapest and the dearest tile. Naming it is what turns
// three prices into a range — the point of showing three.
const spread = computed(() => {
  const prices = packages.value.map((p) => p.packagePrice)
  return { low: Math.min(...prices), high: Math.max(...prices) }
})

// The breakdown behind each tile's price is the CARD's business now, opened and
// closed inside it — no dialog, and no open-state on this screen, so two tiles
// can be expanded and read against each other. See PackageCard.
</script>

<template>
  <div class="pkgs">
    <event-header-bar :note="`${STAY_SHORT} · ${STAY_LABEL} — pick a package, then change anything in it.`" />

    <div class="pkgs__inner">
      <header class="pkgs__head">
        <h1 class="pkgs__title">Pick a package to start from</h1>
        <p class="pkgs__sub">
          Three packages we've built for this game, from {{ money(spread.low) }} to
          {{ money(spread.high) }} for a party of {{ DEFAULT_PARTY }}. None of them is final:
          whichever you open, you can swap the ticket level, move hotels, change the room,
          and add or drop extras — and watch the price follow.
        </p>
      </header>

      <div class="pkgs__grid">
        <package-card
          v-for="p in packages" :key="p.id" :pkg="p"
          @view="viewPackage(p.id)" @customize="customizePackage(p.id)"
          @open-hotel="openHotelInNewTab"
        />
      </div>

      <p class="pkgs__foot">
        Prototype pricing. Hotel names open a read-only details page in a new tab, so you keep
        your place here.
      </p>
    </div>
  </div>
</template>

<style scoped>
.pkgs { display: flex; flex-direction: column; flex: 1; }
.pkgs__inner { width: 100%; max-width: min(1280px, 92%); margin: 0 auto; padding: 22px 0 56px; }

.pkgs__head { margin-bottom: 20px; }
.pkgs__title { margin: 0; font-size: 1.5rem; font-weight: 800; color: var(--ds-color-text); }
.pkgs__sub { margin: 6px 0 0; max-width: 72ch; color: var(--ds-color-text-subtle); }

/* A fixed 3-column track, not auto-fit: the three tiles are a range, and auto-fit
   would let them drift to different widths as the viewport changes. */
.pkgs__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; align-items: stretch; }

.pkgs__foot { margin: 26px 0 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }

@media (max-width: 1100px) { .pkgs__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 760px) { .pkgs__grid { grid-template-columns: minmax(0, 1fr); } }
</style>
