// Aug 4 Changes / Option A / Package Details / Inclusions · Timeline · Policies
//
// The three written blocks that fill out the right column — they're what lets a
// package-only SKU hold two columns without a hotels section.
import PackageInclusions from '../src/components/package/PackageInclusions.vue'
import GamedayTimeline from '../src/components/package/GamedayTimeline.vue'
import PackagePolicies from '../src/components/package/PackagePolicies.vue'
import { pkgWithHotel, pkgOnly, inclusionsFor, canvas } from './_fixtures.js'

export default {
  title: 'Aug 4 Changes/Option A/Package Details/Detail Blocks',
  decorators: [canvas('700px')],
  parameters: {
    docs: {
      description: {
        component:
          'Itemised inclusions, the gameday timeline and the policy accordion. Copy comes ' +
          'from `src/packageDetail.js`; the inclusions list is derived per package so a ' +
          'stay only appears when the package has one.',
      },
    },
  },
}

/** Every experience with real detail rather than a bare label — hotel package. */
export const Inclusions = {
  render: () => ({
    components: { PackageInclusions },
    setup: () => ({ items: inclusionsFor(pkgWithHotel) }),
    template: '<package-inclusions :items="items" />',
  }),
}

/** The same block for a package with no stay — four items, no hotel line. */
export const InclusionsPackageOnly = {
  name: 'Inclusions — package only',
  render: () => ({
    components: { PackageInclusions },
    setup: () => ({ items: inclusionsFor(pkgOnly) }),
    template: '<package-inclusions :items="items" />',
  }),
}

/**
 * Arrival through postgame. The dot and the connecting line share one
 * `--tl-rail` offset on the `<li>`, which is what keeps them aligned.
 */
export const Timeline = {
  render: () => ({ components: { GamedayTimeline }, template: '<gameday-timeline />' }),
}

/** Native `<details>`, so it works without JS and stays keyboard-accessible. */
export const Policies = {
  render: () => ({ components: { PackagePolicies }, template: '<package-policies />' }),
}
