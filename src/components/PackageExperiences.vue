<script setup>
// PackageExperiences — the "Signature experiences" grid on the Package Details
// page: the extras that make each package, each tagged with the package theme.
// Broken out so it can be edited/reviewed on its own.
defineProps({
  experiences: { type: Array, default: () => [] }, // [{ icon, label, theme }]
})
</script>

<template>
  <div class="pexp">
    <div v-for="(x, i) in experiences" :key="i" class="pexp__item">
      <q-icon :name="x.icon" size="22px" class="pexp__icon" />
      <div>
        <span class="pexp__label">{{ x.label }}</span>
        <span v-if="x.theme" class="pexp__theme">{{ x.theme }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pexp { font-family: var(--ds-font-family); display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.pexp__item { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); background: var(--ds-color-surface); }
.pexp__icon { color: var(--ds-color-text-brand); flex: none; }
.pexp__label { display: block; font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.pexp__theme { display: block; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); margin-top: 2px; }
</style>
