// FOUNDATIONS / Hero Banner — one default banner asset used across page contexts.
// The image is bundled from /background-img so it renders in local dev and the
// deployed (subpath) build alike. The overlay shows only the event name and the
// event date range — no eyebrow / subtext.
import defaultBg from '../../../background-img/defaultBackgroundImage.png'
import epLogoWhite from '../../assets/eventpipe logos/eventpipe-logo-fff.svg'

// Sample event content (name + formatted date range).
const EVENT_NAME = 'Summer Soccer Classic 2027'
const EVENT_DATES = 'Wed, 6/16/2027 - Sat, 6/19/2027'

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
