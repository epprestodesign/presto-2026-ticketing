# Aug 4 - Option A — Hotel + Packages journey (working copy)

A **duplicate of [`/experience-packages`](../experience-packages)** forked on
**August 4, 2026** as a sandbox for Mike's edits. Identical starting point — the same
stepper-guided, end-to-end clickable prototype pairing a **hotel** stay with an
**experience package** — but it evolves independently, so changes here never touch
the original. Like [`/prototype`](../prototype) and [`/bundle`](../bundle), it's a
self-contained Vite app importing the **real library components** via the `@lib`
alias — nothing is copied or forked from the library, no library changes.

Deployed as a Storybook sub-page at
`https://epprestodesign.github.io/presto-2026-ticketing/option-a/`
(local dev on port **6400**).

## Documented in Storybook

Every component here is documented under the **Aug 4 Changes** category:

**▶ https://epprestodesign.github.io/presto-2026-ticketing/?path=/docs/aug-4-changes-overview--docs**

| Category | Stories |
| --- | --- |
| Overview | What changed · the flow · the pricing model · overrides & patches · link to the live prototype |
| Package Details | Package Modal · Package Result Card · Tier Picker · Hotel &amp; Room Selection · Booking Summary · Hotel Availability · Detail Blocks |
| Booking Widget | Guests Dropdown · Core Widget · Library original (before) |
| Foundations | Carousel |

Stories live in [`stories/`](stories/) beside the components. Storybook picks them up
via a glob and the `@lib` alias added to [`.storybook/main.js`](../.storybook/main.js) —
the only shared file this prototype touches.

## How this copy differs from `/experience-packages`

| Change | Where |
| --- | --- |
| **Guests dropdown** — the Travelers popover is a plain **1–8+ "Guests"** select, tied to the packages page's own Guests control through the journey store | [`src/components/BookingWidget.vue`](src/components/BookingWidget.vue) |
| **Gameday dates** — the date field defaults to the event weekend (Sep 19 – 21) instead of today + 7, and the flexible-date pills are gone | [`src/components/BookingWidget.vue`](src/components/BookingWidget.vue) |
| **Packages-first flow** — Landing → Packages → Checkout; the Package Details page is retired in favour of the package modal | [`src/store.js`](src/store.js) |
| **Invitation copy** — the landing description is a one-paragraph invite; "Who's Attending?" removed | [`src/screens/LandingScreen.vue`](src/screens/LandingScreen.vue) |
| **New event throughout** — Pittsburgh Steelers at New England Patriots · Sun, Sep 20, 2026 · 1:00 PM · Gillette Stadium, replacing Patriots v Bills · Dec 6 | [`src/event.js`](src/event.js) |
| **New hero imagery** — the event's own Ticketmaster artwork behind the Landing, Browse Hotels and Browse Packages banners | [`src/assets/event-hero.jpg`](src/assets/) |
| **Stay dates moved** to the new gameday weekend (Sat Sep 19 → Sun Sep 20) in checkout and confirmation | [`src/fixtures.js`](src/fixtures.js), `retime()` in `src/event.js` |

**The library is still untouched.** Where library components take props, the screens
pass this app's event in. Two things aren't prop-driven — the hero photo (a hardcoded
asset import) and Browse Hotels' event header (two module constants) — so
[`vite.config.js`](vite.config.js) redirects the asset and patches those two lines as
the file is read, in this app's build only. If the library renames the constants the
build **fails loudly** rather than silently showing the wrong event. Storybook and the
sibling prototypes are unaffected.

## The journey — packages lead

Leads with the real **Landing Page** (its own nav), whose Search goes straight to
**Browse Packages**. A persistent App Shell **Stepper** (`AppStepper`, two labels:
Packages · Review) sits on top of every subsequent screen while each library page
renders **bare** beneath it.

| Stepper stage | Screen | Library page |
| --- | --- | --- |
| — (intro) | Landing (Teams widget, **no booking-type dropdown**) | `LandingPage` |
| **Packages** | Browse Packages — **mixed** with/without hotel (+ "How many guests?" prompt) | `PackageListPage` |
| **Packages** | (the package modal — no separate details page) | local `PackageQuickViewDialog` |
| **Review** | Checkout — what was configured | `checkout/CheckoutPage` (mode `ticketing`) |
| **Review** | Confirmation | `confirmation/ConfirmationPage` (mode `ticketing`) |

### The package modal (replaces the Package Details page)

Opening a row raises one scrollable sheet that carries everything the old details
page did, in an OTA room-information layout:

It's **full screen** (the dialog is patched to `maximized`, sliding up from the
bottom) and splits in two:

- **Left** — photo carousel, package name, what's-included icon grid, specs, and
  beneath them the **booking summary**: a guest stepper, itemised line items, bundle
  savings, the total, and **Reserve**, which goes straight to Checkout.
- **Right** — the choices: a **tier picker** (Club / Lower / Mezzanine / Upper, with
  per-ticket and party totals), **the package's 4 hotels each expanding to its room
  types** (bed, sq ft, sleeps, view, rooms left, per-room amenities), **paid extras**,
  then the written detail — itemised inclusions, a gameday timeline, and policies.

