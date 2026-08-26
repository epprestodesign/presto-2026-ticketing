<script setup>
// Stage 4 — Checkout. The real library CheckoutPageExpanded in `ticketing` mode:
// ONE long form — Contact, Payment, Review your order and Policies all open at
// once, every field in its input state — beside the same sticky order rail.
//
// EXPANDED, NOT STEPPED (Aug 25). This screen mounted the stepped CheckoutPage
// until this round: one section open at a time, a Next between each, completed
// sections collapsing behind an Edit. It was replaced because a stepper is the
// wrong instrument for this particular checkout. The order being confirmed here
// is three purchases from three fulfilments — a room, tournament passes and
// attraction tickets — and the guest's actual question at this point is "is all
// of that right, together, before I pay". A flow that shows them a third of it
// at a time and asks them to advance answers that question last, in the smallest
// possible box, after the other two thirds have folded shut.
//
// The rejected alternative was keeping the accordion and auto-opening every
// step. CheckoutPage's state — current step, furthest step, per-step summaries,
// the Edit affordances, the Next handler — all stays live under that, and the
// page ends up carrying a stepper's mechanics with none of its behaviour.
// CheckoutPageExpanded is the library's own answer, shares the SAME rail and the
// same step components, and only replaces the left column.
//
// `ticketing` rather than `reservation` is the whole trick. The reservation
// checkout renders ONE hotel and its nights; the ticketing checkout hands its
// rail to CartReview, which groups an itemized cart under section headings by
// line type. Feed it a cart holding a hotel line, ticket lines and experience
// lines and the rail prints exactly what this edge case asks for — Hotel,
// Tickets and Experiences in one order, each line expandable, under one total —
// with no library change at all.
//
// `summary` is intentionally thin here: in ticketing mode the rail IS the cart,
// so the OrderSummary model only backs the final step's amount. The grouped price
// lines it also carries exist for the nav cart and for any future rail variant —
// they are built from the same cart, so they can never disagree with it.
//
// The single "Book Now" at the bottom advances to Confirmation (App shell click
// handler) — one submit for the whole order, no per-section commit.
//
// THE HOLD COUNTDOWN FLOATS (Aug 25, follow-up). "Time left to book" ships
// INSIDE the rail — CheckoutPageExpanded's own .ck__timer block, under the cart
// card — which means it scrolls off the top of the viewport the moment the guest
// starts filling in contact and card details. That is the one screen where the
// number actually matters, so the stakeholder asked for it pinned and always
// visible. The library's own HoldTimerPill is mounted fixed bottom-right and THE
// RAIL'S COPY IS HIDDEN (see the :deep rule below): one hold gets one clock.
//
// The rejected alternative was leaving both. Two countdowns for one hold on one
// screen is the same number in two places, and they are two SEPARATE timers —
// the rail's interval lives in CheckoutPageExpanded, the pill's in HoldTimerPill
// — so they start together and drift apart, and a guest who sees 7:12 in the rail
// and 7:09 in the corner has no idea which one the hold actually follows.
//
// A FIXED PILL IS NOT A POP-UP, so it needs none of the cart peek's exception
// treatment. The no-pop-ups rule is about surfaces that INTERRUPT: something
// that takes the screen, traps focus and has to be dismissed before the guest
// can carry on. This takes no click, blocks nothing, dismisses nothing and can
// be ignored entirely — it is page furniture anchored to the viewport instead of
// to the document, the same class of thing as the rail's own `position: sticky`.
// The cart peek is still the only overlay in this app.
import { computed } from 'vue'
import CheckoutPage from '@lib/components/checkout/CheckoutPageExpanded.vue'
import HoldTimerPill from '@lib/components/HoldTimerPill.vue'
import { journey, activeHotel } from '../store.js'
import { buildCart, buildSummary } from '../itinerary.js'

const cart = computed(() => buildCart(journey, activeHotel.value))
const summary = computed(() => buildSummary(journey, activeHotel.value, cart.value))
</script>

<template>
  <div class="xco">
    <checkout-page mode="ticketing" :cart="cart" :summary="summary" :show-teams="false" />

    <!-- The hold, pinned. `seconds` is the SAME cart.heldSeconds that used to
         feed the rail's (now hidden) block, so there is exactly one starting
         number in the app — and it is a fixed 895 in itinerary.js, never seeded
         off Date.now(), so every demo run opens on the same 14:55 and no two
         screenshots disagree. `running` lets the pill tick it down itself, which
         is how the Checkout Experience stories mount it.
         Rendered HERE, in the checkout screen, rather than in App.vue: mounted
         on the shell it would outlive the screen, and a hold countdown running
         over the landing page, the hotel list or — worst — the confirmation for
         an order already paid for is alarming rather than useful. Nothing is
         being held once the receipt exists. -->
    <hold-timer-pill
      :seconds="cart.heldSeconds" running position="bottom-right"
      label="Time left to book" sub="Your room and rate are held while it runs"
    />
  </div>
</template>

<style scoped>
.xco { display: flex; flex-direction: column; flex: 1; }

/* THE RAIL'S OWN COUNTDOWN, HIDDEN — the floating pill is the same hold, and one
   hold gets one clock. Suppressed from THIS APP with a scoped :deep() rather
   than edited out of the library, which is read-only and shared with five other
   prototypes — the same scoped reach-in the browse screen and the cart page
   already use to restyle library internals, here turned on a whole block. The
   timer is rendered inline in the rail (not teleported), so :deep() reaches it.
   The rejected alternative was a `showTimer` prop on CheckoutPageExpanded: that
   is a library change, and the library is shared. */
.xco :deep(.ck__timer) { display: none; }

/* WHAT THE PILL SITS ON, measured at 1440×900 and 1440×700. The pill occupies
   the bottom-right 342×59 band and reserves no space — it is fixed, so it cannot
   push the layout, which is the whole point of asking for it pinned. Nothing the
   guest acts on is under it at either height: Book Now and every field are in the
   left column (which ends at x≈808, the pill starts at x≈1074), and the sticky
   rail's bottom is clamped to the bottom of the checkout grid, which lands ~100px
   ABOVE the band at both sizes — the Total row included. Mid-scroll the rail's
   text passes behind the pill, as it does behind any fixed element, and scrolling
   on reveals it.
   The one thing that came to REST under it was the page footer's legal line, and
   the fix for that is in App.vue (`.hfapp--held`), not here: the footer is
   PageFrame's, a sibling of this screen's slot, so no scoped :deep() from inside
   .xco can reach it. No padding rule is added on this side — one that changes
   nothing measurable is worse than none. */
</style>
