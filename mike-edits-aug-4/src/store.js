// Experience journey store (Hotel + Packages) — the single source of truth for
// the integrated hotel + experience-package flow, plus a lightweight linear
// router. Every screen reads/writes this one reactive object; navigation glue
// lives entirely in the prototype layer (this file + App.vue). NO library
// component is modified.
//
// Flow (Aug 4 rework, v2) — PACKAGES LEAD, and the package DETAILS PAGE IS GONE:
//   landing      → (intro, no stepper — LandingPage's own nav)
//   packages     → Packages  (Browse Packages; every detail lives in the modal)
//   checkout ─ confirmation → Review (checkout · confirmed)
//
// Browse Packages lists horizontal package rows that expand to show room
// availability inline. Opening a row raises the full package modal — photos,
// what's included, the package's hotels each with their room types (bed, size,
// sleeps, amenities, paid extras) — and "Reserve" goes straight to Checkout.
//
// Browse Hotels / Hotel Details are not stages of the journey. Hotel Details is a
// READ-ONLY reference view opened in a new tab whenever a hotel or brand name is
// clicked (hence stage -1: no stepper there, and nothing selectable on it).
import { reactive, computed } from 'vue'

export const SCREENS = ['landing', 'packages', 'checkout', 'confirmation', 'hotels', 'hotelDetails']
// The linear path next()/back() walk — the off-flow hotel screens are excluded.
const FLOW = ['landing', 'packages', 'checkout', 'confirmation']
export const STEP_LABELS = ['Packages', 'Review']
const SCREEN_STAGE = {
  landing: -1,
  packages: 0,
  checkout: 1, confirmation: 1,
  // Off-flow reference screens — no stepper.
  hotels: -1, hotelDetails: -1,
}
// Retired screen → where its deep links now land.
const REDIRECTS = { packageDetails: 'packages' }

export const journey = reactive({
  screen: 'landing',
  guests: 2,
  activeHotel: 'The Westin', // name shown on the Hotel Details reference page
  activePkg: null,           // the package being configured / reserved
  openPkgId: null,           // package whose modal is open — mirrored as `&pkg=`
  roomHotelId: null,         // hotel chosen for a package that includes a stay
  roomTypeId: null,          // room type chosen at that hotel
  tierId: null,              // ticket tier chosen for the package
  extraId: 'none',           // paid extra chosen for the room
  skipPackage: false,        // legacy hotel-only checkout (kept for ?skip=1 deep links)
  tab: 'overview',           // active section tab on a detail screen (deep-linkable)
})

export const currentStage = computed(() => SCREEN_STAGE[journey.screen] ?? -1)
export const showStepper = computed(() => currentStage.value >= 0)

// Detail screens whose active section tab is reflected in the URL as `&tab=`.
const TABBED = new Set(['hotelDetails'])

// ── URL sync ──
function writeUrl(screen, push) {
  if (typeof window === 'undefined' || !window.history) return
  const params = new URLSearchParams(window.location.search)
  params.set('screen', screen)
  // Reflect the section tab on detail screens (omit the default 'overview').
  if (TABBED.has(screen) && journey.tab && journey.tab !== 'overview') params.set('tab', journey.tab)
  else params.delete('tab')
  // The open modal and the configuration inside it are all URL state, so any
  // point in the flow is copy-paste shareable. `pkg` is cleared the moment the
  // modal closes (see closePackage) — otherwise a stale param would re-open it on
  // the next load.
  if (journey.openPkgId) params.set('pkg', journey.openPkgId)
  else params.delete('pkg')
  if (journey.roomHotelId) params.set('room', journey.roomHotelId)
  else params.delete('room')
  if (journey.roomTypeId) params.set('roomType', journey.roomTypeId)
  else params.delete('roomType')
  if (journey.tierId) params.set('tier', journey.tierId)
  else params.delete('tier')
  const url = `${window.location.pathname}?${params.toString()}`
  window.history[push ? 'pushState' : 'replaceState']({ screen }, '', url)
}

