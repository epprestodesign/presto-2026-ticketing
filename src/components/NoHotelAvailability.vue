<script setup>
// NoHotelAvailability — empty state for the hotel add-on step when no rooms are
// available for the chosen dates (scope H-08). Clear messaging plus a prominent
// path to continue with tickets only, and a secondary option to change dates so
// the shopper is never dead-ended.
const props = defineProps({
  eventName: { type: String, default: '' },
  dateRange: { type: String, default: '' },
})
const emit = defineEmits(['skip', 'change-dates'])
</script>

<template>
  <section class="nha">
    <span class="nha__icon">
      <q-icon name="hotel" size="30px" />
    </span>
    <h3 class="nha__title">No hotels available for these dates</h3>
    <p class="nha__msg">
      We couldn't find any rooms near
      <strong v-if="eventName">{{ eventName }}</strong><template v-else>the venue</template>
      <template v-if="dateRange"> for {{ dateRange }}</template>.
      You can still grab your tickets now and add a stay later.
    </p>
    <div class="nha__actions">
      <button type="button" class="nha__primary" @click="emit('skip')">
        Continue with tickets only
      </button>
      <button type="button" class="nha__secondary" @click="emit('change-dates')">
        <q-icon name="event" size="16px" />Change dates
      </button>
    </div>
  </section>
</template>

<style scoped>
.nha {
  font-family: var(--ds-font-family);
  display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: var(--ds-space-3);
  background: var(--ds-color-surface); border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-lg); padding: var(--ds-space-6);
  max-width: 440px;
}
.nha__icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 60px; height: 60px; border-radius: var(--ds-radius-pill);
  background: var(--ds-color-background-neutral); color: var(--ds-color-icon-subtle);
}
.nha__title { margin: 0; font-size: var(--ds-font-size-lg); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.nha__msg { margin: 0; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); line-height: 1.5; }
.nha__actions { display: flex; flex-direction: column; align-items: stretch; gap: var(--ds-space-2); width: 100%; margin-top: var(--ds-space-2); }
.nha__primary {
  cursor: pointer; font: inherit; font-weight: var(--ds-font-weight-bold);
  color: var(--ds-color-text-inverse); background: var(--ds-color-background-brand-bold);
  border: 1px solid var(--ds-color-background-brand-bold); border-radius: var(--ds-radius-button);
  padding: 10px 18px;
}
.nha__secondary {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  cursor: pointer; font: inherit; font-weight: var(--ds-font-weight-bold);
  color: var(--ds-color-text); background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button);
  padding: 9px 18px;
}
</style>
