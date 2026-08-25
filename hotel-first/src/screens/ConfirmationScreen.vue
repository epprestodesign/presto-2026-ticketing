<script setup>
// Stage 5 — Confirmation, read as an ITINERARY rather than a receipt.
//
// The real library ConfirmationPage in `ticketing` mode already stacks the pieces
// this trip needs: a status note, the event meta block, the full hotel reservation
// with its nights, the order components (passes + add-ons), the guarantees, and
// per-section policies. What the data does is make those pieces read as one
// document — three policy groups under three headings, one total, and a status
// note that says plainly which parts confirm now and which arrive separately.
//
// That note is the honest part. A combined checkout is one payment, but it is
// still three fulfilments (hotel, event producer, attraction), and a confirmation
// that implied one email would be setting the guest up to think something failed.
import { computed } from 'vue'
import ConfirmationPage from '@lib/components/confirmation/ConfirmationPage.vue'
import { journey, activeHotel, resetJourney } from '../store.js'
import { buildCart, buildConfirmation } from '../itinerary.js'

const data = computed(() => buildConfirmation(journey, activeHotel.value, buildCart(journey, activeHotel.value)))
</script>

<template>
  <div class="xconf">
    <confirmation-page mode="ticketing" :data="data" />
    <div class="xconf__foot">
      <button type="button" class="xconf__again" @click="resetJourney">
        <q-icon name="restart_alt" size="18px" /> Plan another trip
      </button>
    </div>
  </div>
</template>

<style scoped>
.xconf { display: flex; flex-direction: column; flex: 1; }
.xconf__foot { display: flex; justify-content: center; padding: 8px 24px 48px; }
.xconf__again { display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 22px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button); background: var(--ds-color-surface); color: var(--ds-color-text); font: inherit; font-weight: 700; cursor: pointer; }
.xconf__again:hover { background: var(--ds-color-surface-sunken); }
</style>
