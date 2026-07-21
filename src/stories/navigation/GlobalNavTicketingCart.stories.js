// APP SHELL / Global Nav & Cart / Ticketing — the cart fly-out for the four
// ticketing purchase experiences (2×2: tickets/packages × with/without hotel).
// Each renders the persistent top bar with the cart opened onto the shared
// CartReview body in its new `ticketing` mode (flat itemized lines + price
// details + held countdown). Prototype pricing/inventory.
import GlobalNav from '../../components/GlobalNav.vue'
import { fixtureEvents } from '../../lib/ticketmaster.js'
import { deriveTiers } from '../../lib/seatmap.js'
import { buildBundleCart, CONTRACTED_HOTELS, generateExperiencePackages, stripHotel } from '../../lib/bundles.js'

const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
const tier = deriveTiers(event)[1] // Club
const hotel = CONTRACTED_HOTELS[1]
const HELD = 895 // 14:55 countdown

// Tickets — no hotel / with hotel. buildBundleCart already returns the ticketing
// cart shape { items, subtotal, fees, taxes, total } the fly-out consumes.
const ticketsOnlyCart = { ...buildBundleCart({ event, tier, quantity: 2 }), heldSeconds: HELD }
const ticketsHotelCart = { ...buildBundleCart({ event, tier, quantity: 2, hotel, nights: 1 }), heldSeconds: HELD, savings: 58 }

// Packages — a package is a single SKU (one line at the package price).
const pkgOnly = stripHotel(generateExperiencePackages(event, { nights: 1 })[0])
const pkgHotel = generateExperiencePackages(event, { nights: 1 })[0]
function pkgCart(pkg, sublabel) {
  const fees = Math.round(pkg.packagePrice * 0.10)
  const taxes = Math.round(pkg.packagePrice * 0.09)
  return {
    items: [{ type: 'package', label: pkg.name, sublabel, amount: pkg.packagePrice }],
    subtotal: pkg.packagePrice, fees, taxes, total: pkg.packagePrice + fees + taxes,
    currency: 'USD', savings: pkg.savings, heldSeconds: HELD,
  }
}
const packagesOnlyCart = pkgCart(pkgOnly, `${pkgOnly.ticket.tierName} ticket · ${pkgOnly.theme}`)
const packagesHotelCart = pkgCart(pkgHotel, `${pkgHotel.ticket.tierName} + ${pkgHotel.hotel.name} · ${pkgHotel.theme}`)

export default {
  title: 'App Shell/Global Nav & Cart/Ticketing',
  component: GlobalNav,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Overview
The cart fly-out for the four **ticketing** purchase experiences — the App Shell
counterpart to the Ticketing & Bundles flow folders (2×2: tickets/packages ×
with/without hotel). Each opens the shared **CartReview** body in its new
\`ticketing\` mode: a flat itemized cart (ticket / hotel / experience lines) with
a **Price details** card and the live held countdown.

| Story | Lines |
| --- | --- |
| **Tickets Only** | Ticket tier × qty |
| **Tickets + Hotel** | Ticket + nearby hotel |
| **Packages Only** | One package SKU (ticket + experience) |
| **Packages + Hotel** | One package SKU (ticket + experience + hotel) |

Prototype pricing/inventory.
` } },
  },
}

const story = (cart) => ({
  components: { GlobalNav },
  setup: () => ({ cart }),
  template: `<global-nav brand="EventPipe" cart-mode="ticketing" :cart="cart" :show-cart="true" :open-cart="true" />`,
})

export const TicketsOnly = { name: 'Tickets Only', render: () => story(ticketsOnlyCart) }
export const TicketsHotel = { name: 'Tickets + Hotel', render: () => story(ticketsHotelCart) }
export const PackagesOnly = { name: 'Packages Only', render: () => story(packagesOnlyCart) }
export const PackagesHotel = { name: 'Packages + Hotel', render: () => story(packagesHotelCart) }
