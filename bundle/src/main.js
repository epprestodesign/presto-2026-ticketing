// Bundle prototype bootstrap — mirrors .storybook/preview.js so the library
// components render identically to Storybook (same Quasar plugins + global Q*
// registration + DS stylesheets). No library files are modified.
import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import * as QComponents from 'quasar'

import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/roboto-font/roboto-font.css'
import 'quasar/src/css/index.sass'
import '@lib/css/app.scss'

import App from './App.vue'

const app = createApp(App)
app.use(Quasar, { plugins: { Notify, Dialog, Loading } })

// Register every Q* component globally so library templates using <q-*> work.
for (const [name, component] of Object.entries(QComponents)) {
  if (
    /^Q[A-Z]/.test(name) &&
    component &&
    (component.render || component.setup || component.__name || component.name)
  ) {
    app.component(name, component)
  }
}

app.mount('#app')
