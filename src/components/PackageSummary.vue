<script setup>
// PackageSummary — the event summary header for the Package Details page: a
// client-appreciation eyebrow, the event name, and a date · venue meta row.
// Broken out so it can be edited/reviewed on its own.
import { computed } from 'vue'

const props = defineProps({
  event: { type: Object, required: true },
  host: { type: String, default: 'EventPipe' },
  eyebrow: { type: String, default: 'Client Appreciation' },
})

const dateLabel = computed(() => {
  const raw = props.event?.date
  if (!raw) return null
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return String(raw)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
})
const venueLabel = computed(() => {
  const v = props.event?.venue
  if (!v) return null
  const city = v.city?.name || v.city || null
  return [v.name, city].filter(Boolean).join(' · ') || null
})
</script>

<template>
  <header class="psum">
    <p class="psum__eyebrow"><q-icon name="star" size="14px" /> {{ host }} · {{ eyebrow }}</p>
    <h1 class="psum__name">{{ event.name }}</h1>
    <div class="psum__meta">
      <span v-if="dateLabel"><q-icon name="event" size="18px" /> {{ dateLabel }}</span>
      <span v-if="venueLabel"><q-icon name="place" size="18px" /> {{ venueLabel }}</span>
    </div>
  </header>
</template>

<style scoped>
.psum { font-family: var(--ds-font-family); }
.psum__eyebrow { display: inline-flex; align-items: center; gap: 6px; margin: 0 0 10px; padding: 5px 12px; border-radius: var(--ds-radius-pill); background: var(--ds-palette-navy-700); color: #fff; font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold); }
.psum__name { margin: 0; font-size: clamp(1.5rem, 3vw, 2.25rem); line-height: 1.15; font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.psum__meta { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 12px; color: var(--ds-color-text-subtle); font-weight: var(--ds-font-weight-medium); }
.psum__meta span { display: inline-flex; align-items: center; gap: 6px; }
.psum__meta .q-icon { color: var(--ds-color-text); }
</style>
