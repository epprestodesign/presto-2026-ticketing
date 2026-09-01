<script setup>
// TICKETS-FIRST prototype — the whole trip assembled in the order a fan
// actually decides it: the game first, then somewhere to sleep, then the extras
// around kickoff, then one cart and one charge.
//
// Forked from /bundle, which ended at tickets → seats → hotel → cart. The gap
// this fork closes is the EXTRAS step: parking, a tailgate, a stadium transfer,
// pregame hospitality — each optional, each priced, each landing in the same
// cart as its own removable line. Everything else about the journey is
// unchanged, and every screen is still a real library component via @lib.
//
// Why extras come after the hotel and not beside the tickets: one of them (the
// round-trip transfer) leaves from the hotel lobby, so the offer itself depends
// on an answer the hotel step gives. Putting extras earlier would mean either
// hiding that card or offering a bus from nowhere.
//
// Aug 25 round — two stakeholder asks changed the shape of the flow:
//
//   "Can there be a checkout? Like, I want to pay."  → a real CHECKOUT screen
//   between the cart and the confirmation, collecting contact and payment. It
//   mounts the library's EXPANDED checkout (every section open, one submit),
//   not the stepped one: "I don't want this next. I want one big form."
//
//   "I want to pick the hotel... I want to dig in. I want to pick the room
//   type."  → the hotel step splits in two. The list picks a PROPERTY and opens
//   the booking site's own full hotel page; the room ladder on that page is what
//   puts a rate in the cart. So `hotel` alone is no longer enough state — a stay
//   is a property AND a room, and every price downstream follows the room.
//
// Both arrive as PAGES. No dialogs anywhere in this app, by instruction: "we
// almost never are going to want those modal pop-ups, we're always going to want
// a clean page." The two the library's hotel page ships with are hidden in
// HotelDetails.vue.
//
// Aug 25, later the same round — the front of the flow was replaced with the
// sibling /experience prototype's two opening screens:
//
//   LANDING is now the library's LandingPage (nav, hero, booking widget, the
//   event write-up, ads, footer) instead of this fork's EventHero + paragraph +
//   "Get started". See LandingStep.vue.
//
// Aug 25, later still — THE NAV AND THE CART. The bespoke dark app bar
// ("EventPipe · Client Appreciation" + a prototype pill) is gone and the
// library's real GlobalNav is in its place, with its cart button carrying a
// live count of the lines on the trip. Clicking it opens CartPeek — a slide-
// over summary of the same order the cart screen shows, with the route through
// to that screen in its footer.
//
// That peek is a SCOPED REVERSAL of the no-pop-ups rule, asked for by name:
// a cart you have to leave the step to look at is a cart nobody checks
// mid-flow. It is the ONLY overlay in this app and everything else stays a
// page — the three suppressions below are all still in force. See CartPeek.vue.
//
//   TICKETS is now the library's TicketMap — the two-pane browse where every
//   listing is a real section/row offer with its own price pin — instead of
//   TicketTierList. See TicketMapStep.vue. /experience opens that screen with a
//   "How many tickets?" dialog; it is NOT brought across (this app has zero
//   dialogs), and the map's own quantity select does the same job in place.
//
// Aug 25, that evening — THREE STEPS, AND THE EXTRAS MOVED INTO THE CART:
//
//   "i dont want extras and reviews, i only want tickets, hotel, and review...
//    i think we can put extras in the flyout cart."
//
// The stepper reads Tickets · Hotel · Review and nothing else. Two labels came
// off it, and they came off for different reasons:
//
//   EXTRAS was a real screen and is deleted as a screen. The four offers are
//   not — parking, the tailgate, the transfer and hospitality keep their prices,
//   their units and their rules — they moved into TripCartBody, which means they
//   are in the nav's cart peek AND on the cart screen, addable and removable
//   from either at any point in the flow. Extras were never a decision with a
//   right moment; putting them at one fixed moment cost every guest a screen and
//   caught the ones who changed their mind later with nowhere to go.
//
//   CHECKOUT and CONFIRMED were labels for what happens AFTER the trip is
//   assembled, and a stepper is a map of assembly. They are gone from it and the
//   stepper is hidden on both screens — see the note on STEP_OF.
//
// The hotel dependency that put extras after the hotel in the first place did
// not go away; it just has to be stated in the cart now rather than implied by
// the running order. The transfer renders disabled-with-a-reason plus a link to
// the hotel step, and clearing the stay still drops the transfer with it.
//
// Aug 25, LATER THE SAME EVENING — THE REVIEW STEP IS THE CHECKOUT, AND THE CART
// PAGE IS THE FLYOUT:
//
//   "make sure the review screen is the checkout. i want the review to be the
//    cart flyout."
//
// So the cart SCREEN is deleted and its two jobs are split rather than merged:
//
//   REVIEWING WHAT YOU ARE BUYING is the checkout's job now. The stepper's third
//   label, "Review", lights on the checkout screen — which was hidden behind the
//   bar an hour ago and is now the step it always described. CheckoutPageExpanded
//   already states the order twice (its "Review your order" section and the
//   itemised CartReview rail, credit line included), so the guest arriving there
//   without a full-page review has lost no statement of what is being charged.
//   Only the confirmation still hides the stepper: a receipt is not a step.
//
//   EDITING THE TRIP is the peek's job now, and the peek's alone. The whole
//   control set that lived on the cart screen moved into it — the ticket
//   stepper, the stay's Remove and Change hotel/room, the extras picker, the
//   parking vehicle stepper, the totals, the routes back to Tickets and Hotel.
//   TripCartBody's `readonly` prop is GONE with the screen it distinguished:
//   there is no second, more capable surface for it to name any more.
//
//   RESERVING A ROOM OPENS IT — "i want to link to the flyout cart for the user
//   to review before they go into the review screen that is actually the
//   checkout screen." The last piece of the trip is chosen on the hotel page, so
//   that is where the review belongs; Reserve Room commits the stay and opens
//   the panel over the page instead of navigating anywhere. See selectRoom().
//
// The rejected alternative was keeping the cart page and lighting "Review" on
// it, with checkout past the bar — which is what was there. It makes a guest
// read the same order twice on two consecutive screens and puts the step bar's
// last label on a page that cannot take payment. One screen, one review, one
// charge.
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import GlobalNav from '@lib/components/GlobalNav.vue'
import BundleConfirmation from '@lib/components/BundleConfirmation.vue'
import AppStepper from '@lib/components/AppStepper.vue'
import { EVENT } from './event.js'
import { deriveTiers } from '@lib/lib/seatmap.js'
import { generateVenueListings, listingPins } from '@lib/lib/seatListings.js'
import LandingStep from './components/LandingStep.vue'
import TicketMapStep from './components/TicketMapStep.vue'
import EventBand from './components/EventBand.vue'
import HotelPickStep from './components/HotelPickStep.vue'
import HotelDetails from './components/HotelDetails.vue'
import TripCheckout from './components/TripCheckout.vue'
import TripItinerary from './components/TripItinerary.vue'
import CartPeek from './components/CartPeek.vue'
import { addOnById, buildTripCart } from './addons.js'
import { HOTELS, hotelById, roomFor, defaultRoom, STAY } from './hotels.js'
import { readDeepLink, writeDeepLink } from './deeplink.js'

