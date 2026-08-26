<script setup>
// Checkout — the library's CheckoutPageExpanded in mode="ticketing", handed
// whatever the trip turned out to be.
//
// Nothing about this page knows the trip was built out of order, and it doesn't
// need to: buildTripCart() hands it an ordinary itemized ticketing cart, so a
// hotel-only trip, a tickets-only trip and a parking-pass-only trip all arrive as
// the same shape with different lines. The page is mounted exactly as shipped.
//
// The EXPANDED checkout rather than the stepped one, for the same reason Option
// D moved: `CheckoutPage`'s left column is an accordion that reveals one section
// at a time behind a Next button, so the order can't be read in full until the
// last step. A trip assembled out of order deserves to be reviewable in one
// piece, and the rail — cart, countdown, order summary — is identical either way.
//
// One deliberate asymmetry: this is the FIRST surface in the flow where the trip
// is fixed. Its cart body (CartReview) edits a deep copy of what it's given, so
// changing a quantity here would move a number the trip never sees — an "Edit
// trip" link goes back to the one place that owns those numbers instead. Editing
// stops when paying starts, and that boundary is drawn once, here.
//
// ── AUG 25, FOURTH ROUND: TWO CHANGES, BOTH ABOUT THE TOP OF THIS PAGE ──
//
// 1. THE "EDIT TRIP" BAR IS GONE. This screen used to open with a strip — a
//    ← Edit trip button and the sentence "Quantities and rooms are changed in
//    your trip — this page states what's being charged." Both went, on the same
//    note that took the customize stepper, the event strip, the checkout config
//    strip and the hotel stay band tonight: a band that restates what a rail
//    already says, and pushes the actual work below the fold.
//
//    NOTHING IS STRANDED BY ITS REMOVAL, and that was checked rather than
//    assumed. The route back to an editable trip is on this screen twice, above
//    the fold, and neither is new: TripNav's cart icon is live here (it hides
//    only on the confirmation) and opens the peek, and TripBar is sticky here
//    (it hides only on the confirmation) with its total wired to the same peek
//    plus the three Add doors. The peek mounts TripItems in its `peek` variant,
//    which by that component's density-only rule carries every control the /trip
//    page carries — nights, rooms, quantity steppers, Remove, and the doors to
//    add more — so a guest can do from here anything the deleted button led to.
//    The peek correctly drops its own "Checkout" button while checkout is the
//    page underneath it.
//
//    REJECTED: replacing the bar with a smaller line, a link in the header, or
//    a note on the rail. That is the same band with fewer pixels. The sentence
//    it carried was explaining the page's read-only rail, and a rail that has to
//    be explained in a banner above itself is the thing to fix, not to caption.
//
// 2. THE HOLD COUNTDOWN IS PINNED — AND IN THIS PROTOTYPE IT HAD TO BE
//    RE-WORDED. See the pill in the template.
import { computed } from 'vue'
import CheckoutPageExpanded from '@lib/components/checkout/CheckoutPageExpanded.vue'
import HoldTimerPill from '@lib/components/HoldTimerPill.vue'
import { items, totals, isEmpty, nav } from '../store.js'
import { buildTripCart, EVENT, EVENT_VENUE, stayById, tierById, addonById } from '../trip.js'

// The hold, in seconds, as a CONSTANT — no Date.now(), no clock reading, the
// same rule the store's line ids follow. A demo opens on the same number every
// run, and a screenshot taken twice is the same screenshot. 895 is the library's
// own default for the rail's copy, so the one countdown this page shows starts
// where the hidden one would have.
const HOLD_SECONDS = 895

const cart = computed(() => buildTripCart(items.value))

