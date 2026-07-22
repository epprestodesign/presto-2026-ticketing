<script setup>
// VenueMap — a Google-Maps-style interactive seating map built on the REAL
// Gillette Stadium vector map (bundled locally at src/assets/venue/…svg, so
// there's no dependency on Ticketmaster's anti-bot-protected live endpoint).
//
// Pan (drag + flick momentum), zoom (wheel / buttons), and clickable price pins
// overlaid like map markers. Pricing + inventory are PROTOTYPE / hypothetical —
// Ticketmaster's map feed carries the geometry only, not per-seat listings.
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'

// The interactive layer uses a high-res RASTER of the map: browsers re-rasterize
// SVGs on every zoom step (janky), but GPU-scale raster images smoothly. The
// vector source (…/gillette-stadium.svg) stays bundled as the source of truth.
const DEFAULT_MAP = new URL('../assets/venue/gillette-stadium.png', import.meta.url).href

const props = defineProps({
  mapSrc: { type: String, default: null },
  pins: { type: Array, default: () => [] },     // { id, label, x%, y%, price, colorVar, available, tierName }
  aspect: { type: Number, default: 768 / 1024 }, // Gillette SVG ratio
  modelValue: { type: String, default: null },
  // Fill the parent's height (the map covers its container) instead of sizing to
  // the fixed aspect ratio. Used by the full-height Ticket Map.
  fill: { type: Boolean, default: false },
  // Initial zoom multiplier applied on load (e.g. 1.8 = zoomed in a couple steps).
  initialScale: { type: Number, default: 1 },
  // When set, the map animates to center + zoom on the pin with this id (driven
  // by the selected listing, so picking a seat in the rail focuses its pin).
  focusId: { type: String, default: null },
  // Zoom level used when focusing a pin (kept if already zoomed in further).
  focusScale: { type: Number, default: 3.2 },
})
const emit = defineEmits(['update:modelValue', 'select'])

const src = computed(() => props.mapSrc || DEFAULT_MAP)
const viewport = ref(null)
const vw = ref(800)
const vh = ref(600)
const worldH = computed(() => vw.value * props.aspect)
// The visible viewport height: its own measured height in fill mode, else the
// map's natural (aspect-based) height.
const containerH = () => (props.fill ? vh.value : worldH.value)
const view = reactive({ scale: 1, tx: 0, ty: 0 })
const MIN = 1, MAX = 6
const animate = ref(false) // smooth transition for button zoom only (not drag/wheel)

let ro, didInit = false
onMounted(() => {
  const measure = () => {
    if (!viewport.value) return
    vw.value = viewport.value.clientWidth
    vh.value = viewport.value.clientHeight
    if (!didInit && vw.value > 0 && vh.value > 0) { didInit = true; initView() }
  }
  measure()
  ro = new ResizeObserver(measure)
  ro.observe(viewport.value)
})
onBeforeUnmount(() => ro && ro.disconnect())

// Initial view: honour `initialScale`, and in fill mode also cover the viewport.
function initView() {
  const cover = props.fill ? Math.max(1, vh.value / worldH.value) : 1
  view.scale = Math.min(MAX, Math.max(MIN, (props.initialScale || 1) * cover))
  centerView()
}
function centerView() {
  view.tx = (vw.value - vw.value * view.scale) / 2
  view.ty = (containerH() - worldH.value * view.scale) / 2
  clampPan()
}

function clampPan() {
  const sw = vw.value * view.scale, sh = worldH.value * view.scale
  view.tx = Math.min(0, Math.max(Math.min(0, vw.value - sw), view.tx))
  view.ty = Math.min(0, Math.max(Math.min(0, containerH() - sh), view.ty))
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
  // Gentle, proportional zoom (eased) so scroll/trackpad don't rocket in/out.
  const factor = Math.min(1.12, Math.max(0.89, Math.exp(-e.deltaY * 0.0011)))
  zoomAt(e.clientX - r.left, e.clientY - r.top, factor)
}
let animTimer
function zoomBtn(f) {
  animate.value = true
  // Zoom about the true centre of the visible viewport (not the world), so the
  // +/- buttons keep the focus point steady instead of drifting.
  zoomAt(vw.value / 2, containerH() / 2, f)
  clearTimeout(animTimer)
  animTimer = setTimeout(() => { animate.value = false }, 180)
}
function reset() { animate.value = true; initView(); clearTimeout(animTimer); animTimer = setTimeout(() => { animate.value = false }, 180) }

