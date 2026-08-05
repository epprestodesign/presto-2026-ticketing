# Aug 4 - Option C — One-click packages

The **simplified one-click package landing page** from the August 4 feedback.

Forked from [`/option-a`](../option-a) on **August 4, 2026**. Like every prototype in
this repo it's a self-contained Vite app importing the **real library components** via
the `@lib` alias — nothing is copied or forked from the library, and no library file is
changed.

Deployed as a Storybook sub-page at
`https://epprestodesign.github.io/presto-2026-ticketing/option-c/`
(local dev on port **6600**).

**The set:** this is the third of three Aug 4 takes.
[Option A](../option-a) (packages first, port 6400) and [Option B](../option-b)
(hotel first, port 6500) were built before the feedback landed; Option C is the
response to it. All three are documented under **Aug 4 Changes** in Storybook:
https://epprestodesign.github.io/presto-2026-ticketing/?path=/docs/aug-4-changes-overview--docs

**There is a newer round.** [Option D](../option-d) (port 6700) is the **Aug 5** feedback
response and the current direction — two identical packages, one per hotel, with the pair
as the landing page. Option C is kept unchanged; the Aug 5 feedback said to keep the
current concept as-is.

## What the feedback asked for

| Feedback | How Option C answers it |
| --- | --- |
| Grid, not a scrolling list | A 3-across grid of 6 tiles. The filter rail and result list are gone. |
| Packages below the header, no scrolling | Trade-off — a 300px branded hero with the search card tucked onto it; the compact ~90px strip is kept as the alternative. |
| One-click — no filtering, no options | A tile is a complete SKU. Selecting one goes straight to checkout. |
| Two-tier model per ticket type | 3 ticket tiers × 2 hotels, ordered so each row is one property. |
| Only variable: number of people | One guests dropdown, in the search bar, shared by the whole board. |
| Occupancy caps the ticket quantity | Occupancy caps tickets per **room**; a larger party books a second room. |
| "Ticket free, stay at this hotel" | The price charged is the stay. Tickets are $0, shown as the saving. |
| Detailed toggle/adjust UI is for later | It still exists — in Option A, untouched. Option C does not carry it. |

## The board

Six tiles, **3 ticket tiers × 2 contracted hotels**, ordered hotel-major so each row is
one property across the three tiers:

| | Club Level | Lower Level | Mezzanine |
| --- | --- | --- | --- |
| **The Ritz-Carlton** · Carlton Suite · sleeps 4 | $809 | $729 | $639 |
| **Courtyard by Marriott** · Double Queen · sleeps 4 | $479 | $399 | $309 |

Prices are for the default **one-night, two-guest** stay; the search bar re-prices the
whole board.

The Ritz-Carlton is not in the library's `CONTRACTED_HOTELS`, so it's defined locally in
[`src/packages.js`](src/packages.js) — the same rule every prototype here follows.

## The hero

The board leads with the branded event hero — artwork, EventPipe wordmark, matchup and
date — with the search card tucked onto its bottom edge. Rebuilt in `EventHero.vue`
rather than mounting the library's `LandingPage`, which also brings a booking widget, an
ad rail and a "Who's Attending" section.

**A live trade-off.** The feedback asks for packages visible without scrolling; the
branded hero was asked for separately, and they pull against each other:

| | Event Hero (mounted) | Event Header Bar (kept) |
| --- | --- | --- |
| Height | 300px | ~90px |
| Carries | artwork, wordmark, matchup, date | matchup, date, venue, stay dates |
| First tile row | just below the fold on a laptop | comfortably above it |

Swapping them is a one-line change in `PackageGridScreen.vue`.

## The two universal controls

Dates and guests sit **above** the board, not on the tiles, because both re-price all
six tiles at once — six copies of either control would be six chances to disagree.

- **Check-in – Check-out → nights**, which multiply every room rate on the board. This
  is why the dates are up front: they change the price of every package at once.
- **Guests → free tickets and rooms** — one free ticket per guest, and
  `ceil(guests / sleeps)` rooms, since occupancy caps a single room.

The library's own `BookingWidget` renders this pattern but **emits nothing** — its dates
and travelers are private state, which is why Option A had to patch the library to get a
guest count back out. Option C's bar owns the state and writes it to the journey store,
so no library file is touched. The picker itself is the library's `DateRangeCalendar`.

## How a tile is priced

