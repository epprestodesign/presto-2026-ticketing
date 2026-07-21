// PACKAGE DETAILS / Components — the individual building blocks of the Package
// Details "Offerings" page, broken out so each can be edited/reviewed on its own:
// the gallery hero, the event summary, the tickets list, the packages grid, the
// signature experiences, and the policies. Prototype data.
import GalleryHero from '../../components/details/GalleryHero.vue'
import PoliciesSection from '../../components/details/PoliciesSection.vue'
import TicketTierList from '../../components/TicketTierList.vue'
import PackageCard from '../../components/PackageCard.vue'
import PackageSummary from '../../components/PackageSummary.vue'
import PackageExperiences from '../../components/PackageExperiences.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { generateExperiencePackages } from '../../lib/bundles.js'
import { GAMEDAY_IMAGERY } from '../../lib/gamedayImagery.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const packages = generateExperiencePackages(event, { nights: 1 })
const gallery = GAMEDAY_IMAGERY
  .filter((i) => ['stadium', 'field', 'tailgate', 'fans', 'celebrate', 'night-lights', 'stadium-day', 'entry-line'].includes(i.id))
  .map((i) => ({ src: i.src, title: i.alt }))
const seen = new Set()
const experiences = packages.flatMap((p) => (p.experiences || []).map((x) => ({ ...x, theme: p.theme })))
  .filter((x) => (seen.has(x.label) ? false : seen.add(x.label)))
const policies = [
  { title: 'Tickets & delivery', body: 'Mobile tickets are delivered to the EventPipe app before gameday and scanned at the gate. Your whole party is seated together in one block.' },
  { title: 'Packages', body: 'Each package is a single SKU covering the ticket, the signature experience, and (where included) the hotel stay — charged together in one secure payment.' },
  { title: 'Hotel stays', body: 'Package and add-on hotels are contracted rates near Gillette Stadium. Check-in from 3:00 PM, check-out by 11:00 AM.' },
]

export default {
  title: 'Package Details/Components',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'The individual building blocks of the Package Details **Offerings** page, each isolated for editing/review.' } },
  },
}

const pad = (inner, max = 1180) => `<div style="max-width:${max}px;margin:0 auto;padding:32px 24px;background:var(--ds-color-surface-canvas);min-height:100vh;font-family:var(--ds-font-family);">${inner}</div>`

export const Gallery = {
  name: 'Gallery',
  render: () => ({ components: { GalleryHero }, setup: () => ({ gallery }), template: pad(`<GalleryHero :images="gallery" :all-images="gallery" modal-title="Gameday & experiences" />`) }),
}

export const Summary = {
  name: 'Summary',
  render: () => ({ components: { PackageSummary }, setup: () => ({ event }), template: pad(`<PackageSummary :event="event" />`, 760) }),
}

export const Tickets = {
  name: 'Tickets',
  render: () => ({ components: { TicketTierList }, setup: () => ({ event }), template: pad(`<h2 style="margin:0 0 16px;font-size:22px;color:var(--ds-color-text);">Tickets</h2><TicketTierList :event="event" />`, 760) }),
}

export const Packages = {
  name: 'Packages',
  render: () => ({
    components: { PackageCard },
    setup: () => ({ packages }),
    template: pad(`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px;"><PackageCard v-for="p in packages" :key="p.id" :pkg="p" @select="() => {}" @title="() => {}" /></div>`),
  }),
}

export const Experiences = {
  name: 'Experiences',
  render: () => ({ components: { PackageExperiences }, setup: () => ({ experiences }), template: pad(`<PackageExperiences :experiences="experiences" />`) }),
}

export const Policies = {
  name: 'Policies',
  render: () => ({ components: { PoliciesSection }, setup: () => ({ policies }), template: pad(`<PoliciesSection title="Ticketing & event policies" :policies="policies" />`, 760) }),
}
