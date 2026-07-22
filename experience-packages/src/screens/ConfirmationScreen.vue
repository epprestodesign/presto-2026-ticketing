<script setup>
// Review · Confirmation — the real library ConfirmationPage (mode="ticketing",
// Packages + Hotel): the order-confirmed screen with the package info AND the
// full hotel reservation details + policies. To plan again, use the EventPipe
// wordmark (→ Landing) or the "Plan another" action below.
import ConfirmationPage from '@lib/components/confirmation/ConfirmationPage.vue'
import { packagesHotelCart, pkgHotel } from '@lib/stories/ticketing/_ticketing-flow-carts.js'
import { confData } from '@lib/stories/confirmation/_ticketing-confirm-data.js'
import { resetJourney } from '../store.js'

const data = confData(packagesHotelCart, {
  orderNumber: 'EP-6T2N8V',
  hotel: { name: pkgHotel.hotel.name, roomType: pkgHotel.hotel.roomType, rate: pkgHotel.hotel.nightlyRate, nights: pkgHotel.nights || 1 },
  bannerTitle: 'Success! Your package is confirmed.',
  statusNote: {
    title: 'Your stay and experience are set',
    body: 'Your hotel stay is confirmed now. Event tickets are issued by the venue and arrive in a separate email — everything is part of this one order.',
  },
})
</script>

<template>
  <div class="xconfirm">
    <confirmation-page mode="ticketing" :data="data" />
    <div class="xconfirm__foot">
      <button type="button" class="xconfirm__again" @click="resetJourney">
        <q-icon name="restart_alt" size="18px" /> Plan another
      </button>
    </div>
  </div>
</template>

<style scoped>
.xconfirm { display: flex; flex-direction: column; flex: 1; }
.xconfirm__foot { display: flex; justify-content: center; padding: 8px 24px 48px; }
.xconfirm__again { display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 22px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button); background: var(--ds-color-surface); color: var(--ds-color-text); font: inherit; font-weight: 700; cursor: pointer; }
.xconfirm__again:hover { background: var(--ds-color-surface-sunken); }
</style>
