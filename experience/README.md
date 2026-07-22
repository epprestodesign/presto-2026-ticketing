# Experience prototype — Tickets + Packages journey

A stepper-guided, end-to-end clickable prototype that integrates the **ticket**
and **package** experiences into one Presto flow. Like the sibling
[`/prototype`](../prototype) and [`/bundle`](../bundle) apps, it's a self-contained
Vite app that imports the **real library components** via the `@lib` alias —
nothing is copied or forked, and no library files are modified.

Deployed as a Storybook sub-page at
`https://epprestodesign.github.io/presto-2026-ticketing/experience/`.

## The journey

Leads with the real **Landing Page** (its own nav), then a persistent App Shell
**Stepper** (`AppStepper`, labels Stays · Tickets · Review) sits on top of every
subsequent screen while each library page renders **bare** beneath it (its own
nav/frame dropped) so the stepper stays the constant guide.

| Stepper stage | Screen | Library page |
| --- | --- | --- |
| — (intro) | Landing (Teams widget, **no booking-type dropdown**) | `LandingPage` |
| **Stays** | Browse Hotels (Core Booking Widget) | `browse/HotelListPage` |
| **Stays** | Hotel Details (opened from a hotel card) | `details/HotelDetailPage` |
| **Tickets** | Browse Tickets (+ "How many tickets?" prompt) | `TicketMap` + `TicketQuantityDialog` |
| **Review** | Cart (two-column, checkout-style) | `CartReview` + `checkout/OrderSummary` |
| **Review** | Checkout | `checkout/CheckoutPage` (mode `ticketing`) |
| **Review** | Confirmation | `confirmation/ConfirmationPage` (mode `ticketing`) |

Cart / checkout / confirmation data comes from the shared ticketing fixtures
(`stories/ticketing/_ticketing-flow-carts.js` etc.), so the prototype matches the
corresponding Storybook stories exactly.

**Navigation:** there is no footer action bar. Forward nav comes from each page's
own CTAs — Search, a hotel card's name / "Choose Your Room", "Reserve Room", the
map's "Continue", the cart's "Continue to checkout", checkout's "Book Now" — routed
by a capture-phase click handler in `App.vue` (zero library changes). The clickable
**stepper** jumps between Stays / Tickets / Review, and the **EventPipe wordmark**
returns to Landing.

## Architecture

- **`src/store.js`** — the single reactive journey + a linear router
  (`next`/`back`/`goToStage`), the stage↔screen mapping, and the derived
  **combined cart** (a hotel line + a ticket line + a package line, whichever
  were added) in the shared ticketing-cart shape.
- **`src/App.vue`** — the shell: `GlobalNav` + `AppStepper` + the active screen.
- **`src/components/FlowBar.vue`** — the shared sticky Back / Continue bar.
- **`src/screens/*`** — thin wrappers around the library page components.

## Run locally

```bash
# from the repo root (deps already installed there)
cd experience
node ../node_modules/vite/bin/vite.js --port 6200
# → http://localhost:6200
```

Deep-link any screen for demos/screenshots:
`?screen=checkout&guests=4` (screens: `landing`, `hotels`, `hotelDetails`,
`tickets`, `cart`, `checkout`, `confirmation`). The current step is also written
back into the URL as you navigate, so every step is copy-paste shareable.

## Notes

- **Selection is simplified:** forward nav is driven by the Stepper + the FlowBar
  Continue bar; the cart/checkout/confirmation use the shared Tickets + Hotel
  ticketing fixtures rather than the specific hotel/seat the guest browsed. Wiring
  live selections through is the natural next step.
- The interactive hotel map needs a Google Maps key at runtime (falls back to a
  "key needed" box in local dev, same as the other apps).
