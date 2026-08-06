# Aug 5 - Option D — Two hotels, one package

The **August 5 feedback response**. [Option C](../option-c) answered the Aug 4 feedback
with a six-tile board; Aug 5 cut that down to the single decision that actually matters
for a pre-invited group: *where do you want to stay?*

Forked from Option C on **August 5, 2026**. Like every prototype here it's a
self-contained Vite app importing the **real library components** via the `@lib` alias —
nothing is copied or forked from the library, and no library file is changed.

Deployed at `https://epprestodesign.github.io/presto-2026-ticketing/option-d/`
(local dev on port **6700**).

## The flow

```
Packages ─── Select & Check Out ────────────▶ Checkout ──▶ Confirmation
(landing)                                        ▲  ▲
 two tiles,                                      │  │
 one per hotel ─ View package details ──▶ Package details ─ Select ─┘
      │                                    the library's template  │
      └─ hotel NAME ──▶ Hotel Details ─ Select package ────────────┘
                        (new tab)
```

**The packages page is the landing page**, and it can also be the last page before
checkout. There is no headcount screen in front of it — the party size sits on each card,
above the price it drives — and no stepper above it, because a progress bar over a landing
page is orientation for progress not yet made. The stepper appears once a package has been
opened or chosen.

**Two ways out of a card.** `Select & Check Out` goes straight to Review.
`View package details` opens the library's own `PackageDetailPage` — gallery, full
inclusions, policies — and that page's Select CTA continues to the same place. The detail
page is a *longer route through* the decision, not a gate in front of it.

Hotel details is still **not a step** — it opens in its own tab from any mention of a
hotel, so the screen behind it keeps its state. It is no longer a *dead end*, though: its
room card selects the package too, and selecting there continues in that tab.

## What the feedback asked for

### August 5, morning

| Feedback | How Option D answers it |
| --- | --- |
| Landing looks too much like Presto | No hero, no search band — the landing page is the package pair under a compact event strip. |
| Remove the check-in/check-out/guests bar | No booking widget on any screen. The stay is fixed. |
| A simple "how many people are coming" prompt | A party-size control on each package card, above the price it drives. |
| Pre-invited for two days — keep it minimal | A fixed two-night stay; nothing offers to change it. |
| Packages page above the fold | A ~90px event strip, then the tiles. It is now screen **1**. |
| Two tiles side by side only, one per hotel | Exactly two, in a fixed 2-column track. |
| Contents identical; only the hotel differs | Same tickets, transportation, hospitality and nights on both. |
| Name each by hotel | **Westin Package** · **Ritz-Carlton Package** |
| Each includes two tickets, transportation, etc. | Tickets scale with headcount; transportation and hospitality on both. |

### August 5, afternoon

| Feedback | How Option D answers it |
| --- | --- |
| Prefer the party-size selector **on the card**, not at page level | Moved onto both cards, directly above the price. Still one number — see below. |
| Don't make me open a second page to select and check out | `Select & Check Out` on the card goes straight to Review. |
| Keep the drill-in for when I *do* want the detail | `View package details` sits beside it, and that page is unchanged. |
| On a hotel page, make "Price Details" a **Select package** action | The room card now selects that hotel's package, with the same experience the package cards give. |
| Same on **both** hotel pages | One card, driven by the active hotel — Westin and Ritz-Carlton behave identically. |

### August 6

| Feedback | How Option D answers it |
| --- | --- |
| "View package details" should show **only the package I picked** | The detail page carries one package, not both. |
| Checkout should be **one form**, not a Next button revealing each section | Checkout mounts `CheckoutPageExpanded` — every section open, one submit. |

## Why the party size is on the card

It was in the page header on the argument that one number pricing two cards should be
stated once. That is true and it was still the wrong place: you adjusted at the top of the
page and the effect happened 400px below, on both tiles at once. Cause and effect were on
different parts of the screen.

There is still exactly **one** party size. Both controls bind to the same store value
(`:people` in, `update:people` out — no local copy), so setting it on either card re-prices
both. Two controls, one number: a mirror, not a fork.

The duplication the header was avoiding — two cards appearing to disagree — is handled by
saying what the number bought *on that card*:

```
Westin      7 people →  7 tickets · 4 rooms   (Deluxe King sleeps 2)
Ritz        7 people →  7 tickets · 2 rooms   (Carlton Suite sleeps 4)
```

