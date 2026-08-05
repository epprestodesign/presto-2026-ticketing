<script setup>
// EventHeaderBar — the compact event strip above the package pair.
//
// The only header in Option D. The Aug 5 feedback asks for the packages page to
// show "a header and packages visible above the fold", and this is ~90px against
// the 300px branded hero Option C leads with — which is what buys the fold.
//
// Option C's hero is not carried over: it existed for a landing page that had
// nothing else on it, and Option D's landing page IS the package pair.
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
