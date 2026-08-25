<script setup>
// Confirmation — one order, covering whatever the trip contained.
//
// The library's ConfirmationPage (mode="ticketing") already renders a ticketing
// order plus an optional hotel reservation block, and confData() already builds
// that from a cart. So the only work here is describing a trip of ANY shape
// honestly, which is mostly a matter of what the banner is allowed to say:
//
//   stay + tickets (+ add-ons) → "Your trip is confirmed."
//   tickets only               → "Your tickets are confirmed."
//   stay only                  → "Your stay is confirmed."
//   add-ons only               → "Your add-ons are confirmed."
//
// A partial trip is not a degraded trip, and a page that congratulates someone on
// their "package" when they bought a parking pass is the exact failure this
// prototype was built to avoid. The hotel reservation block appears only when a
// room was actually booked; the ticket guarantees only when tickets were.
import { computed } from 'vue'
import ConfirmationPage from '@lib/components/confirmation/ConfirmationPage.vue'
import { confData } from '@lib/stories/confirmation/_ticketing-confirm-data.js'
import { items, resetTrip } from '../store.js'
import { buildTripCart, stayById, roomById, checkInLabel, checkOutLabel } from '../trip.js'

const stay = computed(() => items.value.find((i) => i.kind === 'stay') || null)
const hasTickets = computed(() => items.value.some((i) => i.kind === 'ticket'))
const hasAddons = computed(() => items.value.some((i) => i.kind === 'addon'))

const room = computed(() => (stay.value ? roomById(stay.value.hotelId, stay.value.roomId) : null))
const roomLabel = computed(() => (stay.value && stay.value.rooms > 1 ? `${room.value.name} × ${stay.value.rooms}` : room.value?.name))
const roomNote = computed(() => (room.value
  ? `${room.value.bed} · sleeps ${room.value.sleeps * stay.value.rooms} · near Gillette Stadium`
  : ''))

const banner = computed(() => {
  if (stay.value && hasTickets.value) return 'Success! Your trip is confirmed.'
  if (hasTickets.value) return 'Success! Your tickets are confirmed.'
  if (stay.value) return 'Success! Your stay is confirmed.'
  if (hasAddons.value) return 'Success! Your add-ons are confirmed.'
  return 'Success! Your order is confirmed.'
})

// Two fulfilments means two emails, and saying so is only true when there are
// two. A tickets-only order gets the sentence that applies to it.
const statusNote = computed(() => {
  if (stay.value && hasTickets.value) return { title: 'Two confirmations, one charge', body: 'Your room is confirmed with the property now. Your tickets are issued by the venue and arrive in a separate email — both were paid for in this single order.' }
  if (stay.value) return { title: 'Your room is held in your name', body: 'The property has your reservation. You can add tickets or add-ons to a separate order at any time — nothing about this booking depends on them.' }
  if (hasTickets.value) return { title: 'Tickets arrive before gameday', body: 'They are delivered to the EventPipe app and scanned at the gate. A room and add-ons can still be booked separately if you decide you want them.' }
  return { title: 'Bring your confirmation', body: 'Your add-ons are held in your name at the venue — show this order number on the day.' }
})

const built = (opts) => confData(buildTripCart(items.value), opts)

const data = computed(() => {
  const d = built({
    orderNumber: 'EP-7Q4M2X',
    bannerTitle: banner.value,
    statusNote: statusNote.value,
    // The reservation block prices the rooms actually booked and dates the nights
    // actually chosen — confData()'s defaults describe a one-night King stay, which
    // is only one of the shapes a trip can have.
    hotel: stay.value
      ? {
          name: stayById(stay.value.hotelId).name,
          roomType: roomLabel.value,
          rate: roomById(stay.value.hotelId, stay.value.roomId).rate * stay.value.rooms,
          nights: stay.value.nights,
          note: roomNote.value,
          checkIn: `${checkInLabel()} · 3:00 PM`,
          checkOut: `${checkOutLabel(stay.value.nights)} · 11:00 AM`,
        }
      : null,
  })
  // confData()'s reservation block counts one room per night. A trip can hold
  // several, and the nightly figure already prices all of them — so the count is
  // restated here rather than left reading "1 room" beside a two-room rate.
  const rooms = stay.value?.rooms || 1
  if (rooms > 1) for (const n of d.hotels?.[0]?.rooms?.[0]?.nights || []) n.qty = rooms
  return d
})
</script>

<template>
  <div class="cf">
    <confirmation-page mode="ticketing" :data="data" />
    <div class="cf__foot">
      <!-- The only control in the app that empties the cart, and it lives after
           the order rather than anywhere near the trip. -->
      <button type="button" class="cf__again" @click="resetTrip">
        <q-icon name="restart_alt" size="18px" /> Build another trip
      </button>
    </div>
  </div>
</template>

<style scoped>
.cf { display: flex; flex-direction: column; flex: 1; }
.cf__foot { display: flex; justify-content: center; padding: 8px 24px 48px; }
.cf__again { display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 22px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-surface); font: inherit; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }
.cf__again:hover { background: var(--ds-palette-slate-100, #f1f2f4); }
</style>
