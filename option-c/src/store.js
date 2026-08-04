// Option C journey store — the one-click package flow (Aug 4 feedback).
//
// Three screens, one decision:
//   packages     → the 6-tile grid; this is the LANDING page
//   checkout     → the tile that was picked, priced for the stay
//   confirmation → done
//
// Plus one read-only reference view (hotelDetails), which is never a step of the
// journey — it opens in its own tab when a hotel name is clicked, so the board
// behind it keeps its state.
//
// Option A's store carried landing, browse-hotels and a modal's worth of
// configuration state (roomHotelId, roomTypeId, tierId, extraId). None of that
// survives here: a tile is a complete SKU. What IS shared state is the stay
// itself — the dates and the party — because both re-price every tile on the
// board at once.
import { reactive, computed } from 'vue'
import { packageById, packageGrid, HOTELS, roomsFor, resolveRoom } from './packages.js'

export const SCREENS = ['packages', 'checkout', 'confirmation', 'hotelDetails']
// The linear path next()/back() walk — the reference screen is excluded.
const FLOW = ['packages', 'checkout', 'confirmation']
export const STEP_LABELS = ['Packages', 'Review']
const SCREEN_STAGE = { packages: 0, checkout: 1, confirmation: 1, hotelDetails: -1 }

// Option A screens that no longer exist — old links land on the grid rather than
// a blank page.
const REDIRECTS = { landing: 'packages', hotels: 'packages', packageDetails: 'packages' }

// The party size the dropdown offers. Above a room's occupancy the tile books
// more than one room rather than refusing the booking — the feedback caps
// tickets per ROOM, and a group outing is the whole point of the event.
export const MAX_GUESTS = 8

// Gameday is Sun Sep 20, 2026, so the default stay is the Saturday night before.
// Dates are 'YYYY/MM/DD' — the format the library's DateRangeCalendar speaks.
const DEFAULT_RANGE = { from: '2026/09/19', to: '2026/09/20' }

const parseYmd = (s) => {
  if (!s) return null
  const [y, m, d] = s.split('/').map(Number)
  if (!y || !m || !d) return null
  const dt = new Date(y, m - 1, d)
  dt.setHours(0, 0, 0, 0)
  return Number.isNaN(dt.getTime()) ? null : dt
}

/** Nights between two 'YYYY/MM/DD' dates. Always at least 1 — a package is a stay. */
export function nightsBetween(range) {
  const from = parseYmd(range?.from)
  const to = parseYmd(range?.to)
  if (!from || !to) return 1
  const n = Math.round((to - from) / 86400000)
  return n > 0 ? n : 1
}

export const journey = reactive({
  screen: 'packages',
  guests: 2,
  range: { ...DEFAULT_RANGE },
  activePkg: null,    // the tile being bought
  activePkgId: null,  // mirrored as `&pkg=` so a selection is shareable
  activeHotelId: null, // the hotel shown on the read-only details page
  tab: 'overview',    // active section tab on the read-only details page
  // The tile whose confirm/room dialog is open, and the room chosen in it.
  // Selecting a tile no longer jumps straight to checkout: it raises a dialog
  // that confirms the package. At the premium hotel that dialog also offers the
  // room types; at the value hotel there is only one room, so it is pure
  // confirmation.
  openPkgId: null,
  roomId: null,
  skipPackage: false, // shared CheckoutScreen reads this; never set in Option C
})

/** Nights, derived from the date range — the multiplier on every tile's rate. */
export const nights = computed(() => nightsBetween(journey.range))
// `journey.nights` is read all over the templates; keep it in step with the range.
Object.defineProperty(journey, 'nights', { get: () => nights.value, enumerable: true })

export const currentStage = computed(() => SCREEN_STAGE[journey.screen] ?? -1)
export const showStepper = computed(() => currentStage.value >= 0)

/** The tile whose dialog is open, if any. */
export const openPkg = computed(() => (journey.openPkgId ? packageById(journey.openPkgId) : null))

/** The room chosen for the open tile — the priced-in room until one is picked. */
export const chosenRoom = computed(() => {
  const pkg = openPkg.value || journey.activePkg
  return pkg ? resolveRoom(pkg.hotel.id, journey.roomId) : null
})

/** Does this hotel offer a choice of rooms, or just the one contracted type? */
export const hasRoomChoice = (hotelId) => roomsFor(hotelId).length > 1

/** The hotel shown on the read-only details page. */
export const activeHotel = computed(
  () => HOTELS.find((h) => h.id === journey.activeHotelId) || HOTELS[0]
)

// ── URL sync ──
function writeUrl(screen, push) {
  if (typeof window === 'undefined' || !window.history) return
  const params = new URLSearchParams(window.location.search)
  params.set('screen', screen)
  if (journey.activePkgId) params.set('pkg', journey.activePkgId)
  else params.delete('pkg')
  if (journey.guests !== 2) params.set('guests', String(journey.guests))
  else params.delete('guests')
  // Dates are shareable: they change every price on the board.
  if (journey.range?.from !== DEFAULT_RANGE.from) params.set('from', journey.range.from)
  else params.delete('from')
  if (journey.range?.to !== DEFAULT_RANGE.to) params.set('to', journey.range.to)
  else params.delete('to')
  if (screen === 'hotelDetails' && journey.activeHotelId) params.set('hotel', journey.activeHotelId)
  else params.delete('hotel')
  if (screen === 'hotelDetails' && journey.tab && journey.tab !== 'overview') params.set('tab', journey.tab)
  else params.delete('tab')
  // The open dialog and the room picked inside it are URL state, so any point in
  // the flow is shareable.
  if (journey.openPkgId) params.set('open', journey.openPkgId)
  else params.delete('open')
  if (journey.roomId) params.set('roomType', journey.roomId)
  else params.delete('roomType')
  const url = `${window.location.pathname}?${params.toString()}`
  window.history[push ? 'pushState' : 'replaceState']({ screen }, '', url)
}