// This prototype is themed on ONE fixture and ships it (see event.js). The
// sibling tickets-first searches the library's shared fixture list for whatever
// sits at Gillette — which finds the December Bills game. Both prototypes are
// at Gillette, so a search cannot tell them apart; naming the event is what
// makes two Gillette prototypes possible without touching the library.
const event = EVENT
const hotels = HOTELS
const tiers = deriveTiers(event)

// The ticket board. Venue-anchored (every listing sits on a real curated
// Gillette section, so its label, tier and map coordinates agree) and seeded off
// the event, so the same 60 offers at the same prices render on every load —
// this prototype has no Math.random and no Date.now anywhere.
const listings = generateVenueListings(event, { count: 60 })
const pins = listingPins(listings)
const listingById = (id) => listings.find((l) => l.id === id) || null

/**
 * A map listing, in the shape the cart's ticket line already reads.
 *
 * `price` and not `priceWithFees` deliberately: the cart charges the ticket line
 * at face value and adds an 18% ticketing service fee of its own (FEE_RATE),
 * which is exactly the `fees` the listing already carries. So tickets + fees in
 * the cart come to `priceWithFees × quantity` — the number on the map's own
 * "Continue · $…" button. Taking the all-in price here would charge that fee
 * twice.
 */
function tierFromListing(l) {
  return { id: l.tierId, name: l.tierName, price: l.price, colorVar: l.colorVar, currency: l.currency || 'USD' }
}

const eventDates = event.date
  ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })
  : ''

// SIX SCREENS. `cart` was the seventh and is gone — the trip is reviewed on the
// checkout and edited in the peek. The array order is load-bearing (stepperNav
// only walks backwards through it), so a screen inserted here has to go in flow
// order.
const SCREENS = ['landing', 'tickets', 'hotel', 'hotelDetails', 'checkout', 'confirm']
// THREE LABELS, by instruction — "i only want tickets, hotel, and review".
const STEPS = ['Tickets', 'Hotel', 'Review']
// SEATS IS GONE, folded into Tickets. It was a VenueMap on its own screen after
// a tier list, which made sense while the tickets step sold a price LEVEL and
// the map picked the seat inside it. TicketMap sells the seat itself — section,
// row, all-in price and quantity in one two-pane surface — so keeping the old
// screen behind it would ask the guest to choose their seats twice, the second
// time from a map that knows nothing about the offer they just took. Its "Continue
// · $…" is what advances to the hotel step now.
//
// The stepper is not the screen list either: the property list and the hotel
// detail page are one STEP ("Hotel") in two screens, because a guest browsing
// rooms has not finished the hotel step — they are in the middle of it. The map
// is explicit rather than derived from an index so the two lists can be
// reordered independently.
//
// "REVIEW" IS THE CHECKOUT — "make sure the review screen is the checkout".
// The bar was hidden on the checkout an hour ago, on the argument that a guest
// typing a card number is past assembly. That was true while a separate cart
// page held the third label; with the cart page deleted, hiding the bar there
// would leave the stepper's last step pointing at no screen at all, and a guest
// on the payment page with no bar has no way to read where they are or to step
// back to Tickets. So Review lights on the checkout, and the bar stays.
//
// THE CONFIRMATION STILL HIDES IT. That one was never an argument about
// payment: a receipt is not a step of assembly, and a progress bar over an order
// already paid for points at a trip that cannot be changed. It keeps an index of
// 2 so the bar never flashes "Tickets" on its way out; what stops it rendering
// is `stepperVisible`.
const STEP_OF = { tickets: 0, hotel: 1, hotelDetails: 1, checkout: 2, confirm: 2 }
const STEP_SCREEN = ['tickets', 'hotel', 'checkout']
const screen = ref('landing')
const stepIndex = computed(() => STEP_OF[screen.value] ?? 0)
// Landing brings its own whole page; the confirmation is an order, not a step.
const stepperVisible = computed(() => screen.value !== 'landing' && screen.value !== 'confirm')

const tier = ref(null)
// The trip's ticket count. 2 is the prototype's standing default — the number
// every earlier version opened on, and the one the worked example in the README
// prices — so dropping /experience's "How many tickets?" dialog changes no
// price. From the tickets step on, the map's quantity select owns it (and so
// does the cart's stepper); this is only where it starts.
const quantity = ref(2)
// The exact offer taken off the ticket map: section, row, price, photo. Null
// until a listing is picked — a deep link that names only a tier prices the
// trip without one, the way the flow did before the map existed.
const seat = ref(null)
const hotel = ref(null)      // the property
const roomId = ref(null)     // the room type chosen on that property's page
const addOns = ref([])       // chosen add-on ids, in click order
const vehicles = ref(1)      // parking is the one extra that doesn't follow headcount
const orderNumber = 'EP-7T4F1M'

