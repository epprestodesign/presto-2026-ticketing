<script setup>
// PackageQuickViewDialog — FORK for the "Mike Edits Aug 4" prototype.
//
// This replaces BOTH the library's condensed quick view AND the Package Details
// page: everything about a package now lives in one scrollable modal, modelled on
// an OTA room-information sheet —
//
//   photo carousel · what's included · specs · rating
//   → the package's hotels, each expanding to its room types
//     (bed, size, sleeps, view, per-room amenities)
//   → paid extras for the chosen room
//   → price summary + Reserve (straight to checkout)
//
// A package with no stay simply renders without the hotels/rooms block.
// Every hotel and brand name is a link that opens the read-only Hotel Details
// page in a NEW TAB — informational only, nothing selectable there.
//
// Keeps the library component's contract (`pkg` prop; close/select/customize
// emits) so PackageListPage renders it unchanged; wired in by the resolveId
// override in vite.config.js.
import { computed, ref, watch, onUnmounted } from 'vue'
import Carousel from './Carousel.vue'
import BookingSummary from './package/BookingSummary.vue'
import TierPicker from './package/TierPicker.vue'
import HotelRoomPicker from './package/HotelRoomPicker.vue'
import PackageInclusions from './package/PackageInclusions.vue'
import GamedayTimeline from './package/GamedayTimeline.vue'
import PackagePolicies from './package/PackagePolicies.vue'
import { hotelOptionsFor } from '../hotelOptions.js'
import { roomsFor, resolveRoomType, ROOM_EXTRAS } from '../rooms.js'
import { TIERS, priceConfig, resolveTier } from '../pricing.js'
import { GAMEDAY_TIMELINE, PACKAGE_POLICIES, inclusionsFor } from '../packageDetail.js'
import { STAY_LABEL } from '../event.js'
import { journey, setRoom, setRoomType, setExtra, setTier, setGuests, openHotelInNewTab, closePackage } from '../store.js'

const props = defineProps({
  pkg: { type: Object, required: true },
})
const emit = defineEmits(['close', 'select', 'customize'])

const p = computed(() => props.pkg)
const soldOut = computed(() => p.value.soldOut)
const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: p.value.currency || 'USD', maximumFractionDigits: 0 }).format(n || 0)

// --- Photos ---
const photos = computed(() => {
  const shots = []
  if (p.value.image) shots.push({ src: p.value.image, alt: p.value.name })
  for (const r of rooms.value) for (const ph of r.photos || []) shots.push({ src: ph.src, alt: ph.alt })
  return shots.slice(0, 6)
})
const frame = ref(0)
const stepPhoto = (d) => {
  const n = photos.value.length
  if (n) frame.value = (frame.value + d + n) % n
}

// --- Hotels & rooms -----------------------------------------------------------
const hotelOptions = computed(() => hotelOptionsFor(p.value))
const hasStay = computed(() => hotelOptions.value.length > 0)

// Which hotel's rooms are expanded. Defaults to the package's own hotel.
const openHotelId = ref(null)
const activeHotel = computed(
  () => hotelOptions.value.find((h) => h.id === (journey.roomHotelId || openHotelId.value)) ||
        hotelOptions.value.find((h) => h.included) || hotelOptions.value[0] || null
)
watch(activeHotel, (h) => { if (h && !openHotelId.value) openHotelId.value = h.id }, { immediate: true })

const rooms = computed(() => (activeHotel.value ? roomsFor(activeHotel.value, p.value.nights || 1) : []))
const room = computed(() => resolveRoomType(rooms.value, journey.roomTypeId))
const extra = computed(() => ROOM_EXTRAS.find((e) => e.id === journey.extraId) || ROOM_EXTRAS[0])

const toggleHotel = (h) => {
  openHotelId.value = openHotelId.value === h.id ? null : h.id
  setRoom(h.id)
}
const chooseRoom = (r) => { setRoom(r.hotelId); setRoomType(r.typeId) }

// Party size vs. what the room sleeps — a nudge, not a blocker.
const tooManyGuests = computed(() => !!room.value && journey.guests > room.value.sleeps)

// --- Tier, party size, price ---------------------------------------------------
// Tier and guests both re-price the package live (see ../pricing.js): the ticket
// portion is tier.price × guests, the experience value holds, and the package's
// own bundle-discount rate is re-applied.
const tier = computed(() => resolveTier(journey.tierId, p.value.ticket?.tierId))
const guests = computed(() => journey.guests)
const nights = computed(() => p.value.nights || 1)

