/** INPUTS / Button Group → Quasar: QBtnGroup (native) */
export default {
  title: 'Inputs/Button Group',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `
## Overview
Groups related actions into a single segmented control. **QBtnGroup** wraps QBtn children.

## When to use
- A small set of related, mutually-exclusive-feeling actions (align, view mode).

## When not to use
- For single-select state use **Toggle**/**Radio Group**; for menus use **Menu**.

## Quasar mapping
\`Button Group → QBtnGroup\` (native).
` } } },
}

export const Basic = {
  render: () => ({ template: `
    <q-btn-group>
      <q-btn color="primary" icon="format_align_left" />
      <q-btn color="primary" icon="format_align_center" />
      <q-btn color="primary" icon="format_align_right" />
    </q-btn-group>` }),
}

export const Variants = {
  render: () => ({ template: `
    <div class="q-gutter-md">
      <q-btn-group outline>
        <q-btn outline color="primary" label="Day" />
        <q-btn outline color="primary" label="Week" />
        <q-btn outline color="primary" label="Month" />
      </q-btn-group>
      <q-btn-group push>
        <q-btn push color="primary" icon="undo" label="Undo" />
        <q-btn push color="primary" icon="redo" label="Redo" />
      </q-btn-group>
    </div>` }),
}
