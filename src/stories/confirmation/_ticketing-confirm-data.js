// Adapter: turn a shared ticketing cart (from ../ticketing/_ticketing-flow-carts.js)
// into the `data` object ConfirmationPage expects in mode="ticketing". Not a story
// file (underscore-prefixed) — Storybook only loads *.stories.js. Prototype data.
import { event } from '../ticketing/_ticketing-flow-carts.js'

const ICONS = { ticket: 'confirmation_number', hotel: 'hotel', package: 'redeem', experience: 'stars' }

// A reasonable, self-contained ticketing policy list (flat [{title,body}] shape;
// ConfirmationPage normalizes it under a single heading).
const TICKETING_POLICIES = [
  { title: 'Mobile entry', body: 'Tickets are delivered to the EventPipe app before gameday and scanned at the gate — no printouts needed.' },
  { title: 'Transfers & resale', body: 'You can transfer tickets to your party from the app up until the event begins.' },
  { title: 'Refunds & cancellations', body: 'If the event is cancelled or rescheduled, EventPipe will notify you with your refund or exchange options.' },
  { title: 'Event changes', body: 'Date, time, and lineup are set by the venue and may change. We’ll email you if anything about your order changes.' },
]

/**
 * Build the ConfirmationPage `data` for a ticketing order.
 * @param {object} cart  one of the four shared ticketing carts
 * @param {object} [opts] overrides: tone, bannerTitle, bannerSub, bannerCta,
 *                        statusNote, orderNumber, policies
 */
export function confData(cart, opts = {}) {
  const blocks = (cart.items || []).map((it) => ({
    icon: ICONS[it.type] || 'shopping_bag',
    name: it.label,
    meta: it.sublabel,
    amount: it.amount,
  }))

  return {
    tone: opts.tone || 'success',
    bannerTitle: opts.bannerTitle || 'Success! Your order is confirmed.',
    bannerSub: opts.bannerSub,
    bannerCta: opts.bannerCta || 'View my orders',
    orderNumber: opts.orderNumber || 'EP-2B8H5W',
    contactName: 'Justin Girard',
    guest: 'Justin Girard',
    email: 'hello@girardjustin.com',
    reservedOn: 'Dec 1, 2026',
    event: {
      name: event.name,
      date: 'Sat, Dec 6, 2026 · 4:25 PM',
      venue: (event.venue?.name || 'Gillette Stadium') + ' · Foxborough, MA',
    },
    blocks,
    totalCharged: cart.total,
    valueProps: cart.ticketDetails || [],
    statusNote: opts.statusNote || null,
    policies: opts.policies || TICKETING_POLICIES,
  }
}
