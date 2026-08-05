// Option D journey store — the pre-invited group flow (Aug 5 feedback).
//
//   packages       → two tiles, one per hotel — this is the LANDING page, and it
//                    can go straight to checkout
//   packageDetails → the library's package template, an OPTIONAL drill-in
//   checkout ─ confirmation
//
// Plus one OPTIONAL reference view (hotelDetails), which is never a step: it
// opens in its own tab from any hotel name, purely informational, and the flow
// behind it is untouched.
//
// What Option C carried that this does not: dates. The party is invited for two
// days, so the stay is fixed (see NIGHTS in packages.js) and nothing offers to
// change it. That removes the whole date-range surface — the picker, the nights
// derivation, the `from`/`to` URL params — and leaves exactly one variable.
//
// The separate "How many people are coming?" landing screen is gone too: the
// packages page IS the landing page now, and the headcount lives on the cards
// themselves. A screen that asks one question before showing anything is a gate;
// asking it on the card whose price it changes is not.
import { reactive, computed } from 'vue'
import { packagesFor, hotelById, HOTELS, NIGHTS } from './packages.js'

export const SCREENS = ['packages', 'packageDetails', 'checkout', 'confirmation', 'hotelDetails']
// The linear path next()/back() walk — the reference screen is excluded.
const FLOW = ['packages', 'packageDetails', 'checkout', 'confirmation']
export const STEP_LABELS = ['Package', 'Review']
// The packages page is stage -1, not 0: it is the landing page, and a progress
// bar above a landing page is orientation for progress not yet made. The stepper
// appears once a package has been opened or chosen — so a card that goes straight
// to checkout lands on "Review" with "Package" behind it, complete and clickable.
// That is honest: picking on the card IS completing the package step, and the
// detail page stays one click away for anyone who wants to look after all.
const SCREEN_STAGE = { packages: -1, packageDetails: 0, checkout: 1, confirmation: 1, hotelDetails: -1 }

// Screens from the other options that don't exist here.
const REDIRECTS = { landing: 'packages', hotels: 'packages' }

// How many people the prompt will accept. A pre-invited client outing is a small
// group; past this it stops being self-service.
export const MAX_PEOPLE = 12

export const journey = reactive({
  screen: 'packages',
  // The one variable in the whole flow.
  people: 2,
  activePkgId: null,   // the package being bought
  activeHotelId: null, // the hotel shown on the read-only details page
  tab: 'overview',     // active section tab on that page
  skipPackage: false,  // shared CheckoutScreen reads this; never set in Option D
})

// Nights are fixed — exported so screens can render the stay without importing
// packages.js just for a constant.
export const nights = NIGHTS

export const currentStage = computed(() => SCREEN_STAGE[journey.screen] ?? -1)
export const showStepper = computed(() => currentStage.value >= 0)

/** Both packages, priced for the current party. */
export const packages = computed(() => packagesFor(journey.people))

/** The package being bought — the first when deep-linked cold. */
export const activePkg = computed(
  () => packages.value.find((p) => p.id === journey.activePkgId) || packages.value[0]
)

/** The hotel shown on the read-only details page. */
export const activeHotel = computed(() => hotelById(journey.activeHotelId))

export { HOTELS }

