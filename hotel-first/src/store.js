// Journey store — the single source of truth for the hotel-first tournament flow,
// plus a lightweight linear router. Every screen reads and writes this one
// reactive object; all navigation glue lives in the prototype layer (this file +
// App.vue's capture-phase click handler). NO library component is modified.
//
// Flow (7 screens) under 4 stepper labels (Stay · Tickets · Add-Ons · Review):
//   landing                → (intro, no stepper — LandingPage brings its own nav)
//   hotels ─ hotelDetails  → Stay      (browse the contracted block, pick a room)
//   tickets                → Tickets   (tournament admission passes)
//   addons                 → Add-Ons   (optional Orlando destination products)
//   checkout ─ confirmation→ Review    (one cart, one payment, one itinerary)
//
// The order is the whole point of the edge case: the ROOM is chosen before any
// ticket exists, which is the reverse of the ticketing-first flows in this repo.
import { reactive, computed } from 'vue'
import { HOTELS, getHotel } from './hotels.js'
import { TICKETS_BY_ID, tierQty, tierMax } from './tickets.js'
import { ADD_ONS_BY_ID, addOnQty } from './addons.js'

// FLOW is the linear journey — the thing Next/Back walk and the stepper labels.
// SCREENS is everything `nav()` will accept, which is FLOW plus the full cart
// page. The cart is deliberately NOT in FLOW: it is reachable from the nav on
// every step, it is not a step, and dropping it into the array would put a
// "cart" stop between Add-Ons and Checkout for anyone pressing Next.
export const FLOW = ['landing', 'hotels', 'hotelDetails', 'tickets', 'addons', 'checkout', 'confirmation']
export const SCREENS = [...FLOW, 'cart']
export const STEP_LABELS = ['Stay', 'Tickets', 'Add-Ons', 'Review']
const SCREEN_STAGE = {
  landing: -1,
  hotels: 0, hotelDetails: 0,
  tickets: 1,
  addons: 2,
  checkout: 3, confirmation: 3,
  // The cart page is out of the four stages, so it shows no stepper. It carries
  // its own "back to where you were" link instead — a stepper highlighting a
  // stage you are not standing on is worse orientation than none.
  cart: -1,
}

// What the cart page's return link calls the screen you came from.
export const RETURN_LABELS = {
  landing: 'the event page',
  hotels: 'hotel search',
  hotelDetails: 'the hotel',
  tickets: 'tournament passes',
  addons: 'Orlando add-ons',
  checkout: 'checkout',
  confirmation: 'your itinerary',
}

// The default room. A tournament family books occupancy, not a bed type — two
// queens is what a party of four is sold, so that is what the flow assumes until
// the guest picks something on the Details screen.
const DEFAULT_ROOM = { type: 'Double Queen - 2 Queen', bedConfig: '2 Queen Beds', sleeps: 4 }

export const journey = reactive({
  screen: 'landing',
  // PARTY SIZE IS THE ONE QUANTITY IN THIS FLOW. It is chosen for the ROOM and
  // every downstream line follows it: passes, park tickets, breakfasts. Nothing
  // below carries its own stepper, so nothing below can disagree with it.
  //
  // The `tickets` / `addOns` maps below still store a number per line rather
  // than a boolean, because the cart, the rail and the confirmation all price
  // off `{ id: qty }`. The difference is that every write goes through
  // `tierQty` / `addOnQty` — the number is DERIVED, never typed.
  guests: 4,                 // party size — two parents, two athletes
  hotelId: HOTELS[0].id,     // the property open on Details / carried into the cart
  room: { ...DEFAULT_ROOM, nightly: HOTELS[0].fromNightly + 30 },
  // Tickets are PRE-SEEDED with one weekend pass per guest; add-ons are NOT.
  // The weekend pass is the near-universal purchase and seeding it keeps a
  // deep-linked checkout coherent, but a destination add-on is a genuine choice —
  // pre-adding a $139 park ticket to a cart would be the prototype telling a lie
  // about what the guest asked for.
  tickets: { weekend: 4 },
  addOns: {},
  tab: 'overview',           // active section tab on the Details screen (deep-linkable)
  // Where "Back to …" on the cart page returns to. The cart is a detour off any
  // step, so it has to remember the step rather than assume one.
  returnScreen: 'hotels',
})

export const currentStage = computed(() => SCREEN_STAGE[journey.screen] ?? -1)
export const showStepper = computed(() => currentStage.value >= 0)
export const activeHotel = computed(() => getHotel(journey.hotelId) || HOTELS[0])

// Detail screens whose active section tab is reflected in the URL as `&tab=`.
const TABBED = new Set(['hotelDetails'])