// The stay in the trip: a property plus a room. Resolved through roomFor() so an
// unknown or stale room id lands on the property's contracted block room rather
// than on nothing — the same fallback the tickets step uses for an unknown tier.
const room = computed(() => (hotel.value ? roomFor(hotel.value, roomId.value) : null))

const cart = computed(() =>
  tier.value
    ? buildTripCart({
        event, tier: tier.value, quantity: quantity.value,
        hotel: hotel.value, room: room.value, nights: STAY.nights,
        addOns: addOns.value, vehicles: vehicles.value,
        // The seat the guest actually took, so the ticket line names it. Left
        // undefined without one, which falls back to buildTripCart's own
        // placeholder section/row — the same line every earlier version printed.
        section: seat.value?.section, row: seat.value?.row,
      })
    : null
)

/**
 * "Continue · $…" on the ticket map — the one click that buys tickets, and the
 * end of what used to be two steps.
 *
 * The payload is the listing plus the quantity set on the map (its rail select,
 * repeated beside the button), so this is also where the ticket count is
 * decided. There is no quantity prompt before it by instruction: /experience
 * opens this screen with a "How many tickets?" dialog and this app has no
 * dialogs, so the count starts at the prototype default and the map moves it.
 */
function onMapContinue({ listing, quantity: qty } = {}) {
  if (qty) quantity.value = Math.min(qty, 8)
  if (listing) {
    seat.value = listing
    tier.value = tierFromListing(listing)
  } else if (!tier.value) {
    // Belt and braces: the map cannot emit without a selection, but a tierless
    // trip would render an empty cart, and Club is the fallback every other
    // path here uses.
    tier.value = tiers[1]
  }
  const back = returnTo.value
  returnTo.value = null
  go(back || 'hotel')
}

// Opening a property is not choosing it: the trip only gains a stay when a ROOM
// is picked on the detail page. So this sets nothing but which page to show —
// backing out of a hotel you were reading leaves the trip exactly as it was.
const browsing = ref(null)
// Where finishing a step should land. Empty on the way THROUGH the flow (the
// next step follows); a screen name when the guest doubled BACK to change
// something, because dropping them at the next step would make them walk the
// rest of the flow again to get back to the screen they left. Both re-entrant
// steps use it — the ticket map and the hotel.
//
// It used to be the constant 'cart', because the cart page was the only surface
// an edit could start from. Now that the peek is, an edit can start from any
// screen, and the return address is whichever one the panel was floating over —
// see editStep().
const returnTo = ref(null)

/** "Continue with hotel" — forward to the review, or back to the screen the
 *  guest doubled back from. Forward used to mean the extras step, then the cart
 *  page; with both deleted the hotel is the last thing assembled, so the review
 *  — which is now the checkout — is what follows it. */
function continueFromHotel() { const back = returnTo.value; returnTo.value = null; go(back || 'checkout') }
function openHotel(h) { browsing.value = h; go('hotelDetails') }
function skipHotel() { returnTo.value = null; setHotel(null); go('checkout') }

/**
 * "Reserve Room" on the detail page — the click that actually buys a stay.
 *
 * IT NO LONGER NAVIGATES. It used to push the guest to the cart page (and then,
 * for an hour this evening, to the checkout). The stakeholder asked for the
 * flyout instead: "when i click reserve a room ... i want to link to the flyout
 * cart for the user to review before they go into the review screen that is
 * actually the checkout screen." So the room goes into the trip and the PEEK
 * opens over the hotel page — the whole trip, its controls and its totals, at
 * the moment the last piece of it is chosen. Closing the panel leaves the guest
 * on the hotel page they were reading, which is where they were; the way
 * onward is the peek's own "Go to checkout".
 *
 * ORDER MATTERS: the stay is committed BEFORE the panel opens, or the guest
 * reviews a trip missing the room they just clicked. And it is one stay, not a
 * growing list — setHotel() overwrites the property and buildTripCart() makes a
 * single hotel line out of `hotel` + `room`, so reserving a second room (on this
 * property or another) REPLACES the stay rather than stacking a second one.
 * setHotel() resets the room to the property's contracted default; the line
 * below then writes the room actually clicked over it, which is what makes
 * switching properties mid-browse price the new property's room and not the old
 * property's.
 *
 * `returnTo` is cleared because there is no longer a screen to be handed back
 * to: whatever brought the guest here, the review they were sent for is now the
 * panel in front of them.
 */
function selectRoom(r) {
  setHotel(browsing.value)
  roomId.value = r.id
  returnTo.value = null
  peekOpen.value = true
}

/**
 * Set (or clear) the stay. Clearing it also drops any extra that needs one —
 * currently the transfer, which departs from the hotel lobby.
 *
 * buildTripCart() already filters those out of the cart, so leaving the id in
 * state would price correctly; it would just be a lie in the cart's extras
 * picker, where the transfer would be missing from the offers (it reads as
 * "already added") while contributing nothing to the total — and would silently
 * reappear on the bill if a hotel were chosen again.
 */
function setHotel(h) {
  hotel.value = h
  // A room belongs to a property, so changing or clearing the property drops the
  // room with it — carrying one across would price a room the new hotel doesn't
  // sell. The contracted block room is the landing spot; selectRoom() overwrites
  // it with the one actually clicked a line later.
  roomId.value = h ? defaultRoom(h)?.id ?? null : null
  if (!h) addOns.value = addOns.value.filter((id) => !addOnById(id)?.requiresHotel)
}

