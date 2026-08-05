// Shared fixtures for the "Aug 5 Changes / Option D" stories.
//
// Everything comes from the prototype's own data layer, so a story shows the same
// two packages — and the same numbers — the running app does.
import { packagesFor, HOTELS, TIER, NIGHTS, STAY_LABEL, STAY_SHORT, pricePackage } from '../src/packages.js'

/** Both packages, priced for a party. */
export const packages = (people = 2) => packagesFor(people)

export const westinPackage = (people = 2) => packagesFor(people)[0]
export const ritzPackage = (people = 2) => packagesFor(people)[1]

export { HOTELS, TIER, NIGHTS, STAY_LABEL, STAY_SHORT, pricePackage }

/** Centre a component on a padded canvas, as a story decorator. */
export const canvas = (width = '760px') => () => ({
  template: `<div style="max-width:${width};margin:0 auto;padding:24px;font-family:var(--ds-font-family)"><story /></div>`,
})