// ── URL sync ──
// Reflect the current step in the URL as `?screen=<name>` so every step is
// copy-paste shareable (works on GitHub Pages — it's a client-side query param,
// the same index.html always loads). `push` adds a history entry so the browser
// back/forward buttons walk the steps.
// ── WHAT THE URL CARRIES (Aug 26) ──
// It used to carry the SCREEN and nothing else, and that was a bug with teeth:
// reload the confirmation — or open it in a second tab, or let an HMR reload
// fire while reviewing — and every pass the guest had chosen was gone. Not
// visibly gone: `bootstrapFromUrl` re-seeded the DEFAULT selection (one Weekend
// pass), so the final screen came back looking plausible and quietly $484
// cheaper. A summary that silently drops lines is worse than one that errors.
//
// So the URL now carries the whole selection. It stays short because PARTY SIZE
// IS THE QUANTITY (see tickets.js): a tier is an in/out decision, so only the
// IDs need encoding and `tierQty` re-derives every number on the way back in.
// That also means the round-trip cannot invent a quantity that disagrees with
// the party — the same guarantee `repriceForParty` gives the live app.
//
//   ?screen=confirmation&guests=4&hotel=rosen&tickets=weekend.sunday&addons=disney
//
// Dot-separated so it survives URLSearchParams without percent-encoding and the
// link stays readable when it is pasted into a review thread.
// Ids AND quantities. This used to encode ids alone, because a tier's quantity
// was always the party size and could be re-derived on the way back in. Since
// admission became an allocation (3 spectators + 1 athlete), the quantity is no
// longer derivable — dropping it would restore a 3+1 split as 4+4 on any reload,
// which is precisely the silent-wrong-total bug this URL scheme was built to fix.
//
// `weekend:3.athlete:1` — colon inside a line, dot between lines. The dot
// survives URLSearchParams as-is; the colon is percent-encoded to %3A in the
// address bar, which is ugly but harmless — it round-trips exactly, and it is
// the separator that reads most clearly when someone pastes the decoded link
// into a review thread.
const idList = (map) => Object.entries(map || {})
  .filter(([, q]) => q > 0)
  .map(([id, q]) => `${id}:${q}`)
  .join('.')

function writeUrl(screen, push) {
  if (typeof window === 'undefined' || !window.history) return
  const params = new URLSearchParams(window.location.search)
  params.set('screen', screen)
  if (TABBED.has(screen) && journey.tab && journey.tab !== 'overview') params.set('tab', journey.tab)
  else params.delete('tab')

  // The selection. Written on every navigation, so the address bar is always a
  // faithful link to the trip currently on screen.
  params.set('guests', String(journey.guests))
  params.set('hotel', journey.hotelId)
  const tix = idList(journey.tickets)
  // `tickets=` empty-but-present is meaningful: it is "the guest chose none",
  // which must NOT be re-seeded with the default on the way back in. Only a
  // completely absent param means "no selection was ever expressed".
  params.set('tickets', tix)
  const ads = idList(journey.addOns)
  if (ads) params.set('addons', ads)
  else params.delete('addons')

  const url = `${window.location.pathname}?${params.toString()}`
  window.history[push ? 'pushState' : 'replaceState']({ screen }, '', url)
}

/** URL params → the two selection maps, quantities re-derived from party size. */
function readSelection(q) {
  const tix = q.get('tickets')
  if (tix !== null) {
    // Each entry is `id` or `id:qty`. A bare id (an older link, or one written
    // by hand) still resolves — it falls back to whatever the party can spare,
    // which is the pre-allocation behaviour and never over-assigns.
    let budget = journey.guests
    journey.tickets = Object.fromEntries(
      tix.split('.').filter(Boolean)
        .map((chunk) => {
          const [id, raw] = chunk.split(':')
          if (!TICKETS_BY_ID[id]) return null
          const asked = raw === undefined ? tierQty(TICKETS_BY_ID[id], journey.guests) : (parseInt(raw, 10) || 0)
          const take = Math.max(0, Math.min(asked, budget, TICKETS_BY_ID[id].count ?? 0))
          budget -= take
          return [id, take]
        })
        .filter((e) => e && e[1] > 0)
    )
  }
  const ads = q.get('addons')
  if (ads !== null) {
    // Add-ons still follow the party size — everyone gets the same park ticket —
    // so the quantity is re-derived and the encoded one is ignored. The `id:qty`
    // shape is accepted only so both maps read the same way.
    journey.addOns = Object.fromEntries(
      ads.split('.').filter(Boolean)
        .map((chunk) => chunk.split(':')[0])
        .filter((id) => ADD_ONS_BY_ID[id])
        .map((id) => [id, addOnQty(ADD_ONS_BY_ID[id], journey.guests)])
        .filter(([, n]) => n > 0)
    )
  }
}