// Add and remove rather than toggle. The extras step's cards were a single
// control with two states ("Add" / "Added"), which is right when the offer and
// the thing you bought are the same card. In the cart they are two different
// rows on two different lists — offers below, purchased lines above — so the
// two directions are two calls, and neither can be fired at a row that isn't
// showing it.
function addAddOn(addOn) {
  if (!addOn || addOns.value.includes(addOn.id)) return
  addOns.value = [...addOns.value, addOn.id]
}
function removeAddOn(id) { addOns.value = addOns.value.filter((x) => x !== id) }

function go(s) { screen.value = s; window.scrollTo?.({ top: 0, behavior: 'smooth' }) }

/**
 * The peek's per-section Edit links — "Change seats", "Change hotel or room",
 * and the transfer's "Pick a hotel". Every one of them is now reached from the
 * flyout, because the flyout is the cart.
 *
 * WHERE AN EDIT COMES BACK TO. It used to be the constant 'cart': the links only
 * existed on the cart page, so the page they left was the page to return to.
 * The peek floats over whatever screen the guest is standing on, so the return
 * address is that screen — but only when it is a LATER STEP than the one being
 * edited. Two cases fall out of that, and both are wrong to treat as returns:
 *
 *   Earlier · a guest on the ticket map who follows the transfer's "Pick a
 *     hotel" wants the hotel step to hand them onward to the review, not to
 *     march them back to the map they just left.
 *   The same step · the property list and the detail page are one step, so
 *     "Pick a hotel" from a detail page is not a detour out of the flow, it is
 *     the flow — and returning to a room page for a property the guest has since
 *     replaced is the exact trap `browsing` exists to avoid.
 *
 * Comparing STEP_OF rather than the screen order is what makes the second case
 * fall out for free.
 *
 * The stay reopens the property that is IN THE TRIP, which is not necessarily
 * the last one browsed — a guest can read the Hyatt, decline it, and still be
 * booked at the Westin. Without this the Edit link would open the page they
 * walked away from.
 */
function editStep(step) {
  const from = screen.value
  // `undefined > n` is false, which is the right answer for the landing: it is
  // no step, so an edit started from it has nothing to come back to.
  returnTo.value = STEP_OF[from] > STEP_OF[step] ? from : null
  if (step === 'hotelDetails') {
    // A "change the room" that has no property to change is a "pick one".
    if (!hotel.value) return go('hotel')
    browsing.value = hotel.value
  }
  go(step)
}
function restart() {
  tier.value = null; quantity.value = 2; seat.value = null
  hotel.value = null; roomId.value = null; browsing.value = null; returnTo.value = null
  addOns.value = []; vehicles.value = 1
  go('landing')
}
// Backwards only, and through STEP_SCREEN rather than SCREENS: step 1 ("Hotel")
// returns to the property list, never to a detail page for a property the guest
// may since have replaced. Step 2 ("Review") is the CHECKOUT since the cart page
// was deleted — which is also the one route forward the guest still has if they
// step back from payment to change a seat.
function stepperNav(i) {
  const target = STEP_SCREEN[i]
  if (!target || SCREENS.indexOf(target) >= SCREENS.indexOf(screen.value)) return
  // Stepping back through the bar is leaving the review behind, not editing from
  // it — so the step lands where the flow says, not where an edit came from.
  returnTo.value = null
  go(target)
}

// --- The nav, and the cart behind its button ---------------------------------
//
// THE PEEK. Opened by the Global Nav's cart button, and — since the cart page
// was deleted — THE ONLY PLACE THE TRIP IS EDITED. It is this app's one
// sanctioned overlay; see CartPeek.vue for the whole argument, and for why the
// library's own CartFlyout is not what's mounted.
//
// That promotion is why it has to be reachable from every screen the trip can
// still change on. The nav carries it on all of them except the landing, whose
// GlobalNav is the library's own with show-cart hard-coded false — so the
// landing gets a small local pill instead (see `showLandingTrip`), and the
// confirmation deliberately gets nothing at all: the order is paid.
const peekOpen = ref(false)
function peekToCheckout() { peekOpen.value = false; go('checkout') }
function peekToTickets() { peekOpen.value = false; go('tickets') }
// The peek can also send the guest to a STEP: the section Edit links, and the
// transfer's "needs a hotel" row. Anything that navigates has to close the panel
// first — a slide-over left open over a screen change is how you get a guest
// editing one screen while looking at another.
function peekEdit(step) { peekOpen.value = false; editStep(step) }

// The cart button is hidden on exactly two screens.
//
//   LANDING · this app renders no nav there at all — LandingPage IS a page, nav
//     and footer included, and a second bar above it would be two. Its own
//     GlobalNav is mounted by the library with show-cart hard-coded false and
//     no prop to lift it ("No cart on the landing page (nothing has been added
//     yet)"), so carrying the cart there would take a library change, which is
//     not on offer. It also shouldn't: on the path a guest actually walks, the
//     landing is where the trip has not started, and an empty cart icon on the
//     one screen where nothing CAN have been added is worse than no icon —
//     it advertises a feature by showing it broken.
//     The one case where a trip does survive onto this screen is the wordmark,
//     which now returns here without clearing anything (see below). That costs
//     the badge for exactly one screen and nothing else: Search hands the guest
//     straight back to the flow with their trip, and its cart, intact.
//
//   CONFIRM · the trip has been paid for. It is an order now, and a cart button
//     offering "Go to checkout" for something already bought is the one thing
//     on that screen that could worry a guest.
//
// Everywhere in between it is visible, including the tickets step, where it
// reads 0 — an honest zero on the screen that fills it is orientation, not
// noise — and INCLUDING THE CHECKOUT, where it is now load-bearing: that screen
// lost its "Back to your trip" bar this round, so the cart button is the only
// way to change the order while paying for it. The peek drops its "Go to
// checkout" there (a button that navigates to the page you are on reads as
// broken) and keeps every control.
const cartVisible = computed(() => screen.value !== 'confirm')

