# Aug 25 — Package Customize

**Edge case #3 of the Aug 25 round: pre-built package → package details → customize.**
A Patriots weekend somebody else assembled, taken apart and rebuilt — a different ticket
level, a different hotel, a different room inside it, extras added and dropped — against a
price that re-adds itself on every click.

Forked from [`/option-d`](../option-d) on **August 25, 2026**. Like every prototype here
it's a self-contained Vite app importing the **real library components** via the `@lib`
alias — nothing is copied or forked from the library, and no library file is changed.

Deployed at `https://epprestodesign.github.io/presto-2026-ticketing/package-customize/`
(local dev on port **7200**).

## Revised after the Aug 25 stakeholder review

The verdict on the screen itself was *"I love this... this is great, perfect"*, so the
screen is not redesigned. Three targeted notes were acted on:

| The note | What changed |
| --- | --- |
| *"I don't like this review thing at the top" · "we have this other thing on the side here" · "once I get here, I don't think I need this at the top. I think I should just be here confirming."* | The **Package · Customize · Review stepper is gone from the whole prototype**, and the **dark event strip is gone from the customize screen**. What is left above the choices is the back link, the heading and the sentence explaining the screen. The rail — the "other thing on the side" — was already doing the job both bands were duplicating. |
| *"these buttons might need a little bit more of a punch up, because it should just go right to checkout. And if I didn't know to look for this, I might not see it."* | **Continue to checkout is now one component** ([`CheckoutCta.vue`](src/components/CheckoutCta.vue)), carries the package total on its face, and is the only filled-navy surface on the screen. The savings badge that sat between the total and the button moved up beside the discount row; the reset link went quiet and below. Under 1080px, where the rail unsticks, a fixed bar carries the total and the same action. |
| *"I never want to have this as a pop-up... we almost never are going to want those modal pop-ups, we're always going to want a clean page."* | `PackagePriceDialog.vue` (a `DsModal`) is **deleted**. *Price details* is now a disclosure that unfolds [`PriceBreakdown.vue`](src/components/PriceBreakdown.vue) **inside** the card that owns the price. **Zero `DsModal` and zero `DsSidePanel` usages remain in this folder.** |

Everything the prototype was testing is untouched: five customization axes, one
`priceConfiguration()`, per-row deltas against the package total, the once-rounded
discount, and the expanded library checkout.

## The flow

```
Packages ──▶ Package details ──▶ CUSTOMIZE ──▶ Checkout ──▶ Confirmation
 3 tiles      the library's       tier · hotel    the same
 across a     own template —      room · extras   configuration,
 price range  everything          party size      billed
      │       included                 ▲
      │                                │
      └── Customize ───────────────────┘   (the drill-in is a route through,
      │                                     not a toll gate)
      │
      └── hotel NAME ──▶ Hotel details ─ Use this room ─▶ back to Customize
                          (new tab)                        in that tab
```

**There is no stepper over any of it.** The Aug 25 review removed it from the customize
screen; it came out of the whole prototype rather than that one screen, because chrome that
appears over the package page, vanishes on customize and reappears over checkout reads as a
rendering bug — and it would have made the screen the guest spends longest on the odd one
out. Nothing was lost: the rail names and prices the package, every screen carries its own
named back link (*"Back to The Club Weekend"*), and the library checkout page brings its own
progression. The stepper was a fourth voice describing a four-screen flow.

The **event strip is kept on the browse board only**. That is the landing page, where a
guest may genuinely not know which game this is; by the time they reach customize they have
opened a package and read its detail page, and a full-width navy restatement of answered
facts was both a duplicate and the loudest thing on a screen whose job is a decision.

## What it inherits, and what it deliberately reverses

Option D collapsed its package to a single fixed SKU: **one ticket tier, one room per
hotel, a fixed stay, and party size as the only variable**. That was the right answer to
its brief — *"two tiles, identical contents, only the hotel differs"* — and it is left
exactly as it is.

This prototype answers the opposite brief, so it puts the choice back:

