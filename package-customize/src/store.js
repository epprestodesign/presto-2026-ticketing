// The journey store — browse a pre-built package, then take it apart.
//
//   packages       → the three pre-built packages (LANDING)
//   packageDetails → the library's package template — everything included
//   customize      → the components themselves, edited, priced live
//   checkout ─ confirmation
//
// Plus two OPTIONAL views, neither of which is a step:
//   hotelDetails → opens in its own tab from any hotel name, and its room list
//                  can push a room back into the configuration.
//   cart         → the full cart page behind the nav's cart peek. Reachable
//                  from anywhere the cart icon is, and it leads back to
//                  customize or on to checkout, so it is a side door on the
//                  flow rather than a station in it (see FLOW below).
//
// --- What this holds that Option D's store does not --------------------------
// Option D's whole state is `people` plus which of two packages was clicked; the
// package itself is immutable, so the store has nothing else to keep. Here the
// package is a STARTING POINT, and what the guest is actually buying is a
// `config` — tier, hotel, room, extras, party size — that starts as the package's
// preset and diverges from it.
//
// So `config` is the single source of truth for price, and `journey.config.pkgId`
// only records which preset it came from. Every screen prices from
// `priceConfiguration(config)`; nothing anywhere caches a total.
import { reactive, computed } from 'vue'
import {
  PACKAGES, HOTELS, NIGHTS, DEFAULT_PARTY,
  packageById, hotelById, roomsFor, buildPackage, configFor,
  priceConfiguration, extraById, resolveTier, TRANSPORT_OPTIONS,
} from './packages.js'

export const SCREENS = ['packages', 'packageDetails', 'customize', 'checkout', 'confirmation', 'hotelDetails', 'cart']
// The linear path next()/back() walk — the reference screens are excluded.
//
// `cart` is deliberately NOT in FLOW. Putting it between customize and checkout
// would have made it a step every guest walks through, which is the opposite of
// what a cart is: it is the thing you can always open and rarely need to. It
// would also have redirected `next()` off the customize screen away from
// checkout, quietly demoting the one CTA the Aug 25 review asked to punch up.
const FLOW = ['packages', 'packageDetails', 'customize', 'checkout', 'confirmation']

// Screens that mean the guest is holding a package. Reaching any of them fills
// the cart; reaching confirmation empties it, because it has been bought. The
// browse screens leave it alone — you can go back and look at the board while
// still carrying what you built. See `journey.inCart`.
const HOLDS_CART = ['customize', 'cart', 'checkout']

// There is no stage model here any more. This file used to export STEP_LABELS,
// currentStage, showStepper and goToStage to drive an `AppStepper` in the shell;
// the Aug 25 review removed the stepper from the prototype (see App.vue for the
// quotes and for why it went from every screen rather than only from customize),
// and state that nothing renders is state that quietly goes stale. The screen
// name in `journey.screen` is the whole of the flow's position.

// Screens from the sibling prototypes that don't exist here.
const REDIRECTS = { landing: 'packages', hotels: 'packages' }

// How many people the prompt will accept. A pre-invited client outing is a small
// group; past this it stops being self-service.
export const MAX_PEOPLE = 12

export const journey = reactive({
  screen: 'packages',
  // Everything the guest is buying. Seeded from the first package's preset so a
  // cold deep link into any screen has a complete, priceable configuration.
  config: configFor(PACKAGES[0].id, DEFAULT_PARTY),
  activeHotelId: null, // the hotel shown on the read-only details page
  tab: 'overview',     // active section tab on that page
  skipPackage: false,  // the shared CheckoutScreen reads this; never set here

  /**
   * Is the guest HOLDING this package, or just looking at the board?
   *
   * `config` is always complete — it is seeded from the first preset so a cold
   * deep link into any screen is priceable. That is right for pricing and wrong
   * for a cart: without this flag the nav badge would read "4 items" on the
   * landing page before the guest has clicked anything, which is a lie told by
   * the one control whose entire job is to report what you have taken.
   *
   * Opening the customize screen is what takes a package. Browsing the board and
   * reading a package's details page are not — those are the catalogue.
   */
  inCart: false,

  /**
   * The customize-screen section to scroll to on arrival, set by the cart page's
   * per-line "Change" links and cleared as soon as it is used. It is transient
   * intent, not state, so it stays out of the URL: a shared link should open the
   * package, not somebody else's scroll position.
   */
  focus: null,
})

export const nights = NIGHTS
export { HOTELS }

