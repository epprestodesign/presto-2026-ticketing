// The tournament this prototype is built around, in one place.
//
// The fork this app started from was framed as an NFL gameday (Patriots v Bills
// at Gillette). That framing is wrong for the edge case being tested here: the
// buyer is a cheer FAMILY travelling to a multi-day youth tournament, not a fan
// buying a seat to a single ticketed game. The differences that matter downstream:
//
//   • the stay is 3 nights, not 1 — the trip IS the event
//   • admission is a DAY/WEEKEND pass, not a seat in a section
//   • the destination is the second reason they came (Orlando), which is why
//     this flow has a destination add-ons step at all
//
// Every screen reads its event copy from here so the re-frame is a one-file
// change if the demo ever needs a different tournament.

export const EVENT = {
  name: 'Sunshine State Spirit Nationals 2027',
  shortName: 'Spirit Nationals',
  dates: 'Fri, Feb 12 – Sun, Feb 14, 2027',
  datesLong: 'February 12–14, 2027',
  venue: 'Orange County Convention Center — West Building',
  venueShort: 'Orange County Convention Center',
  city: 'Orlando, FL',
  address: ['9800 International Drive', 'Orlando, Florida 32819'],
  // Map centre for the hotel search (OCCC West Building).
  lat: 28.4262,
  lng: -81.4694,
}

// The stay: check in the day competition starts, check out the morning after
// finals. Three nights, one per competition day — so a night label and a
// competition day are the same thing on every screen.
export const STAY = {
  nights: 3,
  checkIn: { date: '02/12/2027', long: 'Fri, Feb 12, 2027', time: '3:00 PM' },
  checkOut: { date: '02/15/2027', long: 'Mon, Feb 15, 2027', time: '11:00 AM' },
  range: 'Feb 12 – 15, 2027',
}

// Night labels in the two shapes the library components expect (the room cards
// and cart use one, the confirmation another). Kept as explicit lists rather than
// formatted on the fly — the prototype must never render a date that drifts with
// the machine's clock or locale.
export const DETAIL_NIGHTS = ['Fri, 2/12/2027', 'Sat, 2/13/2027', 'Sun, 2/14/2027']
export const CONF_NIGHTS = ['Fri, 02/12/2027', 'Sat, 02/13/2027', 'Sun, 02/14/2027']

// Competition-day framing reused by the ticket tiers and the itinerary.
export const COMP_DAYS = [
  { id: 'fri', label: 'Friday, Feb 12', note: 'Warm-ups & Level 1–3 prelims' },
  { id: 'sat', label: 'Saturday, Feb 13', note: 'Level 4–6 prelims & semifinals' },
  { id: 'sun', label: 'Sunday, Feb 14', note: 'Finals & awards' },
]
