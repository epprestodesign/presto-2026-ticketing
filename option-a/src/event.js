// The canonical event for this prototype — Aug 4 Option A.
//
// The library ships with "New England Patriots v Buffalo Bills · Sat, Dec 6, 2026"
// as its sample event, hardcoded or defaulted in a dozen places. This app pins a
// DIFFERENT one and feeds it to every screen, so the hero, the browse headers, the
// packages, checkout and confirmation all describe the same game:
//
//   Pittsburgh Steelers at New England Patriots
//   Sun, Sep 20, 2026 · 1:00 PM · Gillette Stadium, Foxborough, MA
//
// Nothing here edits the library. Screens pass this object as props where the
// library accepts them; the two spots that hardcode the old event (the Browse
// Hotels header, the shared hero photo) are redirected by vite.config.js.
// The event's own Ticketmaster artwork (2048×1152), downloaded from
// s1.ticketm.net so nothing loads off-domain at runtime.
import heroImage from './assets/event-hero.jpg'

export { heroImage }

// Shape matches normalizeEvent() in @lib/lib/ticketmaster.js, so anything that
// consumes a Ticketmaster event (package generation, carts, EventHero) accepts it.
export const EVENT = {
  // NOTE: the id is deliberately the library fixture's. Package tiers and prices
  // are seeded from `event.id`, so reusing it keeps the generated packages and
  // pricing identical to the source prototype — this fork changes the event's
  // identity and imagery, not the numbers.
  id: 'vv1k7Z_FkaG7VzkK',
  name: 'Pittsburgh Steelers at New England Patriots',
  url: null,
  date: '2026-09-20T13:00:00',
  status: 'onsale',
  image: heroImage,
  seatmapUrl: null,
  venue: {
    name: 'Gillette Stadium',
    city: { name: 'Foxborough' },
    state: { name: 'Massachusetts', stateCode: 'MA' },
    country: { name: 'United States Of America', countryCode: 'US' },
  },
  priceRanges: [],
  classification: { segment: 'Sports', genre: 'Football' },
  // PackageListPage reads `event.dateLabel` before falling back to its own default.
  dateLabel: 'Sun, Sep 20, 2026 · 1:00 PM',
}

// Kickoff, for anything that needs to compute dates around the game (the booking
// widget's default check-in/check-out, for one).
export const EVENT_DATE_ISO = EVENT.date

// Display strings, kept together so every screen shows the same wording.
export const EVENT_NAME = EVENT.name
export const EVENT_DATE = 'Sun, Sep 20, 2026'
export const EVENT_DATE_TIME = EVENT.dateLabel
export const EVENT_VENUE = 'Gillette Stadium'
export const EVENT_LOCATION = 'Foxborough, Massachusetts'

// The package stay: check in the night before the game, check out the morning
// after.
export const STAY_LABEL = 'Sat, Sep 19 – Sun, Sep 20, 2026'

// --- Date shifting ------------------------------------------------------------
// The cart/confirmation builders in @lib/lib/bundles.js hardcode the December
// gameday weekend (check-in Fri Dec 5 → check-out Sat Dec 6, kickoff 4:25 PM).
// This event is a Sunday 1:00 PM kickoff, so the stay shifts to Sat Sep 19 → Sun
// Sep 20. Rather than fork those builders, screens run their built objects through
// `retime()` below, which rewrites the known strings wherever they appear.
const DATE_SWAPS = [
  ['Fri, Dec 5, 2026', 'Sat, Sep 19, 2026'],
  ['Sat, Dec 6, 2026', 'Sun, Sep 20, 2026'],
  ['Sun, Dec 7, 2026', 'Mon, Sep 21, 2026'],
  ['Dec 5 – 6, 2026', 'Sep 19 – 20, 2026'],
  ['Dec 3, 2026', 'Sep 17, 2026'],
  ['12/05/2026', '09/19/2026'],
  ['12/06/2026', '09/20/2026'],
  ['4:25 PM', '1:00 PM'],
  ['New England Patriots v Buffalo Bills', EVENT.name],
]

const retimeString = (s) => DATE_SWAPS.reduce((out, [from, to]) => out.split(from).join(to), s)

/**
 * Deep-copy a plain data object (cart, summary, confirmation `data`), rewriting
 * every December-gameday string to this event's September weekend. Only touches
 * strings; arrays, nesting and non-plain values (Date, functions) pass through.
 */
export function retime(value) {
  if (typeof value === 'string') return retimeString(value)
  if (Array.isArray(value)) return value.map(retime)
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, retime(v)]))
  }
  return value
}
