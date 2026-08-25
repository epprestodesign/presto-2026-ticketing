# Aug 25 — Trip Builder — the cart is the flow

The **August 25 edge-case round, case #4**: *products should not have to be bought as
one rigid package.* Hotel, tickets and add-ons are added **independently**, each line is
**edited or removed on its own**, and the three entry points all land in **the same cart**.

Where the sibling Aug 25 prototypes each demo one journey done well
([hotel-first](../hotel-first), [tickets-first](../tickets-first),
[package-customize](../package-customize)), this one has no journey to demo. It has a cart,
and three ways into it.

Forked from [`experience/`](../experience) on **August 25, 2026** — same Vite app, same
`@lib` alias onto the **real library components**, and, as everywhere in this repo, **not a
single library file changed**.

Deployed at `https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/`
(local dev on port **7100**).

## The model

```
                 ┌──────────────┐
   Start with a  │              │
   hotel ───────▶│              │
                 │              │──▶ Checkout ──▶ Confirmation
   Start with    │  YOUR TRIP   │     (whatever the trip
   tickets ─────▶│   one cart   │      turned out to be)
                 │              │
   Start with an │              │
   add-on ──────▶│              │
                 └──────────────┘
                    ▲   ▲   ▲
                    └───┴───┴── add another category at any point,
                                from any screen, via the trip bar
```

There is no `next()`, no `back()`, and **no stepper**. The `SCREENS` array is a list of
places, not an order — nothing in [`src/store.js`](src/store.js) can tell you which screen
comes after the tickets screen, because the answer is "whichever one you press".

## The entry points

The landing page is three tiles, rendered at the same size with the same button and no
"recommended" badge — the moment one of them looks primary the page is a funnel with two
side doors again.

| Door | Lands on | What it adds |
| --- | --- | --- |
| **Start with a hotel** | Stays — four contracted properties | one stay line (room · nights · rooms) |
| **Start with tickets** | Tickets — the library's `TicketTierList` | one line per tier |
| **Start with an add-on** | Add-ons — five extras | one line per add-on |

All three write to `trip.items`. Nothing about a line records which door it came through,
because nothing downstream is allowed to care.

## What is independently editable

This is the behaviour the prototype exists to make arguable, so it is worth being exact
about what "independently" means here: **every one of these leaves every other line
untouched**, and none of them re-enters a flow.

| Line | Edit | Remove |
| --- | --- | --- |
| **Stay** | *Edit stay* opens the room/nights/rooms dialog **over** whatever screen you're on | *Remove*, with an exact undo |
| **Tickets** | quantity stepper bound straight to the line — the total moves on the press | *Remove*, per tier |
| **Add-on** | quantity stepper, in the cart **or** on the add-on card itself | *Remove*, or step to zero on the card |

Three consequences worth stating:

- **Swapping the hotel keeps the trip.** A second property replaces the stay line in
  place; the dialog says so first, by name, and says that the tickets and add-ons are not
  part of the decision.
- **Undo is exact.** `removeItem()` returns the line *and its index*, so the undo in the
  toast puts it back where it was rather than appending it to the end.
- **Nothing is on a clock until checkout.** The library's cart fly-out runs a hold
  countdown; this one doesn't, because a cart you're invited to keep editing can't also be
  expiring. The hold starts where the library's own timer does — on the checkout rail.

## Why the cart is the spine

A package flow can be walked in one direction and reviewed at the end. This one can't, so
the review surface has to be present the whole way — and it is, twice over:

- **TripBar** — sticky, on every screen: what the trip holds, what it costs, and
  `Add: Hotel · Tickets · Add-ons` live at all times. It is what replaced the stepper. A
  progress rail answers *how far along the path am I*, which is a question this flow has no
  answer to; the cart's contents answer the question that's actually being asked.
- **TripFlyout** — the same editable cart, over any screen, from any screen. Change the
  room while standing on the add-ons page and you never leave the add-ons page.

Both mount the **same** `TripItems` body — the library's own trick, where `CartReview` is
shared between `CartFlyout` and `CheckoutPage`. The fly-out is therefore not a read-only
preview: everything the trip page can do, it can do.

## Partial trips are whole trips

Six compositions, all valid, all checking out, all confirming:

