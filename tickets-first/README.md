# Aug 25 — Tickets First

**Edge case #1 of the Aug 25 round: sports event → tickets → hotel → add-on.**
A Patriots game at Gillette, bought the way a fan actually assembles the day — seats
first, then somewhere to sleep, then the extras around kickoff — reviewed in **one cart**
and confirmed as **one trip**.

Forked from [`/bundle`](../bundle) on **August 25, 2026**. Like every prototype here it's a
self-contained Vite app importing the **real library components** via the `@lib` alias —
nothing is copied or forked from the library, and no library file is changed.

Deployed at `https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/`
(local dev on port **6800**).

## The flow

```
Event ──▶ Tickets ──▶ Seats ──▶ Hotel ──▶ Extras ──▶ Review ──▶ Confirmed
 hero      tier +      venue     partner   parking     one       receipt
           qty          map      block     tailgate    cart      + itinerary
                                   │       transfer      ▲
                                   │       hospitality   │
                                   └── skip ─────────────┘  (extras still offered;
                                        the transfer isn't)
```

`/bundle` stopped at **Hotel → Cart**. What this fork adds is the **Extras** step and the
consequences of having one: a cart with six possible lines instead of two, and a
confirmation that has to say *where to be*, not just *what was charged*.

## What's new, and why

### Extras are a step, not a checkbox strip in the cart

They are four independent purchases with prices, meeting points and times — a tailgate
that opens at 1:25 PM, a coach that leaves the hotel lobby at 2:00. Compressed into a row
of checkboxes above the total, none of that fits, and the guest is being asked to decide
at the moment they were trying to stop deciding. As a step they get the same card, price
line and Add/Added toggle the hotel step uses, and the same always-visible skip.

### Extras come **after** the hotel

The **Round-Trip Stadium Transfer** departs from the hotel lobby. With no hotel in the
trip there is nowhere for it to leave from — so the offer itself depends on an answer only
the hotel step can give. That ordering is the reason the edge case is written
tickets → hotel → add-on and not tickets → add-on → hotel.

When the hotel step is skipped, that card renders **explained and disabled** rather than
missing:

> Needs a hotel — the coach leaves from your lobby

Hiding it would leave a guest who skipped the hotel wondering why their screen had three
cards and someone else's had four. Saying why turns a missing option into a reason to go
back one step.

The same rule runs in reverse: **removing the hotel from the cart drops the transfer with
it**. The cart already refuses to price a transfer with no hotel, so leaving it in state
would bill correctly — it would just read `Added` on the extras screen while contributing
nothing, and reappear on the bill the moment a hotel was chosen again.

### Quantity is never a free-floating number

| Extra | Unit | Quantity is |
| --- | --- | --- |
| Prepaid Gameday Parking | vehicle | its own count (1–4), set on the card |
| Ultimate Tailgate Party | guest | **the ticket count** |
| Round-Trip Stadium Transfer | guest | **the ticket count** |
| Pregame Hospitality Club | guest | **the ticket count** |

Per-guest extras have no stepper of their own, on either the card or the cart line. Four
tickets buy four wristbands; a control that let them drift apart would let someone buy
three hospitality passes for four people, which the venue wouldn't honour anyway. Changing
the **ticket** quantity in the cart re-prices all three of them at once, and each card and
cart line says out loud which number it's following (`4 guests — matches your tickets`) so
the re-price never looks arbitrary.

Parking is the exception because cars don't follow headcount: four people can arrive in
one car or in three.

### The cart is editable, per line

Tickets, the stay and each extra are separate lines under three headings, each heading
carrying one **Edit** link back to the step that owns it:

```
TICKETS          Change seats
  Club Level ticket        [− 2 +]   $359 each          $718
YOUR STAY        Change hotel
  The Westin · Deluxe King  🗑 Remove                    $289
GAMEDAY EXTRAS   Edit extras
  Prepaid Gameday Parking  [🗑 1 +]                       $65
  Ultimate Tailgate Party   🗑 Remove   $95 each         $190
```

