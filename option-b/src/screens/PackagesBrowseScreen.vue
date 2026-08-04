<script setup>
// Packages · Browse Packages — the ONLY package screen (Aug 4 rework v2). The
// real library PackageListPage renders its hero, filter rail and result list;
// this app overrides two of its children (see vite.config.js):
//   • the result row  → horizontal card + inline room-availability panel
//   • the quick view  → the full package modal that replaced Package Details
//
// The grid mixes package + hotel SKUs with package-only ones (../packages.js) —
// a row shows its rooms line only when the package includes a stay.
// "Reserve" in the modal goes straight to Checkout with the configured package.
import { computed } from 'vue'
import PackageListPage from '@lib/components/PackageListPage.vue'
import EventHeaderBar from '../components/EventHeaderBar.vue'
// This app's event (Steelers at Patriots) in place of the library's sample one —
// it drives the hero header here and seeds the generated package grid.
import { EVENT as event } from '../event.js'
import { packageGrid } from '../packages.js'
import { hotelById } from '../hotelSelection.js'
import { journey, setGuests, nav } from '../store.js'

// Step 3 (package path) — scoped by what happened in step 2:
//   • a hotel was picked  → only packages that include a stay
//   • "skip / no hotel"   → only package-only SKUs
//   • neither (deep link) → everything
const hotel = computed(() => (journey.hotelId ? hotelById(journey.hotelId) : null))
const packages = computed(() => {
  if (journey.noHotel) return packageGrid.value.filter((p) => !p.hotel)
  if (hotel.value) return packageGrid.value.filter((p) => p.hotel)
  return packageGrid.value
})

// The modal's Reserve — the package (and whatever hotel/room/extra was chosen
// inside it) is already on the journey; just move to checkout.
const reserve = (pkg) => { journey.skipPackage = false; journey.activePkg = pkg; nav('checkout') }
</script>

<template>
  <div class="xpkg" :class="{ 'xpkg--nohotel': journey.noHotel }">
    <event-header-bar
      :note="hotel ? `Packages at ${hotel.name} — your stay is included`
        : journey.noHotel ? 'Packages without a hotel stay' : 'Choose a package'"
    />

    <p v-if="hotel || journey.noHotel" class="xpkg__scope">
      <q-icon :name="journey.noHotel ? 'confirmation_number' : 'hotel'" size="18px" />
      <span v-if="hotel">
        Showing <strong>{{ packages.length }} packages</strong> at
        <strong>{{ hotel.name }}</strong> — your stay is already included.
      </span>
      <span v-else>
        Showing <strong>{{ packages.length }} packages</strong> with
        <strong>no hotel stay</strong> — tickets and experiences only.
      </span>
      <button type="button" class="xpkg__change" @click="nav('hotels')">
        {{ journey.noHotel ? 'Add a hotel' : 'Change hotel' }}
      </button>
    </p>

    <package-list-page
      :event="event" :packages="packages" :initial-guests="journey.guests"
      @update:guests="setGuests" @select="reserve"
    />
  </div>
</template>

<style scoped>
.xpkg { display: flex; flex-direction: column; flex: 1; }

/* The page's own hero is dropped — the compact event bar above replaces it. */
.xpkg :deep(.plp__hero) { display: none !important; }

/* No-hotel path: nothing about rooms or availability belongs on these rows —
   there is no stay to have availability for. Hides the status line, the
   Availability toggle and its panel. */
.xpkg--nohotel :deep(.prc__status),
.xpkg--nohotel :deep(.prc__availtoggle),
.xpkg--nohotel :deep(.prc__avail) { display: none !important; }

/* Which hotel these packages belong to, and a way back to step 2. */
.xpkg__scope { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; max-width: min(1440px, 92%); margin: 16px auto 0; padding: 12px 16px; border-radius: 10px; background: var(--ds-color-surface-sunken, #f1f2f4); }
.xpkg__scope .q-icon { color: var(--ds-color-text-brand); }
.xpkg__change { margin-left: auto; background: none; border: 0; padding: 0; font: inherit; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }

/* The package modal is FULL SCREEN (the dialog itself is patched to `maximized`),
   so nothing constrains its width or leaves a gutter around it. */
.xpkg :deep(.q-dialog__inner) { padding: 0 !important; }
.xpkg :deep(.q-dialog__inner > *) { max-width: none; max-height: none; width: 100%; height: 100%; border-radius: 0; }
</style>
