// LANDING PAGE / Group Block — the fully composed landing page for the group
// block flow: Global Nav → Hero → Booking Widget → event description →
// Display Ads → Footer.
import LandingPage from '../../components/LandingPage.vue'

export default {
  title: 'Landing Page/Group Block',
  component: LandingPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Group Block
The event **Landing Page** for the **Group Block** flow — Global Nav → Hero
Banner → Booking Widget (group mode, hold-cart nav) → event description →
Display Ads → Footer.
` } } },
}

/** The full Group Block landing page. */
export const Page = {
  render: () => ({ components: { LandingPage }, template: '<landing-page mode="group" />' }),
}
