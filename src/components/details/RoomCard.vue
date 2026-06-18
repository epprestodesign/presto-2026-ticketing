<script setup>
// RoomCard — vertical room-rate card for the Hotel Details "Select Your Room"
// section. Extracted from HotelListingCard's room-rate variants so the
// detail screen owns it independently of the (deprecated) vertical hotel card.
//
// One component, two booking modes + several states:
//   mode 'reserve' → nights availability list + Reserve Room CTA
//   mode 'hold'    → per-night quantity steppers + Add to Cart CTA
// States: availability (available / limited / soldout), discounted pricing,
// refundable vs nonrefundable tag, and a loading skeleton. Photos source from
// the local imagery library by category (same pattern as HotelListingCard).
import { ref, computed, onMounted } from 'vue'
import { loadImagery } from '../../lib/imagery'
import QuantityStepper from '../QuantityStepper.vue'

const props = defineProps({
  // Identity / content
  roomType: { type: String, default: 'Room' },        // card title
  bedConfig: { type: String, default: '' },            // e.g. "1 King Bed"
  sleeps: { type: Number, default: null },             // "Sleeps N"
  maxOccupancy: { type: Number, default: null },       // alt to `sleeps`
  features: { type: Array, default: () => [] },        // [{ icon, label }]
  roomDetails: { type: Array, default: () => [] },     // [{ label, value }] (reserve)

  // Imagery / carousel
  images: { type: Array, default: () => [] },
  imageCategories: { type: Array, default: () => ['rooms', 'suites', 'bathroom'] },
  seed: { type: Number, default: 0 },

  // Booking mode
  mode: { type: String, default: 'reserve' },          // 'reserve' | 'hold'
  nights: { type: Array, default: () => [] },           // [{ date, roomsLeft, price }]

  // Pricing
  currency: { type: String, default: '$' },
  price: { type: Number, default: null },               // nightly price
  originalPrice: { type: Number, default: null },       // strikethrough when > price
  total: { type: Number, default: null },               // reserve stay total
  roomCount: { type: Number, default: 1 },
  discountLabel: { type: String, default: '' },         // e.g. "10% Off"

  // States
  availability: { type: String, default: 'available' }, // available | limited | soldout
  roomsLeft: { type: Number, default: 0 },              // for the "Only N left" urgency
  refundable: { type: Boolean, default: true },
  refundLabel: { type: String, default: 'Fully Refundable' },
  nonrefundLabel: { type: String, default: 'Nonrefundable' },
  badge: { type: Object, default: null },               // { label, tone }
  loading: { type: Boolean, default: false },
})

// Soft badge tones mapped to DS palette ramps (mirrors HotelListingCard).
const TONES = {
  teal: { '--bg': 'var(--ds-palette-teal-100)', '--fg': 'var(--ds-palette-teal-700)' },
  emerald: { '--bg': 'var(--ds-palette-emerald-100)', '--fg': 'var(--ds-palette-emerald-700)' },
  blue: { '--bg': 'var(--ds-palette-blue-100)', '--fg': 'var(--ds-palette-blue-700)' },
  amber: { '--bg': 'var(--ds-palette-amber-100)', '--fg': 'var(--ds-palette-amber-700)' },
  rose: { '--bg': 'var(--ds-palette-rose-100)', '--fg': 'var(--ds-palette-rose-700)' },
  zinc: { '--bg': 'var(--ds-palette-zinc-100)', '--fg': 'var(--ds-color-text)' },
}
const toneStyle = (tone) => TONES[tone] || TONES.teal

const isReserve = computed(() => props.mode === 'reserve')
const soldout = computed(() => props.availability === 'soldout')
const limited = computed(() => props.availability === 'limited')
const discounted = computed(() => props.originalPrice != null && props.price != null && props.originalPrice > props.price)
const occupancy = computed(() => props.sleeps ?? props.maxOccupancy)

