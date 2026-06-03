/** FEEDBACK / Banner → Quasar: QBanner (native) */
export default {
  title: 'Feedback/Banner',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `
## Overview
Prominent, page-level message that persists until acted on (system notices, onboarding).

## When to use
- App-wide announcements, maintenance notices, required actions.

## When not to use
- Section-scoped messages → **Alert**. Transient feedback → **Snackbar**.

## Quasar mapping
\`Banner → QBanner\` (native).
` } } },
}
export const Basic = {
  render: () => ({ template: `
    <q-banner class="bg-primary text-white" style="max-width:640px;border-radius:12px">
      <template #avatar><q-icon name="campaign" /></template>
      Book direct and save 10% with code STAY10 — members get free room upgrades.
      <template #action>
        <q-btn flat label="Dismiss" />
        <q-btn flat label="Learn more" />
      </template>
    </q-banner>` }),
}
