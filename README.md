# Presto DS — Ticketing

A **Quasar + Vue 3 design system**, documented and QA'd in **Storybook**, themed
for the **EventPipe** client-appreciation outing — **New England Patriots v
Buffalo Bills** at **Gillette Stadium, Sat Dec 6 2026**. It spans the full guest
journey: **ticket map & seat selection**, **experience packages**, **hotel
booking**, checkout, and confirmation.

- **Stack:** Vue 3 · Quasar 2 · Storybook 10 · Vite 6 · pnpm
- **Font:** PT Sans (400 / 700)
- **Brand:** primary **Navy `#01113E`** · neutrals **Slate** · page canvas `#F9F9FA`
- **Shape:** uniform **4px** radius system (pills reserved for chips / rounded buttons)
- **Color system:** Tailwind-based 3-tier tokens (primitives → semantic → Quasar bridge)

## 🎯 Start here
The primary links, all deployed from this repo.

### ⭐ Options A, B, C & D
The current work: four takes on the same brief, built side by side so they can be
compared. None of them modifies the design system.

**Start with Option D** — the **Aug 5** feedback response and the current
direction. A, B and C came out of the **Aug 4** round: A and B are two shapes of
the same configure-then-book journey, and C answered that round with a one-click
grid. D answers the feedback on C by cutting to the single decision a pre-invited
group actually has — *where do you want to stay?*

| | Round | Flow | Live |
| --- | --- | --- | --- |
| **⭐ Option D** — two hotels, one package | Aug 5 | 2-package pair (landing) → package template → checkout | **https://epprestodesign.github.io/presto-2026-ticketing/option-d/** |
| **Option C** — one-click grid | Aug 4 | 6-tile board → confirm → checkout | **https://epprestodesign.github.io/presto-2026-ticketing/option-c/** |
| **Option A** — packages first | Aug 4 | Landing → Browse Packages → package modal → checkout | **https://epprestodesign.github.io/presto-2026-ticketing/option-a/** |
| **Option B** — hotel first | Aug 4 | RSVP → two hotels → package *or* room *or* skip the stay → checkout | **https://epprestodesign.github.io/presto-2026-ticketing/option-b/** |

#### The Option D workflow

```
Packages ──▶ Package details ──▶ Checkout ──▶ Confirmation
(landing)      library template
 two tiles,     packages pulled to the top
 one per hotel        │
      │               └─ Select ──▶ Checkout
      └─ hotel NAME ──▶ Hotel Details (new tab, informational)
```

- **The package pair IS the landing page** — no hero, no search band, no headcount
  gate. Two tiles under a compact event strip, above the fold.
- **Both packages are identical**: the same Club Level tickets, transportation,
  hospitality and two nights. Only the hotel differs, so they're named for it —
  **Westin Package** and **Ritz-Carlton Package**.
- **One variable: how many people are coming.** A party-size control in the header,
  beside the two prices it drives. No dates — the party is invited for a fixed
  two-day window.
- **"View Package"** opens the library's own `PackageDetailPage` (with the packages
  section pulled to the top); its Select CTA continues to checkout.

```
rooms      = ceil(people / room occupancy)
components = ticket face × people  +  nightly × 2 nights × rooms
             +  transportation × rooms  +  hospitality × people
package    = round(components × (1 − 12% bundle discount))
```

Occupancy is the thing to watch: the Westin's Deluxe King sleeps 2 and the Ritz's
Carlton Suite sleeps 4, so a party of four needs two rooms at one and one at the
other — the cheaper hotel isn't always the cheaper package.

Source: [`option-d/`](option-d/) · full detail in
[option-d/README.md](option-d/README.md).

#### The Option C workflow

```
                              ┌─ Ritz-Carlton ─▶ [choose your room]  ─┐
Package board ──▶ Select ─────┤                                       ├──▶ Checkout ──▶ Confirmation
   (landing)                  └─ Courtyard ────▶ [confirm package]  ──┘
      │
      ├─ dates + guests ─────▶ re-prices all six tiles live
      └─ hotel NAME ─────────▶ Hotel Details (new tab, read-only)
```

