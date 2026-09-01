// URL state for the journey, so any screen can be linked to in a review.
//
// The parent /bundle app has none of this — it starts at the intro every time,
// which is fine for a two-minute demo and useless when the point of the review
// IS one screen. Five screens in, "click through tickets, hotel and extras to
// see the cart" is a worse ask each time it's made.
//
// It is deliberately NOT a store like option-d's: App.vue still owns the trip
// in plain refs. This module only serializes what's there and parses what comes
// back, so the flow works identically with the query string ignored.
const SEP = ','

/** Read the trip out of the query string. Returns only the keys present. */
export function readDeepLink() {
  if (typeof window === 'undefined') return {}
  const q = new URLSearchParams(window.location.search)
  const out = {}
  const screen = q.get('screen')
  if (screen) out.screen = screen
  const tier = q.get('tier')
  if (tier) out.tier = tier
  // The exact listing taken off the ticket map. It supersedes `tier` (a listing
  // knows its own level and price), and it is a separate key rather than a
  // replacement so every link written before the map existed — `tier=club` and
  // nothing else — still prices the trip it always priced.
  const seat = q.get('seat')
  if (seat) out.seat = seat
  const hotel = q.get('hotel')
  if (hotel) out.hotel = hotel
  // The room the property was booked at. Meaningless without a hotel, and
  // resolved against that property's own ladder on the way in, so an id from
  // another property (or a stale one) falls back to the contracted room rather
  // than pricing nothing.
  const room = q.get('room')
  if (room) out.room = room
  const qty = parseInt(q.get('qty') || '', 10)
  if (qty > 0) out.quantity = Math.min(qty, 8)
  const cars = parseInt(q.get('cars') || '', 10)
  if (cars > 0) out.vehicles = Math.min(cars, 4)
  // `addons=` with an empty value is meaningful — it's an explicit "none",
  // which is how a skipped-extras link differs from a link that never said.
  const addOns = q.get('addons')
  if (addOns !== null) out.addOns = addOns.split(SEP).filter(Boolean)
  return out
}

/**
 * Write the trip back. Always replaceState: the stepper and the Back buttons
 * are the flow's own history, and pushing a second history stack behind them
 * makes the browser Back button contradict them.
 */
export function writeDeepLink({ screen, tier, quantity, seat, hotel, room, addOns, vehicles }) {
  if (typeof window === 'undefined' || !window.history) return
  const q = new URLSearchParams()
  q.set('screen', screen)
  if (tier) q.set('tier', tier)
  if (quantity && quantity !== 2) q.set('qty', String(quantity))
  // Written alongside `tier`, not instead of it: the tier is what a reviewer
  // reads at a glance ("club, 2 tickets"), and it is also what the link falls
  // back to if the seat id ever stops resolving.
  if (seat) q.set('seat', seat)
  if (hotel) q.set('hotel', hotel)
  if (hotel && room) q.set('room', room)
  if (addOns?.length) q.set('addons', addOns.join(SEP))
  if (vehicles && vehicles !== 1) q.set('cars', String(vehicles))
  window.history.replaceState({ screen }, '', `${window.location.pathname}?${q.toString()}`)
}
