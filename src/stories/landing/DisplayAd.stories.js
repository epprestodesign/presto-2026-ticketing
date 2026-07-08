// LANDING PAGE / Components / Display Ad — advertising slot placeholder (dotted brand box).
import DisplayAd from '../../components/DisplayAd.vue'

export default {
  title: 'Landing Page/Components/Display Ad',
  component: DisplayAd,
  tags: ['autodocs'],
  argTypes: {
    width: { control: 'number' },
    height: { control: 'number' },
    label: { control: 'text' },
  },
  parameters: { docs: { description: { component: `
## Overview
An **advertising slot placeholder** — a dashed box in the brand (primary) color
that labels its own dimensions. Default is **340×215**. Used on the Landing Page
ad row; drop it anywhere an ad unit will live. Override \`width\` / \`height\`
(the label follows automatically) or set a custom \`label\`.
` } } },
}

/** Default 340×215 ad slot. */
export const Default = {
  args: { width: 340, height: 215 },
  render: (args) => ({
    components: { DisplayAd },
    setup: () => ({ args }),
    template: '<display-ad v-bind="args" />',
  }),
}

/** A row of ad slots, as used on the Landing Page. */
export const AdRow = {
  name: 'Ad Row',
  render: () => ({
    components: { DisplayAd },
    template: `<div style="display:flex;gap:20px;flex-wrap:wrap">
      <display-ad /><display-ad /><display-ad />
    </div>`,
  }),
}
