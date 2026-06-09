<script setup>
// HotelListingCard — composite search-result card for hotel listings.
// Drives several conditional variants from props: deal vs standard pricing,
// availability (available / limited / sold out), trust badge, refundability,
// rating-or-new, and a loading skeleton. The image carousel sources photos
// dynamically from the local imagery library (imagery.js) by category.
import { ref, computed, onMounted } from 'vue'
import { loadImagery } from '../lib/imagery'

const props = defineProps({
  name: { type: String, default: 'Hotel Name' },
  location: { type: String, default: '' },
  // Explicit images win; otherwise pulled from the imagery library by category.
  images: { type: Array, default: () => [] },
  imageCategories: { type: Array, default: () => ['exterior', 'lobby', 'rooms', 'pool', 'dining'] },
  seed: { type: Number, default: 0 }, // offsets which library image each category yields
  amenities: { type: Array, default: () => [] }, // [{ icon, label }]
  refundLabel: { type: String, default: 'Fully Refundable' },
  rating: { type: Number, default: null }, // null => "New"
  reviews: { type: Number, default: 0 },
  currency: { type: String, default: '$' },
  price: { type: Number, default: null }, // current nightly price
  originalPrice: { type: Number, default: null }, // shown struck-through when > price
  total: { type: Number, default: null },
  discountLabel: { type: String, default: '' }, // e.g. "10% Off"
  badge: { type: Object, default: null }, // { label, tone }
  availability: { type: String, default: 'available' }, // available | limited | soldout
  roomsLeft: { type: Number, default: 0 },
  orientation: { type: String, default: 'horizontal' }, // horizontal | vertical
  loading: { type: Boolean, default: false },
  ctaLabel: { type: String, default: 'Choose your room' },
})

// Soft badge tones mapped to DS palette ramps.
const TONES = {
  teal: { '--bg': 'var(--ds-palette-teal-100)', '--fg': 'var(--ds-palette-teal-700)' },
  emerald: { '--bg': 'var(--ds-palette-emerald-100)', '--fg': 'var(--ds-palette-emerald-700)' },
  blue: { '--bg': 'var(--ds-palette-blue-100)', '--fg': 'var(--ds-palette-blue-700)' },
  amber: { '--bg': 'var(--ds-palette-amber-100)', '--fg': 'var(--ds-palette-amber-700)' },
  rose: { '--bg': 'var(--ds-palette-rose-100)', '--fg': 'var(--ds-palette-rose-700)' },
  zinc: { '--bg': 'var(--ds-palette-zinc-100)', '--fg': 'var(--ds-color-text)' },
}
const toneStyle = (tone) => TONES[tone] || TONES.teal

const discounted = computed(() => props.originalPrice != null && props.price != null && props.originalPrice > props.price)
const soldout = computed(() => props.availability === 'soldout')
const limited = computed(() => props.availability === 'limited')
const money = (n) => props.currency + Number(n).toLocaleString('en-US')

// --- Carousel ---
const loaded = ref([])
const slides = computed(() => (props.images.length ? props.images : loaded.value))
const idx = ref(0)
const go = (n) => { const len = slides.value.length || 1; idx.value = (n + len) % len }
const prev = () => go(idx.value - 1)
const next = () => go(idx.value + 1)

onMounted(async () => {
  if (props.images.length) return
  const lib = await loadImagery()
  const out = []
  for (const c of props.imageCategories) {
    const arr = lib[c]
    if (arr && arr.length) { const e = arr[props.seed % arr.length]; out.push({ url: e.url, alt: e.alt }) }
  }
  loaded.value = out
})
</script>

