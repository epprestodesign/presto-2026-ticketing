<script setup>
// The EVENT BAND — the short Patriots header that runs across the top of the
// tickets step and the hotel property list (Aug 26 branding round).
//
// It exists as a component rather than as two copies of the same 20 lines of
// CSS because it now appears on two screens that are otherwise unrelated —
// TicketMapStep owns a two-pane map, App.vue owns a card list — and a band that
// is defined twice is a band that drifts. The tickets step had this treatment
// inline first; this file is that markup lifted out, unchanged apart from the
// artwork and the sizing note below.
//
// THE ARTWORK IS THE SUPPLIED 1440x240 CROP, shipped at @2x (2880x480), so
// there is no resolution ceiling on it at any width a browser is likely to be:
// at 1440 it is a 2x map, and even at 2880 it is still 1:1.
//
// SIZING. The crop is 6:1 and `cover` will crop whatever axis is short, so the
// height is driven off the viewport instead of being nailed to one number:
//
//   - at 1440 exactly, 16.667vw resolves to 240px and nothing is cropped;
//   - below 1440 the clamp floors at 200px, which is the height the content
//     block needs, and `cover` trims the far left and right — the artwork is a
//     receding field, uniform across its width, so a horizontal trim removes
//     nothing that can be missed;
//   - above 1440 the clamp caps at 240px, so the band does not grow into a
//     second hero, and `cover` has to trim vertically instead.
//
// WHICH IS WHY THE POSITION IS `bottom`, NOT `center`. The subject of this
// artwork is the lit turf and yard lines along the BOTTOM edge; the top third
// is near-black falloff. A centred crop would take equal bites out of both and
// spend half of them on the only part that carries the image. Anchored to the
// bottom, every vertical trim comes out of the black.
import bandBg from '../assets/event/event-band-1440x240.png'
import epLogoWhite from '@lib/assets/eventpipe logos/eventpipe-logo-fff.svg'

defineProps({
  eventName: { type: String, default: '' },
  eventDates: { type: String, default: '' },
})

// THE SCRIM IS LIGHTER THAN THE LIBRARY'S. A hero scrim exists to hold type off
// imagery that is brighter or busier than the type; this artwork is neither.
// It arrives already graded almost to black across the top two thirds — exactly
// where the event name and the dates sit — so the library's flat 50% is not
// buying legibility that the image has not already paid for. What it would cost
// is the picture: at 50% the turf and the yard lines, the only part of the frame
// with any light in it, crush to a flat dark green nobody can read as a field.
//
// 22% is the number that keeps the white type comfortably clear (measured
// against the LIGHTEST pixels in the crop, the yard-line paint at the bottom
// edge, which the type never reaches) while leaving the field visible as a
// field. It is still a scrim, not an absence of one: it evens out the paint
// strokes so a stray yard line cannot cut through a descender.
const scrim = 'linear-gradient(rgba(0,0,0,.22), rgba(0,0,0,.22))'
// `100% auto`, NOT `cover`. The Aug 26 artwork put the two helmets hard against
// the LEFT and RIGHT edges facing each other, with the dark centre reserved for
// the type. `cover` fills by whichever axis is short, so at any viewport
// narrower than the file's 6:1 it trims horizontally — straight through the only
// two subjects in the frame, and asymmetrically, so one team loses its helmet
// before the other. Fitting the width instead guarantees both helmets survive at
// every width and spends the trim vertically, where the frame is black falloff
// above and unlit turf below. The earlier `center bottom` reasoning ("the field
// is uniform across its width, so side trim is free") was true of the previous
// image and is false of this one.
// NO-REPEAT IS PART OF `100% auto`, NOT AN EXTRA. `background-repeat` defaults
// to `repeat`, and under the old `cover` that was invisible because the image
// always filled the box — there was never an uncovered strip to tile into.
// `100% auto` fits the WIDTH, so at any viewport where the band's box is taller
// than width/6 the leftover strip tiled a second copy of the picture: a sliver
// of turf and a repeated helmet edge above and below the real frame. Declaring
// no-repeat turns that strip into the band's own black (`background-color: #000`
// on .eband), which reads as letterboxing rather than as a seam.
// Reverting to `cover` would also have hidden the tiling — by cropping through
// the two helmets, which is the exact thing `100% auto` exists to prevent.
const bandStyle = {
  backgroundImage: `${scrim}, url(${bandBg})`,
  backgroundSize: '100% auto',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}
</script>

<template>
  <section class="eband" :style="bandStyle">
    <div class="eband__inner">
      <img :src="epLogoWhite" alt="EventPipe" class="eband__logo" />
      <div class="text-h5 eband__event">{{ eventName }}</div>
      <div class="text-body1 eband__dates">{{ eventDates }}</div>
    </div>
  </section>
</template>

<style scoped>
.eband {
  position: relative;
  height: clamp(200px, 16.6667vw, 240px);
  display: flex; align-items: center; justify-content: center; text-align: center;
  color: #fff; background-color: #000; overflow: hidden;
}
.eband__inner { padding: 24px; max-width: 760px; }
.eband__logo { height: 30px; width: auto; margin: 0 auto 12px; display: block; }
.eband__event { font-weight: 700; line-height: 1.15; margin: 0; }
.eband__dates { margin-top: 6px; }
</style>