// ── THE RAIL HAS TO FOLLOW AN EDIT MADE FROM THE PEEK, AND ON ITS OWN IT DOES
//    NOT. Found while removing the "Edit trip" bar, and fixed rather than left. ──
//
// CheckoutPageExpanded snapshots what it is handed exactly once —
// `reactive(JSON.parse(JSON.stringify(props.cart)))` — with no watcher on the
// prop. So a trip changed while checkout is the page underneath leaves the rail
// printing the OLD total: press "2 nights" in the peek and the URL, the trip bar
// and the peek's own footer all move to $1,133 while the rail still says $803.
// Verified before the fix; verified gone after.
//
// This was always true, but the "Edit trip" bar hid it: that button left for
// /trip, and coming back re-mounted this screen, which re-took the snapshot. With
// the bar gone the peek is the route back, it edits in place, and the page stays
// mounted — so the latent bug becomes the normal path. A prototype whose whole
// claim is that every line reconciles to the dollar across the trip bar, the
// checkout rail and the rail's own Subtotal + Fees + Taxes cannot ship a rail
// that quietly disagrees with the cart that fed it.
//
// The fix is a KEY, not a patch to the library: a signature of the trip, so any
// change to it re-mounts the page and re-takes the snapshot from the current
// cart. src/ is shared by four prototypes and every checkout story, and a
// `watch` on props.cart belongs inside that component, not smuggled in from a
// screen that doesn't own it.
//
// WHAT THE KEY COSTS, stated because it is a real cost: a re-mount clears
// anything typed into the contact and payment fields. That is the right side of
// the trade — the guest just deliberately changed their trip, and a form
// preserved beside a total that is wrong is worse than a form to re-enter — but
// it is the reason the key is a SIGNATURE and not, say, the total alone: it must
// fire on real changes and on nothing else, so an identical trip never re-mounts.
// REJECTED: keying on `cart` object identity (the computed rebuilds on any store
// touch, so it would re-mount on navigation too), and re-mounting on every peek
// close (same clearing, whether or not anything was edited).
const cartKey = computed(() => items.value.map((i) => (
  i.kind === 'stay' ? `s${i.hotelId}.${i.roomId}.${i.nights}.${i.rooms}`
    : i.kind === 'ticket' ? `t${i.tierId}.${i.qty}`
      : `a${i.addonId}.${i.qty}`
)).join('|'))

// The sticky rail's model. Rows describe the trip in the guest's own terms — one
// line per category present, and none for a category they never bought, so the
// rail of a tickets-only order doesn't have a blank "Hotel" waiting on it.
const summary = computed(() => {
  const stay = items.value.find((i) => i.kind === 'stay')
  const tickets = items.value.filter((i) => i.kind === 'ticket')
  const addons = items.value.filter((i) => i.kind === 'addon')
  const rows = []
  if (stay) rows.push({ label: 'Stay', value: `${stayById(stay.hotelId).name} · ${stay.nights} night${stay.nights === 1 ? '' : 's'}` })
  if (tickets.length) rows.push({ label: 'Tickets', value: tickets.map((t) => `${t.qty} × ${tierById(t.tierId).name}`).join(', ') })
  if (addons.length) rows.push({ label: 'Add-ons', value: addons.map((a) => `${a.qty} × ${addonById(a.addonId).name}`).join(', ') })

  const t = totals.value
  const priceLines = []
  if (t.stay) priceLines.push({ label: 'Stay', value: t.netStay })
  if (t.tickets) priceLines.push({ label: 'Tickets', value: t.tickets })
  if (t.addons) priceLines.push({ label: 'Add-ons', value: t.addons })
  if (t.fees) priceLines.push({ label: 'Service fee', value: t.fees })
  if (t.taxes) priceLines.push({ label: 'Taxes', value: t.taxes })

  return {
    image: EVENT.image,
    title: EVENT.name,
    subtitle: EVENT_VENUE,
    rows,
    rrow1: rows.map((r) => r.value).join(' · ') || 'Your trip',
    priceLines,
    total: t.total,
    note: 'One charge for everything in your trip.',
  }
})
</script>

