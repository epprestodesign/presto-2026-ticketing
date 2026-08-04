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
// This app's event (Steelers at Patriots) in place of the library's sample one —
// it drives the hero header here and seeds the generated package grid.
import { EVENT as event } from '../event.js'
import { packageGrid } from '../packages.js'
import { journey, setGuests, nav } from '../store.js'

const packages = computed(() => packageGrid.value)

// The modal's Reserve — the package (and whatever hotel/room/extra was chosen
// inside it) is already on the journey; just move to checkout.
const reserve = (pkg) => { journey.skipPackage = false; journey.activePkg = pkg; nav('checkout') }
</script>

<template>
  <div class="xpkg">
    <package-list-page
      :event="event" :packages="packages" :initial-guests="journey.guests"
      @update:guests="setGuests" @select="reserve"
    />
  </div>
</template>

<style scoped>
.xpkg { display: flex; flex-direction: column; flex: 1; }

/* The package modal is FULL SCREEN (the dialog itself is patched to `maximized`),
   so nothing constrains its width or leaves a gutter around it. */
.xpkg :deep(.q-dialog__inner) { padding: 0 !important; }
.xpkg :deep(.q-dialog__inner > *) { max-width: none; max-height: none; width: 100%; height: 100%; border-radius: 0; }
</style>