const price = computed(() => priceConfig(p.value, {
  tier: tier.value,
  guests: guests.value,
  hotel: activeHotel.value,
  room: room.value,
  extra: extra.value,
}))

const extraCost = computed(() => price.value.extraCost)
const total = computed(() => price.value.total)

const MIN_GUESTS = 1
const MAX_GUESTS = 12
const stepGuests = (d) => setGuests(Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, guests.value + d)))

// The itemised inclusions, timeline and policies that fill out the right column.
const inclusions = computed(() => inclusionsFor(p.value))

const reserve = () => {
  if (soldOut.value) return
  emit('select', p.value)
}

// QDialog unmounts this content on close, whichever way it was dismissed (the X,
// ESC, the backdrop, or Reserve navigating away) — so this is the one reliable
// place to drop `&pkg=` from the URL.
onUnmounted(closePackage)
</script>

<template>
  <div class="pqv">
    <!-- Sticky header -->
    <header class="pqv__head">
      <button type="button" class="pqv__close" aria-label="Close" @click="emit('close')">
        <q-icon name="close" size="20px" />
      </button>
      <span class="pqv__headtitle">Package information</span>
    </header>

    <div class="pqv__scroll">
      <!-- Two columns: the package on the left, where you'll stay on the right.
           A package with no hotel collapses to a single column. -->
      <div class="pqv__cols">
        <div class="pqv__col pqv__col--pkg">
          <!-- Photo carousel -->
          <div v-if="photos.length" class="pqv__gallery">
            <img :src="photos[frame].src" :alt="photos[frame].alt" class="pqv__img" />
            <template v-if="photos.length > 1">
              <button type="button" class="pqv__nav pqv__nav--prev" aria-label="Previous photo" @click="stepPhoto(-1)">
                <q-icon name="chevron_left" size="24px" />
              </button>
              <button type="button" class="pqv__nav pqv__nav--next" aria-label="Next photo" @click="stepPhoto(1)">
                <q-icon name="chevron_right" size="24px" />
              </button>
              <span class="pqv__count">{{ frame + 1 }} / {{ photos.length }}</span>
            </template>
            <span class="pqv__theme"><q-icon :name="p.icon || 'star'" size="15px" /> {{ p.theme }}</span>
          </div>

          <h2 class="pqv__title">{{ p.name }}</h2>
          <p v-if="p.tagline" class="pqv__tagline">{{ p.tagline }}</p>
          <p v-if="p.sponsor" class="pqv__sponsor">Presented by {{ p.sponsor }}</p>

          <!-- What's included — a carousel of the package's components. -->
          <Carousel label="inclusions" class="pqv__grid">
            <div class="pqv__gitem">
              <q-icon name="confirmation_number" size="24px" />
              <span>{{ tier.name }} ticket × {{ guests }}</span>
            </div>
            <div v-if="hasStay" class="pqv__gitem">
              <q-icon name="hotel" size="24px" />
              <span>{{ nights }} night{{ nights === 1 ? '' : 's' }} · {{ hotelOptions.length }} hotels</span>
            </div>
            <div v-for="e in (p.experiences || [])" :key="e.label || e" class="pqv__gitem">
              <q-icon :name="e.icon || 'auto_awesome'" size="24px" />
              <span>{{ e.label || e }}</span>
            </div>
          </Carousel>

          <!-- Specs -->
          <ul class="pqv__specs">
            <li><q-icon name="stadium" size="18px" /> Gillette Stadium · Foxborough, MA</li>
            <li><q-icon name="event" size="18px" /> Sun, Sep 20, 2026 · 1:00 PM kickoff</li>
            <li v-if="hasStay"><q-icon name="date_range" size="18px" /> {{ STAY_LABEL }}</li>
            <li><q-icon name="group" size="18px" /> Priced for {{ p.quantity }} guest{{ p.quantity === 1 ? '' : 's' }}</li>
            <li v-if="!hasStay"><q-icon name="info" size="18px" /> Package only — no hotel stay included</li>
          </ul>

          <BookingSummary
            :pkg="p" :price="price" :tier="tier" :guests="guests" :nights="nights"
            :has-stay="hasStay" :active-hotel="activeHotel" :room="room" :extra="extra"
            :sold-out="soldOut" :stay-label="STAY_LABEL"
            @update:guests="setGuests" @reserve="reserve"
          />
        </div>

        <!-- The choices column: tier for every package, hotels when there's a
             stay, then the written detail. Package-only SKUs fill it too. -->
        <div class="pqv__col pqv__col--stay">
          <TierPicker
            :model-value="tier.id" :guests="guests"
            @update:model-value="setTier"
          />

          <HotelRoomPicker
            v-if="hasStay"
            :hotels="hotelOptions" :nights="nights" :guests="guests"
            :open-hotel-id="openHotelId" :room-type-id="journey.roomTypeId" :extra-id="journey.extraId"
            @toggle-hotel="toggleHotel" @choose-room="chooseRoom"
            @open-hotel="openHotelInNewTab" @set-extra="setExtra"
          />

          <PackageInclusions :items="inclusions" />

          <GamedayTimeline />

          <PackagePolicies />
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Full-screen sheet (the dialog is patched to `maximized`): a fixed header over
   two independently scrolling columns — the package and its price on the left,
   everything about the stay on the right. Each block inside is its own component
   under ./package/, so this file only styles the shell. */
