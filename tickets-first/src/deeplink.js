// URL state for the journey, so any screen can be linked to in a review.
//
// The parent /bundle app has none of this — it starts at the intro every time,
// which is fine for a two-minute demo and useless when the point of the review
// IS one screen. Six screens in, "click through tickets, seats, hotel and
// extras to see the cart" is a worse ask each time it's made.
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
  const hotel = q.get('hotel')
  if (hotel) out.hotel = hotel
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
export function writeDeepLink({ screen, tier, quantity, hotel, addOns, vehicles }) {
  if (typeof window === 'undefined' || !window.history) return
  const q = new URLSearchParams()
  q.set('screen', screen)
  if (tier) q.set('tier', tier)
  if (quantity && quantity !== 2) q.set('qty', String(quantity))
  if (hotel) q.set('hotel', hotel)
  if (addOns?.length) q.set('addons', addOns.join(SEP))
  if (vehicles && vehicles !== 1) q.set('cars', String(vehicles))
  window.history.replaceState({ screen }, '', `${window.location.pathname}?${q.toString()}`)
}
