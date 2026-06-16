<script setup>
// CartFlyout — a right-side slide-over order summary (Uber Eats-style) for the
// booking cart. Two modes:
//   'hold'    → "Hold Rooms for Group or Team": rooms grouped by type with live
//               − / + steppers, Remove, and a "N Rooms Selected" / held-until
//               panel + Proceed to Checkout.
//   'reserve' → "Hotel Reservation": held countdown, photo carousel, dates,
//               nightly breakdown, totals, Due Today / Balance Due + actions.
// Accents use the DS primary (Zinc 900); the held timer counts down live.
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { loadImagery } from '../lib/imagery'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'reserve' }, // reserve | hold
  cart: { type: Object, default: () => ({}) },
  currency: { type: String, default: '$' },
})
const emit = defineEmits(['update:modelValue', 'update:count'])

const close = () => emit('update:modelValue', false)
const money = (n) => props.currency + Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// --- Live held countdown (mm:ss) ---
const secs = ref(props.cart.heldSeconds ?? 895)
const clock = computed(() => `${Math.floor(secs.value / 60)}:${String(secs.value % 60).padStart(2, '0')}`)
let timer = null
onMounted(() => { timer = setInterval(() => { if (props.modelValue && secs.value > 0) secs.value-- }, 1000) })
onBeforeUnmount(() => clearInterval(timer))

// --- Photos (carousel for reserve, thumbnail for hold) ---
const loaded = ref([])
const slides = computed(() => (props.cart.images?.length ? props.cart.images : loaded.value))
const idx = ref(0)
const go = (n) => { const len = slides.value.length || 1; idx.value = (n + len) % len }
const prev = () => go(idx.value - 1)
const next = () => go(idx.value + 1)
onMounted(async () => {
  if (props.cart.images?.length) return
  const lib = await loadImagery()
  const cats = props.cart.imageCategories || ['suites', 'rooms', 'lobby', 'pool', 'dining']
  const out = []
  for (const c of cats) {
    const arr = lib[c]
    if (arr && arr.length) { const e = arr[(props.cart.seed || 0) % arr.length]; out.push({ url: e.url, alt: e.alt }) }
  }
  loaded.value = out
})

// --- Hold: live room selection (clone so the source data is untouched) ---
const rooms = ref((props.cart.rooms || []).map((r) => ({ ...r, nights: r.nights.map((n) => ({ ...n })) })))
const incN = (ri, ni) => { const n = rooms.value[ri].nights[ni]; if (n.qty < n.roomsLeft) n.qty++ }
const decN = (ri, ni) => { const n = rooms.value[ri].nights[ni]; if (n.qty > 0) n.qty-- }
const removeRoom = (ri) => rooms.value.splice(ri, 1)
const totalRooms = computed(() => rooms.value.reduce((s, r) => s + r.nights.reduce((a, n) => a + n.qty, 0), 0))

// Keep the nav badge in sync (hold → live count; reserve → single reservation).
watch(totalRooms, (v) => emit('update:count', props.mode === 'hold' ? v : 1), { immediate: true })

const hotel = computed(() => props.cart.hotel || {})
</script>

