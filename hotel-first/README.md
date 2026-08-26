# Aug 25 - Hotel First — a tournament trip, bought in one order

The **Aug 25 edge-case round**, case #2: *hotel → event tickets → destination add-ons*.
A cheer family flies to Orlando for a national tournament. They book a room the way they
always book a room, add admission for the days their athlete competes, add a Disney day for
the Monday after finals, and pay for all three once.

Forked from [`experience/`](../experience) on **August 25, 2026**. Like every prototype
here it's a self-contained Vite app importing the **real library components** via the
`@lib` alias — nothing is copied or forked from the library, and **no library file on disk
is changed**. (One is *rewritten as it is read*, for this app only, so the landing hero can
carry the event's own artwork — see [The event's own
artwork](#the-aug-26-round-the-events-own-artwork).)

Deployed at `https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/`
(local dev on port **6900**).

## The flow

```
Landing ──▶ Browse Hotels ──▶ Hotel Details ──▶ Tickets ──▶ Add-Ons ──▶ Checkout ──▶ Confirmation
            (the block)       (pick a room)     (passes)    (Orlando)   (one cart)   (one itinerary)
 └── Stay ──────────────────────────────────┘ └ Tickets ┘ └ Add-Ons ┘ └────── Review ──────┘
```

Four stepper stages, seven screens. The room is chosen **before any ticket exists**, which
is the reverse of every other ticketing flow in this repo and the whole reason this case
was worth building.

Hanging off every one of those screens, reachable from the nav, is the cart:

```
[nav cart · live count] ──▶ Cart peek (slide-over) ──▶ Cart page (?screen=cart)
                             what's in the order          where it's changed
```

The cart page is **not** a stepper stage. It is a detour you can take from any step and be
returned to the step you left — see [Nav, peek, page](#nav-peek-page).

**Two exits, both first-class.** Tickets can be skipped entirely (`Skip — I only need the
room`), and so can add-ons (`Continue without add-ons`, sitting in the rail from the moment
the screen loads, not buried under six cards). Hotel-first means the room is allowed to be
the whole purchase.

## The Aug 25 stakeholder round

Three changes, all of them removals. The flow, the screens and the Orlando framing were
signed off as-is — what came back was about *controls*, not structure.

| Asked for | What changed |
| --- | --- |
| *"I don't want this next. I want one big form… we're definitely getting rid of that step, step, step for a full open."* | Checkout mounts **`CheckoutPageExpanded`** instead of the stepped `CheckoutPage`. Contact, Payment, Review your order and Policies are all open at once, every field in its input state, **one Book Now at the bottom**. The right-hand rail is byte-identical — the expanded page shares it. |
| *"If I select two people, these numbers should default to two."* | **Party size is now the only quantity in the flow.** Every pass and every add-on follows it and nothing can diverge from it — the per-line steppers are gone. |
| *"I never want to have this as a pop-up… we're always going to want a clean page."* | **Zero pop-up layers.** The map's fullscreen `DsModal` became an in-page view of Browse, and the Clear Cart `q-dialog` became an in-page confirmation bar. |
| *(follow-up)* — the cart should be a **slide-over peek with a full page behind it** | **One overlay, added back on purpose.** The nav cart opens [`CartPeek`](src/components/CartPeek.vue); the peek hands you to a real [cart page](src/screens/CartScreen.vue) where the order is edited. Nothing else became a pop-up: the map is still an in-page panel and Clear Cart is still an in-page bar. |
| *(follow-up)* — the **"Time left to book" countdown should be pinned and always in the viewport**, on all four prototypes | **The hold floats.** Checkout mounts the library's [`HoldTimerPill`](../src/components/HoldTimerPill.vue) fixed bottom-right, and **the rail's own copy of the countdown is hidden** — see [The hold countdown is pinned](#the-hold-countdown-is-pinned). |

## The Aug 26 round: the event's own artwork

The prototype now wears the real event's brand — the **Varsity Spirit National School
Spirit Championships** shield, over the supplied cheer-squad banners — on all four
screens the guest sees before checkout.

| File supplied | Copied to | Used on |
| --- | --- | --- |
| `01-logo_200x200.png` (actually **400×400**, transparent) | [`src/assets/event/spirit-logo.png`](src/assets/event) | All four screens |
| `01-BANNER_1440x400.png` (actually **2880×800**, i.e. @2x) | [`src/assets/event/spirit-banner-hero.png`](src/assets/event) | **Landing** hero |
| `01-BANNER_1440x240.png` (**1440×240**, 1×) | [`src/assets/event/spirit-banner-band.png`](src/assets/event) | **Stay**, **Tickets**, **Add-Ons** headers |

The files are **copied into the app**, not imported from `references/` — that folder is
gitignored, so an import from it builds on the machine that has it and breaks everywhere
else. [`src/brand.js`](src/brand.js) is the one place they are named; new artwork is a
three-file swap with no other edits.

**One assumption to confirm.** The stakeholder's note named the hotels screen against
*both* banners. The tall 400 is a landing hero and the short 240 is a header band, so the
split above is the reading applied: landing gets the 400, the three in-flow screens get the
240. If Stay was meant to carry the tall banner too, it is a one-line change.

### The landing hero, and why it needed a build-time patch

`LandingPage` is a library component and it **hardcodes both** its hero background and its
hero logo as module imports, with no prop for either. Three ways in were considered:

| Approach | Verdict |
| --- | --- |
| Scoped `:deep()` from `LandingScreen.vue` | **Rejected.** It reaches the background and (via `img { content: url(…) }`) even the logo — but *not* the `alt`, which would have stayed `"EventPipe"`. Sighted guests would see the Spirit shield while a screen reader announced the wrong organisation. On a *branding* round that is the exact failure the work exists to prevent. It also fails **silently** if the library renames a class. |
| The `OVERRIDES` map — fork the whole component | **Rejected.** ~250 lines forked to change three. The nav, the widget, five prose sections, the ads and the footer would all stop tracking upstream. `OVERRIDES` earns that when a component's whole *body* is wrong for the app; here only three literals are. |
| **`PATCHES` — rewrite the three literals as the file is read** | **Chosen.** The two image imports and the hero `alt` are swapped in [`vite.config.js`](vite.config.js). The component still tracks the library for everything else, and the alt text is real: *"Varsity Spirit National School Spirit Championships"*. |

**What it costs:** this app now depends on three exact strings in a library file it does
not own. When the library moves them **the build fails**, naming the file and the missing
string — verified, not assumed. That loud failure is the thing being bought; a
silently-wrong hero is the thing being traded away. The second cost is discoverability, so
`LandingScreen.vue` carries a comment pointing at the patch.

The library file on disk is still **not edited**, and no other app in the repo sees the
rewrite — the plugin is scoped to this app's config, the same mechanism `package-customize`
declares next door.

### Sizing the crest

The mark it replaced was the EventPipe **wordmark**: wide, one line, white, legible at
30–44px. The Spirit artwork is a near-square **shield stacking four tiers of type**. At the
wordmark's height those tiers fall under a pixel and the crest is a blue smudge — so it
gets its own scale, and the two contexts get **different** numbers:

| Context | ≥1101px | ≤1100px | Why |
| --- | --- | --- | --- |
| Landing hero (400px band) | **156px** | 132px | The only bound is the booking widget, which tucks 48px up onto the hero; at 156 the centred stack still clears it |
| Stay / Tickets / Add-Ons band | **110px** | 96px | 110 makes the header section exactly **240px** — the natural height of the 1440×240 banner, so at 1440 it renders **1:1 with no crop** |

**Sharpness.** The source is 400×400, so at a 2× device pixel ratio 156px asks for 312
device px and 110px asks for 220 — both inside 400. Neither context upscales. The ceiling
is 200px CSS.

**Treatment.** The crest is full-colour on transparency, unlike the white wordmark, so it
was checked against the scrimmed photograph rather than assumed. Its outermost stroke is a
dark navy that *does* sink into a dark hero — but the bright yellow rim immediately inside
it carries the silhouette on its own, so **no plaque is needed**. A white plaque was tried
and dropped: it reads as a sticker on the photograph and puts a second white rectangle
directly above the booking widget's white card. A `drop-shadow` does the same separation
job for the dark stroke at a fraction of the weight. `opacity: .95` was removed with the
wordmark — knocking a white logotype back a hair stops it shouting; doing it to a colour
crest just makes the brand look faded.

**Scrim.** The three in-flow screens carried two different values (50% and 55%) for no
recorded reason; that is now one, **52% black**, in `brand.js`. A navy tint suits the
duotone artwork better and was tried — but the landing hero's scrim is a literal inside the
library and would have needed a *fourth* patched string. The screen that cannot be tuned
decides the value, because the four have to look like one site.

**Checked at 1440 and 1100** on all four screens: nothing wraps, nothing overflows, the
event name and dates stay legible over the artwork, and the Add-Ons band is re-skinned
rather than removed. One known limit: the 240 band is a **1× file**, so above 1440 (and on
retina) it softens. Only new artwork fixes that — the hero banner, being @2x, does not.

### The landing lockup: "bring in the logo with the text"

The first pass got the crest's **size** right and then left it floating. The stakeholder's
follow-up — *"bring in the logo with the text … and make it more vertically aligned and
vertically centered"* — is two separate faults, and both were measured on the rendered page
rather than eyeballed.

**Fault 1 — the crest read as a logo with a caption.** At 1440 the gap from the shield's
lowest **ink** to the cap line of *"Sunshine State Spirit Nationals 2027"* was **40px**:
1.2× the heading's own 33.6px cap height. Only half of that was declared. The rest was
space nobody had written down:

| Contribution | px at 156 | Where it came from |
| --- | --- | --- |
| `margin-bottom` | 20.0 | The stylesheet — the only part that was visible to whoever tuned it |
| Transparent PNG below the shield | 9.75 | `spirit-logo.png`'s alpha box is inset **25/400** at the bottom |
| Heading half-leading above its cap line | 10.4 | `text-h3` at 48px/1.1 |
| **Apparent gap** | **40.15** | |

So 20px of margin was buying 40px of apparent space. The margin is now written as a
**target optical gap minus the two invisible contributions**, because a raw number here is
a lie and the next person to nudge it would be tuning something that means nothing on
screen:

```css
--crest-trim-b: calc(var(--crest-h) * 0.0625);   /* 25/400 of transparent PNG */
--h1-lead: 10.4px;                               /* measured, not derived     */
margin-bottom: calc(18px - var(--h1-lead) - var(--crest-trim-b));
```

**Why 18px**, judged against the type rather than picked: it is **0.53× the heading's cap
height**, and it lands on the same value as the gap already sitting between the heading's
ink and the dates' ink (**17.96px**, measured). Crest, name and dates therefore share one
rhythm — one stack, not a mark plus a two-line block. Against the ~57px of clear
photograph above and below the pair, the spacing inside the lockup is roughly **1:3** to
the space around it, which is what makes the eye take it as a single mark.

**Fault 2 — the crest was off the vertical axis.** The shield is **not centred in its own
canvas**: the opaque pixels span x 47–374 of 400, i.e. 11/400 right of centre. `margin: 0
auto` centres the *box*, so at 156px the mark sat **4.3px right** of the axis the heading
and dates are centred on. Corrected with `transform: translateX(-2.75%)` — a percentage of
the element's own width, so it is right at 156, 132 and 104 without being restated.
Measured axis error after: **0.01px**.

**Fault 3 — centred on the wrong box.** The booking widget's card is pulled onto the hero
with `margin-top: -48px`, so the bottom 48px of the 400px band is covered. The **visible**
band is 352px and its centre is 24px above the box's. The lockup's ink centre measured
**y=273** against a visible centre of **y=249** — 24px low, exactly as the box-centring
predicts, and not something crest sizing could ever fix.

The fix declares the occlusion instead of nudging past it:

```css
:deep(.lp__hero-inner) { --widget-overlap: 48px; padding-bottom: var(--widget-overlap); }
```

The library's own `align-items: center` then lands the **content** centre on the visible
centre. Rejected: `translateY(-24px)` or a negative margin — both are a constant guess
bolted onto a centring that is still wrong, and both break when the lockup grows (the
heading wraps to two lines below ~700). The card is 992px wide and the lockup at most
820px, both centred, so the lockup sits entirely inside the covered column — 352px is the
right band for it, not an average across the full 1440.

**Measured after, at three viewports:**

| | 1440×900 | 1100×900 | 1440×700 |
| --- | --- | --- | --- |
| Crest height | 156 | 132 | 156 |
| Crest ink → heading cap | 18.01px | 18.01px | 18.01px |
| Heading ink → dates cap | 18.20px | 18.20px | 18.20px |
| Axis error (crest ink vs text centre) | −0.01px | −0.01px | −0.01px |
| Lockup ink centre vs visible centre | −0.08px | −0.53px | −0.08px |
| Clear above shield / below dates | 57.5 / 57.7 | 67.9 / 68.9 | 57.5 / 57.7 |
| Hero height (must stay 400) | 400 | 400 | 400 |

Nothing overflows the band and nothing pushes the widget down: `1440×700` is identical to
`1440×900` because the hero is a fixed 400px band, and the widget card still ends at
y=529, well inside a 700px viewport. Also checked at 680 (the ≤700 breakpoint) where the
heading wraps to two lines — the lockup still centres to within ~1px and still clears the
card by 55px. The crest's four tiers of type stay legible at 156 and 132, and at an 18px
gap the shield's lowest ink clears the heading's ascenders with no collision.
`.bw__input input` still renders three fields, so `carryTravelers` is untouched.

**Scope.** This is a **landing-only** change. Both rules are scoped `:deep()` selectors in
[`LandingScreen.vue`](src/screens/LandingScreen.vue) hitting `.lp__hero-logo` and
`.lp__hero-inner`; the in-flow bands use their own `tix__` / `ao__` / `bhero` classes and
cannot be reached from there. **No shared value in `brand.js` changed** — the only edit
there is a comment recording that the artwork's alpha-box fractions are now depended on, so
a future artwork drop knows to re-measure them. The bands were re-measured anyway and are
unchanged: crest still 110px, band still 242.6px at 1440.

**No fourth `PATCHES` entry was needed.** Spacing and alignment are CSS's job; new markup
would have bought another exact-string dependency on a library file this app does not own,
for nothing. Both rules degrade harmlessly if the library renames a class — the crest falls
back to the library's 44px, the lockup to box-centring — rather than failing the build.

## Party size is the quantity

One number, chosen for the **room**, prices the whole trip. Change it anywhere and the
passes, the park tickets, the breakfasts, the nav cart, the checkout rail and the
confirmation all move in the same tick.

Where a stepper used to be, each line now **states the number it is following**:

```
Weekend Spectator Pass          4 guests — matches your party      4 × $89 = $356
Walt Disney World 1-Day         4 guests — matches your party      Add for 4 / Added
MCO Round-Trip Transfer         1 booking — covers your whole party
Athlete Credential Wristband    6 of 8 — only 6 credentials left
```

The mechanics, all in three places:

- `tierQty()` / `addOnQty()` in [`src/tickets.js`](src/tickets.js) and
  [`src/addons.js`](src/addons.js) derive a line's quantity from the party size. A per-guest
  product takes one per guest; the shared van is one booking that carries the party.
- `toggleTicket()` / `toggleAddOn()` in [`src/store.js`](src/store.js) replaced
  `setTicketQty(id, n)` / `setAddOnQty(id, n)`. A caller can say *in* or *out* — it can no
  longer hand in an arbitrary `n`, which is the API-level version of the same rule.
- `setGuests()` calls `repriceForParty()`, which re-derives **every already-selected line**
  in one pass. Lines at 0 stay at 0: a party change must never add something unasked.

Two honest exceptions, both said out loud on the line rather than resolved silently:

- **Inventory wins.** The athlete credential is rationed to 6, so a party of 8 gets 6, and
  the card and the cart both print `6 of 8 — only 6 credentials left`.
- **Per-booking units.** The airport van is one van for the party, not one per person.
  That is the same rule expressed in the product's own unit, not an exception to it.

The cart line is where this had one last hole. `CartReview` turns a ticket line into an
**editable quantity dropdown** exactly when the line carries `unitPrice`, so `itinerary.js`
now deliberately omits `unitPrice` and `maxQty` on ticket items. It was the last place a
line could still break away from the party size — a guest arriving at payment with four
park tickets and three passes — and dropping one field closes it with no library change.

## Nav, peek, page

<a id="nav-peek-page"></a>

Three surfaces, one cart object, no duplicated markup.

**1. The nav.** Every screen but Landing renders inside the library's real `PageFrame` →
`GlobalNav`, with the cart button forced on (`show-cart`) and `cart-mode="ticketing"`
against the live itinerary. The badge carries a **live count of the lines on the order** —
a room, a pass tier and two add-ons reads **4**. Not units: a party of four with those same
four lines would read 13, a number that is true of nothing the guest recognises, and
[`addons.js`](src/addons.js) had already made that call for `addOnCount`.

> `GlobalNav`'s badge is fed by whatever cart body it has open, and it has none until you
> click — so left alone it reads `0` for the whole flow. `App.vue` patches the number
> directly. It is a DOM patch because the alternative is editing the library, and the
> library is read-only here.

Landing is the one screen with no cart button: `LandingPage` hard-codes `show-cart="false"`
on its own nav, and that is the right answer anyway — the cart button is for an order in
progress.

**2. The peek** — [`CartPeek.vue`](src/components/CartPeek.vue). A right-hand slide-over:
the lines under their three section headings, `Subtotal · Fees · Taxes · Total`, and two
ways out — **View full cart** and **Go to checkout $x** — plus Clear cart. Escape closes it
and the page behind stops scrolling.

Its body is the library's real `CartReview` in `ticketing` mode — *the same component the
checkout rail renders*. What makes it a peek rather than a second copy of the cart page is
the **data**: it is fed `peekCart()` ([`itinerary.js`](src/itinerary.js)), the same items and
the same totals to the dollar with `details`, `hotelDetail` and `ticketDetails` stripped, so
the rows stay one line high and nothing expands. Compact by projection, not by a second row
template that could drift.

The library's own `CartFlyout` was tried first and rejected for two reasons: its footer is a
single hard-coded "Go to checkout" CTA with no event and no slot, so it could never offer the
route to the full cart page — which is the whole point of the change — and it carries a
15-minute "time left to book" countdown, a group-block hold device this flow does not obey.
Since `GlobalNav` hard-wires its cart button to `CartFlyout` and exposes no way to redirect
it, `App.vue` catches that click in the **capture phase** and stops it before it reaches the
button's own listener. `GlobalNav`'s `cartOpen` therefore never becomes true and its
`CartFlyout` never renders — which is what guarantees the peek is *the* overlay rather than
one of two stacked ones.

**3. The page** — [`CartScreen.vue`](src/screens/CartScreen.vue), at `?screen=cart`. A real
screen: the party control, then **Stay · Tournament admission · Orlando add-ons** as editable
rows, beside the library's real `OrderSummary` rail fed the *same* `buildSummary()` the
checkout page passes it. It carries no stepper — it is not a stage — and instead opens with
"Back to *the step you came from*", which it remembers (`journey.returnScreen`).

### Editing in place, under a locked quantity

Party size locks every quantity (`setTicketQty` / `setAddOnQty` were deleted so no caller can
pass an arbitrary number). So "editable in place" here means the two edits that **cannot make
the order disagree with itself**:

| Edit | Control | Why it's safe |
| --- | --- | --- |
| How many people | The party stepper, at the top of the page | `setGuests` re-derives *every* remaining line in one pass — four passes and four park days become two and two together |
| What's on the order | **Remove**, per line | It is `toggleTicket(id, false)` / `toggleAddOn(id, false)` — the same in/out toggle the Tickets and Add-Ons cards already expose, just placed where the guest is looking |

There is **no per-line stepper and no quantity dropdown anywhere in the cart**, and a removed
line does not leave a `0 ×` row you can nudge back up: the section falls back to an empty
state that links to the step it came from. An "add" affordance in the cart is one product
decision away from being a quantity affordance again.

The **room has no Remove**. Hotel-first means the stay is allowed to be the whole purchase,
but the purchase is never allowed to be everything *except* the stay — so the room offers
**Change room** and **Change hotel**, and the way to end up with no room is the same
*Clear cart & start over* that has always meant that. Rejected: a Remove that silently empties
the cart — a destructive action wearing the same word as the two beside it that only drop a
$59 breakfast.

## One overlay, on purpose

`hotel-first/` contains **zero** `DsModal` and `DsSidePanel` usages, and no `q-dialog`. The
**cart peek is the only overlay in the prototype**, and it is a deliberate, scoped reversal —
the stakeholder asked for it back by name. A cart you have to leave the page to look at is a
cart nobody checks mid-flow. Everything else stayed a page:

- **The block map.** "View Map" in the filter rail used to open a fullscreen `DsModal`.
  Browse now *switches*: the results column becomes
  [`HotelMapPanel`](src/components/HotelMapPanel.vue), the filter rail stays put and keeps
  working, and "Back to list" switches back. The dialog was the size of a page and was a
  place the guest spent real time — all the modal added was a scrim, a trapped scroll
  position and an X. Switching also fixes something the modal was quietly bad at: behind the
  scrim the rail was unreachable, so the map showed pins the guest could no longer filter.
  Radius is edited in the panel and committed by the rail's own Apply, so it behaves like
  every other field in the rail. Both maps share their marker/imagery mapping via
  [`src/mapdata.js`](src/mapdata.js) so the pins can't disagree.
- **Clear Cart.** Still confirmed rather than immediate — the cart holds a room, passes and
  attraction bookings, so an accidental clear costs three decisions — but the confirmation
  is a bar at the top of the frame, not a `q-dialog`. Asked from inside the peek, the peek
  closes first, because its scrim would otherwise have hidden the question. Clearing
  immediately with an Undo toast was rejected: Undo suits actions that are cheap to redo,
  and re-picking a property, a room, five tiers and three add-ons is not.

Verified by sweeping all eight screens with the app running and counting
`.q-dialog / .ds-modal / .ds-sidepanel / [role="dialog"] / .cf__panel` plus any viewport-sized
fixed element: zero on every screen, and exactly one (`.peek__panel`) once the nav cart is
clicked — never the library `CartFlyout` alongside it. The checkout screen's hold pill is
fixed but is not viewport-sized, takes no click and dismisses nothing, so it is not one of
these — the next section says why.

## The hold countdown is pinned

`CheckoutPageExpanded` ships *Time left to book* **inside the rail**, under the cart card.
That is exactly where it stops being useful: the moment the guest starts filling in contact
details and a card, the number scrolls off the top of the viewport — on the one screen where
it decides whether the room is still theirs. The stakeholder asked for it pinned and always
visible, on this prototype and its three siblings.

- **The library's own component, not a hand-rolled box.**
  [`HoldTimerPill`](../src/components/HoldTimerPill.vue) is mounted in
  [`CheckoutScreen.vue`](src/screens/CheckoutScreen.vue) exactly as the *Checkout Experience*
  stories mount it — `position="bottom-right"`, `running`, a `seconds` seed — with copy that
  fits this flow: **"Your room and rate are held while it runs."** It's a room and a
  contracted block rate being held here, not seats.
- **One hold, one clock.** The rail's `.ck__timer` block is **hidden** with a scoped
  `:deep()` rule in `CheckoutScreen.vue`. Two countdowns for one hold on one screen would be
  the same number printed twice — and they are two *separate* intervals (one inside
  `CheckoutPageExpanded`, one inside `HoldTimerPill`), so they start together and drift.
  Hidden in this app rather than removed from the library, which is read-only and shared
  with five other prototypes; a `showTimer` prop was rejected for the same reason.
- **Checkout only.** The pill is rendered by the checkout screen, not by
  [`App.vue`](src/App.vue), so it cannot outlive that screen. A hold countdown over the
  landing page, the hotel list, the cart page or — worst — the **confirmation** for an order
  already paid for would be alarming and untrue: nothing is being held once the receipt
  exists.
- **Fixed, and therefore free.** It reserves no space and pushes nothing; the layout is
  identical with it and without it.
- **Deterministic.** `seconds` is the same `cart.heldSeconds` that used to feed the rail — a
  fixed `895` in [`itinerary.js`](src/itinerary.js), never seeded off `Date.now()`, so every
  demo opens on the same 14:55.
- **A fixed pill is not a pop-up**, so it needs none of the cart peek's exception treatment.
  The no-pop-ups rule is about surfaces that *interrupt*: something that takes the screen,
  traps focus and must be dismissed before the guest can carry on. This takes no click,
  blocks nothing, dismisses nothing and can be ignored — page furniture anchored to the
  viewport instead of to the document, the same class of thing as the rail's own
  `position: sticky`. The cart peek is still the only overlay in this app.

**What it covers.** Measured at 1440×900 and 1440×700, scrolled to the bottom: the pill's
band is the bottom-right ~342×59px, and everything the guest acts on is clear of it. *Book
Now* and every form field are in the left column, which ends ~266px to the left of the pill;
the sticky rail's bottom — *Total* included — is clamped to the bottom of the checkout grid
and lands ~100px above the band at both heights. Mid-scroll the rail's text passes behind the
pill the way it would behind any fixed element, and scrolling on reveals it. The one thing
that came to **rest** underneath was `PageFrame`'s footer legal line (*© 2026 EventPipe ·
Terms · Privacy · Contact*), which is right-aligned into the same corner; the footer is given
76px of bottom padding **on this screen only**, via the `hfapp--held` class in `App.vue` — the
footer is a sibling of the screen slot, so no `:deep()` from inside the screen reaches it.
The pill was not moved off the corner: the corner is what was asked for, and lifting it would
only park it on the rail instead.

## What the case asked for

| The case | How this answers it |
| --- | --- |
| Start from a normal EventPipe hotel booking | Landing, Browse and Details are the booking site's own screens — see below. |
| Select hotel + room | The library `HotelDetailPage` in `reserve` flow, five room types priced off the property's rate. |
| Add admission tickets for the tournament | Day and weekend passes laid against the competition schedule, bought for the whole party. |
| Add optional destination products | Six Orlando add-ons — parks, character breakfast, airport van — nothing pre-selected. |
| Review all three together | One fully-expanded form beside the itemized cart: **Hotel · Tickets · Experiences**, three headings, one total, one submit. |
| A combined confirmation / itinerary | One order number, the full room reservation, the passes and add-ons as order components, and three policy sections. |

## Why the content moved to Orlando

The fork arrived framed as a Patriots gameday at Gillette. That is the wrong shape for this
buyer, not just the wrong logo:

| | NFL gameday (what it was) | Youth tournament (what it is) |
| --- | --- | --- |
| Stay | 1 night around a kickoff | **3 nights** — the trip *is* the event |
| Admission sells | a **location** — Club, Sec CL10, Row 12 | a **day** — Friday, Saturday, finals |
| Second purchase | none | **the destination** — which is why this flow has an add-ons step at all |
| Buyer | a fan | a family, sent by a gym, with a schedule to work around |

So the event is **Sunshine State Spirit Nationals 2027** at the Orange County Convention
Center, Feb 12–14, 2027; the hotels are the I-Drive / Lake Buena Vista block, measured from
the Convention Center; and the seat map is gone, because there is no section to choose when
spectators sit on bleachers around eight mats.

All of it lives in [`src/event.js`](src/event.js), [`src/hotels.js`](src/hotels.js),
[`src/tickets.js`](src/tickets.js) and [`src/addons.js`](src/addons.js) — a different
tournament is a data change, not a code change.

## How the hotel side stays the booking site

This is edge case #5 of the same round, and it constrains everything before the Tickets
screen. The reference is the [`prototype/`](../prototype) app — the new EventPipe
booking-site experience — and the hotel screens here mount the same components in the same
composition:

| Screen | What it mounts | Same as `prototype/` |
| --- | --- | --- |
| Landing | `LandingPage` — its own nav, hero, `BookingWidget`, event copy, footer | yes, only the copy props differ |
| Browse | hero → `BookingWidget` band → filter rail → `ResultsToolbar` → `HotelCardReserve`, in three availability tiers with the same break messages | yes, composed the same way |
| Details | `HotelDetailPage` in `reserve` flow — gallery, tabs, rooms, amenities, policies | yes, unmodified |
| Checkout | `CheckoutPageExpanded` — one open form + the same sticky rail | yes, `ticketing` mode instead of `reservation` |
| Frame | `PageFrame` — real Global Nav **and** footer on every screen | yes |

Two deliberate departures, both for the same reason — the library page hardcodes Foxborough:

- **`HotelListPage` is not used.** It renders Browse in one tag, and the fork used it, but
  its event name, venue and fourteen sample hotels are Gillette. A tournament in Orlando
  cannot borrow that page without contradicting itself on screen. Composing the same parts
  costs one file and buys a Browse that is the booking site in every respect except data.
- **`ViewMapField` is not used.** It ships its own Nashville hotels and labels the map pin
  *Gillette Stadium*. [`HotelMapField.vue`](src/components/HotelMapField.vue) is the rail's
  `HotelMap` preview against the Orlando block, and its "View Map" now switches the page to
  [`HotelMapPanel`](src/components/HotelMapPanel.vue) rather than opening a dialog.

Everything the fork already got right was left alone. The room CTA still reports nothing
upward, so `App.vue` reads the chosen card's own DOM — exactly the technique `prototype/`
uses for its group room cards, and the reason the library is still untouched.

## Why the ticket list is a calendar

A ticketing UI normally sells a place. A tournament sells a **day**, and a family that buys
the wrong day misses the ninety seconds their athlete is on the mat. So the competition
schedule is on the page beside the passes:

```
Friday, Feb 12     Warm-ups & Level 1–3 prelims
Saturday, Feb 13   Level 4–6 prelims & semifinals
Sunday, Feb 14     Finals & awards
```

Five tiers, and the two at the ends are what make it read as a tournament rather than a
generic pass list: an **athlete credential wristband** (a credential, not a seat — priced
low, rationed to 6) and **mat-side finals seating** (the one genuinely scarce thing in the
building, and sold out, which is the honest state for finals seating three months out).

The card is [`TicketTierCard.vue`](src/components/TicketTierCard.vue) — the library's
`TicketCategoryCard` grammar (colour swatch, the same `AvailabilityBadge` mounted
unmodified, the same `/ea` price, the same greyed sold-out state) with its **− qty +
stepper replaced** by the party-size line and an Add / Added toggle. It is rebuilt here
rather than mounted from `@lib` because the part that had to go is the part that component
exists to render, and the library is read-only. Hiding the stepper with CSS was rejected: it
leaves a live keyboard-reachable control behind an invisible surface.

## Why add-ons start at zero

Three rules, and they are what stop an add-on step from becoming the airline-checkout
upsell wall:

1. **Nothing is pre-selected.** Tickets *are* seeded — one weekend pass per guest, because
   nearly every family buys it and it keeps a deep-linked checkout coherent. Add-ons never
   are. Pre-adding a $139 park ticket would be the prototype lying about what was asked for.
   The party-size control is repeated on this screen, because it is now the only quantity
   control the guest has: sending them back a screen to change a number that re-prices the
   page in front of them would make the lock cost them something instead of saving them
   something.
2. **The exit is at the top, beside the total.** "Continue without add-ons" is visible on
   load, and it *clears* anything already added — carrying a $556 park purchase past the
   sentence "continue without add-ons" would be indefensible.
3. **Every card says which day it fits.** A Saturday park day is unavailable to a family
   whose athlete competes Saturday. An add-on step that ignores why the guest is in town
   sells them something they cannot use.

The card is hand-rolled ([`AddOnCard.vue`](src/components/AddOnCard.vue)) rather than
borrowed from `PackageCard`, whose whole layout is a price comparison between what's inside
a bundle and what it costs together. An add-on has no bundle to compare against. It is a
single **Add for 4** / **Added** toggle with no stepper at any point — it prints
`4 guests — matches your party` where the stepper used to be. The previous version added at
the obvious quantity and *then* handed over a stepper "for the exceptions"; that reads
reasonably on one card and badly across six, where a family of four could leave with four
park days, three breakfasts and two aquarium tickets — an order that describes no trip
anyone is taking, and one the checkout rail then has to print with a straight face.

## How the three parts become one cart

`buildCart()` in [`src/itinerary.js`](src/itinerary.js) is the join. It emits the library's
**ticketing cart shape**, verbatim, with three kinds of line:

```
type: 'hotel'       → CartReview files it under "Hotel"
type: 'ticket'      → …under "Tickets"      (no unitPrice ⇒ no editable quantity)
type: 'experience'  → …under "Experiences"
```

That is why the checkout needed no new component. `CheckoutPageExpanded` in `ticketing` mode
hands its rail to `CartReview`, which already groups an itemized cart by line type — so a cart
holding a room, four passes and three attraction bookings prints as three named sections
under one total, each line expandable into its nights or its inclusions.

The same cart feeds the nav badge, the peek (via `peekCart()`, the detail-stripped
projection) and the cart page's `OrderSummary` rail — so the combined itinerary is visible
**three screens before checkout**, not revealed at it, and the four surfaces cannot print
different money. Checked live at a party of 3 with the add-ons cleared: peek `$1,170.00`,
cart page rail `$1,170.00`, checkout rail `$1,170.00`, confirmation "Total charged"
`$1,170.00`. Room-only (both exits taken): `$847.00` end to end.

## How it's priced

```
subtotal = every line
fees     = 12% of the NON-HOTEL lines        (the ticketing service fee)
taxes    = 9% of the subtotal                (Orange County sales + tourist development)
total    = subtotal + fees + taxes
```

The room is out of the fee base for a reason beyond realism: `CartReview`'s own fee base
excludes hotel lines. Keeping the two bases identical is what stops the rail and
`itinerary.js` from ever printing different totals for the same cart.

The default trip, end to end:

```
Rosen Centre Convention Hotel · Double Queen · 3 nights × $259   777
4 × Weekend Spectator Pass @ $89   (4 = the party size)          356
                                                     subtotal  1,133
                                          fees (12% of 356)        43
                                        taxes (9% of 1,133)       102
                                                        total  $1,278

…plus the demo add-ons (4 Disney days, 4 character breakfasts, 1 airport van):
                                                     subtotal  2,070
                                                        total  $2,411
```

Prototype economics, deterministic — no `Math.random`, no `Date.now`, so a demo never
drifts and two screenshots taken a week apart agree.

## Source

| Path | What it is |
| --- | --- |
| [`src/event.js`](src/event.js) | The tournament, the venue, the three nights |
| [`src/brand.js`](src/brand.js) | The event's artwork — the two banners, the crest, the band scrim, the alt text |
| [`src/assets/event/`](src/assets/event) | The three supplied files, copied in so they are tracked |
| [`src/hotels.js`](src/hotels.js) | The 14-hotel Orlando block + filter/sort logic |
| [`src/tickets.js`](src/tickets.js) | The five admission tiers |
| [`src/addons.js`](src/addons.js) | The six destination add-ons |
| [`src/itinerary.js`](src/itinerary.js) | Cart, checkout summary and confirmation — all from one state |
| [`src/store.js`](src/store.js) | Screens, the router, and the selection |
| [`src/screens/HotelBrowseScreen.vue`](src/screens/HotelBrowseScreen.vue) | Browse, composed from the booking site's parts |
| [`src/screens/TicketsScreen.vue`](src/screens/TicketsScreen.vue) | Passes, laid against the schedule |
| [`src/screens/AddOnsScreen.vue`](src/screens/AddOnsScreen.vue) | The destination step |
| [`src/screens/CartScreen.vue`](src/screens/CartScreen.vue) | The full cart page — the only place the order is edited |
| [`src/components/CartPeek.vue`](src/components/CartPeek.vue) | The cart slide-over — **the one sanctioned overlay** |
| [`src/screens/CheckoutScreen.vue`](src/screens/CheckoutScreen.vue) | The expanded checkout + the pinned `HoldTimerPill` |
| [`src/components/AddOnCard.vue`](src/components/AddOnCard.vue) | One add-on — Add / Added, no stepper |
| [`src/components/TicketTierCard.vue`](src/components/TicketTierCard.vue) | One admission tier — `TicketCategoryCard`'s grammar, minus the stepper |
| [`src/components/PartySizeField.vue`](src/components/PartySizeField.vue) | The one quantity control left in the flow |
| [`src/components/HotelFilters.vue`](src/components/HotelFilters.vue) | The filter rail, with working filters |
| [`src/components/HotelMapField.vue`](src/components/HotelMapField.vue) | Its map preview, against the Orlando block |
| [`src/components/HotelMapPanel.vue`](src/components/HotelMapPanel.vue) | The full map, as a view of the page |
| [`src/mapdata.js`](src/mapdata.js) | Marker + imagery mapping, shared by both maps |

Library components mounted as shipped: `PageFrame`, `GlobalNav`, `AppStepper`,
`LandingPage`, `BookingWidget`, `ResultsToolbar`, `HotelCardReserve`, the eight
`filter-rail` fields, `HotelMap`, `HotelDetailPage`, `AvailabilityBadge`, `QuantityStepper`,
`CheckoutPageExpanded`, `CartReview`, `ConfirmationPage`, `HoldTimerPill`. Library files
changed: **0**. One library *element* is suppressed from this app with a scoped CSS rule —
`CheckoutPageExpanded`'s in-rail *Time left to book* block, replaced by the fixed
`HoldTimerPill` (see [The hold countdown is pinned](#the-hold-countdown-is-pinned)). It is
not a pop-up, and it is the only such suppression.
No `DsModal`, no `DsSidePanel`, no `q-dialog` anywhere in this app.

One library file is *rewritten as it is read*, for this app only and without touching the
file on disk: `LandingPage.vue`'s two hardcoded hero image imports and its hero `alt`, so
the landing can carry the event's own artwork. The `PATCHES` block in
[`vite.config.js`](vite.config.js) argues it, and the build fails loudly if the library
moves those lines — see [The event's own artwork](#the-aug-26-round-the-events-own-artwork).

## Run it

```bash
cd hotel-first && node ../node_modules/vite/bin/vite.js --port 6900
```

No install needed — deps resolve up the tree to the repo's `node_modules`.
Build check: `cd hotel-first && node ../node_modules/vite/bin/vite.js build`.

## Deep links

- [Landing](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=landing)
- [Browse the block](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=hotels)
- [Hotel details · Hyatt Regency, Rooms tab](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=hotelDetails&hotel=h1&tab=rooms)
- [Tickets · party of 6](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=tickets&guests=6)
- [Destination add-ons](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=addons)
- [The full cart page](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=cart&demo=1)
- [Checkout · the combined cart](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=checkout&demo=1)
- [Confirmation · the itinerary](https://epprestodesign.github.io/presto-2026-ticketing/hotel-first/?screen=confirmation&demo=1)

`?demo=1` seeds a representative add-on selection (a park day and a breakfast per guest,
one airport van) for screenshots. It is a *demo* flag rather than the default precisely
because the honest empty state is what a first-time guest sees.

## Still open

- **The add-on schedule is advisory, not enforced.** A card says a park day fits Monday;
  nothing stops a guest buying six of them for a competition day. A real build would need
  to know the athlete's mat times, which arrive two weeks out.
- **Three fulfilments, one payment.** The confirmation says so plainly in its status note —
  hotel now, passes from the producer, park tickets from each park — but the prototype has
  no model of what happens when one of the three fails after the card is charged.
- **Party size is one number, now by decision.** Four guests means four park tickets, and
  after Aug 25 there is no per-line way out: a family where one parent skips the park cannot
  express that here. The trade was made knowingly — it buys an order that can always be
  explained at the doors, and every alternative we tried let a cart disagree with itself. If
  it turns out to matter, the shape is a per-line "not everyone" exception that has to say
  who is excluded, not a stepper that lets any number happen for no stated reason.
