// Aug 4 Changes / Package Details / Package Modal
//
// The full-screen sheet that replaced the Package Details PAGE. Two columns: the
// package and its booking summary on the left, every choice on the right.
import PackageQuickViewDialog from '../src/components/PackageQuickViewDialog.vue'
import { PACKAGES, packageNames, byName, pkgOnly, pkgSoldOut } from './_fixtures.js'
import { journey } from '../src/store.js'

const meta = {
  title: 'Aug 4 Changes/Package Details/Package Modal',
  component: PackageQuickViewDialog,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Everything about a package in one sheet. In the app it is raised by ' +
          '`PackageListPage` as a `maximized` QDialog that slides up from the bottom; ' +
          'here it renders inline at full height. The left column carries the gallery, ' +
          "what's included, specs and the booking summary; the right carries the tier " +
          'picker, the hotels with their rooms, and the written detail. A package with ' +
          'no stay simply has no hotels block.',
      },
    },
  },
  argTypes: {
    packageName: { control: 'select', options: packageNames, name: 'package' },
    guests: { control: { type: 'range', min: 1, max: 12, step: 1 } },
    tierId: { control: 'inline-radio', options: ['club', 'lower', 'mezz', 'upper'], name: 'tier' },
  },
}
export default meta

// The modal reads the live journey store, so a story sets it before rendering.
const render = (args) => ({
  components: { PackageQuickViewDialog },
  setup() {
    const pkg = args.packageName ? byName(args.packageName) : args.pkg
    journey.guests = args.guests ?? 2
    journey.tierId = args.tierId ?? null
    journey.roomHotelId = args.roomHotelId ?? null
    journey.roomTypeId = args.roomTypeId ?? null
    journey.extraId = args.extraId ?? 'none'
    journey.activePkg = pkg
    return { pkg }
  },
  template: '<div style="height:100vh"><package-quick-view-dialog :pkg="pkg" /></div>',
})

/** Full controls — swap the package, tier and party size and watch it re-price. */
export const Playground = {
  render,
  args: { packageName: PACKAGES.find((p) => p.hotel).name, guests: 2, tierId: 'club' },
}

/** A package that includes a stay: the right column carries the hotels and rooms. */
export const WithHotel = {
  render,
  args: { packageName: PACKAGES.find((p) => p.hotel).name, guests: 2, tierId: 'club' },
}

/** Package only — same two columns, no hotels block, no room extras. */
export const PackageOnly = {
  render,
  args: { packageName: pkgOnly.name, guests: 2, tierId: 'club' },
}

/** A larger party: every line item scales with the guest count. */
export const LargeParty = {
  render,
  args: { packageName: PACKAGES.find((p) => p.hotel).name, guests: 8, tierId: 'club' },
}

/** The cheapest tier, showing how far the total moves on tier alone. */
export const BudgetTier = {
  render,
  args: { packageName: PACKAGES.find((p) => p.hotel).name, guests: 2, tierId: 'upper' },
}

/** Sold out — Reserve is disabled. */
export const SoldOut = {
  render: (args) => ({
    components: { PackageQuickViewDialog },
    setup() {
      journey.guests = 2
      journey.activePkg = pkgSoldOut
      return { pkg: pkgSoldOut }
    },
    template: '<div style="height:100vh"><package-quick-view-dialog :pkg="pkg" /></div>',
  }),
}