// ── URL sync ──
function writeUrl(screen, push) {
  if (typeof window === 'undefined' || !window.history) return
  const params = new URLSearchParams(window.location.search)
  params.set('screen', screen)
  if (journey.people !== 2) params.set('people', String(journey.people))
  else params.delete('people')
  if (journey.activePkgId) params.set('pkg', journey.activePkgId)
  else params.delete('pkg')
  if (screen === 'hotelDetails' && journey.activeHotelId) params.set('hotel', journey.activeHotelId)
  else params.delete('hotel')
  if ((screen === 'hotelDetails' || screen === 'packageDetails') && journey.tab && journey.tab !== 'overview') params.set('tab', journey.tab)
  else params.delete('tab')
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
const STAGE_ENTRY = { 0: 'packageDetails', 1: 'checkout' }
export function goToStage(stage) {
  if (STAGE_ENTRY[stage]) nav(STAGE_ENTRY[stage])
}

/**
 * The party size — the only variable in Option D. It prices both packages, sets
 * the ticket count, and decides how many rooms each hotel needs at its occupancy.
 *
 * Set from the control on either package card (Aug 5 afternoon feedback — it used
 * to live in the packages header). Both cards read this one value and write back
 * through here, so the two controls are a mirror of a single number, never two
 * numbers that could drift apart.
 */
export function setPeople(n) {
  journey.people = Math.min(Math.max(1, n || 1), MAX_PEOPLE)
  writeUrl(journey.screen, false)
}

/**
 * "View package details" on a card — open the package template page for it.
 *
 * The optional drill-in, not the way through. A guest who wants the gallery, the
 * full inclusion list and the policies reads them here and selects from this
 * page's own CTA; a guest who has already decided never has to load it.
 */
export function viewPackage(pkg) {
  if (!pkg) return
  journey.activePkgId = pkg.id
  journey.tab = 'overview'
  nav('packageDetails')
}

/**
 * A package was selected — continue to checkout.
 *
 * Called from BOTH places a package can be chosen: the "Select & Check Out" CTA
 * on a card, and the Select CTA on the detail page. Same function, because they
 * are the same act — the detail page is a longer route to it, not a different
 * decision. The card path is why the detail page stopped being mandatory.
 */
export function selectPackage(pkg) {
  if (pkg) journey.activePkgId = pkg.id
  nav('checkout')
}

/**
 * "Select package" on the hotel details page — book the package for the hotel
 * being read about.
 *
 * The hotel page opens in its own tab, so this navigates THAT tab to checkout
 * and leaves the tab behind it exactly where it was. Two tabs, one on the
 * packages board and one on Review, which is how a new tab is expected to
 * behave: the page you opened is where you finish, and nothing you left is lost.
 */
export function selectPackageForHotel(hotelId) {
  const pkg = packages.value.find((p) => p.hotel.id === hotelId)
  if (pkg) selectPackage(pkg)
}

export function setTab(name) { journey.tab = name || 'overview'; writeUrl(journey.screen, false) }

/**
 * Open a hotel's details in a NEW TAB — purely informational, never a step of the
 * flow. The screen behind it keeps its state, which is the whole reason this is a
 * new tab rather than a navigation.
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
  journey.people = 2
  journey.activePkgId = null
  journey.tab = 'overview'
  nav('packages')
}

export function bootstrapFromUrl() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams(window.location.search)

  const n = parseInt(q.get('people') || q.get('guests') || '0', 10)
  if (n) journey.people = Math.min(Math.max(1, n), MAX_PEOPLE)

  const pkgId = q.get('pkg')
  if (pkgId) journey.activePkgId = pkgId

  const hotelId = q.get('hotel')
  if (hotelId) journey.activeHotelId = hotelId
  const tab = q.get('tab')
  if (tab) journey.tab = tab

  const screen = REDIRECTS[q.get('screen')] || q.get('screen')
  if (screen && SCREENS.includes(screen)) journey.screen = screen

  // Checkout with nothing selected would bill for a package nobody picked — send
  // those links back to the board. `packageDetails` needs no such guard: it shows
  // BOTH packages, so with none named it simply opens in the default order.
  if (journey.screen === 'checkout' && !journey.activePkgId) journey.screen = 'packages'
  if (journey.screen === 'hotelDetails' && !journey.activeHotelId) journey.activeHotelId = HOTELS[0].id

  writeUrl(journey.screen, false)
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(window.location.search)
    const s = p.get('screen')
    if (s && SCREENS.includes(s)) nav(s, { push: false })
  })
}