| | Option D | Package Customize |
| --- | --- | --- |
| Ticket tier | fixed — one tier | **a choice, 4 ways**, re-prices the party |
| Hotel | 2, and the tile IS the hotel | **3**, changeable mid-flow |
| Room type | 1 per hotel, never chosen | **2–3 per hotel**, each with its own rate |
| Extras | baked in, identical on both | **8, individually switchable** |
| Party size | the only variable | one of five |
| What a "package" is | a priced product | a **preset** — a starting point |
| Library overrides + patches | 0 + 0 | **0 + 0** |

The structural consequence is in `src/packages.js`: a package no longer *has* a price.
Price belongs to a **configuration** — `{ pkgId, guests, tierId, hotelId, roomId, extraIds }`
— and lives in one function, `priceConfiguration()`. Every screen, every card, every rail,
every delta and checkout itself read out of that one function, so there is exactly one
place the arithmetic can be wrong.

## What you can customize

### 1 · Party size — 1 to 12

Tickets are per head. Rooms are **derived**: `ceil(guests / room.sleeps)`. It is the one
number that moves for a reason the guest didn't type, so the control states its own effect
underneath it — *"4 tickets · 2 × Premium King for 2 nights"*.

### 2 · Ticket level — 4 tiers, cheapest first

`Upper Level $86` · `Mezzanine $150` · `Lower Level $318` · `Club Level $359`

Not our numbers: `deriveTiers()` in the library seeds them from the event id, so they're
deterministic per event and identical to every other prototype pricing this game. The
ladder is rendered **cheapest first** because it is read bottom-up — *what does the next
step up cost me?* — which is the harder direction.

### 3 · Hotel — 3 properties, and the room inside it

| Hotel | Base rate | Rooms |
| --- | --- | --- |
| The Foxborough Inn · 0.4 mi | $189 | Standard Queen · **Double Queen** (+$45) |
| The Westin · 0.8 mi | $289 | Deluxe King · **Premium King** (+$60) · Executive Suite (+$150) |
| The Ritz-Carlton · 1.1 mi | $549 | Carlton King · Carlton Suite (+$110) · **Club Level Suite** (+$260) |

Room premiums are per night, on top of the hotel's base rate. Occupancy is load-bearing:
**a bigger room can make the package cheaper**, because it takes fewer of them to hold the
party. A party of six at the Westin pays **$4,636** in three Deluxe Kings and **$4,497** in
two Executive Suites — the dearer room, the cheaper weekend. The room rows say so where
the choice is made, not only in the rail.

Changing hotel has to pick a room for you, and it **carries capacity across, not the
name**: the cheapest room in the new hotel that sleeps the same number. Picking `rooms[0]`
was rejected — every hotel's first room sleeps 2, so a party of six leaving a suite would
land on a base room and silently go from two rooms to three, a price jump attributed to a
hotel change nobody made.

### 4 · Extras — two groups, because they are two kinds of decision

**Getting there** is single-choice:

| | Price |
| --- | --- |
| Round-trip coach transfer | $180 per room |
| Stadium parking pass | $95 per room |
| Make your own way | — |

A coach seat and a parking space are answers to the same question. Checkboxes would let a
guest buy a seat on a bus they will not be on — arithmetically correct, factually wrong.
*Make your own way* is a real zero-cost option rather than an empty state, so the group
always has an answer and the summary always has a line for how the party reaches the
stadium.

**Add to your package** is independent, so it's checkboxes:

| | Price |
| --- | --- |
| Pregame hospitality tent | $140 per person |
| Stadium tour & field visit | $75 per person |
| Hotel club lounge access | $55 per person, per night |
| Guaranteed 4:00 PM checkout | $75 per room |
| Dedicated gameday host | $250 per booking |

Four **units** rather than one flat price, because the multiplier is the whole reason party
size and room count feed the extras total: a coach is booked per room, a wristband per
head, lounge access per head per night.

### What is NOT customizable

The dates. The party is invited for the weekend, so the stay is two nights around Sunday's
kickoff and nothing offers to change it. A date picker would reopen availability — *is the
Ritz free that Friday?* — and this prototype has no availability story to tell. Everything
the edge case asks to be editable is editable; the one thing it doesn't ask for stays
nailed down.