.pqv { display: flex; flex-direction: column; width: 100%; height: 100%; background: var(--ds-color-surface, #fff); border-radius: 0; overflow: hidden; font-family: var(--ds-font-family); }

.pqv__head { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-bottom: 1px solid var(--ds-color-border); flex: none; }
.pqv__close { width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid var(--ds-color-border-brand, #1b4ed8); border-radius: 50%; background: none; color: var(--ds-color-link, #1b4ed8); cursor: pointer; }
.pqv__headtitle { font-size: 1.125rem; font-weight: 700; color: var(--ds-color-text); }

.pqv__scroll { flex: 1; min-height: 0; overflow: hidden; }
.pqv__cols { display: grid; grid-template-columns: minmax(380px, 38%) minmax(0, 1fr); height: 100%; max-width: 1680px; margin: 0 auto; }
.pqv__col { min-width: 0; height: 100%; overflow-y: auto; }
.pqv__col--pkg { padding: 0 0 32px; border-right: 1px solid var(--ds-color-border); }
.pqv__col--stay { padding: 28px 36px 40px; display: flex; flex-direction: column; gap: 0; }

.pqv__gallery { position: relative; aspect-ratio: 16 / 10; background: var(--ds-color-surface-sunken, #f1f2f4); }
.pqv__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pqv__nav { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; display: grid; place-items: center; border: 0; border-radius: 50%; background: rgba(255,255,255,.92); color: #16202e; cursor: pointer; }
.pqv__nav--prev { left: 14px; }
.pqv__nav--next { right: 14px; }
.pqv__count { position: absolute; right: 14px; bottom: 12px; padding: 3px 10px; border-radius: 999px; background: rgba(0,0,0,.6); color: #fff; font-size: .8125rem; }
.pqv__theme { position: absolute; left: 14px; top: 12px; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: rgba(0,0,0,.6); color: #fff; font-size: .8125rem; font-weight: 700; }

.pqv__title { margin: 24px 28px 0; font-size: 1.625rem; font-weight: 700; color: var(--ds-color-text); }
.pqv__tagline { margin: 6px 28px 0; color: var(--ds-color-text-subtle); }
.pqv__sponsor { margin: 4px 28px 0; font-size: .875rem; color: var(--ds-color-text-subtle); }
.pqv__grid { margin: 20px 28px; }
.pqv__gitem { flex: 0 0 clamp(150px, 46%, 190px); display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 8px; padding: 16px 12px; border-radius: 10px; background: var(--ds-color-surface-sunken, #f1f2f4); text-align: center; font-size: .875rem; color: var(--ds-color-text); }
.pqv__gitem .q-icon { color: var(--ds-color-text-brand); }
.pqv__specs { list-style: none; margin: 0 28px 8px; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.pqv__specs li { display: flex; align-items: center; gap: 10px; color: var(--ds-color-text); }
.pqv__specs .q-icon { color: var(--ds-color-text-subtle); }

@media (min-width: 1500px) {
  .pqv__col--stay { padding: 32px 56px 48px; }
}
@media (max-width: 1000px) {
  .pqv__scroll { overflow-y: auto; }
  .pqv__cols { grid-template-columns: minmax(0, 1fr); height: auto; }
  .pqv__col { height: auto; overflow: visible; }
  .pqv__col--pkg { border-right: 0; }
  .pqv__col--stay { border-top: 1px solid var(--ds-color-border); padding: 24px 20px 32px; }
}
</style>