/** The three pre-built tiles, each priced on its own preset at the party size. */
export const packages = computed(() =>
  PACKAGES.map((p) => buildPackage(p.id, configFor(p.id, journey.config.guests)))
)

/** The preset the current configuration started from. */
export const basePackage = computed(() => packageById(journey.config.pkgId))

/** The configuration, priced. The number every screen shows. */
export const priced = computed(() => priceConfiguration(journey.config))

/** The configuration in card shape — name, imagery, inclusions, price. */
export const activePkg = computed(() => buildPackage(journey.config.pkgId, journey.config))

/** The hotel shown on the read-only details page. */
export const activeHotel = computed(() => hotelById(journey.activeHotelId))

/**
 * Has the guest changed anything? Drives the "Reset to the original package"
 * affordance and the "customised" marker on the summary — an untouched
 * configuration should not claim to be one.
 */
export const isCustomized = computed(() => {
  const { preset } = basePackage.value
  const c = journey.config
  return (
    c.tierId !== preset.tierId ||
    c.hotelId !== preset.hotelId ||
    c.roomId !== preset.roomId ||
    c.extraIds.length !== preset.extraIds.length ||
    c.extraIds.some((id) => !preset.extraIds.includes(id))
  )
})

/**
 * What changed, as sentences. The review summary states the diff rather than
 * leaving the guest to remember it: they came in on a named package, and if the
 * thing they check out with no longer matches that name, the page should say so
 * before checkout does.
 */
export const changesFromPreset = computed(() => {
  const { preset } = basePackage.value
  const c = journey.config
  const out = []
  if (c.tierId !== preset.tierId) {
    out.push(`Tickets changed from ${resolveTier(preset.tierId).name} to ${resolveTier(c.tierId).name}`)
  }
  if (c.hotelId !== preset.hotelId) {
    out.push(`Hotel changed from ${hotelById(preset.hotelId).name} to ${hotelById(c.hotelId).name}`)
  } else if (c.roomId !== preset.roomId) {
    out.push(`Room changed from ${roomName(preset.hotelId, preset.roomId)} to ${roomName(c.hotelId, c.roomId)}`)
  }
  preset.extraIds.filter((id) => !c.extraIds.includes(id))
    .forEach((id) => out.push(`Removed ${extraById(id)?.label || id}`))
  c.extraIds.filter((id) => !preset.extraIds.includes(id))
    .forEach((id) => out.push(`Added ${extraById(id)?.label || id}`))
  return out
})

const roomName = (hotelId, roomId) => roomsFor(hotelId).find((r) => r.id === roomId)?.name || roomId

// ── URL sync ──
// The whole configuration round-trips through the query string, so any state the
// customize screen can reach is a link somebody can send. That matters more here
// than in the fixed-package options: "look at what I built" is the natural thing
// to want to share off this screen.
function writeUrl(screen, push) {
  if (typeof window === 'undefined' || !window.history) return
  const c = journey.config
  const { preset } = packageById(c.pkgId)
  const params = new URLSearchParams(window.location.search)
  params.set('screen', screen)
  params.set('pkg', c.pkgId)
  if (c.guests !== DEFAULT_PARTY) params.set('people', String(c.guests))
  else params.delete('people')
  // Only the DIVERGENCE goes in the URL. A link to an untouched package is
  // `?screen=customize&pkg=club-weekend`, not a wall of parameters restating its
  // own preset back to it.
  setOrDrop(params, 'tier', c.tierId, preset.tierId)
  setOrDrop(params, 'hotel', c.hotelId, preset.hotelId)
  setOrDrop(params, 'room', c.roomId, preset.roomId)
  setOrDrop(params, 'extras', c.extraIds.join(','), preset.extraIds.join(','))
  if (screen === 'hotelDetails' && journey.activeHotelId) params.set('view', journey.activeHotelId)
  else params.delete('view')
  if ((screen === 'hotelDetails' || screen === 'packageDetails') && journey.tab && journey.tab !== 'overview') params.set('tab', journey.tab)
  else params.delete('tab')
  const url = `${window.location.pathname}?${params.toString()}`
  window.history[push ? 'pushState' : 'replaceState']({ screen }, '', url)
}
const setOrDrop = (params, key, value, presetValue) => {
  if (value === presetValue) params.delete(key)
  else params.set(key, value)
}