```
rooms   = ceil(guests / occupancy)         one room only sleeps so many
price   = nightly × nights × rooms         ← what the guest pays
value   = price + ticket face × guests     ← struck through
saving  = ticket face × guests             ← "N tickets free"
```

Nights multiply the **room and nothing else** — the tickets stay free however long the
stay runs, so three nights triples the price and leaves the saving unchanged. The
nightly rate is the contracted rate plus a tier uplift of roughly half the ticket's face
value. All prototype economics, and deterministic, so demos never drift.

## Badges, used sparingly

Every tile originally carried two hero badges; both are gone, because neither said
anything the tile didn't already. "Premium / Value stay" repeated the row heading three
times per row — tinted with the *ticket tier's* accent, so one row showed the same
"Value stay" in orange, red and blue as if they differed. "Tickets free" was true of all
six tiles and already stated three other places.

The tile now takes an optional `flag` prop holding **at most one** badge, and the board
hands it to exactly one tile: the best value per guest. Navy, never the tier accent.

## Hotel details — read-only, in its own tab

Every hotel name on the board opens that property's details page in a **new tab**, so the
grid behind it keeps its dates and party size. The page is read-only: no CTA, no stepper
(off-flow at stage `-1`), nothing that books or prices.

## What's different from Option A

The interesting part is what Option C **removes**:

| | Option A | Option C |
| --- | --- | --- |
| Library component overrides | 4 (`BookingWidget`, `PackageResultCard`, `PackageQuickViewDialog`, hero image) | **0** |
| Library source patches | 4 (`LandingPage`, `PackageListPage`, `RoomAvailability`, `HotelListPage`) | **0** |
| Screens | 6 | **3** + a read-only hotel reference view |
| Store configuration state | `roomHotelId`, `roomTypeId`, `tierId`, `extraId` | which tile, plus the shared stay (dates + guests) |

Option A has to bend the library's Browse Packages page because it renders it. Option C
renders its own board, so `OVERRIDES` and `PATCHES` in
[`vite.config.js`](vite.config.js) are both empty — and the build cannot break when the
library moves. The library components mounted are `GlobalNav`, `AppStepper`,
`DateRangeCalendar`, `CheckoutPage` and `ConfirmationPage`, all used as shipped.

## Source

| Path | What it is |
| --- | --- |
| [`src/packages.js`](src/packages.js) | The two hotels, the three tiers, and the tile builder |
| [`src/components/PackageTile.vue`](src/components/PackageTile.vue) | One complete SKU |
| [`src/components/EventHero.vue`](src/components/EventHero.vue) | The branded event hero |
| [`src/components/BookingWidget.vue`](src/components/BookingWidget.vue) | Dates + guests — the Core Booking Widget, no Search button |
| [`src/components/EventHeaderBar.vue`](src/components/EventHeaderBar.vue) | The compact event strip (kept as the alternative to the hero) |
| [`src/screens/HotelDetailsScreen.vue`](src/screens/HotelDetailsScreen.vue) | Read-only hotel reference view |
| [`src/screens/PackageGridScreen.vue`](src/screens/PackageGridScreen.vue) | The landing board |
| [`src/store.js`](src/store.js) | Screens, the selection, and the shared stay (dates + guests) |
| [`src/configured.js`](src/configured.js) | Reads the selected tile for the shared checkout |

## Run it

```bash
cd option-c && node ../node_modules/vite/bin/vite.js --port 6600
```

No install needed — deps resolve up the tree to the repo's `node_modules`.

## Deep links

Grid → checkout → confirmation is clickable end to end, and the selection is carried in
the URL:

- [The board](https://epprestodesign.github.io/presto-2026-ticketing/option-c/?screen=packages)
- [The board · 3 nights, 6 guests](https://epprestodesign.github.io/presto-2026-ticketing/option-c/?screen=packages&from=2026/09/18&to=2026/09/21&guests=6) — every price triples and doubles for the second room
- [Checkout · Club Level at the Ritz, 4 guests](https://epprestodesign.github.io/presto-2026-ticketing/option-c/?screen=checkout&pkg=club-ritz&guests=4)
- [Hotel details · The Ritz-Carlton](https://epprestodesign.github.io/presto-2026-ticketing/option-c/?screen=hotelDetails&hotel=ritz) — read-only reference view

A checkout link with no tile selected falls back to the board rather than rendering a
package nobody chose.

## Scope

A la carte — pick your own hotel — is explicitly a **later, separate flow**, and is not
in Option C.
