// Non-story helper (underscore-prefixed → Storybook ignores it). Builds the
// sticky-rail OrderSummary model for the four ticketing Checkout Experience
// stories, all driven by the shared carts in ../ticketing/_ticketing-flow-carts.js.
// CheckoutPage renders the itemized cart itself (CartReview 'ticketing' mode);
// this model backs the collapsed "Review order" summary (rrow1) and the final
// review step's total.
import { event } from '../ticketing/_ticketing-flow-carts.js'

const venue = event.venue?.name

// One OrderSummary model per flow.
//   rows  → a couple of lines describing seats / package / hotel
//   rrow1 → the collapsed "Review order" step summary
//   total → the final review step's amount (from the cart)
export function makeSummary(cart, rows, { rrow1, note } = {}) {
  return {
    image: event.image,
    title: event.name,
    subtitle: venue,
    rows,
    rrow1: rrow1 || (rows[0] ? `${rows[0].label}: ${rows[0].value}` : 'Order reviewed'),
    total: cart.total,
    note: note || 'Your seats are held while the timer runs.',
  }
}