| Trip | Total behaves | Confirmation says |
| --- | --- | --- |
| stay + tickets + add-ons | trip saving applies | "Your trip is confirmed." |
| stay + tickets | trip saving applies | "Your trip is confirmed." |
| tickets only | no lodging line at all | "Your tickets are confirmed." |
| stay only | **no trip saving** — it was never a discount for existing | "Your stay is confirmed." |
| add-ons only | fee, no stay, no seats | "Your add-ons are confirmed." |
| empty | checkout says what's missing and offers the three doors | — |

The confirmation banner, the status note, the hotel reservation block and the ticket
guarantees are each present only when the order earned them. A page congratulating someone
on their "package" when they bought a parking pass is the precise failure being designed
against.

## How the trip is priced

```
savings  = (stay AND tickets) ? round(stay × 8%) : 0
netStay  = stay − savings
subtotal = netStay + tickets + addons
fees     = round((tickets + addons) × 12%)     ← ticketed items only; lodging carries none
taxes    = round(subtotal × 9%)
total    = subtotal + fees + taxes
```

Every rate is a whole dollar and every derived figure is rounded once, so nothing drifts by
a cent as lines come and go. **The trip saving is a reward for combining, never a
requirement to combine** — remove the tickets and it disappears while the stay stands.

The shape is deliberately the one the library's `CartReview` computes in `ticketing` mode
(fee on the non-hotel lines, tax on the subtotal), so **checkout arrives at the same total
on its own arithmetic**. Verified across all six compositions above: trip total, the row
breakdown, and CartReview's independent sum agree to the dollar.

## Library components mounted

| Component | Where | Note |
| --- | --- | --- |
| `GlobalNav` | shell | cart **hidden** — see below |
| `ContractedHotelCard` | Stays | built for the hotel *add-on* step; its `toggle` doesn't care what adding means |
| `TicketTierList` (→ `TicketCategoryCard`, `AvailabilityBadge`) | Tickets | as shipped; only its `continue` payload is treated differently |
| `QuantityStepper` | every editable line, and the add-on cards | `removable` on the cards, off in the cart — see below |
| `DsSidePanel` | TripFlyout chrome | the part of `CartFlyout` worth reusing, already factored out |
| `DsModal` | stay editor chrome | |
| `DsEmptyState` | empty trip | |
| `CheckoutPageExpanded` (→ `CartReview`, `OrderSummary`) | Checkout | mounted as shipped, handed a synthesized ticketing cart |
| `ConfirmationPage` + `confData()` | Confirmation | one adapter call, per composition |

**Zero library overrides. Zero patches.**

## What is hand-rolled, and why

| Ours | Why not the library's |
| --- | --- |
| [`TripItems`](src/components/TripItems.vue) | `CartReview` renders exactly this shape and even edits ticket quantities — but **nothing in it can remove a line**, and its quantity map is keyed by array *index*, which goes stale the moment an item is spliced out. Removal is the whole point. `CartReview` still renders the cart at checkout, where the trip is fixed. |
| [`TripFlyout`](src/components/TripFlyout.vue) | `CartFlyout` hard-wires `CartReview` as its body with no slot, and its footer runs a hold countdown this flow doesn't have. Its `DsSidePanel` chrome **is** reused. |
| [`TripBar`](src/components/TripBar.vue) | `GlobalNav`'s cart button opens `CartFlyout` — a cart icon that opens a cart you can't edit would undercut the prototype. Mounted with `:show-cart="false"` and the trip given a labelled bar instead of a badge to notice. |
| [`TripTotals`](src/components/TripTotals.vue) | `OrderSummary` is built around one reservation — hero image, property title, rating, cancellation line. A trip that is three add-ons has no such subject. It still renders the checkout rail, where the order *is* one fixed thing. |
| [`StayEditDialog`](src/components/StayEditDialog.vue) | `RoomBookingDialog` is a per-room reserve flow that ends in a booking, not an amendment to a line already in a cart. Adding and editing are the same dialog here, on purpose: if editing were a different screen, "change my room" would mean re-entering the hotel flow — the restart being argued against. |
| [`AddonCard`](src/components/AddonCard.vue) | Nothing in the library sells an extra that isn't already welded into a package. |
| [`EntryCard`](src/components/EntryCard.vue), [`EventStrip`](src/components/EventStrip.vue) | `LandingPage`'s hero + booking widget asks "where are you staying" as question one, which is the assumption being removed. |