One Edit link per **section**, not per line — under Extras a per-line link would repeat
the same destination up to four times. Everything reversible in place (a count, a removal)
is in place; everything that means re-choosing (a different hotel, different seats) is a
link back to the screen that chooses it.

### The confirmation is a receipt **and** an itinerary

The library's `BundleConfirmation` is mounted as shipped and keeps its job: order number,
line items, total charged, and the v1 dual-email notice. Below it sits a second card
answering the question a guest actually opens this page with a week later — *where do I go,
and when?* — ordered the way the day happens:

```
THE NIGHT BEFORE   The Westin · Deluxe King
                   1 Patriot Pl, Foxborough · check-in Fri 3:00 PM
BEFORE THE GAME    Ultimate Tailgate Party · Lot 22 · opens 1:25 PM
                   Prepaid Gameday Parking · Lot 6 · lots open 12:25 PM
KICKOFF            Patriots v Bills · Gillette Stadium · Sun 4:25 PM
                   2 × Club Level · Section CL10, Row 12
```

It invents nothing: the stay block reads the library's own `hotelCartDetail()` off the
hotel cart line, and each extra's note is the one from `addons.js`. Skipping the hotel
doesn't remove the block — it says *"No hotel on this order — you're arriving on
gameday,"* because a gap where a hotel would be reads as a bug.

## How it's priced

```
tickets   = tier face value × ticket count
stay      = nightly rate × 1 night
extras    = Σ (unit price × units)        units = ticket count, or the vehicle count
subtotal  = tickets + stay + extras
credit    = round(10% × (stay + extras))  ← the contracted parts only
fees      = round(18% × tickets)          ← ticketing service fee, tickets only
taxes     = round(9% × (subtotal − credit))
TOTAL     = subtotal − credit + fees + taxes
```

Two decisions inside that:

- **The credit skips the tickets.** Face value is set by the team and never discounted, so
  a guest comparing the ticket line against Ticketmaster finds the same number. Folding it
  into one blended percentage would have hidden that.
- **The credit is deducted, not struck through.** It comes off before taxes are charged,
  so a guest adding the column up by hand lands on the same total. A "was $1,316" that
  never left the total is a different — and worse — claim.

Worked example: **2 Club tickets, The Westin, tailgate + parking**

| | |
| --- | --- |
| 2 × Club Level @ $359 | $718 |
| The Westin · 1 night | $289 |
| Parking · 1 vehicle @ $65 | $65 |
| Tailgate · 2 guests @ $95 | $190 |
| Subtotal | **$1,262** |
| Bundle credit (10% of $544) | −$54 |
| Service fees (18% of $718) | $129 |
| Taxes (9% of $1,208) | $109 |
| **Total** | **$1,446** |

Prototype economics, deterministic — no `Math.random`, no `Date.now` — so a demo shows the
same numbers every time. Ticket prices come from the library's own `deriveTiers()` on the
real Patriots v Bills fixture; hotel rates from `CONTRACTED_HOTELS`.

## Library components mounted

`EventHero` · `TicketTierList` · `VenueMap` · `HotelAddOnStep` (with
`ContractedHotelCard`) · `JourneyStepper` · `BundleConfirmation` · `QuantityStepper` ·
`BundleSavingsBadge` — all as shipped, zero overrides and zero source patches. From
`@lib/lib`: `fixtureEvents`, `deriveTiers`, `gillettePins`, `CONTRACTED_HOTELS`,
`hotelCartDetail`, `ticketDetails`.

### What had to be local, and why

