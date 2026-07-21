// MEDIA & VISUALS / Hero Banner / Patriots — the themed edge case: the same
// Landing Page + Hotel Listings banners as the Default folder, but with the
// selected Patriots backdrop (the bundled New England Patriots event image the
// ticketing Event Hero renders). The Default folder keeps the generic imagery
// for documentation; this folder shows how the banner carries a live event theme.
import epLogoWhite from '../../assets/eventpipe logos/eventpipe-logo-fff.svg'
import patriotsLogo from '../../assets/gameday/patriots-logo.jpg'

// Sample event content (name + formatted date range).
const EVENT_NAME = 'New England Patriots v Buffalo Bills'
const EVENT_DATES = 'Sat, Dec 6, 2026'

export default {
  title: 'Components/Media & Visuals/Hero Banner/Patriots',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Overview
The **Patriots** theme — the same hero banner as **Hero Banner / Default**, with
the selected event backdrop swapped in (the bundled New England Patriots event
image, matching the ticketing **Event Hero**). Same sizes and overlay:

| Story | Dimensions | Used on |
| --- | --- | --- |
| **Landing Page** | 1592×400 | Marketing / landing |
| **Hotel Listings** | 1440×200 | Search / listings results |

The EventPipe wordmark, event name, and date range sit over the themed backdrop.
The generic default imagery lives in **Hero Banner / Default** for documentation.
` } } },
}

const scrim = 'linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5))'
const bg = (url, extra = {}) => ({
  position: 'relative', backgroundColor: '#000', color: '#fff', overflow: 'hidden',
  backgroundImage: `${scrim}, url(${url})`,
  backgroundSize: 'cover', backgroundPosition: 'center',
  display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', ...extra,
})

/** Landing page hero (1592×400) — Patriots backdrop + event name + date. */
export const LandingPage = {
  name: 'Landing Page',
  render: () => ({
    setup: () => ({ style: { ...bg(patriotsLogo), minHeight: '400px' }, EVENT_NAME, EVENT_DATES, epLogoWhite }),
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

/** Hotel listings banner (1440×200) — Patriots backdrop + event name + date. */
export const HotelListings = {
  name: 'Hotel Listings',
  render: () => ({
    setup: () => ({ style: { ...bg(patriotsLogo), width: '100%', aspectRatio: '1440 / 200' }, EVENT_NAME, EVENT_DATES, epLogoWhite }),
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