// ── Navigation ──
export function nav(screen, { push = true } = {}) {
  screen = REDIRECTS[screen] || screen
  if (!SCREENS.includes(screen)) return
  // Derived here rather than at each call site so the browser's Back button gets
  // the same answer as a click: walking back from confirmation to customize has
  // to refill the cart, or the badge would read 0 over a full configuration.
  if (screen === 'confirmation') journey.inCart = false
  else if (HOLDS_CART.includes(screen)) journey.inCart = true
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
// ── Choosing a package ──

/**
 * Load a package's preset into the configuration.
 *
 * Switching packages DISCARDS whatever was customised, because the presets differ
 * on every axis — carrying a Ritz suite into The Tailgater would produce a
 * "package" that matches neither its name nor its price, and there is no honest
 * way to merge two starting points. Re-picking the package you are already on is
 * a no-op rather than a silent reset, so opening the details of your own package
 * never throws away your work.
 */
function loadPreset(pkgId) {
  if (journey.config.pkgId === pkgId) return
  journey.config = configFor(pkgId, journey.config.guests)
}

/** "View package details" — the library template for one package. */
export function viewPackage(pkgId) {
  loadPreset(pkgId)
  journey.tab = 'overview'
  nav('packageDetails')
}

/** "Customize this package" — straight to the component editor. */
export function customizePackage(pkgId) {
  if (pkgId) loadPreset(pkgId)
  nav('customize')
}

/** The review CTA — the configuration goes to checkout as it stands. */
export function checkout() { nav('checkout') }

/** The nav cart peek's way through to the full cart page. */
export function openCart() { nav('cart') }

/**
 * "Change" on a cart line — back to the customize screen, landing on the control
 * that owns that line.
 *
 * This is how the cart page stays editable WITHOUT becoming a second editor. The
 * five axes already have one screen that edits them, with every alternative
 * priced against the package total; a tier picker or a room list rebuilt on the
 * cart page would be a second implementation of the same choice, and the two
 * would drift the first time one of them learned something the other didn't.
 * Sending the guest to the real control — with their configuration intact and the
 * page scrolled to the right section — is editing in place as far as the guest is
 * concerned: nothing is lost and nothing restarts.
 *
 * The one exception is dropping an add-on, which the cart page does itself: it is
 * a single call to the same `toggleExtra()` the customize screen calls, so there
 * is no second implementation to drift.
 */
export function editSection(section) {
  journey.focus = section || null
  nav('customize')
}

// ── Editing the configuration ──
// Every setter writes the URL without pushing history: a customize session is one
// screen being adjusted, not a stack of screens. Back from checkout should land
// on the customize screen, not walk backwards through twelve price changes.

export function setGuests(n) {
  journey.config.guests = Math.min(Math.max(1, n || 1), MAX_PEOPLE)
  writeUrl(journey.screen, false)
}

export function setTier(tierId) {
  journey.config.tierId = tierId
  writeUrl(journey.screen, false)
}

/**
 * Change hotel — and carry the room CAPACITY across, not the room name.
 *
 * Room ids don't exist in more than one hotel, so something has to be picked for
 * the guest. Picking `rooms[0]` was rejected: every hotel's first room sleeps 2,
 * so a party of six moving from a Carlton Suite would land on a base room and
 * silently go from two rooms to three — a price jump nobody asked for, attributed
 * to a hotel change. Matching occupancy first (and the cheapest room at that
 * occupancy) keeps the room COUNT stable, so the only thing that moves is the
 * thing the guest actually changed.
 *
 * Pure, and exported, because the customize screen prices every hotel row as
 * "what would happen if I clicked this". If the preview used a different rule
 * than the click, the delta on the row would be a number the guest never gets.
 * One function, used by both.
 */
export function withHotel(config, hotelId) {
  const current = roomsFor(config.hotelId).find((r) => r.id === config.roomId)
  const rooms = roomsFor(hotelId)
  const sameCapacity = rooms.filter((r) => r.sleeps === current?.sleeps)
  const pick = (sameCapacity.length ? sameCapacity : rooms)
    .slice()
    .sort((a, b) => a.deltaPerNight - b.deltaPerNight)[0]
  return { ...config, hotelId, roomId: pick.id }
}

export function setHotel(hotelId) {
  journey.config = withHotel(journey.config, hotelId)
  writeUrl(journey.screen, false)
}

export function setRoom(roomId) {
  journey.config.roomId = roomId
  writeUrl(journey.screen, false)
}

/**
 * Getting there is single-choice — see the comment on TRANSPORT_OPTIONS. Setting
 * one drops whichever was held, so the configuration can never carry a coach
 * booking and a parking pass at the same time.
 */
export function withTransport(config, extraId) {
  const transportIds = TRANSPORT_OPTIONS.map((e) => e.id)
  return {
    ...config,
    extraIds: [
      ...config.extraIds.filter((id) => !transportIds.includes(id)),
      ...(extraId ? [extraId] : []),
    ],
  }
}

export function setTransport(extraId) {
  journey.config = withTransport(journey.config, extraId)
  writeUrl(journey.screen, false)
}

export function withExtra(config, extraId) {
  const held = config.extraIds.includes(extraId)
  return {
    ...config,
    extraIds: held ? config.extraIds.filter((id) => id !== extraId) : [...config.extraIds, extraId],
  }
}

export function toggleExtra(extraId) {
  journey.config = withExtra(journey.config, extraId)
  writeUrl(journey.screen, false)
}

/** Back to the package as it was sold. */
export function resetConfig() {
  journey.config = configFor(journey.config.pkgId, journey.config.guests)
  writeUrl(journey.screen, false)
}

export function setTab(name) { journey.tab = name || 'overview'; writeUrl(journey.screen, false) }

/**
 * Open a hotel's details in a NEW TAB — informational, never a step of the flow.
 * The customize screen behind it keeps every choice made so far, which is the
 * whole reason this is a new tab rather than a navigation.
 */
export function openHotelInNewTab(hotelId) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  params.set('screen', 'hotelDetails')
  params.set('view', hotelId)
  window.open(`${window.location.pathname}?${params.toString()}`, '_blank', 'noopener')
}