// THE COUNT is lines on the order, not units: a party of four with a room, two
// tickets and three extras is "5", not "13" — 13 is a number that is true of
// nothing the guest recognises.
const cartCount = computed(() => cart.value?.items?.length ?? 0)

// THE LANDING'S WAY INTO THE PEEK, and the one screen that needs a local one.
//
// The trip survives onto the landing page (the wordmark returns here without
// clearing it), and with the cart page deleted the peek is the only surface that
// can edit a trip — so a guest who lands here with seats already bought would
// otherwise have no way to reach their own order but to press Search again.
// LandingPage's GlobalNav is mounted by the library with show-cart hard-coded
// false and no prop to lift it, so the button cannot go in the nav; forking the
// nav to get it there is the alternative, and the nav is precisely the thing
// meant to be identical across these four prototypes.
//
// It renders only when there is something to open — an empty pill on the screen
// where nothing CAN have been added is the same broken advertisement the library
// avoided by hiding the nav cart here in the first place. It is a page-level
// button, not a second overlay: the one it opens is the same peek.
const showLandingTrip = computed(() => screen.value === 'landing' && !!cart.value)

// A stable object for the nav's `cart` prop, so a tierless trip doesn't hand
// GlobalNav a fresh {} on every render of this file.
const navCart = computed(() => cart.value || {})

// GlobalNav's badge is fed by whatever cart body its own fly-out has open, and
// that fly-out never opens here (the click is intercepted below) — so left
// alone the badge reads 0 for the whole flow. The number is patched into the
// DOM instead, which is the no-library-change way to keep it honest. The
// rejected alternative was forking the nav to take a `count` prop, and the nav
// is exactly the thing that is supposed to be identical across these four
// prototypes.
function syncBadge() {
  const n = cartCount.value
  nextTick(() => requestAnimationFrame(() => {
    document.querySelectorAll('.gnav__badge').forEach((b) => { b.textContent = String(n) })
  }))
}
watch([screen, cartCount], syncBadge, { immediate: true })

/**
 * Two nav clicks the library page can't tell us about, caught in the CAPTURE
 * phase at document scope so they are stopped before the component's own
 * listener runs.
 *
 * The cart button is the important one: GlobalNav hard-wires it to the library
 * CartFlyout and exposes no prop or event to redirect it, so stopping the click
 * here is what keeps `cartOpen` false for the life of the app — and therefore
 * what guarantees the peek is the only overlay rather than one of two stacked
 * ones. Passing show-cart="false" and building a nav of our own was the
 * alternative, and it trades one intercepted click for a forked component.
 *
 * The wordmark goes to the landing page WITHOUT clearing the trip. It used to
 * be wired to restart(), which was defensible on a bespoke prototype bar and is
 * not on a real site's logo: a wordmark that silently deletes a trip is a trap.
 * "Start over" on the confirmation still resets everything.
 */
/**
 * Search on the landing page — carry the Travelers count into the ticket count.
 *
 * The widget's Travelers field is the first number the guest gives, and it was
 * being dropped on the floor: the map opened at its default 2 no matter what the
 * landing said, so a guest who typed 4 was asked the same question twice and got
 * a different answer the second time.
 *
 * BookingWidget keeps `rooms` in local state and exposes NO v-model and NO emit,
 * so there is nothing to bind to — the count is read off the rendered label at
 * the moment Search is pressed. Same technique this app already uses to read the
 * room card's Reserve click, and the same one /hotel-first uses for this exact
 * field.
 *
 * It seeds only. From the guest's first touch of the map's own quantity select,
 * the map owns the number (see `quantity`) — the landing answer is a starting
 * point, not a lock, because the map is where seats and count are chosen
 * together and overriding it there would fight the guest.
 */
function startFromLanding() {
  if (typeof document !== 'undefined') {
    // "1 traveler, 1 room" / "4 travelers, 2 rooms" — BookingWidget's own label.
    for (const input of document.querySelectorAll('.bw__input input')) {
      const m = /(\d+)\s+traveler/.exec(input.value || '')
      if (m) { quantity.value = Math.min(Math.max(1, parseInt(m[1], 10)), 8); break }
    }
  }
  go('tickets')
}

function onNavClickCapture(e) {
  const t = e.target
  if (!(t instanceof Element)) return
  if (t.closest('.gnav__iconbtn')) {
    e.preventDefault(); e.stopPropagation()
    peekOpen.value = true
    return
  }
  if (t.closest('.gnav__brand')) { e.preventDefault(); go('landing') }
}
onMounted(() => document.addEventListener('click', onNavClickCapture, true))
onBeforeUnmount(() => document.removeEventListener('click', onNavClickCapture, true))