// Smoothly center + zoom on a pin (its x/y are % of the map). Zooms in to
// `focusScale`, keeping a deeper manual zoom if the user is already closer in.
function focusPin(pin) {
  if (!pin || !vw.value) return
  const worldX = (pin.x / 100) * vw.value
  const worldY = (pin.y / 100) * worldH.value
  const s = Math.min(MAX, Math.max(view.scale, props.focusScale))
  animate.value = true
  view.scale = s
  view.tx = vw.value / 2 - worldX * s
  view.ty = containerH() / 2 - worldY * s
  clampPan()
  clearTimeout(animTimer)
  animTimer = setTimeout(() => { animate.value = false }, 300)
}
// Focus whenever the externally-selected pin changes (rail selection or a pin tap).
watch(() => props.focusId, (id) => {
  if (!id) return
  const pin = props.pins.find((p) => p.id === id)
  if (pin) focusPin(pin)
})

// Drag-pan with flick momentum. Panning only begins once the pointer moves past
// a small threshold, so a click (to select a pin) never nudges the map.
const DRAG_THRESHOLD = 5
let dragging = false, panning = false, startX = 0, startY = 0, lastX = 0, lastY = 0, vX = 0, vY = 0, lastT = 0, raf = 0
function onDown(e) {
  dragging = true; panning = false; animate.value = false
  startX = lastX = e.clientX; startY = lastY = e.clientY; lastT = performance.now(); vX = vY = 0
  cancelAnimationFrame(raf)
  viewport.value.setPointerCapture?.(e.pointerId)
}
function onMove(e) {
  if (!dragging) return
  if (!panning) {
    if (Math.hypot(e.clientX - startX, e.clientY - startY) < DRAG_THRESHOLD) return
    panning = true; lastX = e.clientX; lastY = e.clientY; lastT = performance.now()
  }
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
  if (panning && Math.hypot(vX, vY) > 0.06) {
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
  <div class="vmap" :class="{ 'vmap--fill': fill }">
    <div
      ref="viewport" class="vmap__viewport" :class="{ 'is-dragging': false }"
      @wheel="onWheel" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp"
    >
      <div class="vmap__world" :class="{ 'is-animating': animate }" :style="{ width: vw + 'px', height: worldH + 'px', transform: `translate3d(${view.tx}px, ${view.ty}px, 0) scale(${view.scale})` }">
        <img :src="src" class="vmap__img" draggable="false" alt="Gillette Stadium seating map" />
        <button
          v-for="p in pins" :key="p.id"
          class="vmap__pin" :class="{ 'is-selected': p.id === modelValue, 'is-out': !p.available }"
          :style="{ left: p.x + '%', top: p.y + '%', '--pin': 'var(--ds-color-background-brand-bold)', transform: `translate(-50%, -100%) scale(${1 / view.scale})` }"
          :aria-label="`Section ${p.label}, ${p.available ? fmt(p.price, p.currency) : 'unavailable'}`"
          @pointerdown.stop @click.stop="pick(p)"
        >
          <span v-if="p.available">{{ fmt(p.price, p.currency) }}</span>
          <q-icon v-else name="close" size="12px" />
        </button>
      </div>

      <!-- @pointerdown.stop so the viewport's drag/pointer-capture doesn't steal
           the button's click (which made +/- appear dead). -->
      <div class="vmap__controls" @pointerdown.stop>
        <button type="button" aria-label="Zoom in" @click="zoomBtn(1.35)">+</button>
        <button type="button" aria-label="Zoom out" @click="zoomBtn(1 / 1.35)">−</button>
        <button type="button" aria-label="Reset view" @click="reset"><q-icon name="center_focus_strong" size="16px" /></button>
      </div>
    </div>

    <div v-if="!fill" class="vmap__readout" aria-live="polite">
      <template v-if="selected">
        <span class="vmap__swatch" :style="{ background: `var(${selected.colorVar})` }" />
        <strong>Section {{ selected.label }}</strong>
        <span class="vmap__tier">· {{ selected.tierName }}</span>
        <span class="vmap__price">{{ fmt(selected.price, selected.currency) }}</span>
      </template>
      <span v-else class="vmap__hint">Drag to pan · scroll to zoom · tap a price to preview a seat</span>
    </div>

    <p v-if="!fill" class="vmap__note">
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
/* Fill mode: the map covers its parent's full height (no aspect box, no chrome). */
.vmap--fill { height: 100%; gap: 0; }
.vmap--fill .vmap__viewport { flex: 1 1 auto; aspect-ratio: auto; min-height: 0; border: 0; border-radius: 0; }
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
