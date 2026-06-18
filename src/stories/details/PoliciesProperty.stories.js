// HOTEL DETAILS / Policies & Property — the property policies block plus the
// "More about the property" description block from the detail screen.
import PoliciesSection from '../../components/details/PoliciesSection.vue'
import AboutProperty from '../../components/details/AboutProperty.vue'

const policies = [
  { title: 'Check-in', body: 'Check-in from 3 PM – 2:00 AM' },
  { title: 'Check-out', body: 'Check-out before noon' },
  { title: 'Children and extra beds', body: 'Extra beds depend on the room you choose. All children are welcome. When booking more than 5 rooms, different policies and additional supplements may apply.' },
  { title: 'Pets', body: 'Pets are not allowed, with the exception of service animals.' },
]

const about = `Located in the heart of Lake Buena Vista, this resort is an ideal base for tournament weekends — minutes from the pitch, with top attractions, dining, and shopping just steps away. Relax in a newly renovated room after match day, unwind at the heated pool and spa, or refuel at one of three on-site restaurants. Complimentary premium Wi-Fi and a 24-hour fitness centre round out a stay built for teams and families alike.`

export default {
  title: 'Hotel Details/Policies & Property',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `
## Overview
Two sibling blocks from the lower half of the hotel detail screen:

- **About the Property** (\`AboutProperty\`) — a heading + body copy with an
  optional "See more" expander.
- **Property Policies** (\`PoliciesSection\`) — labelled policy terms
  (check-in/out, children & extra beds, pets, …); heading reuses DsSectionHeader.
` } } },
}

/** The "More about the property" description block, with See more. */
export const About = {
  render: () => ({
    components: { AboutProperty },
    setup: () => ({ about }),
    template: `<div style="max-width:760px"><about-property :text="about" /></div>`,
  }),
}

/** The property policies block. */
export const Policies = {
  render: () => ({
    components: { PoliciesSection },
    setup: () => ({ policies }),
    template: `<div style="max-width:760px"><policies-section :policies="policies" /></div>`,
  }),
}

/** Both blocks stacked, as they appear on the detail screen. */
export const Combined = {
  render: () => ({
    components: { AboutProperty, PoliciesSection },
    setup: () => ({ about, policies }),
    template: `<div style="max-width:760px;display:flex;flex-direction:column;gap:40px"><about-property :text="about" /><policies-section :policies="policies" /></div>`,
  }),
}
