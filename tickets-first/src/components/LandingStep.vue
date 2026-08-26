<script setup>
// Screen 0 — the LANDING PAGE.
//
// It replaces this fork's own intro (EventHero + a paragraph + a "Get started"
// button), which was a prototype-only card no guest will ever see. This is the
// library's LandingPage — Global Nav, hero, booking widget, the event write-up,
// display ads, footer — mounted the way the sibling /experience prototype's
// LandingScreen.vue mounts it, so the flow now opens on the page the real
// booking site opens on.
//
// Two local decisions, both about the booking widget:
//
// 1. NO "BOOKING TYPE" DROPDOWN — the same cut /experience makes. This flow's
//    booking type is already settled (a gameday trip that starts with tickets),
//    so a selector whose other option is "Hold Rooms for Group or Team" would
//    offer a flow that does not exist here. Hidden in CSS rather than by prop
//    because LandingPage doesn't forward one, and hiding it is also what keeps
//    the widget's `mode` blank — which matters for the next decision.
//
// 2. `show-teams="false"`, where /experience passes true. The Registered Group
//    field is `v-if="showTeams && !!mode"` and LandingPage mounts the widget
//    with a blank mode, so with the dropdown hidden that field can never appear
//    on either setting — nothing visible is lost. What `false` does remove is
//    BookingWidget's "Add a group" q-dialog, which is `v-if="showTeams"`: at
//    true it sits mounted in an app whose rule is zero dialogs. Suppressing its
//    trigger the way HotelDetails.vue suppresses the hotel page's two was the
//    alternative and does not work here — the only trigger lives inside a
//    q-menu, which Quasar teleports to <body>, out of reach of any scoped
//    :deep() rule this component could write.
//
// Forward navigation is the widget's own Search button. No library page emits a
// navigation event, so the click is read off the element on the way up — the
// same routing /experience's app shell does at document scope, kept to this one
// wrapper here because this screen has exactly one CTA worth routing.
//
// 3. THE HERO ARTWORK IS SWAPPED IN CSS, from here (Aug 26 branding round).
//
//    LandingPage hardcodes its hero as `import defaultBg from
//    '../../background-img/defaultBackgroundImage.png'` and writes it into an
//    inline `:style` — there is no `heroImage` prop, no slot, no CSS custom
//    property, nothing in its `defineProps` a caller can reach. So there is no
//    supported seam, and the swap is either a scoped `:deep()` rule or a fork.
//
//    IT IS THE `:deep()` RULE. The alternative was the OVERRIDES map in
//    vite.config.js, which the sibling package-customize app uses — but look at
//    WHAT it redirects: `CartFlyout`, a whole component whose entire behaviour
//    was wrong for that prototype. That mechanism swaps a component for a
//    different component. Here the component is right; one URL inside it is
//    wrong. Redirecting it would mean copying all ~250 lines of LandingPage —
//    nav, widget, the whole event write-up, the ads, the footer — into this app
//    to change one background-image, and every later library fix to any of that
//    would stop reaching this screen silently. package-customize's own config
//    says as much about its empty PATCHES list: the places it needed to bend a
//    library template it bent "in scoped CSS from the screens that mount them,
//    which fails visibly rather than breaking the build when the library
//    moves." This is that case.
//
//    WHAT IT COSTS: `.lp__hero` is a library class name, so this rule is
//    coupled to it — if the library renames the hero the artwork silently
//    reverts to the stock imagery. That is a visible failure on the first look
//    at the screen, not a broken build or a wrong price, and it is the cheaper
//    of the two failure modes. It also needs `!important`, because what it is
//    overriding is an inline style. The scrim has to be restated in the same
//    declaration for the same reason — `background-image` is one property, and
//    the library packs the gradient and the photo into it together.
//
//    THE SCRIM IS LIGHTER THAN THE LIBRARY'S 50%, and the reason is the
//    artwork, not the type. The supplied crop is already graded almost to
//    black across the top two thirds — which is precisely where the logo, the
//    event name and the dates sit — so 50% is not buying legibility the image
//    has not already paid for, and what it costs is the picture: the lit turf
//    and the 40/50/40 yard numbers along the bottom are the only part of the
//    frame with light in it, and at 50% they crush to a flat dark green. 22%
//    keeps the white type clear of the lightest pixels in the crop (the
//    yard-line paint, which the type never reaches) and leaves the field
//    legible as a field. The logo treatment itself is untouched.
import { computed } from 'vue'
import LandingPage from '@lib/components/LandingPage.vue'
import heroBg from '../assets/event/event-hero-1440x400.png'

const props = defineProps({
  eventName: { type: String, default: '' },
  eventDates: { type: String, default: '' },
})
const emit = defineEmits(['start'])

