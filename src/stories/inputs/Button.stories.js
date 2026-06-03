import { QBtn } from 'quasar'

/**
 * INPUTS / Button  →  Quasar: QBtn  (direct usage, no wrapper)
 */
const meta = {
  title: 'Inputs/Button',
  component: QBtn,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Overview
**Button** triggers an action or event. It is the most common interactive
element in the system. We use Quasar's **QBtn** directly — it covers every
variant we need, so no local wrapper is required.

## Props / usage notes
| Prop | Notes |
| --- | --- |
| \`color\` | Brand token: \`primary\`, \`secondary\`, \`accent\`, \`positive\`, \`negative\`, \`info\`, \`warning\`, \`dark\` |
| \`label\` | Text label (or use the default slot for custom content) |
| \`icon\` / \`icon-right\` | Material icon name |
| \`outline\` / \`flat\` / \`unelevated\` / \`push\` | Visual emphasis levels |
| \`round\` / \`rounded\` | Shape; \`round\` for icon-only |
| \`size\` | \`xs\` … \`xl\` |
| \`loading\` | Shows a spinner and blocks clicks |
| \`disable\` | Non-interactive state |
| \`to\` / \`href\` | Render as a router-link / anchor |

Our \`app.scss\` override removes UPPERCASE, softens the radius, and sets weight 500.

## UX guidance
- One **primary (high-emphasis)** button per view — the main action.
- Use **flat/outline** for secondary actions to keep hierarchy clear.
- Always pair destructive actions with \`color="negative"\` **and** a confirm step.
- Show \`loading\` for async actions instead of disabling silently.

## Do / Don't
- ✅ Use a verb label ("Save changes", "Create project").
- ✅ Keep one dominant button per section.
- ❌ Don't stack multiple filled primary buttons side by side.
- ❌ Don't use color alone to signal danger — include a clear label.

## Quasar mapping
\`Button → QBtn\` (direct). Button Group → \`QBtnGroup\`, FAB → \`QBtn\` with \`fab\`/\`round\`, Toggle Button → \`QBtnToggle\` (see their own pages).
`,
      },
    },
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning', 'dark'],
    },
    label: { control: 'text' },
    icon: { control: 'text' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    outline: { control: 'boolean' },
    flat: { control: 'boolean' },
    rounded: { control: 'boolean' },
    loading: { control: 'boolean' },
    disable: { control: 'boolean' },
  },
  args: { color: 'primary', label: 'Button', size: 'md' },
}
export default meta

/** Basic example — the default high-emphasis button. Edit it live in Controls. */
export const Basic = {
  render: (args) => ({
    setup: () => ({ args }),
    template: `<q-btn v-bind="args" />`,
  }),
}

/** Common states: default, loading, disabled. */
export const States = {
  parameters: { docs: { description: { story: 'The states a button moves through during interaction.' } } },
  render: () => ({
    template: `
      <div class="q-gutter-sm">
        <q-btn color="primary" label="Default" />
        <q-btn color="primary" label="Loading" loading />
        <q-btn color="primary" label="Disabled" disable />
      </div>`,
  }),
}

/** Emphasis variants — from highest to lowest. */
export const Variants = {
  parameters: { docs: { description: { story: 'Emphasis levels: standard (filled) → unelevated → outline → flat.' } } },
  render: () => ({
    template: `
      <div class="q-gutter-sm">
        <q-btn color="primary" label="Standard" />
        <q-btn unelevated color="primary" label="Unelevated" />
        <q-btn outline color="primary" label="Outline" />
        <q-btn flat color="primary" label="Flat" />
        <q-btn rounded color="primary" icon="add" label="Rounded" />
        <q-btn round color="primary" icon="favorite" />
      </div>`,
  }),
}
