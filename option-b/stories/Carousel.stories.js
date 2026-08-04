// Aug 4 Changes / Option B / Foundations / Carousel
import Carousel from '../src/components/Carousel.vue'
import { canvas } from './_fixtures.js'

const meta = {
  title: 'Aug 4 Changes/Option B/Foundations/Carousel',
  component: Carousel,
  decorators: [canvas('620px')],
  parameters: {
    docs: {
      description: {
        component: `A scroll-snap track with arrows and dots, wrapping whatever you slot into it.

Written once after the same two bugs turned up twice:

- the **last item snaps to \`end\`** — under \`scroll-snap-type: x mandatory\` it can never
  align to the track's left edge, so the browser bounces back and leaves it half-clipped;
- arrows appear on **measured overflow** (\`ResizeObserver\`), not on item count — a count
  says nothing about whether the items actually fit.

Arrows sit inside the track, so an ancestor's \`overflow: hidden\` can't clip them.`,
      },
    },
  },
}
export default meta

const box = (n, w = '150px') => `
  <div style="flex:0 0 ${w};padding:20px 12px;border-radius:10px;background:var(--ds-palette-slate-100,#f1f2f4);text-align:center;font-family:var(--ds-font-family)">
    Item ${n}
  </div>`

const render = (count, w) => () => ({
  components: { Carousel },
  template: `<carousel label="items">${Array.from({ length: count }, (_, i) => box(i + 1, w)).join('')}</carousel>`,
})

/** Six items — overflows, so arrows and dots show and the last is reachable. */
export const Overflowing = { render: render(6) }

/** Two narrow items fit the track: the controls stay hidden. */
export const FitsWithoutScrolling = { render: render(2) }

/** Wide items, few of them — the end-snap case that used to clip the last card. */
export const WideItems = { render: render(4, '260px') }