## How the price is computed

```
rooms      = ceil(guests / room.sleeps)
nightly    = hotel.nightlyRate + room.deltaPerNight
tickets    = tier.price × guests
stay       = nightly × 2 nights × rooms
extras     = Σ price × (per person | per room | per person-night | per booking)
components = tickets + stay + extras
discount   = round(components × 12%)
package    = components − discount
```

Three deliberate decisions in that:

**The discount is rounded once and subtracted**, rather than rounding the discounted total.
`components`, `discount` and `package` are then three whole numbers that add up exactly. On
a surface where all three are on screen at once and move on every click, a dollar of
rounding drift is a visible bug.

**The rate applies to every component, including extras added after the fact.** The
alternative — discount what the preset shipped with, charge face value for anything added —
was rejected: it makes the same wristband cost two different amounts depending on which
package you started from, and re-adding something you just removed would quietly reprice
it.

**One rate, 12%, across all three packages**, so the three tiles stay comparable. A
per-package rate would have made the browse board a comparison of discounts rather than of
packages.

### Every alternative is priced, in the currency the guest pays

Each option row shows what selecting it would do to the **package total** — the
bundle-discounted number — not to the component's own price. Those differ by 12%, and only
the discounted one matches the rail sitting beside it. A `+$60/night` room label next to a
rail that moves by $211 would make the two look unrelated.

Those deltas are computed by running a *hypothetical* configuration through the same
`priceConfiguration()` the rail uses — nothing on the screen reimplements the arithmetic,
so a row can never promise a number the rail then contradicts. It is also why the hotel
rows call `withHotel()` rather than spreading `{ hotelId }` themselves: changing hotel also
moves the room, and the preview has to make the same move the click will.

## The three pre-built packages

Priced for a party of **4**, which is what the browse board quotes — a board where each
tile is priced for a different party is not a board.

| | Tickets | Hotel · room | Extras | Total |
| --- | --- | --- | --- | --- |
| **The Tailgater** | Upper Level | Foxborough Inn · Double Queen | parking | **$798** |
| **The Club Weekend** *(most booked)* | Club Level | Westin · Premium King | coach, hospitality | **$3,302** |
| **The 50-Yard Line** | Lower Level | Ritz-Carlton · Club Level Suite | coach, hospitality, lounge, host | **$3,802** |

Three rather than Option D's two, because the axis being compared is different. Option D's
pair were identical packages differing only by hotel, so two points *were* the comparison.
Here each tile is a whole configuration, and two points don't establish a range. Three do,
and the range is what tells a guest which end to start customizing from.

## Screen notes

### The browse board is not three configurators

The cards state each package **as sold** and hand the editing to a screen with room for it.
Three tiles each carrying five controls would turn a browse screen into three
half-finished customize screens, and the guest would have to build all three to compare
them.

That includes party size, which Option D puts *on* its cards. There it is the only
variable, so the card is the right place. Here it is one of five, and singling it out on
the board would suggest the other four are fixed — the opposite of the point.

### Package details is the read, and its Select goes to Customize

The library's `PackageDetailPage`, mounted as shipped, carrying one package. Its Select CTA
goes to **Customize** rather than to checkout — the one substantive difference from the
sibling prototypes. Here *"yes, this one"* means *"now let me change it"*, not *"bill me"*.

Its inclusion list is built from the live configuration, so a guest who customises, comes
back and reads again is reading what they now hold. The template's own party-size stepper
is hidden: it re-prices itself and emits an event the template doesn't forward, which in
the sibling prototypes is merely inert and here would be a second control disagreeing with
the real one.

### The customize screen is one page, not a wizard

Every axis on one screen. A wizard is right when each answer narrows the next question;
these axes are independent, and the interesting comparisons run **across** them — *is the
room upgrade worth more than the ticket upgrade?* Stepping through them would hide exactly
the comparison the screen exists for.

