<script setup>
// Review · Checkout — the real library checkout page, billing exactly the
// configuration the customize screen produced.
//
// `CheckoutPageExpanded`: every section open at once, all fields in their input
// state, one "Book Now" at the bottom (which the App shell intercepts to advance
// to Confirmation). The rail is the library's own sticky cart, countdown and
// order summary, untouched.
//
// --- The configuration strip above it ----------------------------------------
// `CheckoutPageExpanded` reads only `summary.total` off the summary object — its
// rail is the cart, and the `rows` that `OrderSummary` would render never reach
// the page. That is fine for a fixed package, whose cart line says everything
// there is to say. It is not fine here: a guest who downgraded to Upper Level and
// dropped the coach transfer has to see both facts before paying, or the last
// screen before payment describes a package they deliberately stopped buying.
//
// So this screen carries its own strip above the library page, naming every
// switchable component with its CONFIGURED value, and saying which package it
// started from and how many changes were made to it. The name on an order and the
// contents of an order have to be reconcilable, and after customization the name
// alone no longer does that.
//
// The alternative — patching the library page to render summary rows — was
// rejected on the rule every prototype here follows: the library is read-only,
// and anything it can't do gets built alongside it rather than into it.
//
// The cart line still carries the same facts in its expandable "what's inside"
// list (see `experiences` in configured.js), so the two agree; the strip is what
// makes them legible without expanding anything.
//
// --- The hold countdown floats (Aug 25, third pass) --------------------------
// "Time left to book" ships INSIDE the rail — CheckoutPageExpanded's own
// `.ck__timer` panel, below the cart card — so it scrolls off the moment the
// guest starts filling in the form, which is the one screen where the number
// actually matters. The stakeholder asked for it pinned and always in view on
// the sibling `tickets-first` prototype and then asked for the same across all
// four, so the library's own `HoldTimerPill` is mounted bottom-right here and
// THE RAIL'S COPY IS HIDDEN.
//
// One hold gets one clock. Left as-is, the rail panel and the pill would be two
// countdowns for the same hold on the same screen, each ticking on its own
// `setInterval` from its own seed — they would read differently within seconds
// and the guest would have no way to tell which one is the hold. The pill is the
// one that survives, because being always visible is the whole request; the rail
// panel is suppressed with a scoped `:deep()` rule (see the style block) rather
// than by editing the library, which is read-only in every prototype here.
//
// A FIXED PILL IS NOT A POP-UP. The no-modals rule in this prototype is about
// surfaces that INTERRUPT — something that takes the screen, traps focus and has
// to be dismissed before the guest can carry on. This takes no click, covers
// nothing the guest needs, dismisses nothing and can be ignored outright: it is
// page furniture anchored to the viewport instead of to the document, the same
// class of thing as the sticky `PriceRail`. It needs no exception, and it does
// NOT spend the cart peek's one — the peek is still the only overlay here.
//
// Checkout ONLY, and rendered by this screen rather than by App.vue so it cannot
// outlive the screen:
//  · CUSTOMIZE gets no countdown. This prototype exists to let a guest swap
//    hotels, drop a transfer and change their mind twice; a clock ticking over
//    that screen would rush the exact decision it was built to slow down.
//  · CONFIRMATION has been paid for. A hold countdown over a placed order is
//    both alarming and untrue.
import { computed } from 'vue'
import CheckoutPage from '@lib/components/checkout/CheckoutPageExpanded.vue'
import HoldTimerPill from '@lib/components/HoldTimerPill.vue'
import { hotel, cartFor } from '../fixtures.js'
import { makeSummary } from '@lib/stories/checkout/_ticketing-checkout-data.js'
import { configuredPkg as pkg, configuredHotel as stay, configuredRoom as roomType, configuredExtras as extras, configuredTier as tier, priced } from '../configured.js'
import { retime } from '../event.js'
import { journey, basePackage, isCustomized, changesFromPreset } from '../store.js'
import { STAY_SHORT } from '../packages.js'

const packageCart = computed(() => cartFor(priced.value.pkgForCart))

// One row per component the customize screen could change, in the same order it
// presents them — so a guest scanning this strip is re-reading the screen they
// just left, not decoding a new one.
//
// Extras get a row EACH rather than a comma-joined list. A dropped extra is the
// change most likely to be regretted at the door, and a row that simply isn't
// there reads louder than a shorter sentence.
const configRows = computed(() => [
  { label: 'Party', value: `${priced.value.guests} ${priced.value.guests === 1 ? 'person' : 'people'}` },
  { label: 'Tickets', value: `${tier.value.name} × ${priced.value.guests}` },
  { label: 'Hotel', value: `${stay.value.name} · ${STAY_SHORT}` },
  { label: 'Room', value: `${priced.value.rooms} × ${roomType.value.name} · ${roomType.value.bed}` },
  ...extras.value.map((e) => ({ label: e.group === 'transport' ? 'Getting there' : 'Extra', value: e.label })),
])

