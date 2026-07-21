<script setup>
// EventHero — the event-page hero banner (scope T-01: "Event page displays event
// name, date, venue, and description"). Renders the event image (or a bundled
// gameday stand-in when the event has none) behind a dark gradient so the white
// title, eyebrow badge, and meta row stay legible. The eyebrow frames this as an
// EventPipe client-appreciation outing hosted for its customers.
import { computed } from 'vue'
import { GAMEDAY_IMAGERY } from '../lib/gamedayImagery.js'

const props = defineProps({
  event: { type: Object, required: true },
  host: { type: String, default: 'EventPipe' },
  eyebrow: { type: String, default: 'Client Appreciation' },
})

// Fallback hero when the event carries no image — a bundled Unsplash stadium shot.
const fallback = GAMEDAY_IMAGERY.find((i) => i.id === 'stadium') || GAMEDAY_IMAGERY[0]

const bg = computed(() => props.event?.image || fallback?.src || null)
const usingFallback = computed(() => !props.event?.image && !!fallback)

const dateLabel = computed(() => {
  const raw = props.event?.date
  if (!raw) return null
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return String(raw)
  const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day} · ${time}`
})

const venueLabel = computed(() => {
  const v = props.event?.venue
  if (!v) return null
  const city = v.city?.name || v.city || null
  return [v.name, city].filter(Boolean).join(' · ') || null
})

const description = computed(() => {
  const c = props.event?.classification
  if (!c) return null
  return [c.segment, c.genre].filter(Boolean).join(' · ') || null
})
</script>

<template>
  <section class="hero" :class="{ 'hero--photo': !!bg }">
    <img v-if="bg" :src="bg" :alt="event.name || 'Event'" class="hero__img" loading="lazy" />
    <div class="hero__scrim" />

    <div class="hero__body">
      <p class="hero__eyebrow">
        <q-icon name="star" size="14px" />
        <span>{{ host }} · {{ eyebrow }}</span>
      </p>

      <h1 class="hero__title">{{ event.name }}</h1>

      <div class="hero__meta">
        <span v-if="dateLabel" class="hero__metaitem">
          <q-icon name="event" size="18px" /> {{ dateLabel }}
        </span>
        <span v-if="venueLabel" class="hero__metaitem">
          <q-icon name="place" size="18px" /> {{ venueLabel }}
        </span>
      </div>

      <p v-if="description" class="hero__desc">{{ description }}</p>
    </div>

    <p v-if="usingFallback" class="hero__credit">
      Photo by
      <a :href="fallback.photographerUrl" target="_blank" rel="noopener">{{ fallback.photographer }}</a>
      on <a :href="fallback.photoUrl" target="_blank" rel="noopener">Unsplash</a>
    </p>
  </section>
</template>

<style scoped>
.hero {
  position: relative; font-family: var(--ds-font-family);
  min-height: 320px; display: flex; align-items: flex-end;
  border-radius: var(--ds-radius-lg); overflow: hidden;
  background: var(--ds-palette-navy-900);
  isolation: isolate;
}
.hero__img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block; z-index: -2;
}
.hero__scrim {
  position: absolute; inset: 0; z-index: -1;
  background:
    linear-gradient(to top, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.42) 46%, rgba(0, 0, 0, 0.12) 100%),
    linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 60%);
}

.hero__body {
  position: relative; width: 100%;
  display: flex; flex-direction: column; gap: var(--ds-space-3);
  padding: var(--ds-space-6) var(--ds-space-5);
}

.hero__eyebrow {
  align-self: flex-start; margin: 0;
  display: inline-flex; align-items: center; gap: var(--ds-space-2);
  padding: 5px 12px; border-radius: var(--ds-radius-pill);
  background: var(--ds-palette-navy-700); color: #fff;
  font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold);
  letter-spacing: 0.02em;
}

.hero__title {
  margin: 0; color: #fff;
  font-size: clamp(1.75rem, 4vw, 2.75rem); line-height: 1.1;
  font-weight: var(--ds-font-weight-bold);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
}

.hero__meta {
  display: flex; flex-wrap: wrap; align-items: center;
  gap: var(--ds-space-2) var(--ds-space-4);
  color: rgba(255, 255, 255, 0.92);
  font-weight: var(--ds-font-weight-medium);
}
.hero__metaitem { display: inline-flex; align-items: center; gap: 6px; }

.hero__desc {
  margin: 0; color: rgba(255, 255, 255, 0.78);
  font-size: var(--ds-font-size-sm);
}

.hero__credit {
  position: absolute; right: var(--ds-space-3); top: var(--ds-space-3); margin: 0;
  font-size: 11px; color: rgba(255, 255, 255, 0.72);
}
.hero__credit a { color: rgba(255, 255, 255, 0.92); }

@media (max-width: 600px) {
  .hero__body { padding: var(--ds-space-5) var(--ds-space-4); }
}
</style>
