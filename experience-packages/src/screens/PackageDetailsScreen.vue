<script setup>
// Packages · Package Details — the real library PackageDetailPage (value props,
// signature experiences, the packages grid, policies). Selecting a package
// continues to the packages+hotel checkout.
import { computed } from 'vue'
import PackageDetailPage from '@lib/components/PackageDetailPage.vue'
import { gallery, experiences, policies } from '@lib/stories/packagedetails/_pd-components-data.js'
import { generatePackageGrid } from '@lib/lib/bundles.js'
import { event } from '@lib/stories/ticketing/_ticketing-flow-carts.js'
import { journey, nav, setTab } from '../store.js'

const packages = computed(() => generatePackageGrid(event, { count: 9, nights: 1 }))
const add = (pkg) => { journey.activePkg = pkg; nav('checkout') }
</script>

<template>
  <div class="xpd">
    <package-detail-page
      :event="event" :packages="packages" :gallery="gallery"
      :experiences="experiences" :policies="policies"
      :initial-tab="journey.tab" @update:tab="setTab"
      @back="nav('packages')" @select="add"
    />
  </div>
</template>

<style scoped>
.xpd { display: flex; flex-direction: column; flex: 1; }
</style>