<template>
  <teleport to="body">
    <div v-if="modelValue" class="cf">
      <div class="cf__scrim" @click="close" />
      <aside class="cf__panel" role="dialog" aria-label="Cart">
        <!-- held timer -->
        <div class="cf__held">
          <span class="cf__held-label"><q-icon name="schedule" size="16px" /> {{ mode === 'reserve' ? 'Reservation held for' : 'Rooms held for' }}</span>
          <span class="cf__clock">{{ clock }}</span>
        </div>
        <button class="cf__close" aria-label="Close" @click="close"><q-icon name="close" size="22px" /></button>

        <div class="cf__body">
          <!-- ============ RESERVE ============ -->
          <template v-if="mode === 'reserve'">
            <div class="cf__carousel">
              <img v-if="slides.length" :src="slides[idx].url" :alt="slides[idx].alt" class="cf__img" />
              <div v-else class="cf__img cf__img--empty"><q-icon name="image" size="36px" /></div>
              <template v-if="slides.length > 1">
                <button class="cf__arrow cf__arrow--prev" aria-label="Previous photo" @click="prev"><q-icon name="chevron_left" size="20px" /></button>
                <button class="cf__arrow cf__arrow--next" aria-label="Next photo" @click="next"><q-icon name="chevron_right" size="20px" /></button>
                <div class="cf__dots"><span v-for="(s, i) in slides" :key="i" class="cf__dot" :class="{ 'is-active': i === idx }" @click="go(i)" /></div>
              </template>
            </div>

            <div class="cf__pad">
              <h3 class="cf__hotel">{{ hotel.name }}</h3>
              <div class="cf__stars"><q-icon v-for="i in 5" :key="i" :name="i <= (hotel.stars || 0) ? 'star' : 'star_border'" size="18px" /></div>
              <div v-if="hotel.address" class="cf__addr">{{ hotel.address }}</div>

              <div class="cf__rule" />
              <div class="cf__kv"><span>Check-in</span><span>{{ cart.checkIn }}</span></div>
              <div class="cf__kv"><span>Check-out</span><span>{{ cart.checkOut }}</span></div>

              <div class="cf__rule" />
              <div class="cf__roomhdr">Room 1 — {{ cart.reserveRoom }}</div>
              <div v-for="(n, i) in cart.reserveNights" :key="i" class="cf__kv"><span>{{ n.date }}</span><span>{{ money(n.price) }}</span></div>

              <div class="cf__rule" />
              <div class="cf__kv"><span>Taxes &amp; fees</span><span>{{ money(cart.taxes) }}</span></div>
              <div class="cf__kv cf__kv--total"><span>Total</span><span>{{ money(cart.total) }}</span></div>

              <div class="cf__rule" />
              <div class="cf__kv"><span>Due Today</span><span class="cf__b">{{ money(cart.dueToday) }}</span></div>
              <div class="cf__kv"><span>Balance Due</span><span class="cf__b">{{ money(cart.balanceDue) }}</span></div>
            </div>
          </template>

          <!-- ============ HOLD ============ -->
          <template v-else>
            <div class="cf__pad">
              <div class="cf__hotelrow">
                <img v-if="slides.length" :src="slides[0].url" :alt="slides[0].alt" class="cf__thumb" />
                <div v-else class="cf__thumb cf__img--empty"><q-icon name="image" size="20px" /></div>
                <div class="cf__hotelmeta">
                  <div class="cf__hotel cf__hotel--sm">{{ hotel.name }}</div>
                  <div class="cf__stars cf__stars--sm"><q-icon v-for="i in 5" :key="i" :name="i <= (hotel.stars || 0) ? 'star' : 'star_border'" size="15px" /></div>
                </div>
              </div>

              <div v-for="(room, ri) in rooms" :key="ri" class="cf__group">
                <div class="cf__grouphdr">
                  <span>{{ room.type }}</span>
                  <button class="cf__remove" @click="removeRoom(ri)">Remove</button>
                </div>
                <div v-for="(n, ni) in room.nights" :key="ni" class="cf__night">
                  <span class="cf__date">{{ n.date }}</span>
                  <div class="cf__step" role="group" aria-label="Rooms for this night">
                    <button class="cf__step-btn" :disabled="n.qty === 0" aria-label="Decrease" @click="decN(ri, ni)">−</button>
                    <span class="cf__step-val">{{ n.qty }}</span>
                    <button class="cf__step-btn" :disabled="n.qty >= n.roomsLeft" aria-label="Increase" @click="incN(ri, ni)">+</button>
                  </div>
                  <span class="cf__unit">{{ n.qty === 1 ? 'rm' : 'rms' }}</span>
                  <span class="cf__left">({{ n.roomsLeft }} left)</span>
                  <span class="cf__rate">{{ money(n.price) }}/nt</span>
                </div>
              </div>

              <button class="cf__addhotel"><q-icon name="add" size="18px" /> Add another hotel</button>
            </div>
          </template>
        </div>

        <!-- ============ FOOTER ============ -->
        <div class="cf__foot">
          <template v-if="mode === 'reserve'">
            <q-btn outline no-caps class="cf__btn cf__btn--outline" label="Edit Reservation" />
            <q-btn outline no-caps class="cf__btn cf__btn--outline" label="Start Over" />
          </template>
          <template v-else>
            <div class="cf__selhdr">{{ totalRooms }} Room{{ totalRooms === 1 ? '' : 's' }} Selected</div>
            <div class="cf__heldnote"><q-icon name="schedule" size="15px" /> <span>Rooms held until <strong>{{ cart.heldUntil }}</strong></span></div>
            <q-btn unelevated no-caps class="cf__btn cf__btn--primary" :class="{ 'is-disabled': totalRooms === 0 }" :tabindex="totalRooms === 0 ? -1 : 0" label="Proceed to Checkout →" />
          </template>
        </div>
      </aside>
    </div>
  </teleport>
</template>

<style scoped>
.cf { position: fixed; inset: 0; z-index: 3000; }
.cf__scrim { position: absolute; inset: 0; background: rgba(9, 9, 11, 0.5); animation: cf-fade 0.18s ease; }
.cf__panel { position: absolute; top: 0; right: 0; height: 100%; width: 440px; max-width: 92vw; background: var(--ds-color-surface); display: flex; flex-direction: column; box-shadow: var(--ds-shadow-4); animation: cf-slide 0.22s var(--ds-ease-standard); }
@keyframes cf-fade { from { opacity: 0; } }
@keyframes cf-slide { from { transform: translateX(100%); } }

