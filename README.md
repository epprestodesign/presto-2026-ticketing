# Presto DS

A **Quasar + Vue 3 design system**, documented and QA'd in **Storybook**, themed
for a consumer **hotel booking & reservation** experience ("Presto Design System").

- **Stack:** Vue 3 · Quasar 2 · Storybook 10 · Vite 6 · pnpm
- **Font:** PT Sans (400 / 700)
- **Brand:** primary **Navy `#01113E`** · neutrals **Slate** · page canvas `#F9F9FA`
- **Shape:** uniform **4px** radius system (pills reserved for chips / rounded buttons)
- **Color system:** Tailwind-based 3-tier tokens (primitives → semantic → Quasar bridge)

## Live docs
Storybook is published to GitHub Pages on every push to `main`:

**https://epprestodesign.github.io/presto-2026/**

## Interactive prototype
A clickable, end-to-end **booking journey** built entirely from the real library
components (zero forks) — all three modes: **Book Reservation**, **Group Block**,
and **Multiple Reservations**. Search hotels on a live Google map, filter, pick
rooms, checkout, and confirm, at 1440px.

**▶ Launch: https://epprestodesign.github.io/presto-2026/prototype/**

It's deployed alongside Storybook (also linked from the Storybook **Getting
Started → Introduction** page). Source lives in [`prototype/`](prototype/) — a
small Vite app that imports the library from `../src` via the `@lib` alias and has
no dependencies of its own (they resolve from this repo's `node_modules`).

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
- **Experience flows:** App Shell · Landing Page · Browse Hotels · Hotel Details ·
  Checkout Experience · Confirmation · Manage Booking

Read **Getting Started** first — **Introduction** (the IA + booking modes),
**Architecture & Conventions** (the machine map + mode-name cheat-sheet), and
**User Journey & Build Spec** (every stage of every flow, with edge cases, for
building the localized prototype).

Every experience flow follows the same shape: a top-level **Book Reservation** and
**Group Block** story (the composed page) plus a **Components** folder of the pieces
it's built from. Three booking modes run throughout — **reserve** (single stay,
charged) · **hold** (group/team block, *not* charged) · **reservations** (multiple
stays, charged). Highlights:

- **Browse Hotels** — Booking Widget, Hotel Listing Card (Horizontal primary,
  Vertical legacy × Book Reservation + Group Block, each with three availability
  edge cases and an expandable room-availability panel), Result States, Search &
  Filters, Hotel Map (search-radius). No pagination on the composed pages.
- **Hotel Details** — the Hotel Detail Page plus its sections; the Room Cards
  (no image / no amenities; sold-out "Unavailable" state) and "Select Your Room"
  Rooms **grid** (not a carousel), split Book Reservation / Group Block.
- **Checkout Experience** — the stepped Checkout Page, per-step stories, the inline
  **Payment** form (credit card only; the old Payment Dialogs live under **Old
  Designs**), and the **Policies** agreement (single-hotel / group single-checkbox
  / multi-hotel per-hotel checkboxes). Group Block collects no payment.
- **Confirmation** — success banner + Summary + per-hotel Policies (Book
  Reservation / Group Block).

## Imagery — using it in Claude prototypes

Hotel imagery lives in a **separate hosted repo** so it can be updated without
rebuilding the design system:

- **Repo:** https://github.com/epprestodesign/presto-ds-imagery
- **Manifest:** `https://epprestodesign.github.io/presto-ds-imagery/manifest.json`
- **Images:** `https://epprestodesign.github.io/presto-ds-imagery/<category>/<file>.jpg`
- **Categories:** `rooms · suites · lobby · pool · spa · dining · bar · bathroom ·
  exterior · views · destinations · guests · amenities`

> **Tell Claude (or any prototype):** "Use hotel imagery from the Presto DS imagery
> manifest at the URL above; pick by category; show the photographer `credit`."

### Option 1 — Any prototype (zero setup, recommended)
Fetch the hosted manifest at runtime and build image URLs. Works in plain JS,
React, Vue, an HTML file — anything:

```js
const BASE = 'https://epprestodesign.github.io/presto-ds-imagery'
const lib = await fetch(`${BASE}/manifest.json`).then(r => r.json())

// a specific category
const first = lib.rooms[0]               // { file, alt, credit, creditUrl }
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
In the imagery repo: `node build.mjs 12` → commit → push. GitHub Pages redeploys
and prototypes / Storybook pick up the new manifest on next load.

**Attribution:** always surface the `credit` (and link `creditUrl`) where feasible —
required by the Unsplash API Guidelines.

## Deployment
Handled by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): builds
Storybook, builds the [`prototype/`](prototype/) app (nested at `/prototype/`), and
publishes `storybook-static/` to GitHub Pages on every push to `main`. Pages is
already enabled (**Settings → Pages → Source: GitHub Actions**).
