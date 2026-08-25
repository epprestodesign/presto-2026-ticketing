# Aug 25 — Tickets First

**Edge case #1 of the Aug 25 round: sports event → tickets → hotel → add-on.**
A Patriots game at Gillette, bought the way a fan actually assembles the day — seats
first, then somewhere to sleep, then the extras around kickoff — reviewed in **one cart**,
**paid for in one form**, and confirmed as **one trip**.

Forked from [`/bundle`](../bundle) on **August 25, 2026**. Like every prototype here it's a
self-contained Vite app importing the **real library components** via the `@lib` alias —
nothing is copied or forked from the library, and no library file is changed.

Deployed at `https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/`
(local dev on port **6800**).

## The flow

```
Event ─▶ Tickets ─▶ Seats ─▶ Hotel ──────────────▶ Extras ─▶ Review ─▶ Checkout ─▶ Confirmed
 hero     tier +    venue    list ─▶ detail page    parking    one      contact      receipt
          qty        map     card    rooms · gallery tailgate   cart     payment     + itinerary
                              │      amenities       transfer     ▲      one form
                              │      policies        hospitality  │
                              └── skip ──────────────────────────┘  (extras still offered;
                                                                     the transfer isn't)
```

`/bundle` stopped at **Hotel → Cart**. This fork added the **Extras** step; the **Aug 25
feedback round** added the two things below.

## Aug 25 · what changed, and why

### 1. There is a checkout now

> *"Can there be a checkout? Like, I want to pay."*

The cart used to hand straight to the confirmation. Nothing in the flow ever asked for a
name or a card — a review screen with a button labelled *Checkout* that skipped checkout.
Between them now sits the library's **`CheckoutPageExpanded`** in `mode="ticketing"`,
collecting contact details and payment and ending in one **Book Now**.

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
- **Editing stops here.** `CartReview` turns any line carrying a `unitPrice` into a
  control, and it edits its own deep copy of the cart — so an editable rail would move a
  number the trip never sees. The checkout's lines carry amounts only, and the way back to
  the one surface that owns those numbers is a link: *Back to your trip*.

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

### 3. No modal pop-ups. Anywhere.

> *"We almost never are going to want those modal pop-ups, we're always going to want a
> clean page."*

Every step in this app is a page, and both new screens arrived as pages. The library's
hotel detail page ships **two** pop-up triggers of its own — a room card's *Price Details ›*
(a `DsModal`) and the gallery's *See all N photos* — and both are **hidden** in
`HotelDetails.vue` rather than removed from the library, which is read-only. Nothing in
this app can open a dialog. It costs the photo grid (the mosaic still shows five) and a
price breakdown that is one night at one rate, which the room card already states twice.

## What was preserved

The decisions the last round praised are untouched.

### Extras come **after** the hotel

The **Round-Trip Stadium Transfer** departs from the hotel lobby. With no hotel in the trip
there is nowhere for it to leave from — so the offer itself depends on an answer only the
hotel step can give. That ordering is the reason the edge case is written
tickets → hotel → add-on and not tickets → add-on → hotel.

When the hotel step is skipped, that card renders **explained and disabled** rather than
missing:

> Needs a hotel — the coach leaves from your lobby

Hiding it would leave a guest who skipped the hotel wondering why their screen had three
cards and someone else's had four. The same rule runs in reverse: **removing the hotel from
the cart drops the transfer with it**.

### Quantity is never a free-floating number

| Extra | Unit | Quantity is |
| --- | --- | --- |
| Prepaid Gameday Parking | vehicle | its own count (1–4), set on the card |
| Ultimate Tailgate Party | guest | **the ticket count** |
| Round-Trip Stadium Transfer | guest | **the ticket count** |
| Pregame Hospitality Club | guest | **the ticket count** |

Per-guest extras have no stepper of their own, on either the card or the cart line. Four
tickets buy four wristbands; a control that let them drift apart would let someone buy
three hospitality passes for four people, which the venue wouldn't honour anyway. Parking
is the exception because cars don't follow headcount.

### The cart is editable, per line

```
TICKETS          Change seats
  Club Level ticket        [− 2 +]   $359 each          $718
YOUR STAY        Change hotel or room
  The Westin · Deluxe King  🗑 Remove                    $289
GAMEDAY EXTRAS   Edit extras
  Prepaid Gameday Parking  [🗑 1 +]                       $65
  Ultimate Tailgate Party   🗑 Remove   $95 each         $190
```

