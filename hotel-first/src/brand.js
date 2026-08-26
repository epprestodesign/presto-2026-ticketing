// The event's own artwork, in one place — the visual half of what `event.js` does
// for copy.
//
// The stakeholder supplied three files on Aug 26 for the real event this
// prototype stands in for, the Varsity Spirit **National School Spirit
// Championships**. They are COPIED INTO THIS APP (`src/assets/event/`) rather than
// imported from `references/`, because `references/` is gitignored — an import
// from there builds on the machine that has the folder and breaks for everybody
// else and in CI. If new artwork arrives, replace the files here; nothing else
// needs to move.
//
//   spirit-logo.png          400×400  (delivered as "01-logo_200x200.png" — it is
//                                     actually @2x). Transparent background, full
//                                     colour: navy/sky-blue shield with a bright
//                                     yellow rim and a yellow CHAMPIONSHIPS banner.
//   spirit-banner-hero.png   2880×800 (delivered as "…1440x400.png" — also @2x).
//                                     The TALL hero image. Used on Landing only.
//   spirit-banner-band.png   1440×240 (1×). The SHORT band. Used on the in-flow
//                                     headers: Stay, Tickets, Add-Ons.
//
// IF THE ARTWORK IS REPLACED, one thing does have to move with it. The crest is
// not centred in its own canvas — `spirit-logo.png`'s opaque shield spans x
// 47–374, y 15–374 of 400 — and the landing hero corrects for that in CSS so the
// mark sits on the same vertical axis as the heading and so its spacing means
// what it says. Those fractions are constants in `screens/LandingScreen.vue`
// (`--crest-trim-b`, `--crest-off-x`); re-measure the alpha box of the new file
// and update them there. Nothing else needs to change.
//
// ASSUMPTION WORTH CHECKING: the stakeholder's note named the hotels screen
// against both banners. The tall 400 is a landing hero and the short 240 is a
// header band, so the split above is the reading applied here — landing gets the
// 400, the three in-flow screens get the 240. If they meant the tall banner on
// Stay as well, it is a one-line change in HotelBrowseScreen.vue.
import heroBanner from './assets/event/spirit-banner-hero.png'
import bandBanner from './assets/event/spirit-banner-band.png'
import eventLogo from './assets/event/spirit-logo.png'

export { heroBanner, bandBanner, eventLogo }

// The logo is the event's mark, not EventPipe's — so it needs the event's name.
// The image it replaces shipped as `alt="EventPipe"`, which after the swap would
// have announced the wrong organisation entirely. The mark carries readable words
// ("Varsity Spirit / National School Spirit Championships"), so the alt is those
// words: what a sighted guest reads off the shield is what a screen reader says.
export const EVENT_LOGO_ALT = 'Varsity Spirit National School Spirit Championships'

// THE SCRIM. Both banners are photographic — a full squad of cheerleaders under a
// blue duotone wash — and the event name and dates sit in white directly on top of
// faces, so a scrim is not optional. The three screens used to carry two values
// (Stay at 50%, Tickets and Add-Ons at 55%) for no reason anyone recorded; that is
// now one number, because a scrim that changes weight as the guest walks through a
// flow reads as three different headers.
//
// 52% BLACK, not the navy tint that was tried first. The navy (rgba(8,26,48,…))
// genuinely suits the artwork better — it deepens the duotone instead of greying
// it — but the LANDING hero's scrim is not reachable from this app: it is a
// literal inside the library component, and the only way to change it would be a
// fourth patched string in vite.config.js. Matching the library's black rather
// than beating it by a shade is worth more than the tint: the four screens have to
// look like one site, and the one that cannot be tuned decides the value.
export const BAND_SCRIM = 'linear-gradient(rgba(0,0,0,.52), rgba(0,0,0,.52))'

// The in-flow header background, ready to bind. One expression, three screens —
// Stay, Tickets and Add-Ons must not drift apart.
export const bandStyle = { backgroundImage: `${BAND_SCRIM}, url(${bandBanner})` }

// THE CREST'S SIZE, and why it is not one number.
//
// The mark this replaced was the EventPipe WORDMARK — wide, one line, pure white,
// legible at 30px. The Spirit artwork is a near-square shield stacking FOUR tiers
// of type (VARSITY SPIRIT / NATIONAL SCHOOL / SPIRIT / CHAMPIONSHIPS). Inherit the
// wordmark's height and the two small tiers fall under a pixel and the crest is a
// blue smudge — which is exactly what shipped in the first pass, and what the
// stakeholder came back on.
//
// Two contexts, two sizes, because the space is genuinely different:
//
//   • LANDING, 156px. The hero is a 400px band with nothing above the crest, so
//     the constraint is the booking widget, which tucks 48px up onto the hero.
//     At 156 the centred stack (crest + name + dates) clears the widget's top edge
//     with room to spare, and every tier of type is readable.
//   • BANDS, 110px. Chosen against the artwork, not the type: 110 makes the header
//     section exactly 240px tall (30 padding + 110 + 12 + 28 title + 6 + 24 sub +
//     30 padding), which is the natural height of the 1440×240 banner. The band
//     therefore renders its image 1:1 with NO crop at 1440 — the size and the
//     artwork agree instead of one fighting the other. Anything taller starts
//     pushing the results below the fold for a 240px header, which is too much
//     header for a step in the middle of a flow.
//
// SHARPNESS: the source is 400×400. At a 2× device pixel ratio 156px asks for 312
// device px and 110px asks for 220 — both inside 400, so neither context upscales.
// The ceiling is 200px CSS; do not exceed it without new artwork.
//
// The numbers themselves live in the scoped CSS of the four screens, where the
// breakpoints that step them down also live — a height is a stylesheet's job, and
// exporting it as a JS constant only to hardcode the media-query variants beside
// it would put the same decision in two places.
