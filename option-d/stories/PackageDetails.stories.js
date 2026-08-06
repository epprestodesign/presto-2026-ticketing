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
          '**One package, not both** (Aug 6). The template renders a grid on its Packages tab, ' +
          'and this page used to hand it both of Option D\'s with the clicked one leading, so a ' +
          'reader could switch without going back a screen. In practice that made *View package ' +
          'details* open something other than what was asked for: press the button on the Westin ' +
          'card and you landed on a page showing the Westin **and** the Ritz, re-opening a ' +
          'decision already made. The board is where the two are compared — that is its job, and ' +
          'it is one click away via the back link.\n\n' +
          'Two knock-on changes: the **About** copy used to open *"Both packages carry exactly the ' +
          'same inclusions…"*, which only parsed with both on the page, so it now describes the ' +
          'package you opened and names the other as the alternative on the board; and the ' +
          'template\'s packages-section subtitle (*"…Select a package for a quick view"*) is ' +
          'hidden, since with one package there is nothing to select among.',
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
