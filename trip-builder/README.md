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

## The Aug 25 second round — pages, not pop-ups

Three changes came back from the stakeholder review of the first cut, and all
three are in:

1. **The stays screen is the real Browse Hotels surface.** Four
   `ContractedHotelCard` tiles are gone; in their place, the booking site's own
   page — hero band → `BookingWidget` search band → filter rail + `ResultsToolbar`
   + `HotelCardReserve`, with the three availability tiers and live filtering.
2. **No modal pop-ups, anywhere.** *"I never want to have this as a pop-up… we
   almost never are going to want those modal pop-ups, we're always going to want
   a clean page."* `StayEditDialog` (a `DsModal`) and `TripFlyout` (a
   `DsSidePanel`) were **deleted**. Picking a hotel opens a **hotel details
   page**; the cart lives on the **/trip page that already existed**.
3. **Adding a hotel and adding an add-on feel the same.** Both are page-based,
   both add with one press, and both then bind their controls straight to the
   line in the cart.

## The third round — the cart peek is back, on purpose

The next review asked for one thing that reverses part of the round above, and it
is worth being exact about how far the reversal goes: **a cart icon in the nav,
opening a slide-over peek, with the full cart page behind it.**

So [`TripFlyout`](src/components/TripFlyout.vue) — deleted in commit `469259f` —
**is restored, deliberately.** Anyone reading the history will find the deletion
and no reason not to repeat it, so the reason is written at the top of that file,
in `App.vue`, and in `store.js` beside the flag that opens it.

**The reversal is scoped to the cart, and to nothing else:**

| Still a page, and staying one | Why the peek doesn't reopen the question |
| --- | --- |
| Hotel details / room selection (`HotelDetailPage`) | It *is* the surface, not a glance at one that exists elsewhere. `StayEditDialog` stays deleted. |
| Browse Hotels (`/stays`) | Same — the results page is the destination, not a preview of one. |
| `ViewMapField` in the filter rail | A full-screen modal covering the results you are filtering. |
| `PriceDetailsDialog` on the room card | A duplicate of the breakdown the cart line already spells out; the link stays hidden. |

**The cart peek is the single sanctioned overlay in this prototype**, because it
is the one surface that is genuinely a *glance*: it is the cart, the cart already
has an address (`?screen=trip`), and it opens from a control present on every
screen — which is the one thing a page cannot do. If a second overlay ever
appears here, it is a regression; this one is an exception with a reason.

Verified, not asserted:
`grep -rn "DsModal\|ds-modal\|DsSidePanel\|ds-side-panel\|CartFlyout\|q-dialog" src/`
returns exactly **one import and one tag** — `DsSidePanel`, inside `TripFlyout` —
and comments everywhere else. Belt and braces, `TripNav` also carries a
`body > .cf { display: none !important }` rule, so the library's *own* cart
fly-out cannot paint even if the click interception that keeps it shut is ever
refactored away.

The other docked surface, `TripBar`, is not an overlay: it occupies its own row,
covers nothing, and cannot be dismissed, because it is the cart spine the whole
prototype is built on.

## The fourth round — the hotel page is the hotel page

Looking at `?screen=hotel&hotel=renaissance`, the stakeholder asked for one thing:
**the stay band across the top is gone.** The screen is the library's
`HotelDetailPage` and not much else — gallery, tabs, summary, about, the rooms
carousel, amenities, policies.

That band carried the back link, the room name, a NIGHTS 1·2·3 toggle, a ROOMS
stepper, a stay total and *Add to trip · $329*. Deleting it as drawn would have
silently removed the ability to book **more than one night or more than one
room** — nothing else on the screen could set either. So the band was taken
apart rather than deleted, and each piece went where it already belonged:

| The band held | Where it lives now |
| --- | --- |
| **Adding** — *Add to trip · $329* | `RoomCardReserve`'s own **Reserve Room**, which already did this. The band's button could only ever add the room the band was showing; the card's button adds the card's room, which is the one the guest is reading. |
| **Nights** and **Rooms** | The **stay line in the cart** — `TripItems`, which both the peek and `/trip` render. A 1·2·3 group and a `QuantityStepper`, bound straight to the line. |
| **Stay total** | The line's own amount, top-right of that same line, above the trip total it rolls into. |
| **Room / Change room** | Reserve any other card. The rooms carousel *is* the room picker; the band was a label pointing at it. |
| **All hotels** | `HotelDetailPage`'s own **Back to Hotel listing**, which this app used to hide because the band's crumb sat 40px above it. The `display: none` is gone and its `@back` is wired to the browse screen — no second back link was written. |
| **See all rooms** | Nothing. It scrolled from the top of the page to the middle of the same page. |
| The swap warning · the sold-out note | The carousel's own `roomsSubtitle`, a library prop — so the context survives without a strip of chrome to carry it. |

