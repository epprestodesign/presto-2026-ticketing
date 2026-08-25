<script setup>
// Add-ons — the third entry point, and the one that makes the argument hardest to
// dismiss. A parking pass with no room and no ticket is a legitimate order here:
// it prices, it checks out, and it gets a confirmation of its own.
//
// Every card's stepper is bound straight to the trip, so this screen is also an
// edit screen — the quantities shown are the cart's, changing one changes the
// cart, and stepping to zero removes the line without a trip to the cart to do
// it. That is the same behaviour TripItems gives, deliberately, because "where
// can I change this" should not have one answer.
import { computed } from 'vue'
import EventStrip from '../components/EventStrip.vue'
import AddonCard from '../components/AddonCard.vue'
import { addonQty, setAddonQty, itemsOf, nav } from '../store.js'
import { ADDONS, addonById, money } from '../trip.js'

const chosen = computed(() => itemsOf('addon'))
const chosenTotal = computed(() => chosen.value.reduce((s, i) => s + addonById(i.addonId).price * i.qty, 0))
</script>

<template>
  <div class="as">
    <event-strip note="Extras are their own purchase — none of them needs a room or a ticket." />

    <div class="as__inner">
      <header class="as__head">
        <h2 class="as__title">Add-ons</h2>
        <p class="as__sub">
          Five extras for the weekend. Take any of them on their own, in any quantity —
          the numbers here are the ones in your trip, so changing one changes the trip.
        </p>
      </header>

      <div class="as__grid">
        <addon-card
          v-for="a in ADDONS" :key="a.id"
          :addon="a" :qty="addonQty(a.id)"
          @update:qty="(n) => setAddonQty(a.id, n)"
        />
      </div>

      <!-- A single-item state that reads as finished rather than as half-done:
           it prices what's chosen and offers the two things that could follow. -->
      <footer class="as__foot">
        <div class="as__footinfo">
          <strong v-if="chosen.length">{{ chosen.length }} add-on{{ chosen.length === 1 ? '' : 's' }} · {{ money(chosenTotal) }}</strong>
          <strong v-else>Nothing chosen yet</strong>
          <span>Add-ons alone are a valid trip. So is adding a room or tickets to them.</span>
        </div>
        <div class="as__footacts">
          <button type="button" class="as__alt" @click="nav('stays')">Add a hotel</button>
          <button type="button" class="as__alt" @click="nav('tickets')">Add tickets</button>
          <button type="button" class="as__cta" :disabled="!chosen.length" @click="nav('trip')">
            Go to your trip <q-icon name="arrow_forward" size="17px" />
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.as { display: flex; flex-direction: column; flex: 1; }
.as__inner { width: 100%; max-width: min(1000px, 92%); margin: 0 auto; padding: 26px 0 56px; }
.as__head { margin-bottom: 20px; }
.as__title { margin: 0; font-size: 1.5rem; font-weight: 800; color: var(--ds-color-text); }
.as__sub { margin: 6px 0 0; max-width: 70ch; color: var(--ds-color-text-subtle); }

.as__grid { display: flex; flex-direction: column; gap: 14px; }

.as__foot { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-top: 24px; padding: 18px 20px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg, 12px); background: var(--ds-palette-slate-100, #f1f2f4); }
.as__footinfo { display: flex; flex-direction: column; gap: 2px; }
.as__footinfo strong { font-size: 1.0625rem; color: var(--ds-color-text); }
.as__footinfo span { font-size: .875rem; color: var(--ds-color-text-subtle); }
.as__footacts { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.as__alt { height: 42px; padding: 0 16px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-surface); font: inherit; font-weight: 600; color: var(--ds-color-text); cursor: pointer; }
.as__cta { display: inline-flex; align-items: center; gap: 8px; height: 42px; padding: 0 18px; border: 0; border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.as__cta:disabled { background: var(--ds-palette-slate-200, #e2e4e8); color: var(--ds-color-text-subtlest); cursor: not-allowed; }
</style>