// THE HERO HEADLINE BREAKS ON THE FIXTURE — "New England Patriots" over
// "v Buffalo Bills". Landing page only; the interior EventBand keeps its
// single line, which is why the break is applied HERE and not to `event.name`
// in App.vue, where the band reads the same string.
//
// A LITERAL `<br/>` WAS NOT AVAILABLE. LandingPage renders the name as text
// interpolation — `<h1 class="lp__event text-h3">{{ eventName }}</h1>` — so
// markup in the string is escaped and shows up as characters. The two ways to
// get a real <br> in there are `v-html` on a library template (a patch to a
// read-only file) or an XSS-shaped escape hatch, and neither is worth it for a
// line break. A NEWLINE plus `white-space: pre-line` gets the same result with
// no library change and nothing to sanitise.
//
// `pre-line`, not `pre` or `pre-wrap`: it honours the explicit newline while
// still COLLAPSING incidental whitespace and still letting the line wrap on its
// own if the viewport gets narrow enough. The two-line break is a floor, not a
// cage — `pre` would forbid the natural wrap and push the headline out of the
// hero on a small screen.
//
// Split on the fixture separator rather than on a hard-coded team name, so a
// different event still breaks in the right place, and any name with no " v "
// in it falls through unchanged rather than losing a word.
const heroName = computed(() => props.eventName.replace(/\s+(vs?\.?)\s+/i, '\n$1 '))

// The @2x export (2880x800) at the hero's own 3.6:1 ratio, so at a 1440 viewport
// the 400px hero is a 2x map of the artwork and there is no resolution ceiling
// on it at any width a browser is likely to be.
//
// The sizing rules live on the `:deep(.lp__hero)` rule below rather than here,
// because they are what the SCOPED CSS overrides — see the note there. The
// short version, and the one thing not to undo: `100% auto` with `no-repeat`
// on black, NOT `cover`. The artwork puts a helmet hard against each horizontal
// edge, and `cover` trims horizontally at any width narrower than 3.6:1 —
// through both subjects, and asymmetrically. (The earlier `cover` + `center
// bottom` reasoning here described the previous, uniform-field artwork and no
// longer applied to this one.)
const heroBackground = `linear-gradient(rgba(0,0,0,.22), rgba(0,0,0,.22)), url(${heroBg})`

function onClick(e) {
  if (e.target instanceof Element && e.target.closest('.bw__search')) emit('start')
}
</script>

<template>
  <div class="tfland" @click="onClick">
    <LandingPage
      brand="EventPipe" mode="reservations" :show-teams="false"
      :event-name="heroName" :event-dates="eventDates"
      :style="{ '--tfland-hero': heroBackground }"
    />
  </div>
</template>

<style scoped>
/* The booking-type dropdown — see note 1 at the top. */
.tfland :deep(.bw__field--mode) { display: none !important; }
/* The widget's Search is this screen's "start the trip", so it reads as one. */
.tfland :deep(.bw__search) { cursor: pointer; }

/* The event artwork — see note 3 at the top. `!important` because the library
   writes its own hero into an inline style; the value comes down the custom
   property set on the mount above, which is how a scoped rule gets at a URL
   that only the <script> knows. `background-size`/`position` are restated
   because the library sets them on the class and the cascade would otherwise
   be fine — they are here so the whole treatment reads in one place. */
.tfland :deep(.lp__hero) {
  background-image: var(--tfland-hero) !important;
  /* `100% auto`, not `cover` — the Aug 26 artwork anchors a helmet to each
     horizontal edge, so filling by the short axis trims through both subjects.
     Fitting the width keeps them and spends the trim on the black falloff above
     and the unlit turf below. See EventBand for the same reasoning. */
  background-size: 100% auto;
  background-position: center;
  /* NO-REPEAT IS PART OF `100% auto`, NOT AN EXTRA. The default is `repeat`,
     and under the library's `cover` that never showed because the image always
     filled the box. Fitting the WIDTH leaves the hero's 400px min-height
     uncovered at any viewport under 1440, and that strip was tiling a second
     copy of the picture above and below the real one. Rejected: going back to
     `cover`, which hides the tiling by cropping through both helmets. */
  background-repeat: no-repeat;
  /* Restated, not changed: the library already paints .lp__hero black, and the
     letterboxing this treatment creates is only defensible against black. It is
     written here so the rule that decides the trim also states what the trim
     shows — a later background-image edit cannot leave it on the canvas grey. */
  background-color: #000;
}

/* What turns `heroName`'s newline into the fixture break — see the note there.
   Scoped to the hero headline alone: `pre-line` anywhere broader would start
   honouring stray newlines in body copy this app does not control. */
.tfland :deep(.lp__event) { white-space: pre-line; }

/* THE LANDING'S NAV PINS ITSELF — see the `.bapp__chrome` note in App.vue.
   Every other screen wears App.vue's sticky nav-plus-stepper block; this screen
   is a whole LandingPage that brings its OWN GlobalNav, so App.vue mounts none
   (two navs is the failure this v-if has always prevented). Pinning the
   library's copy from here is what keeps the header's behaviour the same on the
   landing as everywhere else without this app ever mounting a second bar.
   Sticky, matching the rest: .lp is a plain block in the document flow, so the
   nav holds its own 72px and the hero starts under it exactly as before — there
   is nothing on this page to compensate and no landing-only offset to keep in
   sync. z-index 1000 matches the app chrome, which puts it under the peek's
   scrim (3000) and the trip pill (900) above the page but below the panel.
   No stepper here, so `--tf-chrome-h` is 0 on this screen and nothing below
   asks for an offset. */
.tfland :deep(.gnav-wrap) { position: sticky; top: 0; z-index: 1000; }
</style>
