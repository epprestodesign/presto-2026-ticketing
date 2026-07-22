<script setup>
// Packages · Browse Packages — the real library PackageListPage (Browse Hotels
// layout, with its own event hero). Led by the "How many guests?" prompt on load;
// "Skip, I don't need a package" goes to the hotel-only Book Reservation checkout.
// Quick view / customize / select on a card opens that package's detail screen.
import { ref, computed } from 'vue'
import PackageListPage from '@lib/components/PackageListPage.vue'
import TicketQuantityDialog from '@lib/components/TicketQuantityDialog.vue'
import { generatePackageGrid } from '@lib/lib/bundles.js'
import { event } from '@lib/stories/ticketing/_ticketing-flow-carts.js'
import { journey, setGuests, openPackage, nav } from '../store.js'

const packages = computed(() => generatePackageGrid(event, { count: 9, nights: 1 }))

const promptOpen = ref(true)
const onGuests = (n) => { journey.skipPackage = false; setGuests(n); promptOpen.value = false }
// "Skip, I don't need a package" → hotel-only checkout (Book Reservation).
const onSkip = () => { journey.skipPackage = true; promptOpen.value = false; nav('checkout') }

// "Select" (or Quick view's Customize) → Package Details, landed on the Packages
// tab (?screen=packageDetails&tab=packages).
const view = (pkg) => { journey.skipPackage = false; openPackage(pkg, 'packages') }
</script>

<template>
  <div class="xpkg">
    <package-list-page
      :event="event" :packages="packages" :initial-guests="journey.guests"
      @customize="view" @select="view"
    />
    <q-dialog v-model="promptOpen">
      <ticket-quantity-dialog
        title="How many guests?"
        subtitle="Everyone in your group is included in the package."
        icon="group"
        :selected="journey.guests" :available="8" :max="8" cap-plus
        skip-label="Skip, I don't need a package"
        @select="onGuests" @skip="onSkip" @close="promptOpen = false"
      />
    </q-dialog>
  </div>
</template>

<style scoped>
.xpkg { display: flex; flex-direction: column; flex: 1; }
</style>
