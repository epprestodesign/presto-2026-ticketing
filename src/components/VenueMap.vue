<script setup>
// VenueMap — a Google-Maps-style interactive seating map built on the REAL
// Gillette Stadium vector map (bundled locally at src/assets/venue/…svg, so
// there's no dependency on Ticketmaster's anti-bot-protected live endpoint).
//
// Pan (drag + flick momentum), zoom (wheel / buttons), and clickable price pins
// overlaid like map markers. Pricing + inventory are PROTOTYPE / hypothetical —
// Ticketmaster's map feed carries the geometry only, not per-seat listings.
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

// The interactive layer uses a high-res RASTER of the map: browsers re-rasterize
// SVGs on every zoom step (janky), but GPU-scale raster images smoothly. The
// vector source (…/gillette-stadium.svg) stays bundled as the source of truth.
const DEFAULT_MAP = new URL('../assets/venue/gillette-stadium.png', import.meta.url).href

const props = defineProps({
  mapSrc: { type: String, default: null },
  pins: { type: Array, default: () => [] },     // { id, label, x%, y%, price, colorVar, available, tierName }
  aspect: { type: Number, default: 768 / 1024 }, // Gillette SVG ratio
  modelValue: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue', 'select'])

const src = computed(() => props.mapSrc || DEFAULT_MAP)
const viewport = ref(null)
const vw = ref(800)
const worldH = computed(() => vw.value * props.aspect)
const view = reactive({ scale: 1, tx: 0, ty: 0 })
const MIN = 1, MAX = 6
const animate = ref(false) // smooth transition for button zoom only (not drag/wheel)

let ro
onMounted(() => {
  const measure = () => { if (viewport.value) vw.value = viewport.value.clientWidth }
  measure()
  ro = new ResizeObserver(measure)
  ro.observe(viewport.value)
})
onBeforeUnmount(() => ro && ro.disconnect())

function clampPan() {
  const sw = vw.value * view.scale, sh = worldH.value * view.scale
  view.tx = Math.min(0, Math.max(Math.min(0, vw.value - sw), view.tx))
  view.ty = Math.min(0, Math.max(Math.min(0, worldH.value - sh), view.ty))
}
function zoomAt(cx, cy, factor) {
  const ns = Math.min(MAX, Math.max(MIN, view.scale * factor))
  const k = ns / view.scale
  view.tx = cx - (cx - view.tx) * k
  view.ty = cy - (cy - view.ty) * k
  view.scale = ns
  clampPan()
}
function onWheel(e) {
  e.preventDefault()
  animate.value = false
  const r = viewport.value.getBoundingClientRect()
  zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.15 : 1 / 1.15)
}
let animTimer
function zoomBtn(f) {
  animate.value = true
  zoomAt(vw.value / 2, worldH.value / 2, f)
  clearTimeout(animTimer)
  animTimer = setTimeout(() => { animate.value = false }, 200)
}
function reset() { animate.value = true; view.scale = 1; view.tx = 0; view.ty = 0; clearTimeout(animTimer); animTimer = setTimeout(() => { animate.value = false }, 200) }

// Drag-pan with flick momentum.
let dragging = false, lastX = 0, lastY = 0, vX = 0, vY = 0, lastT = 0, raf = 0
function onDown(e) {
  dragging = true; animate.value = false; lastX = e.clientX; lastY = e.clientY; lastT = performance.now(); vX = vY = 0
  cancelAnimationFrame(raf)
  viewport.value.setPointerCapture?.(e.pointerId)
}
function onMove(e) {
  if (!dragging) return
  const now = performance.now(), dt = Math.max(1, now - lastT)
  const dx = e.clientX - lastX, dy = e.clientY - lastY
  vX = dx / dt; vY = dy / dt
  view.tx += dx; view.ty += dy
  lastX = e.clientX; lastY = e.clientY; lastT = now
  clampPan()
}
function onUp() {
  if (!dragging) return
  dragging = false
  if (Math.hypot(vX, vY) > 0.06) {
    const step = () => {
      vX *= 0.93; vY *= 0.93
      view.tx += vX * 16; view.ty += vY * 16
      clampPan()
      if (Math.hypot(vX, vY) > 0.02) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
  }
}

const selected = computed(() => props.pins.find((p) => p.id === props.modelValue) || null)
function pick(pin) {
  if (!pin.available) return
  emit('update:modelValue', pin.id)
  emit('select', pin)
}
function fmt(n, c = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <div class="vmap">
    <div
      ref="viewport" class="vmap__viewport" :class="{ 'is-dragging': false }"
      @wheel="onWheel" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp"
    >
      <div class="vmap__world" :class="{ 'is-animating': animate }" :style="{ width: vw + 'px', height: worldH + 'px', transform: `translate3d(${view.tx}px, ${view.ty}px, 0) scale(${view.scale})` }">
        <img :src="src" class="vmap__img" draggable="false" alt="Gillette Stadium seating map" />
        <button
          v-for="p in pins" :key="p.id"
          class="vmap__pin" :class="{ 'is-selected': p.id === modelValue, 'is-out': !p.available }"
          :style="{ left: p.x + '%', top: p.y + '%', '--pin': `var(${p.colorVar})`, transform: `translate(-50%, -100%) scale(${1 / view.scale})` }"
          :aria-label="`Section ${p.label}, ${p.available ? fmt(p.price, p.currency) : 'unavailable'}`"
          @pointerdown.stop @click.stop="pick(p)"
        >
          <span v-if="p.available">{{ fmt(p.price, p.currency) }}</span>
          <q-icon v-else name="close" size="12px" />
        </button>
      </div>

      <div class="vmap__controls">
        <button type="button" aria-label="Zoom in" @click="zoomBtn(1.35)">+</button>
        <button type="button" aria-label="Zoom out" @click="zoomBtn(1 / 1.35)">−</button>
        <button type="button" aria-label="Reset view" @click="reset"><q-icon name="center_focus_strong" size="16px" /></button>
      </div>
    </div>

    <div class="vmap__readout" aria-live="polite">
      <template v-if="selected">
        <span class="vmap__swatch" :style="{ background: `var(${selected.colorVar})` }" />
        <strong>Section {{ selected.label }}</strong>
        <span class="vmap__tier">· {{ selected.tierName }}</span>
        <span class="vmap__price">{{ fmt(selected.price, selected.currency) }}</span>
      </template>
      <span v-else class="vmap__hint">Drag to pan · scroll to zoom · tap a price to preview a seat</span>
    </div>

    <p class="vmap__note">
      Real Gillette Stadium map (Ticketmaster) · <em>hypothetical</em> prototype pricing &amp; inventory.
    </p>
  </div>
</template>

<style scoped>
.vmap { font-family: var(--ds-font-family); display: flex; flex-direction: column; gap: var(--ds-space-2); }
.vmap__viewport {
  position: relative; overflow: hidden; border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-lg); background: var(--ds-color-surface-sunken);
  touch-action: none; cursor: grab; user-select: none; aspect-ratio: 1024 / 768;
}
.vmap__viewport:active { cursor: grabbing; }
.vmap__world { position: absolute; top: 0; left: 0; transform-origin: 0 0; will-change: transform; backface-visibility: hidden; }
.vmap__world.is-animating { transition: transform 0.16s cubic-bezier(0.22, 0.61, 0.36, 1); }
.vmap__img { width: 100%; height: 100%; display: block; pointer-events: none; -webkit-user-drag: none; }

.vmap__pin {
  position: absolute; transform-origin: 50% 100%;
  display: inline-flex; align-items: center; gap: 2px; white-space: nowrap;
  background: var(--pin); color: #fff; border: 1.5px solid #fff;
  font-family: inherit; font-size: 12px; font-weight: var(--ds-font-weight-bold);
  padding: 3px 8px; border-radius: var(--ds-radius-pill); cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35); line-height: 1;
}
.vmap__pin::after {
  content: ''; position: absolute; left: 50%; bottom: -4px; width: 7px; height: 7px;
  background: var(--pin); transform: translateX(-50%) rotate(45deg); border-right: 1.5px solid #fff; border-bottom: 1.5px solid #fff;
}
.vmap__pin:hover { filter: brightness(1.06); z-index: 5; }
.vmap__pin.is-selected { z-index: 6; outline: 2px solid var(--ds-color-text); outline-offset: 1px; }
.vmap__pin.is-out { background: var(--ds-palette-gray-500); cursor: not-allowed; opacity: 0.85; }
.vmap__pin.is-out::after { background: var(--ds-palette-gray-500); }

.vmap__controls { position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column; gap: 4px; }
.vmap__controls button {
  width: 32px; height: 32px; border-radius: var(--ds-radius-button); cursor: pointer;
  border: 1px solid var(--ds-color-border); background: var(--ds-color-surface);
  color: var(--ds-color-text); font-size: 18px; line-height: 1; display: flex; align-items: center; justify-content: center;
  box-shadow: var(--ds-shadow-1, 0 1px 3px rgba(0,0,0,.15));
}
.vmap__controls button:hover { background: var(--ds-color-surface-sunken); }

.vmap__readout { display: flex; align-items: center; gap: var(--ds-space-2); min-height: 24px; font-size: var(--ds-font-size-sm); color: var(--ds-color-text); }
.vmap__tier { color: var(--ds-color-text-subtle); }
.vmap__price { margin-left: auto; font-weight: var(--ds-font-weight-bold); }
.vmap__hint { color: var(--ds-color-text-subtlest); }
.vmap__swatch { width: 12px; height: 12px; border-radius: var(--ds-radius-sm); flex: none; }
.vmap__note { margin: 0; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtlest); }
</style>
