# Aug 25 - Hotel First — a tournament trip, bought in one order

The **Aug 25 edge-case round**, case #2: *hotel → event tickets → destination add-ons*.
A cheer family flies to Orlando for a national tournament. They book a room the way they
always book a room, add admission for the days their athlete competes, add a Disney day for
the Monday after finals, and pay for all three once.

Forked from [`experience/`](../experience) on **August 25, 2026**. Like every prototype
here it's a self-contained Vite app importing the **real library components** via the
`@lib` alias — nothing is copied or forked from the library, and no library file is changed.

Deployed at `https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/`
(local dev on port **6900**).

## The flow

```
Landing ──▶ Browse Hotels ──▶ Hotel Details ──▶ Tickets ──▶ Add-Ons ──▶ Checkout ──▶ Confirmation
            (the block)       (pick a room)     (passes)    (Orlando)   (one cart)   (one itinerary)
 └── Stay ──────────────────────────────────┘ └ Tickets ┘ └ Add-Ons ┘ └────── Review ──────┘
```

Four stepper stages, seven screens. The room is chosen **before any ticket exists**, which
is the reverse of every other ticketing flow in this repo and the whole reason this case
was worth building.

**Two exits, both first-class.** Tickets can be skipped entirely (`Skip — I only need the
room`), and so can add-ons (`Continue without add-ons`, sitting in the rail from the moment
the screen loads, not buried under six cards). Hotel-first means the room is allowed to be
the whole purchase.

## What the case asked for

| The case | How this answers it |
| --- | --- |
| Start from a normal EventPipe hotel booking | Landing, Browse and Details are the booking site's own screens — see below. |
| Select hotel + room | The library `HotelDetailPage` in `reserve` flow, five room types priced off the property's rate. |
| Add admission tickets for the tournament | Day and weekend passes laid against the competition schedule, on the library's `TicketCategoryCard`. |
| Add optional destination products | Six Orlando add-ons — parks, character breakfast, airport van — nothing pre-selected. |
| Review all three together | The ticketing checkout rail *is* the itemized cart: **Hotel · Tickets · Experiences**, three headings, one total. |
| A combined confirmation / itinerary | One order number, the full room reservation, the passes and add-ons as order components, and three policy sections. |

## Why the content moved to Orlando

The fork arrived framed as a Patriots gameday at Gillette. That is the wrong shape for this
buyer, not just the wrong logo:

| | NFL gameday (what it was) | Youth tournament (what it is) |
| --- | --- | --- |
| Stay | 1 night around a kickoff | **3 nights** — the trip *is* the event |
| Admission sells | a **location** — Club, Sec CL10, Row 12 | a **day** — Friday, Saturday, finals |
| Second purchase | none | **the destination** — which is why this flow has an add-ons step at all |
| Buyer | a fan | a family, sent by a gym, with a schedule to work around |

So the event is **Sunshine State Spirit Nationals 2027** at the Orange County Convention
Center, Feb 12–14, 2027; the hotels are the I-Drive / Lake Buena Vista block, measured from
the Convention Center; and the seat map is gone, because there is no section to choose when
spectators sit on bleachers around eight mats.

All of it lives in [`src/event.js`](src/event.js), [`src/hotels.js`](src/hotels.js),
[`src/tickets.js`](src/tickets.js) and [`src/addons.js`](src/addons.js) — a different
tournament is a data change, not a code change.

## How the hotel side stays the booking site

This is edge case #5 of the same round, and it constrains everything before the Tickets
screen. The reference is the [`prototype/`](../prototype) app — the new EventPipe
booking-site experience — and the hotel screens here mount the same components in the same
composition:

| Screen | What it mounts | Same as `prototype/` |
| --- | --- | --- |
| Landing | `LandingPage` — its own nav, hero, `BookingWidget`, event copy, footer | yes, only the copy props differ |
| Browse | hero → `BookingWidget` band → filter rail → `ResultsToolbar` → `HotelCardReserve`, in three availability tiers with the same break messages | yes, composed the same way |
| Details | `HotelDetailPage` in `reserve` flow — gallery, tabs, rooms, amenities, policies | yes, unmodified |
| Checkout | `CheckoutPage` — stepped accordion + sticky rail | yes, `ticketing` mode instead of `reservation` |
| Frame | `PageFrame` — real Global Nav **and** footer on every screen | yes |