// --- The pinned chrome's height ---------------------------------------------
// The sticky header reserves its own space (that is the whole reason it is
// sticky and not fixed), so the PAGE needs no compensation. But four surfaces
// underneath it do, and every one of them needs the same number:
//
//   · TicketMap is `height: 100vh`. Left alone, its bottom 129px sit below the
//     fold and its filter bar and rail head sit UNDER the pinned header once the
//     band scrolls away — the map is a two-pane surface that scrolls internally,
//     so nothing ever moves it back out.
//   · HotelDetailPage's section tabs are `position: sticky; top: 0` — they would
//     pin underneath ours and disappear.
//   · The checkout's order rail is `position: sticky; top: 20px`, same problem.
//   · HotelDetailPage's tab clicks call scrollIntoView({ block: 'start' }),
//     which lands a section flush at the viewport top, i.e. behind the header.
//
// That number is not a constant: the stepper is absent on the confirmation, and
// AppStepper's tabs drop from 56px to 48px under 560px. So it is MEASURED and
// published as `--tf-chrome-h` on the document element, where every screen —
// scoped styles included, since custom properties inherit — can read it.
//
// A ResizeObserver rather than a hard-coded `calc(72px + 57px)`: the constant
// would be right today and silently wrong the first time the nav or the stepper
// changes height, and the failure mode is content hidden under a bar, which is
// exactly what nobody notices in a review. Rejected alternative: a fixed header
// plus `padding-top` on .bapp__main, which needs this same measurement AND a
// second one for every full-bleed screen — sticky needs it only for the four
// surfaces above.
const chromeEl = ref(null)
let chromeRO = null
function publishChromeHeight(px) {
  document.documentElement.style.setProperty('--tf-chrome-h', `${Math.round(px)}px`)
}
function measureChrome() {
  // 0px on the landing, where no chrome of ours is mounted — LandingPage's own
  // nav pins itself and nothing under it needs an offset.
  publishChromeHeight(chromeEl.value?.getBoundingClientRect().height ?? 0)
}
onMounted(() => {
  if (typeof ResizeObserver !== 'undefined') {
    chromeRO = new ResizeObserver(([entry]) => publishChromeHeight(entry.contentRect.height))
  }
  // Re-observe on every screen change: the header element is v-if'd away on the
  // landing and re-created on the way back, so a one-time observe would be
  // watching a detached node for the rest of the session.
  watch(
    chromeEl,
    (el) => { chromeRO?.disconnect(); if (el) chromeRO?.observe(el); measureChrome() },
    { immediate: true, flush: 'post' }
  )
  // The stepper appearing or disappearing changes the height without resizing
  // the observed element in some browsers' timing — measure after the paint too.
  watch(stepperVisible, () => nextTick(measureChrome))
})
onBeforeUnmount(() => chromeRO?.disconnect())

// --- Deep links -------------------------------------------------------------
// Restore from ?screen=…&tier=…&qty=…&seat=…&hotel=…&room=…&addons=…&cars= on
// boot, then keep the URL current. A cart or confirmation link with no tier
// named would otherwise land on an empty cart, so those get the default Club
// tier — the same one the tickets step falls back to.
const saved = readDeepLink()
if (saved.quantity) quantity.value = saved.quantity
if (saved.vehicles) vehicles.value = saved.vehicles
if (saved.tier) tier.value = tiers.find((t) => t.id === saved.tier) || null
// `seat` names one offer off the ticket map and is applied AFTER `tier`, because
// a listing carries its own tier and price: with both present the seat is the
// more specific answer. An id that names no listing (a stale link, a different
// board) falls through to whatever `tier` said rather than failing the link —
// the trip is then priced by level, exactly as every link written before the map
// existed is.
if (saved.seat) {
  const l = listingById(saved.seat)
  if (l) { seat.value = l; tier.value = tierFromListing(l) }
}
if (saved.hotel) hotel.value = hotelById(saved.hotel)
// The room is resolved lazily by the `room` computed, so an id that names a room
// this property doesn't sell falls through to its contracted block room rather
// than failing the link.
if (hotel.value) { roomId.value = saved.room || defaultRoom(hotel.value)?.id || null; browsing.value = hotel.value }
if (saved.addOns) addOns.value = saved.addOns.filter((id) => addOnById(id))
// Four screens have been renamed or removed across this round, and links to all
// four are already out in READMEs and review threads. Remapping costs four
// lines; leaving them to fall through would land a shared link on the landing
// page, which reads as a broken prototype rather than as a moved screen.
//   event  → landing   (the intro card became the library's LandingPage)
//   seats  → tickets   (the seats screen folded into the ticket map)
//   cart   → checkout  (the cart page is deleted and the REVIEW step is the
//                       checkout now, so the checkout is what a ?screen=cart
//                       link was asking for: the order stated in full, with a
//                       way to pay for it. The trip it names is still editable
//                       — the cart button on that screen opens the peek, which
//                       is where every control from the cart page now lives)
//   extras → checkout  (re-pointed off `cart` with it. It has moved twice now —
//                       step → cart page → here — and the offers a reviewer
//                       followed it for are one cart-button click away, in the
//                       peek's picker)
// NO STATE KEY CHANGED, so every one of these links restores the same trip at
// the same price: tier=, seat=, qty=, hotel=, room=, addons= and cars= are read
// and written exactly as before.
const SCREEN_ALIAS = { event: 'landing', seats: 'tickets', cart: 'checkout', extras: 'checkout' }
const wantedScreen = SCREEN_ALIAS[saved.screen] || saved.screen
if (wantedScreen && SCREENS.includes(wantedScreen)) {
  screen.value = wantedScreen
  if (!tier.value && screen.value !== 'landing' && screen.value !== 'tickets') tier.value = tiers[1]
  // A detail-page link with no hotel named has no property to render; the list
  // is the honest landing, not a blank page.
  if (screen.value === 'hotelDetails' && !browsing.value) screen.value = 'hotel'
}
// Extras added from a link without a hotel would be dropped by the same rule
// setHotel() enforces — apply it once here so the two paths can't disagree.
if (!hotel.value) addOns.value = addOns.value.filter((id) => !addOnById(id)?.requiresHotel)