// ── Navigation ──
export function nav(screen, { push = true } = {}) {
  screen = REDIRECTS[screen] || screen
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
// Stepper tabs jump to the first screen of any stage (forward or back).
const STAGE_ENTRY = { 0: 'packages', 1: 'checkout' }
export function goToStage(stage) {
  if (STAGE_ENTRY[stage]) nav(STAGE_ENTRY[stage])
}

export function setGuests(n) { journey.guests = Math.max(1, n || 1) }
export function setTab(name) { journey.tab = name || 'overview'; writeUrl(journey.screen, false) }
export function openHotel(name, tab = 'overview') { journey.tab = tab; if (name) journey.activeHotel = name; nav('hotelDetails') }
/**
 * Start configuring a package — called as its modal is raised over Browse
 * Packages. Nothing navigates; the URL gains `&pkg=<id>` so the open modal is
 * shareable and survives a reload.
 */
export function openPackage(pkg) {
  // Switching to a DIFFERENT package clears the hotel/room picked for the last
  // one. Guarded on activePkg existing, so arriving cold on
  // `?pkg=…&room=…&roomType=…` keeps the configuration from the link.
  if (journey.activePkg && pkg?.id !== journey.activePkg.id) {
    journey.roomHotelId = null
    journey.roomTypeId = null
    journey.tierId = null
    journey.extraId = 'none'
  }
  journey.activePkg = pkg
  journey.openPkgId = pkg?.id || null
  writeUrl(journey.screen, false)
}

/**
 * The modal closed — by the X, ESC, or the backdrop. Drops `&pkg=` so a reload
 * lands on the grid rather than re-opening what someone dismissed.
 */
export function closePackage() {
  if (!journey.openPkgId) return
  journey.openPkgId = null
  writeUrl(journey.screen, false)
}

// What the guest configured inside the modal: the hotel, the room type at it,
// and the paid extra on that room.
export function setRoom(hotelId) {
  if (hotelId !== journey.roomHotelId) journey.roomTypeId = null // rooms are per hotel
  journey.roomHotelId = hotelId || null
  writeUrl(journey.screen, false)
}
export function setRoomType(typeId) { journey.roomTypeId = typeId || null; writeUrl(journey.screen, false) }
export function setTier(tierId) { journey.tierId = tierId || null; writeUrl(journey.screen, false) }
export function setExtra(extraId) { journey.extraId = extraId || 'none' }

/**
 * Open a hotel's details in a NEW TAB, as a standalone reference view — the
 * package page (and the guest's room choice) stays exactly as it was.
 */
export function openHotelInNewTab(hotelName) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  params.set('screen', 'hotelDetails')
  params.set('hotel', hotelName)
  params.delete('tab')
  window.open(`${window.location.pathname}?${params.toString()}`, '_blank', 'noopener')
}

export function resetJourney() {
  journey.guests = 2
  journey.skipPackage = false
  journey.activePkg = null
  journey.openPkgId = null
  journey.roomHotelId = null
  journey.roomTypeId = null
  journey.tierId = null
  journey.extraId = 'none'
  journey.tab = 'overview'
  nav('landing')
}

export function bootstrapFromUrl() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams(window.location.search)
  const g = parseInt(q.get('guests') || '0', 10)
  if (g) journey.guests = g
  if (q.get('skip') === '1') journey.skipPackage = true
  const tab = q.get('tab')
  if (tab) journey.tab = tab
  // `hotel` names the property shown on Hotel Details (set by the new-tab link);
  // `room` deep-links a package's chosen hotel option.
  const hotelName = q.get('hotel')
  if (hotelName) journey.activeHotel = hotelName
  const room = q.get('room')
  if (room) journey.roomHotelId = room
  const roomType = q.get('roomType')
  if (roomType) journey.roomTypeId = roomType
  const tier = q.get('tier')
  if (tier) journey.tierId = tier
  // `pkg` re-opens that package's modal once its row mounts.
  const pkgId = q.get('pkg')
  if (pkgId) journey.openPkgId = pkgId
  const screen = REDIRECTS[q.get('screen')] || q.get('screen')
  if (screen && SCREENS.includes(screen)) journey.screen = screen
  writeUrl(journey.screen, false)
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(window.location.search)
    const s = p.get('screen')
    journey.tab = p.get('tab') || 'overview'
    if (s && SCREENS.includes(s)) nav(s, { push: false })
  })
}
