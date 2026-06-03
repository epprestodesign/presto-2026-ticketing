/** INPUTS / Text Field → Quasar: QInput (native; wrap as BirdieTextField later) */
import { ref } from 'vue'
export default {
  title: 'Inputs/Text Field',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `
## Overview
Single-line text entry. The workhorse input for guest details — name, email,
phone — plus promo codes and search.

## When to use
- Short free-form values; with \`type\` for email/number/password/search.

## When not to use
- Long text → **Text Area**. Choice from a set → **Select**.

## Accessibility
Always provide a \`label\`; surface errors with \`:rules\`/\`error\`+\`error-message\`.

## Quasar mapping
\`Text Field → QInput\` (native). Recommended Tier-2 wrapper: \`BirdieTextField\`.
` } } },
}

export const Basic = {
  render: () => ({ setup: () => ({ v: ref('') }), template: `<q-input v-model="v" outlined label="Guest name" style="max-width:320px" />` }),
}

export const Variants = {
  render: () => ({ setup: () => ({ a: ref(''), b: ref(''), c: ref('') }), template: `
    <div class="column q-gutter-md" style="max-width:320px">
      <q-input v-model="a" outlined label="Outlined" />
      <q-input v-model="b" filled label="Filled" />
      <q-input v-model="c" standout label="Standout" />
    </div>` }),
}

export const States = {
  render: () => ({ setup: () => ({ a: ref(''), b: ref('nope') }), template: `
    <div class="column q-gutter-md" style="max-width:320px">
      <q-input v-model="a" outlined label="With hint" hint="We never share it" />
      <q-input v-model="b" outlined label="Error" error error-message="Invalid value" />
      <q-input model-value="Disabled" disable outlined label="Disabled" />
    </div>` }),
}

export const WithIcons = {
  render: () => ({ setup: () => ({ email: ref(''), pwd: ref(''), show: ref(false) }), template: `
    <div class="column q-gutter-md" style="max-width:320px">
      <q-input v-model="email" outlined label="Email">
        <template #prepend><q-icon name="mail" /></template>
      </q-input>
      <q-input v-model="pwd" outlined :type="show ? 'text' : 'password'" label="Password">
        <template #append><q-icon :name="show ? 'visibility' : 'visibility_off'" class="cursor-pointer" @click="show=!show" /></template>
      </q-input>
    </div>` }),
}
