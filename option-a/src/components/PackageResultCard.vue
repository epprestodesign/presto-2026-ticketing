<script setup>
// PackageResultCard — FORK for the "Aug 4 — Option A" prototype.
//
// Same props/emits as the library card, rebuilt to the Browse Hotels **group
// card** layout: photo left, then ONE content region — stacked details (name,
// tagline, inclusions one per line, rooms status) over a footer holding the
// Availability toggle bottom-left and the price + CTA bottom-right. No vertical
// rule between details and price.
//
// It also adds what that group card has and the package row didn't: an
// **Availability** toggle expanding a carousel of the HOTELS this package covers
// (photo, rating, distance, price against the package, rooms left). Each card
// opens the read-only Hotel Details page in a new tab; picking an actual room
// happens in the modal.
//
// Wired in by the resolveId override in vite.config.js, so the library's
// PackageListPage renders this row instead — in this app only.
import { computed, ref, onMounted } from 'vue'
import BundleSavingsBadge from '@lib/components/BundleSavingsBadge.vue'
import HotelAvailability from './HotelAvailability.vue'
import { hotelOptionsFor } from '../hotelOptions.js'
import { roomsFor, roomsAvailable } from '../rooms.js'
import { journey, openPackage } from '../store.js'

const props = defineProps({
  pkg: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['quickview', 'customize', 'select'])

const p = computed(() => props.pkg)
const soldOut = computed(() => p.value.soldOut)
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: p.value.currency || 'USD', maximumFractionDigits: 0 }).format(n || 0)
const expCount = computed(() => (p.value.experiences || []).length)

// --- Hotels (fork) ---
// A package that includes a stay covers several hotels, so the expanded panel
// previews THE HOTELS — one card each, with what it costs against the package
// and how many rooms are left there. Room-by-room detail lives in the modal.
const open = ref(false)
const hotelOptions = computed(() => hotelOptionsFor(p.value))
const packageHotel = computed(() => hotelOptions.value.find((h) => h.included) || hotelOptions.value[0] || null)
const nights = computed(() => p.value.nights || 1)
// Rooms left across every hotel the package covers.
const left = computed(() =>
  hotelOptions.value.reduce((sum, h) => sum + roomsAvailable(roomsFor(h, nights.value)), 0)
)

// Opening the modal is also what "starts configuring" a package, so tell the
// journey store first (it resets any hotel/room chosen for a different package)
// and then let PackageListPage raise its dialog.
const openModal = () => { openPackage(p.value); emit('quickview', p.value) }

// Deep link: `?screen=packages&pkg=<id>` — the row named by the URL raises its own
// modal once mounted. PackageListPage owns the dialog, so asking it through the
// normal `quickview` event beats reaching into the DOM.
onMounted(() => { if (journey.openPkgId === p.value.id) openModal() })

// Mirrors the hotel card's three states: plenty · scarce · none.
const status = computed(() => {
  if (!hotelOptions.value.length) return { tone: 'muted', text: 'Package only — no hotel stay included' }
  if (!left.value) return { tone: 'muted', text: 'No rooms available for these dates' }
  if (left.value <= 3) return { tone: 'warning', text: `Only ${left.value} room${left.value === 1 ? '' : 's'} left across ${hotelOptions.value.length} hotels` }
  return { tone: 'success', text: `${left.value} rooms available · ${hotelOptions.value.length} hotels to choose from` }
})
</script>