/**
 * A room was picked from the hotel details tab — put it in the configuration and
 * continue in THIS tab. The tab it was opened from stays on the customize screen;
 * both tabs then describe the same package, because the price is a function of
 * the configuration and the configuration travelled in the URL.
 */
export function useRoomFromHotelPage(hotelId, roomId) {
  journey.config.hotelId = hotelId
  journey.config.roomId = roomId
  nav('customize')
}

export function resetJourney() {
  journey.config = configFor(PACKAGES[0].id, DEFAULT_PARTY)
  journey.tab = 'overview'
  journey.focus = null
  // Start over means an empty cart. The wordmark and "Manage Booking" both land
  // here, and a nav that dumped the guest on the catalogue while still claiming
  // to hold four components would be the badge lying in the other direction.
  journey.inCart = false
  nav('packages')
}

export function bootstrapFromUrl() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams(window.location.search)

  const pkgId = q.get('pkg')
  const guests = parseInt(q.get('people') || q.get('guests') || '0', 10)
  journey.config = configFor(
    pkgId && PACKAGES.some((p) => p.id === pkgId) ? pkgId : PACKAGES[0].id,
    guests ? Math.min(Math.max(1, guests), MAX_PEOPLE) : DEFAULT_PARTY
  )

  // Then the divergence, each validated against the catalogue — a hand-edited or
  // stale link falls back to the preset's value rather than pricing something
  // that doesn't exist.
  const tier = q.get('tier')
  if (tier) journey.config.tierId = resolveTier(tier).id
  const hotel = q.get('hotel')
  if (hotel && HOTELS.some((h) => h.id === hotel)) journey.config.hotelId = hotel
  const room = q.get('room')
  if (room && roomsFor(journey.config.hotelId).some((r) => r.id === room)) journey.config.roomId = room
  else if (hotel) journey.config.roomId = roomsFor(journey.config.hotelId)[0].id
  const extras = q.get('extras')
  if (extras !== null) journey.config.extraIds = extras.split(',').filter((id) => extraById(id))

  const view = q.get('view') || q.get('hotel')
  if (view && HOTELS.some((h) => h.id === view)) journey.activeHotelId = view
  const tab = q.get('tab')
  if (tab) journey.tab = tab

  const screen = REDIRECTS[q.get('screen')] || q.get('screen')
  if (screen && SCREENS.includes(screen)) journey.screen = screen
  if (journey.screen === 'hotelDetails' && !journey.activeHotelId) journey.activeHotelId = HOTELS[0].id
  // This assignment bypasses nav(), so the cart rule has to be applied by hand.
  // A deep link INTO the flow is somebody carrying a package; a deep link to the
  // board or to a placed confirmation is not.
  journey.inCart = HOLDS_CART.includes(journey.screen)

  writeUrl(journey.screen, false)
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(window.location.search)
    const s = p.get('screen')
    if (s && SCREENS.includes(s)) nav(s, { push: false })
  })
}
