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

## The Aug 25 stakeholder round

Three changes, all of them removals. The flow, the screens and the Orlando framing were
signed off as-is — what came back was about *controls*, not structure.

| Asked for | What changed |
| --- | --- |
| *"I don't want this next. I want one big form… we're definitely getting rid of that step, step, step for a full open."* | Checkout mounts **`CheckoutPageExpanded`** instead of the stepped `CheckoutPage`. Contact, Payment, Review your order and Policies are all open at once, every field in its input state, **one Book Now at the bottom**. The right-hand rail is byte-identical — the expanded page shares it. |
| *"If I select two people, these numbers should default to two."* | **Party size is now the only quantity in the flow.** Every pass and every add-on follows it and nothing can diverge from it — the per-line steppers are gone. |
| *"I never want to have this as a pop-up… we're always going to want a clean page."* | **Zero pop-up layers.** The map's fullscreen `DsModal` became an in-page view of Browse, and the Clear Cart `q-dialog` became an in-page confirmation bar. |

## Party size is the quantity

One number, chosen for the **room**, prices the whole trip. Change it anywhere and the
passes, the park tickets, the breakfasts, the nav cart, the checkout rail and the
confirmation all move in the same tick.

Where a stepper used to be, each line now **states the number it is following**:

```
Weekend Spectator Pass          4 guests — matches your party      4 × $89 = $356
Walt Disney World 1-Day         4 guests — matches your party      Add for 4 / Added
MCO Round-Trip Transfer         1 booking — covers your whole party
Athlete Credential Wristband    6 of 8 — only 6 credentials left
```

The mechanics, all in three places:

- `tierQty()` / `addOnQty()` in [`src/tickets.js`](src/tickets.js) and
  [`src/addons.js`](src/addons.js) derive a line's quantity from the party size. A per-guest
  product takes one per guest; the shared van is one booking that carries the party.
- `toggleTicket()` / `toggleAddOn()` in [`src/store.js`](src/store.js) replaced
  `setTicketQty(id, n)` / `setAddOnQty(id, n)`. A caller can say *in* or *out* — it can no
  longer hand in an arbitrary `n`, which is the API-level version of the same rule.
- `setGuests()` calls `repriceForParty()`, which re-derives **every already-selected line**
  in one pass. Lines at 0 stay at 0: a party change must never add something unasked.

Two honest exceptions, both said out loud on the line rather than resolved silently:

- **Inventory wins.** The athlete credential is rationed to 6, so a party of 8 gets 6, and
  the card and the cart both print `6 of 8 — only 6 credentials left`.
- **Per-booking units.** The airport van is one van for the party, not one per person.
  That is the same rule expressed in the product's own unit, not an exception to it.

The cart line is where this had one last hole. `CartReview` turns a ticket line into an
**editable quantity dropdown** exactly when the line carries `unitPrice`, so `itinerary.js`
now deliberately omits `unitPrice` and `maxQty` on ticket items. It was the last place a
line could still break away from the party size — a guest arriving at payment with four
park tickets and three passes — and dropping one field closes it with no library change.

## No pop-ups

`hotel-first/` contains **zero** `DsModal` and `DsSidePanel` usages, and no `q-dialog`.
Two surfaces changed:

- **The block map.** "View Map" in the filter rail used to open a fullscreen `DsModal`.
  Browse now *switches*: the results column becomes
  [`HotelMapPanel`](src/components/HotelMapPanel.vue), the filter rail stays put and keeps
  working, and "Back to list" switches back. The dialog was the size of a page and was a
  place the guest spent real time — all the modal added was a scrim, a trapped scroll
  position and an X. Switching also fixes something the modal was quietly bad at: behind the
  scrim the rail was unreachable, so the map showed pins the guest could no longer filter.
  Radius is edited in the panel and committed by the rail's own Apply, so it behaves like
  every other field in the rail. Both maps share their marker/imagery mapping via
  [`src/mapdata.js`](src/mapdata.js) so the pins can't disagree.
- **Clear Cart.** Still confirmed rather than immediate — the cart holds a room, passes and
  attraction bookings, so an accidental clear costs three decisions — but the confirmation
  is now a bar at the top of the frame instead of a `q-dialog`. Clearing immediately with an
  Undo toast was rejected: Undo suits actions that are cheap to redo, and re-picking a
  property, a room, five tiers and three add-ons is not.

## What the case asked for

| The case | How this answers it |
| --- | --- |
| Start from a normal EventPipe hotel booking | Landing, Browse and Details are the booking site's own screens — see below. |
| Select hotel + room | The library `HotelDetailPage` in `reserve` flow, five room types priced off the property's rate. |
| Add admission tickets for the tournament | Day and weekend passes laid against the competition schedule, bought for the whole party. |
| Add optional destination products | Six Orlando add-ons — parks, character breakfast, airport van — nothing pre-selected. |
| Review all three together | One fully-expanded form beside the itemized cart: **Hotel · Tickets · Experiences**, three headings, one total, one submit. |
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
| Checkout | `CheckoutPageExpanded` — one open form + the same sticky rail | yes, `ticketing` mode instead of `reservation` |
| Frame | `PageFrame` — real Global Nav **and** footer on every screen | yes |

Two deliberate departures, both for the same reason — the library page hardcodes Foxborough:

- **`HotelListPage` is not used.** It renders Browse in one tag, and the fork used it, but
  its event name, venue and fourteen sample hotels are Gillette. A tournament in Orlando
  cannot borrow that page without contradicting itself on screen. Composing the same parts
  costs one file and buys a Browse that is the booking site in every respect except data.
