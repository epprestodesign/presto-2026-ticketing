<script setup>
// EventHero — the branded event hero above the package board.
//
// Same treatment as the library's LandingPage hero (scrim + event artwork +
// EventPipe wordmark), rebuilt here rather than mounting LandingPage: that
// component also brings a booking widget, an ad rail and a "Who's Attending"
// section, none of which belong above a one-click board. Option A mounts the
// whole page and then overrides the background image to re-skin it; Option C
// takes only the hero, so no library override is needed.
//
// Height is the trade-off. The library hero is `min-height: 400px`, which pushes
// the first row of packages well below the fold — the opposite of what the Aug 4
// feedback asks for. This one runs shorter and lets the search card overlap its
// bottom edge, so the branding is intact and the board still starts near the fold.
import epLogoWhite from '@lib/assets/eventpipe logos/eventpipe-logo-fff.svg'
import heroBg from '../assets/event-hero.jpg'
import { EVENT_NAME, EVENT_DATE_TIME } from '../event.js'

// The scrim keeps the wordmark and title legible over the artwork.
const scrim = 'linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5))'
const heroStyle = { backgroundImage: `${scrim}, url(${heroBg})` }
</script>

<template>
  <section class="hero" :style="heroStyle">
    <div class="hero__inner">
      <img :src="epLogoWhite" alt="EventPipe" class="hero__logo" />
      <h1 class="hero__event">{{ EVENT_NAME }}</h1>
      <p class="hero__dates">{{ EVENT_DATE_TIME }}</p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  /* Shorter than the library's 400px so the board still starts near the fold. */
  min-height: 300px;
  background-color: #000;
  background-size: cover;
  background-position: center;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  /* Room for the search card to tuck up onto the bottom edge. */
  padding-bottom: 40px;
}
.hero__inner { padding: 0 24px; max-width: 820px; }
.hero__logo { height: 40px; width: auto; margin: 0 auto 16px; display: block; }
.hero__event { font-weight: 700; line-height: 1.1; margin: 0; font-size: 2.5rem; text-wrap: balance; }
.hero__dates { font-weight: 400; margin: 10px 0 0; font-size: 1.125rem; }

@media (max-width: 720px) {
  .hero { min-height: 240px; }
  .hero__event { font-size: 1.75rem; }
}
</style>
