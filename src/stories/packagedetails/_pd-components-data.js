// Shared fixtures for the Package Details / Components stories. Underscore-
// prefixed so Storybook's *.stories glob ignores it (data module, not a story).
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { generateExperiencePackages } from '../../lib/bundles.js'
import { GAMEDAY_IMAGERY } from '../../lib/gamedayImagery.js'

export const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
export const packages = generateExperiencePackages(event, { nights: 1 })

export const gallery = GAMEDAY_IMAGERY
  .filter((i) => ['stadium', 'field', 'tailgate', 'fans', 'celebrate', 'night-lights', 'stadium-day', 'entry-line'].includes(i.id))
  .map((i) => ({ src: i.src, title: i.alt }))

const seen = new Set()
export const experiences = packages.flatMap((p) => (p.experiences || []).map((x) => ({ ...x, theme: p.theme })))
  .filter((x) => (seen.has(x.label) ? false : seen.add(x.label)))

export const policies = [
  { title: 'Tickets & delivery', body: 'Mobile tickets are delivered to the EventPipe app before gameday and scanned at the gate. Your whole party is seated together in one block.' },
  { title: 'Packages', body: 'Each package is a single SKU covering the ticket, the signature experience, and (where included) the hotel stay — charged together in one secure payment.' },
  { title: 'Hotel stays', body: 'Package and add-on hotels are contracted rates near Gillette Stadium. Check-in from 3:00 PM, check-out by 11:00 AM.' },
]

export const pad = (inner, max = 1180) => `<div style="max-width:${max}px;margin:0 auto;padding:32px 24px;background:var(--ds-color-surface-canvas);min-height:100vh;font-family:var(--ds-font-family);">${inner}</div>`
