<script setup>
// EventHeaderBar — the compact event strip used on every step after the landing
// page (Option B).
//
// Deliberately short (~90px against the old 200px+ hero) so the content beneath
// — hotel cards, package rows — sits above the fold. Carries the event, the
// party size from the RSVP step, and the stay dates.
import { EVENT_NAME, EVENT_DATE_TIME, EVENT_VENUE, EVENT_LOCATION, STAY_LABEL } from '../event.js'
import { journey } from '../store.js'

defineProps({
  // Optional context line, e.g. which hotel the packages below belong to.
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
        <q-icon name="group" size="18px" />
        {{ journey.guests }} guest{{ journey.guests === 1 ? '' : 's' }} · {{ STAY_LABEL }}
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
