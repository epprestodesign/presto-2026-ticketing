<script setup>
// Landing — three doors, no corridor.
//
// The /experience prototype this was forked from opened on the library's
// LandingPage: a hero with a booking widget, whose Search button was the only way
// forward and put hotels first by construction. That widget is gone. A search
// band asks "where are you staying", which is the wrong first question for a
// guest who came for tickets and may never book a room at all.
//
// What replaces it is the three entry points, rendered the same size in one row.
// None of them is styled as the recommended one, because the claim being made is
// that all three are equally valid starts — and a page that says so while making
// one tile bigger isn't saying it.
//
// This page is also the RE-ENTRY point: the wordmark comes back here, and if a
// trip is already being built, it says what's in it and offers to carry on rather
// than pretending this is the beginning.
import { computed } from 'vue'
import EventStrip from '../components/EventStrip.vue'
import EntryCard from '../components/EntryCard.vue'
import { ENTRIES, isEmpty, itemsOf, totals, count, nav } from '../store.js'
import { STAYS, TIERS, ADDONS, money } from '../trip.js'

// "From" prices, so a door says what's behind it before anyone opens it.
const from = {
  stay: `from ${money(Math.min(...STAYS.map((s) => s.nightlyRate)))} a night`,
  ticket: `from ${money(Math.min(...TIERS.map((t) => t.price)))} a ticket`,
  addon: `from ${money(Math.min(...ADDONS.map((a) => a.price)))}`,
}

const COPY = {
  stay: { headline: 'A room near the venue', blurb: 'Four contracted properties inside two miles of Gillette. Pick the room and the nights; tickets are a separate decision.' },
  ticket: { headline: 'Seats for the game', blurb: 'Four tiers, priced per ticket. Buy them on their own and stop there, or add a room to the same trip later.' },
  addon: { headline: 'Parking, shuttle, tailgate', blurb: 'Extras that stand alone. A parking pass with no room and no ticket is a real order, not an accessory.' },
}

// What each category already holds — the landing page is somewhere guests come
// back to, and coming back to a door you already walked through should show it.
const inTrip = computed(() => {
  const stay = itemsOf('stay')[0]
  const tickets = itemsOf('ticket').reduce((s, i) => s + i.qty, 0)
  const addons = itemsOf('addon').reduce((s, i) => s + i.qty, 0)
  return {
    stay: stay ? `${stay.nights} night${stay.nights === 1 ? '' : 's'} in your trip` : '',
    ticket: tickets ? `${tickets} ticket${tickets === 1 ? '' : 's'} in your trip` : '',
    addon: addons ? `${addons} add-on${addons === 1 ? '' : 's'} in your trip` : '',
  }
})
</script>

<template>
  <div class="ls">
    <event-strip note="Build the trip you actually want — hotel, tickets and extras are sold separately." />

    <div class="ls__inner">
      <header class="ls__head">
        <h2 class="ls__title">Start anywhere.</h2>
        <p class="ls__sub">
          There is no step one. Add a hotel, tickets or an add-on in any order, change your mind
          about any of them, and check out with whatever you end up with — even if that's one item.
        </p>
      </header>

      <div class="ls__entries">
        <entry-card
          v-for="e in ENTRIES" :key="e.kind" :entry="e"
          :headline="COPY[e.kind].headline" :blurb="COPY[e.kind].blurb"
          :from="from[e.kind]" :in-trip="inTrip[e.kind]"
          @open="(entry) => nav(entry.screen)"
        />
      </div>

      <!-- Re-entry. Not a fourth door: it only appears once there is something to
           come back to, and it names the contents rather than saying "resume". -->
      <section v-if="!isEmpty" class="ls__resume">
        <div>
          <h3 class="ls__resumeh">You have a trip in progress</h3>
          <p class="ls__resumep">
            {{ count }} item{{ count === 1 ? '' : 's' }} · {{ money(totals.total) }} —
            nothing expires, and nothing in it depends on anything else.
          </p>
        </div>
        <button type="button" class="ls__resumecta" @click="nav('trip')">
          Open your trip <q-icon name="arrow_forward" size="17px" />
        </button>
      </section>

      <p class="ls__foot">
        Prototype pricing. The one thing that isn't optional is the event itself —
        everything above is for the same game, on the same weekend.
      </p>
    </div>
  </div>
</template>

<style scoped>
.ls { display: flex; flex-direction: column; flex: 1; }
.ls__inner { width: 100%; max-width: min(1180px, 92%); margin: 0 auto; padding: 30px 0 56px; }

.ls__head { margin-bottom: 24px; }
.ls__title { margin: 0; font-size: 1.75rem; font-weight: 800; color: var(--ds-color-text); }
.ls__sub { margin: 8px 0 0; max-width: 70ch; color: var(--ds-color-text-subtle); }

/* Three equal columns — equal width is the argument, so they collapse together
   rather than one at a time. */
.ls__entries { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; align-items: stretch; }

.ls__resume { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-top: 26px; padding: 20px 22px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg, 12px); background: var(--ds-palette-slate-100, #f1f2f4); }
.ls__resumeh { margin: 0; font-size: 1.0625rem; font-weight: 800; color: var(--ds-color-text); }
.ls__resumep { margin: 4px 0 0; font-size: .9375rem; color: var(--ds-color-text-subtle); }
.ls__resumecta { display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 20px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-surface); font: inherit; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }

.ls__foot { margin: 26px 0 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }

@media (max-width: 900px) { .ls__entries { grid-template-columns: minmax(0, 1fr); } }
</style>
