// Aug 4 Changes / Option C / Package Grid
import { computed } from 'vue'
import PackageTile from '../src/components/PackageTile.vue'
import { ROWS, TILES, price } from './_fixtures.js'

const meta = {
  title: 'Aug 4 Changes/Option C/Package Grid',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Option C landing page — the simplified one-click package board.\n\n' +
          'Six tiles: **3 ticket tiers × 2 contracted hotels**, ordered hotel-major so each row ' +
          'is one property across the three tiers. That ordering is what makes the two-tier ' +
          'model legible at a glance — the top row is the premium stay, the bottom row the same ' +
          'three tickets at the value stay.\n\n' +
          'The dates and party size live in the booking widget above (see *Booking Widget*), not ' +
          'on the tiles, because both re-price every tile at once.\n\n' +
          '**One badge, or none.** Exactly one tile on the board carries a hero badge — the ' +
          'best value per guest, a comparison a guest cannot make at a glance across six ' +
          'prices, two occupancies and a nights multiplier. Everything that was true of every ' +
          'tile has been taken off the tiles.\n\n' +
          'What is deliberately absent, all of it present in Option A: the filter rail, the ' +
          'scrolling result list, and the package modal.',
      },
    },
  },
  argTypes: {
    guests: { control: { type: 'range', min: 1, max: 8, step: 1 } },
    nights: { control: { type: 'range', min: 1, max: 5, step: 1 } },
  },
}
export default meta

const render = (args) => ({
  components: { PackageTile },
  setup() {
    const rows = args.rows
    const guests = args.guests ?? 2
    const nights = args.nights ?? 1

    const priced = computed(() => {
      const map = {}
      for (const row of rows) for (const t of row.tiles) map[t.id] = price(t, guests, nights)
      return map
    })
    // Same rule the real board uses: cheapest per guest gets the only badge.
    const bestId = computed(() => {
      let best = null
      for (const row of rows) for (const t of row.tiles) {
        const p = priced.value[t.id]
        const perGuest = p.packagePrice / p.guests
        if (!best || perGuest < best.perGuest) best = { id: t.id, perGuest }
      }
      return best?.id
    })
    const flagFor = (id) => (id === bestId.value ? { label: 'Best value per guest', icon: 'savings' } : null)

    return {
      rows, guests, priced, flagFor,
      roomsFor: (hotel) => Math.ceil(guests / hotel.sleeps),
      onSelect: (p) => console.log('select →', p.id, `${p.guests} guests`, `$${p.packagePrice}`),
      onHotel: (id) => console.log('open hotel details in a new tab:', id),
    }
  },
  template: `
    <div style="max-width:1440px;margin:0 auto;padding:24px;font-family:var(--ds-font-family)">
      <section v-for="row in rows" :key="row.hotel.id" style="margin-bottom:28px">
        <header style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:12px">
          <div>
            <h2 style="margin:0;font-size:1.125rem;font-weight:700">{{ row.hotel.stayTier }} · {{ row.hotel.name }}</h2>
            <p style="margin:2px 0 0;font-size:.875rem;color:var(--ds-color-text-subtle)">
              ★ {{ row.hotel.rating }} · {{ row.hotel.distanceMi }} mi from the stadium · {{ row.hotel.blurb }}
            </p>
          </div>
          <span style="font-size:.8125rem;font-weight:600;color:var(--ds-color-text-subtle);white-space:nowrap">
            {{ row.hotel.roomType }} · sleeps {{ row.hotel.sleeps }}
            <template v-if="roomsFor(row.hotel) > 1"> · {{ roomsFor(row.hotel) }} rooms needed</template>
          </span>
        </header>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px;align-items:stretch">
          <package-tile
            v-for="t in row.tiles" :key="t.id" :pkg="t" :priced="priced[t.id]" :flag="flagFor(t.id)"
            @select="onSelect" @open-hotel="onHotel"
          />
        </div>
      </section>
    </div>
  `,
})

/** The full board, exactly as the prototype's landing page renders it. */
export const SixTiles = { render, args: { rows: ROWS, guests: 2, nights: 1 } }

/**
 * The premium row on its own — one hotel, three ticket tiers. The price gap
 * between the tiles is the ticket's face value folded into the room rate.
 */
export const PremiumRow = { render, args: { rows: ROWS.slice(0, 1), guests: 2, nights: 1 } }

/**
 * A three-night stay. Every price triples; every saving is unchanged, because
 * nights multiply the room and the tickets are free however long you stay.
 */
export const ThreeNights = { render, args: { rows: ROWS, guests: 2, nights: 3 } }

/**
 * Eight guests. Both properties sleep four, so every tile books two rooms — the
 * row heading and each tile say so rather than the price quietly doubling.
 */
export const LargeParty = { render, args: { rows: ROWS, guests: 8, nights: 1 } }

/**
 * The 9-tile shape the feedback also floated, for comparison — a third hotel
 * block would fill a 3×3 board. Rendered from the same six tiles plus a repeat,
 * purely to judge the density.
 */
export const NineTileDensity = {
  render,
  args: {
    rows: [...ROWS, { hotel: { ...ROWS[0].hotel, stayTier: 'Third block (density study)' }, tiles: TILES.slice(0, 3) }],
    guests: 2,
    nights: 1,
  },
}
