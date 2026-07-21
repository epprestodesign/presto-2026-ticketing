// FOUNDATIONS / Hero Banner — one default banner asset used across page contexts.
// The image is bundled from /background-img so it renders in local dev and the
// deployed (subpath) build alike. The overlay shows only the event name and the
// event date range — no eyebrow / subtext.
import defaultBg from '../../../background-img/defaultBackgroundImage.png'
import epLogoWhite from '../../assets/eventpipe logos/eventpipe-logo-fff.svg'
import { GAMEDAY_IMAGERY } from '../../lib/gamedayImagery.js'
// Same Patriots event image the ticketing Event Hero renders (bundled from the
// Ticketmaster event feed), used here as the gameday banner's team badge.
import patriotsLogo from '../../assets/gameday/patriots-logo.jpg'

// Same bundled gameday shot the Event Hero uses as its stadium backdrop, so the
// Foundations banner and the ticketing Event Hero stay visually in sync.
const gamedayBg = GAMEDAY_IMAGERY.find((i) => i.id === 'stadium') || GAMEDAY_IMAGERY[0]

// Sample event content (name + formatted date range).
const EVENT_NAME = 'New England Patriots v Buffalo Bills'
const EVENT_DATES = 'Sat, Dec 6, 2026'

export default {
  title: 'Components/Media & Visuals/Hero Banner',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Overview
A single default hero banner used across page contexts, sized per story:

| Story | Dimensions | Used on |
| --- | --- | --- |
| **Landing Page** | 1592×400 | Marketing / landing |
| **Gameday** | 1592×400 | Marketing / landing (gameday photo) |
| **Hotel Listings** | 1440×200 | Search / listings results |

The banner is a **background image** (\`background-img/defaultBackgroundImage.png\`)
behind a centered overlay showing the **event name** and the **event date range**
(format: \`Wed, 6/16/2027 - Sat, 6/19/2027\`). No eyebrow or subtext.
` } } },
}

const scrim = 'linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5))'
const bg = (url, extra = {}) => ({
  position: 'relative', backgroundColor: '#000', color: '#fff', overflow: 'hidden',
  backgroundImage: `${scrim}, url(${url})`,
  backgroundSize: 'cover', backgroundPosition: 'center',
  display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', ...extra,
})

/** Landing page hero (1592×400) — event name + date range. */
export const LandingPage = {
  name: 'Landing Page',
  render: () => ({
    setup: () => ({ style: { ...bg(defaultBg), minHeight: '400px' }, EVENT_NAME, EVENT_DATES, epLogoWhite }),
    template: `
      <section :style="style">
        <div style="padding:0 24px; max-width:760px">
          <img :src="epLogoWhite" alt="EventPipe" style="height:44px;width:auto;display:block;margin:0 auto 18px" />
          <div class="text-h3" style="font-weight:700; line-height:1.1; margin:0">{{ EVENT_NAME }}</div>
          <div class="text-h6" style="font-weight:400; margin-top:10px">{{ EVENT_DATES }}</div>
        </div>
      </section>`,
  }),
}

/** Gameday hero (1592×400) — same stadium imagery as the ticketing Event Hero. */
export const Gameday = {
  name: 'Gameday',
  parameters: {
    docs: { description: { story: 'Landing-page hero sized 1592×400 using the bundled gameday stadium photo (`stadium-crowd-gago.jpg`) — the same image the ticketing **Event Hero** falls back to — so the marketing banner and the event page share one look. Unsplash attribution required.' } },
  },
  render: () => ({
    setup: () => ({ style: { ...bg(gamedayBg.src), minHeight: '400px' }, EVENT_NAME, EVENT_DATES, patriotsLogo, credit: gamedayBg }),
    template: `
      <section :style="style">
        <div style="padding:0 24px; max-width:760px">
          <img :src="patriotsLogo" alt="New England Patriots" style="height:88px;width:auto;display:block;margin:0 auto 18px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.45);outline:1px solid rgba(255,255,255,.18);outline-offset:-1px" />
          <div class="text-h3" style="font-weight:700; line-height:1.1; margin:0">{{ EVENT_NAME }}</div>
          <div class="text-h6" style="font-weight:400; margin-top:10px">{{ EVENT_DATES }}</div>
        </div>
        <p style="position:absolute;right:12px;bottom:10px;margin:0;font-size:11px;color:rgba(255,255,255,.72)">
          Photo by <a :href="credit.photographerUrl" target="_blank" rel="noopener" style="color:rgba(255,255,255,.92)">{{ credit.photographer }}</a>
          on <a :href="credit.photoUrl" target="_blank" rel="noopener" style="color:rgba(255,255,255,.92)">Unsplash</a>
        </p>
      </section>`,
  }),
}

/** Hotel listings banner (1440×200) — event name + date range. */
export const HotelListings = {
  name: 'Hotel Listings',
  render: () => ({
    setup: () => ({ style: { ...bg(defaultBg), width: '100%', aspectRatio: '1440 / 200' }, EVENT_NAME, EVENT_DATES, epLogoWhite }),
    template: `
      <section :style="style">
        <div style="padding:0 24px; max-width:760px">
          <img :src="epLogoWhite" alt="EventPipe" style="height:30px;width:auto;display:block;margin:0 auto 12px" />
          <div class="text-h5" style="font-weight:700; line-height:1.15; margin:0">{{ EVENT_NAME }}</div>
          <div class="text-body1" style="margin-top:6px">{{ EVENT_DATES }}</div>
        </div>
      </section>`,
  }),
}
