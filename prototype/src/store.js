// Journey store — the single source of truth threaded through every screen, plus
// the lightweight router. All navigation glue lives in the prototype layer (this
// file + App.vue's global click handler); NO library component is modified.
//
// Booking-mode model (see Getting Started → Architecture cheat-sheet):
//   widget mode  'reservations' | 'group'   ← chosen on the landing widget
//   flow         'reserve'      | 'group'    ← canonical branch
//   Single vs multiple is CART-DRIVEN: a `reserve` flow with >1 hotel in the cart
//   becomes the "multiple reservations" checkout.
import { reactive, computed } from 'vue'

export const SCREENS = ['landing', 'browse', 'details', 'checkout', 'confirmation']

export const journey = reactive({
  screen: 'landing',
  // 'reserve' (single/multiple, cart-driven) | 'group' (hold a block)
  flow: 'reserve',
  // The hotel currently open on the Details screen: { name, city } | null
  active: null,
  // Hotels chosen (reserve: one per reservation; group: hotels in the block).
  // Each entry: { name, city }
  cart: [],
  // Whether the cart fly-out should be openable in the nav (forced once cart > 0).
  cartOpen: false,
})

// ── Group-block hold timer (DES-84) ──
// Group rooms are held temporarily the moment the FIRST room is added to the
// cart — not when the guest reaches checkout. This single shared countdown is
// started on that first add and lives here (not in any screen) so it keeps
// running across browse → details → checkout. The floating HoldTimerPill
// (rendered in the app shell) and the checkout rail both read `remaining`.
const HOLD_DURATION = 15 * 60 // seconds a group block is held
export const holdTimer = reactive({ active: false, remaining: HOLD_DURATION })
let holdInterval = null

export function startHoldTimer() {
  if (holdTimer.active) return // already counting — don't restart on later adds
  holdTimer.active = true
  holdTimer.remaining = HOLD_DURATION
  holdInterval = setInterval(() => {
    if (holdTimer.remaining > 0) holdTimer.remaining--
    else stopHoldTimer()
  }, 1000)
}

export function stopHoldTimer() {
  holdTimer.active = false
  holdTimer.remaining = HOLD_DURATION
  if (holdInterval) { clearInterval(holdInterval); holdInterval = null }
}

// ── Derived modes (map the canonical flow → each component's prop vocabulary) ──

export const cartCount = computed(() => journey.cart.length)

// CheckoutPage.vue vocabulary: 'reservation' | 'reservations' | 'group'
export const checkoutMode = computed(() => {
  if (journey.flow === 'group') return 'group'
  return journey.cart.length > 1 ? 'reservations' : 'reservation'
})

// CartReview / ConfirmationPage / PageFrame cartMode vocabulary:
// 'reserve' | 'reservations' | 'hold'
export const cartMode = computed(() => {
  if (journey.flow === 'group') return 'hold'
  return journey.cart.length > 1 ? 'reservations' : 'reserve'
})

// ConfirmationPage.vue mode vocabulary: 'reserve' | 'reservations' | 'hold'
export const confirmationMode = cartMode

// HotelDetailPage.roomsFlow / RoomsCarousel.flow vocabulary: 'reserve' | 'group'
export const roomsFlow = computed(() => (journey.flow === 'group' ? 'group' : 'reserve'))

// Whether the nav cart is visible on Browse/Details (reserve shows once something
// is added; group always shows because rooms are held incrementally).
export const cartVisible = computed(() => journey.flow === 'group' || journey.cart.length > 0)

// ── Navigation ──

export function nav(screen) {
  if (!SCREENS.includes(screen)) return
  journey.cartOpen = false
  journey.screen = screen
  requestAnimationFrame(() => window.scrollTo({ top: 0 }))
}

export function startFlow(widgetMode) {
  journey.flow = widgetMode === 'group' ? 'group' : 'reserve'
  journey.cart = []
  journey.active = null
  stopHoldTimer() // a fresh search clears any prior hold
  nav('browse')
}