Same party, different room counts, because occupancy differs. That line sits under the
control that caused it, which is the one place it explains the price.

## Why the card can check out

The card used to only open the detail page: the decision belonged to the template, and the
card was a summary of it. That reads well for a guest still choosing, and badly for a guest
who has already chosen — they had to load a second screen to press a second button that
took them where the first one implied.

So the direct route is now the filled CTA, and the drill-in is the outline button beside
it. Both call the same `selectPackage()`, because they are the same act. What the detail
page loses is only its monopoly; someone who wants the gallery and the policies still gets
them, and still selects from there.

## Why the detail page shows one package

It used to hand the template both, with the clicked one leading, so a reader
could switch without going back a screen. In practice that meant **"View package
details" opened something other than what was asked for**: you press the button
on the Westin card and land on a page showing the Westin *and* the Ritz, which
re-opens a decision you had already made.

The board is where the two are compared — that is its whole job, and it is one
click away via the template's own back link. This page answers a narrower
question: *tell me about this one.*

Two consequences worth noting:

- The **About** copy used to open "Both packages carry exactly the same
  inclusions…", which only parsed with both on the page. It now describes the
  package you opened and names the other as the alternative waiting on the board.
- The template's packages-section subtitle ("…Select a package for a quick view")
  is hidden — with one package there is nothing to select among, so the sentence
  invited an action the page no longer offers.

## Why checkout is one form

Checkout mounted `CheckoutPage`, whose left column is a stepped accordion: one
section open, a **Next** button to advance, completed sections collapsing behind
an *Edit* link. It now mounts **`CheckoutPageExpanded`** — every section open at
once, all fields in their input state, and a single **Book Now** at the bottom.

```
1  Enter contact information
2  Add a payment method
3  Review your order        (Protect your stay)
4  Policies
   [ Book Now ]
```

The **rail is untouched**: same sticky cart, same in-rail countdown, same order
summary. Only the left column changed.

`CheckoutPageExpanded` is a library component, ported from presto-2026 (where it
backs the *Checkout Experience Expanded* category) and extended with this fork's
`ticketing` mode, which that repo predates. See [Storybook →
Checkout Experience Expanded](../src/stories/checkout/CheckoutPageExpanded.stories.js).

## Why the hotel page can select a package

"Room types at this property" used to end in a `Price Details` link and nothing else — the
template's per-room *Reserve Room* CTA was suppressed, because the booking decision
belonged to the other tab. That made the page a dead end: you could read everything about a
hotel and still have to go back to act on it.

The room card now selects that hotel's package, carrying the package cards' footer
verbatim — the same party-size select bound to the same store value, the same price block,
a primary CTA, and `Price details` demoted to the secondary link beside it.

Four decisions inside that:

| | |
| --- | --- |
| **Where it lands** | This tab goes to checkout. The tab it was opened from stays on the board, untouched — you end up where you were reading, and nothing you left is lost. |
| **Which price** | The **package total, all in** — what checkout charges. A `$578` button landing on a `$3,091` checkout would read as a bait-and-switch. The room rate survives as a sub-line. |
| **Party size** | The same control as the cards, bound to the same value, so it re-prices here and on the board alike. |
| **Price details** | Kept, and rewritten to break down the *package* — the four inclusions, then the bundle discount. The library's `PriceDetailsDialog` itemises a **room**, and would have totalled a different number than the button above it. |

### What is still the library's

The section around the card — heading, subtitle, rules — is still `RoomsCarousel`. Only its
grid of room cards is suppressed, and Option D's card is **teleported into `#hdp-rooms`** in
its place, so the Rooms tab still scrolls to the right section.

The card itself had to be Option D's. The template's `RoomCardReserve` is room-shaped all
the way through — `$X USD / room / night`, `$Y USD total`, `N rooms · incl. taxes & fees`,
`Reserve Room` — and pushing package numbers through those labels produces sentences that
are untrue (`$773 USD / room / night` for a per-person figure). It also has no party-size
control and no way to relabel its CTA without editing the library, which no prototype here
does. The breakdown modal is still built on the library's `DsModal`.

## Why there is no search band

A booking widget — even trimmed to one field — reads as **search**: it implies something to
search for, and results that might come back empty. This flow has neither. The party is
already invited, the dates are set, and there are exactly two options waiting.