const money = (n) => props.currency + Number(n ?? 0).toLocaleString('en-US')
// Two-decimal currency for the pricing block (e.g. "269.00").
const fmt2 = (n) => Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

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

// --- Hold: per-night quantities, clamped to [0, roomsLeft] ---
const qty = ref(props.nights.map(() => 0))
const totalSelected = computed(() => qty.value.reduce((a, b) => a + b, 0))
const startingPrice = computed(() => props.nights.length ? Math.min(...props.nights.map((n) => n.price)) : props.price)
</script>

<template>
  <div class="rc" :class="{ 'rc--soldout': soldout }">
    <!-- LOADING SKELETON -->
    <template v-if="loading">
      <div class="rc__media rc__sk" />
      <div class="rc__head">
        <div class="rc__sk rc__sk-line" style="width:65%;height:20px" />
        <div class="rc__sk rc__sk-line" style="width:45%" />
        <div class="rc__sk rc__sk-line" style="width:80%;margin-top:12px" />
      </div>
      <div class="rc__foot">
        <div class="rc__sk rc__sk-line" style="width:50%;height:24px" />
        <div class="rc__sk rc__sk-line" style="width:100%;height:46px;margin-top:12px;border-radius:var(--ds-radius-md)" />
      </div>
    </template>

    <!-- CONTENT -->
    <template v-else>
      <div class="rc__media">
        <img v-if="slides.length" :src="slides[idx].url" :alt="slides[idx].alt" class="rc__img" />
        <div v-else class="rc__img rc__img--empty"><q-icon name="image" size="32px" /></div>

        <div v-if="badge" class="rc__badge" :style="toneStyle(badge.tone)">{{ badge.label }}</div>

        <template v-if="slides.length > 1">
          <button class="rc__arrow rc__arrow--prev" aria-label="Previous photo" @click="prev"><q-icon name="chevron_left" size="20px" /></button>
          <button class="rc__arrow rc__arrow--next" aria-label="Next photo" @click="next"><q-icon name="chevron_right" size="20px" /></button>
          <div class="rc__dots">
            <span v-for="(s, i) in slides" :key="i" class="rc__dot" :class="{ 'is-active': i === idx }" @click="go(i)" />
          </div>
        </template>

        <div v-if="soldout" class="rc__sold">Sold out</div>
      </div>

      <!-- HEAD -->
      <div class="rc__head">
        <h3 class="rc__title">{{ roomType }}</h3>
        <div v-if="bedConfig || occupancy != null" class="rc__bed">
          {{ bedConfig }}<template v-if="bedConfig && occupancy != null"> · </template><template v-if="occupancy != null">Sleeps {{ occupancy }}</template>
        </div>

        <div v-if="features.length" class="rc__feat">
          <span v-for="f in features" :key="f.label" class="rc__feat-item"><q-icon :name="f.icon" size="16px" />{{ f.label }}</span>
        </div>

        <div v-if="roomDetails.length" class="rc__details">
          <p v-for="d in roomDetails" :key="d.label"><strong>{{ d.label }}:</strong> {{ d.value }}</p>
        </div>

        <span class="rc__tag" :class="refundable ? 'rc__tag--ref' : 'rc__tag--non'">{{ refundable ? refundLabel : nonrefundLabel }}</span>
      </div>

      <!-- NIGHTS -->
      <div v-if="nights.length" class="rc__nights">
        <h4 class="rc__h">{{ isReserve ? 'Nights' : 'Rooms per Night' }}</h4>

        <template v-if="isReserve">
          <div v-for="(n, i) in nights" :key="i" class="rc__night">
            <span class="rc__date">{{ n.date }}</span>
            <span class="rc__avail">{{ n.roomsLeft }} room{{ n.roomsLeft === 1 ? '' : 's' }} left</span>
          </div>
        </template>

        <template v-else>
          <div v-for="(n, i) in nights" :key="i" class="rc__night rc__night--hold">
            <div class="rc__ndate">
              <span class="rc__date">{{ n.date }}</span>
              <span class="rc__nrate">{{ currency }}{{ fmt2(n.price) }} / night</span>
            </div>
            <span class="rc__avail rc__avail--sm">{{ n.roomsLeft - qty[i] }} left</span>
            <quantity-stepper v-model="qty[i]" :min="0" :max="soldout ? 0 : n.roomsLeft" size="sm" />
          </div>
        </template>
      </div>

      <!-- FOOT -->
      <div class="rc__foot">
        <div v-if="limited" class="rc__urgency">Only {{ roomsLeft }} room{{ roomsLeft === 1 ? '' : 's' }} left</div>

        <template v-if="isReserve">
          <div class="rc__prices">
            <span v-if="discounted" class="rc__orig">{{ money(originalPrice) }}</span>
            <span class="rc__now">{{ money(price) }}</span>
            <span class="rc__per">/ night</span>
          </div>
          <div v-if="discountLabel" class="rc__deal" :style="toneStyle('teal')">{{ discountLabel }}</div>
          <div v-if="total != null" class="rc__total">{{ currency }}{{ fmt2(total) }} total</div>
          <div class="rc__sub">{{ roomCount }} room{{ roomCount === 1 ? '' : 's' }} · incl. taxes &amp; fees</div>
          <q-btn
            unelevated no-caps
            class="rc__cta"
            :class="{ 'rc__cta--disabled': soldout }"
            :tabindex="soldout ? -1 : 0"
            :label="soldout ? 'Sold out' : 'Reserve Room'"
          />
        </template>

        <template v-else>
          <div class="rc__starting">Starting price</div>
          <div class="rc__total">{{ currency }}{{ fmt2(startingPrice) }} <span class="rc__per">/ night</span></div>
          <q-btn
            unelevated no-caps
            class="rc__cta rc__cta--cart"
            :class="{ 'rc__cta--ready': totalSelected > 0 && !soldout, 'rc__cta--disabled': soldout }"
            :tabindex="totalSelected > 0 && !soldout ? 0 : -1"
            :label="soldout ? 'Sold out' : (totalSelected > 0 ? `Add ${totalSelected} to Cart` : 'Add to Cart')"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.rc { display: flex; flex-direction: column; width: 340px; background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); overflow: hidden; box-shadow: var(--ds-shadow-1); }