watch(
  [screen, tier, quantity, seat, hotel, roomId, addOns, vehicles],
  () => writeDeepLink({
    screen: screen.value, tier: tier.value?.id, quantity: quantity.value, seat: seat.value?.id,
    hotel: hotel.value?.id, room: roomId.value, addOns: addOns.value, vehicles: vehicles.value,
  }),
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="bapp">
    <!-- The nav — the library's real GlobalNav, on every screen but the
         landing, which is a whole LandingPage and brings its own (and would
         otherwise wear two). This replaced a bespoke dark bar on Aug 25: the
         four Aug 25 prototypes are meant to read as one product, and the header
         is the first thing that says whether they do.

         `cart` is passed although GlobalNav's own CartFlyout never renders (its
         button is intercepted in App.vue's capture handler) — so that a nav
         someone later un-intercepts degrades into a populated fly-out rather
         than an empty one. -->
    <!-- THE PINNED CHROME — nav and step bar as ONE sticky block. See the
         `.bapp__chrome` rule for why sticky and not fixed, and `measureChrome`
         for why its height is published as a custom property.
         Not rendered at all on the landing: that screen is a whole LandingPage
         carrying its own GlobalNav, and pinning an empty wrapper above it would
         either show two bars or reserve space for a bar that isn't there. The
         landing's own nav is pinned from inside LandingStep.vue instead, so the
         header behaves the same on every screen without this app ever mounting
         a second one. -->
    <header v-if="screen !== 'landing'" ref="chromeEl" class="bapp__chrome">
      <GlobalNav
        brand="EventPipe" cart-mode="ticketing" :cart="navCart" :show-cart="cartVisible"
      />

      <!-- Stepper — three labels, on the three screens it describes.
           AppStepper, not JourneyStepper: the numbered-dot stepper was the odd one
           out across the Aug 25 set — the other three prototypes all carry the
           underline-tab bar that sits flush under the Global Nav and reads as one
           piece of chrome with it. A guest moving between these prototypes in a
           review should not be re-learning where they are in a flow.
           The third label, "Review", lights on the CHECKOUT — "make sure the
           review screen is the checkout". Hidden only on the landing (a whole
           page of its own) and on the confirmation (an order, not a step) —
           see STEP_OF. Inside the sticky block, so the two bars pin together
           with no seam; on the confirmation the block is the nav alone and
           shrinks to 72px, which the height measurement follows. -->
      <div v-if="stepperVisible" class="bapp__stepper">
        <app-stepper :steps="STEPS" :current="stepIndex" clickable allow-ahead @navigate="stepperNav" />
      </div>
    </header>

    <!-- The two full-bleed screens end in their own edge — the landing page in
         its footer, the ticket map in the map itself — so the canvas gutter the
         step screens sit on would read as a stray strip under them. -->
    <main class="bapp__main" :class="{ 'bapp__main--flush': screen === 'landing' || screen === 'tickets' }">
      <!-- 0 · Landing — the library's LandingPage, full-bleed: it is a whole
           page with its own nav, hero, widget and footer. -->
      <LandingStep
        v-if="screen === 'landing'"
        :event-name="event.name" :event-dates="eventDates" @start="startFromLanding"
      />

      <!-- 1 · Tickets AND seats — the two-pane ticket map. Full-bleed for the
           same reason: TicketMap is a rail beside a full-height map and the
           820px step wrapper would squeeze both. -->
      <TicketMapStep
        v-else-if="screen === 'tickets'"
        :event="event" :listings="listings" :pins="pins" :event-dates="eventDates"
        :quantity="quantity" @continue="onMapContinue"
      />

      <!-- 2a · Pick the property. The band is mounted HERE rather than inside
           HotelPickStep because it has to be full-bleed and that component is
           the contents of a 1100px measure — a band inside the measure would
           read as a wide card, not as the header the tickets step has. Same
           component, same artwork, same height as the tickets band, so moving
           between the two steps the header is a fixed piece of chrome.
           `bapp__step` keeps its own top padding, which is what separates the
           band from the list below it. -->
      <template v-else-if="screen === 'hotel'">
      <EventBand :event-name="event.name" :event-dates="eventDates" />
      <section class="bapp__step bapp__step--wide">
        <HotelPickStep
          :hotels="hotels" :event-name="event.name"
          :chosen="hotel ? { hotel, room } : null"
          @open="openHotel" @skip="skipHotel" @remove="setHotel(null)"
        />
        <div class="bapp__nav">
          <button class="bapp__back" @click="go('tickets')">Back</button>
          <!-- Enabled only once a ROOM is in the trip. A property with no room
               has no rate, so "continue with hotel" would carry a stay the cart
               cannot price. -->
          <button class="bapp__cta" :disabled="!hotel" @click="continueFromHotel">
            {{ returnTo ? 'Back to your review' : 'Continue with hotel' }} <q-icon name="arrow_forward" size="18px" />
          </button>
        </div>
      </section>
      </template>

      <!-- 2b · The full hotel page — gallery, amenities, policies, rooms.
           Full-bleed: this is the booking site's own page and it lays itself out
           to 1180px, so the 820px step wrapper would crush it.
           NO EVENT BAND HERE, deliberately — the reasoning is at the top of
           HotelDetails.vue. The short version: this page already opens on a
           photo mosaic of the hotel, and stacking the stadium band on top of it
           would put two pieces of hero imagery in the first screenful, neither
           of them about the decision the page is asking for. -->
      <HotelDetails
        v-else-if="screen === 'hotelDetails' && browsing"
        :hotel="browsing" :event-name="event.name" :room-id="hotel?.id === browsing.id ? roomId : null"
        :guests="quantity" @back="go('hotel')" @select="selectRoom"
      />

      <!-- 3 · REVIEW — and the review is the checkout. The library's EXPANDED
           checkout page, full-bleed: not wrapped in bapp__step, because it is a
           two-column page with its own sticky rail and its own 1040px measure.
           Its "Review your order" section and its itemised rail are what the
           deleted cart screen used to say on a page of its own.
           It carries no back bar of its own — by instruction, the top of this
           screen is clean. The stepper above it says where the guest is, and
           the nav's cart button (visible here — see cartVisible) opens the peek,
           which is where the trip is edited. -->
      <TripCheckout
        v-else-if="screen === 'checkout' && cart"
        :cart="cart" :event="event" @submit="go('confirm')"
      />

      <!-- 4 · Confirmation — the library receipt, then the combined itinerary -->
      <section v-else-if="screen === 'confirm'" class="bapp__step bapp__step--narrow">
        <BundleConfirmation
          v-if="cart" :order-number="orderNumber" :event="event" :cart="cart"
          email="hello@girardjustin.com" :variant="hotel ? 'bundle' : 'ticket-only'"
        />
        <TripItinerary v-if="cart" :event="event" :cart="cart" class="bapp__itinerary" />
        <button class="bapp__cta bapp__cta--center" @click="restart">Start over</button>
      </section>
    </main>

    <!-- The landing's own way into the peek — see showLandingTrip. A page-level
         pill, not a second overlay: what it opens is the same one panel. -->
    <button v-if="showLandingTrip" type="button" class="bapp__triptab" @click="peekOpen = true">
      <q-icon name="shopping_basket" size="18px" />
      <span>Your trip</span>
      <span class="bapp__triptab-n">{{ cartCount }}</span>
    </button>

    <!-- THE CART. One sanctioned overlay, and since the cart screen was deleted
         it is the whole cart: every line, every control, the extras picker, the
         totals and the route to checkout. Mounted outside <main> so a screen
         change can't unmount it mid-slide; it teleports itself to <body>. -->
    <CartPeek
      :open="peekOpen" :cart="cart" :vehicles="vehicles" :show-checkout="screen !== 'checkout'"
      @close="peekOpen = false" @checkout="peekToCheckout" @browse="peekToTickets"
      @update:quantity="quantity = $event" @update:vehicles="vehicles = $event"
      @add-addon="addAddOn" @remove-addon="removeAddOn" @remove-hotel="setHotel(null)"
      @edit="peekEdit"
    />
  </div>
