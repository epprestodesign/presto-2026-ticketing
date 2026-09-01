# Tickets First — Patriots v Steelers

**A second fixture on the Aug 25 tickets-first flow: sports event → tickets → hotel → add-on.**
**New England Patriots v Pittsburgh Steelers — Sunday, September 20 2026, 1:00 PM ET at
Gillette Stadium** (the Patriots' home opener). Bought the way a fan actually assembles
the day — seats first, then somewhere to sleep, then the extras around kickoff — reviewed
in **one cart**, **paid for in one form**, and confirmed as **one trip**.

## What this is, and why it is a separate app

It is `tickets-first` with a different event. The flow, the screens and the components are
the same; what changes is the fixture, the artwork and every date derived from kickoff.
It exists to show the journey is **not welded to one game** — which a single themed
prototype cannot demonstrate no matter how it is described.

Two things could not simply be copied:

- **The event.** `tickets-first` finds its event by searching the library's shared fixture
  list for whatever sits at Gillette. Both prototypes are at Gillette, so a search cannot
  tell them apart. This app names its event instead — see `src/event.js`, which defines the
  Steelers fixture locally and runs it through the library's own `normalizeEvent`. The
  shared fixture file is untouched.
- **Everything derived from kickoff.** December is a 4:25 PM Sunday game booking Fri → Sat;
  this is a 1:00 PM Sunday game booking **Sat, Sep 19 → Sun, Sep 20**. The stay, the lot and
  gate times, the tailgate and the transfer departure all moved with it. Gates (11:00 AM)
  and lots (9:00 AM) use Gillette's published times for this fixture rather than an offset.

Runs on **port 7300**.

Forked from [`/bundle`](../bundle) on **August 25, 2026**. Like every prototype here it's a
self-contained Vite app importing the **real library components** via the `@lib` alias —
nothing is copied or forked from the library, and no library file is changed.

Deployed at `https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/`
(local dev on port **6800**).

## The flow

**Three steps.** The stepper reads `Tickets · Hotel · Review` and nothing else — and
**Review IS the checkout**. There is no cart page: the cart is the flyout.

```
        ┌──────────── the stepper ───────────┐
Landing ─▶ Tickets ─▶ Hotel ──────────▶ REVIEW │──▶ Confirmed
 booking    listings   list ─▶ detail   = the   │     receipt
 widget     + price    card    rooms   CHECKOUT │     + itinerary
            pin map     │      gallery  contact │    (no stepper —
            qty · $     │      Reserve  payment │     it's an order)
                        │      Room ──┐ one form│
                        └── skip ─────┼─────────┘
                                      │
        cart button ────────────┬─────┘
        (every screen but       │
         Confirmed; Landing     ▼
         gets a pill)      CartPeek — THE CART
                           every line, every control, the extras picker,
                           the totals, and "Go to checkout". Opens over
                           whatever screen you are on — and opens itself
                           the moment you reserve a room.
```

**Reserving a room opens the cart.** The stay is committed to the trip first, then the
peek slides over the hotel page: the last piece of the trip is chosen there, so that is
where it is reviewed. Closing the panel leaves the guest on the hotel page they were
reading; *Go to checkout* is the way onward.

`/bundle` stopped at **Hotel → Cart**. This fork added an **Extras** step; the **Aug 25
feedback round** added a checkout, a room ladder, a no-pop-ups rule, the two opening screens
of the sibling [`/experience`](../experience) prototype (which took the separate **Seats**
step with them), the booking site's own **Global Nav with a cart in it** — and then, that
evening, **deleted the Extras step and moved the extras into the cart** — and then, later
the same evening, **made the Review step the checkout and the cart the flyout**. Eight
sections below, in the order they were asked for.

## Aug 25 · what changed, and why

### 1. There is a checkout now

> *"Can there be a checkout? Like, I want to pay."*

The cart used to hand straight to the confirmation. Nothing in the flow ever asked for a
name or a card — a review screen with a button labelled *Checkout* that skipped checkout.
In its place is the library's **`CheckoutPageExpanded`** in `mode="ticketing"`, collecting
contact details and payment and ending in one **Book Now**. Since [§8](#8-the-review-step-is-the-checkout-and-the-cart-is-the-flyout)
it is not *between* the cart and the confirmation — it **is** the review step, and the cart
screen it used to sit behind is gone.

It is the **expanded** page, not the stepped `CheckoutPage`, and that was the other half of
the ask:

> *"I don't want this next. I want one big form… We're definitely getting rid of that step,
> step, step for a full open."*

`CheckoutPage`'s left column is an accordion: one section open at a time behind a **Next**,
completed sections collapsed behind an **Edit**, so the order can't be read whole until the
last step. `CheckoutPageExpanded` shows **Contact · Payment · Review your order · Policies**
all open at once, every field in its input state, one submit at the bottom. The right-hand
rail — itemized cart, hold countdown, price details — is the same component in both, and
the rail was already right.

Two local decisions sit around it:

- **The submit is intercepted.** `CheckoutPageExpanded`'s *Book Now* fires a Quasar toast
  and nothing else — it has no event to bind. The click is caught on the way **down**
  (capture) and stopped, so the toast never fires: "Reservation confirmed" as a toast, on
  the way to a confirmation page, is the same news twice in two places, one of which
  disappears.
- **Editing stops on the page.** `CartReview` turns any line carrying a `unitPrice` into a
  control, and it edits its own deep copy of the cart — so an editable rail would move a
  number the trip never sees. The checkout's lines carry amounts only. The one surface that
  owns those numbers is the **cart peek**, a cart-button click away — see [§8](#8-the-review-step-is-the-checkout-and-the-cart-is-the-flyout),
  which also removed the *Back to your trip* bar this page used to carry.
- **The hold countdown floats.** `CheckoutPageExpanded` puts *Time left to book* inside the
  rail, where it scrolls away the moment the guest starts typing. The library's own
  **`HoldTimerPill`** is mounted fixed bottom-right instead and **the rail's copy is
  hidden** — one hold gets one clock, and two of them on one screen would be the same number
  in two places waiting to drift. See [§8](#8-the-review-step-is-the-checkout-and-the-cart-is-the-flyout).

### 2. You pick the hotel, then you pick the room

> *"I want to pick the hotel… I want to dig in. I want to pick the room type."*

The hotel step used to choose a **property** and take whatever room the fixture happened to
name. It's now two screens:

```
Hotel list                    Hotel detail page                 → cart
HotelCardReserve         HotelDetailPage (the booking site's)
 photos · stars           gallery · tabs · summary + map
 distance · from-rate     about · ROOMS · amenities · policies
 availability panel       ┌───────────────────────────────────┐
 "Choose your room" ─────▶│ Deluxe King  $289  [Reserve Room] │──▶ $289 in the cart
                          │ Double Queen $309  [Reserve Room] │──▶ $309 in the cart
                          │ Suite        $374  [Reserve Room] │
                          └───────────────────────────────────┘
```

Both are the **booking site's own components**, which is the round's *hotel experience
consistency* requirement: the hotel half of a ticketing flow should not be a reduced
tribute to the hotel product, it should be the hotel product. `HotelDetailPage` is mounted
exactly as the sibling [`/prototype`](../prototype) mounts it — nothing restyled, only the
data is this trip's.

**Opening a property is not choosing it.** The trip gains a stay when a *room* is picked,
so backing out of a hotel you were reading leaves the trip exactly as it was, and the
cart's *Change hotel or room* reopens the property that is **in the trip** — not the last
one browsed.

**The room ladder is deltas off the contracted rate**, never absolute prices:

| Room | Rate |
| --- | --- |
| *the property's contracted block room* | its `nightlyRate` |
| Accessible King | + $0 |
| Double Queen | + $20 |
| Executive King | + $45 |
| One-Bedroom Suite | + $85 · *limited* |

So a $159 airport hotel and a $289 flagship never show the same room list, the cheapest
room on every page is exactly the rate the list card advertised (*From $289 nightly*), and
a guest who never opens a room card is charged what every earlier version of this prototype
charged them. A ladder room whose name matches the property's own is dropped rather than
shown twice — Hyatt Place's block room **is** a Double Queen, so it offers four rooms and
the others five.

### 3. No modal pop-ups — with one, later, sanctioned exception

> *"We almost never are going to want those modal pop-ups, we're always going to want a
> clean page."*

Every step in this app is a page, and every screen added since arrived as one. The one
overlay that exists is the **cart peek**, asked back in by name at the end of the same
round — see [§6](#6-the-nav-is-the-booking-sites-and-the-cart-lives-in-it). It is the
exception, it is scoped to the cart, and it is annotated as such in
[`CartPeek.vue`](src/components/CartPeek.vue) so the next reader doesn't "fix" it.
**Everything else below is still suppressed**, and the suppressions are what this section
is about. Three library surfaces ship pop-up triggers of their own, and none of them can
fire here:

| Where | Trigger | What this app does |
| --- | --- | --- |
| `HotelDetailPage` | a room card's *Price Details ›* (a `DsModal`) | hidden in `HotelDetails.vue` |
| `HotelDetailPage` | the gallery's *See all N photos* | hidden in `HotelDetails.vue` |
| `TicketMap` | the tune icon → `TicketFilters` (a `q-dialog`) | hidden in `TicketMapStep.vue` |
| `BookingWidget` | *Dont see your group? Add it* (a `q-dialog`) | not rendered — `show-teams="false"` |
| `TicketQuantityDialog` | `/experience` opens it on the tickets screen | **not brought across at all** |

One more library element is hidden, and it is not a pop-up: `CheckoutPageExpanded`'s in-rail
*Time left to book* block, replaced by the fixed `HoldTimerPill` — [§8](#8-the-review-step-is-the-checkout-and-the-cart-is-the-flyout).

Every one is suppressed from **this app**, never removed from the library, which is
read-only. **Nothing in this app can open a dialog** — the cart peek is a slide-over this
app renders itself, not a `q-dialog` or a `DsModal`. It costs the photo grid (the mosaic
still shows five), a price breakdown that is one night at one rate the room card already
states twice, and the map's all-in filters panel — whose price, sections and sort controls
each have their own dropdown in the filter bar anyway.

### 4. The landing page and the ticket map came from `/experience`

Two screens were replaced outright with the ones the sibling
[`/experience`](../experience) prototype uses, because the front of this flow was the last
part of it still made of prototype furniture.

**Landing** was an `EventHero`, a paragraph and a *Get started* button. It is now the
library's **`LandingPage`** — Global Nav, hero, booking widget, the event write-up, display
ads, footer — mounted the way `experience/src/screens/LandingScreen.vue` mounts it. The
widget's **Search** is what starts the trip: no library page emits a navigation event, so
the click is read off the element, the same routing `/experience`'s shell does.

Two things are cut from the widget, both about pop-ups and both explained in
[`LandingStep.vue`](src/components/LandingStep.vue): the **Booking type** dropdown (the same
cut `/experience` makes — this flow's booking type is settled) and `show-teams`, which
`/experience` passes `true` and this app passes **`false`**. That second one is the
no-modals rule: the Registered Group field only renders once a booking type is chosen, so
with the dropdown hidden it can never appear either way — but `show-teams` also gates
`BookingWidget`'s *Add a group* `q-dialog`, and `false` removes the dialog from the app
entirely. Hiding its trigger the way the hotel page's triggers are hidden does not work
here: the only trigger lives inside a `q-menu`, which Quasar teleports to `<body>`, out of
reach of any scoped `:deep()` rule.

**Tickets** was `TicketTierList` — pick a price level, then pick seats on the next screen.
It is now the library's **`TicketMap`** under the same hero banner the browse pages use,
fed by `generateVenueListings()` / `listingPins()`: an "Authenticated NFL Tickets" listings
rail beside the interactive Gillette map, 60 deterministic offers, one price pin each.
Clicking a listing (row or pin) opens the seat detail — the view from that seat, the
section and row, the all-in price, a quantity select, and **Continue · $…**.

**The "How many tickets?" dialog was NOT brought across.** `/experience` opens this screen
with a `TicketQuantityDialog` in a `q-dialog`; it is excluded by the same review that wrote
this app's no-pop-up rule, and nothing is lost — see *How the ticket count is set* below.
`TicketMap` ships one pop-up trigger of its own, the tune icon that opens the all-inclusive
`TicketFilters` dialog, and it is **hidden** in `TicketMapStep.vue` the way `HotelDetails.vue`
hides the hotel page's two. It costs nothing a guest cannot still do: price, sections and
sort each have their own dropdown in the filter bar.

**This app still contains zero dialogs.** `grep` for `q-dialog`, `DsModal`, `DsSidePanel`
and `TicketQuantityDialog` across `src/` returns hits in **comments only** — and the single
`teleport` is `CartPeek`'s own.

### 5. Seats is gone — the map is the seat

The separate **Seats** screen (a `VenueMap`) was removed and its step folded into Tickets.

It made sense while the tickets step sold a price *level* and the map picked a seat inside
it. `TicketMap` sells the seat itself — section, row, all-in price and quantity in one
two-pane surface — so keeping the old screen behind it would ask the guest to choose their
seats **twice**, the second time from a map that knows nothing about the offer they just
took. That took the stepper from seven labels to six; §7 later took it to **three**:

```
Tickets · Hotel · Review
```

The map's own **Continue · $…** advances to the hotel step (or straight back to the cart,
if the guest came from the cart's *Change seats*).

It also closes an open item from the last round. The seats step never fed the cart — the
ticket line said `Section CL10, Row 12` whatever the guest clicked. The listing taken off
the map carries its section and row into `buildTripCart()`, so the cart, the checkout rail
and the itinerary now name **the seat that was chosen**. A deep link that names only a tier
still prices the old way, placeholder and all.

### How the ticket count is set

There is no quantity prompt. The trip opens at the prototype's standing default of **2**
— the number every earlier version opened on and the one the worked example below prices —
and from the tickets step on, the count is the map's:

| Where | Control |
| --- | --- |
| Listings rail | the filter bar's **`N tickets`** select |
| Seat detail | the same select, beside **Continue · $…** |
| The cart peek | the ticket line's `[− 2 +]` stepper. Since [§8](#8-the-review-step-is-the-checkout-and-the-cart-is-the-flyout) the peek **is** the cart, so the stepper is there and nowhere else |

The count that reaches the trip is the one on the **Continue** payload, so the number a
guest is shown a price for is the number they are charged for. Coming back to the map from
the cart re-opens it on the count the trip actually holds (the step is re-keyed on it,
because `TicketMap` copies its `initialQuantity` into local state on mount only).

Per-guest extras still follow this count without a control of their own — see
*Quantity is never a free-floating number*.

### 6. The nav is the booking site's, and the cart lives in it

The header was this fork's own: a dark navy bar reading **EventPipe · Client
Appreciation** with a *Tickets → Hotel → Extras · Prototype* pill on the right (the flow it
named has since lost that middle step — see §7), and no cart
anywhere in the app. It is gone. In its place is the library's real **`GlobalNav`** —
wordmark, *Contact Us*, *Manage Booking*, and a **cart button with a live count** — the
same nav the sibling Aug 25 prototypes now wear, because four prototypes of one product
should not each introduce themselves differently.

The cart was three surfaces that were one cart; since [§8](#8-the-review-step-is-the-checkout-and-the-cart-is-the-flyout)
it is **two**, and only one of them is a cart:

```
GlobalNav's cart button  ──▶  CartPeek (slide-over)  ──▶  the CHECKOUT (step 3, "Review")
 live count of the lines       THE CART. Every line, every    the order stated and paid
 on the trip                   control, the extras picker,    for. Read-only rail, one
 (+ a "Your trip" pill         the totals, the credit badge   Book Now, no editing
  on the landing)              "Go to checkout · $1,446"
```

**The peek is the one sanctioned overlay in this app**, and that is a deliberate, scoped
reversal of §3 — the stakeholder asked for a slide-over peek *with the full view behind
it*. A cart you have to leave the step to look at is a cart nobody checks mid-flow. The
reason is written at the top of [`CartPeek.vue`](src/components/CartPeek.vue) so the next
person tidying up a stray modal doesn't convert this one back. Nothing else moved: every
other screen is still a page and all four suppressions from §3/§4 are still in force.

**It is not the library's `CartFlyout`.** That was tried first and it is the right chrome
for the Group Block flow it was built for. Three things stop it fitting: its body is
`CartReview`, which is read-only but for a ticket quantity it edits in its own deep copy of
the cart — and this panel is now where the whole trip is edited; its footer is a single
hard-coded *Go to checkout* `q-btn` with no click event and no slot, so it can offer nothing
else and say nothing about what it does; and it carries a 15-minute *time left to book*
countdown, a group-block hold device this flow has no inventory hold behind.

**The lines and the totals live in one component**,
[`TripCartBody.vue`](src/components/TripCartBody.vue), split out of the old `TripCart` when
the trip was shown in two places at once. `TripCart` and its screen are gone; the body
stays split from the panel because the panel owns chrome (scrim, header, footer, escape,
scroll lock) and the body owns money. Its `readonly` prop went with the cart screen — see
[§8](#8-the-review-step-is-the-checkout-and-the-cart-is-the-flyout).

#### The count, and two clicks the nav can't tell us about

`GlobalNav` hard-wires its cart button to `CartFlyout` and exposes no prop or event to
redirect it, and its badge is fed by whatever cart body that fly-out has open — which
here is never. Both are handled without touching the library:

| | How |
| --- | --- |
| The button opens **our** peek | the click is caught at document scope in the **capture** phase and stopped, so `GlobalNav`'s `cartOpen` stays false for the life of the app — which is what guarantees the peek is the only overlay and not one of two stacked ones |
| The badge carries a real number | the count is patched into `.gnav__badge` whenever the trip or the screen changes |
| The wordmark returns to the landing page | the same capture handler. It no longer *restarts* the trip, which the old bespoke bar did: a real site's logo that silently deletes a trip is a trap. *Start over* on the confirmation still resets everything |

The count is **lines on the order, not units** — two tickets, a room and three extras is
**5**, not 13. 13 is a number that is true of nothing the guest recognises.

*Contact Us* opens a `q-menu` dropdown, not a dialog — the same class of surface as the
ticket map's price, section and sort dropdowns that §3 already keeps.

#### Where the cart button is, and isn't

| Screen | Cart button | Why |
| --- | --- | --- |
| **Landing** | a **pill**, not the nav | This app renders no nav there at all: `LandingPage` **is** a page, nav and footer included. Its own `GlobalNav` is mounted by the library with `show-cart` hard-coded **false** and no prop to lift it — *"No cart on the landing page (nothing has been added yet)"* — so the button cannot go in the nav without a library change, which is not on offer. It used to get nothing at all, and [§8](#8-the-review-step-is-the-checkout-and-the-cart-is-the-flyout) made that untenable: the wordmark returns here **with the trip intact**, and the peek is now the only place a trip can be edited. So the landing gets a small fixed *Your trip · N* pill — page furniture, not a second overlay — and only when there is something in the cart to open. An empty pill on the one screen where nothing **can** have been added is the same broken advertisement the library avoided. |
| Tickets | **0** | Honest, and orientation: the badge is already there on the screen that fills it. |
| Hotel · rooms | live count | |
| **Review (checkout)** | live count — **load-bearing** | This screen lost its *Back to your trip* bar in [§8](#8-the-review-step-is-the-checkout-and-the-cart-is-the-flyout), so the cart button is the **only** way to change an order while paying for it. The peek opens with every control; it drops only its *Go to checkout* button (a button that navigates to the page you are on reads as broken) and offers *Back to checkout* instead, which closes the panel. |
| **Confirmed** | **none** | The trip has been paid for. It is an order now, and a cart offering *Go to checkout* for something already bought is the one thing on that screen that could worry a guest. |

The peek's empty state (a trip with no seats yet) names the seats rather than saying "your
cart is empty": the map is the one thing this flow cannot start without.

### 7. Three steps — and the extras moved into the cart

> *"i dont want extras and reviews, i only want tickets, hotel, and review... i think we can
> put extras in the flyout cart."*

The stepper was six labels: `Tickets · Hotel · Extras · Review · Checkout · Confirmed`. It is
three: **`Tickets · Hotel · Review`**. Two labels came off for two different reasons.

**`Extras` was a screen, and the screen is gone.** The four offers are not — parking, the
tailgate, the transfer and hospitality keep their prices, their units, their copy and their
rules. They moved into `TripCartBody`, which put them in the **cart peek** (and, for an hour
that evening, on the cart screen too), addable and removable at any point in the flow.
Extras were never a decision with a right moment: pinning them to one cost every guest a
screen, and caught the ones who changed their mind ten seconds later with nowhere to go but
*Back*.

**`Checkout` and `Confirmed` were never steps of assembly.** A stepper is a map of putting a
trip together; those two are what happens once it is together. They come off the bar, and the
bar is **hidden entirely** on both screens rather than parked on *Review*:

| Screen | Stepper | Why |
| --- | --- | --- |
| Landing | **hidden** | `LandingPage` is a whole page with its own nav and footer. Unchanged. |
| Tickets | `Tickets` | |
| Hotel · rooms | `Hotel` | Two screens, one step: a guest reading room types has not finished the hotel step, they are in the middle of it. |
| Review (cart) | `Review` | |
| Checkout | **hidden** | *(reversed an hour later by [§8](#8-the-review-step-is-the-checkout-and-the-cart-is-the-flyout) — the checkout **is** the Review step now, and the bar stays lit on it)* |
| Confirmed | **hidden** | It is an order, not a step. A progress bar over a receipt points at a trip that has already been bought. |

#### How the extras read in the cart

Under the trip's lines and above the totals — an offer is not part of the trip yet, but the
number it changes is the one directly below it. One compact row each: icon, name, what the
price multiplies, the line it would add, and **Add**.

```
TICKETS                                    Change seats
  Club Level ticket        [− 2 +]  $359 each          $718
YOUR STAY                        Change hotel or room
  The Westin · Deluxe King  🗑 Remove                   $289
GAMEDAY EXTRAS
  Prepaid Gameday Parking  [🗑 1 +]                      $65

ADD TO YOUR GAMEDAY                        ✓ One charge
  🔥 Ultimate Tailgate Party                            $190
     $95 × 2 guests — matches your tickets        [+ Add]
  🚌 Round-Trip Stadium Transfer                         $84
     $42 × 2 guests — matches your tickets        [+ Add]
  🍽 Pregame Hospitality Club                           $240
     $120 × 2 guests — matches your tickets       [+ Add]
```

**Added extras leave the picker** and become cart lines above it, with their own *Remove* —
one extra never shows two states in one scroll. The list empties as the order fills.

**The picker reads its inputs off the cart, not off props.** The ticket count comes from the
ticket line and the hotel dependency from whether a hotel line exists, so the picker's
*"× 2 guests"* and the ticket line's *"2 ×"* are the same number by construction rather than
by two callers remembering to pass the same prop.

**It is the same component wherever the trip is shown**, so no two surfaces can offer
different extras at different prices — the same guarantee §6 bought for the lines and the
totals. Since §8 there is only one surface, and this is the only place in the app an extra
can be bought at all.

**Not `AddOnCard`** (deleted with its step). That card was photo-tile-sized — a 132×108 icon
tile beside a tagline, a meta line and a price block — built to fill an 820px step where four
of them were the whole screen. The peek panel is **460px** wide and the extras sit *under* an
itemised order in it: at that width the card wraps into three ragged rows and pushes the
totals below the fold, which is the one thing a cart may not do.

#### The transfer still needs a hotel, and now has to say so

On the old step the dependency was implicit in the running order — you had just answered the
hotel question, so *"needs a hotel"* pointed one screen back. **In a flyout there is no "one
screen back"**: the guest may be standing on the ticket map. So the row carries its own way
out.

```
  🚌 Round-Trip Stadium Transfer                         $84
     $42 × 2 guests — matches your tickets     [+ Add] ✕
     ⓘ Needs a hotel — the coach leaves from your lobby · Pick a hotel
```

Disabled with the reason, never hidden — same rule as before, same words. The *Pick a hotel*
link closes the peek and opens the hotel step (anything that navigates closes the panel
first; a slide-over left open over a screen change has the guest editing one screen while
looking at another). And the rule still runs in reverse: **removing the hotel drops the
transfer with it**.

### 8. The Review step **is** the checkout, and the cart **is** the flyout

> *"make sure the review screen is the checkout. i want the review to be the cart flyout."*

An hour after §7 cut the stepper to three labels, the third one moved. `Review` used to be a
full-page cart that a guest read and then left for a checkout the stepper had been hidden
on. Now `Review` **is** the checkout, and the cart page is deleted.

```
BEFORE (§7)   Tickets ─▶ Hotel ─▶ Review = cart page ─┊─▶ Checkout ─▶ Confirmed
                                                       ┊  (no stepper)
AFTER  (§8)   Tickets ─▶ Hotel ─▶ Review = CHECKOUT ──────▶ Confirmed
                                  ▲                          (no stepper)
                                  └── CartPeek, from the cart button on every screen
```

Two screens said the same thing back to back. A guest read an itemised order on the cart
page, pressed *Checkout*, and read the same itemised order again in the checkout rail — with
the progress bar switched off, so the one screen that took their money was the one screen
that could not say where they were.

#### What the stepper shows now

| Screen | Stepper | Why |
| --- | --- | --- |
| Landing | **hidden** | `LandingPage` is a whole page with its own nav and footer. |
| Tickets | `Tickets` | |
| Hotel · rooms | `Hotel` | Two screens, one step — a guest reading room types is in the middle of the hotel step, not past it. |
| **Checkout** | **`Review`** | The reversal. §7 hid the bar here on the argument that a guest typing a card number is past assembly; that held only while a *separate* cart page carried the third label. With the cart page deleted, hiding the bar would leave the stepper's last step pointing at no screen at all, and a guest on the payment page with no bar and no back link would have no way to read where they are or to step back to Tickets. |
| Confirmed | **hidden** | Unchanged, and never the same argument: a receipt is not a step of assembly. A progress bar over an order already paid for points at a trip that cannot be changed. |

#### The cart page is gone, and the peek is the cart

Everything the cart screen offered is in the flyout — not a summary of it, all of it:

| | On the peek |
| --- | --- |
| Ticket line | `[− 2 +]` **`QuantityStepper`**, plus *Change seats* → the ticket map |
| The stay | 🗑 **Remove**, plus *Change hotel or room* → the property's own detail page |
| Extras | the **`CartAddOns`** picker — add, and *Remove* on the line above |
| Parking | its **vehicle stepper** (1–4), whose trash can takes it off the trip |
| Money | subtotal, bundle credit, fees, taxes, total — **and** the `BundleSavingsBadge` |
| Out | **Go to checkout · $1,446** |

**`readonly` is gone from `TripCartBody`.** It named the difference between the peek (a
glance at the order on the way past) and the cart screen (the surface that edited it), then
narrowed in §7 to *no **step** controls* when the extras moved in. With no second surface
there is nothing left for it to name, and a flag whose only remaining effect would be to
make the one cart less capable than itself is a flag that eventually gets passed by
accident. The prop is deleted; every control renders, always. Keeping it defaulted to
`false` "in case a summary is wanted" was the rejected alternative — a summary of the only
cart is a cart the guest cannot use.

**The footer lost a button.** *View full cart* pointed at a page that no longer exists, so
what remains is the one route out — *Go to checkout · $total* — plus the header's ✕, the
scrim and Escape. On the checkout screen itself there is nowhere forward to go, so the same
button becomes *Back to checkout · $total* and simply closes the panel; the alternative, a
footer holding a lone sentence, reads as a cart with its button missing.

**Reserving a room opens it.**

> *"when i click reserve a room ... i want to link to the flyout cart for the user to review
> before they go into the review screen that is actually the checkout screen."*

*Reserve Room* no longer navigates anywhere. The stay is **committed first** (or a guest
reviews a panel missing the room they just clicked), then the peek opens over the hotel page.
Closing it leaves them on the page they were reading. Reserving a **second** room replaces
the stay rather than stacking one: `setHotel()` overwrites the property and resets the room
to that property's contracted default, the clicked room is written over it, and
`buildTripCart()` makes exactly one hotel line out of the pair — so switching properties
mid-browse prices the new property's room, never the old one's.

#### The checkout's top is clean

> *"the top of checkout"* — the `← Back to your trip` strip is removed.

It carried a back button and a sentence reading *"Quantities, rooms and extras are changed
in your trip — this page states what's being charged."* Both halves died with the cart page:
the button pointed at a screen that no longer exists, and the sentence described a
separation between *your trip* and *the checkout* that no longer exists either. **Nothing
replaces it** — no substitute bar, banner or note. The stepper above says where the guest
is, the rail says what is being charged, and the Global Nav's cart button opens the peek,
where the order is changed in place.

#### The hold countdown is pinned

> *"Time left to book"* — always in the viewport, bottom-right.

`CheckoutPageExpanded` renders the countdown **inside the rail**, under the cart card, so it
scrolls out of sight the moment the guest starts filling in the form — the one screen where
the number means anything. The library's own **`HoldTimerPill`** is mounted fixed
bottom-right instead, and **the rail's copy is hidden** with a scoped `:deep(.ck__timer)`
rule (the same technique `HotelDetails.vue` uses on the hotel page's two modal triggers —
the library is read-only). One hold, one clock: two of them on one screen would be the same
number in two places, waiting to drift.

- **Deterministic.** The pill's `seconds` comes off the same cart object that fed the rail's
  copy — a fixed **895**, never a clock reading — so a demo opens on `14:55` every run.
- **It overlaps nothing.** At 1440×900 and 1280×720 the library's `1fr 400px` grid keeps the
  submit button in the **left** column while the pill is right-anchored and ~300px wide, and
  the sticky rail's card ends well above the pill's band. Two clearances guard the rest: the
  rail column gets 84px of bottom padding so a four-extra trip's last totals row can always
  be scrolled clear of the pill, and below 880px — where the library collapses the grid to
  one column and the full-width *Book Now* reaches the bottom-right corner — the page gets
  the same clearance under its last element. Neither moves anything on the page.
- **It is not a pop-up, and needs no exception.** The no-modals rule is about surfaces that
  interrupt: something that takes the screen, traps focus, and must be dismissed before the
  guest can carry on. The pill takes no click, blocks nothing and dismisses nothing — it is
  page furniture anchored to the viewport instead of to the document, the same class of thing
  as the sticky rail beside it. **The cart peek is still the only overlay in this app.**
- **Checkout only.** It is mounted inside `TripCheckout`, not in `App.vue`, so it cannot
  outlive the screen. A hold countdown over the landing page or the ticket map would be
  counting down a hold that does not exist yet, and over the **confirmation** it would be
  counting down a receipt — the most alarming place in the flow to put a clock.

## Aug 26 · the header is pinned

> *"When the page scrolls, keep the nav AND the step bar fixed at the top."*

The Global Nav and the `AppStepper` under it are now **one sticky block** — `<header
class="bapp__chrome">` in `App.vue`, wrapping both. They pin together, they read as one piece
of chrome, and there is no seam for the page to show through between them mid-scroll. Both
halves of it earn the space: the step bar says where the guest is, and the cart button is how
the trip is opened, on screens (the ticket map, the hotel page, the checkout) long enough to
scroll either one off the top.

### `position: sticky`, not `fixed`

**Sticky.** It stays in normal flow, so the block occupies its own **129px** at the top of
the document and every screen below simply starts after it. No `padding-top` anywhere, and —
the part that matters here — **nothing to keep in sync when the block changes height.** It
does change: the stepper is hidden on the confirmation, where the block is the nav alone at
**72px**, and `AppStepper`'s tabs drop 56px → 48px under 560px.

`fixed` was the alternative and was rejected on exactly that. Out of flow, it needs
compensating padding whose correct value differs per screen, and the failure mode of getting
it wrong is *the first row of a screen sitting silently under a bar* — which is precisely the
thing nobody catches in a review. Sticky has no such failure mode here: `.bapp` is a plain
block on the document, the document is the scroller, and no ancestor scrolls or clips, so
sticky simply works.

### Four surfaces still need the header's height

The **page** needs no compensation, but four things that pin *themselves* do. `App.vue`
measures the block with a `ResizeObserver` and publishes it as **`--tf-chrome-h`** on the
document element, where every screen's scoped CSS can read it (custom properties inherit).
A hard-coded `calc(72px + 57px)` would be right today and silently wrong the first time the
nav or the stepper changes height.

| Surface | Was | Now |
| --- | --- | --- |
| `TicketMap` (`tickets`) | `height: 100vh` | `calc(100vh - var(--tf-chrome-h))` |
| `HotelDetailPage` section tabs (`hotelDetails`) | `sticky; top: 0` | `top: var(--tf-chrome-h)` |
| `HotelDetailPage` tab clicks | `scrollIntoView({block:'start'})` | `scroll-margin-top` on the sections |
| Checkout order rail (`checkout`) | `sticky; top: 20px` | `calc(var(--tf-chrome-h) + 20px)` |

**The ticket map is the one that cost the most.** It is a full viewport of two-pane surface
whose panes scroll *themselves*, so a 100vh map under a 129px header overflows by 129px that
the page can never bring back: scrolled to the bottom, the filter bar, the "60 Listings" rail
head and the top of the map artwork sit permanently behind the header, and *Continue* sits
below the fold. Shortening the map by the header's height makes the two agree exactly — the
event band scrolls away and the map comes to rest filling the gap. Verified by scrolling at
**1440×900** and **1440×700**: chrome `0–129`, map `129–900` / `129–700`, filter bar's top
edge flush at 129, the Legend and the zoom controls inside the map, and with a listing
selected the *Continue · $…* button lands at 510–558 at the shorter height. Below 860px the
library drops the map to `height: auto` and stacks the panes; the subtraction is undone there
so it cannot re-impose a height on a layout that no longer needs one.

**The hotel page now has two sticky bars, and they stack.** Its own section tabs (Overview ·
Rooms · Property · Amenities · Policies) pinned at `top: 0`, which was right when nothing was
above them and is now the header's row. Re-based on `--tf-chrome-h` they come to rest at
**129–202**, directly under the chrome, with the page scrolling beneath — three sticky layers
reading correctly. Sticky offsets resolve against the *margin* box and the library gives that
bar `margin: 24px 0`, which would have parked it 24px low and opened a strip of scrolling
page between the two; the margin is moved to padding rather than subtracted, because a
subtraction breaks silently the day that margin changes.

### The landing, and the one place there could have been two navs

`screen === 'landing'` mounts the library's whole `LandingPage`, which brings its **own**
`GlobalNav` — so `App.vue` has always `v-if`'d its header off there, and still does. The
landing's nav is pinned **from inside `LandingStep.vue`** (`:deep(.gnav-wrap)`, same sticky,
same `z-index: 1000`) so the header behaves identically on every screen without this app ever
mounting a second bar. Verified: `document.querySelectorAll('.gnav-wrap').length === 1` on the
landing, and `--tf-chrome-h` reads **0px** there — no stepper, and nothing below asking for an
offset. On the confirmation it reads **72px** and the block is the nav alone, with no gap
where the stepper used to be.

### The z-index order, and the peek's scrim

```
  900  the landing's "Your trip" pill
 1000  .bapp__chrome  ·  the landing's own pinned nav
 2000  HoldTimerPill (checkout, bottom-right)
 3000  CartPeek — scrim and panel
```

The header sits **above** everything in the page — the hotel page's section tabs (5), the
map's rail headers (1) and legend (4) — and **below** both fixed things, deliberately. The
peek's scrim has to cover the header: a nav floating over a modal scrim reads as a broken
overlay, and the peek is this app's one sanctioned overlay. Confirmed by opening the peek on
a scrolled checkout — nav and step bar are dimmed under the scrim, and the countdown pill
(2000) goes behind the panel with them. The pill is bottom-right anchored and never meets the
header at any height.

## Aug 26 · the event artwork

The stock stadium background is gone. The three screens that carry event imagery now carry
the supplied **Patriots artwork** — a floodlit, near-black field with the 40/50/40 yard
numbers along the bottom edge — copied into the app at
[`src/assets/event/`](src/assets/event/) as `event-hero-1440x400.png` (2880×800, @2x) and
`event-band-1440x240.png` (2880×480, also @2x). They are **in the app, not in
`references/`**, which is gitignored: an import from there builds locally and breaks for
everyone else and in CI.

| Screen | Artwork | How |
| --- | --- | --- |
| `landing` | 1440×400 (@2x) | Scoped `:deep(.lp__hero)` override from `LandingStep.vue` |
| `tickets` | 1440×240 | `EventBand.vue` |
| `hotel` (property list) | 1440×240 | `EventBand.vue`, mounted full-bleed from `App.vue` |
| `hotelDetails` | — | **No band, deliberately** — see below |

### One band, one component

The tickets step built its hero inline; it was the only copy of that treatment when it was
written. The property list now carries the same band, so the markup, the artwork and the
scrim moved into **`EventBand.vue`** and both screens mount it. A band defined twice is a
band that drifts, and the whole point of it is that moving between Tickets and Hotel the
header is a **fixed piece of chrome**, not two things that nearly match.

On the property list the band is mounted from `App.vue`, **outside** `bapp__step--wide`.
`HotelPickStep` is the contents of an 1100px measure, and a band inside that measure reads
as a wide card rather than as a header.

### The landing hero: a scoped CSS override, not a fork

`LandingPage` hardcodes its hero — `import defaultBg from
'../../background-img/defaultBackgroundImage.png'`, written into an inline `:style`. There is
no `heroImage` prop, no slot, no custom property: **nothing in its `defineProps` a caller can
reach.** So the swap was either a scoped rule or a fork, and it is the **scoped rule**.

The alternative was the `OVERRIDES` map in `vite.config.js`, which the sibling
[`package-customize`](../package-customize) app uses. But look at what that redirects:
`CartFlyout` — a whole component whose entire behaviour was wrong for that prototype. It
swaps *a component for a different component*. Here the component is right and **one URL
inside it** is wrong. Redirecting it would mean copying all ~250 lines of `LandingPage` —
nav, widget, the event write-up, the ads, the footer — into this app to change one
`background-image`, and every later library fix to any of that would stop reaching this
screen silently. `package-customize`'s own config makes the same argument about its empty
`PATCHES` list: the places it needed to bend a library template it bent *"in scoped CSS from
the screens that mount them, which fails visibly rather than breaking the build when the
library moves."*

**What it costs.** `.lp__hero` is a library class name, so the rule is coupled to it: if the
library renames the hero, the artwork silently reverts to the stock imagery. That is a
visible failure on the first look at the screen — not a broken build and not a wrong price —
and it is the cheaper of the two failure modes. It also needs `!important`, because what it
overrides is an inline style, and the scrim has to be restated in the same declaration
because `background-image` is one property and the library packs the gradient and the photo
into it together. **Zero library files changed, zero overrides, zero source patches** — the
claim under *Library components mounted* still holds.

### The hotel **details** page gets no band — a judgement call

The ask was *"the hotel pages get the 1440×240 banner as the header background"*, and on the
property list that is exactly right: the list has no imagery of its own, so the band is the
only thing saying what trip these hotels belong to.

The detail page is the opposite case. `HotelDetailPage` **opens on a gallery mosaic** — five
photos of the property, full width, above everything — and that mosaic is not decoration, it
is the first half of the decision the page exists to ask: *is this where I want to sleep?*
Putting the stadium band above it stacks two pieces of hero imagery in the first screenful,
and the one on top is about the game rather than the hotel: it pushes the actual subject of
the page below the fold to say something the guest already knows.

The event context the band would carry is on that page anyway and has been since it was
written — `hdet__bar` names the event, the dates and the party size in a line of type
directly above the gallery. That is the right weight for a fact the guest is being
**reminded** of rather than sold.

This is reversible: mounting `<EventBand>` above the bar in `HotelDetails.vue` is a two-line
change if the review disagrees.

### How it scales: `100% auto`, `center`, `no-repeat`, on black

Both files are **@2x**, so there is no resolution ceiling on either at any width a browser is
likely to be: at 1440 each is a 2× map, and even at 2880 each is still 1∶1.

The current artwork puts the **two helmets hard against the left and right edges**, facing
each other, with the dark centre reserved for the type. That single fact decides all four
background properties, and it is the reason this section no longer reads the way it did when
the artwork was a plain field:

**`background-size: 100% auto`, NOT `cover`.** `cover` fills by whichever axis is short, so
at any viewport narrower than the file's own ratio it trims **horizontally** — straight
through the only two subjects in the frame, and asymmetrically, so one team loses its helmet
before the other. Fitting the width guarantees both survive at every width and spends the
trim vertically, where the frame is black falloff above and unlit turf below. **Do not revert
this to `cover`.**

**`background-position: center`, not `center bottom`.** Follows from the same change: the
subject is no longer only the lit turf along the bottom edge, so a bottom anchor now pushes
the helmets off-centre in the box.

**`background-repeat: no-repeat`** — and this is the Aug 26 (late) fix. `background-repeat`
defaults to `repeat`. Under `cover` that was invisible, because the image always filled the
box and there was never an uncovered strip to tile into. Fitting the **width** leaves a strip
whenever the box is taller than `width ÷ ratio`, and that strip was tiling a **second copy of
the picture** — a sliver of turf and a repeated helmet edge above and below the real frame.
Both surfaces now declare `no-repeat`.

**On black.** The strip `no-repeat` leaves has to be a deliberate letterbox, not a gap.
`.eband` already painted `background-color: #000`; the library already paints `.lp__hero`
black, and `LandingStep.vue` now restates it in the same rule that decides the trim, so a
later background-image edit cannot leave it on the canvas grey.

What that adds up to, measured:

| Width | Landing hero (3.6∶1 in a 400px box) | Band (6∶1 in `clamp(200px, 16.6667vw, 240px)`) |
| --- | --- | --- |
| **1100** | image 306px in a 400px box → **~47px of black above and below** | box floors at 200px, image 183px → **~8px of black above and below** |
| **1440** | image 400px → **exact fit, no letterbox** | `16.6667vw` = 240px, image 240px → **exact fit** |
| **1920** | image 533px in a 400px box → **cropped, no letterbox** | box caps at 240px, image 320px → **cropped, no letterbox** |

Checked at all three on both screens: exactly one copy of the image, no seam and no repeated
helmet, both helmets whole, and the event name and dates legible throughout. **The 1100
landing hero is the only case where the letterbox is large enough to notice** — and it does
not read as a mistake, because the artwork's own top edge is near-black falloff and its
bottom edge is unlit turf, so the black continues the picture rather than interrupting it.
Below ~1000 that band grows, and if the landing is ever reviewed at tablet widths it is worth
a look; at every desktop width in the brief it is right.

### The hero headline breaks on the fixture — landing only

```
New England Patriots
v Buffalo Bills
```

**Landing page only.** The interior `EventBand` keeps its single line, which is why the break
is applied in `LandingStep.vue` and not to `event.name` in `App.vue`, where the band reads
the same string.

**A literal `<br/>` was not available.** `LandingPage` renders the name as text interpolation
— `<h1 class="lp__event text-h3">{{ eventName }}</h1>` — so markup in the string is escaped
and shows up as characters. The two ways to get a real `<br>` in there are `v-html` on a
library template (a patch to a read-only file) or an XSS-shaped escape hatch, and neither is
worth it for a line break. A **newline** in the string plus a scoped
`:deep(.lp__event) { white-space: pre-line }` gets the same result with no library change and
nothing to sanitise.

`pre-line` rather than `pre` or `pre-wrap`: it honours the explicit newline while still
collapsing incidental whitespace and still letting the line wrap on its own if the viewport
gets narrow enough. **The two-line break is a floor, not a cage** — `pre` would forbid the
natural wrap and push the headline out of the hero on a small screen. The rule is scoped to
the headline alone; `pre-line` anywhere broader would start honouring stray newlines in body
copy this app does not control.

The newline is inserted by splitting on the **fixture separator** (`/\s+(vs?\.?)\s+/i`), not
on a hard-coded team name, so a different event still breaks in the right place and a name
with no " v " in it falls through unchanged rather than losing a word.

Measured at **1100, 1440 and 1920**: exactly **2** rendered lines at each (106px against a
52.8px line-height), headline `229–335` inside a hero of `72–472`, and the booking widget's
top edge at `424` — the second line clears it by ~90px, so nothing is pushed or overflowed
even with the re-copied artwork, `no-repeat` and the black backing in. The band on
`?screen=tickets` is unchanged: one line, `white-space: normal`.

### The scrim came down to 22%, and the logo stayed

The library heroes use a flat **50%** black scrim. A hero scrim exists to hold type off
imagery that is brighter or busier than the type, and this artwork is neither: it arrives
already graded almost to black across the top two thirds — **exactly where the logo, the
event name and the dates sit**. So 50% buys no legibility the image has not already paid for,
and what it costs is the picture: the turf and the yard numbers, the only part of the frame
with light in it, crush to a flat dark green nobody reads as a field.

**22%** keeps the white type comfortably clear — measured against the lightest pixels in the
crop, the yard-line paint at the bottom edge, which the type never reaches — and leaves the
field legible as a field. It is still a scrim, not the absence of one: it evens out the paint
strokes so a stray yard line cannot cut through a descender.

**The logo treatment is untouched.** On the previous artwork the white EventPipe wordmark
landed on a bright red stadium board and was the one thing worth watching; on this one it
sits on the darkest part of the frame and needs nothing. Checked at **1440** and **1100** on
all three screens, and at **1920** on the band.

## What was preserved

The decisions the last round praised are untouched.

### The transfer depends on the hotel

The **Round-Trip Stadium Transfer** departs from the hotel lobby. With no hotel in the trip
there is nowhere for it to leave from — so the offer itself depends on an answer only the
hotel step can give. That is the reason the edge case is written tickets → hotel → add-on
and not tickets → add-on → hotel, and it is why extras used to come *after* the hotel step.

§7 deleted that step, and the rule survived it intact: with no hotel the transfer renders
**explained and disabled** rather than missing, wherever the extras are shown —

> ⓘ Needs a hotel — the coach leaves from your lobby · **Pick a hotel**

— and **removing the hotel from the cart drops the transfer with it**. What the flyout added
is the link: the ordering used to say where the answer was given, and now the row has to.

### Quantity is never a free-floating number

| Extra | Unit | Quantity is |
| --- | --- | --- |
| Prepaid Gameday Parking | vehicle | its own count (1–4), on its **cart line** |
| Ultimate Tailgate Party | guest | **the ticket count** |
| Round-Trip Stadium Transfer | guest | **the ticket count** |
| Pregame Hospitality Club | guest | **the ticket count** |

Per-guest extras have no stepper of their own — not in the picker, not on the cart line —
and each states the number it follows out loud (*"× 2 guests — matches your tickets"*), so
the price never looks like it moved on its own when the ticket stepper is touched. Four
tickets buy four wristbands; a control that let them drift apart would let someone buy three
hospitality passes for four people, which the venue wouldn't honour anyway. **Parking is the
exception** because cars don't follow headcount, and it keeps its vehicle stepper — on the
cart *line*, once it is in the trip, since a count on something not yet bought is a number
with nothing to multiply.

### The cart is editable, per line

```
TICKETS          Change seats
  Club Level ticket        [− 2 +]   $359 each          $718
YOUR STAY        Change hotel or room
  The Westin · Deluxe King  🗑 Remove                    $289
GAMEDAY EXTRAS
  Prepaid Gameday Parking  [🗑 1 +]                       $65
  Ultimate Tailgate Party   🗑 Remove   $95 each         $190
```

One Edit link per **section**, not per line. Everything reversible in place (a count, a
removal) is in place; everything that means re-choosing is a link back to the screen that
chooses it — and since Aug 25 the stay's link goes to the property's **detail page**, where
the room is one click away and the property is two.

Since §8 this is the **flyout**, and every control above is there — the screen it used to
live on is deleted. An Edit link taken from the peek hands the guest back to the screen the
panel was floating over, but only when that screen is a **later** step than the one being
edited: following the transfer's *Pick a hotel* from the ticket map should carry the guest
onward to the review, not march them back to the map they just left.

The extras section has **no** Edit link since §7: there is nowhere for it to go. The step it
used to open is deleted, and the picker that replaced it is a few rows further down the same
cart — a link that scrolls you to the bottom of what you are already reading is worse than
none.

### The confirmation is a receipt **and** an itinerary

`BundleConfirmation` is mounted as shipped and keeps its job: order number, line items,
total charged, dual-email notice. Below it sits `TripItinerary` — *where do I go, and
when?* — ordered the way the day happens, now naming the room and its bed:

```
THE NIGHT BEFORE   The Westin · Double Queen
                   2 Queen Beds · Sleeps 4 · Near Gillette Stadium
                   1 Patriot Pl, Foxborough · check-in Fri 3:00 PM
BEFORE THE GAME    Ultimate Tailgate Party · Lot 22 · opens 1:25 PM
KICKOFF            Patriots v Bills · Gillette Stadium · Sun 4:25 PM
```

## How it's priced

```
tickets   = seat face value × ticket count
stay      = CHOSEN ROOM's nightly rate × 1 night
extras    = Σ (unit price × units)        units = ticket count, or the vehicle count
subtotal  = tickets + stay + extras
credit    = round(10% × (stay + extras))  ← the contracted parts only
fees      = round(18% × tickets)          ← ticketing service fee, tickets only
taxes     = round(9% × (subtotal − credit))
TOTAL     = subtotal − credit + fees + taxes
```

- **The seat's face value, not its all-in price.** Every map listing carries `price`,
  `fees` (18% of it) and `priceWithFees`. The cart takes the **face value** and charges the
  18% ticketing service fee itself, which reproduces the listing's own `fees` to the dollar
  — so tickets + fees in the cart come to exactly `priceWithFees × count`, the number
  printed on the map's *Continue · $…* button. Taking the all-in price into the ticket line
  would charge that fee twice.
- **The credit skips the tickets.** Face value is set by the team and never discounted, so
  a guest comparing the ticket line against Ticketmaster finds the same number.
- **The credit is deducted, not struck through.** It comes off before taxes are charged, so
  a guest adding the column up by hand lands on the same total.

Worked example: **2 Club tickets, The Westin (block room), tailgate + parking**

| | |
| --- | --- |
| 2 × Club Level @ $359 | $718 |
| The Westin · Deluxe King · 1 night | $289 |
| Parking · 1 vehicle @ $65 | $65 |
| Tailgate · 2 guests @ $95 | $190 |
| Subtotal | **$1,262** |
| Bundle credit (10% of $544) | −$54 |
| Service fees (18% of $718) | $129 |
| Taxes (9% of $1,208) | $109 |
| **Total** | **$1,446** |

Take the **suite** instead of the block room and the same trip is **$1,529** — the +$85
room, less the credit on it, plus tax on what's left. Take a real seat off the map instead
— say `L38-CL7-7`, Club Level Section CL7 Row 7 at **$418** face (**$493** all-in) — and the
same trip is **$1,595**, of which the tickets are `836 + 150 = 986 = $493 × 2`. The cart,
the checkout rail and the confirmation agree to the dollar in every combination, including
with the hotel skipped, the extras skipped, or both.

### Making the checkout rail agree

`CartReview` — the rail inside `CheckoutPageExpanded` — does not read a total. It derives
one from the lines it is handed:

```
rail fees  = round(Σ non-hotel lines × feeRate)
rail taxes = round(Σ every line      × taxRate)
rail total = Σ every line + fees + taxes
```

The **tax base already agrees**: the bundle credit is passed as its own cart line, so
`Σ every line` *is* the after-credit subtotal this trip taxes. The **fee base does not** —
the service fee here is charged on tickets only, and `CartReview` would spread it across the
extras too. So the rail is handed the `feeRate` that reproduces this trip's fee **from the
rail's own base**, and every figure it prints is the figure the cart printed.

The two alternatives were both worse. Charging fees on the extras so the library's formula
happens to fit changes what a guest pays to suit a component's arithmetic; patching
`CartReview` breaks the rule every prototype here follows.

Prototype economics, deterministic — no `Math.random`, no `Date.now` — so a demo shows the
same numbers every time. Ticket prices come from the library's own `deriveTiers()` on the
real Patriots v Bills fixture; hotel rates from `CONTRACTED_HOTELS`.

## Library components mounted

**`GlobalNav`** (the app header on every screen but the landing — wordmark, Contact Us,
Manage Booking, cart button + badge) · **`LandingPage`** (`GlobalNav` · hero ·
`BookingWidget` · `DisplayAd` · footer) ·
**`TicketMap`** (`SeatListingRow` rail · `VenueMap` price pins · `PriceHistogram`) ·
**`HotelCardReserve`** · **`HotelDetailPage`** (gallery · tabs · summary + map · about ·
`RoomsCarousel` · amenities · policies) · **`CheckoutPageExpanded`** (with `CartReview` in
`ticketing` mode, `StepContactInfo`, `StepPayment`, `StepReviewReservation`,
`PoliciesAgreement`) · **`HoldTimerPill`** (fixed bottom-right on the checkout) ·
`AppStepper` · `BundleConfirmation` · `QuantityStepper` ·
`BundleSavingsBadge` — all as shipped, zero overrides and zero source patches. From
`@lib/lib`: `fixtureEvents`, `deriveTiers`, `generateVenueListings`, `listingPins`,
`CONTRACTED_HOTELS`, `walkMinutes`, `hotelCartDetail`, `ticketDetails`, `getAmenities`,
`amenityGroups`.

`CartFlyout` is the one component this app deliberately does **not** mount where it looks
like it should — see [§6](#6-the-nav-is-the-booking-sites-and-the-cart-lives-in-it).

`EventHero`, `TicketTierList` and the standalone `VenueMap` were dropped this round —
`LandingPage` and `TicketMap` replaced them, and `TicketMap` mounts `VenueMap` itself.
`HotelAddOnStep` was dropped earlier in the same round — see below. `TicketQuantityDialog`
is the one component `/experience` mounts on these screens that this app does **not**.
`AppStepper` is mounted flush under the nav (never `JourneyStepper`), with three labels, on
every screen but the landing and the confirmation.

### What had to be local, and why

| | Why not the library's |
| --- | --- |
| `LandingStep` | A wrapper only: `LandingPage` is mounted as shipped. It exists to route the booking widget's **Search** (the library page emits nothing), to hide the *Booking type* dropdown, which offers a flow this app doesn't have, and — since Aug 26 — to swap the hero artwork, which the library hardcodes and exposes no prop for. |
| `TicketMapStep` | A wrapper only: `TicketMap` is mounted as shipped, under `EventBand`. It exists to hide the map's one modal trigger and to re-key the map on the ticket count so a guest returning from the cart sees the count their trip holds. |
| `EventBand` | Nothing in the library is a standalone header band: `LandingPage`'s hero is welded into a whole page, and every other hero belongs to a page that brings its own layout with it. This is the treatment the browse pages use, extracted so the tickets step and the property list share one definition of it rather than two that drift. |
| `HotelPickStep` | Replaces `HotelAddOnStep`, and the reason is one button: its `ContractedHotelCard` ends in an **Add / Added** toggle, so one click put the hotel in the trip at whatever rate the fixture named. With room types that click has to **open a page**, and an "Add" that adds nothing is worse than a different button. `HotelCardReserve` is the booking site's own result card, already ends in *Choose Your Room*, and carries the photo carousel, stars and per-night availability panel the contracted card never had. The two things `HotelAddOnStep` contributed — the event/dates header and the always-visible skip — are twenty lines here. |
| `HotelDetails` | A thin wrapper, because `RoomCardReserve` emits `reserve` with **no payload** and `HotelDetailPage` doesn't forward it: the selection exists nowhere but the card. A sibling prototype reads the room's price out of the DOM; this one matches the clicked card **by position** and reads the room from the same array it rendered from, so the price clicked and the price charged are one object. It also hides the page's two modal triggers. |
| `hotels.js` | The room ladder and the material `HotelDetailPage` renders — address, stars, amenity keys, about copy, policies, coordinates. `CONTRACTED_HOTELS` stays the price source; it is a deliberately thin four-line fixture that three other apps import, and thickening it for this fork would change what they see. |
| `CartAddOns` | Nothing in the library offers extras **one at a time**, and nothing offers them *inside a cart*. `PackageExperiences` renders inclusions welded to a SKU — no price, no add, no remove. It replaced this fork's own `AddOnStep`/`AddOnCard`, deleted with the step they belonged to: the card was built to fill an 820px step and the peek panel is 460px wide with an itemised order above it. |
| `CartPeek` | The library's `CartFlyout` is the obvious fit and misses three times: its body is `CartReview`, which edits a ticket quantity in its own deep copy of the cart — and this panel is now the surface that edits the **real** trip; its footer is one hard-coded *Go to checkout* `q-btn` with no click event and no slot, so it can offer nothing else and say nothing about what it does; and it carries a group-block *time left to book* countdown this flow holds no inventory behind. |
| `TripCartBody` | Not a library gap — a split, and the reason it survives §8 with one caller is that the panel owns chrome (scrim, header, footer, escape, scroll lock) and the body owns money. `BundleCart` is read-only and emits nothing but `checkout`; `CartReview` in `ticketing` mode was closer and stops short twice — its `editableQty` covers ticket and package lines only, so an extra gets no stepper and no remove, and it owns its quantities in local state, so the cart would hold a ticket count the trip never sees. This body owns nothing: every control emits, and `App.vue`'s state is the only copy of the trip. It still mounts the library's `QuantityStepper`. |
| `TripCheckout` | A wrapper only: `CheckoutPageExpanded` is mounted as shipped. It exists to intercept *Book Now* (which the library page doesn't emit), to reshape the cart for the rail (see *Making the checkout rail agree*), to hide the rail's in-place hold countdown, and to mount `HoldTimerPill` in its place. |
| `TripItinerary` | `BundleConfirmation` is the receipt and stays one. Its hotel line has no address and no check-in time, and its extras are priced names with no meeting point. |
| `buildTripCart` | `buildBundleCart()` takes one ticket line plus one optional hotel and derives the totals internally — no seam for extra lines or the credit. Its two reusable pieces, `hotelCartDetail()` and `ticketDetails()`, are imported instead. |

## Source

| Path | What it is |
| --- | --- |
| [`src/App.vue`](src/App.vue) | The six screens, the three steps, the trip state, the nav, and the wiring |
| [`src/hotels.js`](src/hotels.js) | The properties, the room ladder, and the detail-page data |
| [`src/addons.js`](src/addons.js) | The four extras, the unit rules, `buildTripCart()` and `buildCheckoutCart()` |
| [`src/assets/event/`](src/assets/event/) | The supplied Patriots artwork — the 1440×400 @2x hero and the 1440×240 band |
| [`src/components/LandingStep.vue`](src/components/LandingStep.vue) | Step 0 — the landing page, and the Search that starts the trip |
| [`src/components/EventBand.vue`](src/components/EventBand.vue) | The Patriots header band — shared by the tickets step and the property list |
| [`src/components/TicketMapStep.vue`](src/components/TicketMapStep.vue) | Step 1 — the event band and the ticket map (tickets **and** seats) |
| [`src/components/HotelPickStep.vue`](src/components/HotelPickStep.vue) | Step 2a — the property list |
| [`src/components/HotelDetails.vue`](src/components/HotelDetails.vue) | Step 2b — the full hotel page and the room click |
| [`src/components/TripCartBody.vue`](src/components/TripCartBody.vue) | The lines, their controls, the extras picker and the totals |
| [`src/components/CartAddOns.vue`](src/components/CartAddOns.vue) | The extras, sold from inside the cart — the deleted Extras step |
| [`src/components/CartPeek.vue`](src/components/CartPeek.vue) | **THE CART** — the slide-over, the one sanctioned overlay, and the only place the trip is edited |
| [`src/components/TripCheckout.vue`](src/components/TripCheckout.vue) | Step 3 — the expanded checkout, which **is** the Review step, plus the pinned hold timer |
| [`src/components/TripItinerary.vue`](src/components/TripItinerary.vue) | Combined trip details under the receipt |
| [`src/deeplink.js`](src/deeplink.js) | The query string ⇄ the trip |

## Run it

```bash
cd tickets-first && node ../node_modules/vite/bin/vite.js --port 6800
```

No install needed — deps resolve up the tree to the repo's `node_modules`.

## Deep links

The whole trip lives in the query string (`screen`, `tier`, **`seat`**, `qty`, `hotel`,
`room`, `addons`, `cars`), so any screen can be linked to in a review rather than clicked to.

- [Step 1 · the ticket map](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=tickets) — 60 listings, one price pin each
- [Step 2a · the property list](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=hotel&tier=club&qty=2)
- [Step 2b · the Westin's full page and its rooms](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=hotelDetails&tier=club&qty=2&hotel=westin)
- [Step 3 · **Review — the checkout**](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=checkout&tier=club&qty=2&hotel=westin&addons=parking,tailgate) — every section open, one submit, the stepper lit on *Review*, the hold pinned bottom-right — $1,446
- [Step 3 · **the old cart link**](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=cart&tier=club&qty=2&hotel=westin&addons=parking,tailgate) — `screen=cart` lands on the checkout, which is the review now. Same trip, same $1,446; the cart button opens the peek to edit it
- [Step 3 · **the old extras link**](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=extras&tier=club&qty=2&hotel=westin) — `screen=extras` follows `cart` to the checkout; the offers it was written for are one cart-button click away, in the peek's picker
- [Step 3 · the hotel skipped](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=extras&tier=club&qty=2&addons=) — no stay, so the rail loses it and the peek's transfer explains itself and offers a hotel
- [Step 3 · **a real seat off the map**](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=cart&seat=L38-CL7-7&qty=2&hotel=westin&addons=parking,tailgate) — Section CL7, Row 7 at $418 — $1,595
- [Step 3 · the same trip in the suite](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=cart&tier=club&qty=2&hotel=westin&room=suite&addons=parking,tailgate) — $1,529
- [Step 3 · four guests, every extra, two cars](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=cart&tier=club&qty=4&hotel=westin&addons=parking,tailgate,transfer,hospitality&cars=2) — $3,242, and an empty picker in the peek
- [Step 3 · tickets only](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=cart&tier=club&qty=2) — no hotel, no extras — $912; the rail loses the stay and the credit with it
- [Step 4 · confirmed, with the itinerary](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=confirm&tier=club&qty=2&hotel=westin&room=queens&addons=parking,tailgate) — no stepper, no cart button, no countdown

`seat` is the one key this round added. It names one listing off the ticket map and
**supersedes `tier`**, because a listing knows its own level, section, row and price; a seat
id that resolves to nothing (a stale link, a different board) falls back to whatever `tier`
said rather than failing the link. That is why every link above written before the map
existed still prices the trip it always priced — `tier=club&qty=2` is still $1,446.

A `cart`, `checkout` or `confirm` link that names no `tier` and no `seat` defaults to Club —
the same fallback the tickets step uses. A `room` that the named property doesn't sell falls
back to its contracted block room rather than pricing nothing, and a `hotelDetails` link with
no hotel lands on the list rather than on a blank page.

Four screen names have been renamed or removed across this round, and links to all four are
already out in READMEs and review threads, so all four are remapped rather than ignored:

| Link | Lands on | Because |
| --- | --- | --- |
| `screen=event` | `landing` | the intro card became the library's `LandingPage` |
| `screen=seats` | `tickets` | the seats screen folded into the ticket map |
| **`screen=cart`** | **`checkout`** | the cart page is deleted and the **Review step is the checkout**, so the checkout is what a `?screen=cart` link was asking for: the order stated in full, with a way to pay for it. The trip it names is still editable — the cart button on that screen opens the peek |
| **`screen=extras`** | **`checkout`** | re-pointed off `cart` with it. It has moved twice — step → cart page → here — and the offers a reviewer followed it for are one cart-button click away, in the peek's picker |

**No state key changed — not when the extras moved, and not when the cart did.** `tier=`,
`seat=`, `qty=`, `hotel=`, `room=`, `addons=` and `cars=` are read and written exactly as
before, so every link above restores the same trip at the same price it always did;
`addons=` with an empty value still means an explicit *none*, which is how a
deliberately-extras-free link differs from one that never said.

## Still open

- **The listings are synthetic.** The seat the guest picks now reaches the cart, the rail
  and the itinerary, but the board itself is generated (deterministically) from the event —
  Ticketmaster's Discovery API returns no per-seat inventory, and real seat selection is its
  Presence SDK, not this prototype's bowl. The view-from-seat photos are stock.
- **The map's quantity doesn't check availability.** Each listing carries a
  `quantityAvailable`, and nothing stops a guest asking for eight tickets from a listing
  that has three.
- **One night, one room.** The stay is fixed at Dec 5 → Dec 6 and a party of four books one
  room of the type they chose. Rooms now say their max occupancy, but nothing stops six
  guests booking a king — the room-count-from-occupancy logic [Option D](../option-d) works
  out isn't wired in here.
- **The checkout form doesn't validate.** Every field is real and controlled, but *Book Now*
  is never disabled: this prototype is about what the page asks for, not about what it
  refuses.
- **Extras are a flat list of four.** With a dozen they'd want grouping (getting there /
  before the game / at your seat), and inside a 460px peek panel that list is the part of
  the cart that would start to scroll before the totals do.
- **The peek doesn't announce what it added.** Add a tailgate from the flyout and the line
  appears above and the total moves; there is no toast, no highlight, nothing that draws the
  eye to the row that changed. That mattered less when a 560px cart screen was the surface
  of record; in a 460px panel where the picker and the totals are both in view — and which
  is now the **only** place the trip is edited — it is the change most worth flagging.
- **The peek is the only editor, and it has no history.** Remove a room by mistake and there
  is no undo; the way back is to reopen the hotel step and reserve it again. On a page with
  a Back button that was survivable, and in a panel that closes itself it is one click of
  regret.