<template>
  <div class="prc" :class="{ 'is-selected': selected, 'is-sold': soldOut }" :data-pkg="p.id">
    <!-- Photo -->
    <button type="button" class="prc__media" :style="{ '--accent': `var(${p.accentVar || '--ds-palette-navy-700'})` }" @click="openModal">
      <img v-if="p.image" :src="p.image" :alt="p.name" loading="lazy" />
      <div v-else class="prc__media--empty"><q-icon name="confirmation_number" size="30px" /></div>
      <span class="prc__theme"><q-icon :name="p.icon || 'star'" size="14px" /> {{ p.theme }}</span>
      <span v-if="soldOut" class="prc__soldtag">Sold out</span>
    </button>

    <!-- CONTENT — one region: stacked details on top, availability + price footer
         at the bottom. Same structure as the Browse Hotels group card, so there's
         no vertical rule splitting the row. -->
    <div class="prc__main">
      <div class="prc__body">
        <button type="button" class="prc__name" @click="openModal">{{ p.name }}</button>
        <p v-if="p.tagline" class="prc__tagline">{{ p.tagline }}</p>
        <ul class="prc__incl">
          <li><span class="prc__swatch" :style="{ background: `var(${p.ticket.colorVar})` }" /><strong>{{ p.ticket.tierName }}</strong><template v-if="p.quantity > 1"> ×{{ p.quantity }}</template></li>
          <li v-if="p.hotel"><q-icon name="hotel" size="18px" /> {{ p.hotel.name }} · {{ p.nights }} night{{ p.nights === 1 ? '' : 's' }}</li>
          <li v-if="expCount"><q-icon name="auto_awesome" size="18px" /> {{ expCount }} experience{{ expCount === 1 ? '' : 's' }}</li>
        </ul>

        <div class="prc__status" :class="`prc__status--${status.tone}`">
          <q-icon :name="status.tone === 'success' ? 'check_circle' : status.tone === 'warning' ? 'error' : 'info'" size="18px" />
          <span>{{ status.text }}</span>
        </div>

      </div>

      <div class="prc__footer">
        <button v-if="hotelOptions.length" type="button" class="prc__availtoggle" :aria-expanded="open" @click.stop="open = !open">
          <span class="prc__availtoggle-label">Availability</span>
          <q-icon :name="open ? 'expand_less' : 'expand_more'" size="18px" />
        </button>

        <div class="prc__price">
          <div class="prc__pricelabel">PACKAGE TOTAL</div>
          <div class="prc__amount">
            <span v-if="p.componentsTotal > p.packagePrice" class="prc__was">{{ fmt(p.componentsTotal) }}</span>
            <strong>{{ fmt(p.packagePrice) }}</strong>
          </div>
          <!-- Bundle savings sits right above the CTA, where the hotel card puts
               its Low Rate Guarantee pill. -->
          <BundleSavingsBadge v-if="!soldOut && p.savings > 0" :amount="p.savings" size="sm" class="prc__savings" />
          <button type="button" class="prc__cta" :class="{ 'prc__cta--muted': soldOut }" :disabled="soldOut" @click="openModal">
            {{ soldOut ? 'Sold out' : 'View details' }}
          </button>
        </div>
      </div>
    </div>

    <!-- AVAILABILITY PANEL — the library's carousel, one card per HOTEL (fork) -->
    <div v-if="open && hotelOptions.length" class="prc__avail">
      <p class="prc__availhead">
        <strong>{{ hotelOptions.length }} hotels</strong> covered by this package —
        {{ packageHotel.name }} is the one it's priced around ·
        <button type="button" class="prc__availlink" @click.stop="openModal">choose your room</button>
      </p>
      <hotel-availability :hotels="hotelOptions" :nights="nights" />
    </div>
  </div>
</template>

<style scoped>
/* Layout mirrors the Browse Hotels group card: photo left, one content region
   right (stacked details over an availability + price footer). No vertical rule
   between the details and the price. */
.prc { display: flex; align-items: stretch; flex-wrap: wrap; background: var(--ds-color-surface); border: 1px solid rgba(0,0,0,0.04); border-radius: 12px; overflow: hidden; font-family: var(--ds-font-family); box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 20px rgba(0,0,0,0.06); transition: box-shadow var(--ds-duration-fast) var(--ds-ease-standard); }
.prc:hover { box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 10px 26px rgba(0,0,0,0.10); }
.prc.is-selected { box-shadow: 0 0 0 2px var(--ds-color-border-brand); }
.prc.is-sold { opacity: 0.72; }

