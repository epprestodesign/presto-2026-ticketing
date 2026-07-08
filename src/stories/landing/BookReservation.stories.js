// LANDING PAGE / Book Reservation — the fully composed landing page for the
// individual reservation flow: Global Nav → Hero → Booking Widget → event
// description → Display Ads → Footer.
import LandingPage from '../../components/LandingPage.vue'

export default {
  title: 'Landing Page/Book Reservation',
  component: LandingPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Book Reservation
The event **Landing Page** for the **Book Reservation** (individual) flow —
Global Nav → Hero Banner → Booking Widget (reservations mode) → event
description → Display Ads → Footer.
` } } },
}

/** The full Book Reservation landing page. */
export const Page = {
  render: () => ({ components: { LandingPage }, template: '<landing-page mode="reservations" />' }),
}