So the check-in/check-out/guests bar wasn't shrunk, it was removed. What survives of it is
a single party-size select on each card, sitting on the thing it prices.

## Why both cards say the same words

The inclusion list is word-for-word identical on both packages, on purpose. The repetition
is what makes *"these are the same package, in two places"* legible at a glance — anything
phrased differently would imply a distinction that isn't there.

What genuinely differs is the hotel, the price, and one thing worth watching:

| | The Westin | The Ritz-Carlton |
| --- | --- | --- |
| Room | Deluxe King · sleeps 2 | Carlton Suite · sleeps 4 |
| Rooms for a party of 4 | **2** | **1** |

Occupancy means the cheaper hotel isn't always the cheaper package. Each card states its
own room count rather than letting the price move unexplained.

## How a package is priced

```
rooms      = ceil(people / room occupancy)
tickets    = ticket face value × people
stay       = nightly rate × 2 nights × rooms
extras     = transportation × rooms  +  hospitality × people
components = tickets + stay + extras
package    = round(components × (1 − 12% bundle discount))
```

Prototype economics, deterministic so demos never drift.

## What Option D removes from Option C

| | Option C | Option D |
| --- | --- | --- |
| Tiles | 6 (3 tiers × 2 hotels) | **2** (1 per hotel) |
| Ticket tier | a choice, 3 ways | fixed — one tier |
| Dates | a picker; nights drive price | **fixed** two nights, no picker |
| Room choice | 5 room types at the premium hotel | one room per hotel |
| Confirm dialog | choose-your-room / confirm | none — the card checks out, and the detail page is optional |
| Library overrides + patches | 0 + 0 | **0 + 0** |

Library components mounted: `GlobalNav`, `AppStepper`, **`PackageDetailPage`**,
`HotelDetailPage`, `CheckoutPage`, `ConfirmationPage` — all as shipped. Screen 2 *is* that
package template, unmodified.

## Source

| Path | What it is |
| --- | --- |
| [`src/packages.js`](src/packages.js) | The two hotels, the shared inclusions, and the pricing |
| [`src/screens/PackagesScreen.vue`](src/screens/PackagesScreen.vue) | Screen 1 — the two tiles, and the landing page |
| [`src/screens/PackageDetailsScreen.vue`](src/screens/PackageDetailsScreen.vue) | Screen 2 — the library package template |
| [`src/components/PackageCard.vue`](src/components/PackageCard.vue) | One package card |
| [`src/screens/HotelDetailsScreen.vue`](src/screens/HotelDetailsScreen.vue) | Hotel reference view — off-flow, but it can select the package |
| [`src/components/RoomPackageCard.vue`](src/components/RoomPackageCard.vue) | The room card on that page, carrying the package cards' footer |
| [`src/components/PackagePriceDialog.vue`](src/components/PackagePriceDialog.vue) | Its `Price details` breakdown, on the library's `DsModal` |
| [`src/store.js`](src/store.js) | Screens, the selection, and the one variable |

## Run it

```bash
cd option-d && node ../node_modules/vite/bin/vite.js --port 6700
```

No install needed — deps resolve up the tree to the repo's `node_modules`.

## Deep links

- [Screen 1 · the package pair (landing)](https://epprestodesign.github.io/presto-2026-ticketing/option-d/?screen=packages&people=5)
- [Screen 2 · package template](https://epprestodesign.github.io/presto-2026-ticketing/option-d/?screen=packageDetails&pkg=ritz-package)
- [Screen 2 · on the Packages tab](https://epprestodesign.github.io/presto-2026-ticketing/option-d/?screen=packageDetails&pkg=ritz-package&tab=packages)
- [Screen 3 · checkout](https://epprestodesign.github.io/presto-2026-ticketing/option-d/?screen=checkout&pkg=ritz-package&people=4)
- [Hotel details · The Westin](https://epprestodesign.github.io/presto-2026-ticketing/option-d/?screen=hotelDetails&hotel=westin) — off-flow, and it can select the package
- [Hotel details · The Ritz-Carlton, Rooms tab](https://epprestodesign.github.io/presto-2026-ticketing/option-d/?screen=hotelDetails&hotel=ritz&tab=rooms&people=4) — straight to the room card

## Still open

Option C is unchanged and still deployed — the Aug 5 feedback said to keep the current
concept as-is. **Nothing has been archived yet**; worth deciding once D is reviewed
beside it.