Two small decisions inside that table:

- **`QuantityStepper`'s `removable` trash is ON in the add-on cards and OFF in the cart.**
  In the cart there is an explicit *Remove* beside it, and a second delete one press away
  on the same row is two controls for one act. On the card there is nothing beside it, so
  the trash at 1 is the only way out and competes with nothing.
- **The expanded checkout, not the stepped one.** `CheckoutPage`'s left column reveals one
  section at a time behind a Next button, so the order can't be read in full until the last
  step. A trip assembled out of order deserves to be reviewable in one piece; the rail is
  identical either way. (Same move Option D made on Aug 6.)
- **Checkout doesn't edit.** `CartReview` edits a deep copy of the cart it's handed, so a
  quantity changed there would move a number the trip never hears about. Ticket quantities
  are written into the *label* at checkout and an **Edit trip** link goes back to the one
  surface that owns them. Editing stops when paying starts, and that boundary is drawn
  once, in one place.

## Source

| Path | What it is |
| --- | --- |
| [`src/trip.js`](src/trip.js) | The three catalogues, the pricing, and the one translation into the library's cart shape |
| [`src/store.js`](src/store.js) | `trip.items`, add / edit / remove / restore, and the URL codec |
| [`src/components/TripItems.vue`](src/components/TripItems.vue) | **The cart** — grouped, editable, removable |
| [`src/components/TripBar.vue`](src/components/TripBar.vue) | The persistent trip surface that replaced the stepper |
| [`src/components/TripFlyout.vue`](src/components/TripFlyout.vue) | The same cart, over any screen |
| [`src/components/StayEditDialog.vue`](src/components/StayEditDialog.vue) | Add *and* edit a stay |
| [`src/screens/LandingScreen.vue`](src/screens/LandingScreen.vue) | The three doors |
| [`src/screens/TripScreen.vue`](src/screens/TripScreen.vue) | The cart, with a page and a price rail |
| [`src/screens/CheckoutScreen.vue`](src/screens/CheckoutScreen.vue) | The library checkout, handed whatever the trip became |
| [`src/screens/ConfirmationScreen.vue`](src/screens/ConfirmationScreen.vue) | One order, four ways of saying so |

## Deep links

The **whole cart is in the URL** (`?trip=…`), because a prototype about partial trips has
to be able to hand someone a link to a partial trip. Lines are `_`-separated, fields
`.`-separated — both survive `URLSearchParams` unencoded, so the link stays readable.

- [Landing · three doors](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=landing)
- [A full trip · hotel + tickets + add-ons](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=trip&trip=stay.westin.double.2.1_tk.club.4_ad.shuttle.4)
- [Tickets only, at the trip](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=trip&trip=tk.club.4) — a complete trip with one line
- [Hotel only, at checkout](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=checkout&trip=stay.courtyard.suite.3.2) — note: no trip saving, because there are no tickets to earn it
- [Add-ons only, confirmed](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=confirmation&trip=ad.parking.1) — one parking pass, and a real confirmation
- [The empty trip](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=trip) — deliberate, not broken
- [Checkout with nothing in it](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=checkout) — says what's missing rather than rendering a checkout for nothing
- [Landing, returning to a trip in progress](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=landing&trip=stay.hyatt-place.standard.1.1_tk.upper.2)

Ids: hotels `courtyard · westin · hilton-garden · hyatt-place`, rooms
`standard · double · suite`, tiers `lower · club · mezz · upper`, add-ons
`shuttle · parking · tailgate · tour · lounge`.

## Run it

```bash
cd trip-builder && node ../node_modules/vite/bin/vite.js --port 7100
```

No install needed — deps resolve up the tree to the repo's `node_modules`.

## Still open

- **One stay per trip** is a rule, not a limitation of the cart: a second property replaces
  the first. Two hotels across two nights is a real thing a group does, and the model would
  carry it — the swap-with-warning was chosen because "add a second hotel for the same
  night" is a mistake far more often than an intent. Worth revisiting if the group flows
  fold in.
- **Dates are three fixed nights**, chosen from buttons rather than a calendar. A date
  picker is a second decision surface and this prototype is about the cart, not the search.
- **The trip saving is the only cross-item pricing.** If bundling should do more than
  discount the room, that's a pricing conversation this prototype is deliberately not
  having yet.
