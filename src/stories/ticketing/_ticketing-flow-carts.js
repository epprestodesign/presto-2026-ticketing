// Shared cart data for the four ticketing purchase flows (2×2), reused by the
// Confirmation and Checkout Experience story folders so all surfaces show the
// same prototype orders. Not a story file (underscore-prefixed) — Storybook only
// loads *.stories.js. Prototype pricing/inventory.
import { buildBundleCart, buildPackageCart, ticketDetails, CONTRACTED_HOTELS, generateExperiencePackages, stripHotel } from '../../lib/bundles.js'
import { deriveTiers } from '../../lib/seatmap.js'
import { fixtureEvents } from '../../lib/ticketmaster.js'

export const event = fixtureEvents.find((e) => /gillette|stadium/i.test(e.venue?.name || '')) || fixtureEvents[0]
export const tier = deriveTiers(event)[1] // Club
export const hotel = CONTRACTED_HOTELS[1] // The Westin

export const pkgOnly = stripHotel(generateExperiencePackages(event, { nights: 1 })[0]) // Legends Stadium Tour, no hotel
export const pkgHotel = generateExperiencePackages(event, { nights: 1 })[0]            // …with the hotel stay

// Shared seat-detail rows (ticket info; EventPipe-framed).
const detail = { ticketDetails: ticketDetails({ section: 'CL10', row: '12' }) }

// The four carts, all in the shared ticketing cart shape.
export const ticketsOnlyCart = { ...buildBundleCart({ event, tier, quantity: 2 }), ...detail }
export const ticketsHotelCart = { ...buildBundleCart({ event, tier, quantity: 2, hotel, nights: 1 }), ...detail, savings: 58 }
export const packagesOnlyCart = { ...buildPackageCart(pkgOnly), ...detail }
export const packagesHotelCart = { ...buildPackageCart(pkgHotel), ...detail }
