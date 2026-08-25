// The catalogue this prototype sells: pre-built packages, and the parts they are
// built out of.
//
// --- Why this diverges from Option D ------------------------------------------
// Option D deliberately collapsed its package to a single fixed SKU: one ticket
// tier, one room per hotel, a fixed stay, and party size as the only variable.
// That was the right answer to its brief ("two tiles, identical contents, only
// the hotel differs") and it is left exactly as it is.
//
// This prototype answers the OPPOSITE brief — the Aug 25 "pre-built package, then
// customize" edge case. A guest starts from a package somebody else assembled and
// then takes it apart: a different ticket level, a different hotel, a different
// room in that hotel, extras added and dropped. So the tier axis Option D removed
// is back, rooms are a real list rather than a single held type, and extras are
// individually switchable.
//
// The consequence for this file is structural, not cosmetic. In Option D a
// "package" IS its price — `packagesFor(people)` returns priced objects, because
// party size was the only input. Here a package is a PRESET: a starting point that
// names a tier, a hotel, a room and a set of extras. Price belongs to a
// CONFIGURATION, not to a package, and lives in `priceConfiguration()` below.
//
// --- What is still fixed -------------------------------------------------------
// The dates. The party is invited for the weekend, so the stay is two nights
// around Sunday's kickoff and nothing offers to change it. A date picker would
// reopen availability — "is the Ritz free that Friday?" — and this prototype has
// no availability story to tell. Everything the brief asks to be editable is
// editable; the one thing it doesn't ask for stays nailed down.
import { HOTEL_IMAGERY } from '@lib/lib/hotelImagery.js'
import { walkMinutes } from '@lib/lib/bundles.js'
import { TIERS, resolveTier } from './pricing.js'
import { STAY_LABEL } from './event.js'

// --- The stay -----------------------------------------------------------------
export const NIGHTS = 2
export const STAY_SHORT = '2 nights'
export { STAY_LABEL, TIERS, resolveTier }

// --- Hotels and their rooms ---------------------------------------------------
// Three properties across a real price range, because "change hotel" is only a
// decision if the alternatives are meaningfully different. Option D's two were a
// like-for-like comparison (good and better); the Foxborough Inn adds the
// downgrade direction, which is half of what "customize" means.
//
// `deltaPerNight` is the room's premium over its hotel's base rate — the room
// list is a ladder inside the hotel, the same shape as the ticket ladder, so both
// read the same way. `sleeps` is load-bearing: it decides how many rooms a party
// needs, which is why a bigger room can make a package CHEAPER.
export const HOTELS = [
  {
    id: 'foxborough-inn',
    name: 'The Foxborough Inn',
    brand: 'Independent',
    rating: 4.1,
    distanceMi: 0.4,
    nightlyRate: 189,
    blurb: 'The closest bed to the stadium — plain rooms, a five-minute walk to the gates.',
    photoCategory: 'Rooms',
    rooms: [
      { id: 'standard-queen', name: 'Standard Queen', bed: '1 Queen Bed', sleeps: 2, sqft: 320, view: 'Parking view', deltaPerNight: 0, roomsLeft: 12 },
      { id: 'double-queen', name: 'Double Queen', bed: '2 Queen Beds', sleeps: 4, sqft: 410, view: 'Courtyard view', deltaPerNight: 45, roomsLeft: 7 },
    ],
  },
  {
    id: 'westin',
    name: 'The Westin',
    brand: 'Marriott',
    rating: 4.6,
    distanceMi: 0.8,
    nightlyRate: 289,
    blurb: 'Full-service hotel on the green — the EventPipe block sits on floors 8 to 11.',
    photoCategory: 'Rooms',
    rooms: [
      { id: 'deluxe-king', name: 'Deluxe King', bed: '1 King Bed', sleeps: 2, sqft: 420, view: 'City view', deltaPerNight: 0, roomsLeft: 9 },
      { id: 'premium-king', name: 'Premium King', bed: '1 King Bed', sleeps: 2, sqft: 480, view: 'Stadium view', deltaPerNight: 60, roomsLeft: 5 },
      { id: 'executive-suite', name: 'Executive Suite', bed: '1 King Bed + Sofa Bed', sleeps: 4, sqft: 640, view: 'Stadium view', deltaPerNight: 150, roomsLeft: 3 },
    ],
  },
  {
    id: 'ritz',
    name: 'The Ritz-Carlton',
    brand: 'Marriott',
    rating: 4.8,
    distanceMi: 1.1,
    nightlyRate: 549,
    blurb: 'The premium block — suites, club lounge access and valet, one town over.',
    photoCategory: 'Suites',
    rooms: [
      { id: 'carlton-king', name: 'Carlton King', bed: '1 King Bed', sleeps: 2, sqft: 520, view: 'City view', deltaPerNight: 0, roomsLeft: 8 },
      { id: 'carlton-suite', name: 'Carlton Suite', bed: '1 King Bed + Sofa Bed', sleeps: 4, sqft: 620, view: 'City view', deltaPerNight: 110, roomsLeft: 6 },
      { id: 'club-suite', name: 'Club Level Suite', bed: '1 King Bed + Sofa Bed', sleeps: 4, sqft: 780, view: 'Common view', deltaPerNight: 260, roomsLeft: 2 },
    ],
  },
]

