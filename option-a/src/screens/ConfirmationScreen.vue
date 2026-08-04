<script setup>
// Review · Confirmation — the real library ConfirmationPage (mode="ticketing",
// Packages + Hotel): the order-confirmed screen with the package info AND the
// full hotel reservation details + policies. To plan again, use the EventPipe
// wordmark (→ Landing) or the "Plan another" action below.
import { computed } from 'vue'
import ConfirmationPage from '@lib/components/confirmation/ConfirmationPage.vue'
import { cartFor } from '../fixtures.js'
import { confData } from '@lib/stories/confirmation/_ticketing-confirm-data.js'
import { configuredHotel as room, configuredRoom as roomType, configuredExtra as extra, priced } from '../configured.js'
import { retime } from '../event.js'
import { resetJourney } from '../store.js'

// Confirms exactly what was booked: the chosen package, and the room chosen from
// its hotel options (omitted entirely for a package-only order).
// confData() stamps the library's December gameday weekend onto the stay and the
// event line; retime() moves both onto this event's Sep 19–20 weekend.
const data = computed(() => retime(confData(cartFor(priced.value.pkgForCart, extra.value), {
  orderNumber: 'EP-6T2N8V',
  ...(room.value
    ? { hotel: { name: room.value.name, roomType: roomType.value ? `${roomType.value.name} · ${roomType.value.bed}` : room.value.roomType, rate: roomType.value?.nightly ?? room.value.nightlyRate, nights: room.value.nights } }
    : {}),
  bannerTitle: 'Success! Your package is confirmed.',
  statusNote: room.value
    ? {
        title: 'Your stay and experience are set',
        body: 'Your hotel stay is confirmed now. Event tickets are issued by the venue and arrive in a separate email — everything is part of this one order.',
      }
    : {
        title: 'Your experience is set',
        body: 'Event tickets are issued by the venue and arrive in a separate email. No hotel stay is included in this package.',
      },
})))
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