- **The board is the landing page** — no hero-then-search step, so packages are
  the first thing on screen. Six tiles: 3 ticket tiers × 2 contracted hotels,
  ordered so each row is one property.
- **"Get your ticket free, stay at this hotel."** The price charged is the room;
  tickets are $0 and shown as the saving. Nights multiply the room and nothing
  else, so a longer stay never costs you the free tickets.
- **One shared control for dates and guests**, above the board, because both
  re-price all six tiles at once. Occupancy caps tickets per *room*; a party
  larger than one room books a second rather than being refused.
- **Selecting a tile confirms rather than configures.** One dialog, two jobs: the
  Ritz-Carlton carries five contracted room types so it offers the choice; the
  Courtyard carries one so it is pure confirmation of the final package.
- **Hotel names open the library's own `Hotel Details / Book Reservation` page**
  in a new tab, read-only, so the board keeps its dates and party size.

```
rooms   = ceil(guests / room occupancy)
price   = nightly × nights × rooms          ← what's charged
saving  = ticket face value × guests        ← "N tickets free"
```

| | Club Level | Lower Level | Mezzanine |
| --- | --- | --- | --- |
| **The Ritz-Carlton** · Carlton Suite · sleeps 4 | $809 | $729 | $639 |
| **Courtyard by Marriott** · Double Queen · sleeps 4 | $479 | $399 | $309 |

*One night, two guests. The board re-prices from the dates and party size above it.*

A and B are kept because their detailed configure-and-adjust UI is explicitly
*"good for later, not the landing page"*.