**Why the cart, and not a slimmer band.** Every other line in this prototype is
already edited in place in the cart: a ticket count, an add-on count. Nights and
rooms are two more numbers on a line, and they multiply a figure that is *in* the
cart. A reduced band holding only those two controls was the obvious compromise
and is the same mistake in a shorter strip — a second place a stay is priced, one
refresh away from disagreeing with the line it is pricing.

The direction of the data reversed with it: **the cart is now the only writer**,
and the hotel page *reads* nights and rooms to price its room cards. Every card's
"total" is what that room would charge on the stay line if it were pressed —
which it was before, too, except the number was owned by a band the guest could
edit on a page that never saw the cart. `StaysScreen` was already reading the
same two values to price its browse cards, so all three surfaces now multiply by
the numbers held in exactly one place.

**The room's rate is still on the page**, and is now the only price statement on
it: `RoomCardReserve` prints `$329.00 USD / room / night` above `$658.00 USD
total`, per card, unstyled and as the library ships it. What stays hidden is the
`.rcr__sub` caption under it — not because of the band, but because it reads
"incl. taxes & fees" and this trip levies tax **once**, on the whole trip, so the
checkout rail two screens later would contradict it. The room count that caption
also carried is stated once in the carousel subtitle instead of three times down
the cards.

One behaviour improved on the way through: **a hotel swap now keeps the length of
the stay.** Nights and rooms are read off the stay line whichever property it is
at, so moving from two nights at the Westin to the Renaissance stays two nights.
The old band reset a different property to 1 · 1, because its draft had nothing
to mirror.

## Checkout — the top is clean, and the hold is pinned

Two stakeholder notes on `?screen=checkout`, both about where the eye lands
first.

### The *Edit trip* bar is gone

Checkout used to open with a strip: a `← Edit trip` button and the sentence
*"Quantities and rooms are changed in your trip — this page states what's being
charged."* Both are removed. It is the fifth band of this kind cut in the round —
alongside the customize stepper, the event strip, `package-customize`'s checkout
config strip, this prototype's own hotel stay band and `tickets-first`'s
back-to-trip bar — and the note is the same every time: **a band that restates
what a rail already says, and pushes the actual work below the fold.**

**Nothing is stranded, and that was checked rather than assumed.** The route back
to an editable trip is on the checkout screen twice, above the fold, and neither
is new:

| On checkout | Gives |
| --- | --- |
| **Nav cart icon** (`TripNav`) — visible on every screen but the confirmation | opens the peek |
| **`TripBar`** — sticky, on every screen but the confirmation | the three Add doors |
| **The peek** (`TripFlyout` → `TripItems variant="peek"`) | nights · rooms · quantities · *Remove* · the doors to add more — every control the `/trip` page carries, by that component's density-only rule |

The peek correctly drops its own **Checkout** button while checkout is the page
underneath it. **Rejected:** replacing the bar with a smaller line, a header link
or a note on the rail — that is the same band with fewer pixels. The sentence it
carried was *explaining the read-only rail*, and a rail that needs a banner above
itself to be understood is the thing to fix, not to caption.

#### One bug the bar had been hiding

`CheckoutPageExpanded` snapshots the cart it is handed **exactly once** —
`reactive(JSON.parse(JSON.stringify(props.cart)))`, with no watcher on the prop.
So a trip edited while checkout is the page underneath left the rail printing the
old total: pressing **2 nights** in the peek moved the URL, the peek footer and
the trip to **$1,133** while the rail still read **$803**. The removed bar had
been masking it — it *left* for `/trip`, and coming back re-mounted the screen,
which re-took the snapshot. With the peek as the route back, the page stays
mounted and the latent bug becomes the normal path.

