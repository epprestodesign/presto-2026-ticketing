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

export const SCREENS = ['landing', 'hotels', 'hotelDetails', 'tickets', 'addons', 'checkout', 'confirmation']
export const STEP_LABELS = ['Stay', 'Tickets', 'Add-Ons', 'Review']
const SCREEN_STAGE = {
  landing: -1,
  hotels: 0, hotelDetails: 0,
  tickets: 1,
  addons: 2,
  checkout: 3, confirmation: 3,
}

// The default room. A tournament family books occupancy, not a bed type — two
// queens is what a party of four is sold, so that is what the flow assumes until
// the guest picks something on the Details screen.
const DEFAULT_ROOM = { type: 'Double Queen - 2 Queen', bedConfig: '2 Queen Beds', sleeps: 4 }

export const journey = reactive({
  screen: 'landing',
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
function writeUrl(screen, push) {
  if (typeof window === 'undefined' || !window.history) return
  const params = new URLSearchParams(window.location.search)
  params.set('screen', screen)
  if (TABBED.has(screen) && journey.tab && journey.tab !== 'overview') params.set('tab', journey.tab)
  else params.delete('tab')
  const url = `${window.location.pathname}?${params.toString()}`
  window.history[push ? 'pushState' : 'replaceState']({ screen }, '', url)
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
  const i = SCREENS.indexOf(journey.screen)
  if (i >= 0 && i < SCREENS.length - 1) nav(SCREENS[i + 1])
}
export function back() {
  const i = SCREENS.indexOf(journey.screen)
  if (i > 0) nav(SCREENS[i - 1])
}
// Stepper tabs jump to the first screen of any stage (forward or back — the
// stepper is the primary way to move around this feedback prototype).
const STAGE_ENTRY = { 0: 'hotels', 1: 'tickets', 2: 'addons', 3: 'checkout' }
export function goToStage(stage) {
  if (STAGE_ENTRY[stage]) nav(STAGE_ENTRY[stage])
}

// ── Selection ──
export function setGuests(n) { journey.guests = Math.min(12, Math.max(1, n || 1)) }
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

export function setTicketQty(id, n) { journey.tickets = { ...journey.tickets, [id]: Math.max(0, n || 0) } }
export function setAddOnQty(id, n) { journey.addOns = { ...journey.addOns, [id]: Math.max(0, n || 0) } }
export function clearAddOns() { journey.addOns = {} }

export function resetJourney() {
  journey.guests = 4
  journey.hotelId = HOTELS[0].id
  journey.room = { ...DEFAULT_ROOM, nightly: HOTELS[0].fromNightly + 30 }
  journey.tickets = { weekend: 4 }
  journey.addOns = {}
  journey.tab = 'overview'
  nav('landing')
}

// A representative add-on selection for screenshots and demo deep links. Kept
// behind `?demo=1` rather than made the default so the honest empty state — the
// one a first-time guest actually sees — is what the Add-Ons screen ships with.
export function seedDemoAddOns() {
  journey.addOns = { disney: journey.guests, character: journey.guests, transfer: 1 }
}

export function bootstrapFromUrl() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams(window.location.search)
  const g = parseInt(q.get('guests') || '0', 10)
  if (g) { setGuests(g); journey.tickets = { weekend: journey.guests } }
  const hotel = q.get('hotel')
  if (hotel && getHotel(hotel)) {
    journey.hotelId = hotel
    journey.room = { ...journey.room, nightly: getHotel(hotel).fromNightly + 30 }
  }
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
    if (s && SCREENS.includes(s)) nav(s, { push: false })
  })
}
