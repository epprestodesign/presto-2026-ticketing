<script setup>
// Carousel — a scroll-snap track with prev/next arrows and dots, wrapping
// whatever you put in the default slot.
//
// Extracted from HotelAvailability so the behaviour is written once, including
// the two fixes that took a while to find:
//   • the LAST item snaps to `end`, or it can never align to the track's left
//     edge and the browser bounces back, leaving it permanently half-clipped;
//   • arrows appear on MEASURED overflow (ResizeObserver), not on item count —
//     a count says nothing about whether the items actually fit.
// Arrows sit inside the track so an ancestor's `overflow: hidden` can't clip them.
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

defineProps({
  label: { type: String, default: 'items' }, // used in the arrow aria-labels
})

const track = ref(null)
const count = ref(0)
const active = ref(0)
const overflows = ref(false)
const atStart = ref(true)
const atEnd = ref(false)

const step = () => {
  const el = track.value
  if (!el || el.children.length < 2) return el?.children[0]?.offsetWidth || 1
  return el.children[1].offsetLeft - el.children[0].offsetLeft
}
const clamp = (i) => Math.max(0, Math.min(count.value - 1, i))

const measure = () => {
  const el = track.value
  if (!el) return
  count.value = el.children.length
  overflows.value = el.scrollWidth - el.clientWidth > 1
  atStart.value = el.scrollLeft <= 1
  atEnd.value = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1
  active.value = atEnd.value ? Math.max(0, count.value - 1) : clamp(Math.round(el.scrollLeft / step()))
}
const scrollToItem = (i) => track.value?.scrollTo({ left: clamp(i) * step(), behavior: 'smooth' })

let ro = null
onMounted(() => {
  nextTick(measure)
  if (typeof ResizeObserver !== 'undefined' && track.value) {
    ro = new ResizeObserver(measure)
    ro.observe(track.value)
  }
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div class="car">
    <button v-if="overflows" type="button" class="car__nav car__nav--prev" :aria-label="`Previous ${label}`"
      :disabled="atStart" @click="scrollToItem(active - 1)"><q-icon name="chevron_left" size="20px" /></button>

    <div ref="track" class="car__track" @scroll="measure">
      <slot />
    </div>

    <button v-if="overflows" type="button" class="car__nav car__nav--next" :aria-label="`More ${label}`"
      :disabled="atEnd" @click="scrollToItem(active + 1)"><q-icon name="chevron_right" size="20px" /></button>

    <div v-if="overflows" class="car__dots">
      <button v-for="i in count" :key="i" type="button" class="car__dot" :class="{ 'is-on': i - 1 === active }"
        :aria-label="`Go to ${label} ${i}`" :aria-current="i - 1 === active" @click="scrollToItem(i - 1)" />
    </div>
  </div>
</template>

<style scoped>
.car { position: relative; min-width: 0; }
.car__track { display: flex; min-width: 0; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 2px; scrollbar-width: none; }
.car__track::-webkit-scrollbar { display: none; }
.car__track > :deep(*) { scroll-snap-align: start; }
.car__track > :deep(*:last-child) { scroll-snap-align: end; }

.car__nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 3; width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid var(--ds-color-border); border-radius: 50%; background: #fff; color: var(--ds-color-text); cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
.car__nav--prev { left: 4px; }
.car__nav--next { right: 4px; }
.car__nav:disabled { opacity: .35; cursor: default; }

.car__dots { display: flex; justify-content: center; gap: 6px; margin-top: 8px; }
.car__dot { width: 7px; height: 7px; padding: 0; border: 0; border-radius: 50%; background: var(--ds-palette-slate-300, #cbd2d9); cursor: pointer; }
.car__dot.is-on { background: var(--ds-color-background-brand-bold, #0b2545); }
</style>