// ── Navigation ──
export function nav(screen, { push = true } = {}) {
  if (!SCREENS.includes(screen)) return
  journey.screen = screen
  writeUrl(screen, push)
  // Deep-linking to a section tab? Let the detail page scroll to that section
  // (its onMounted) instead of jumping back to the top.
  const deepTab = TABBED.has(screen) && journey.tab && journey.tab !== 'overview'
  if (typeof window !== 'undefined' && !deepTab) requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}
export function next() {
  const i = FLOW.indexOf(journey.screen)
  if (i >= 0 && i < FLOW.length - 1) nav(FLOW[i + 1])
}
export function back() {
  const i = FLOW.indexOf(journey.screen)
  if (i > 0) nav(FLOW[i - 1])
}

// ── The cart page ──
// Opened from the peek (and only from there — the nav cart icon opens the peek,
// never the page, so a glance never costs you your place). The step you were on
// is remembered so leaving the cart puts you back where the detour started
// rather than at a fixed screen.
export function goToCart() {
  if (journey.screen !== 'cart') journey.returnScreen = journey.screen
  nav('cart')
}
export function leaveCart() {
  const to = FLOW.includes(journey.returnScreen) ? journey.returnScreen : 'hotels'
  nav(to)
}
// Stepper tabs jump to the first screen of any stage (forward or back — the
// stepper is the primary way to move around this feedback prototype).
const STAGE_ENTRY = { 0: 'hotels', 1: 'tickets', 2: 'addons', 3: 'checkout' }
export function goToStage(stage) {
  if (STAGE_ENTRY[stage]) nav(STAGE_ENTRY[stage])
}

// ── Selection ──

// Re-derive EVERY selected line from the current party size, in one pass. This
// is what makes the party stepper a re-price of the whole trip rather than a
// number that only affects whatever screen you happen to be looking at: the
// tickets screen, the add-ons screen, the nav cart, the checkout rail and the
// confirmation all read these two maps, so they move together or not at all.
//
// Lines already at 0 stay at 0 — a party change must never ADD something the
// guest didn't ask for.
function repriceForParty() {
  const g = journey.guests
  // Admission is an ALLOCATION now, so a party change rescales it rather than
  // resetting every tier to the new number — which would undo a 3 + 1 split the
  // moment anyone touched the party stepper. Tiers keep their share in
  // catalogue order and the total is trimmed to fit the new party size.
  let budget = g
  journey.tickets = Object.fromEntries(
    Object.entries(journey.tickets)
      .filter(([, q]) => q > 0)
      .map(([id, q]) => {
        const take = Math.max(0, Math.min(q, budget, TICKETS_BY_ID[id]?.count ?? 0))
        budget -= take
        return [id, take]
      })
      .filter(([, q]) => q > 0)
  )
  journey.addOns = Object.fromEntries(
    Object.entries(journey.addOns)
      .filter(([, q]) => q > 0)
      .map(([id]) => [id, addOnQty(ADD_ONS_BY_ID[id], g)])
  )
}

export function setGuests(n) {
  journey.guests = Math.min(12, Math.max(1, n || 1))
  repriceForParty()
  syncUrl()
}
export function setTab(name) { journey.tab = name || 'overview'; writeUrl(journey.screen, false) }

export function openHotel(id, tab = 'overview') {
  journey.tab = tab
  if (id) journey.hotelId = id
  nav('hotelDetails')
}

// A room is chosen on the library's RoomCardReserve, which reports nothing upward
// (it emits `reserve` with no payload). App.vue reads the card's own DOM and hands
// the result here — the no-library-change way to capture the selection.
export function selectRoom(room) {
  if (room && room.nightly) journey.room = { ...DEFAULT_ROOM, ...room }
  nav('tickets')
}

// Every mutation above rewrites the address in place. Writing it only on nav()
// left a window where the screen and the URL disagreed: pick two passes, reload
// without moving on, and the picks were gone — the same defect the confirmation
// had, one screen earlier. replaceState (not push) because choosing a tier is
// not a history entry; the guest should not have to press Back three times to
// undo three taps.
function syncUrl() { writeUrl(journey.screen, false) }

// Tiers and add-ons are toggled IN or OUT; the quantity is never passed in. The
// old `setTicketQty(id, n)` / `setAddOnQty(id, n)` pair is gone on purpose —
// while a caller could hand in an arbitrary n, a line could diverge from the
// party size, which is exactly the thing this round removed.
export const ticketOn = (id) => (journey.tickets[id] || 0) > 0
export const addOnOn = (id) => (journey.addOns[id] || 0) > 0

