<script setup>
// The Option C landing page — the simplified one-click package board.
//
// This is the whole of the "Next Steps" line from the Aug 4 feedback: build the
// simplified one-click package landing page. It is the FIRST screen, not a step
// reached from a landing hero, so packages are the first thing on screen.
//
// Above the board sit the two UNIVERSAL controls — dates and guests. Both belong
// there rather than on a tile because both re-price all six tiles at once:
// nights multiply every room rate, and the party decides both the free tickets
// and how many rooms each occupancy needs. Six copies of the same two controls
// would be six chances to disagree with each other.
//
// What is deliberately absent, all of it present in Option A:
//   • the filter rail    — "no filtering"
//   • the scrolling list — replaced by a 3-across grid of complete SKUs
//   • the package modal  — "no complex options"; the tile IS the configuration
//
// Selecting a tile records it and goes straight to checkout, so ../configured.js
// resolves exactly as it does in Option A and the shared checkout screen needs no
// Option C special-casing.
import { computed } from 'vue'
import EventHero from '../components/EventHero.vue'
import BookingWidget from '../components/BookingWidget.vue'
import PackageTile from '../components/PackageTile.vue'
import PackageConfirmDialog from '../components/PackageConfirmDialog.vue'
import { packageGrid, HOTELS, priceTile } from '../packages.js'
import {
  journey, selectTile, openHotelInNewTab,
  openPkg, chosenRoom, closePackage, setRoom, confirmPackage,
} from '../store.js'

// Price every tile once, here, from the shared stay — so the whole board moves
// together the moment the dates or the party change.
const priced = computed(() => {
  const map = {}
  for (const t of packageGrid.value) map[t.id] = priceTile(t, journey.guests, journey.nights)
  return map
})

// Badges, used sparingly — ONE on the whole board, or none.
//
// Every tile used to carry two ("Premium/Value stay" and "Tickets free"), which
// made both meaningless: the first repeated the row heading three times in the
// ticket tier's colour, and the second was true of all six. A badge earns its
// place by marking an exception, so exactly one tile gets one — the best value
// per guest, which is a real comparison a guest cannot make at a glance across
// six prices, two occupancies and a nights multiplier.
const bestValueId = computed(() => {
  let best = null
  for (const t of packageGrid.value) {
    const p = priced.value[t.id]
    if (!p) continue
    const perGuest = p.packagePrice / p.guests
    if (!best || perGuest < best.perGuest) best = { id: t.id, perGuest }
  }
  return best?.id || null
})
const flagFor = (id) =>
  id === bestValueId.value ? { label: 'Best value per guest', icon: 'savings' } : null

// The grid is ordered hotel-major, so slicing by hotel gives the two rows their
// own heading without the tiles needing to know which row they're in.
const rows = computed(() =>
  HOTELS.map((hotel) => ({
    hotel,
    tiles: packageGrid.value.filter((t) => t.hotel.id === hotel.id),
    // Rooms needed is a property of the hotel's occupancy, so it's the same for
    // all three tiles in a row — state it once on the row heading.
    rooms: Math.ceil(journey.guests / hotel.sleeps),
  }))
)
</script>

