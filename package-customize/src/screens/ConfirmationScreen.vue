<script setup>
// Confirmation — the real library ConfirmationPage (mode="ticketing", Packages +
// Hotel): the order-confirmed screen with the package info AND the full hotel
// reservation details + policies. To plan again, use the EventPipe wordmark or
// the "Plan another" action below.
//
// There is always a stay here, so the package-only branch the sibling prototypes
// carry is gone: every package in this catalogue includes a hotel, and the
// customize screen can move it or change the room but never remove it. A "no
// stay" branch would have been dead code pretending to be a case.
import { computed } from 'vue'
import ConfirmationPage from '@lib/components/confirmation/ConfirmationPage.vue'
import { cartFor } from '../fixtures.js'
import { confData } from '@lib/stories/confirmation/_ticketing-confirm-data.js'
import { configuredHotel as stay, configuredRoom as roomType, priced } from '../configured.js'
import { retime } from '../event.js'
import { resetJourney, basePackage, isCustomized } from '../store.js'

// Confirms exactly what was booked — the CONFIGURED tier, hotel, room and
// extras, not the preset the guest started from.
// confData() stamps the library's December gameday weekend onto the stay and the
// event line; retime() moves both onto this event's Sep 19–20 weekend.
const data = computed(() => retime(confData(cartFor(priced.value.pkgForCart), {
  orderNumber: 'EP-6T2N8V',
  hotel: {
    name: stay.value.name,
    roomType: `${roomType.value.name} · ${roomType.value.bed}`,
    rate: stay.value.nightlyRate,
    nights: stay.value.nights,
  },
  bannerTitle: 'Success! Your package is confirmed.',
  // The banner names the package the guest STARTED from, and says plainly that
  // what was booked is their version of it. An order confirmation that repeats a
  // catalogue name over a configuration that no longer matches it is the one
  // place this flow could be accused of a bait-and-switch.
  statusNote: {
    title: isCustomized.value ? `Your customised ${basePackage.value.name} is booked` : `Your ${basePackage.value.name} is booked`,
    body: 'Your hotel stay is confirmed now. Event tickets are issued by the venue and arrive in a separate email — everything is part of this one order.',
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