// ── ADMISSION IS ALLOCATED ACROSS THE PARTY (Sep 1) ────────────────────────
// See tickets.js for why the pinned in/out model was reversed. The rule here is
// the whole of it: each tier carries its own number, and the numbers may not sum
// past the party size.

/** Admission seats currently assigned, optionally ignoring one tier. */
export const admissionCount = (exceptId = null) =>
  Object.entries(journey.tickets).reduce((n, [id, q]) => (id === exceptId ? n : n + (q || 0)), 0)

/** People on the room who still have no admission of any kind. */
export const remainingToCover = () => Math.max(0, journey.guests - admissionCount())

/** The most this tier could be set to right now — inventory and party both. */
export const maxForTier = (id) =>
  tierMax(TICKETS_BY_ID[id], journey.guests, admissionCount(id))

/**
 * Set one tier's quantity. Clamped to what the party has left to assign, so a
 * stepper can be pressed freely without ever producing an order for more people
 * than are staying in the room.
 */
export function setTicketQty(id, n) {
  const qty = Math.max(0, Math.min(Math.round(n) || 0, maxForTier(id)))
  const next = { ...journey.tickets }
  if (qty > 0) next[id] = qty
  else delete next[id]
  journey.tickets = next
  syncUrl()
}

/**
 * Switching a tier ON claims whatever the party still has spare (bounded by
 * inventory); switching it OFF returns it. The toggle is kept because it is
 * still the fastest way to cover a whole party with one tier — the stepper is
 * for splitting, not a replacement for the common case.
 */
export function toggleTicket(id, on = !ticketOn(id)) {
  if (!on) { setTicketQty(id, 0); return }
  const spare = maxForTier(id)
  setTicketQty(id, spare > 0 ? spare : tierQty(TICKETS_BY_ID[id], journey.guests))
}
export function toggleAddOn(id, on = !addOnOn(id)) {
  const qty = on ? addOnQty(ADD_ONS_BY_ID[id], journey.guests) : 0
  const next = { ...journey.addOns }
  if (qty > 0) next[id] = qty
  else delete next[id]
  journey.addOns = next
  syncUrl()
}
export function clearAddOns() { journey.addOns = {}; syncUrl() }

export function resetJourney() {
  journey.guests = 4
  journey.hotelId = HOTELS[0].id
  journey.room = { ...DEFAULT_ROOM, nightly: HOTELS[0].fromNightly + 30 }
  journey.tickets = { weekend: tierQty(TICKETS_BY_ID.weekend, 4) }
  journey.addOns = {}
  journey.tab = 'overview'
  journey.returnScreen = 'hotels'
  nav('landing')
}

// A representative add-on selection for screenshots and demo deep links. Kept
// behind `?demo=1` rather than made the default so the honest empty state — the
// one a first-time guest actually sees — is what the Add-Ons screen ships with.
export function seedDemoAddOns() {
  ;['disney', 'character', 'transfer'].forEach((id) => toggleAddOn(id, true))
}

export function bootstrapFromUrl() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams(window.location.search)
  const g = parseInt(q.get('guests') || '0', 10)
  // Party size first — every quantity below is derived from it.
  //
  // This line used to end with `journey.tickets = { weekend: … }`, which threw
  // away whatever the guest had chosen and replaced it with the default. That
  // was survivable when the URL held no selection to honour; now that it does,
  // re-seeding here is exactly the bug. setGuests() already re-prices what is
  // held, and readSelection() below supplies what the link asked for.
  if (g) setGuests(g)
  const hotel = q.get('hotel')
  if (hotel && getHotel(hotel)) {
    journey.hotelId = hotel
    journey.room = { ...journey.room, nightly: getHotel(hotel).fromNightly + 30 }
  }
  readSelection(q)
  if (q.get('demo') === '1') seedDemoAddOns()
  const tab = q.get('tab')
  if (tab) journey.tab = tab
  const screen = q.get('screen')
  if (screen && SCREENS.includes(screen)) journey.screen = screen
  // Normalize the URL to the resolved step (e.g. bare "/" → "?screen=landing").
  writeUrl(journey.screen, false)
  // Keep the app in sync with the browser back/forward buttons.
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(window.location.search)
    const s = p.get('screen')
    journey.tab = p.get('tab') || 'overview'
    // Back/forward moves through selections as well as screens — stepping back
    // past the Tickets step should show the trip as it was there.
    const g = parseInt(p.get('guests') || '0', 10)
    if (g) setGuests(g)
    readSelection(p)
    if (s && SCREENS.includes(s)) nav(s, { push: false })
  })
}
