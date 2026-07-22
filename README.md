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
| **Experience Hub** | Landing directory linking every prototype | https://epprestodesign.github.io/presto-2026-ticketing/hub/ |
| **Booking Journey** | Clickable end-to-end **hotel booking** prototype | https://epprestodesign.github.io/presto-2026-ticketing/prototype/ |
| **Ticket + Hotel Bundle** | Clickable **ticket + hotel bundle** prototype | https://epprestodesign.github.io/presto-2026-ticketing/bundle/ |
| **Imagery Library** | Gallery of the hosted stadium + hotel photography | https://epprestodesign.github.io/presto-2026-ticketing/library/ |
| **Imagery Host** | Separate Pages repo serving the runtime image manifest | https://epprestodesign.github.io/presto-ds-imagery/ |

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
