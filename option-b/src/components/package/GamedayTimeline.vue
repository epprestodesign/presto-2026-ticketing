<script setup>
// GamedayTimeline — the shape of the day, arrival through postgame (Aug 4).
// The dot and the connecting line share one rail offset so they stay aligned.
import { GAMEDAY_TIMELINE } from '../../packageDetail.js'

defineProps({
  steps: { type: Array, default: () => GAMEDAY_TIMELINE },
  title: { type: String, default: 'Your gameday' },
})
</script>

<template>
  <section class="detail">
    <h3 class="pqv__h3">{{ title }}</h3>
    <ol class="tl">
      <li v-for="t in steps" :key="t.time">
        <span class="tl__time">{{ t.time }}</span>
        <span class="tl__body">
          <strong>{{ t.title }}</strong>
          <em>{{ t.text }}</em>
        </span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.detail { margin-top: 32px; padding-top: 26px; border-top: 1px solid var(--ds-color-border); }
.pqv__h3 { margin: 0 0 4px; font-size: 1.375rem; font-weight: 700; }

/* The dot and the connecting line are BOTH positioned against the <li> at the same
   `--tl-rail` offset, so they share one axis. */
.tl { --tl-time: 84px; --tl-gap: 16px; --tl-rail: 100px; --tl-dot: 10px; list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; }
.tl li { display: grid; grid-template-columns: var(--tl-time) minmax(0, 1fr); gap: var(--tl-gap); padding: 0 0 18px; position: relative; }
.tl li::before { content: ''; position: absolute; left: var(--tl-rail); top: 11px; bottom: -11px; width: 1px; background: var(--ds-color-border); }
.tl li::after { content: ''; position: absolute; left: var(--tl-rail); top: 6px; width: var(--tl-dot); height: var(--tl-dot); margin-left: calc(var(--tl-dot) / -2); border-radius: 50%; background: var(--ds-color-background-brand-bold, #0b2545); }
.tl li:last-child { padding-bottom: 0; }
.tl li:last-child::before { display: none; }
.tl__time { font-weight: 700; font-size: .875rem; color: var(--ds-color-text-brand); padding-top: 1px; }
.tl__body { padding-left: 18px; }
.tl__body strong { display: block; }
.tl__body em { display: block; margin-top: 2px; font-style: normal; color: var(--ds-color-text-subtle); font-size: .9375rem; }
</style>
