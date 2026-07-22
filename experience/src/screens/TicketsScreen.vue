<script setup>
// Tickets · Browse Tickets — the real library TicketMap (SeatGeek-style two-pane
// browse), under the same hero banner the Browse Hotels page uses (nav + stepper
// come from the App shell). Led by the "How many tickets?" quantity prompt on
// load; the map's own "Continue · $…" button advances to the cart.
import { ref, computed } from 'vue'
import TicketMap from '@lib/components/TicketMap.vue'
import TicketQuantityDialog from '@lib/components/TicketQuantityDialog.vue'
import { generateVenueListings, listingPins } from '@lib/lib/seatListings.js'
import { event } from '@lib/stories/ticketing/_ticketing-flow-carts.js'
import defaultBg from '../../../background-img/defaultBackgroundImage.png'
import epLogoWhite from '@lib/assets/eventpipe logos/eventpipe-logo-fff.svg'
import { journey, setGuests, nav } from '../store.js'

const listings = computed(() => generateVenueListings(event, { count: 60 }))
const pins = computed(() => listingPins(listings.value))

const EVENT_NAME = event?.name || 'New England Patriots v Buffalo Bills'
const EVENT_DATES = event?.dateLabel || 'Sat, Dec 6, 2026'
const scrim = 'linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5))'
const heroStyle = { backgroundImage: `${scrim}, url(${defaultBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }

const promptOpen = ref(true)
const onTickets = (n) => { journey.skipTickets = false; setGuests(n); promptOpen.value = false }
const onMapContinue = ({ quantity } = {}) => { journey.skipTickets = false; if (quantity) setGuests(quantity); nav('checkout') }
// "Skip, I don't need tickets" → hotel-only checkout (Book Reservation).
const onSkip = () => { journey.skipTickets = true; promptOpen.value = false; nav('checkout') }
</script>

<template>
  <div class="xtickets">
    <!-- Hero banner — matches the Browse Hotels hero. -->
    <section class="xtickets__hero" :style="heroStyle">
      <div class="xtickets__hero-inner">
        <img :src="epLogoWhite" alt="EventPipe" class="xtickets__hero-logo" />
        <div class="text-h5 xtickets__event">{{ EVENT_NAME }}</div>
        <div class="text-body1 xtickets__dates">{{ EVENT_DATES }}</div>
      </div>
    </section>

    <ticket-map
      :key="journey.guests"
      :event="event" :listings="listings" :pins="pins"
      :max-quantity="8" :initial-quantity="journey.guests"
      @continue="onMapContinue"
    />

    <q-dialog v-model="promptOpen">
      <ticket-quantity-dialog
        title="How many tickets?"
        subtitle="You'll be seated together in one block."
        :selected="journey.guests" :available="8" :max="8" cap-plus
        skip-label="Skip, I don't need tickets"
        @select="onTickets" @skip="onSkip" @close="promptOpen = false"
      />
    </q-dialog>
  </div>
</template>

<style scoped>
.xtickets { display: flex; flex-direction: column; flex: 1; }

/* Hero banner — same treatment as browse/HotelListPage's .hlp__hero. */
.xtickets__hero { position: relative; min-height: 200px; display: flex; align-items: center; justify-content: center; text-align: center; color: #fff; background-color: #000; overflow: hidden; }
.xtickets__hero-inner { padding: 24px; max-width: 760px; }
.xtickets__hero-logo { height: 30px; width: auto; margin: 0 auto 12px; display: block; }
.xtickets__event { font-weight: 700; line-height: 1.15; margin: 0; }
.xtickets__dates { margin-top: 6px; }
</style>