// Open a hotel's Details screen. hotel = { name, city }
export function openHotel(hotel) {
  journey.active = hotel
  nav('details')
}

// Add the active hotel to the cart and go straight to Checkout (the expected
// "select a room → checkout" path). Reserve: one entry per hotel → single, or
// 'reservations' once there are 2+. Group: the hotel's held rooms → the block.
// Dedupes by name. Use "Add another reservation/hotel" or "Edit reservation" in
// Checkout to come back and add more.
export function addActiveToCart() {
  const h = journey.active
  if (h && !journey.cart.some((c) => c.name === h.name)) journey.cart.push({ ...h })
  nav('checkout')
}

// Group/hold: add a specific room (with its per-night quantities) to the active
// hotel's cart entry, accumulating across multiple "Add to Cart" clicks. Merges
// by room type (sums per-night qty); different types are added as separate rooms.
// `room` = { type, summary, price, nights: [{ date, qty, roomsLeft }] }
export function addRoomToHold(room) {
  const h = journey.active
  if (!h || !room || !room.nights || !room.nights.length) return
  let entry = journey.cart.find((c) => c.name === h.name)
  if (!entry) { entry = { name: h.name, city: h.city, rooms: [] }; journey.cart.push(entry) }
  if (!entry.rooms) entry.rooms = []
  const existing = entry.rooms.find((r) => r.type === room.type)
  if (existing) {
    room.nights.forEach((n) => {
      const en = existing.nights.find((x) => x.date === n.date)
      if (en) en.qty += n.qty
      else existing.nights.push({ ...n })
    })
  } else {
    entry.rooms.push({ ...room, nights: room.nights.map((n) => ({ ...n })) })
  }
  // DES-84: the hold clock starts the moment the first room is held (no-op on
  // subsequent adds — the block is already being held).
  startHoldTimer()
}

// Total rooms held/booked across the cart (for the app-bar badge).
export function cartRoomCount() {
  if (journey.flow === 'group') {
    return journey.cart.reduce((sum, h) =>
      sum + (h.rooms || []).reduce((s, r) => s + r.nights.reduce((a, n) => a + (n.qty || 0), 0), 0), 0)
  }
  return journey.cart.length
}

// Return to Browse keeping the cart (for "Add another reservation/hotel" / "Edit").
export function backToBrowse() {
  nav('browse')
}

export function goToCheckout() {
  if (journey.cart.length) nav('checkout')
}

export function resetJourney() {
  journey.flow = 'reserve'
  journey.active = null
  journey.cart = []
  stopHoldTimer()
  nav('landing')
}

// ── Deep-link / demo bootstrap ──
// Optional: jump straight to any screen via URL query, e.g.
//   ?screen=checkout&flow=reserve&n=2   → multiple-reservations checkout
//   ?screen=details&flow=group&hotel=Embassy%20Suites%20Downtown&city=Chicago
// Handy for demos and for screenshotting individual screens. No effect without
// a `screen` param, so the normal Landing entry is unchanged.
const SAMPLE = [
  { name: 'The Grand Riverside Hotel', city: 'Overland Park' },
  { name: 'Kimpton Gray Hotel', city: 'Chicago' },
  { name: 'Embassy Suites Downtown', city: 'Aurora' },
]

export function bootstrapFromUrl() {
  const q = new URLSearchParams(window.location.search)
  const screen = q.get('screen')
  if (!screen || !SCREENS.includes(screen)) return
  const flow = q.get('flow')
  if (flow) journey.flow = flow === 'group' ? 'group' : 'reserve'
  const n = parseInt(q.get('n') || '0', 10)
  journey.cart = []
  for (let i = 0; i < n; i++) journey.cart.push({ ...SAMPLE[i % SAMPLE.length] })
  const hotel = q.get('hotel')
  if (hotel) journey.active = { name: hotel, city: q.get('city') || 'Chicago' }
  else journey.active = journey.cart[0] || { ...SAMPLE[0] }
  journey.screen = screen
}