The price rail is **sticky and fully itemised on the page**, and always has been — the
price here is the feedback loop, and a total that moves while its explanation is hidden
tells the guest *that* something changed without telling them *what*. Toggling an extra
visibly adds or removes its own row. (As of Aug 25 nothing anywhere in this prototype is
behind a dialog; see *No pop-ups* below.)

**Nothing sits above the heading.** No stepper, no event strip — see the flow section. The
screen opens on the back link, the title and one sentence, and then it is choices and
consequences.

**The rail's foot is a commit block.** Total, per person, then the CTA, uninterrupted: the
savings badge that used to break that run has moved up beside the discount row it is
actually about, and *Reset to the original package* is small, underlined and below the
button. It is the undo, not the exit; two controls of equal weight pointing opposite ways
is how a rail stops having a primary action.

**The checkout CTA is one component, stated twice.** [`CheckoutCta.vue`](src/components/CheckoutCta.vue)
is at the foot of the rail and at the foot of the review card, identical in both, because
two buttons for the same action that look different read as two different actions. It
carries the number it commits to (*"Continue to checkout · $6,842 package total, all in"*),
it is the only filled-navy surface on the screen now that the event strip is gone, and its
arrow moves on hover. Enlarging the old `q-btn` was rejected on its own: the complaint was
about *finding* the button, not about hitting it, and what makes it findable is that
nothing else on the page is shaped like it.

Below **1080px** the rail stops being a rail and drops under the review card — which is
exactly the viewport where *"I might not see it"* was literally true, since the CTA was then
reachable only at the end of a very long scroll. That viewport gets a **fixed bottom bar**
carrying the total and the same action. It is a bar, not an overlay: the page reserves its
height in padding, so it never covers anything and never interrupts.

Below the choices, a **package summary** restates the configuration in contents rather than
money — the rail already owns the money — and, when anything has been changed, lists the
changes from the named package. A guest arrived on a name; a package that no longer matches
that name should say so before checkout does.

### No pop-ups — the breakdown opens in the surface that owns the price

*Price details* used to open a `DsModal` on the browse tiles and on the hotel tab. It is now
a disclosure that unfolds [`PriceBreakdown.vue`](src/components/PriceBreakdown.vue) inside
the card, between the price and the buttons — a few pixels under the number it explains,
where the dialog used to cover that number up. The panel is tinted rather than bordered: a
bordered box inside a bordered card is the dialog's frame smuggled back in.

Deleting the breakdown outright was considered, since the customize rail already itemises
the live configuration permanently and on the page. It was rejected because the rail belongs
to a price *in motion* and exists on one screen out of five. The two surfaces that keep an
on-demand breakdown have no rail and no motion — three browse tiles nobody has opened yet,
and a hotel tab quoting rooms the guest doesn't hold — and making it permanent there would
triple the height of three tiles to explain numbers nobody has questioned, pushing the
packages themselves below the fold. **Permanent where the number moves, on-demand and
in-place where it doesn't.** All three read the same `priceConfiguration()` through the same
`breakdownLines()` helper, so they cannot word the same price differently.

The open state belongs to each **card**, not to the screen. A single `openId` would have
made the three tiles mutually exclusive, and reading two breakdowns side by side is the one
thing a board of three is for — something the modal could not do at all. The cost is that an
open tile grows the grid row, and that trade was taken deliberately.

### The hotel tab is a second door onto the same two choices

Hotel names open the library's `HotelDetailPage` in a **new tab**, so the customize screen
behind it keeps every choice made so far. Its rooms section lists that hotel's real room
types, each priced as **the whole package with that room in it**, plus what switching would
do to the total. Picking one writes the hotel *and* the room into the configuration and
continues to Customize in that tab.

Both surfaces price a room through `priceConfiguration()`. A room that cost one thing here
and another on the customize screen would make the tab worse than useless.

The section around the cards is still the template's — `RoomsCarousel` renders the heading
and the rules; only its grid is suppressed, and these cards are **teleported into
`#hdp-rooms`** so the Rooms tab still scrolls to the right place. The cards themselves had
to be ours: the library's `RoomCardReserve` is room-shaped all the way through
(`$X / room / night`, `Reserve Room`) with no slot for a package total or a delta, and no
way to relabel its CTA without editing the library.