export const hotelById = (id) => HOTELS.find((h) => h.id === id) || HOTELS[0]
export const roomsFor = (hotelId) => hotelById(hotelId).rooms
export function resolveRoom(hotelId, roomId) {
  const rooms = roomsFor(hotelId)
  return rooms.find((r) => r.id === roomId) || rooms[0]
}

// --- Extras -------------------------------------------------------------------
// Two groups, and the split is a pricing decision as much as a layout one.
//
// GETTING THERE is single-choice. A coach transfer and a parking pass are answers
// to the same question, and a guest who ticks both has bought a seat on a bus
// they will not be on. Modelling it as checkboxes would have let the price be
// arithmetically correct and factually wrong. "Make your own way" is a real,
// zero-cost option rather than an empty state, so the group always has an answer
// and the summary always has a line for how the party reaches the stadium.
//
// ADD-ONS are independent, so they are checkboxes — no combination of them is
// incoherent.
//
// `unit` is what the price multiplies by. Four units rather than one flat number
// because the multiplier is the whole reason party size and room count feed the
// extras total: a coach is booked per room, a hospitality wristband per head, and
// lounge access is per head per night.
export const EXTRA_UNITS = {
  person: { label: 'per person', qty: ({ guests }) => guests },
  room: { label: 'per room', qty: ({ rooms }) => rooms },
  'person-night': { label: 'per person, per night', qty: ({ guests, nights }) => guests * nights },
  stay: { label: 'per booking', qty: () => 1 },
}

export const TRANSPORT_OPTIONS = [
  {
    id: 'coach',
    group: 'transport',
    icon: 'directions_bus',
    label: 'Round-trip coach transfer',
    note: 'Hotel lobby to Gillette Stadium and back, Saturday and Sunday',
    price: 180,
    unit: 'room',
  },
  {
    id: 'parking',
    group: 'transport',
    icon: 'local_parking',
    label: 'Stadium parking pass',
    note: 'One prepaid Lot 1 space per room, gates open four hours before kickoff',
    price: 95,
    unit: 'room',
  },
  {
    id: 'own-way',
    group: 'transport',
    icon: 'directions_walk',
    label: 'Make your own way',
    note: 'No transport in the package — rideshare drops on Route 1',
    price: 0,
    unit: 'stay',
  },
]

export const ADDON_OPTIONS = [
  {
    id: 'hospitality',
    group: 'addon',
    icon: 'celebration',
    label: 'Pregame hospitality tent',
    note: 'Food, open bar and a former player Q&A in the EventPipe tent, three hours before kickoff',
    price: 140,
    unit: 'person',
  },
  {
    id: 'tour',
    group: 'addon',
    icon: 'stadium',
    label: 'Stadium tour & field visit',
    note: 'Saturday afternoon — press box, locker room and a walk on the field',
    price: 75,
    unit: 'person',
  },
  {
    id: 'lounge',
    group: 'addon',
    icon: 'local_cafe',
    label: 'Hotel club lounge access',
    note: 'Breakfast, evening canapés and all-day coffee at your hotel',
    price: 55,
    unit: 'person-night',
  },
  {
    id: 'late-checkout',
    group: 'addon',
    icon: 'schedule',
    label: 'Guaranteed 4:00 PM checkout',
    note: 'Monday — keep the room after the coach back from the airport run',
    price: 75,
    unit: 'room',
  },
  {
    id: 'host',
    group: 'addon',
    icon: 'support_agent',
    label: 'Dedicated gameday host',
    note: 'One EventPipe host with your group from Saturday check-in to Monday checkout',
    price: 250,
    unit: 'stay',
  },
]

export const ALL_EXTRAS = [...TRANSPORT_OPTIONS, ...ADDON_OPTIONS]
export const extraById = (id) => ALL_EXTRAS.find((e) => e.id === id) || null

// --- The pre-built packages ---------------------------------------------------
// Three presets across the range, each a complete answer on its own. They are
// PRESETS, not products: nothing downstream reads a price off them, because the
// moment a guest touches anything the preset's own numbers stop being true.
//
// Every preset names one tier, one hotel, one room and a set of extras — the
// exact same four fields the customize screen edits, so "reset to the original
// package" is a single assignment rather than a replay of defaults.
const DISCOUNT_RATE = 0.12