Two deliberate departures, both for the same reason — the library page hardcodes Foxborough:

- **`HotelListPage` is not used.** It renders Browse in one tag, and the fork used it, but
  its event name, venue and fourteen sample hotels are Gillette. A tournament in Orlando
  cannot borrow that page without contradicting itself on screen. Composing the same parts
  costs one file and buys a Browse that is the booking site in every respect except data.
- **`ViewMapField` is not used.** It ships its own Nashville hotels and labels the map pin
  *Gillette Stadium*. [`HotelMapField.vue`](src/components/HotelMapField.vue) is the same
  `HotelMap` + `DsModal` composition against the Orlando block.

Everything the fork already got right was left alone. The room CTA still reports nothing
upward, so `App.vue` reads the chosen card's own DOM — exactly the technique `prototype/`
uses for its group room cards, and the reason the library is still untouched.

## Why the ticket list is a calendar

A ticketing UI normally sells a place. A tournament sells a **day**, and a family that buys
the wrong day misses the ninety seconds their athlete is on the mat. So the competition
schedule is on the page beside the passes:

```
Friday, Feb 12     Warm-ups & Level 1–3 prelims
Saturday, Feb 13   Level 4–6 prelims & semifinals
Sunday, Feb 14     Finals & awards
```

Five tiers, and the two at the ends are what make it read as a tournament rather than a
generic pass list: an **athlete credential wristband** (a credential, not a seat — priced
low, rationed to 6) and **mat-side finals seating** (the one genuinely scarce thing in the
building, and sold out, which is the honest state for finals seating three months out).

The card itself is the library's `TicketCategoryCard`, unmodified, so a limited tier and a
sold-out tier read identically here and in the seat-map flows.

## Why add-ons start at zero

Three rules, and they are what stop an add-on step from becoming the airline-checkout
upsell wall:

1. **Nothing is pre-selected.** Tickets *are* seeded — one weekend pass per guest, because
   nearly every family buys it and it keeps a deep-linked checkout coherent. Add-ons never
   are. Pre-adding a $139 park ticket would be the prototype lying about what was asked for.
2. **The exit is at the top, beside the total.** "Continue without add-ons" is visible on
   load, and it *clears* anything already added — carrying a $556 park purchase past the
   sentence "continue without add-ons" would be indefensible.
3. **Every card says which day it fits.** A Saturday park day is unavailable to a family
   whose athlete competes Saturday. An add-on step that ignores why the guest is in town
   sells them something they cannot use.

The card is hand-rolled ([`AddOnCard.vue`](src/components/AddOnCard.vue)) rather than
borrowed from `PackageCard`, whose whole layout is a price comparison between what's inside
a bundle and what it costs together. An add-on has no bundle to compare against. Its zero
state is a single **Add for 4** button, not a stepper parked at 0 — a stepper at zero asks
for arithmetic before the guest has agreed to buy anything.

## How the three parts become one cart

`buildCart()` in [`src/itinerary.js`](src/itinerary.js) is the join. It emits the library's
**ticketing cart shape**, verbatim, with three kinds of line:

```
type: 'hotel'       → CartReview files it under "Hotel"
type: 'ticket'      → …under "Tickets", with an editable quantity dropdown
type: 'experience'  → …under "Experiences"
```

That is why the checkout needed no new component. `CheckoutPage` in `ticketing` mode hands
its rail to `CartReview`, which already groups an itemized cart by line type — so a cart
holding a room, four passes and three attraction bookings prints as three named sections
under one total, each line expandable into its nights or its inclusions.

The same cart feeds the nav fly-out, so the combined itinerary is visible **three screens
before checkout**, not revealed at it.

## How it's priced

```
subtotal = every line
fees     = 12% of the NON-HOTEL lines        (the ticketing service fee)
taxes    = 9% of the subtotal                (Orange County sales + tourist development)
total    = subtotal + fees + taxes
```

