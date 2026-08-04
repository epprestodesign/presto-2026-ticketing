// Aug 4 Changes / Package Details / Package Result Card
import PackageResultCard from '../src/components/PackageResultCard.vue'
import { PACKAGES, packageNames, byName, pkgOnly, pkgSoldOut, canvas } from './_fixtures.js'

const meta = {
  title: 'Aug 4 Changes/Package Details/Package Result Card',
  component: PackageResultCard,
  decorators: [canvas('1100px')],
  parameters: {
    docs: {
      description: {
        component:
          'The Browse Packages row, rebuilt to the Browse Hotels **group card** layout: ' +
          'photo left, then one content region — stacked details over a footer with the ' +
          'Availability toggle bottom-left and price + CTA bottom-right. No vertical rule. ' +
          'The **Availability** toggle expands a carousel of the hotels the package covers.',
      },
    },
  },
  argTypes: {
    packageName: { control: 'select', options: packageNames, name: 'package' },
    selected: { control: 'boolean' },
  },
}
export default meta

const render = (args) => ({
  components: { PackageResultCard },
  setup: () => ({ pkg: args.packageName ? byName(args.packageName) : args.pkg, selected: args.selected }),
  template: '<package-result-card :pkg="pkg" :selected="selected" />',
})

export const Playground = {
  render,
  args: { packageName: PACKAGES.find((p) => p.hotel).name, selected: false },
}

/** Includes a stay — the status line counts rooms across all four hotels. */
export const WithHotel = { render, args: { packageName: PACKAGES.find((p) => p.hotel).name } }

/** Package only — the status line says so, and there is no Availability toggle. */
export const PackageOnly = { render, args: { packageName: pkgOnly.name } }

/** Selected: the ring the list draws on the package whose modal was last opened. */
export const Selected = { render, args: { packageName: PACKAGES.find((p) => p.hotel).name, selected: true } }

/** Sold out — dimmed, CTA muted. */
export const SoldOut = {
  render: () => ({
    components: { PackageResultCard },
    setup: () => ({ pkg: pkgSoldOut }),
    template: '<package-result-card :pkg="pkg" />',
  }),
}
