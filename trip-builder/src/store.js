// Trip Builder store — the cart IS the state, and the screens are just places to
// put things into it.
//
// Forked from /experience, which ran a fixed line: landing → hotels → hotel
// details → tickets → checkout. Everything about that shape is gone. There is no
// SCREENS order to walk, no next()/back(), and no stepper, because there is no
// step 1: a guest can start on tickets, on a hotel, or on an add-on, and the
// three routes converge on one `trip.items`.
//
// What replaced the stepper is `trip` itself. Every screen reads it, every screen
// can add to it, and the trip bar renders it on every screen — so "where am I in
// the flow" is answered by what's in the cart rather than by how far along a rail
// a dot has travelled.
//
// One rule holds the whole thing together: **a line is only ever edited or
// removed, never rebuilt.** removeItem() returns what it took out and where it
// sat, so restoring is exact; updateItem() patches one line and touches nothing
// else. Nothing in here can clear the cart as a side effect of a navigation.
import { reactive, computed } from 'vue'
import { STAYS, ADDONS, TIERS, stayById, priceTrip, MAX_NIGHTS, MAX_ROOMS } from './trip.js'

export const SCREENS = ['landing', 'stays', 'hotel', 'tickets', 'addons', 'trip', 'checkout', 'confirmation']

// The three entry points, in the order the landing page offers them. Each one is
// a first step and none of them is THE first step.
export const ENTRIES = [
  { kind: 'stay', screen: 'stays', icon: 'hotel', label: 'Start with a hotel' },
  { kind: 'ticket', screen: 'tickets', icon: 'confirmation_number', label: 'Start with tickets' },
  { kind: 'addon', screen: 'addons', icon: 'auto_awesome', label: 'Start with an add-on' },
]
// Where "add more of this" goes, once the guest is already building.
export const ADD_SCREEN = { stay: 'stays', ticket: 'tickets', addon: 'addons' }

export const trip = reactive({
  items: [],
  screen: 'landing',
})

// Deterministic line ids (no Date.now, no random) so a rebuilt trip from a deep
// link is byte-identical to one built by clicking.
let seq = 0
const nextUid = () => `L${++seq}`

export const items = computed(() => trip.items)
export const totals = computed(() => priceTrip(trip.items))
export const itemsOf = (kind) => trip.items.filter((i) => i.kind === kind)
export const count = computed(() => trip.items.reduce((s, i) => s + (i.kind === 'stay' ? 1 : i.qty), 0))
export const isEmpty = computed(() => trip.items.length === 0)
export const has = (kind) => trip.items.some((i) => i.kind === kind)
export const stayLine = computed(() => trip.items.find((i) => i.kind === 'stay') || null)

// ── Adding ──
// A trip holds at MOST ONE stay. Not because the cart couldn't carry two, but
// because "add a second hotel for the same night" is a mistake far more often
// than it is an intent — so a second hotel replaces the first, and the screens
// say so before it happens. Tickets and add-ons are untouched by that swap,
// which is the point: changing where you sleep is not restarting your trip.
export function addStay({ hotelId, roomId, nights = 1, rooms = 1 }) {
  const line = {
    uid: nextUid(), kind: 'stay', hotelId, roomId,
    nights: clamp(nights, 1, MAX_NIGHTS), rooms: clamp(rooms, 1, MAX_ROOMS),
  }
  const at = trip.items.findIndex((i) => i.kind === 'stay')
  if (at >= 0) trip.items.splice(at, 1, line) // in place — the stay keeps its position in the trip
  else trip.items.push(line)
  syncUrl()
  return line
}

// Tickets accumulate: adding 2 Club to a trip that already holds 2 Club leaves 4,
// rather than a second Club line the guest has to reconcile.
export function addTickets(tierId, qty = 1) {
  const existing = trip.items.find((i) => i.kind === 'ticket' && i.tierId === tierId)
  if (existing) existing.qty = clamp(existing.qty + qty, 1, 24)
  else trip.items.push({ uid: nextUid(), kind: 'ticket', tierId, qty: clamp(qty, 1, 24) })
  syncUrl()
}

// Add-ons are set, not accumulated — the browse card carries a stepper bound to
// the trip, so its number IS the line's number and adding twice isn't a thing.
export function setAddonQty(addonId, qty) {
  const existing = trip.items.find((i) => i.kind === 'addon' && i.addonId === addonId)
  if (qty <= 0) { if (existing) removeItem(existing.uid); return }
  if (existing) existing.qty = qty
  else trip.items.push({ uid: nextUid(), kind: 'addon', addonId, qty })
  syncUrl()
}
export const addonQty = (addonId) => trip.items.find((i) => i.kind === 'addon' && i.addonId === addonId)?.qty || 0

// ── Editing and removing, in place ──
export function updateItem(uid, patch) {
  const line = trip.items.find((i) => i.uid === uid)
  if (!line) return
  Object.assign(line, patch)
  syncUrl()
}
export function setQty(uid, qty) {
  if (qty <= 0) { removeItem(uid); return }
  updateItem(uid, { qty })
}
/** Removes one line and hands back enough to put it back exactly where it was. */
export function removeItem(uid) {
  const index = trip.items.findIndex((i) => i.uid === uid)
  if (index < 0) return null
  const [item] = trip.items.splice(index, 1)
  syncUrl()
  return { item, index }
}
export function restoreItem(item, index) {
  if (!item) return
  trip.items.splice(Math.min(index, trip.items.length), 0, item)
  syncUrl()
}
export function clearTrip() { trip.items = []; syncUrl() }

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(n || lo))) }