// ── Navigation ──
export function nav(screen, { push = true } = {}) {
  screen = REDIRECTS[screen] || screen
  if (!SCREENS.includes(screen)) return
  journey.screen = screen
  writeUrl(screen, push)
  if (typeof window !== 'undefined') requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}
export function next() {
  const i = FLOW.indexOf(journey.screen)
  if (i >= 0 && i < FLOW.length - 1) nav(FLOW[i + 1])
}
export function back() {
  const i = FLOW.indexOf(journey.screen)
  if (i > 0) nav(FLOW[i - 1])
}
const STAGE_ENTRY = { 0: 'packages', 1: 'checkout' }
export function goToStage(stage) {
  if (STAGE_ENTRY[stage]) nav(STAGE_ENTRY[stage])
}

/**
 * Guests — universal across the board, because it decides the free tickets on
 * every tile at once. Not clamped to one room's occupancy: past that a tile
 * books a second room (see priceTile), which is what a group outing needs.
 */
export function setGuests(n) {
  journey.guests = Math.min(Math.max(1, n || 1), MAX_GUESTS)
  writeUrl(journey.screen, false)
}

/**
 * The stay dates — the other universal control. Nights derive from these, and
 * nights multiply every room rate on the board.
 */
export function setRange(range) {
  if (!range) return
  journey.range = { from: range.from || null, to: range.to || null }
  writeUrl(journey.screen, false)
}

export function setTab(name) { journey.tab = name || 'overview'; writeUrl(journey.screen, false) }

/**
 * A tile was selected — raise its dialog rather than jumping to checkout.
 *
 * The dialog is the same component either way, and what it does depends on the
 * hotel: the premium block carries several room types, so it offers the choice;
 * the value block has one contracted room, so it is pure confirmation of the
 * final package. Either way the guest sees exactly what they are buying before
 * a payment screen, which is a confirmation step, not a configuration one.
 */
export function selectTile(pkg) {
  if (!pkg) return
  journey.activePkg = pkg
  journey.activePkgId = pkg.id
  // A different package clears the room picked for the last one.
  if (journey.openPkgId !== pkg.id) journey.roomId = null
  journey.openPkgId = pkg.id
  writeUrl(journey.screen, false)
}

/** The dialog closed — by Cancel, the X, ESC or the backdrop. */
export function closePackage() {
  if (!journey.openPkgId) return
  journey.openPkgId = null
  writeUrl(journey.screen, false)
}

/** The room chosen inside the dialog (premium hotel only). */
export function setRoom(roomId) {
  journey.roomId = roomId || null
  writeUrl(journey.screen, false)
}

/** Confirmed in the dialog — now go to checkout. */
export function confirmPackage() {
  if (!journey.activePkg) return
  journey.openPkgId = null
  nav('checkout')
}

/**
 * Open a hotel's details in a NEW TAB, as a standalone read-only reference view.
 * The board (and the dates and party size on it) stays exactly as it was — which
 * is the whole reason this is a new tab rather than a navigation.
 */
export function openHotelInNewTab(hotelId) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  params.set('screen', 'hotelDetails')
  params.set('hotel', hotelId)
  params.delete('pkg')
  window.open(`${window.location.pathname}?${params.toString()}`, '_blank', 'noopener')
}

export function resetJourney() {
  journey.guests = 2
  journey.range = { ...DEFAULT_RANGE }
  journey.activePkg = null
  journey.activePkgId = null
  journey.openPkgId = null
  journey.roomId = null
  journey.tab = 'overview'
  nav('packages')
}

export function bootstrapFromUrl() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams(window.location.search)

  const from = q.get('from')
  const to = q.get('to')
  if (from || to) journey.range = { from: from || DEFAULT_RANGE.from, to: to || DEFAULT_RANGE.to }

  const g = parseInt(q.get('guests') || '0', 10)
  if (g) journey.guests = Math.min(Math.max(1, g), MAX_GUESTS)

  const pkgId = q.get('pkg')
  if (pkgId) {
    const pkg = packageById(pkgId)
    if (pkg) { journey.activePkg = pkg; journey.activePkgId = pkg.id }
  }

  const hotelId = q.get('hotel')
  if (hotelId) journey.activeHotelId = hotelId
  const tab = q.get('tab')
  if (tab) journey.tab = tab
  const roomType = q.get('roomType')
  if (roomType) journey.roomId = roomType
  const open = q.get('open')
  if (open) {
    const pkg = packageById(open)
    if (pkg) { journey.activePkg = pkg; journey.activePkgId = pkg.id; journey.openPkgId = pkg.id }
  }

  const screen = REDIRECTS[q.get('screen')] || q.get('screen')
  if (screen && SCREENS.includes(screen)) journey.screen = screen

  // Checkout with nothing selected would render the fallback tile as though it
  // had been chosen — send those links back to the board instead.
  if (journey.screen === 'checkout' && !journey.activePkg) journey.screen = 'packages'
  // Hotel details with no hotel named falls back to the first contracted one.
  if (journey.screen === 'hotelDetails' && !journey.activeHotelId) journey.activeHotelId = packageGrid.value[0]?.hotel?.id || null

  writeUrl(journey.screen, false)
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(window.location.search)
    const s = p.get('screen')
    if (s && SCREENS.includes(s)) nav(s, { push: false })
  })
}
