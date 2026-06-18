// HOTEL DETAILS / Hotel Detail Page — the full detail screen, composed from the
// Hotel Details building blocks (gallery, tabs, summary header, rooms carousel,
// about, amenities, policies).
import HotelDetailPage from '../../components/details/HotelDetailPage.vue'
import GlobalNav from '../../components/GlobalNav.vue'
import { popularAmenities, amenityGroups } from '../../lib/amenities.js'

const feat = (n) => [
  { icon: 'wifi', label: 'Free WiFi' },
  { icon: 'free_breakfast', label: 'Breakfast' },
  { icon: 'straighten', label: `${n} sq ft` },
]

const rooms = [
  { roomType: 'King Bedroom', bedConfig: '1 King Bed', sleeps: 2, features: feat(241), price: 269, total: 970.26, refundable: true, seed: 0 },
  { roomType: 'Double Queen Bedroom', bedConfig: '2 Queen Beds', sleeps: 4, features: feat(256), price: 331, total: 1180.5, refundable: false, seed: 1 },
  { roomType: 'Studio Suite', bedConfig: '1 King Bed + Sofa', sleeps: 3, features: feat(240), originalPrice: 420, price: 369, discountLabel: '12% Off', total: 1320, refundable: true, badge: { label: 'Member Price', tone: 'blue' }, seed: 2 },
  { roomType: 'Executive Suite', bedConfig: '1 King Bed, Living Room', sleeps: 4, features: feat(480), price: 459, total: 1640, refundable: true, availability: 'limited', roomsLeft: 2, seed: 3 },
  { roomType: 'Accessible King', bedConfig: '1 King Bed', sleeps: 2, features: feat(245), price: 269, total: 970.26, refundable: true, availability: 'soldout', seed: 4 },
]

const policies = [
  { title: 'Check-in', body: 'Check-in from 3 PM – 2:00 AM' },
  { title: 'Check-out', body: 'Check-out before noon' },
  { title: 'Children and extra beds', body: 'Extra beds depend on the room you choose. All children are welcome. When booking more than 5 rooms, different policies and additional supplements may apply.' },
]

const base = {
  name: 'Hilton Orlando Lake Buena Vista',
  stars: 4,
  address: 'Lake Buena Vista, Orlando, FL',
  distance: '2.4 mi from venue',
  score: 4.5,
  reviews: 1284,
  ratingLabel: 'Excellent',
  popularAmenities: popularAmenities(),
  rooms,
  roomsSubtitle: 'Prices shown are per night for your selected dates.',
  about: 'Located in the heart of Lake Buena Vista, this resort is an ideal base for tournament weekends — minutes from the pitch, with top attractions, dining, and shopping just steps away. Relax in a newly renovated room after match day, unwind at the heated pool and spa, or refuel at one of three on-site restaurants. Complimentary premium Wi-Fi and a 24-hour fitness centre round out a stay built for teams and families alike.',
  amenityGroups: amenityGroups(),
  policies,
}

export default {
  title: 'Hotel Details/Hotel Detail Page',
  component: HotelDetailPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: `
## Overview
The **Hotel Detail Page** is the full detail screen, composed end-to-end from
the Hotel Details building blocks:

1. **Photo Gallery** (DsImageList) with a "See all photos" affordance
2. **Detail Tabs** (sticky) — each tab scrolls to its section
3. **Hotel Summary Header** — name, stars, score, popular amenities, mini-map
4. **Rooms** carousel — "Select Your Room" (incl. a sold-out room)
5. **About the Property**, **Amenities**, and **Property Policies** sections

> The summary mini-map needs a Google Maps API key at runtime (key prompt,
> same as Browse Hotels / Hotel Map).
` } } },
}

/** The full hotel detail screen — reserve room rates. */
export const Default = {
  render: () => ({
    components: { HotelDetailPage },
    setup: () => ({ args: base }),
    template: `<hotel-detail-page v-bind="args" />`,
  }),
}

/**
 * **Full rendered page** — the detail screen in real app context, under the
 * persistent **Global Nav** with a sub-hero banner and footer, mirroring the
 * prototype's end-to-end screen.
 */
export const FullPage = {
  render: () => ({
    components: { GlobalNav, HotelDetailPage },
    setup: () => ({ args: base, cart: {}, saved: [] }),
    template: `
      <div style="background:var(--ds-color-surface)">
        <global-nav brand="Soccer League" cart-mode="reserve" :cart="cart" :saved="saved" />
        <div style="position:relative;color:#fff;padding:28px;min-height:120px;display:flex;align-items:center;justify-content:center;gap:18px;overflow:hidden;background:linear-gradient(90deg,rgba(9,9,11,.78),rgba(9,9,11,.45) 45%,rgba(9,9,11,.55)),var(--ds-palette-zinc-800)">
          <div style="text-align:center">
            <h2 style="margin:0;font-size:1.5rem;font-weight:700">2025–2026 Soccer Season</h2>
            <p style="margin:2px 0 0;opacity:.85;font-size:.95rem">Secure Your Stay for Soccer — Rooms Going Fast!</p>
          </div>
        </div>
        <div style="padding-top:8px">
          <a style="display:inline-flex;align-items:center;gap:6px;max-width:1180px;margin:8px auto 0;padding:0 24px;width:100%;color:var(--ds-color-text);font-weight:500;font-size:.9375rem;cursor:pointer">‹ Back to Hotel listing</a>
          <hotel-detail-page v-bind="args" />
        </div>
        <footer style="background:var(--ds-palette-zinc-950);color:#fff;padding:40px 24px;text-align:center;font-size:.85rem;opacity:.85">Powered by <strong>eventpipe</strong></footer>
      </div>
    `,
  }),
}

/** Group-booking variant — the rooms carousel in "hold" mode. */
export const GroupHold = {
  render: () => ({
    components: { HotelDetailPage },
    setup: () => ({
      args: {
        ...base,
        roomsTitle: 'Hold Rooms for Your Group',
        roomsSubtitle: 'Choose how many rooms to hold each night.',
        rooms: rooms.map((r, i) => ({
          ...r, mode: 'hold', total: undefined, originalPrice: undefined, discountLabel: '',
          nights: [
            { date: 'Tue, Jun 23', roomsLeft: 4, price: r.price },
            { date: 'Wed, Jun 24', roomsLeft: 5, price: r.price },
            { date: 'Thu, Jun 25', roomsLeft: 6, price: r.price + 20 },
          ],
        })),
      },
    }),
    template: `<hotel-detail-page v-bind="args" />`,
  }),
}
