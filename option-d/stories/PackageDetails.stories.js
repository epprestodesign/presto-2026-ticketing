// Aug 5 Changes / Option D / Package Details
import PackageDetailsScreen from '../src/screens/PackageDetailsScreen.vue'
import { journey } from '../src/store.js'

const meta = {
  title: 'Aug 5 Changes/Option D/Package Details',
  component: PackageDetailsScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Screen 2 — the package template page, opened by **View package details** on a card.\n\n' +
          "It is the library's own `PackageDetailPage` — gallery, value props, what's included, " +
          'the packages tab, policies — the same template `/experience-packages` uses. Nothing ' +
          'hand-rolled.\n\n' +
          '**This page is optional.** The Aug 5 afternoon feedback was that a guest already ' +
          'decided on a package should not have to load a second screen to press a second ' +
          'button — so the cards on screen 1 now check out directly, and this page is the ' +
          "drill-in for anyone who wants to read first. Its Select CTA calls the same " +
          '`selectPackage()` the card does: a longer route through the same decision, not a ' +
          'different one.\n\n' +
          'The template renders a grid of packages on its Packages tab. Option D has only two — ' +
          'the same two from screen 1 — and the one that was clicked leads. That is deliberate: ' +
          'someone who came in to read the detail should be able to switch without going back a ' +
          'screen.',
      },
    },
  },
}
export default meta

const render = (args) => ({
  components: { PackageDetailsScreen },
  setup() {
    journey.activePkgId = args.pkgId
    journey.tab = args.tab || 'overview'
    journey.people = args.people ?? 2
    return {}
  },
  template: '<package-details-screen />',
})

/** Opened from the Ritz-Carlton card — it leads, with the Westin beside it. */
export const RitzCarlton = { render, args: { pkgId: 'ritz-package', tab: 'overview' } }

/** Opened from the Westin card. */
export const Westin = { render, args: { pkgId: 'westin-package', tab: 'overview' } }

/**
 * Deep-linked to the Packages tab — the reference layout this screen was built
 * against.
 */
export const PackagesTab = { render, args: { pkgId: 'ritz-package', tab: 'packages' } }

/** A party of five, where the two hotels need different room counts. */
export const PartyOfFive = { render, args: { pkgId: 'ritz-package', tab: 'packages', people: 5 } }