<template>
  <div class="cs">
    <checkout-page-expanded v-if="!isEmpty" :key="cartKey" mode="ticketing" :cart="cart" :summary="summary" />

    <!-- ── THE HOLD, PINNED ──
         The countdown shipped INSIDE the rail (CheckoutPageExpanded's .ck__timer
         block, under the cart card), which means it scrolls away the moment the
         guest starts typing into the form — the one screen where the number
         actually matters. The stakeholder asked for it always in the viewport,
         so the library's own HoldTimerPill is mounted fixed bottom-right and the
         rail's copy is hidden below. One hold gets one clock.

         WHAT THIS TIMER HONESTLY CLAIMS, WHICH IS NOT WHAT THE SIBLING
         PROTOTYPES CLAIM. This flow holds NOTHING while the trip is being built,
         and says so out loud on the trip page: "Nothing is charged and nothing is
         held until you check out — come back and change any of it." TripFlyout
         makes the same promise from the other side ("a trip you are invited to
         keep editing can't also be expiring"). So the stories' "Seats held" and
         tickets-first's "Your seats and rate are held while it runs" are both
         WRONG HERE — they would date the hold to some earlier moment the guest
         never had, and flatly contradict a sentence this prototype makes a point
         of. The hold starts WHEN CHECKOUT STARTS, which is the promise those two
         sentences already make, and the sub-label says exactly that: held while
         you check out, NOT BEFORE. Same countdown, same urgency, no contradiction
         — and reaching this page is the event that begins it, which is why the
         pill lives on this screen and starts when it mounts.

         REJECTED: keeping the library's default sub ("Rooms are held while the
         timer runs") — it is untrue twice over here, since a trip can be
         tickets-only or add-ons-only and have no room in it at all.

         A FIXED PILL IS NOT A POP-UP, and that distinction is load-bearing in
         this prototype: the cart peek is the ONE sanctioned overlay and the
         no-pop-ups rule is why. The rule is about surfaces that INTERRUPT —
         something that takes the screen, drops a scrim, traps focus and must be
         dismissed before the guest can carry on. This takes no click, covers no
         control, dismisses nothing and can be ignored: it is page furniture
         anchored to the viewport instead of to the document, the same class of
         thing as the sticky rail beside it or the docked TripBar above it. It
         needs no exception and is NOT a second overlay. -->
    <hold-timer-pill
      v-if="!isEmpty"
      :seconds="HOLD_SECONDS" running position="bottom-right"
      label="Time left to book" sub="Held while you check out — not before"
    />

    <!-- Reachable by deep link with an empty cart; says what's missing rather
         than rendering a checkout for nothing. -->
    <div v-else class="cs__empty">
      <h2>There's nothing to check out yet</h2>
      <p>Add a hotel, tickets or an add-on — any one of them is enough to check out with.</p>
      <button type="button" class="cs__cta" @click="nav('landing')">Start your trip</button>
    </div>
  </div>
</template>

<style scoped>
.cs { display: flex; flex-direction: column; flex: 1; }

/* THE RAIL'S OWN COUNTDOWN, HIDDEN. The pill above is the same hold, and the
   same number in two places on one screen would drift the moment either was
   re-seeded — they are two independent intervals over two independent seeds.
   The rail's is the one that goes, because the pill is the one that was asked
   for and the one that stays in the viewport.
   HIDDEN HERE RATHER THAN REMOVED THERE: src/ is the shared library, four
   prototypes and every checkout story read this component, and three of those
   want the in-rail block. A scoped :deep() reaches it because the block is
   rendered inline in the rail, not teleported — the same technique TripNav uses
   on GlobalNav's stuck badge.
   It also buys back ~110px of rail height, which is why the clearance rules
   below are as small as they are. */
.cs :deep(.ck__timer) { display: none; }

/* Clearance for the pill, so nothing can come to rest permanently underneath it.
   Neither rule moves anything on the page — they only guarantee the last row can
   be scrolled clear of the pill's ~80px band in the bottom-right corner.
   At 1440×900 and 1440×700 the two-column grid (1fr 400px, capped at 1040 and
   centred) keeps the submit button in the LEFT column, ending ~600px clear of a
   right-anchored pill — the only element that shares the pill's x-range is the
   sticky rail, hence the rail padding.
   Under 880px the library collapses to one column and the full-width submit
   reaches the bottom-right corner itself, so the page gets the same clearance
   below its last element instead. */
.cs :deep(.ck__railwrap) { padding-bottom: 84px; }

/* AUG 26: clear the sticky app chrome. CheckoutPageExpanded pins its rail at
   `top: 20px`, which assumes nothing is docked above it — so the rail's head was
   already tucking ~31px under the old sticky trip bar, and the nav joining that
   block (see App.vue) would have taken it to ~104px. The library file is not
   touched; the offset is applied from here, reading the same height the chrome
   publishes. */
.cs :deep(.ck__railwrap) { top: calc(var(--tb-chrome-h, 124px) + 20px); }
@media (max-width: 880px) { .cs { padding-bottom: 84px; } }

.cs__empty { max-width: 520px; margin: 60px auto; text-align: center; font-family: var(--ds-font-family); }
.cs__empty h2 { margin: 0 0 8px; font-size: 1.375rem; font-weight: 800; color: var(--ds-color-text); }
.cs__empty p { margin: 0 0 20px; color: var(--ds-color-text-subtle); }
.cs__cta { height: 46px; padding: 0 22px; border: 0; border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
</style>
