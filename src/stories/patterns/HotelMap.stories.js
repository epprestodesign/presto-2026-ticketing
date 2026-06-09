// PATTERNS / Hotel Map — map-only listings view with price-pill markers.
import HotelMap from '../../components/HotelMap.vue'
import { getImages } from '../../lib/imagery'

// Vary popup imagery across categories (instant local fallback set).
const cats = ['exterior', 'lobby', 'rooms', 'pool', 'dining', 'spa']
const img = (i) => (getImages(cats[i % cats.length])[0] || {}).url

// Sample Nashville-area hotels with real-ish coordinates.
// `url` points to each hotel's details page (placeholder routes for now — the
// popup image + name link here for future navigation).
const hotels = [
  { id: '1', name: 'Hilton Nashville Downtown', location: 'Nashville, TN', lat: 36.1567, lng: -86.7790, price: 250, rating: 4.5, reviews: 120, image: img(0), url: '#/hotels/hilton-nashville-downtown' },
  { id: '2', name: 'Omni Nashville Hotel', location: 'Nashville, TN', lat: 36.1583, lng: -86.7758, price: 289, rating: 4.6, reviews: 980, image: img(1), url: '#/hotels/omni-nashville' },
  { id: '3', name: 'The Hermitage Hotel', location: 'Nashville, TN', lat: 36.1652, lng: -86.7836, price: 415, rating: 4.8, reviews: 540, image: img(2), url: '#/hotels/the-hermitage' },
  { id: '4', name: 'JW Marriott Nashville', location: 'Nashville, TN', lat: 36.1554, lng: -86.7812, price: 332, rating: 4.7, reviews: 760, image: img(3), url: '#/hotels/jw-marriott-nashville' },
  { id: '5', name: 'The Bellwether Nashville', location: 'Nashville, TN', lat: 36.1499, lng: -86.7920, price: 198, rating: null, reviews: 0, image: img(4), url: '#/hotels/the-bellwether' },
  { id: '6', name: 'Gaylord Opryland Resort', location: 'Nashville, TN', lat: 36.2114, lng: -86.6947, price: 276, rating: 4.4, reviews: 3200, image: img(5), url: '#/hotels/gaylord-opryland' },
]

export default {
  title: 'Patterns/Hotel Map',
  component: HotelMap,
  tags: ['autodocs'],
  argTypes: {
    zoom: { control: { type: 'range', min: 3, max: 18 } },
    height: { control: 'text' },
  },
  parameters: { docs: { description: { component: `
## Overview
**Hotel Map** plots hotel listings on a Google Map, one **price-pill marker** per
hotel. Clicking a pill selects it (inverts to the brand color) and opens a popup
card with photo, name, rating, and nightly price. The map auto-fits its bounds to
all pins.

**Key handling:** the Maps JS key comes from \`VITE_GOOGLE_MAPS_API_KEY\`
(gitignored \`.env\` locally; a GitHub Actions secret for the deployed build). When
no key is present the component renders a styled fallback instead of failing.

**Props:** \`hotels\` (with \`lat\`/\`lng\`/\`price\`/…), \`center\`, \`zoom\`, \`currency\`,
\`mapId\`, \`height\`.
` } } },
}

// The event/tournament venue — a pulsing dot the map stays centered on.
const eventLocation = { lat: 36.1592, lng: -86.7785, label: 'Tournament venue' }

/** Map with six Nashville hotels; price pills + click-to-open popup cards.
 *  A pulsing "event location" dot anchors the center of the viewport. */
export const Default = {
  render: () => ({ components: { HotelMap }, setup: () => ({ hotels, eventLocation }), template: '<hotel-map :hotels="hotels" :event-location="eventLocation" :zoom="13" height="560px" />' }),
}

/** A small result set (two hotels). */
export const FewListings = {
  render: () => ({ components: { HotelMap }, setup: () => ({ hotels: hotels.slice(0, 2) }), template: '<hotel-map :hotels="hotels" height="440px" />' }),
}