**Package-only SKUs use both columns too** — they simply have no hotels block.

**Everything re-prices live** (`src/pricing.js`): the ticket portion is
`tier.price × guests`, the room sets the nightly rate, the baked-in experience value
holds, and the package's own bundle-discount rate is re-applied — so Club Level for
2 is $1,074 while Upper Level for 2 is $604 and Club for 8 is $2,929. Paid extras sit
outside the bundle. The same numbers flow to the cart, checkout and confirmation.

**Hotel and brand names are links.** They open Hotel Details in a **new tab** as a
read-only reference: photos, amenities, rooms, location, policies, with a banner
saying it's information only and every booking CTA suppressed. The room choice
belongs to the package modal in the original tab.

### Two paths through Packages

The grid mixes both shapes — of nine SKUs, **five include a stay and four are
package-only** (`src/packages.js` strips the hotel from the rest using the library's
own `stripHotel`, so the package-only prices stay consistent). The card itself shows
the hotel line only when there is one.

- **Package only** → the modal has no hotels/rooms block; Reserve goes straight to
  **Checkout** with no stay in the cart.
- **Package + hotel** → the row shows a rooms-availability line and an
  **Availability** toggle that expands the library's `RoomAvailability` carousel
  in place (rooms left per night, same as the Browse Hotels group card). The full
  hotel/room choice happens in the modal.

**Browse Hotels is no longer a stage**, and **neither is Package Details** —
`?screen=packageDetails` redirects to `?screen=packages`. `?screen=hotels` and
`?screen=hotelDetails` still render (deep links and the read-only reference view)
but sit outside the stepper.

**Deep links:** `?screen=packages&pkg=<id>` reopens a package's modal;
`&room=<hotelId>&roomType=<typeId>&tier=<tierId>&guests=<n>` restore everything
chosen inside it. `pkg` is dropped the moment the modal closes, so a dismissed modal
never re-opens on reload.

Checkout / confirmation data is built from **this app's event** (`src/fixtures.js` →
`cartFor(pkg, hotel, room, extra)`), not the library's December sample.

**Navigation:** no footer action bar. Forward nav comes from each page's own CTAs —
Search, a package row, the modal's "Reserve", checkout's "Book
Now" — routed by a capture-phase click handler in `App.vue`. The clickable
**stepper** jumps between Packages / Review, and the **EventPipe wordmark** returns
to Landing.

## Architecture

- **`src/store.js`** — the single reactive journey + a linear router
  (`next`/`back`/`goToStage`), the stage↔screen mapping, the chosen package and
  room, and URL sync (`?screen=` · `&pkg=` · `&room=` · `&roomType=`).
- **`src/App.vue`** — the shell: `GlobalNav` (cart follows the configured package +
  room) + `AppStepper` + the active screen + the click router + Clear-Cart dialog.
- **`src/screens/*`** — thin wrappers around the library page components.
- **`src/event.js`** — the canonical event, display strings, and `retime()`.
- **`src/packages.js`** — the mixed package board (with/without hotel).
- **`src/hotelOptions.js`** — a package's hotels: photos, amenities, distance, and
  the nightly difference against the package's own hotel.
- **`src/rooms.js`** — room types per hotel (bed, size, sleeps, view, amenities,
  rooms left) plus the paid extras.
- **`src/pricing.js`** — the ticket tiers and `priceConfig()`, which re-prices a
  package against tier · guests · hotel · room · extra.
- **`src/packageDetail.js`** — itemised inclusions, the gameday timeline, policies.
- **`src/configured.js`** — resolves the store's ids into the chosen package,
  hotel, room and extra, so every screen reads one source.
- **`src/fixtures.js`** — `cartFor(pkg, hotel, room, extra)`, the configured cart.
- **`src/components/`** — the local forks: `BookingWidget` (Guests dropdown, event
  dates, no flexible-date pills), `PackageResultCard` (horizontal row + inline
  availability) and `PackageQuickViewDialog` (the full package modal).

## Run locally

```bash
# from the repo root (deps already installed there)
cd option-a
node ../node_modules/vite/bin/vite.js --port 6400
# → http://localhost:6400
```

Deep-link any screen for demos/screenshots:
`?screen=checkout&guests=4` (screens: `landing`, `packages`, `checkout`,
`confirmation`, plus the off-flow `hotels` / `hotelDetails`). Add `&skip=1` for the
legacy hotel-only checkout. The current step is written back into the URL as you
navigate, so every step is copy-paste shareable.

## Notes

- **Selections now flow through:** the package, hotel, room type and extra chosen in
  the modal drive the cart, checkout and confirmation. What does NOT flow through is
  the guest count — the package cards re-price by guests, but the cart is built from
  the package's own `quantity`.
- The interactive hotel map needs a Google Maps key at runtime (falls back to a
  "key needed" box in local dev, same as the other apps).
