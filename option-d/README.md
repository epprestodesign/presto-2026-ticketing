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
Packages ──▶ Package details ──▶ Checkout ──▶ Confirmation
(landing)      the library's
 two tiles,     package template
 one per hotel        │
      │               └─ Select ──▶ Checkout
      └─ hotel NAME ──▶ Hotel Details (new tab, informational only)
```

**The packages page is the landing page.** There is no headcount screen in front of it —
the party size lives in its header, beside the prices it drives — and no stepper above it,
because a progress bar over a landing page is orientation for progress not yet made. The
stepper appears once a package is opened.

**"View Package"** on a card opens the library's own `PackageDetailPage`, and that page's
Select CTA is what continues to checkout. The card is a summary; the template page is the
detail, and the decision.

Hotel details is **not** a step. It opens in its own tab from any mention of a hotel, so
the screen behind it keeps its state.

## What the feedback asked for

| Feedback | How Option D answers it |
| --- | --- |
| Landing looks too much like Presto | No hero, no search band — the landing page is the package pair under a compact event strip. |
| Remove the check-in/check-out/guests bar | No booking widget on any screen. The stay is fixed. |
| A simple "how many people are coming" prompt | A party-size control in the packages header, beside the prices it drives. |
| Pre-invited for two days — keep it minimal | A fixed two-night stay; nothing offers to change it. |
| Packages page above the fold | A ~90px event strip, then the tiles. It is now screen **1**. |
| Two tiles side by side only, one per hotel | Exactly two, in a fixed 2-column track. |
| Contents identical; only the hotel differs | Same tickets, transportation, hospitality and nights on both. |
| Name each by hotel | **Westin Package** · **Ritz-Carlton Package** |
| Each includes two tickets, transportation, etc. | Tickets scale with headcount; transportation and hospitality on both. |

## Why there is no search band

A booking widget — even trimmed to one field — reads as **search**: it implies something to
search for, and results that might come back empty. This flow has neither. The party is
already invited, the dates are set, and there are exactly two options waiting.

So the check-in/check-out/guests bar wasn't shrunk, it was removed. What survives is a
single party-size control in the packages header, beside the two prices it drives.

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
| Confirm dialog | choose-your-room / confirm | none — the package template page is the decision |
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
| [`src/screens/HotelDetailsScreen.vue`](src/screens/HotelDetailsScreen.vue) | Read-only hotel reference view |
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
- [Hotel details · The Westin](https://epprestodesign.github.io/presto-2026-ticketing/option-d/?screen=hotelDetails&hotel=westin) — informational only

## Still open

Option C is unchanged and still deployed — the Aug 5 feedback said to keep the current
concept as-is. **Nothing has been archived yet**; worth deciding once D is reviewed
beside it.
