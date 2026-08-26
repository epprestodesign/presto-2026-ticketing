<script setup>
// Stage 0 — the event landing page. The real library LandingPage (its own Global
// Nav + hero + BookingWidget + event copy + footer), identical in structure to the
// sibling /prototype app's landing: this is the booking site as it ships, with
// only its copy re-pointed at the tournament.
//
// Every string below is a prop the library already exposes, which is the reason
// the re-frame needed no component work at all — a producer changing events
// changes content, not code. `showTeams` is on (unlike /prototype) because a cheer
// family arrives here having been sent by a GYM, and the Registered Team field is
// how that gym's block is found.
//
// --- Aug 26: the event's artwork ---------------------------------------------
// The hero on this page carries the Varsity Spirit shield over the supplied
// 1440×400 banner, and NEITHER comes from this file. `LandingPage` hardcodes both
// as module imports and exposes no prop for either, so the two image sources and
// the logo's alt text are swapped by the `PATCHES` block in
// `hotel-first/vite.config.js` — read the comment there for why that mechanism
// and not scoped CSS or a component fork. If the hero ever shows EventPipe
// artwork again, that is where to look.
//
// What DOES live here is the part CSS is the right tool for: how big the shield
// is and how it sits on the photograph. Sizing is presentation, it belongs in a
// stylesheet, and it fails harmlessly (a mark at the library's default size)
// rather than fatally if the library renames a class.
import LandingPage from '@lib/components/LandingPage.vue'
import { EVENT } from '../event.js'

const INTRO = [
  `Spirit Nationals returns to Orlando for three days of competition at the ${EVENT.venue}. More than 400 all-star, school and rec programs compete across eight mats, with preliminaries Friday and Saturday and finals and awards on Sunday.`,
  'EventPipe manages the official hotel block. Book your room here and you stay with your program, at contracted rates, close enough to the Convention Center to walk on finals day — and you can add tournament admission and Orlando attraction tickets to the same booking before you check out.',
]

const BENEFITS = [
  'Official tournament hotel block, walking distance to the Convention Center',
  'Contracted rates held for competing programs and their families',
  'Suites and connecting rooms for teams travelling together',
  'Tournament admission passes added to the same booking',
  'Optional Disney, Universal, SeaWorld and airport transfer add-ons',
  'One confirmation covering the room, the passes and the extras',
]

const ATTENDING = [
  { title: 'Competing Programs', text: 'Keep your athletes, coaches and chaperones in one property with connecting rooms, early breakfast and a bag-storage plan for finals day.' },
  { title: 'Cheer Families', text: 'Book the room, the weekend spectator passes and a park day in one pass through checkout, with the schedule already accounted for.' },
  { title: 'Travelling Spectators', text: 'Grandparents, siblings and friends flying in for finals can book a shorter stay and a single day pass without leaving the family’s hotel.' },
  { title: 'Judges & Staff', text: 'Event staff rooms are held in the same block, with late check-out on Sunday for teardown.' },
]

const EVENT_INFO = {
  dates: EVENT.datesLong,
  lines: [`Venue: ${EVENT.venue}`, ...EVENT.address],
}

const CLOSING = [
  'Competition schedules are published two weeks out. Book early — the properties inside a half mile of the Convention Center are the first to sell out on a national weekend.',
  'Add-on attraction tickets are date-flexible across your stay, so a park day can wait until after Sunday awards without a second booking.',
]
</script>

<template>
  <landing-page
    brand="Presto"
    mode="reservations"
    :event-name="EVENT.name"
    :event-dates="EVENT.dates"
    :intro="INTRO"
    :benefits="BENEFITS"
    :attending="ATTENDING"
    :event-info="EVENT_INFO"
    :closing="CLOSING"
    :show-teams="true"
  />
</template>

<style scoped>
/* =============================================================================
   THE HERO LOCKUP — crest + event name + dates as ONE mark
   =============================================================================

   THE CREST IS NOT A WORDMARK — the full argument, and the sizes for both
   contexts, are in `../brand.js`. The short version: the library sizes this
   `<img>` at 44px because it used to hold the EventPipe logotype, and a
   four-tier shield at 44px is a blue smudge.

   156px HERE. The hero is a 400px band and the only thing bounding the crest is
   the booking widget, which tucks 48px up onto it. That is more than twice the
   height the interior bands can carry, and deliberately so — this is the one
   screen whose whole job is to say which event this is.

   TREATMENT, checked against the rendered hero rather than assumed. The crest's
   outermost stroke is a dark navy that does sink into the scrimmed photograph,
   but the bright yellow rim immediately inside it carries the silhouette on its
   own, so the mark needs no plaque. A white plaque was tried and dropped: it
   reads as a sticker pasted on the photograph and puts a second white rectangle
   directly above the booking widget's white card. The drop-shadow does the same
   separation job for the dark stroke at a fraction of the visual weight.

   --- Aug 26, second round: "bring in the logo with the text" -----------------

   The first pass sized the crest correctly and then left it floating. Measured
   on the rendered page at 1440, the gap from the shield's lowest INK to the cap
   line of "Sunshine State Spirit Nationals 2027" was 40px — 1.2× the heading's
   own 33.6px cap height. At that distance the eye reads a logo with a caption
   under it, not a lockup. Two things were producing the 40 and only one of them
   was in the stylesheet:

     • the declared `margin-bottom: 20px`, and
     • ~20px of space nobody had declared at all — 9.75px of transparent PNG
       below the shield (the artwork's alpha box is inset 25/400 at the bottom)
       plus 10.4px of the heading's own half-leading above its cap line.

   So the numbers below are written as a TARGET OPTICAL GAP minus the two
   invisible contributions, rather than as a raw margin. A raw margin is a lie
   here: 20px of margin buys 40px of apparent space, and the next person to
   nudge it would be tuning a number that means nothing on screen.

   THE TARGET IS 18px, and it is judged against the type rather than picked:
   0.53 × the heading's cap height, which lands on the same value as the gap
   already sitting between the heading's ink and the dates' ink (measured:
   17.96px). Setting the crest at that distance makes the three parts share one
   rhythm — crest, name, dates read as a single stack instead of a mark plus a
   two-line block. Against ~57px of clear photograph above and below the pair
   (see `.lp__hero-inner`), the internal spacing is roughly 1:3 to the space
   around it, which is what makes the group cohere.

   REJECTED: cropping the transparent edge out of the PNG so a plain margin
   would mean what it says. It is the tidier fix and it was not taken, because
   the delivered artwork is the stakeholder's file — re-exporting it means this
   app carries a derivative that silently diverges from whatever they send next.
   Correcting for the padding in CSS keeps their file byte-identical and puts
   the correction where the next artwork drop will be looking for it.

   REJECTED: a fourth entry in the `PATCHES` list to restructure the hero markup
   into a real lockup element. Nothing here needs new markup — this is spacing
   and alignment, which is CSS's job — and every added patch is another exact
   string this app depends on inside a library file it does not own. */