// ── The hotel page ──
// Aug 25 feedback: "I never want to have this as a pop-up … we're always going
// to want a clean page." So the stay editor is no longer a modal opened over
// whatever screen the guest happened to be on — it is a SCREEN. `stays` browses
// the block, `hotel` is one property's detail page, and BOTH adding a stay and
// editing one happen there, on the same surface, as they did in the dialog.
//
// All the state that used to describe "which dialog is open over what" collapses
// to one field: which property the hotel page is showing. The screen carries the
// rest, which is the point of making it a screen.
export const stayView = reactive({ hotelId: null })

// The line being edited is DERIVED, not remembered. A stored uid would have to
// survive a reload from a deep link, where uids are minted fresh on decode — and
// "the stay in the trip at THIS property" is the same answer without storing
// anything. It also makes the swap warning fall out for free: a stay booked at a
// different property is, by definition, not this page's line.
export const editingStay = computed(() => {
  const line = stayLine.value
  return line && line.hotelId === stayView.hotelId ? line : null
})
/** The stay a choice made on this page would displace — named before it happens. */
export const replacingStay = computed(() => {
  const line = stayLine.value
  return line && line.hotelId !== stayView.hotelId ? stayById(line.hotelId) : null
})

export function openStay(hotelId) {
  stayView.hotelId = hotelId || stayLine.value?.hotelId || STAYS[0].id
  nav('hotel')
}
/** Add this page's property to the trip, or patch the line already holding it. */
export function commitStay(draft) {
  const line = editingStay.value
  // Same property → patch the existing line so it keeps its uid and its place in
  // the cart. Different property → addStay() swaps it in position. Either way
  // the tickets and add-ons in the trip are never touched.
  if (line) { updateItem(line.uid, draft); return line }
  return addStay({ hotelId: stayView.hotelId, ...draft })
}

// ── URL sync ──
// Two things are reflected: the screen, and THE WHOLE CART. The cart is in the
// URL because a prototype about partial trips has to be able to hand someone a
// link to a partial trip — "tickets only, at checkout" is a state worth arguing
// about, and describing it in prose is not the same as opening it.
//
//   ?screen=trip&trip=stay.westin.double.2.1_tk.club.4_ad.shuttle.4
//
// Fields are dot-separated and lines underscore-separated: both survive
// URLSearchParams without percent-encoding, so the link stays readable.
function encodeTrip(list = trip.items) {
  return list.map((i) => (
    i.kind === 'stay' ? ['stay', i.hotelId, i.roomId, i.nights, i.rooms].join('.')
      : i.kind === 'ticket' ? ['tk', i.tierId, i.qty].join('.')
        : ['ad', i.addonId, i.qty].join('.')
  )).join('_')
}
function decodeTrip(text) {
  const out = []
  for (const chunk of String(text || '').split('_').filter(Boolean)) {
    const [kind, a, b, c, d] = chunk.split('.')
    if (kind === 'stay' && STAYS.some((s) => s.id === a)) out.push({ uid: nextUid(), kind: 'stay', hotelId: a, roomId: b || 'standard', nights: clamp(+c || 1, 1, MAX_NIGHTS), rooms: clamp(+d || 1, 1, MAX_ROOMS) })
    else if (kind === 'tk' && TIERS.some((t) => t.id === a)) out.push({ uid: nextUid(), kind: 'ticket', tierId: a, qty: clamp(+b || 1, 1, 24) })
    else if (kind === 'ad' && ADDONS.some((x) => x.id === a)) out.push({ uid: nextUid(), kind: 'addon', addonId: a, qty: clamp(+b || 1, 1, 12) })
  }
  return out
}

function syncUrl(push = false) {
  if (typeof window === 'undefined' || !window.history) return
  const params = new URLSearchParams(window.location.search)
  params.set('screen', trip.screen)
  // The hotel page is a place, so it needs an address: without the property in
  // the URL, `?screen=hotel` would reload onto a page with no hotel on it.
  if (trip.screen === 'hotel' && stayView.hotelId) params.set('hotel', stayView.hotelId)
  else params.delete('hotel')
  const encoded = encodeTrip()
  if (encoded) params.set('trip', encoded)
  else params.delete('trip')
  window.history[push ? 'pushState' : 'replaceState']({ screen: trip.screen }, '', `${window.location.pathname}?${params.toString()}`)
}

// ── Navigation ──
// Navigation only moves the guest. It never touches trip.items — walking away
// from the tickets screen without picking any leaves the trip exactly as it was.
export function nav(screen, { push = true } = {}) {
  if (!SCREENS.includes(screen)) return
  trip.screen = screen
  syncUrl(push)
  if (typeof window !== 'undefined') requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}
/** "Add more of this" from anywhere — the trip bar's three buttons. */
export function addMore(kind) { nav(ADD_SCREEN[kind] || 'stays') }
/** Start over: the only path that empties the cart, and it says so first. */
export function resetTrip() { clearTrip(); nav('landing') }

export function bootstrapFromUrl() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams(window.location.search)
  const restored = decodeTrip(q.get('trip'))
  if (restored.length) trip.items = restored
  const hotel = q.get('hotel')
  stayView.hotelId = STAYS.some((s) => s.id === hotel) ? hotel : (restored.find((i) => i.kind === 'stay')?.hotelId || STAYS[0].id)
  const screen = q.get('screen')
  if (screen && SCREENS.includes(screen)) trip.screen = screen
  syncUrl()
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(window.location.search)
    const s = p.get('screen')
    const h = p.get('hotel')
    trip.items = decodeTrip(p.get('trip'))
    if (STAYS.some((x) => x.id === h)) stayView.hotelId = h
    if (s && SCREENS.includes(s)) nav(s, { push: false })
  })
}