One Edit link per **section**, not per line. Everything reversible in place (a count, a
removal) is in place; everything that means re-choosing is a link back to the screen that
chooses it — and since Aug 25 the stay's link goes to the property's **detail page**, where
the room is one click away and the property is two.

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
tickets   = tier face value × ticket count
stay      = CHOSEN ROOM's nightly rate × 1 night
extras    = Σ (unit price × units)        units = ticket count, or the vehicle count
subtotal  = tickets + stay + extras
credit    = round(10% × (stay + extras))  ← the contracted parts only
fees      = round(18% × tickets)          ← ticketing service fee, tickets only
taxes     = round(9% × (subtotal − credit))
TOTAL     = subtotal − credit + fees + taxes
```

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
room, less the credit on it, plus tax on what's left. The cart, the checkout rail and the
confirmation agree to the dollar in every combination, including with the hotel skipped,
the extras skipped, or both.

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

`EventHero` · `TicketTierList` · `VenueMap` · **`HotelCardReserve`** ·
**`HotelDetailPage`** (gallery · tabs · summary + map · about · `RoomsCarousel` ·
amenities · policies) · **`CheckoutPageExpanded`** (with `CartReview` in `ticketing` mode,
`StepContactInfo`, `StepPayment`, `StepReviewReservation`, `PoliciesAgreement`) ·
`JourneyStepper` · `BundleConfirmation` · `QuantityStepper` · `BundleSavingsBadge` — all as
shipped, zero overrides and zero source patches. From `@lib/lib`: `fixtureEvents`,
`deriveTiers`, `gillettePins`, `CONTRACTED_HOTELS`, `walkMinutes`, `hotelCartDetail`,
`ticketDetails`, `getAmenities`, `amenityGroups`.

`HotelAddOnStep` was dropped this round — see below.

### What had to be local, and why

| | Why not the library's |
| --- | --- |
| `HotelPickStep` | Replaces `HotelAddOnStep`, and the reason is one button: its `ContractedHotelCard` ends in an **Add / Added** toggle, so one click put the hotel in the trip at whatever rate the fixture named. With room types that click has to **open a page**, and an "Add" that adds nothing is worse than a different button. `HotelCardReserve` is the booking site's own result card, already ends in *Choose Your Room*, and carries the photo carousel, stars and per-night availability panel the contracted card never had. The two things `HotelAddOnStep` contributed — the event/dates header and the always-visible skip — are twenty lines here. |
| `HotelDetails` | A thin wrapper, because `RoomCardReserve` emits `reserve` with **no payload** and `HotelDetailPage` doesn't forward it: the selection exists nowhere but the card. A sibling prototype reads the room's price out of the DOM; this one matches the clicked card **by position** and reads the room from the same array it rendered from, so the price clicked and the price charged are one object. It also hides the page's two modal triggers. |
| `hotels.js` | The room ladder and the material `HotelDetailPage` renders — address, stars, amenity keys, about copy, policies, coordinates. `CONTRACTED_HOTELS` stays the price source; it is a deliberately thin four-line fixture that three other apps import, and thickening it for this fork would change what they see. |
| `AddOnStep` / `AddOnCard` | Nothing in the library offers extras **one at a time**. `PackageExperiences` renders inclusions welded to a SKU — no price, no add, no remove. |
| `TripCart` | `BundleCart` is read-only and emits nothing but `checkout`. `CartReview` in `ticketing` mode was closer and stops short twice: its `editableQty` covers ticket and package lines only, so an extra gets no stepper and no remove; and it owns its quantities in local state, so the extras step and the cart would each hold a private ticket count. `TripCart` owns nothing — every control emits. It still mounts `QuantityStepper` and `BundleSavingsBadge`. |
| `TripCheckout` | A wrapper only: `CheckoutPageExpanded` is mounted as shipped. It exists to intercept *Book Now* (which the library page doesn't emit) and to reshape the cart for the rail — see *Making the checkout rail agree*. |
| `TripItinerary` | `BundleConfirmation` is the receipt and stays one. Its hotel line has no address and no check-in time, and its extras are priced names with no meeting point. |
| `buildTripCart` | `buildBundleCart()` takes one ticket line plus one optional hotel and derives the totals internally — no seam for extra lines or the credit. Its two reusable pieces, `hotelCartDetail()` and `ticketDetails()`, are imported instead. |

## Source

| Path | What it is |
| --- | --- |
| [`src/App.vue`](src/App.vue) | The nine screens, the trip state, and the wiring |
| [`src/hotels.js`](src/hotels.js) | The properties, the room ladder, and the detail-page data |
| [`src/addons.js`](src/addons.js) | The four extras, the unit rules, `buildTripCart()` and `buildCheckoutCart()` |
| [`src/components/HotelPickStep.vue`](src/components/HotelPickStep.vue) | Step 3a — the property list |
| [`src/components/HotelDetails.vue`](src/components/HotelDetails.vue) | Step 3b — the full hotel page and the room click |
| [`src/components/AddOnStep.vue`](src/components/AddOnStep.vue) | Step 4 — the extras, and the running tally |
| [`src/components/AddOnCard.vue`](src/components/AddOnCard.vue) | One extra |
| [`src/components/TripCart.vue`](src/components/TripCart.vue) | Step 5 — three sections, editable lines |
| [`src/components/TripCheckout.vue`](src/components/TripCheckout.vue) | Step 6 — the expanded checkout |
| [`src/components/TripItinerary.vue`](src/components/TripItinerary.vue) | Combined trip details under the receipt |
| [`src/deeplink.js`](src/deeplink.js) | The query string ⇄ the trip |

## Run it

```bash
cd tickets-first && node ../node_modules/vite/bin/vite.js --port 6800
```

No install needed — deps resolve up the tree to the repo's `node_modules`.

## Deep links

The whole trip lives in the query string (`screen`, `tier`, `qty`, `hotel`, `room`,
`addons`, `cars`), so any screen can be linked to in a review rather than clicked to.

- [Step 3a · the property list](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=hotel&tier=club&qty=2)
- [Step 3b · the Westin's full page and its rooms](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=hotelDetails&tier=club&qty=2&hotel=westin)
- [Step 4 · extras, with a hotel in the trip](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=extras&tier=club&qty=2&hotel=westin)
- [Step 4 · extras with the hotel skipped](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=extras&tier=club&qty=2&addons=) — the transfer explains itself
- [Step 5 · the full cart](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=cart&tier=club&qty=2&hotel=westin&addons=parking,tailgate) — $1,446
- [Step 5 · the same trip in the suite](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=cart&tier=club&qty=2&hotel=westin&room=suite&addons=parking,tailgate) — $1,529
- [Step 5 · four guests, every extra, two cars](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=cart&tier=club&qty=4&hotel=westin&addons=parking,tailgate,transfer,hospitality&cars=2) — $3,242
- [Step 5 · tickets only](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=cart&tier=club&qty=2) — no hotel, no extras — $912
- [Step 6 · the expanded checkout](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=checkout&tier=club&qty=2&hotel=westin&addons=parking,tailgate) — every section open, one submit
- [Step 6 · checkout, tickets only](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=checkout&tier=club&qty=2) — the rail loses the stay and the credit with it
- [Step 7 · confirmed, with the itinerary](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=confirm&tier=club&qty=2&hotel=westin&room=queens&addons=parking,tailgate)

A `cart`, `checkout` or `confirm` link that names no `tier` defaults to Club — the same
fallback the tickets step uses. A `room` that the named property doesn't sell falls back to
its contracted block room rather than pricing nothing, and a `hotelDetails` link with no
hotel lands on the list rather than on a blank page.

## Still open

- **The seats step doesn't feed the cart.** `VenueMap` picks a seat, but the ticket line
  still says `Section CL10, Row 12` — the same placeholder `/bundle` uses. Real seat
  selection is Ticketmaster's Presence SDK, not this prototype's synthetic bowl.
- **One night, one room.** The stay is fixed at Dec 5 → Dec 6 and a party of four books one
  room of the type they chose. Rooms now say their max occupancy, but nothing stops six
  guests booking a king — the room-count-from-occupancy logic [Option D](../option-d) works
  out isn't wired in here.
- **The checkout form doesn't validate.** Every field is real and controlled, but *Book Now*
  is never disabled: this prototype is about what the page asks for, not about what it
  refuses.
- **Extras are a flat list of four.** With a dozen they'd want grouping (getting there /
  before the game / at your seat) or the whole step becomes a menu.
