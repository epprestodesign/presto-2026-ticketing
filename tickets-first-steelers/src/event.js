// The fixture this prototype is themed around: PATRIOTS v STEELERS, the 2026
// home opener at Gillette Stadium.
//
// WHY THIS FILE EXISTS. The sibling `tickets-first` prototype reads its event
// out of the library's own fixture list (`@lib/lib/ticketmaster.js`), picking
// whichever entry sits at Gillette — which is the Bills game. A second
// prototype themed on a different fixture cannot do that: there is one Gillette
// entry and both would find it. The alternative was adding a Steelers record to
// the shared library fixture file, which would have put prototype-specific
// content into a file every story and every other prototype reads. So the event
// lives HERE, in the app that needs it, and the library stays untouched.
//
// It is written in the RAW Ticketmaster shape and run through the library's own
// `normalizeEvent`, rather than hand-writing the normalized object. That is the
// point of importing the normalizer: if the library ever changes what a
// normalized event carries, this prototype changes with it instead of quietly
// disagreeing. Everything downstream — `deriveTiers`, `generateVenueListings`,
// the venue map pins — reads the normalized form, so all of it keeps working
// off one definition.
//
// THE FIXTURE IS REAL. Sunday, September 20 2026, 1:00 PM ET at Gillette
// Stadium — the Patriots' home opener against Pittsburgh. The brief said
// "September 21", which is the 2025 meeting; the 2026 game is the 20th, and the
// date is quoted on the landing page, the event band, the hotel stay dates and
// the confirmation, so it is worth having right in one place.
import { normalizeEvent } from '@lib/lib/ticketmaster.js'

/** Raw fixture, in the Ticketmaster response shape the library normalizes. */
export const rawEvent = {
  id: 'vv1k7Z_FkaG7VzkS',
  name: 'New England Patriots v Pittsburgh Steelers',
  url: 'https://www.ticketmaster.com/new-england-patriots-v-pittsburgh-steelers-foxborough-massachusetts-09-20-2026/event/0100648189D38194',
  dates: {
    start: {
      localDate: '2026-09-20',
      // 1:00 PM ET. September is EDT (UTC−4), so the UTC stamp is 17:00 — not
      // the 21:00 the December fixture carries, which sits in EST (UTC−5).
      localTime: '13:00:00',
      dateTime: '2026-09-20T17:00:00Z',
      dateTBD: false,
      dateTBA: false,
      timeTBA: false,
      noSpecificTime: false,
    },
    timezone: 'America/New_York',
    status: { code: 'onsale' },
    spanMultipleDays: false,
  },
  images: [
    {
      ratio: '16_9',
      url: 'https://s1.ticketm.net/dam/a/95c/0173c6d8-736f-487e-8146-794d0313095c_SOURCE',
      width: 2048,
      height: 1152,
      fallback: false,
    },
  ],
  seatmap: {
    staticUrl: 'https://mapsapi.tmol.io/maps/geometry/3/event/0100648189D38194/staticImage?type=png&systemId=HOST',
  },
  priceRanges: [],
  classifications: [
    {
      primary: true,
      segment: { id: 'KZFzniwnSyZfZ7v7nE', name: 'Sports' },
      genre: { id: 'KnvZfZ7vAdE', name: 'Football' },
      subGenre: { id: 'KZazBEonSMnZfZ7vFE1', name: 'NFL' },
      type: { id: 'KZAyXgnZfZ7v7l1', name: 'Group' },
      subType: { id: 'KZFzBErXgnZfZ7vA7d', name: 'Team' },
      family: false,
    },
  ],
  _embedded: {
    venues: [
      {
        name: 'Gillette Stadium',
        city: { name: 'Foxborough' },
        state: { name: 'Massachusetts', stateCode: 'MA' },
        country: { name: 'United States Of America', countryCode: 'US' },
      },
    ],
  },
}

/** The normalized event every screen in this prototype reads. */
export const EVENT = normalizeEvent(rawEvent)

// Gameday facts quoted in more than one place. Kept beside the fixture so the
// kickoff on the landing page and the gates time in the add-ons cannot drift
// apart — they are the same two strings, read twice.
export const GAMEDAY = {
  kickoff: '1:00 PM ET',
  gatesOpen: '11:00 AM',
  lotsOpen: '9:00 AM',
  // ONE night, the night before — the same shape as the December prototype
  // this was copied from, moved to the right weekend. Both fixtures are Sunday
  // games; December kicks off at 4:25 PM and books Fri → Sat, this one kicks
  // off at 1:00 PM and books Sat → Sun. Keeping it at one night matters: the
  // whole app prices a single night (see hotels.js), so a two-night stay would
  // be a pricing change dressed up as a theme change.
  checkIn: 'Sat, Sep 19, 2026',
  checkOut: 'Sun, Sep 20, 2026',
  nights: 1,
}
