// Experience journey store (Hotel + Packages) — the single source of truth for
// the integrated hotel + experience-package flow, plus a lightweight linear
// router. Every screen reads/writes this one reactive object; navigation glue
// lives entirely in the prototype layer (this file + App.vue). NO library
// component is modified.
//
// Flow (7 screens) mapped under 3 stepper labels (Stays · Packages · Review):
//   landing                          → (intro, no stepper — LandingPage's own nav)
//   hotels ─ hotelDetails            → Stays     (Browse Hotels → Hotel Details)
//   packages ─ packageDetails        → Packages  (Browse Packages → Package Details)
//   checkout ─ confirmation          → Review    (packages+hotel checkout · confirmed)
import { reactive, computed } from 'vue'

export const SCREENS = ['landing', 'hotels', 'hotelDetails', 'packages', 'packageDetails', 'checkout', 'confirmation']
export const STEP_LABELS = ['Stays', 'Packages', 'Review']
const SCREEN_STAGE = {
  landing: -1,
  hotels: 0, hotelDetails: 0,
  packages: 1, packageDetails: 1,
  checkout: 2, confirmation: 2,
}

export const journey = reactive({
  screen: 'landing',
  guests: 2,
  activeHotel: 'The Westin', // name shown on the Hotel Details screen
  activePkg: null,           // package opened on the Package Details screen
  skipPackage: false,        // "Skip, I don't need a package" → hotel-only checkout
  tab: 'overview',           // active section tab on a detail screen (deep-linkable)
})

export const currentStage = computed(() => SCREEN_STAGE[journey.screen] ?? -1)
export const showStepper = computed(() => currentStage.value >= 0)

// Detail screens whose active section tab is reflected in the URL as `&tab=`.
const TABBED = new Set(['hotelDetails', 'packageDetails'])

// ── URL sync ──
function writeUrl(screen, push) {
  if (typeof window === 'undefined' || !window.history) return
  const params = new URLSearchParams(window.location.search)
  params.set('screen', screen)
  // Reflect the section tab on detail screens (omit the default 'overview').
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
// Stepper tabs jump to the first screen of any stage (forward or back).
const STAGE_ENTRY = { 0: 'hotels', 1: 'packages', 2: 'checkout' }
export function goToStage(stage) {
  if (STAGE_ENTRY[stage]) nav(STAGE_ENTRY[stage])
}

export function setGuests(n) { journey.guests = Math.max(1, n || 1) }
export function setTab(name) { journey.tab = name || 'overview'; writeUrl(journey.screen, false) }
export function openHotel(name, tab = 'overview') { journey.tab = tab; if (name) journey.activeHotel = name; nav('hotelDetails') }
export function openPackage(pkg, tab = 'overview') { journey.tab = tab; journey.activePkg = pkg; nav('packageDetails') }
export function resetJourney() { journey.guests = 2; journey.skipPackage = false; journey.activePkg = null; journey.tab = 'overview'; nav('landing') }

export function bootstrapFromUrl() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams(window.location.search)
  const g = parseInt(q.get('guests') || '0', 10)
  if (g) journey.guests = g
  if (q.get('skip') === '1') journey.skipPackage = true
  const tab = q.get('tab')
  if (tab) journey.tab = tab
  const screen = q.get('screen')
  if (screen && SCREENS.includes(screen)) journey.screen = screen
  writeUrl(journey.screen, false)
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(window.location.search)
    const s = p.get('screen')
    journey.tab = p.get('tab') || 'overview'
    if (s && SCREENS.includes(s)) nav(s, { push: false })
  })
}