// The library page uses this for its total only — the rows above are rendered by
// this screen, not by it.
const packageSummary = computed(() =>
  retime(makeSummary(packageCart.value, configRows.value, { rrow1: `${basePackage.value.name} · ${pkg.value.theme}` }))
)

// The hold, as a fixed number of seconds. NOT derived from `Date.now()`: every
// demo of this screen has to open on the same clock, the way the "Checkout
// Experience" stories seed theirs. It is also the seed the library rail's own
// (now hidden) panel defaults to, so there is one starting number in the app.
const HELD_SECONDS = 895

// Hotel-only Book Reservation cart + summary (used when the package is skipped).
const rate = hotel.nightlyRate
const taxes = 26
const bookingFee = 10
const hotelOnlyCart = {
  heldSeconds: HELD_SECONDS,
  hotel: { name: hotel.name, address: '1 Patriot Pl, Foxborough, MA 02035' },
  imageCategories: ['exterior', 'rooms', 'lobby'], seed: 5,
  checkIn: { date: '09/19/2026', time: '3:00pm' }, checkOut: { date: '09/20/2026', time: '11:00am' }, nights: 1,
  roomType: hotel.roomType, bedConfig: '1 King Bed · Sleeps 2', sleeps: 2,
  amenities: [{ icon: 'wifi', label: 'Free WiFi' }, { icon: 'local_parking', label: 'Event parking' }],
  priceDetails: {
    nights: 1, rooms: 1, rate, subtotal: rate, taxes, propertyFee: 0, total: rate + taxes + bookingFee,
    lines: [
      { label: 'Check In', value: 'Sat, Sep 19, 2026', text: true },
      { label: 'Check Out', value: 'Sun, Sep 20, 2026', text: true },
      { label: 'Sat, Sep 19, 2026', value: rate },
      { label: 'Booking Fee', value: bookingFee },
      { label: 'Taxes', value: taxes },
    ],
  },
  roomsLeft: 1,
}
const hotelOnlySummary = {
  title: hotel.name,
  subtitle: `${hotel.roomType} · Sleeps 2`,
  rating: '4.6',
  cancellation: 'Free cancellation before Sep 17, 2026.',
  rrow1: '1 room · 1 night',
  rows: [
    { label: 'Dates', value: 'Sep 19 – 20, 2026', change: true },
    { label: 'Guests', value: '2 adults', change: true },
  ],
  priceLines: [
    { label: `1 night × $${rate}`, value: rate },
    { label: 'Booking fee', value: bookingFee },
    { label: 'Taxes', value: taxes },
  ],
  total: rate + taxes + bookingFee,
  note: 'Near Gillette Stadium',
}

const view = computed(() => journey.skipPackage
  ? { mode: 'reservation', cart: hotelOnlyCart, summary: hotelOnlySummary }
  : { mode: 'ticketing', cart: packageCart.value, summary: packageSummary.value })
</script>

