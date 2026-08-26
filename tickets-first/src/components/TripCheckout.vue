<script setup>
// Step 3 — REVIEW, WHICH IS THE CHECKOUT. Aug 25, verbatim: "can there be a
// checkout? Like, I want to pay." Until this round the cart handed straight to
// the confirmation and nothing in the flow ever asked for a name or a card.
//
// AUG 25, THAT EVENING — THIS SCREEN BECAME THE STEPPER'S THIRD STEP:
//
//   "make sure the review screen is the checkout. i want the review to be the
//    cart flyout."
//
// The separate cart page is deleted, so this page is both the review and the
// payment. It can carry that because CheckoutPageExpanded already states the
// order twice: the "Review your order" section in the open form, and the
// itemised CartReview rail beside it, whose lines include the bundle credit as
// its own row (see buildCheckoutCart). Nothing the deleted screen said about
// what is being bought was only said there.
//
// THE "BACK TO YOUR TRIP" BAR IS GONE, by instruction — "the top of checkout
// clean". It was a strip above the page carrying a back button and a sentence
// explaining that quantities, rooms and extras were changed somewhere else.
// Both halves died with the cart page: the button pointed at a screen that no
// longer exists, and the sentence described a separation between "your trip" and
// "the checkout" that no longer exists either. What replaces it is nothing: the
// stepper above (Review, lit) is the orientation, the rail is the statement of
// charges, and the Global Nav's cart button — visible on this screen — opens the
// peek, where the trip is edited in place. No substitute bar, banner or note.
//
// The page is the library's CheckoutPageExpanded in `ticketing` mode — the
// EXPANDED variant, not the stepped CheckoutPage, and that is the other half of
// the ask: "I don't want this next. I want one big form... We're definitely
// getting rid of that step, step, step for a full open." CheckoutPage's left
// column is an accordion that opens one section at a time behind a Next button,
// so the order cannot be read in full until the last step. The expanded page
// shows contact, payment, review and policies all open at once, every field in
// its input state, with ONE submit at the bottom. The rail — the itemized cart,
// the hold countdown, the totals — is identical in both, and the stakeholder
// said the rail was already right.
//
// Two things this screen adds around it.
//
// 1. THE SUBMIT IS INTERCEPTED. CheckoutPageExpanded's "Book Now" fires a
//    Quasar notify and nothing else — it has no event to bind. The click is
//    caught on the way DOWN (capture) and stopped, so the toast never fires:
//    a toast reading "Reservation confirmed" while the app is already
//    navigating to the real confirmation is the same news twice, in two places,
//    one of which disappears.
//
// 2. EDITING STOPS HERE — on the page. The rail is `readonly` and its lines
//    carry no unitPrice (see buildCheckoutCart), so nothing on this page can
//    move a number. CartReview edits a deep copy of whatever it is handed, so an
//    editable rail would change a total the trip never sees — the cart, this
//    page and the receipt have to agree to the dollar. The one surface that owns
//    those numbers is the cart peek, and it is a cart-button click away from
//    here rather than a screen away.
//
// 3. THE HOLD COUNTDOWN FLOATS. "Time left to book" shipped inside the rail
//    (CheckoutPageExpanded's own .ck__timer block, under the cart card), which
//    means it scrolls off the moment the guest starts filling in the form —
//    the one screen where the number actually matters. The stakeholder asked for
//    it pinned and always visible, so the library's own HoldTimerPill is mounted
//    bottom-right and THE RAIL'S COPY IS HIDDEN: two countdowns for one hold, on
//    one screen, would be the same number in two places and would drift the
//    moment either was re-seeded. The rail's is the one that goes, because the
//    pill is the one that must exist.
//
//    A FIXED PILL IS NOT A POP-UP. The no-modals rule is about surfaces that
//    interrupt — something that takes the screen, traps focus and has to be
//    dismissed before the guest can carry on. This takes no click, blocks
//    nothing, dismisses nothing and can be ignored: it is page furniture that
//    happens to be anchored to the viewport instead of to the document, the same
//    class of thing as a sticky rail. It needs no exception and is NOT a second
//    overlay — the cart peek is still the only one of those.
import { computed } from 'vue'
import CheckoutPageExpanded from '@lib/components/checkout/CheckoutPageExpanded.vue'
import HoldTimerPill from '@lib/components/HoldTimerPill.vue'
import { buildCheckoutCart } from '../addons.js'

const props = defineProps({
  cart: { type: Object, required: true },   // buildTripCart() result
  event: { type: Object, required: true },
})
const emit = defineEmits(['submit'])

const checkoutCart = computed(() => buildCheckoutCart(props.cart))