- **`ViewMapField` is not used.** It ships its own Nashville hotels and labels the map pin
  *Gillette Stadium*. [`HotelMapField.vue`](src/components/HotelMapField.vue) is the rail's
  `HotelMap` preview against the Orlando block, and its "View Map" now switches the page to
  [`HotelMapPanel`](src/components/HotelMapPanel.vue) rather than opening a dialog.

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

The card is [`TicketTierCard.vue`](src/components/TicketTierCard.vue) — the library's
`TicketCategoryCard` grammar (colour swatch, the same `AvailabilityBadge` mounted
unmodified, the same `/ea` price, the same greyed sold-out state) with its **− qty +
stepper replaced** by the party-size line and an Add / Added toggle. It is rebuilt here
rather than mounted from `@lib` because the part that had to go is the part that component
exists to render, and the library is read-only. Hiding the stepper with CSS was rejected: it
leaves a live keyboard-reachable control behind an invisible surface.

## Why add-ons start at zero

Three rules, and they are what stop an add-on step from becoming the airline-checkout
upsell wall:

1. **Nothing is pre-selected.** Tickets *are* seeded — one weekend pass per guest, because
   nearly every family buys it and it keeps a deep-linked checkout coherent. Add-ons never
   are. Pre-adding a $139 park ticket would be the prototype lying about what was asked for.
   The party-size control is repeated on this screen, because it is now the only quantity
   control the guest has: sending them back a screen to change a number that re-prices the
   page in front of them would make the lock cost them something instead of saving them
   something.
2. **The exit is at the top, beside the total.** "Continue without add-ons" is visible on
   load, and it *clears* anything already added — carrying a $556 park purchase past the
   sentence "continue without add-ons" would be indefensible.
3. **Every card says which day it fits.** A Saturday park day is unavailable to a family
   whose athlete competes Saturday. An add-on step that ignores why the guest is in town
   sells them something they cannot use.

The card is hand-rolled ([`AddOnCard.vue`](src/components/AddOnCard.vue)) rather than
borrowed from `PackageCard`, whose whole layout is a price comparison between what's inside
a bundle and what it costs together. An add-on has no bundle to compare against. It is a
single **Add for 4** / **Added** toggle with no stepper at any point — it prints
`4 guests — matches your party` where the stepper used to be. The previous version added at
the obvious quantity and *then* handed over a stepper "for the exceptions"; that reads
reasonably on one card and badly across six, where a family of four could leave with four
park days, three breakfasts and two aquarium tickets — an order that describes no trip
anyone is taking, and one the checkout rail then has to print with a straight face.

## How the three parts become one cart

`buildCart()` in [`src/itinerary.js`](src/itinerary.js) is the join. It emits the library's
**ticketing cart shape**, verbatim, with three kinds of line:

```
type: 'hotel'       → CartReview files it under "Hotel"
type: 'ticket'      → …under "Tickets"      (no unitPrice ⇒ no editable quantity)
type: 'experience'  → …under "Experiences"
```

That is why the checkout needed no new component. `CheckoutPageExpanded` in `ticketing` mode
hands its rail to `CartReview`, which already groups an itemized cart by line type — so a cart
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

The room is out of the fee base for a reason beyond realism: `CartReview`'s own fee base
excludes hotel lines. Keeping the two bases identical is what stops the rail and
`itinerary.js` from ever printing different totals for the same cart.

The default trip, end to end:

```
Rosen Centre Convention Hotel · Double Queen · 3 nights × $259   777
4 × Weekend Spectator Pass @ $89   (4 = the party size)          356
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
| [`src/components/AddOnCard.vue`](src/components/AddOnCard.vue) | One add-on — Add / Added, no stepper |
| [`src/components/TicketTierCard.vue`](src/components/TicketTierCard.vue) | One admission tier — `TicketCategoryCard`'s grammar, minus the stepper |
| [`src/components/PartySizeField.vue`](src/components/PartySizeField.vue) | The one quantity control left in the flow |
| [`src/components/HotelFilters.vue`](src/components/HotelFilters.vue) | The filter rail, with working filters |
| [`src/components/HotelMapField.vue`](src/components/HotelMapField.vue) | Its map preview, against the Orlando block |
| [`src/components/HotelMapPanel.vue`](src/components/HotelMapPanel.vue) | The full map, as a view of the page |
| [`src/mapdata.js`](src/mapdata.js) | Marker + imagery mapping, shared by both maps |

Library components mounted as shipped: `PageFrame`, `GlobalNav`, `AppStepper`,
`LandingPage`, `BookingWidget`, `ResultsToolbar`, `HotelCardReserve`, the eight
`filter-rail` fields, `HotelMap`, `HotelDetailPage`, `AvailabilityBadge`, `QuantityStepper`,
`CheckoutPageExpanded`, `CartReview`, `ConfirmationPage`. Library overrides: **0**.
No `DsModal`, no `DsSidePanel`, no `q-dialog` anywhere in this app.

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
- **Party size is one number, now by decision.** Four guests means four park tickets, and
  after Aug 25 there is no per-line way out: a family where one parent skips the park cannot
  express that here. The trade was made knowingly — it buys an order that can always be
  explained at the doors, and every alternative we tried let a cart disagree with itself. If
  it turns out to matter, the shape is a per-line "not everyone" exception that has to say
  who is excluded, not a stepper that lets any number happen for no stated reason.
