<script setup>
// Review · Confirmation — the real library ConfirmationPage (mode="ticketing",
// Tickets + Hotel): the order-confirmed screen with the ticket guarantees AND the
// full hotel reservation details + policies. To plan again, use the EventPipe
// wordmark (→ Landing) or the "Plan another" action below.
import ConfirmationPage from '@lib/components/confirmation/ConfirmationPage.vue'
import { ticketsHotelCart, hotel } from '@lib/stories/ticketing/_ticketing-flow-carts.js'
import { confData } from '@lib/stories/confirmation/_ticketing-confirm-data.js'
import { resetJourney } from '../store.js'

const data = confData(ticketsHotelCart, {
  orderNumber: 'EP-7Q4M2X',
  hotel: { name: hotel.name, roomType: hotel.roomType, rate: hotel.nightlyRate, nights: 1 },
  bannerTitle: 'Success! Your hotel + tickets are confirmed.',
  statusNote: {
    title: 'Two confirmations, two emails',
    body: 'Your hotel stay is confirmed now. Your event tickets are issued by the venue and arrive in a separate email — both are already part of this order and payment is complete.',
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