<template>
  <div class="hlc" :class="[`hlc--${orientation}`, { 'hlc--soldout': soldout }]">
    <!-- LOADING SKELETON -->
    <template v-if="loading">
      <div class="hlc__media hlc__sk" />
      <div class="hlc__body">
        <div class="hlc__main">
          <div class="hlc__sk hlc__sk-line" style="width:60%;height:22px" />
          <div class="hlc__sk hlc__sk-line" style="width:35%" />
          <div class="hlc__sk hlc__sk-line" style="width:80%;margin-top:16px" />
          <div class="hlc__sk hlc__sk-line" style="width:45%" />
        </div>
        <div class="hlc__price">
          <div class="hlc__sk hlc__sk-line" style="width:80px;height:28px;margin-left:auto" />
          <div class="hlc__sk hlc__sk-line" style="width:120px;margin-left:auto" />
          <div class="hlc__sk hlc__sk-line" style="width:140px;height:44px;margin-top:12px;border-radius:var(--ds-radius-pill)" />
        </div>
      </div>
    </template>

    <!-- CONTENT -->
    <template v-else>
      <div class="hlc__media">
        <img v-if="slides.length" :src="slides[idx].url" :alt="slides[idx].alt" class="hlc__img" />
        <div v-else class="hlc__img hlc__img--empty"><q-icon name="image" size="32px" /></div>

        <div v-if="badge" class="hlc__badge" :style="toneStyle(badge.tone)">{{ badge.label }}</div>

        <template v-if="slides.length > 1">
          <button class="hlc__arrow hlc__arrow--prev" aria-label="Previous photo" @click="prev"><q-icon name="chevron_left" size="20px" /></button>
          <button class="hlc__arrow hlc__arrow--next" aria-label="Next photo" @click="next"><q-icon name="chevron_right" size="20px" /></button>
          <div class="hlc__dots">
            <span v-for="(s, i) in slides" :key="i" class="hlc__dot" :class="{ 'is-active': i === idx }" @click="go(i)" />
          </div>
        </template>

        <div v-if="soldout" class="hlc__sold">Sold out</div>
      </div>

      <div class="hlc__body">
        <div class="hlc__main">
          <h3 class="hlc__name">{{ name }}</h3>
          <div v-if="location" class="hlc__loc">{{ location }}</div>

          <div v-if="amenities.length" class="hlc__amenities">
            <span v-for="a in amenities" :key="a.label" class="hlc__amenity"><q-icon :name="a.icon" size="18px" />{{ a.label }}</span>
          </div>

          <div class="hlc__row">
            <span v-if="refundLabel" class="hlc__refund">{{ refundLabel }}</span>
          </div>

          <div class="hlc__rating">
            <template v-if="rating != null">
              <span class="hlc__score">{{ rating.toFixed(1) }}</span>
              <span class="hlc__reviews">{{ reviews.toLocaleString('en-US') }} reviews</span>
            </template>
            <template v-else>
              <span class="hlc__score hlc__score--new">New</span>
              <span class="hlc__reviews">No reviews yet</span>
            </template>
          </div>
        </div>

        <div class="hlc__price">
          <div v-if="discountLabel" class="hlc__deal" :style="toneStyle('teal')">{{ discountLabel }}</div>
          <div class="hlc__prices">
            <span v-if="discounted" class="hlc__orig">{{ money(originalPrice) }}</span>
            <span class="hlc__now">{{ money(price) }}</span>
          </div>
          <div v-if="total != null" class="hlc__totals">{{ money(total) }} total<br><span>(includes taxes &amp; fees)</span></div>
          <div v-if="limited" class="hlc__urgency">Only {{ roomsLeft }} room{{ roomsLeft === 1 ? '' : 's' }} left</div>
          <q-btn unelevated class="hlc__cta" :class="{ 'hlc__cta--disabled': soldout }" :tabindex="soldout ? -1 : 0" :label="soldout ? 'Sold out' : ctaLabel" no-caps />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.hlc { display: flex; background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); overflow: hidden; box-shadow: var(--ds-shadow-1); }
.hlc--soldout { opacity: 0.92; }

