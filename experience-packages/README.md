# Experience prototype — Hotel + Packages journey

A stepper-guided, end-to-end clickable prototype pairing a **hotel** stay with an
**experience package**. It's the sibling of [`/experience`](../experience) (Hotel +
Tickets) with packages in place of tickets. Like [`/prototype`](../prototype) and
[`/bundle`](../bundle), it's a self-contained Vite app importing the **real library
components** via the `@lib` alias — nothing is copied or forked, no library changes.

Deployed as a Storybook sub-page at
`https://epprestodesign.github.io/presto-2026-ticketing/experience-packages/`
(local dev on port **6300**).

## The journey

Leads with the real **Landing Page** (its own nav), then a persistent App Shell
**Stepper** (`AppStepper`, labels Stays · Packages · Review) sits on top of every
subsequent screen while each library page renders **bare** beneath it.

| Stepper stage | Screen | Library page |
| --- | --- | --- |
| — (intro) | Landing (Teams widget, **no booking-type dropdown**) | `LandingPage` |
| **Stays** | Browse Hotels (Core Booking Widget) | `browse/HotelListPage` |
| **Stays** | Hotel Details (opened from a hotel card) | `details/HotelDetailPage` |
| **Packages** | Browse Packages (+ "How many guests?" prompt) | `PackageListPage` |
| **Packages** | Package Details (opened from a package card) | `PackageDetailPage` |
| **Review** | Checkout — Packages + Hotel | `checkout/CheckoutPage` (mode `ticketing`) |
| **Review** | Confirmation — Packages + Hotel | `confirmation/ConfirmationPage` (mode `ticketing`) |

**Skip:** the "How many guests?" prompt has a "Skip, I don't need a package" link
that routes to the **hotel-only** Book Reservation checkout (`mode="reservation"`).

Checkout / confirmation data comes from the shared ticketing fixtures
(`stories/ticketing/_ticketing-flow-carts.js` — `packagesHotelCart`, `pkgHotel`), so
the prototype matches the corresponding Storybook stories exactly.

**Navigation:** no footer action bar. Forward nav comes from each page's own CTAs —
Search, a hotel card, "Reserve Room", a package card, checkout's "Book Now" — routed
by a capture-phase click handler in `App.vue`. The clickable **stepper** jumps
between Stays / Packages / Review, and the **EventPipe wordmark** returns to Landing.

## Architecture

- **`src/store.js`** — the single reactive journey + a linear router
  (`next`/`back`/`goToStage`), the stage↔screen mapping, `skipPackage`, and URL
  sync (each step ↔ `?screen=`).
- **`src/App.vue`** — the shell: `GlobalNav` (with the packages+hotel cart button)
  + `AppStepper` + the active screen + the click router + the Clear-Cart dialog.
- **`src/screens/*`** — thin wrappers around the library page components.

## Run locally

```bash
# from the repo root (deps already installed there)
cd experience-packages
node ../node_modules/vite/bin/vite.js --port 6300
# → http://localhost:6300
```

Deep-link any screen for demos/screenshots:
`?screen=checkout&guests=4` (screens: `landing`, `hotels`, `hotelDetails`,
`packages`, `packageDetails`, `checkout`, `confirmation`). Add `&skip=1` for the
hotel-only checkout. The current step is written back into the URL as you
navigate, so every step is copy-paste shareable.

## Notes

- **Selection is simplified:** forward nav is driven by the stepper + each page's
  own CTAs; checkout/confirmation use the shared `packagesHotelCart` fixture rather
  than the specific hotel/package the guest browsed. Wiring live selections through
  is the natural next step.
- The interactive hotel map needs a Google Maps key at runtime (falls back to a
  "key needed" box in local dev, same as the other apps).