/* Held timer bar (DS primary) */
.cf__held { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; background: var(--ds-color-background-brand-bold); color: #fff; flex: none; }
.cf__held-label { display: inline-flex; align-items: center; gap: 7px; font-size: 0.875rem; font-weight: 500; }
.cf__clock { font-weight: 700; font-variant-numeric: tabular-nums; font-size: 1rem; }
.cf__close { position: absolute; top: 52px; left: 14px; width: 34px; height: 34px; border: 0; border-radius: 50%; background: var(--ds-palette-zinc-100); color: var(--ds-color-text); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 2; }
.cf__close:hover { background: var(--ds-palette-zinc-200); }

.cf__body { flex: 1; overflow-y: auto; }
.cf__pad { padding: 18px 20px 24px; }

/* Reserve carousel */
.cf__carousel { position: relative; }
.cf__img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; display: block; background: var(--ds-palette-zinc-100); }
.cf__img--empty { display: flex; align-items: center; justify-content: center; color: var(--ds-color-text-disabled); }
.cf__arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border: 0; border-radius: 50%; background: rgba(0, 0, 0, 0.45); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.cf__arrow:hover { background: rgba(0, 0, 0, 0.65); }
.cf__arrow--prev { left: 10px; }
.cf__arrow--next { right: 10px; }
.cf__dots { position: absolute; bottom: 10px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; }
.cf__dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255, 255, 255, 0.55); cursor: pointer; }
.cf__dot.is-active { background: #fff; }

.cf__hotel { font-size: 1.375rem; font-weight: 700; margin: 0; color: var(--ds-color-text); line-height: 1.2; }
.cf__hotel--sm { font-size: 1.0625rem; }
.cf__stars { color: var(--ds-palette-amber-400); margin-top: 4px; display: flex; }
.cf__stars--sm { margin-top: 2px; }
.cf__addr { color: var(--ds-color-text-subtle); font-size: 0.9375rem; margin-top: 8px; }

.cf__rule { height: 1px; background: var(--ds-color-border); margin: 16px 0; }
.cf__kv { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 4px 0; color: var(--ds-color-text); font-size: 0.9375rem; }
.cf__kv > span:first-child { color: var(--ds-color-text-subtle); }
.cf__kv > span:last-child { color: var(--ds-color-text); }
.cf__kv--total { font-size: 1.0625rem; }
.cf__kv--total > span { color: var(--ds-color-text) !important; font-weight: 700; }
.cf__b { font-weight: 700; }
.cf__roomhdr { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--ds-color-text-subtle); margin-bottom: 8px; }

/* Hold */
.cf__hotelrow { display: flex; align-items: center; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid var(--ds-color-border); }
.cf__thumb { width: 52px; height: 52px; border-radius: var(--ds-radius-sm); object-fit: cover; flex: none; background: var(--ds-palette-zinc-100); }
.cf__group { padding: 14px 0; border-bottom: 1px solid var(--ds-color-border); }
.cf__grouphdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.cf__grouphdr > span { font-weight: 700; font-size: 0.9375rem; color: var(--ds-color-text); }
.cf__remove { background: none; border: 0; padding: 0; cursor: pointer; color: var(--ds-color-text-danger); font-weight: 600; font-size: 0.875rem; }
.cf__remove:hover { text-decoration: underline; }
.cf__night { display: flex; align-items: center; gap: 10px; padding: 6px 0; font-size: 0.875rem; }
.cf__date { flex: 1; min-width: 0; color: var(--ds-color-text); }
.cf__unit { color: var(--ds-color-text-subtle); width: 26px; }
.cf__left { color: var(--ds-palette-orange-600); font-weight: 600; white-space: nowrap; }
.cf__rate { color: var(--ds-color-text-subtlest); white-space: nowrap; min-width: 64px; text-align: right; }

.cf__step { display: inline-flex; align-items: center; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); }
.cf__step-btn { width: 30px; height: 30px; border: 0; background: transparent; color: var(--ds-color-text-subtlest); font-size: 1.0625rem; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: var(--ds-radius-md); }
.cf__step-btn:hover:not(:disabled) { color: var(--ds-color-text); background: var(--ds-palette-zinc-100); }
.cf__step-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.cf__step-val { min-width: 26px; text-align: center; font-weight: 600; color: var(--ds-color-text); }

.cf__addhotel { display: inline-flex; align-items: center; gap: 4px; background: none; border: 0; padding: 16px 0 0; cursor: pointer; color: var(--ds-color-text-info); font-weight: 600; font-size: 0.9375rem; }
.cf__addhotel:hover { text-decoration: underline; }

/* Footer */
.cf__foot { flex: none; border-top: 1px solid var(--ds-color-border); padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; background: var(--ds-color-surface); }
.cf__selhdr { background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; font-size: 1rem; padding: 10px 14px; border-radius: var(--ds-radius-md); }
.cf__heldnote { display: flex; align-items: center; gap: 7px; background: var(--ds-color-background-warning); color: var(--ds-palette-amber-800); border: 1px solid var(--ds-palette-amber-200); border-radius: var(--ds-radius-md); padding: 9px 12px; font-size: 0.8125rem; }
.cf__btn { height: 48px; border-radius: var(--ds-radius-md); font-weight: 600; font-size: 0.9375rem; }
.cf__btn--primary { background: var(--ds-color-background-brand-bold); color: #fff; }
.cf__btn--primary.is-disabled { background: var(--ds-palette-slate-400); pointer-events: none; }
.cf__btn--outline { border: 1px solid var(--ds-color-border-bold); color: var(--ds-color-text); }
.cf__btn--outline:hover { background: var(--ds-palette-zinc-100); }

@media (max-width: 480px) { .cf__panel { width: 100vw; } }
</style>
