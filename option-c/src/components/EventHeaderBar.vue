<script setup>
// EventHeaderBar — the compact event strip, carried over from Option B.
//
// NOT currently mounted by the board: PackageGridScreen renders EventHero
// instead. This is kept, and documented in Storybook, because the two are the
// ends of a real trade-off the Aug 4 feedback puts in tension —
//
//   EventHero        300px, branded artwork + wordmark; first tile row sits just
//                    below the fold on a laptop
//   EventHeaderBar   ~90px, no artwork; the first row clears the fold comfortably
//
// The feedback asks for "packages just below the header, visible without
// scrolling", which argues for this strip; the branded hero was asked for
// separately. Swapping them is a one-line change in PackageGridScreen.vue.
import { EVENT_NAME, EVENT_DATE_TIME, EVENT_VENUE, EVENT_LOCATION, STAY_LABEL } from '../event.js'

defineProps({
  // Optional context line under the event — what the board below is offering.
  note: { type: String, default: '' },
})
</script>

<template>
  <header class="ehb">
    <div class="ehb__inner">
      <div class="ehb__event">
        <h1 class="ehb__title">{{ EVENT_NAME }}</h1>
        <p class="ehb__meta">{{ EVENT_DATE_TIME }} · {{ EVENT_VENUE }}, {{ EVENT_LOCATION }}</p>
        <p v-if="note" class="ehb__note">{{ note }}</p>
      </div>
      <div class="ehb__party">
        <q-icon name="hotel" size="18px" />
        {{ STAY_LABEL }}
      </div>
    </div>
  </header>
</template>

<style scoped>
.ehb { background: var(--ds-color-background-brand-bold, #01113E); color: #fff; }
.ehb__inner { max-width: min(1440px, 92%); margin: 0 auto; padding: 18px 0; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.ehb__title { margin: 0; font-size: 1.375rem; font-weight: 700; line-height: 1.2; }
.ehb__meta { margin: 2px 0 0; font-size: .9375rem; opacity: .85; }
.ehb__note { margin: 4px 0 0; font-size: .9375rem; font-weight: 600; }
.ehb__party { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; background: rgba(255,255,255,.12); font-size: .9375rem; font-weight: 600; white-space: nowrap; }
</style>