Fixed **in this prototype, not in the library**: `CheckoutPageExpanded` is given
a `:key` built from a signature of the trip, so any real change re-mounts it and
re-takes the snapshot. Verified stale before, correct after. The cost, stated:
a re-mount clears anything typed into the contact and payment fields — the right
side of the trade, since the guest just deliberately changed their trip and a
preserved form beside a wrong total is worse. The key is a *signature* precisely
so an unchanged trip never re-mounts.

### *Time left to book* is a fixed pill, bottom-right

The countdown shipped **inside the rail** (`CheckoutPageExpanded`'s `.ck__timer`
block, under the cart card), where it scrolls away the moment the guest starts
typing — the one screen where the number matters. The library's own
[`HoldTimerPill`](../src/components/HoldTimerPill.vue) is mounted `fixed`
bottom-right instead, and **the rail's copy is hidden**, so the screen carries
exactly one countdown. Consistent with `tickets-first`, which got this first.

**What the timer honestly claims here is different from the siblings, and it had
to be.** This flow holds nothing while the trip is being built and says so out
loud on the trip page — *"Nothing is charged and nothing is held until you check
out — come back and change any of it"* — and `TripFlyout` makes the same promise
from the other side. So the stories' **"Seats held"** and `tickets-first`'s
**"Your seats and rate are held while it runs"** are both *wrong here*: they date
the hold to a moment the guest never had. The copy shipped is

> **Time left to book** · *Held while you check out — not before*

which is exactly the promise those two sentences already make — the hold begins
when checkout begins. Reaching this page is the event that starts it, which is
why the pill lives on this screen and starts when it mounts. (The library default
*"Rooms are held while the timer runs"* is untrue twice over here: a trip can be
tickets-only or add-ons-only and contain no room at all.)

- **Checkout only.** Not on the confirmation — a countdown over a paid receipt is
  alarming and untrue — and not on browse or `/trip`, which are exactly where the
  "nothing is held" promise lives. Not on the empty-cart checkout either: there
  is nothing to hold.
- **Deterministic.** `seconds` is a module constant (`895`, the library's own rail
  default), never `Date.now()` — the same rule the store's line ids follow, so a
  demo opens on the same number every run.
- **A fixed pill is not a pop-up**, and in this prototype that distinction is
  load-bearing. The no-pop-ups rule is about surfaces that *interrupt*: take the
  screen, drop a scrim, trap focus, demand dismissal. The pill takes no click,
  covers no control, dismisses nothing and can be ignored — page furniture
  anchored to the viewport rather than the document, the same class of thing as
  the sticky rail beside it. **It is not a second overlay; the peek is still the
  only one.**

## One cart control: the nav icon

**Aug 25, fourth round.** The trip bar used to end in a bordered handle reading
`5 items · $2,397 ⌄` that opened the cart peek. **It is gone**, on a direct
stakeholder note — *"there is a cart button that already exists from the global
nav"* — and the nav icon is the one that wins, because it is the pattern shared
across all four Aug 25 prototypes.

