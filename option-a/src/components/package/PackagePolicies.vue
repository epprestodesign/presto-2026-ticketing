<script setup>
// PackagePolicies — the "Good to know" accordion (Aug 4). Native <details>, so it
// works without JS and stays keyboard-accessible.
import { PACKAGE_POLICIES } from '../../packageDetail.js'

defineProps({
  items: { type: Array, default: () => PACKAGE_POLICIES },
  title: { type: String, default: 'Good to know' },
})
</script>

<template>
  <section class="detail">
    <h3 class="pqv__h3">{{ title }}</h3>
    <div class="faq">
      <details v-for="pol in items" :key="pol.title">
        <summary>{{ pol.title }}</summary>
        <p>{{ pol.body }}</p>
      </details>
    </div>
  </section>
</template>

<style scoped>
.detail { margin-top: 32px; padding-top: 26px; border-top: 1px solid var(--ds-color-border); }
.faq { margin-top: 10px; border-top: 1px solid var(--ds-color-border); }
.faq details { border-bottom: 1px solid var(--ds-color-border); }
.faq summary { padding: 14px 0; font-weight: 600; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.faq summary::-webkit-details-marker { display: none; }
.faq summary::after { content: '+'; font-size: 1.25rem; color: var(--ds-color-text-subtle); }
.faq details[open] summary::after { content: '−'; }
.faq p { margin: 0 0 16px; color: var(--ds-color-text-subtle); }
.pqv__h3 { margin: 0 0 4px; font-size: 1.375rem; font-weight: 700; }
</style>