Every component is documented in Storybook. A, B and C sit under **Aug 4 Changes**:
**https://epprestodesign.github.io/presto-2026-ticketing/?path=/docs/aug-4-changes-overview--docs**
· [Option C overview](https://epprestodesign.github.io/presto-2026-ticketing/?path=/docs/aug-4-changes-option-c-overview--docs).
D has its own **Aug 5 Changes** category:
**[Option D overview](https://epprestodesign.github.io/presto-2026-ticketing/?path=/docs/aug-5-changes-option-d-overview--docs)**

Source: [`option-d/`](option-d/) · [`option-c/`](option-c/) · [`option-a/`](option-a/) · [`option-b/`](option-b/)

## 🎯 The three experiences
Three primary links, all deployed from this repo. Start here:

### 1 · Storybook — the design system
**https://epprestodesign.github.io/presto-2026-ticketing/**
The full **Quasar + Vue 3 design system**: every component, foundation token, and
experience-flow story — Ticket Map, Package Details, Browse/Hotel Details,
Checkout, Confirmation, and the App Shell **Stepper**. This is the source of truth
that both prototypes below are built from (zero forks — they import the live
library via `@lib`).

### 2 · Hotel + Tickets Journey — clickable prototype
**https://epprestodesign.github.io/presto-2026-ticketing/experience/**
A stepper-guided, end-to-end booking journey — **Stays → Tickets → Review**. Leads
with a landing page, then browse hotels → hotel details → the SeatGeek-style Ticket
Map (with a "how many tickets?" prompt) → a **Tickets + Hotel** checkout →
confirmation. Includes a nav cart with a Clear-Cart confirmation, deep-linkable
steps/sections (`?screen=…&tab=…`), and a "skip tickets → hotel-only checkout"
path. Source: [`experience/`](experience/).

### 3 · Hotel + Packages Journey — clickable prototype
**https://epprestodesign.github.io/presto-2026-ticketing/experience-packages/**
The same guided flow with **experience packages** in place of tickets —
**Stays → Packages → Review**. Browse hotels → hotel details → Browse Packages →
Package Details → a **Packages + Hotel** checkout → confirmation. "Select a package"
deep-links to the Packages tab; "skip → hotel-only checkout" is supported too.
Source: [`experience-packages/`](experience-packages/).

## 🔗 Hosted on GitHub Pages
Everything below deploys automatically on every push to `main`.

| Surface | What it is | Link |
| --- | --- | --- |
| **Storybook** | The full design system + experience flows | **https://epprestodesign.github.io/presto-2026-ticketing/** |
| **Hotel + Tickets Journey** | Stepper-guided **hotel + event tickets** prototype | https://epprestodesign.github.io/presto-2026-ticketing/experience/ |
| **Hotel + Packages Journey** | Stepper-guided **hotel + experience packages** prototype | https://epprestodesign.github.io/presto-2026-ticketing/experience-packages/ |
| **Aug 5 - Option D** | ⭐ Two hotels, one package — the Aug 5 feedback response | https://epprestodesign.github.io/presto-2026-ticketing/option-d/ |
| **Aug 4 - Option C** | The one-click package grid — the Aug 4 feedback response | https://epprestodesign.github.io/presto-2026-ticketing/option-c/ |
| **Aug 4 - Option A** | Working copy of the Hotel + Packages journey (forked 2026-08-04) | https://epprestodesign.github.io/presto-2026-ticketing/option-a/ |
| **Aug 4 - Option B** | The v2 take on that journey — hotel-first flow | https://epprestodesign.github.io/presto-2026-ticketing/option-b/ |
| **Aug 4 Changes (docs)** | Storybook category documenting every component in that prototype | https://epprestodesign.github.io/presto-2026-ticketing/?path=/docs/aug-4-changes-overview--docs |
| **Experience Hub** | Landing directory linking every prototype | https://epprestodesign.github.io/presto-2026-ticketing/hub/ |
| **Booking Journey** | Clickable end-to-end **hotel booking** prototype | https://epprestodesign.github.io/presto-2026-ticketing/prototype/ |
| **Ticket + Hotel Bundle** | Clickable **ticket + hotel bundle** prototype | https://epprestodesign.github.io/presto-2026-ticketing/bundle/ |
| **Imagery Library** | Gallery of the hosted stadium + hotel photography | https://epprestodesign.github.io/presto-2026-ticketing/library/ |
| **Imagery Host** | Separate Pages repo serving the runtime image manifest | https://epprestodesign.github.io/presto-ds-imagery/ |

## 📚 Aug 4 Changes — documented in Storybook

Every component built for the **Aug 4** prototypes (Options A, B and C) is documented in its own
Storybook category, with an overview doc covering the flow, the pricing model and
how each prototype overrides library components without editing them.

Option C carries its **own** overview doc as well, because what it *removes* from Option A —
the filter rail, the modal, all four library overrides and all four source patches — is the
substance of it.

**Option D** is the Aug 5 round and has its own top-level **Aug 5 Changes** category, so the
two rounds stay separable in review.

**▶ https://epprestodesign.github.io/presto-2026-ticketing/?path=/docs/aug-4-changes-overview--docs**

| Story | What it documents |
| --- | --- |
| [Overview](https://epprestodesign.github.io/presto-2026-ticketing/?path=/docs/aug-4-changes-overview--docs) | What changed, the packages-first flow, the pricing formula, the override/patch mechanism, and a link to the live prototype |
| [Option C / Overview](https://epprestodesign.github.io/presto-2026-ticketing/?path=/docs/aug-4-changes-option-c-overview--docs) | The one-click grid: what the Aug 4 feedback asked for, how each point is answered, the free-ticket pricing model, and what C removes from A |
| [Option C / Package Grid](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-option-c-package-grid--six-tiles) | The 6-tile board — 3 ticket tiers × 2 contracted hotels, one row per property |
| [Option C / Package Tile](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-option-c-package-tile--premium-stay) | One complete SKU: room priced, tickets free, guests capped at occupancy |
| [Option C / Package Confirm Dialog](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-option-c-package-confirm-dialog--choose-your-room) | The two modes side by side: choose-your-room at the Ritz, confirm-only at the Courtyard |
| [Option C / Event Hero](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-option-c-event-hero--default) | The branded event hero, with the search card tucked onto it |
| [Option C / Booking Widget](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-option-c-booking-widget--core-widget) | Dates + guests, no Search button — with Option A's original beside it for comparison |
| [Option C / Event Header Bar](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-option-c-event-header-bar--default) | The ~90px alternative to the hero, kept for the above-the-fold trade-off |
| [Option C / Hotel Details](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-option-c-hotel-details--ritz-carlton) | The library's Hotel Details page template, in read-only mode |
| [Option D / Overview](https://epprestodesign.github.io/presto-2026-ticketing/?path=/docs/aug-5-changes-option-d-overview--docs) | Each Aug 5 feedback point and how it's answered, the pricing model, and what D removes from C |
| [Option D / Package Pair](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-5-changes-option-d-package-pair--two-hotels) | The two tiles — identical contents, named for their hotel |
| [Option D / Package Details](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-5-changes-option-d-package-details--ritz-carlton) | The library package template, with its packages section pulled to the top |
| [Option D / Hotel Details](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-5-changes-option-d-hotel-details--westin) | The library hotel template in read-only mode |
| [Package Details / Package Modal](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-package-details-package-modal--playground) | The full-screen two-column sheet that replaced the Package Details page |
| [Package Details / Package Result Card](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-package-details-package-result-card--playground) | The Browse Packages row + inline hotel-availability panel |
| [Package Details / Tier Picker](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-package-details-tier-picker--playground) | Ticket tiers with per-ticket and party pricing |
| [Package Details / Hotel &amp; Room Selection](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-package-details-hotel-room-selection--playground) | The package's hotels, their room types, amenities and paid extras |
| [Package Details / Booking Summary](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-package-details-booking-summary--playground) | Party size, line items, bundle savings, total and Reserve |
| [Package Details / Hotel Availability](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-package-details-hotel-availability--playground) | The hotel carousel inside a package row |
| [Package Details / Detail Blocks](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-package-details-detail-blocks--inclusions) | Itemised inclusions, gameday timeline, policy accordion |
| [Booking Widget](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-booking-widget--guests-dropdown) | The forked widget — Guests dropdown, gameday dates — beside the library original |
| [Foundations / Carousel](https://epprestodesign.github.io/presto-2026-ticketing/?path=/story/aug-4-changes-foundations-carousel--overflowing) | The reusable scroll-snap track used in three places |

## What's new

- **Ticket Map** (SeatGeek-style) — a two-pane browse experience: an
  "Authenticated NFL Tickets" listings rail beside the interactive Gillette
  seat map with **one live price pin per listing**. Selecting a seat opens a
  view-from-seat detail (photo + section/row + quantity + guarantees).
- **Real-time stress-test controls** — every listing/dataset is generated
  deterministically, and the primary stories expose a **`count`** Storybook
  Control so you can scale the data live and watch the filters cope:
  - **Ticket Map / Browse Tickets** — up to **200** listings (default 100).
  - **Packages / Patriots Experiences** — scale the package grid.
  - **Browse Hotels** (Book Reservation + Group Block) — pad the results list.
- **Experience Packages** — themed ticket + hotel (+ experience) SKUs with an
  option/quantity customization dialog, plus a **Package Details** page.
- **Hosted imagery library** — a new **`seat-views`** category (American-football
  stadium points-of-view) powers the view-from-seat hero, plus more hotel
  photography. Served from the imagery host **and** mirrored in the in-repo
  **[Imagery Library gallery](https://epprestodesign.github.io/presto-2026-ticketing/library/)**.

## Live docs
Storybook is published to GitHub Pages on every push to `main`:

**https://epprestodesign.github.io/presto-2026-ticketing/**

## Interactive prototypes
Clickable, end-to-end journeys built entirely from the real library components
(zero forks), at a fixed **1440px** canvas. Both are linked from the
**[Experience Hub](https://epprestodesign.github.io/presto-2026-ticketing/hub/)**
and from Storybook's **Getting Started → Introduction** page.

- **▶ Hotel + Tickets Journey — https://epprestodesign.github.io/presto-2026-ticketing/experience/**
  Stepper-guided **Stays → Tickets → Review**: landing → Browse Hotels → Hotel
  Details → Ticket Map → Tickets + Hotel checkout → confirmation. Nav via each
  page's own CTAs + a clickable stepper; deep-linkable steps/tabs. Source:
  [`experience/`](experience/).
- **▶ Hotel + Packages Journey — https://epprestodesign.github.io/presto-2026-ticketing/experience-packages/**
  The same flow with **experience packages** — **Stays → Packages → Review**:
  Browse Packages → Package Details → Packages + Hotel checkout. Source:
  [`experience-packages/`](experience-packages/).
- **▶ Aug 5 - Option D — https://epprestodesign.github.io/presto-2026-ticketing/option-d/** ⭐
  **Two hotels, one package.** The package pair is the landing page: two identical
  packages — same Club Level tickets, transportation, hospitality and two nights —
  differing only by hotel, and named for it. One variable, the party size, sits in the
  header. "View Package" opens the library's own package template, and its Select CTA
  continues to checkout. Hotel names open the library's Hotel Details page in a new tab,
  read-only. Source: [`option-d/`](option-d/).
- **▶ Aug 4 - Option C — https://epprestodesign.github.io/presto-2026-ticketing/option-c/**
  **One-click grid.** A 6-tile board — 3 ticket tiers × 2 contracted hotels — is the
  landing page. No filter rail, no result list, no configuration modal: a tile is a
  complete SKU. Dates and guests sit in one shared control above the board and re-price
  all six tiles at once. Selecting a tile raises a confirm dialog — which offers the
  room types at The Ritz-Carlton and simply confirms the package at the Courtyard —
  then checkout. Hotel names open the library's Hotel Details page in a new tab,
  read-only. Source: [`option-c/`](option-c/).
- **▶ Aug 4 - Option A — https://epprestodesign.github.io/presto-2026-ticketing/option-a/**
  **Packages first.** Landing → Browse Packages → a full-screen package modal
  (ticket tier · hotel · room · paid extras, all re-pricing live) → checkout.
  Source: [`option-a/`](option-a/).
- **▶ Aug 4 - Option B — https://epprestodesign.github.io/presto-2026-ticketing/option-b/**
  **Hotel first.** RSVP → two hotels → either packages scoped to that hotel, its
  own room on the details page, or skip the stay for tickets-only packages. All
  three paths converge on the same checkout. Source: [`option-b/`](option-b/).
- **▶ Booking Journey — https://epprestodesign.github.io/presto-2026-ticketing/prototype/**
  All three modes: **Book Reservation**, **Group Block**, **Multiple
  Reservations**. Search hotels on a live Google map, filter, pick rooms,
  checkout, confirm. Source: [`prototype/`](prototype/).
- **▶ Ticket + Hotel Bundle — https://epprestodesign.github.io/presto-2026-ticketing/bundle/**
  The ticket + hotel bundle flow. Source: [`bundle/`](bundle/).

Each is a small Vite app that imports the library from `../src` and has no
dependencies of its own (they resolve from this repo's `node_modules`).

```bash
cd prototype
cp .env.example .env          # add your Google Maps key (optional; map degrades gracefully)
node ../node_modules/vite/bin/vite.js --port 6100 --host   # → http://localhost:6100
```

## Local development
```bash
pnpm install
pnpm storybook          # dev gallery at http://localhost:6006
pnpm build-storybook    # static build → storybook-static/
```

## Design tokens & theming
A 3-tier token pipeline — change the brand in one place and every component reskins:

| Layer | File(s) | Purpose |
| --- | --- | --- |
| Primitives | `src/css/ds-palette.scss` | Raw Tailwind hue ramps + the **Navy** brand ramp (`--ds-palette-*`) |
| Semantic | `src/css/ds-color-tokens.scss` | Roles (`--ds-color-*`) → primitives (brand = Navy, neutrals = Slate) |
| Utilities | `src/css/ds-utilities.scss` | `bg-ds-*` / `text-ds-*` / `border-ds-*` helpers |
| Quasar bridge | `src/css/quasar.variables.scss` | `$primary…`, font, radius — so Quasar components reskin |
| Tokens | `src/css/tokens.scss` | Spacing, radius, elevation, motion |
| Type | `src/css/typography.scss` | PT Sans type scale + weights |
| Overrides | `src/css/app.scss` | Global + per-component tweaks |

The Foundations **Palette** and **Colors** doc pages render from
`src/stories/_tokens-data.js`. After editing the SCSS tokens, regenerate it:

```bash
node scripts/gen-tokens-data.mjs
```

## Storybook structure
The sidebar mirrors how product & design think — **primitives** plus **experience flows**:

- **Primitives:** Foundations · **Components** (Actions · Forms · Feedback & Status ·
  Layout & Structure · Media & Visuals · Typography & Content)
- **Experience flows:** App Shell · **Ticket Map** · **Package Details** ·
  Landing Page · Browse Hotels · Hotel Details · Checkout Experience ·
  Confirmation · Manage Booking

Read **Getting Started** first — **Introduction** (the IA + booking modes),
**Architecture & Conventions** (the machine map + mode-name cheat-sheet), and
**User Journey & Build Spec** (every stage of every flow, with edge cases).

Most experience flows follow the same shape: a top-level **Book Reservation** and
**Group Block** story (the composed page) plus a **Components** folder of the pieces
it's built from. Three booking modes run throughout — **reserve** (single stay,
charged) · **hold** (group/team block, *not* charged) · **reservations** (multiple
stays, charged). Highlights:

- **Ticket Map** — the unified **Browse Tickets** experience (listings rail +
  interactive seat map with a pin per listing, an all-inclusive filters dialog,
  per-filter dropdowns, a location legend, and a seat-detail view). A
  **Components** folder itemizes the building blocks, plus the ticketing +
  packages pieces (Event, Seat Map, Hotel Add-On, Packages, Bundle Cart).
- **Package Details** — a Hotel-Details-style page laying out every ticket /
  package offering for the event, broken into a Components folder.
- **Browse Hotels** — Booking Widget, Hotel Listing Card (Horizontal primary,
  Vertical legacy × Book Reservation + Group Block, each with three availability
  edge cases and an expandable room-availability panel), Result States, Search &
  Filters, Hotel Map (search-radius). A `count` control scales the results list.
- **Hotel Details** — the Hotel Detail Page plus its sections; the Room Cards
  (no image / no amenities; sold-out "Unavailable" state) and "Select Your Room"
  Rooms **grid**, split Book Reservation / Group Block.
- **Checkout Experience** — the stepped Checkout Page, per-step stories, the inline
  **Payment** form, and the **Policies** agreement — for Book Reservation, Group
  Block, **and the four ticketing types** (Tickets Only / Tickets + Hotel /
  Packages Only / Packages + Hotel). Group Block collects no payment.
- **Confirmation** — success banner + Summary + per-hotel Policies, for Book
  Reservation, Group Block, and the four ticketing types (Tickets + Hotel and
  Packages + Hotel bundle full hotel reservation details + policies).

## Imagery — using it in prototypes

Imagery lives in a **separate hosted repo** so it can be updated without
rebuilding the design system, and is mirrored by an in-repo gallery page:

- **Repo:** https://github.com/epprestodesign/presto-ds-imagery
- **Gallery page:** https://epprestodesign.github.io/presto-2026-ticketing/library/
- **Manifest:** `https://epprestodesign.github.io/presto-ds-imagery/manifest.json`
- **Images:** `https://epprestodesign.github.io/presto-ds-imagery/<category>/<file>.jpg`
- **Categories:** `seat-views` (stadium points-of-view) · `rooms · suites · lobby ·
  pool · spa · dining · bar · bathroom · exterior · views · destinations · guests ·
  amenities`

> **Tell Claude (or any prototype):** "Use imagery from the Presto DS imagery
> manifest at the URL above; pick by category; show the photographer `credit`."

### Option 1 — Any prototype (zero setup, recommended)
Fetch the hosted manifest at runtime and build image URLs. Works in plain JS,
React, Vue, an HTML file — anything:

```js
const BASE = 'https://epprestodesign.github.io/presto-ds-imagery'
const lib = await fetch(`${BASE}/manifest.json`).then(r => r.json())

// a specific category
const first = lib['seat-views'][0]       // { file, alt, credit, creditUrl }
const url   = `${BASE}/${first.file}`    // full image URL

// a random image from a category
function pickImage(category) {
  const arr = lib[category] || []
  const e = arr[Math.floor(Math.random() * arr.length)]
  return e ? { url: `${BASE}/${e.file}`, alt: e.alt, credit: e.credit, creditUrl: e.creditUrl } : null
}
// pickImage('pool').url
```
Vue/Quasar example:
```html
<q-img :src="pickImage('lobby').url" :ratio="16/9" />
```

### Option 2 — Inside this repo (use the helper)
```js
import { loadImagery, getImages, randomImage } from '@/lib/imagery.js'
const lib = await loadImagery()   // remote (VITE_IMAGERY_URL) or local fallback
getImages('rooms')                // [{ url, alt, credit, creditUrl }, ...]
randomImage('pool')?.url          // instant local-fallback pick
```
Set `VITE_IMAGERY_URL=https://epprestodesign.github.io/presto-ds-imagery` in `.env`
(see `.env.example`). Unset/offline → falls back to the committed set in
`src/assets/hotel/`.

### Option 3 — Live, on-the-fly (any query, needs an API key)
```html
<DsUnsplashImage query="hotel rooftop bar" :ratio="16/9" />
```
Requires `VITE_UNSPLASH_ACCESS_KEY` in `.env`. Best for prototypes that need an
image the curated library doesn't have yet. (Don't ship the key in a public build.)

### Add more imagery (no DS redeploy)
In the [imagery repo](https://github.com/epprestodesign/presto-ds-imagery):
`node build.mjs 12` → commit → push. GitHub Pages redeploys and prototypes /
Storybook pick up the new manifest on next load. When you add images, regenerate
the in-repo gallery under [`public/library/`](public/library/) to keep it in sync.

**Attribution:** always surface the `credit` (and link `creditUrl`) where feasible —
required by the Unsplash API Guidelines. See [`docs/UNSPLASH.md`](docs/UNSPLASH.md).

## Deployment
Handled by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every
push to `main`. It builds Storybook and nests the extra surfaces under it before
publishing `storybook-static/` to GitHub Pages:

| Path | Built from | Notes |
| --- | --- | --- |
| `/` | `pnpm build-storybook` | The design system |
| `/prototype/` | [`prototype/`](prototype/) | Booking journey app |
| `/bundle/` | [`bundle/`](bundle/) | Ticket + hotel bundle app |
| `/hub/` | [`hub/index.html`](hub/) | Experience directory |
| `/library/` | [`public/library/`](public/library/) | Imagery gallery (via `staticDirs`) |

Pages is already enabled (**Settings → Pages → Source: GitHub Actions**). The
prototype/bundle builds read `VITE_IMAGERY_URL`; the Google Maps key is a repo
secret restricted by HTTP referrer.
