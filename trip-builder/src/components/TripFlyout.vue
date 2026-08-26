<script setup>
// TripFlyout — the cart PEEK: a slide-over glance at the trip, opened from the
// nav's cart icon, with the full /trip page one press behind it.
//
// ── THIS OVERLAY'S RETURN IS DELIBERATE. DO NOT DELETE IT AGAIN. ──
// This file was removed on Aug 25 (commit 469259f) on a stakeholder note — "I
// never want to have this as a pop-up … we're always going to want a clean
// page" — and the cart moved onto the /trip page. That page is still here and
// still the cart's only address. What the next review asked for is the pair:
// a peek in the nav that opens over whatever you are reading, and the full page
// behind it. So the deletion in the history is NOT the correct end state, and
// the git log alone would suggest otherwise. This is the reversal, scoped:
//
//   • THE CART PEEK IS THE ONLY SANCTIONED OVERLAY IN THIS PROTOTYPE. The rest
//     of the Aug 25 round holds. Picking a hotel still opens the HotelDetailPage
//     SCREEN, not StayEditDialog; browsing is still the full Browse Hotels page;
//     no other DsModal or DsSidePanel comes back. If a second overlay ever turns
//     up in this app, it is a mistake — this one is the exception with a reason.
//
//   • The peek is a VIEW OF THE PAGE, not a copy of it. Its body is TripItems,
//     the same component /trip mounts, in its tighter `peek` variant. One cart
//     body, two frames: the two cannot drift, because there is only one of them.
//     A second, "simpler" summary component was the obvious way to make the peek
//     compact and is exactly how the two surfaces would have ended up disagreeing
//     about what a line says.
//
// WHY NOT the library's own CartFlyout, which GlobalNav's cart button opens by
// default: its body is CartReview, which cannot remove a line and keys its
// quantities by array index (stale the moment one is spliced out), and its footer
// runs a hold countdown. A trip you are invited to keep editing can't also be
// expiring — nothing here is held until checkout, where the library's timer takes
// over correctly. DsSidePanel is the part of CartFlyout worth reusing, and the
// library already factored it out.
import { computed } from 'vue'
import DsSidePanel from '@lib/components/DsSidePanel.vue'
import TripItems from './TripItems.vue'
import TripTotals from './TripTotals.vue'
import { trip, peek, count, isEmpty, closePeek, nav } from '../store.js'

const summary = computed(() => `${count.value} item${count.value === 1 ? '' : 's'}`)
// Already on checkout, "Checkout" would point at the page underneath the scrim.
const onCheckout = computed(() => trip.screen === 'checkout')
</script>

<template>
  <ds-side-panel
    :model-value="peek.open" title="Your trip" width="520px"
    @update:model-value="!$event && closePeek()"
  >
    <template v-if="!isEmpty" #header-end>
      <span class="tf__count">{{ summary }}</span>
    </template>

    <trip-items variant="peek" />

    <!-- An empty peek has no total and no order to place, so it gets no footer —
         TripItems' own empty state already offers the three doors, and each of
         them navigates, which closes the peek on the way out. -->
    <template v-if="!isEmpty" #footer>
      <div class="tf__foot">
        <trip-totals compact />
        <p class="tf__hint">Changed here, changed everywhere — the trip page and checkout read the same lines.</p>
        <!-- Both ways forward, side by side and equally weighted. The page is
             the one thing a peek must never be a dead end in front of, and the
             checkout is what the guest came to do; promoting either one over the
             other would make the other look like the accident. -->
        <div class="tf__actions">
          <button type="button" class="tf__alt" @click="nav('trip')">
            View full trip <q-icon name="arrow_forward" size="16px" />
          </button>
          <button v-if="!onCheckout" type="button" class="tf__cta" @click="nav('checkout')">Checkout</button>
        </div>
      </div>
    </template>
  </ds-side-panel>
</template>

<style scoped>
.tf__count { font-size: .8125rem; font-weight: 700; color: var(--ds-color-text-subtle); }
.tf__foot { display: flex; flex-direction: column; gap: 10px; font-family: var(--ds-font-family); }
.tf__hint { margin: 0; font-size: .75rem; color: var(--ds-color-text-subtle); }
.tf__actions { display: flex; gap: 10px; }
.tf__cta { flex: 1; height: 48px; border: 0; border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font: inherit; font-weight: 700; font-size: 1rem; cursor: pointer; }
.tf__alt { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 48px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-surface); font: inherit; font-weight: 700; font-size: 1rem; color: var(--ds-color-text); cursor: pointer; }
.tf__alt:hover { background: var(--ds-palette-slate-100, #f1f2f4); }
</style>