.prc__media { position: relative; width: 280px; flex: none; border: 0; padding: 0; cursor: pointer; background: var(--accent); min-height: 190px; overflow: hidden; }
.prc__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.prc__media--empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.8); }
.prc__theme { position: absolute; left: 12px; top: 12px; display: inline-flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.6); color: #fff; font-size: 0.8125rem; font-weight: 700; padding: 4px 10px; border-radius: var(--ds-radius-pill); }
.prc__soldtag { position: absolute; left: 12px; bottom: 12px; background: var(--ds-palette-slate-800, #1f2937); color: #fff; font-size: 0.75rem; font-weight: 700; padding: 3px 9px; border-radius: var(--ds-radius-pill); }

.prc__main { flex: 1; min-width: 0; display: flex; flex-direction: column; padding: 28px 32px; }

/* Details — every line its own row, at the hotel card's rhythm. */
.prc__body { display: flex; flex-direction: column; gap: 12px; }
.prc__name { text-align: left; align-self: flex-start; background: none; border: 0; padding: 0; font: inherit; font-size: 1.375rem; font-weight: 700; color: var(--ds-color-text-brand); cursor: pointer; }
.prc__name:hover { text-decoration: underline; }
.prc__tagline { margin: -6px 0 0; color: var(--ds-color-text-subtle); font-size: 1rem; line-height: 1.4; }
.prc__incl { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.prc__incl li { display: flex; align-items: center; gap: 8px; font-size: 1rem; color: var(--ds-color-text); }
.prc__incl .q-icon { color: var(--ds-color-text-brand); }
.prc__swatch { width: 14px; height: 14px; border-radius: 3px; flex: none; }

.prc__status { display: inline-flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 600; }
.prc__status--success { color: var(--ds-color-text-success, #167a4a); }
.prc__status--warning { color: var(--ds-palette-orange-600, #b45309); }
.prc__status--muted { color: var(--ds-color-text-subtle); }
.prc__savings { align-self: flex-end; margin-top: 6px; }

/* Footer — Availability bottom-left, price + CTA bottom-right. */
.prc__footer { margin-top: auto; padding-top: 20px; display: flex; align-items: flex-end; justify-content: flex-end; gap: 16px; }
.prc__availtoggle { margin-right: auto; min-height: 52px; display: inline-flex; align-items: center; gap: 4px; background: none; border: 0; padding: 0; color: var(--ds-color-link); font: inherit; font-size: 1rem; font-weight: 600; cursor: pointer; }
.prc__availtoggle-label { text-decoration: underline; }

.prc__price { display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 4px; }
.prc__pricelabel { color: var(--ds-color-text-subtle); font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.04em; }
.prc__amount { display: flex; align-items: baseline; gap: 8px; color: var(--ds-color-text-brand); }
.prc__amount strong { font-size: 1.5rem; font-weight: 700; }
.prc__was { color: var(--ds-color-text-subtle); text-decoration: line-through; font-size: 0.9375rem; }
.prc__cta { margin-top: 10px; height: 52px; padding: 0 24px; border: 0; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font-family: inherit; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background var(--ds-duration-fast) var(--ds-ease-standard); }
.prc__cta:hover { background: var(--ds-palette-navy-800); }
.prc__cta--muted { background: var(--ds-palette-navy-400); cursor: default; }

/* Availability panel — full width beneath the photo and content. */
/* `min-width: 0` is load-bearing: as a flex item this panel defaults to
   min-width:auto, so it would GROW to fit the carousel instead of letting the
   track scroll — which also pushed the next arrow outside the row's
   overflow:hidden and made it disappear. */
.prc__avail { flex: 0 0 100%; width: 100%; min-width: 0; border-top: 1px solid var(--ds-color-border); padding: 20px 24px; background: var(--ds-color-surface); }
.prc__availhead { margin: 0 0 12px; font-size: 0.9375rem; color: var(--ds-color-text-subtle); }
.prc__availlink { background: none; border: 0; padding: 0; font: inherit; font-weight: 600; color: var(--ds-color-link); text-decoration: underline; cursor: pointer; }

@media (max-width: 860px) {
  .prc__media { width: 100%; min-height: 180px; }
  .prc__main { padding: 20px 22px; }
  .prc__footer { flex-wrap: wrap; align-items: flex-start; }
  .prc__availtoggle { min-height: 0; }
}
</style>