The room is out of the fee base for a reason beyond realism: `CartReview` recomputes fees
live when you change a ticket quantity in the cart, and **its** fee base excludes hotel
lines. Charging fees on the room here would make the total drift away from this file the
first time someone edited a quantity.

The default trip, end to end:

```
Rosen Centre Convention Hotel · Double Queen · 3 nights × $259   777
4 × Weekend Spectator Pass @ $89                                 356
                                                     subtotal  1,133
                                          fees (12% of 356)        43
                                        taxes (9% of 1,133)       102
                                                        total  $1,278

…plus the demo add-ons (4 Disney days, 4 character breakfasts, 1 airport van):
                                                     subtotal  2,070
                                                        total  $2,411
```

Prototype economics, deterministic — no `Math.random`, no `Date.now`, so a demo never
drifts and two screenshots taken a week apart agree.

## Source

| Path | What it is |
| --- | --- |
| [`src/event.js`](src/event.js) | The tournament, the venue, the three nights |
| [`src/hotels.js`](src/hotels.js) | The 14-hotel Orlando block + filter/sort logic |
| [`src/tickets.js`](src/tickets.js) | The five admission tiers |
| [`src/addons.js`](src/addons.js) | The six destination add-ons |
| [`src/itinerary.js`](src/itinerary.js) | Cart, checkout summary and confirmation — all from one state |
| [`src/store.js`](src/store.js) | Screens, the router, and the selection |
| [`src/screens/HotelBrowseScreen.vue`](src/screens/HotelBrowseScreen.vue) | Browse, composed from the booking site's parts |
| [`src/screens/TicketsScreen.vue`](src/screens/TicketsScreen.vue) | Passes, laid against the schedule |
| [`src/screens/AddOnsScreen.vue`](src/screens/AddOnsScreen.vue) | The destination step |
| [`src/components/AddOnCard.vue`](src/components/AddOnCard.vue) | One add-on |
| [`src/components/HotelFilters.vue`](src/components/HotelFilters.vue) | The filter rail, with working filters |
| [`src/components/HotelMapField.vue`](src/components/HotelMapField.vue) | Its map field, against the Orlando block |

Library components mounted as shipped: `PageFrame`, `GlobalNav`, `AppStepper`,
`LandingPage`, `BookingWidget`, `ResultsToolbar`, `HotelCardReserve`, the eight
`filter-rail` fields, `HotelMap`, `DsModal`, `HotelDetailPage`, `TicketCategoryCard`,
`QuantityStepper`, `CheckoutPage`, `CartReview`, `ConfirmationPage`. Library overrides: **0**.

## Run it

```bash
cd hotel-first && node ../node_modules/vite/bin/vite.js --port 6900
```

No install needed — deps resolve up the tree to the repo's `node_modules`.
Build check: `cd hotel-first && node ../node_modules/vite/bin/vite.js build`.

## Deep links

- [Landing](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=landing)
- [Browse the block](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=hotels)
- [Hotel details · Hyatt Regency, Rooms tab](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=hotelDetails&hotel=h1&tab=rooms)
- [Tickets · party of 6](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=tickets&guests=6)
- [Destination add-ons](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=addons)
- [Checkout · the combined cart](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=checkout&demo=1)
- [Confirmation · the itinerary](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=confirmation&demo=1)

`?demo=1` seeds a representative add-on selection (a park day and a breakfast per guest,
one airport van) for screenshots. It is a *demo* flag rather than the default precisely
because the honest empty state is what a first-time guest sees.

## Still open

- **The add-on schedule is advisory, not enforced.** A card says a park day fits Monday;
  nothing stops a guest buying six of them for a competition day. A real build would need
  to know the athlete's mat times, which arrive two weeks out.
- **Three fulfilments, one payment.** The confirmation says so plainly in its status note —
  hotel now, passes from the producer, park tickets from each park — but the prototype has
  no model of what happens when one of the three fails after the card is charged.
- **Party size is one number.** Four guests means four park tickets; a family where one
  parent skips the park is handled only by stepping the quantity down after adding.