.rc--soldout { opacity: 0.92; }

/* Media / carousel */
.rc__media { position: relative; flex: 0 0 180px; background: var(--ds-palette-zinc-100); overflow: hidden; }
.rc__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.rc__img--empty { display: flex; align-items: center; justify-content: center; color: var(--ds-color-text-disabled); height: 100%; }
.rc__badge { position: absolute; top: 12px; left: 12px; background: var(--bg); color: var(--fg); font-weight: 600; font-size: 0.8125rem; padding: 5px 12px; border-radius: var(--ds-radius-md); }
.rc__arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%; border: 0; background: rgba(0,0,0,0.45); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background var(--ds-duration-fast) var(--ds-ease-standard); }
.rc__arrow:hover { background: rgba(0,0,0,0.65); }
.rc__arrow--prev { left: 10px; }
.rc__arrow--next { right: 10px; }
.rc__dots { position: absolute; bottom: 10px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; }
.rc__dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.55); cursor: pointer; }
.rc__dot.is-active { background: #fff; }
.rc__sold { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(9,9,11,0.55); color: #fff; font-weight: 700; font-size: 1.0625rem; letter-spacing: 0.02em; text-transform: uppercase; }

/* Head */
.rc__head { padding: 16px 18px 12px; display: flex; flex-direction: column; gap: 8px; }
.rc__title { font-size: 1.125rem; font-weight: 700; line-height: 1.2; margin: 0; color: var(--ds-color-text); }
.rc__bed { color: var(--ds-color-text-subtle); font-size: 0.875rem; }
.rc__feat { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 2px; }
.rc__feat-item { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }
.rc__details { display: flex; flex-direction: column; gap: 6px; }
.rc__details p { margin: 0; font-size: 0.875rem; line-height: 1.4; color: var(--ds-color-text-subtle); }
.rc__details strong { color: var(--ds-color-text); font-weight: 600; }
.rc__tag { align-self: flex-start; font-size: 0.75rem; font-weight: 600; padding: 3px 10px; border-radius: var(--ds-radius-pill); margin-top: 2px; }
.rc__tag--ref { background: var(--ds-palette-green-50); color: var(--ds-palette-green-700); }
.rc__tag--non { background: var(--ds-palette-zinc-100); color: var(--ds-color-text-subtle); }

/* Nights */
.rc__nights { padding: 6px 18px 4px; border-top: 1px solid var(--ds-color-border); }
.rc__h { font-size: 0.9375rem; font-weight: 700; color: var(--ds-color-text); margin: 12px 0 8px; }
.rc__night { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--ds-color-border); }
.rc__night:last-child { border-bottom: 0; }
.rc__night--hold { gap: 10px; }
.rc__ndate { display: flex; flex-direction: column; flex: 1; min-width: 0; gap: 2px; }
.rc__date { color: var(--ds-color-text); font-size: 0.875rem; font-weight: 500; }
.rc__nrate { color: var(--ds-color-text-subtlest); font-size: 0.75rem; }
.rc__avail { color: var(--ds-palette-orange-600); font-weight: 700; font-size: 0.875rem; white-space: nowrap; }
.rc__avail--sm { font-size: 0.75rem; font-weight: 600; }

/* Foot */
.rc__foot { padding: 14px 18px 18px; border-top: 1px solid var(--ds-color-border); margin-top: auto; }
.rc__urgency { color: var(--ds-palette-rose-600); font-weight: 600; font-size: 0.8125rem; margin-bottom: 8px; }
.rc__prices { display: flex; align-items: baseline; gap: 8px; }
.rc__orig { color: var(--ds-color-text-subtle); text-decoration: line-through; font-size: 0.9375rem; }
.rc__now { font-size: 1.5rem; font-weight: 700; color: var(--ds-color-text); line-height: 1.1; }
.rc__per { font-size: 0.875rem; font-weight: 500; color: var(--ds-color-text-subtle); }
.rc__deal { display: inline-block; background: var(--bg); color: var(--fg); font-weight: 700; font-size: 0.8125rem; padding: 3px 10px; border-radius: var(--ds-radius-md); margin-top: 8px; }
.rc__starting { font-size: 0.75rem; color: var(--ds-color-text-subtle); }
.rc__total { font-size: 1.5rem; font-weight: 700; color: var(--ds-color-text); line-height: 1.1; margin-top: 2px; }
.rc__sub { color: var(--ds-color-text-subtlest); font-size: 0.8125rem; margin-top: 4px; }
.rc__cta { width: 100%; height: 46px; margin-top: 12px; border-radius: var(--ds-radius-md); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 600; }
/* Cart CTA stays muted until a room is selected, then activates brand. */
.rc__cta--cart { background: var(--ds-palette-zinc-200); color: var(--ds-color-text-subtlest); pointer-events: none; transition: background var(--ds-duration-fast) var(--ds-ease-standard), color var(--ds-duration-fast) var(--ds-ease-standard); }
.rc__cta--ready { background: var(--ds-color-background-brand-bold); color: #fff; pointer-events: auto; }
.rc__cta--disabled { pointer-events: none; background: var(--ds-palette-zinc-200) !important; color: var(--ds-color-text-subtle) !important; }

/* Skeleton */
.rc__sk { position: relative; overflow: hidden; background: var(--ds-palette-zinc-100); border-radius: var(--ds-radius-sm); }
.rc__sk-line { height: 14px; margin-bottom: 10px; }
.rc__sk::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: rc-shimmer 1.3s infinite; }
@keyframes rc-shimmer { 100% { transform: translateX(100%); } }
</style>