<template>
  <div class="grid">
    <!-- Branded event hero, with the search card tucked onto its bottom edge -->
    <event-hero />
    <!-- Dates + guests, in the Core Booking Widget shape (no group field, no
         Search button) — the two controls that re-price the whole board. Tucked
         up onto the hero, the library's landing-page treatment. -->
    <div class="grid__search">
      <booking-widget :tabs="false" :show-mode="false" :show-teams="false" show-dates />
    </div>

    <div class="grid__inner">
      <!-- The board's premise, stated once. It used to live on a badge on every
           tile, which made it wallpaper rather than a promise. -->
      <p class="grid__promise">
        <q-icon name="confirmation_number" size="18px" />
        <span>
          <strong>Every package includes your ticket free</strong> — you're paying for the room.
          Pick a package below and check out.
        </span>
      </p>

      <section v-for="row in rows" :key="row.hotel.id" class="grid__row">
        <header class="grid__rowhead">
          <div>
            <h2 class="grid__rowtitle">
              {{ row.hotel.stayTier }} ·
              <!-- Hotel name → its read-only details page, in a new tab -->
              <button type="button" class="grid__hotel" @click="openHotelInNewTab(row.hotel.id)">
                {{ row.hotel.name }}<q-icon name="open_in_new" size="15px" />
              </button>
            </h2>
            <p class="grid__rowmeta">
              <q-icon name="star" size="14px" /> {{ row.hotel.rating }}
              · {{ row.hotel.distanceMi }} mi from the stadium
              · {{ row.hotel.blurb }}
            </p>
          </div>
          <span class="grid__rowrooms">
            {{ row.hotel.roomType }} · sleeps {{ row.hotel.sleeps }}
            <template v-if="row.rooms > 1"> · {{ row.rooms }} rooms needed</template>
          </span>
        </header>

        <div class="grid__tiles">
          <package-tile
            v-for="t in row.tiles" :key="t.id" :pkg="t" :priced="priced[t.id]"
            :flag="flagFor(t.id)"
            @select="selectTile" @open-hotel="openHotelInNewTab"
          />
        </div>
      </section>

      <!-- Confirm / choose-your-room dialog. One component, two jobs: the premium
           block offers its room types, the value block confirms its single one. -->
      <package-confirm-dialog
        :pkg="openPkg" :room="chosenRoom" :guests="journey.guests"
        :nights="journey.nights" :range="journey.range"
        @close="closePackage" @set-room="setRoom" @confirm="confirmPackage"
        @open-hotel="openHotelInNewTab"
      />

      <p class="grid__foot">
        Prototype pricing. Ticket face value is shown as the saving; the price
        charged is the contracted room rate for the dates above.
      </p>
    </div>
  </div>
</template>

<style scoped>
.grid { display: flex; flex-direction: column; flex: 1; }
.grid__inner { max-width: min(1440px, 92%); margin: 0 auto; padding: 24px 0 56px; width: 100%; }

/* The search card, tucked onto the hero's bottom edge. `width: 100%` is
   load-bearing: the screen is a column flex container, and margin-inline:auto on
   a column flex item overrides align-self:stretch, so without it the card
   shrink-wraps to its fields instead of spanning the column. */
.grid__search { width: 100%; max-width: min(1240px, 92%); margin: -44px auto 0; position: relative; z-index: 2; }
.grid__search :deep(.bw) { background: var(--ds-color-surface, #fff); border-radius: var(--ds-radius-lg, 12px); box-shadow: var(--ds-shadow-2, 0 8px 28px rgba(0, 0, 0, .16)); }

.grid__promise { display: flex; align-items: center; gap: 10px; margin: 0 0 22px; font-size: .9375rem; color: var(--ds-color-text); }
.grid__promise .q-icon { color: var(--ds-color-text-success, #167a4a); flex: none; }

.grid__row + .grid__row { margin-top: 28px; }
.grid__rowhead { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
.grid__rowtitle { margin: 0; font-size: 1.125rem; font-weight: 700; color: var(--ds-color-text); }
/* `appearance: none` is load-bearing: on macOS a <button> keeps its native grey
   chrome even with background:none and border:0, so the link rendered as a grey
   box. It has to be a button, not an <a>, because it opens a tab via script. */
.grid__hotel { appearance: none; -webkit-appearance: none; display: inline-flex; align-items: center; gap: 4px; padding: 0; border: 0; background: none; font: inherit; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }
.grid__hotel:hover { text-decoration-thickness: 2px; }
.grid__rowmeta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin: 2px 0 0; font-size: .875rem; color: var(--ds-color-text-subtle); }
.grid__rowrooms { font-size: .8125rem; font-weight: 600; color: var(--ds-color-text-subtle); white-space: nowrap; }

/* Three across on the desktop board — the 6 tiles read as two rows of three.
   auto-fit rather than a fixed 3, so the pair of rows reflows intact on the way
   down to a single column instead of stranding one tile on its own line. */
.grid__tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; align-items: stretch; }

.grid__foot { margin: 28px 0 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }
</style>