export const PACKAGES = [
  {
    id: 'tailgater',
    name: 'The Tailgater',
    tagline: 'Closest bed to the gates, upper-deck seats, park on site.',
    theme: 'Gameday, no frills',
    icon: 'sports_football',
    preset: { tierId: 'upper', hotelId: 'foxborough-inn', roomId: 'double-queen', extraIds: ['parking'] },
  },
  {
    id: 'club-weekend',
    name: 'The Club Weekend',
    tagline: 'Club Level seats, a stadium-view room and the pregame tent.',
    theme: 'The one most groups book',
    icon: 'stadium',
    featured: true,
    preset: { tierId: 'club', hotelId: 'westin', roomId: 'premium-king', extraIds: ['coach', 'hospitality'] },
  },
  {
    id: 'fifty-yard',
    name: 'The 50-Yard Line',
    tagline: 'Sideline seats, a Ritz suite, and everything laid on around them.',
    theme: 'Top of the range',
    icon: 'workspace_premium',
    preset: { tierId: 'lower', hotelId: 'ritz', roomId: 'club-suite', extraIds: ['coach', 'hospitality', 'lounge', 'host'] },
  },
]

export const packageById = (id) => PACKAGES.find((p) => p.id === id) || PACKAGES[0]

// The party size a package is quoted at on the browse screen. Quoting at a fixed
// number keeps the three cards comparable — a board where each tile is priced for
// a different party is not a board.
export const DEFAULT_PARTY = 4

/** A fresh configuration from a package's preset — also what "Reset" restores. */
export function configFor(pkgId, guests = DEFAULT_PARTY) {
  const pkg = packageById(pkgId)
  return { pkgId: pkg.id, guests, ...pkg.preset, extraIds: [...pkg.preset.extraIds] }
}

// Imagery: room shots rather than exteriors — the library's exterior photos carry
// real hotel signage, which put the wrong brand on a tile in an earlier option.
const photoFor = (hotel, i = 0) => {
  const pool = HOTEL_IMAGERY.filter((p) => p.category === hotel.photoCategory)
  return (pool.length ? pool[i % pool.length] : HOTEL_IMAGERY[0])?.src || null
}

/**
 * Price a configuration. THE function in this prototype — the customize screen,
 * the browse cards, the rail, the breakdown modal and checkout all read from it,
 * so there is exactly one place the arithmetic can be wrong.
 *
 *   rooms      = ceil(guests / room.sleeps)
 *   nightly    = hotel base rate + the room's premium
 *   tickets    = tier price × guests
 *   stay       = nightly × 2 nights × rooms
 *   extras     = Σ price × (per person | per room | per person-night | per booking)
 *   components = tickets + stay + extras
 *   discount   = round(components × 12%)
 *   package    = components − discount
 *
 * The discount is rounded ONCE and subtracted, rather than rounding the discounted
 * total: `components`, `discount` and `package` are then three whole numbers that
 * add up exactly. On a surface where all three are on screen at once and move on
 * every click, a dollar of rounding drift is a visible bug.
 *
 * The rate applies to EVERY component, including extras a guest adds after the
 * fact. The alternative — discounting what the preset shipped with and charging
 * face value for anything added — was rejected: it makes the same wristband cost
 * two different amounts depending on which package you started from, and re-adding
 * something you just removed would quietly reprice it.
 */
export function priceConfiguration(config = {}) {
  const guests = Math.max(1, config.guests || 1)
  const tier = resolveTier(config.tierId)
  const hotel = hotelById(config.hotelId)
  const room = resolveRoom(hotel.id, config.roomId)

  const rooms = Math.ceil(guests / room.sleeps)
  const nightly = hotel.nightlyRate + room.deltaPerNight
  const basis = { guests, rooms, nights: NIGHTS }

  const ticketsTotal = tier.price * guests
  const stayTotal = nightly * NIGHTS * rooms

  const extras = (config.extraIds || [])
    .map(extraById)
    .filter(Boolean)
    // Catalogue order, not click order — the summary must not reshuffle itself
    // as extras are toggled.
    .sort((a, b) => ALL_EXTRAS.indexOf(a) - ALL_EXTRAS.indexOf(b))
    .map((e) => {
      const qty = EXTRA_UNITS[e.unit].qty(basis)
      return { ...e, qty, unitLabel: EXTRA_UNITS[e.unit].label, total: e.price * qty }
    })
  const extrasTotal = extras.reduce((sum, e) => sum + e.total, 0)

  const componentsTotal = ticketsTotal + stayTotal + extrasTotal
  const savings = Math.round(componentsTotal * DISCOUNT_RATE)
  const packagePrice = componentsTotal - savings

  return {
    guests, rooms, nights: NIGHTS, nightly,
    tier, hotel, room, extras,
    ticketsTotal, stayTotal, extrasTotal,
    componentsTotal, savings, packagePrice,
    discountRate: DISCOUNT_RATE,
    perPerson: Math.round(packagePrice / guests),
    currency: 'USD',
  }
}