### Checkout bills the configuration, not the preset

`CheckoutPageExpanded` — every section open, one **Book Now**.

Above it sits a **configuration strip** this screen owns: every switchable component named
with its configured value, the preset it started from, how many changes were made to it,
and a link back to change something else. It exists because `CheckoutPageExpanded` reads
only `summary.total` off the summary object — its rail is the cart, and the `rows`
`OrderSummary` would render never reach the page. That's fine for a fixed package, whose
cart line says everything there is to say; it isn't fine here. Patching the library page to
render rows was the other option, and the rule every prototype here follows is that the
library is read-only: what it can't do gets built alongside it.

Extras get **a row each** rather than a comma-joined list. A dropped extra is the change
most likely to be regretted at the door, and a row that simply isn't there reads louder
than a shorter sentence. The cart line carries the same facts in its expandable *what's
inside* list, so the two agree; the strip is what makes them legible without expanding
anything.

One thing is stripped from the library cart: `buildPackageCart()` attaches re-pricing
metadata so the cart can show its own party-size stepper. That stepper re-prices with the
library's formula — scale the tickets, hold everything else — which is right for a package
whose extras are baked in, and wrong for this one, where hospitality and lounge access are
per head. Two controls disagreeing about the same number is worse than one control in the
right place, and the right place is the customize screen.

## What is the library's, and what isn't

**Mounted as shipped:** `GlobalNav`, `PackageDetailPage`, `HotelDetailPage`,
`CheckoutPageExpanded`, `ConfirmationPage`, `QuantityStepper`, `DsCard`,
`BundleSavingsBadge`, `AvailabilityBadge`. Pricing tiers come from the library's
`deriveTiers()`; carts and confirmations from its `buildPackageCart()` / `confData()`.

`AppStepper` and `DsModal` were both in this list before Aug 25 and are both gone —
the stepper with the chrome above the screens, `DsModal` with the price dialog. **This
folder now contains zero `DsModal` and zero `DsSidePanel` usages**, and none of the library
pages it mounts brings one in.

**Built here, and why:**

| | Why not a library component |
| --- | --- |
| [`OptionRow.vue`](src/components/OptionRow.vue) | `TicketCategoryCard` carries a quantity stepper (each tier bought in some number) where this is a single choice; `DsListItem` has no price column. One row for all five lists, so the delta can't drift between them. |
| [`PriceRail.vue`](src/components/PriceRail.vue) | Nothing in the library itemises a *package configuration* on the page; the cart surfaces are checkout-shaped. Built on `DsCard` + `BundleSavingsBadge`. |
| [`PackageCard.vue`](src/components/PackageCard.vue) | The library card's guests stepper re-prices with a formula this catalogue doesn't use, and there is no slot for a two-CTA "details vs customize" split. |
| [`RoomPackageCard.vue`](src/components/RoomPackageCard.vue) | `RoomCardReserve` is room-shaped throughout, with no package total, no delta and no relabelable CTA. Uses the library's `AvailabilityBadge`. |
| [`PriceBreakdown.vue`](src/components/PriceBreakdown.vue) | `PriceDetailsDialog` breaks down a *room*, would total a different number than the package price above it — and is a dialog, which Aug 25 ruled out. This is a plain block a card unfolds in place. Replaced `PackagePriceDialog.vue`. |
| [`CheckoutCta.vue`](src/components/CheckoutCta.vue) | A stock `q-btn` is the same shape and weight as every other button in the flow, which is exactly why the review couldn't find it. Carries the total on its face; one definition so the rail's copy and the review card's copy cannot drift. |
| the checkout **configuration strip** | `CheckoutPageExpanded` consumes only `summary.total`; its rail is the cart, and `OrderSummary`'s rows never render. Built in `CheckoutScreen.vue` rather than patched into the page. |

