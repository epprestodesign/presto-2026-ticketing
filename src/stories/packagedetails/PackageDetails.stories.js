// PACKAGE DETAILS — the event's full ticket + package offerings on one screen,
// laid out like the Book Reservation hotel-details page (gallery hero → sticky
// section tabs → summary → offerings). Shows every ticket tier and every Patriots
// experience package for this specific event. Prototype data.
import GlobalNav from '../../components/GlobalNav.vue'
import PackageDetailPage from '../../components/PackageDetailPage.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { generateExperiencePackages } from '../../lib/bundles.js'
import { GAMEDAY_IMAGERY } from '../../lib/gamedayImagery.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const packages = generateExperiencePackages(event, { nights: 1 })

// Gallery — bundled gameday / experience photos mapped to the mosaic shape.
const gallery = GAMEDAY_IMAGERY
  .filter((i) => ['stadium', 'field', 'tailgate', 'fans', 'celebrate', 'night-lights', 'stadium-day', 'entry-line'].includes(i.id))
  .map((i) => ({ src: i.src, title: i.alt }))

// Signature experiences — flattened across packages, deduped by label, tagged
// with the package theme they belong to.
const seen = new Set()
const experiences = packages.flatMap((p) => (p.experiences || []).map((x) => ({ ...x, theme: p.theme })))
  .filter((x) => (seen.has(x.label) ? false : seen.add(x.label)))

const about = [
  'EventPipe is treating the companies on its client list to an unforgettable day at Gillette Stadium as the New England Patriots host the Buffalo Bills. Choose exactly how your group experiences the game — from a single ticket tier to an all-in package with a signature experience and a nearby hotel stay.',
  'Every offering below is built for this event: real ticket levels, Patriots-experience packages, and the extras that make the day. Pick a ticket, add a hotel, or let a package take care of everything.',
]

const policies = [
  { title: 'Tickets & delivery', body: 'Mobile tickets are delivered to the EventPipe app before gameday and scanned at the gate. Your whole party is seated together in one block.' },
  { title: 'Packages', body: 'Each package is a single SKU covering the ticket, the signature experience, and (where included) the hotel stay — charged together in one secure payment.' },
  { title: 'Hotel stays', body: 'Package and add-on hotels are contracted rates near Gillette Stadium. Check-in from 3:00 PM, check-out by 11:00 AM. One night unless noted.' },
  { title: 'Changes & protection', body: 'Every ticket is protected — if something comes up with the event, EventPipe has you covered. Package changes are subject to availability up to gameday.' },
]

export default {
  title: 'Package Details/Package Details Page',
  component: PackageDetailPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component:
      'The event’s **package offerings** on one screen, laid out like the Book Reservation hotel-details page — gallery hero, sticky section tabs, an event summary, an Overview with value props (and a Read more), the signature Experiences, the Patriots experience Packages (each opens a condensed quick-view), and Policies. Built for the Patriots v Bills client-appreciation outing. Prototype pricing/inventory.' } },
  },
}

export const FullPage = {
  name: 'Full Page',
  render: () => ({
    components: { GlobalNav, PackageDetailPage },
    setup: () => ({ event, gallery, packages, experiences, about, policies }),
    template: `
      <div style="min-height:100vh;background:var(--ds-color-surface-canvas);">
        <global-nav brand="EventPipe" />
        <package-detail-page
          :event="event" :gallery="gallery" :packages="packages"
          :experiences="experiences" :about="about" :policies="policies"
        />
      </div>`,
  }),
}