// The rail's summary model. CheckoutPageExpanded reads `total` off it for the
// review section; the rest describes the trip in the guest's own terms, and a
// category the trip does not contain gets no line rather than a blank one.
const summary = computed(() => {
  const c = props.cart
  const ticket = c.items.find((i) => i.type === 'ticket')
  const stay = c.items.find((i) => i.type === 'hotel')
  const extras = c.items.filter((i) => i.type === 'experience')

  const rows = []
  if (ticket) rows.push({ label: 'Tickets', value: `${ticket.qty} × ${ticket.label.replace(/ ticket$/, '')}` })
  if (stay) rows.push({ label: 'Stay', value: stay.label })
  if (extras.length) rows.push({ label: 'Gameday extras', value: extras.map((e) => e.label).join(' · ') })

  const priceLines = []
  if (c.ticketSubtotal) priceLines.push({ label: 'Tickets', value: c.ticketSubtotal })
  if (c.hotelTotal) priceLines.push({ label: 'Stay', value: c.hotelTotal })
  if (c.addOnTotal) priceLines.push({ label: 'Gameday extras', value: c.addOnTotal })
  if (c.credit) priceLines.push({ label: 'Bundle credit', value: -c.credit })
  if (c.fees) priceLines.push({ label: 'Service fees', value: c.fees })
  if (c.taxes) priceLines.push({ label: 'Taxes', value: c.taxes })

  return {
    image: props.event.image,
    title: props.event.name,
    subtitle: props.event.venue?.name,
    rows,
    rrow1: rows.map((r) => r.value).join(' · ') || 'Your trip',
    priceLines,
    total: c.total,
    note: 'One secure charge — tickets, stay and extras together.',
  }
})

function onClickCapture(e) {
  const btn = e.target instanceof Element ? e.target.closest('.ck__submit') : null
  if (!btn) return
  e.preventDefault()
  e.stopPropagation()
  emit('submit')
}
</script>

<template>
  <div class="tco" @click.capture="onClickCapture">
    <CheckoutPageExpanded mode="ticketing" :cart="checkoutCart" :summary="summary" />

    <!-- The hold, pinned. `seconds` comes off the same cart object that feeds
         the rail's (now hidden) copy, so there is one starting number in the app
         — a fixed 895, not a clock reading, so a demo opens on the same time
         every run. `running` lets the pill tick it down itself, which is how the
         ticketing stories mount it.
         Rendered here rather than in App.vue so it cannot outlive the screen: a
         hold countdown over the landing page, the ticket map or — worst — the
         receipt for an order already paid for would be alarming and untrue. -->
    <HoldTimerPill
      :seconds="checkoutCart.heldSeconds" running position="bottom-right"
      label="Time left to book" sub="Your seats and rate are held while it runs"
    />
  </div>
</template>

<style scoped>
.tco { display: flex; flex-direction: column; font-family: var(--ds-font-family); }

/* THE RAIL'S OWN COUNTDOWN, HIDDEN — the floating pill is the same hold and one
   hold gets one clock. Hidden here rather than removed there: the library is
   read-only, and this is the same technique HotelDetails.vue uses on the hotel
   page's two modal triggers. The block is rendered inline in the rail (not
   teleported), so a scoped :deep() rule reaches it. */
.tco :deep(.ck__timer) { display: none; }

/* Clearance for the pill, so nothing important can come to rest under it.
   At 1440×900 and 1280×720 the two-column grid keeps the submit button in the
   left column (the pill is right-anchored, ~300px wide) and the sticky rail's
   card ends well above the pill's 84px band — nothing overlaps. The rail
   padding is for the tall case: a four-extra trip whose rail card runs past the
   fold, where the last totals row would otherwise stop right behind the pill.
   Under 880px the library collapses the grid to one column and the full-width
   submit button reaches the bottom-right corner, so the page gets the same
   clearance below its last element. Neither rule moves anything on the page —
   they only guarantee the last row can be scrolled clear. */
.tco :deep(.ck__railwrap) { padding-bottom: 84px; }
@media (max-width: 880px) { .tco { padding-bottom: 84px; } }

/* The order rail pins itself at `top: 20px`, which was 20px from the top of the
   window and is now 20px UNDER the pinned header's row — the rail would come to
   rest with its "Your order" heading and the first line or two of the itemised
   trip hidden behind the step bar, on the one screen whose whole job is letting
   a guest check what they are about to be charged for. Re-based on the measured
   header height, it keeps the same 20px of air, just below the chrome instead of
   behind it. See the `.bapp__chrome` note in App.vue. */
.tco :deep(.ck__railwrap) { top: calc(var(--tf-chrome-h, 0px) + 20px); }
</style>