/* Media / carousel */
.hlc__media { position: relative; flex: 0 0 320px; background: var(--ds-palette-zinc-100); overflow: hidden; }
.hlc__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hlc__img--empty { display: flex; align-items: center; justify-content: center; color: var(--ds-color-text-disabled); height: 100%; }
.hlc__badge { position: absolute; top: 14px; left: 14px; background: var(--bg); color: var(--fg); font-weight: 600; font-size: 0.8125rem; padding: 6px 12px; border-radius: var(--ds-radius-md); }
.hlc__arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; border: 0; background: rgba(0,0,0,0.45); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background var(--ds-duration-fast) var(--ds-ease-standard); }
.hlc__arrow:hover { background: rgba(0,0,0,0.65); }
.hlc__arrow--prev { left: 10px; }
.hlc__arrow--next { right: 10px; }
.hlc__dots { position: absolute; bottom: 12px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; }
.hlc__dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.55); cursor: pointer; }
.hlc__dot.is-active { background: #fff; }
.hlc__sold { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(9,9,11,0.55); color: #fff; font-weight: 700; font-size: 1.125rem; letter-spacing: 0.02em; text-transform: uppercase; }

/* Body */
.hlc__body { flex: 1; display: flex; justify-content: space-between; gap: 24px; padding: 22px 24px; }
.hlc__main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.hlc__name { font-size: 1.375rem; font-weight: 700; line-height: 1.2; margin: 0; color: var(--ds-color-text); }
.hlc__loc { color: var(--ds-color-text-subtle); margin-top: 4px; }
.hlc__amenities { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 16px; color: var(--ds-color-text-subtle); }
.hlc__amenity { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; }
.hlc__row { margin-top: auto; padding-top: 18px; }
.hlc__refund { display: inline-block; background: var(--ds-palette-zinc-200); color: var(--ds-color-text); font-weight: 500; font-size: 0.875rem; padding: 7px 14px; border-radius: var(--ds-radius-md); }
.hlc__rating { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
.hlc__score { background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; font-size: 0.875rem; padding: 4px 10px; border-radius: var(--ds-radius-sm); }
.hlc__score--new { background: var(--ds-palette-teal-600); }
.hlc__reviews { color: var(--ds-color-text-subtle); font-size: 0.875rem; }

/* Price block */
.hlc__price { display: flex; flex-direction: column; align-items: flex-end; text-align: right; flex: 0 0 auto; min-width: 170px; }
.hlc__deal { background: var(--bg); color: var(--fg); font-weight: 700; font-size: 0.9375rem; padding: 5px 12px; border-radius: var(--ds-radius-md); margin-bottom: 12px; }
.hlc__prices { display: flex; align-items: baseline; gap: 8px; }
.hlc__orig { color: var(--ds-color-text-subtle); text-decoration: line-through; font-size: 1rem; }
.hlc__now { font-size: 1.875rem; font-weight: 700; color: var(--ds-color-text); line-height: 1; }
.hlc__totals { color: var(--ds-color-text-subtle); font-size: 0.8125rem; margin-top: 6px; line-height: 1.35; }
.hlc__urgency { color: var(--ds-palette-rose-600); font-weight: 600; font-size: 0.8125rem; margin-top: 8px; }
.hlc__cta { margin-top: 16px; height: 48px; padding: 0 22px; border-radius: var(--ds-radius-md); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 600; }
.hlc__cta--disabled { pointer-events: none; background: var(--ds-palette-zinc-200) !important; color: var(--ds-color-text-subtle) !important; }

/* Skeleton */
.hlc__sk { position: relative; overflow: hidden; background: var(--ds-palette-zinc-100); border-radius: var(--ds-radius-sm); }
.hlc__sk-line { height: 14px; margin-bottom: 10px; }
.hlc__sk::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: hlc-shimmer 1.3s infinite; }
@keyframes hlc-shimmer { 100% { transform: translateX(100%); } }

/* Vertical (grid card) */
.hlc--vertical { flex-direction: column; width: 340px; }
.hlc--vertical .hlc__media { flex: 0 0 200px; width: 100%; }
.hlc--vertical .hlc__body { flex-direction: column; gap: 16px; }
.hlc--vertical .hlc__row { margin-top: 4px; padding-top: 0; }
.hlc--vertical .hlc__price { align-items: stretch; text-align: left; min-width: 0; }
.hlc--vertical .hlc__deal { align-self: flex-start; }
.hlc--vertical .hlc__totals { margin-bottom: 4px; }
.hlc--vertical .hlc__cta { width: 100%; }
</style>
