// =============================================================
// BIRDIE DESIGN SYSTEM — STANDARD STORY TEMPLATE
// Copy this into src/stories/<category>/<Component>.stories.js
// Replace ComponentRef + title. Keep all section headings so every
// component page is consistent. Sections map to the required template:
// Overview · When To Use · When Not To Use · Variants · States · Sizes
// · Accessibility · Props · Examples · Do · Don't · Related Components
// =============================================================
import { QBtn } from 'quasar' // <- swap for the component you document
import { ref } from 'vue'

const meta = {
  title: 'Category/Component', // e.g. 'Inputs/Button'
  component: QBtn,             // enables the auto-generated Props table
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Overview
What it is and why it exists in one or two sentences.

## When to use
- Bullet the scenarios this is the right choice for.

## When not to use
- Bullet the scenarios where another component is better (link it).

## Accessibility
- Keyboard, focus, ARIA, contrast, target size (≥44px for POS/kiosk touch).

## Props / usage notes
| Prop | Notes |
| --- | --- |
| \`example\` | what it does |

## Do / Don't
- ✅ Do …
- ❌ Don't …

## Quasar mapping
\`Component → QXxx\` (direct / wrapper / plugin / token).

## Related components
[Other](?path=/docs/category-other--docs)
`,
      },
    },
  },
  argTypes: {
    // Controls for the live playground (Basic story binds these).
    // color: { control: 'select', options: [...] },
  },
  args: {},
}
export default meta

/** Basic example — the canonical usage; bound to Controls. */
export const Basic = {
  render: (args) => ({ setup: () => ({ args }), template: `<q-btn v-bind="args" />` }),
}

/** Variants — the distinct visual/functional forms. */
export const Variants = {
  parameters: { docs: { description: { story: 'Describe the variants shown.' } } },
  render: () => ({ template: `<div class="q-gutter-sm"><!-- variants --></div>` }),
}

/** States — default, hover/active (note in text), disabled, loading, error. */
export const States = {
  render: () => ({ template: `<div class="q-gutter-sm"><!-- states --></div>` }),
}

/** Sizes — if the component supports a size scale. */
export const Sizes = {
  render: () => ({ template: `<div class="q-gutter-sm items-end row"><!-- sizes --></div>` }),
}
