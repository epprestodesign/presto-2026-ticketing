<script setup>
// PackageInclusions — what's included, itemised with real detail rather than a
// bare label list (Aug 4).
defineProps({
  items: { type: Array, default: () => [] },   // inclusionsFor(pkg)
  title: { type: String, default: "What's included" },
})
</script>

<template>
  <section class="detail">
    <h3 class="pqv__h3">{{ title }}</h3>
    <ul class="incl">
      <li v-for="i in items" :key="i.title">
        <q-icon :name="i.icon" size="22px" />
        <span>
          <strong>{{ i.title }}</strong>
          <em>{{ i.text }}</em>
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.detail { margin-top: 32px; padding-top: 26px; border-top: 1px solid var(--ds-color-border); }
.incl { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
.incl li { display: grid; grid-template-columns: 26px minmax(0, 1fr); gap: 14px; align-items: start; }
.incl .q-icon { color: var(--ds-color-text-brand); margin-top: 2px; }
.incl strong { display: block; }
.incl em { display: block; margin-top: 2px; font-style: normal; color: var(--ds-color-text-subtle); font-size: .9375rem; }
.pqv__h3 { margin: 0 0 4px; font-size: 1.375rem; font-weight: 700; }
</style>