<template>
  <div class="xcheckout">
    <!-- Nothing sits between the nav and "Confirm and pay". Two things have been
         taken off the top of this screen in one evening, in this order:

         1. THE CONFIGURATION STRIP (BOOKING / PARTY / TICKETS / HOTEL / ROOM).
            It restated the package, party, tickets, hotel and room across the
            top of checkout — every one of which the sticky rail on the right
            already itemises, three inches away and in the same viewport. Same
            duplication the customize screen was stripped for ("we have this
            other thing on the side here"), and it pushed the form the guest
            actually has to fill in below the fold.
         2. THE "BACK TO YOUR PACKAGE" LINK, which was kept when the strip went
            because the strip had been carrying the only route back and a
            dead-end checkout would have traded one complaint for a worse one.
            The stakeholder has now seen the link and wants the top clean.

         It is NOT replaced by a smaller band, a banner or a sentence — that is
         the exact shape being removed, and re-adding a quieter version of it
         would be the fourth attempt at the same rejected idea.

         THE ROUTE BACK MOVED INTO THE NAV INSTEAD. `App.vue` used to hide the
         cart button on checkout; it no longer does, and the reason it hid it has
         been repealed by these two deletions — see the NO_CART note there. The
         cart icon is chrome this app already carries on every other screen, it
         adds nothing to the top of THIS one, and its peek links to the full cart
         page, which links to "Back to customizing". So checkout is not a dead
         end and gains no new furniture to make it so. -->
    <checkout-page :mode="view.mode" :cart="view.cart" :summary="view.summary" />

    <!-- The hold, pinned. `running` lets the pill tick down from the fixed seed
         itself, which is how the ticketing stories mount it.
         Copy: what is held here is the whole configured package, not a seat map
         — the guest picked a hotel and a room and kept two extras, and all of it
         is being held together, so the sub-line names them rather than saying
         "seats". Kept to four words past "Your" on purpose: the pill's width is
         its sub-line, and every extra word pushes it further left across the
         sticky rail beside it (measured: "…are held while it runs" made it
         384px, covering half the rail's 400px column at 1440x700). -->
    <hold-timer-pill
      :seconds="HELD_SECONDS" running position="bottom-right"
      label="Time left to book" sub="Your seats, room and extras are held"
    />
  </div>
</template>

<style scoped>
.xcheckout { display: flex; flex-direction: column; flex: 1; }


/* --- THE RAIL'S OWN COUNTDOWN, HIDDEN --------------------------------------- */
/* The floating pill is the same hold, and one hold gets one clock. Two panels
   ticking on two intervals from two seeds would disagree within seconds.
   Hidden here rather than deleted there: `CheckoutPageExpanded` is library code
   and the library is read-only in this prototype — the same technique the
   customize screen already uses to restyle the library rail. The block is
   rendered inline inside the rail (not teleported), so a scoped `:deep()` rule
   reaches it. Its explanatory note goes with it, which is fine: the pill's own
   sub-line says what is held, and the cancellation terms are stated in the
   Policies section further down the same page. */
.xcheckout :deep(.ck__timer) { display: none; }

/* --- Clearance, so nothing important comes to rest under the pill ------------ */
/* The pill is fixed and ~330px wide at the bottom-right, occupying roughly an
   84px band. At 1440x900 and 1440x700 the library's two-column grid keeps the
   "Book Now" submit in the LEFT column, well clear of a right-anchored pill; the
   thing at risk is the sticky rail, whose last rows (the cart card's total) can
   run past the fold on a tall configuration and stop behind the pill. The rail
   padding guarantees they can always be scrolled clear. Neither rule moves
   anything on the page or reserves layout space in the flow — the pill itself
   pushes nothing, which is the point of pinning it.

   Below 880px the library collapses the grid to one column and the full-width
   submit reaches the bottom-right corner, so the page gets the same clearance
   under its last element. */
.xcheckout :deep(.ck__railwrap) { padding-bottom: 84px; }
@media (max-width: 880px) { .xcheckout { padding-bottom: 84px; } }

/* The pill never swallows a click. Clearance fixes where things come to REST;
   it cannot fix mid-scroll, and at 1440x700 the pill's 141px of overlap with the
   rail passes over the cart card's "Hide details" toggle on the way past. A
   status readout with nothing clickable in it has no business intercepting that,
   so it is made transparent to the pointer and the rail stays fully operable
   underneath. Moving or shrinking the pill instead was rejected: it would have
   to clear a 400px rail entirely, which means the bottom-LEFT corner, and the
   left column is where the form and "Book Now" are — the countdown would then be
   sitting on the primary action rather than beside a scrolling list.
   Screen-reader behaviour is unchanged (the pill's own role="status" +
   aria-live="polite" still announce); pointer-events does not affect that. */
.xcheckout :deep(.htp) { pointer-events: none; }

/* --- The sub-1080px fixed bottom bar: no collision, and why ------------------ */
/* This prototype does carry a fixed bottom bar below 1080px (the total plus a
   `CheckoutCta`), but it belongs to `CustomizeScreen` (`.cst__bar`) and to that
   screen alone. `App.vue` mounts exactly ONE screen at a time through
   `<component :is>` with no keep-alive, so the bar is unmounted before this
   screen exists: the pill and the bar can never share a viewport, at any width.
   Verified by grep — `.cst__bar` and `CartPeek`'s overlay are the only two fixed
   elements in this app, and the cart (and therefore the peek) is hidden on
   checkout by `NO_CART` in App.vue.

   So nothing is raised and nothing is hidden by width, and that is the choice:
   adding a width-keyed rule to suppress a bar that is not there would be dead
   CSS pretending to solve a real problem, and the next person would have to
   re-derive that it never fired.

   Worth recording what the answer WOULD have been, because the z-order makes it
   non-obvious: HoldTimerPill sits at z-index 2000 and the bar at z-index 30, so
   if they ever did meet the pill would land ON TOP OF the bar's checkout button.
   The pill must never compete with `CheckoutCta` for the primary action, so the
   fix in that case would be to HIDE THE PILL wherever the bar is showing — not
   to raise it, and not to nudge it up above the bar, which would leave a
   countdown stacked over the one button the guest is meant to press. If a fixed
   bar is ever added to CHECKOUT, that is the rule to write. */
</style>