:deep(.lp__hero-logo) {
  /* The one value a breakpoint sets. Everything below derives from it, so the
     spacing stays honest at every crest size instead of needing its own
     hand-tuned margin per breakpoint (which is what drifted last time). */
  --crest-h: 156px;

  /* The artwork's own transparent edges, as fractions of the square canvas.
     Measured off the alpha channel of `spirit-logo.png` (400×400): the opaque
     shield spans x 47–374, y 15–374. Fractions, not pixels, so they survive the
     breakpoints. If the artwork is ever replaced these three constants are the
     thing to re-measure — `brand.js` says so at the file list. */
  --crest-trim-b: calc(var(--crest-h) * 0.0625);  /* 25/400 below the shield */
  --crest-off-x: -2.75%;                          /* 11/400 right of centre    */

  /* Heading half-leading: line-box top to cap top for PT Sans 48px/1.1, the
     library's `.lp__event.text-h3`. Measured in the browser, not derived from
     the font tables, because `text-h3` is Quasar's and the fallback stack can
     serve a different face. */
  --h1-lead: 10.4px;

  height: var(--crest-h);
  margin-bottom: calc(18px - var(--h1-lead) - var(--crest-trim-b));

  /* VERTICAL ALIGNMENT, the other half of what was asked for. `margin: 0 auto`
     centres the crest's BOX, but the shield inside it is not centred in its own
     canvas — it sits 11/400 to the right, which at 156px puts the mark 4.3px
     off the axis the heading and dates are centred on. Small, and plainly
     visible once the crest is this big and this close to the type. The shift is
     a percentage of the element's own width, so it is correct at 156, 132 and
     104 without being restated. */
  transform: translateX(var(--crest-off-x));

  filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.45));
}

/* VERTICALLY CENTRE THE LOCKUP IN THE BAND THAT IS ACTUALLY VISIBLE.
   ---------------------------------------------------------------------------
   The library centres `.lp__hero-inner` in the hero with `align-items: center`,
   and that is the wrong centre here. The booking widget's white card is pulled
   up onto the hero with `margin-top: -48px`, so the bottom 48px of the 400px
   band is covered. The visible band is 352px tall and its centre is 24px above
   the box's. Measured before this rule: the lockup's ink centre sat at y=273
   against a visible centre of y=249 — the stack was 24px low, which is exactly
   the "sits low" reading, and no amount of tuning the crest size fixes it
   because the crest was never the thing off-centre.

   The fix is to declare the occlusion instead of hand-nudging past it: pad the
   inner block by the overlap, and the library's own `align-items: center` then
   lands the CONTENT centre on the visible centre. It stays correct if the
   lockup grows — the heading wraps to two lines below ~1100 — where a
   `transform: translateY(-24px)` or a negative margin would just be a constant
   guess bolted onto a centring that was still wrong.

   The card is 992px wide and the lockup is at most 820px, both centred, so the
   lockup is entirely inside the covered column: 352px is the right band for it,
   not some average across the full 1440.

   Result at 1440: ~57px of clear photograph above the shield and ~58px below
   the dates. It reverts to the library's box-centring if `.lp__hero-inner` is
   renamed — low, but not broken.

   The 48 is the library's `.lp__widget { margin: -48px auto 0 }`, which carries
   no media query, so one value covers every width. It is a read of a library
   value, which is why it is named rather than inlined; if the library retunes
   that overlap, this is the number to follow it with. */
:deep(.lp__hero-inner) {
  --widget-overlap: 48px;
  padding-bottom: var(--widget-overlap);
}

/* Below ~1100 the event name is closer to wrapping to two lines, so the crest
   gives height back to keep the whole lockup inside the 400px band and off the
   widget. Still well above the 44px it inherited. Only the crest height moves —
   the gap, the axis correction and the centring all follow from it. */
@media (max-width: 1100px) {
  :deep(.lp__hero-logo) { --crest-h: 132px; }
}
@media (max-width: 700px) {
  :deep(.lp__hero-logo) { --crest-h: 104px; }
}
</style>