/**
 * The itemised lines BEHIND a package total — one row per component, in the
 * order the customize screen edits them: tickets, the stay, then each extra that
 * costs something. Extras the guest dropped simply aren't here; the breakdown is
 * the configuration, not a checklist of what was on offer.
 *
 * It lives beside `priceConfiguration()` rather than inside a component because
 * three surfaces render it — the live rail, the browse-card breakdown and the
 * room-card breakdown — and each used to carry its own copy of the same five
 * lines. Identical arithmetic worded three times is a disagreement waiting to
 * happen: the moment one of them relabels a stay, two surfaces describe the same
 * price differently. Same reason there is exactly one `priceConfiguration()`.
 *
 * The money formatter is passed IN rather than imported. This file is about
 * arithmetic; how a number is spelled belongs to the screen spelling it.
 */
export function breakdownLines(priced, money) {
  if (!priced) return []
  return [
    {
      key: 'tickets',
      label: `${priced.tier.name} tickets`,
      note: `${priced.guests} × ${money(priced.tier.price)}`,
      value: priced.ticketsTotal,
    },
    {
      key: 'stay',
      label: `${priced.room.name} · ${STAY_SHORT}`,
      note: `${priced.rooms} room${priced.rooms === 1 ? '' : 's'} × ${priced.nights} nights × ${money(priced.nightly)}`,
      value: priced.stayTotal,
    },
    ...priced.extras.filter((e) => e.price > 0).map((e) => ({
      key: e.id,
      label: e.label,
      note: `${e.qty} × ${money(e.price)} ${e.unitLabel}`,
      value: e.total,
    })),
  ]
}

/**
 * A package + a configuration, in the shape a card renders: name, imagery,
 * inclusion list, price. Used for the browse tiles (each on its own preset) and
 * for the library package template on the details screen.
 */
export function buildPackage(pkgId, config) {
  const pkg = packageById(pkgId)
  const priced = priceConfiguration(config)
  const { hotel, room, tier, guests } = priced

  // `...priced` FIRST, then the card-shaped fields. The other way round, the
  // spread's plain `hotel` and `room` would silently overwrite the enriched ones
  // below it and take `walkMin` and `roomType` with them — a card rendering
  // "undefined min walk" with no error anywhere.
  return {
    ...priced,
    id: pkg.id,
    name: pkg.name,
    tagline: pkg.tagline,
    theme: pkg.theme,
    icon: pkg.icon,
    featured: !!pkg.featured,
    image: photoFor(hotel),
    // `hotelTotal` is what the library's own PackageCard reads to split the
    // ticket portion off the rest when it re-prices — it is fed the same number
    // this file computed, so the template can never disagree with the rail.
    hotel: {
      ...hotel,
      roomType: room.name,
      walkMin: walkMinutes(hotel.distanceMi),
      nights: NIGHTS,
      nightlyRate: priced.nightly,
      hotelTotal: priced.stayTotal,
    },
    room,
    ticket: { tierId: tier.id, tierName: tier.name, price: tier.price, colorVar: tier.colorVar, desc: tier.desc },
    inclusions: inclusionsFor(priced),
    nights: NIGHTS,
    quantity: guests,
    currency: 'USD',
  }
}

/** The inclusion list for a priced configuration — tickets, stay, then extras. */
export function inclusionsFor(priced) {
  const { guests, rooms, tier, hotel, room } = priced
  return [
    {
      icon: 'confirmation_number',
      label: `${guests} × ${tier.name} ticket${guests === 1 ? '' : 's'}`,
      note: 'Seated together in one block',
    },
    {
      icon: 'hotel',
      label: `${STAY_SHORT} at ${hotel.name}`,
      note: `${rooms} × ${room.name} · ${room.bed} · sleeps ${room.sleeps}`,
    },
    ...priced.extras
      .filter((e) => e.price > 0)
      .map((e) => ({ icon: e.icon, label: e.label, note: e.note })),
  ]
}

/** The three tiles on the browse screen, each priced on its own preset. */
export const packagesFor = (guests = DEFAULT_PARTY) =>
  PACKAGES.map((p) => buildPackage(p.id, configFor(p.id, guests)))