**This overrules an earlier decision in this prototype, deliberately.** The
previous round kept both and argued they were one action in two placements ("the
way a wordmark in a header and in a footer are both *home*"), on the grounds that
the nav scrolls away while the bar is sticky. That was reviewed and rejected: two
handles on one cart, one row apart, read as two things to a guest however
carefully they are argued to be one. The handle was removed **wherever the bar
renders**, not just on checkout — the duplication was on every screen.

| Surface | Job | Wording |
| --- | --- | --- |
| Nav cart icon (`TripNav`) | **the** cart control — opens the peek | badge = live item count, muted grey at 0 |
| Trip bar, left | what the trip holds | `Your trip` + a chip per category — **text, not a control** |
| Trip bar, right | **add** — Hotel · Tickets · Add-ons | a different verb, and three doors an icon can't offer |
| Peek footer | through to the page, or pay | `View full trip` · `Checkout`, equally weighted |

- **The bar still earns its row**, with the summary chips (the stepper substitute
  — orientation by what's in the cart, not by how far along a rail you are) and
  the three Add doors, which are the only always-available way to add a category.
  Nothing was invented to fill the space the handle left.
- **The one cost, named:** the running **total** is no longer visible at zero
  presses. It lives in the peek footer, the `/trip` rail and the checkout rail —
  all one press from the nav icon, on every screen. If it is wanted back it
  belongs as a quiet figure among the summary chips, never as a button on the
  right; a button is the thing that was removed.
- **On `/trip` the icon marks itself *current*** (filled, no press): a control
  pointing at the page you are already on is the duplication this section exists
  to avoid. On the confirmation the icon and the bar both disappear — the order
  is placed.

`GlobalNav` is mounted **unmodified**, which costs two corrections from outside
it, both argued in [`TripNav`](src/components/TripNav.vue): its cart button opens
`CartFlyout` (a body that cannot remove a line), and its badge is fed by
`CartReview`, which only mounts once that fly-out is *already open* — so the
library badge reads `0` for the whole session. The click is caught in the capture
phase **on the nav subtree**, and the live count is teleported into the same
button with the library's stuck badge hidden underneath.

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
| **Start with a hotel** | Stays — Browse Hotels, ten properties, filter rail | via the hotel's details page, on `Reserve Room`: one stay line, whose nights and rooms are then set in the cart |
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
| **Stay** | **nights** (1·2·3) and **rooms** (stepper) bound straight to the line — the check-out date, the sleeps count and the amount all move on the press; *Change room* opens that property's **details page**, where Reserve on any card swaps the room in place | *Remove*, with an exact undo |
| **Tickets** | quantity stepper bound straight to the line — the total moves on the press | *Remove*, per tier |
| **Add-on** | quantity stepper, in the cart **or** on the add-on card itself | *Remove*, or step to zero on the card |

Three consequences worth stating:

- **Swapping the hotel keeps the trip.** A second property replaces the stay line in
  place; the browse banner and the hotel page both say so first, by name, and both say
  that the tickets and add-ons are not part of the decision.
- **Undo is exact.** `removeItem()` returns the line *and its index*, so the undo in the
  toast puts it back where it was rather than appending it to the end.
- **Nothing is on a clock until checkout.** The library's cart fly-out runs a hold
  countdown; this cart doesn't, because a cart you're invited to keep editing can't also be
  expiring. **The hold starts when checkout starts** — that is the whole claim the pinned
  countdown on that screen makes, and it is why its sub-label reads *not before*.

## Why the cart is the spine

A package flow can be walked in one direction and reviewed at the end. This one can't, so
the review surface has to be present the whole way — and it is, three ways over:

- **The nav cart** — the library's own icon, with a live count, on every screen but the
  confirmation. The handle a guest goes looking for without being told to.
- **TripBar** — sticky, on every screen: what the trip holds, and
  `Add: Hotel · Tickets · Add-ons` live at all times. It is what replaced the stepper. A
  progress rail answers *how far along the path am I*, which is a question this flow has no
  answer to; the cart's contents answer the question that's actually being asked. It
  carries **no cart handle** — see [One cart control](#one-cart-control-the-nav-icon).
- **The peek** — `TripFlyout`, what the nav icon opens: the trip over the top of the
  screen you were reading, fully editable, with the page one press behind it.
- **The /trip page** — the full editable cart, the one **address** the cart has, and where
  the price rail and Checkout live.

One `TripItems` body, mounted in the peek and on the page, and its `variant` prop changes
**density only** — no control appears in one frame and not the other. The moment a "simpler summary" component
is written for the fly-out, the peek and the page start disagreeing about what is in the
cart.

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
| `GlobalNav` | shell | mounted unmodified, cart **shown**, with a live count and the peek wired in from outside — see above |
| `DsSidePanel` | the cart peek | the slide-over chrome, as shipped — scrim, ESC, scroll lock, footer slot |
| `HotelCardReserve` + `ResultsToolbar` + `SortDropdown` | Stays (Browse) | the booking site's result card and results header, as shipped |
| `BookingWidget` | Stays (Browse) | `show-teams` **off** — its Registered Team(s) field opens an add-a-group modal |
| `browse/filter-rail/*` (8 fields) | Stays (Browse) | the library's own rail fields; state is held in `StayFilters` so they filter |
| `HotelDetailPage` (→ `GalleryHero`, `DetailTabs`, `HotelSummaryHeader`, `RoomsCarousel` → `RoomCardReserve`, `AboutProperty`, `AmenitiesSection`, `PoliciesSection`) | Hotel | mounted as shipped, in `reserve` flow — **the whole screen**, including its own `Back to Hotel listing` and its `Reserve Room` CTAs |
| `TicketTierList` (→ `TicketCategoryCard`, `AvailabilityBadge`) | Tickets | as shipped; only its `continue` payload is treated differently |
| `QuantityStepper` | every editable line (the stay's **rooms** included), and the add-on cards | `removable` on the cards, off in the cart — see below |
| `DsEmptyState` | empty trip | |
| `CheckoutPageExpanded` (→ `CartReview`, `OrderSummary`) | Checkout | mounted as shipped, handed a synthesized ticketing cart |
| `ConfirmationPage` + `confData()` | Confirmation | one adapter call, per composition |

**Zero library files changed.** One scoped override, argued where it lives: `CheckoutScreen`
hides the checkout rail's own `.ck__timer` block with a `:deep()` rule, because the pinned
`HoldTimerPill` is the same hold and one hold gets one clock. Hidden from outside rather
than removed inside, since three other prototypes and every checkout story still want the
in-rail block.

## What is hand-rolled, and why

| Ours | Why not the library's |
| --- | --- |
| [`TripItems`](src/components/TripItems.vue) | `CartReview` renders exactly this shape and even edits ticket quantities — but **nothing in it can remove a line**, and its quantity map is keyed by array *index*, which goes stale the moment an item is spliced out. Removal is the whole point. `CartReview` still renders the cart at checkout, where the trip is fixed. |
| [`TripBar`](src/components/TripBar.vue) | Nothing in the library docks a trip summary *under* the nav, and a badge alone is not orientation on a flow with no stepper. It says what the trip holds and offers the three Add doors on every screen. It is **not** a cart handle — that was removed on the stakeholder's call. |
| [`TripFlyout`](src/components/TripFlyout.vue) | The library's `CartFlyout` **cannot remove a line** (its body is `CartReview`, quantities keyed by array index) and its footer runs a hold countdown — a trip you're invited to keep editing can't also be expiring. `DsSidePanel`, the part of `CartFlyout` worth reusing, is mounted as shipped; the body is the same `TripItems` the page mounts. |
| [`TripNav`](src/components/TripNav.vue) | Not a nav — a wrapper around the library's. `GlobalNav` is unmodified; the wrapper supplies the live count and the peek destination its cart button has no prop for. |
| [`TripTotals`](src/components/TripTotals.vue) | `OrderSummary` is built around one reservation — hero image, property title, rating, cancellation line. A trip that is three add-ons has no such subject. It still renders the checkout rail, where the order *is* one fixed thing. |
| [`StayFilters`](src/components/StayFilters.vue) | `FilterRail` assembles exactly these fields already — but owns no state and emits nothing, because on the booking site the page above it owns the query. Mounting it gives a rail that looks right and filters nothing. `ViewMapField` is the one field left out: it is a full-screen `DsModal`, and this round removed every modal. |
| [`browse.js`](src/browse.js) | The filter / sort logic the rail needs. Kept out of `trip.js` because nothing in it can re-price a line, and out of the library because the library's `HotelListPage` can only ever open its own hotels. |
| The nights + rooms controls on the stay line in [`TripItems`](src/components/TripItems.vue) | `HotelDetailPage` has no slot between its sections and `RoomCardReserve` carries no nights / rooms control, so the two decisions that price a stay have to be written somewhere. They are on the cart line, not on a band above the hotel page — see [the fourth round](#the-fourth-round--the-hotel-page-is-the-hotel-page). `RoomBookingDialog` was the library's answer and is a per-room reserve flow ending in a booking, not an amendment to a line already in a cart. |
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
- **Two library CTAs emit nothing a parent can hear** — checkout's Book Now and
  `RoomCardReserve`'s Reserve Room — so each is caught by a click handler where it
  happens (`App.vue` and `HotelScreen` respectively). The room is identified by its
  card's **position**, not by scraping its title, so a renamed room can't misfile itself.
- **Checkout doesn't edit.** `CartReview` edits a deep copy of the cart it's handed, so a
  quantity changed there would move a number the trip never hears about. Ticket quantities
  are written into the *label* at checkout, and the **nav cart icon** opens the peek, which
  is the surface that owns them. Editing stops when paying starts, and that boundary is
  drawn once, in one place. (The `Edit trip` bar that used to say so above the page is gone
  — the rail states what is being charged, and the icon is the way back.)

## Source

| Path | What it is |
| --- | --- |
| [`src/trip.js`](src/trip.js) | The three catalogues (ten properties), the pricing, and the one translation into the library's cart shape |
| [`src/browse.js`](src/browse.js) | The filter and sort logic behind the rail |
| [`src/store.js`](src/store.js) | `trip.items`, add / edit / remove / restore, and the URL codec |
| [`src/components/TripItems.vue`](src/components/TripItems.vue) | **The cart** — grouped, editable, removable |
| [`src/components/TripBar.vue`](src/components/TripBar.vue) | The persistent trip surface that replaced the stepper |
| [`src/components/StayFilters.vue`](src/components/StayFilters.vue) | The Browse filter rail |
| [`src/screens/LandingScreen.vue`](src/screens/LandingScreen.vue) | The three doors |
| [`src/screens/StaysScreen.vue`](src/screens/StaysScreen.vue) | Browse Hotels |
| [`src/screens/HotelScreen.vue`](src/screens/HotelScreen.vue) | One property — the library's `HotelDetailPage`, whose `Reserve Room` adds or swaps the stay |
| [`src/screens/TripScreen.vue`](src/screens/TripScreen.vue) | The cart, with a page and a price rail |
| [`src/screens/CheckoutScreen.vue`](src/screens/CheckoutScreen.vue) | The library checkout, handed whatever the trip became |
| [`src/screens/ConfirmationScreen.vue`](src/screens/ConfirmationScreen.vue) | One order, four ways of saying so |

## Deep links

The **whole cart is in the URL** (`?trip=…`), because a prototype about partial trips has
to be able to hand someone a link to a partial trip. Lines are `_`-separated, fields
`.`-separated — both survive `URLSearchParams` unencoded, so the link stays readable.

- [Landing · three doors](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=landing)
- [Browse hotels · ten properties, filter rail](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=stays)
- [One hotel's details page](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=hotel&hotel=westin) — where a stay is added
- [The same page, editing a stay already in the trip](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=hotel&hotel=westin&trip=stay.westin.double.2.1_tk.club.4) — pre-filled, and it knows
- [A full trip · hotel + tickets + add-ons](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=trip&trip=stay.westin.double.2.1_tk.club.4_ad.shuttle.4)
- [Tickets only, at the trip](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=trip&trip=tk.club.4) — a complete trip with one line
- [Hotel only, at checkout](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=checkout&trip=stay.courtyard.suite.3.2) — note: no trip saving, because there are no tickets to earn it
- [Add-ons only, confirmed](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=confirmation&trip=ad.parking.1) — one parking pass, and a real confirmation
- [The empty trip](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=trip) — deliberate, not broken
- [Checkout with nothing in it](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=checkout) — says what's missing rather than rendering a checkout for nothing
- [Landing, returning to a trip in progress](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=landing&trip=stay.hyatt-place.standard.1.1_tk.upper.2)

The hotel page carries its property in the URL (`&hotel=…`), because `?screen=hotel` with
no hotel on it would reload onto a page about nothing.

**Nights and rooms are fields of the stay line, not URL keys of their own** —
`stay.westin.double.2.1` is *Westin · Double Queen · 2 nights · 1 room*, and it has been
that shape since the first cut. Moving the two controls out of the hotel page's band and
onto the cart line changed nothing about the codec, so every link minted before this round
restores the same trip at the same price. A hotel deep link with no `trip=` on it —
[`?screen=hotel&hotel=renaissance`](https://epprestodesign.github.io/presto-2026-ticketing/trip-builder/?screen=hotel&hotel=renaissance)
— prices its room cards for one night in one room, as it did before, and Reserve puts
exactly that in the cart.

Ids: hotels `courtyard · westin · hilton-garden · hyatt-place · renaissance ·
holiday-inn-express · residence-inn · hampton-inn · crowne-plaza · hyatt-regency`, rooms
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
- **Dates are three fixed nights**, chosen from buttons on the stay line in the cart rather
  than from a calendar. The `BookingWidget` on Browse renders its real date field, but it doesn't drive
  the catalogue — a working date search is a second decision surface and this prototype is
  about the cart.
- **No map on Browse.** The library's map field is a full-screen `DsModal`, so it was left
  out rather than reintroduced. The sibling [hotel-first](../hotel-first) solved the same
  problem by making the map a *view of the results column*; if the map matters here, that
  is the pattern to copy — not the dialog.
- **The trip saving is the only cross-item pricing.** If bundling should do more than
  discount the room, that's a pricing conversation this prototype is deliberately not
  having yet.
