/** LAYOUT / Image List → custom DsImageList (QImg-based) */
import DsImageList from '../../components/DsImageList.vue'
const items = [
  { src: 'https://cdn.quasar.dev/img/mountains.jpg', title: 'Lobby' },
  { src: 'https://cdn.quasar.dev/img/parallax1.jpg', title: 'Deluxe King' },
  { src: 'https://cdn.quasar.dev/img/parallax2.jpg', title: 'Pool' },
  { src: 'https://cdn.quasar.dev/img/quasar.jpg', title: 'Ocean Suite' },
  { src: 'https://cdn.quasar.dev/img/mountains.jpg', title: 'Spa' },
  { src: 'https://cdn.quasar.dev/img/parallax1.jpg', title: 'Restaurant' },
]
export default {
  title: 'Layout/Image List',
  component: DsImageList,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `
## Overview
A responsive grid of images with optional captions (hotel photo galleries: rooms, pool, dining).
No Quasar equivalent → custom \`DsImageList\` built on QImg.

## When to use
- Visual browsing of many images of equal importance.

## Quasar mapping
\`Image List → custom (DsImageList)\` over \`QImg\`.
` } } },
  argTypes: { cols: { control: { type: 'range', min: 2, max: 5 } } },
  args: { cols: 3 },
}
export const Basic = {
  render: (args) => ({ components: { DsImageList }, setup: () => ({ args, items }), template: `<ds-image-list :items="items" :cols="args.cols" style="max-width:520px" />` }),
}
