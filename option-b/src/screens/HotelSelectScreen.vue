<script setup>
// Step 2 — Hotel Selection (Option B).
//
// Uses the library's **Browse Hotels → Book Reservation → Core Booking Widget**
// layout: tucked search bar + filter rail + horizontal result cards. Two
// changes make it fit this flow:
//
//   • `count: 2` trims the curated results to the TWO hotels this event holds
//     (their names/rates are patched onto the sample in vite.config.js), and the
//     fallback "no availability" blocks are hidden — this is a working example,
//     not a full search;
//   • the page's own hero is removed in favour of the compact event bar, so both
//     cards clear the fold.
//
// Three ways out of this step. The first two come off each card, routed by the
// App shell's click handler; the third skips the stay entirely:
//   "Choose Your Room" → packages scoped to that hotel
//   the hotel NAME     → that hotel's details page (one room type)
//   "Skip — no hotel"  → packages WITHOUT a stay
import { ref, onMounted, nextTick } from 'vue'
import HotelListPage from '@lib/components/browse/HotelListPage.vue'
import EventHeaderBar from '../components/EventHeaderBar.vue'
import { skipHotel } from '../store.js'

// The skip panel belongs directly under the two hotel cards, not after the whole
// page — the filter rail is far taller than two results, so appending it at the
// end left it stranded at the bottom of the body. Teleport drops it into the
// results column once the library page has rendered.
const mounted = ref(false)
onMounted(() => nextTick(() => { mounted.value = true }))
</script>

<template>
  <div class="xhotels">
    <event-header-bar note="Two hotels are held for this event — pick where you want to stay, or skip the hotel." />
    <hotel-list-page flow="reserve" :show-teams="false" :count="2" />

    <!-- Skip the stay — tickets and experiences only. Rendered into the results
         column so it sits immediately beneath the two hotel cards. -->
    <Teleport v-if="mounted" to=".hlp__results">
      <section class="xhotels__skip">
        <div class="xhotels__skipbody">
          <q-icon name="confirmation_number" size="26px" />
          <div>
            <h3 class="xhotels__skiptitle">Not booking a hotel?</h3>
            <p class="xhotels__skiptext">
              Skip the stay and see the packages that are tickets and experiences only.
            </p>
          </div>
        </div>
        <q-btn unelevated no-caps class="xhotels__skipcta" label="Continue without a hotel" @click="skipHotel" />
      </section>
    </Teleport>
  </div>
</template>

<style scoped>
.xhotels { display: flex; flex-direction: column; flex: 1; }

/* The page's own hero is dropped — the compact event bar above already carries
   the event, and losing 200px puts both hotel cards above the fold. The search
   band is a separate sibling, so it stays. */
.xhotels :deep(.hlp__hero) { display: none !important; }

/* Two hotels only: hide the fallback availability blocks and everything after
   them. The matching cards are the only ones that precede a section heading. */
.xhotels :deep(.hlp__section),
.xhotels :deep(.hlp__section ~ .hlp__card) { display: none !important; }

/* The cards are the point of this step — give them a little more presence. */
.xhotels :deep(.hlp__card) { box-shadow: 0 2px 6px rgba(0,0,0,.05), 0 14px 30px rgba(0,0,0,.09); }
.xhotels :deep(.hc__name) { font-size: 1.5rem; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.xhotels :deep(.hc__name:hover) { color: var(--ds-color-link, #1b4ed8); }
.xhotels :deep(.hc__cta) { height: 52px; padding: 0 26px; font-size: 1rem; }

/* Skip / no hotel — a quiet third option beneath the two cards. */
/* Teleported into the results column, so it spans that column and sits right
   below the last card. Teleported nodes escape scoped styles — hence :global. */
:global(.xhotels__skip) { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin: 4px 0 0; padding: 20px 24px; border: 1px dashed var(--ds-color-border-bold, #9aa3ae); border-radius: 12px; background: var(--ds-color-surface, #fff); }
:global(.xhotels__skipbody) { display: flex; align-items: center; gap: 14px; }
:global(.xhotels__skipbody .q-icon) { color: var(--ds-color-text-brand); }
:global(.xhotels__skiptitle) { margin: 0; font-size: 1.125rem; font-weight: 700; }
:global(.xhotels__skiptext) { margin: 2px 0 0; color: var(--ds-color-text-subtle); }
:global(.xhotels__skipcta) { height: 48px; padding: 0 22px; border: 1px solid var(--ds-color-border-bold, #9aa3ae); font-weight: 700; white-space: nowrap; }
</style>