| | Why not the library's |
| --- | --- |
| `AddOnStep` / `AddOnCard` | Nothing in the library offers extras **one at a time**. `PackageExperiences` renders inclusions welded to a SKU — no price, no add, no remove. The cards are built to `ContractedHotelCard`'s skeleton so the two steps read as one flow, with an icon tile where the hotel puts a photo: an extra is a service, and stock photography of a parking lot tells a guest nothing they can act on. |
| `TripCart` | `BundleCart` is a read-only summary — it emits nothing but `checkout`, which is right for two lines and wrong for six. `CartReview` in `ticketing` mode was the closer candidate and stops short twice: its `editableQty` covers ticket and package lines only, so an extra gets no stepper and no remove; and it owns its quantities in local state, so the extras step and the cart would each hold a private ticket count and the per-guest extras would follow whichever was edited last. `TripCart` owns nothing — every control emits, and `App.vue` holds the only copy of the trip. It still mounts the library's `QuantityStepper` and `BundleSavingsBadge`. |
| `TripItinerary` | `BundleConfirmation` is the receipt and stays one. Its hotel line reads *"The Westin · Deluxe King · 1 night"* with no address and no check-in time, and its extras are priced names with no meeting point. |
| `buildTripCart` | The library's `buildBundleCart()` takes one ticket line plus one optional hotel and derives subtotal/fees/taxes/total internally — no seam for extra lines or the credit. Rebuilding the totals around it would leave two functions computing the same total from different inputs. Its two reusable pieces, `hotelCartDetail()` and `ticketDetails()`, are imported instead. |

## Source

| Path | What it is |
| --- | --- |
| [`src/App.vue`](src/App.vue) | The seven screens, the trip state, and the wiring |
| [`src/addons.js`](src/addons.js) | The four extras, the unit rules, and `buildTripCart()` |
| [`src/components/AddOnStep.vue`](src/components/AddOnStep.vue) | Step 4 — the extras, and the running tally |
| [`src/components/AddOnCard.vue`](src/components/AddOnCard.vue) | One extra |
| [`src/components/TripCart.vue`](src/components/TripCart.vue) | The one cart — three sections, editable lines |
| [`src/components/TripItinerary.vue`](src/components/TripItinerary.vue) | Combined trip details under the receipt |
| [`src/deeplink.js`](src/deeplink.js) | The query string ⇄ the trip |

## Run it

```bash
cd tickets-first && node ../node_modules/vite/bin/vite.js --port 6800
```

No install needed — deps resolve up the tree to the repo's `node_modules`.

## Deep links

The whole trip lives in the query string (`screen`, `tier`, `qty`, `hotel`, `addons`,
`cars`), so any screen can be linked to in a review rather than clicked to.

- [Step 4 · extras, with a hotel in the trip](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=extras&tier=club&qty=2&hotel=westin)
- [Step 4 · extras with the hotel skipped](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=extras&tier=club&qty=2&addons=) — the transfer explains itself
- [Step 5 · the full cart](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=cart&tier=club&qty=2&hotel=westin&addons=parking,tailgate) — $1,446
- [Step 5 · four guests, every extra, two cars](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=cart&tier=club&qty=4&hotel=westin&addons=parking,tailgate,transfer,hospitality&cars=2) — $3,242
- [Step 5 · tickets only](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=cart&tier=club&qty=2) — no hotel, no extras
- [Step 6 · confirmed, with the itinerary](https://epprestodesign.github.io/presto-2026-ticketing/tickets-first/?screen=confirm&tier=club&qty=2&hotel=westin&addons=parking,tailgate)

A `cart` or `confirm` link that names no `tier` defaults to Club — the same fallback the
tickets step uses — so no link ever lands on an empty cart.

## Still open

- **The seats step doesn't feed the cart.** `VenueMap` picks a seat, but the ticket line
  still says `Section CL10, Row 12` — the same placeholder `/bundle` uses. Real seat
  selection is Ticketmaster's Presence SDK, not this prototype's synthetic bowl.
- **Extras are a flat list of four.** With a dozen they'd want grouping (getting there /
  before the game / at your seat) or the whole step becomes a menu.
- **One night, one room.** The stay is fixed at Dec 5 → Dec 6, and a party of four books
  the same one room — the room-count-from-occupancy logic [Option D](../option-d) works out
  isn't wired in here.
