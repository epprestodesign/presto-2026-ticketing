<script setup>
// EntryCard — one of the landing page's three ways in.
//
// The three are rendered identically on purpose: same height, same weight, same
// button, no "recommended" badge and no visual ordering beyond left-to-right.
// The moment one of them looks like the primary route, the page is back to being
// a funnel with two side doors, which is the arrangement this prototype was built
// to argue against.
//
// Each card states what it already holds ("2 tickets in your trip") because the
// landing page is also the place a guest comes BACK to — these are entry points,
// not a first step, and re-entering an entry point has to be legible.
defineProps({
  entry: { type: Object, required: true },   // { kind, screen, icon, label }
  headline: { type: String, required: true },
  blurb: { type: String, required: true },
  from: { type: String, default: '' },       // "from $179 a night"
  inTrip: { type: String, default: '' },     // what this category already holds
})
const emit = defineEmits(['open'])
</script>

<template>
  <article class="ec">
    <span class="ec__icon"><q-icon :name="entry.icon" size="26px" /></span>
    <h2 class="ec__title">{{ headline }}</h2>
    <p class="ec__blurb">{{ blurb }}</p>
    <p v-if="from" class="ec__from">{{ from }}</p>
    <p v-if="inTrip" class="ec__in"><q-icon name="check_circle" size="16px" /> {{ inTrip }}</p>
    <button type="button" class="ec__cta" @click="emit('open', entry)">
      {{ inTrip ? 'Add more' : entry.label }} <q-icon name="arrow_forward" size="17px" />
    </button>
  </article>
</template>

<style scoped>
.ec { display: flex; flex-direction: column; gap: 8px; padding: 24px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg, 12px); background: var(--ds-color-surface); font-family: var(--ds-font-family); }
.ec:hover { box-shadow: 0 6px 18px rgba(0,0,0,.08); }
.ec__icon { display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 50%; background: var(--ds-palette-slate-100, #f1f2f4); color: var(--ds-color-background-brand-bold, #01113E); }
.ec__title { margin: 6px 0 0; font-size: 1.25rem; font-weight: 800; color: var(--ds-color-text); }
.ec__blurb { margin: 0; font-size: .9375rem; color: var(--ds-color-text-subtle); }
.ec__from { margin: 0; font-size: .9375rem; font-weight: 700; color: var(--ds-color-text); }
.ec__in { display: inline-flex; align-items: center; gap: 6px; margin: 0; font-size: .875rem; font-weight: 600; color: var(--ds-color-text-success, #167a4a); }
.ec__cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 46px; margin-top: auto; border: 0; border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
</style>
