// FOUNDATIONS / Hotel Imagery — a bundled, presentation-ready library of
// hotel / hospitality photography for the ticketing prototypes (accommodation
// packages, hotel detail pages, confirmations). Downloaded from Unsplash and
// stored locally under src/assets/hotel-library/ — nothing is fetched at
// runtime. Attribution is shown per Unsplash guidelines.
//
// Pull from it with:  import { HOTEL_IMAGERY, hotelByCategory } from '@lib/hotelImagery.js'
import { hotelByCategory, HOTEL_IMAGERY } from '../../lib/hotelImagery.js'

export default {
  title: 'Foundations/Hotel Imagery',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component:
      'Bundled hotel / hospitality imagery for the ticketing prototypes. Local assets (no runtime fetch); grouped by category. Sourced from Unsplash with attribution.' } },
  },
}

export const Library = {
  render: () => ({
    setup: () => ({ groups: hotelByCategory(), total: HOTEL_IMAGERY.length }),
    template: `
      <div style="font-family:var(--ds-font-family);padding:28px;max-width:1080px;margin:0 auto;">
        <h2 style="margin:0 0 4px;color:var(--ds-color-text);">Hotels & Accommodation</h2>
        <p style="margin:0 0 24px;color:var(--ds-color-text-subtle);">{{ total }} bundled images across {{ groups.length }} categories · use for accommodation packages, hotel detail pages, and presentations.</p>

        <section v-for="g in groups" :key="g.category" style="margin-bottom:32px;">
          <h3 style="margin:0 0 12px;font-size:15px;color:var(--ds-color-text);">{{ g.category }}</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;">
            <figure v-for="im in g.images" :key="im.id" style="margin:0;border:1px solid var(--ds-color-border);border-radius:var(--ds-radius-lg);overflow:hidden;background:var(--ds-color-surface);">
              <img :src="im.src" :alt="im.alt" loading="lazy" style="width:100%;height:150px;object-fit:cover;display:block;" />
              <figcaption style="padding:8px 10px;font-size:12px;color:var(--ds-color-text-subtle);">
                {{ im.alt }}<br>
                <span style="font-size:11px;color:var(--ds-color-text-subtlest);">Photo by <a :href="im.photographerUrl" target="_blank" rel="noopener" style="color:var(--ds-color-text-subtle);">{{ im.photographer }}</a> on <a :href="im.photoUrl" target="_blank" rel="noopener" style="color:var(--ds-color-text-subtle);">Unsplash</a></span>
              </figcaption>
            </figure>
          </div>
        </section>
      </div>
    `,
  }),
}