Library **overrides: 0. Source patches: 0.** The two places a template needed bending —
section order on the package page, the room grid on the hotel page — are scoped CSS in the
screens that mount them, which fails visibly rather than breaking the build when the
library moves.

## Source

| Path | What it is |
| --- | --- |
| [`src/packages.js`](src/packages.js) | The catalogue — hotels, rooms, extras, the three presets — and `priceConfiguration()` |
| [`src/pricing.js`](src/pricing.js) | The four ticket tiers, off the library's `deriveTiers()` |
| [`src/store.js`](src/store.js) | The configuration, the setters, the URL round-trip |
| [`src/screens/PackagesScreen.vue`](src/screens/PackagesScreen.vue) | Screen 1 — the three pre-built tiles |
| [`src/screens/PackageDetailsScreen.vue`](src/screens/PackageDetailsScreen.vue) | Screen 2 — the library package template |
| [`src/screens/CustomizeScreen.vue`](src/screens/CustomizeScreen.vue) | **Screen 3 — the one this prototype exists for** |
| [`src/screens/HotelDetailsScreen.vue`](src/screens/HotelDetailsScreen.vue) | Off-flow hotel reference, and a second door onto hotel + room |
| [`src/components/CheckoutCta.vue`](src/components/CheckoutCta.vue) | The one definition of *Continue to checkout* |
| [`src/components/PriceBreakdown.vue`](src/components/PriceBreakdown.vue) | The on-demand itemisation, rendered in place — no dialog |
| [`src/configured.js`](src/configured.js) | The configuration reshaped for the library's checkout and confirmation |

## Run it

```bash
cd package-customize && node ../node_modules/vite/bin/vite.js --port 7200
```

No install needed — deps resolve up the tree to the repo's `node_modules`. Port **7200**,
not 7000: macOS AirPlay Receiver squats on 7000 and answers 403.

## Deep links

The whole configuration round-trips through the query string, and only the **divergence**
from the preset is written — a link to an untouched package is short, and a link to a
heavily customised one carries every change. *"Look at what I built"* is the natural thing
to want off the customize screen.

- [Screen 1 · the three packages (landing)](https://epprestodesign.github.io/presto-2026-ticketing/package-customize/?screen=packages)
- [Screen 2 · package details · The Club Weekend](https://epprestodesign.github.io/presto-2026-ticketing/package-customize/?screen=packageDetails&pkg=club-weekend)
- [Screen 3 · customize, straight from the preset](https://epprestodesign.github.io/presto-2026-ticketing/package-customize/?screen=customize&pkg=club-weekend)
- [Screen 3 · a party of 8, downgraded to Upper Level](https://epprestodesign.github.io/presto-2026-ticketing/package-customize/?screen=customize&pkg=club-weekend&people=8&tier=upper)
- [Screen 3 · The Tailgater, moved up to the Ritz](https://epprestodesign.github.io/presto-2026-ticketing/package-customize/?screen=customize&pkg=tailgater&hotel=ritz&room=club-suite)
- [Screen 3 · every extra dropped](https://epprestodesign.github.io/presto-2026-ticketing/package-customize/?screen=customize&pkg=club-weekend&extras=own-way)
- [Screen 4 · checkout, as customised](https://epprestodesign.github.io/presto-2026-ticketing/package-customize/?screen=checkout&pkg=fifty-yard&people=6&tier=club)
- [Hotel details · The Westin, Rooms tab](https://epprestodesign.github.io/presto-2026-ticketing/package-customize/?screen=hotelDetails&view=westin&tab=rooms) — off-flow, and it can put a room in your package

## Still open

- **The bundle discount is flat at 12%** regardless of how much is bundled. Strip a package
  down to tickets and a room and you still get 12% off, which is arguably not a bundle. A
  rate that steps with how many component types are in the package was considered and left
  out: it moves the price for a reason other than the component just touched, which is the
  one thing this screen must never do.
- **No availability pressure across configurations.** Rooms carry a `roomsLeft` count and a
  row disables when the party needs more than the property holds, but tickets and extras are
  infinite. A real customize surface would have to say *"only 4 Club Level left"* while the
  party size is being raised.