</template>

<style scoped>
.bapp { min-height: 100vh; background: var(--ds-color-surface-canvas); font-family: var(--ds-font-family); }
/* The nav is the library's, unrestyled — the point of adopting it is that all
   four Aug 25 prototypes wear the same one. The only rule here is the cursor on
   the wordmark, which is an <a href="#"> the app routes itself. */
.bapp :deep(.gnav__brand) { cursor: pointer; }

/* THE PINNED HEADER — nav + step bar, one block, `position: sticky`.
   Asked for because both halves of it are live the whole way down a screen: the
   step bar says where the guest is, the cart button is how the trip is opened,
   and the ticket map and the hotel page are both long enough to scroll either
   one off the top.

   STICKY, NOT FIXED. Sticky leaves the element in normal flow, so it occupies
   its own 129px at the top of the document and every screen below simply starts
   after it — no `padding-top` anywhere, and nothing to keep in sync when the
   stepper is hidden on the confirmation and the block shrinks to the nav's 72px.
   A fixed header was the alternative and was rejected on exactly that: it is out
   of flow, so it needs compensating padding whose value CHANGES per screen, and
   the first row of any screen that got the number wrong would sit under the bar
   silently. Sticky has no such failure mode here because no ancestor scrolls or
   clips — .bapp is a plain block on the document, which is the scroller.

   Z-INDEX 1000, deliberately below two things: HoldTimerPill (2000, and bottom
   right, so it never meets this) and CartPeek (3000). The peek's scrim has to
   cover the header — a nav floating over a modal scrim reads as a broken
   overlay, and the peek is this app's ONE sanctioned overlay. Above everything
   in the page itself: the hotel page's section tabs (5), the ticket map's rail
   headers and legend (1 and 4). */
.bapp__chrome { position: sticky; top: 0; z-index: 1000; }

/* Full-bleed and flush under the nav — AppStepper draws its own progress rule
   along its top edge, so a centred column with a gutter above it would break the
   join between the two bars. Inside .bapp__chrome the two bars pin as one, so
   there is no seam for the page to show through mid-scroll either. */
.bapp__stepper { margin: 0; padding: 0; }
.bapp__main { padding-bottom: 64px; }
.bapp__main--flush { padding-bottom: 0; }

.bapp__step { max-width: 820px; margin: 0 auto; padding: 28px 24px; }
.bapp__step--narrow { max-width: 560px; }
/* The property list mounts the booking site's own search-result card, which is
   built for a results page and reads as a postage stamp at 820px. */
.bapp__step--wide { max-width: 1100px; }
/* The receipt and the itinerary are two cards, not one — the first is what was
   charged, the second is where to be. */
.bapp__itinerary { margin-top: 20px; }

/* The landing's trip pill. Fixed bottom-right rather than in the page flow:
   LandingPage is a whole page ending in its own footer, and there is no seam in
   it to put a button through without restyling a library page. Its z-index sits
   under the peek's (3000) so the panel it opens covers it. */
.bapp__triptab {
  position: fixed; right: 20px; bottom: 20px; z-index: 900;
  display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font: inherit;
  font-weight: var(--ds-font-weight-bold); border: none; padding: 12px 18px;
  border-radius: var(--ds-radius-pill); background: var(--ds-color-background-brand-bold);
  color: var(--ds-color-text-inverse); box-shadow: var(--ds-shadow-3, 0 8px 24px rgba(0,0,0,0.22));
}
.bapp__triptab-n {
  min-width: 22px; height: 22px; padding: 0 6px; border-radius: var(--ds-radius-pill);
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--ds-color-surface); color: var(--ds-color-text); font-size: var(--ds-font-size-sm);
}

.bapp__nav { display: flex; justify-content: space-between; margin-top: 24px; }
.bapp__cta {
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer; border: none; font: inherit;
  font-weight: var(--ds-font-weight-bold); background: var(--ds-color-background-brand-bold);
  color: var(--ds-color-text-inverse); padding: 12px 22px; border-radius: var(--ds-radius-button);
}
.bapp__cta:disabled { background: var(--ds-color-background-neutral); color: var(--ds-color-text-disabled); cursor: not-allowed; }
.bapp__cta--center { display: flex; margin: 24px auto 0; }
.bapp__back { background: none; border: 1px solid var(--ds-color-border-bold); color: var(--ds-color-text); font: inherit; font-weight: var(--ds-font-weight-bold); padding: 12px 20px; border-radius: var(--ds-radius-button); cursor: pointer; }
</style>
