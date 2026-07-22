// Experience prototype bootstrap — mirrors .storybook/preview.js (and the sibling
// /prototype and /bundle apps) exactly so the library components render
// identically to Storybook. No library files are modified.
import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import * as QComponents from 'quasar'

// Icon + font extras (same as Storybook).
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/roboto-font/roboto-font.css'

// Quasar core styles from SASS source so the brand variables apply.
import 'quasar/src/css/index.sass'

// The design system's global styles + component overrides.
import '@lib/css/app.scss'

import App from './App.vue'
import { journey, bootstrapFromUrl } from './store.js'
import { loadGoogleMaps } from '@lib/lib/googleMaps.js'

// Optional deep-link/demo entry (?screen=…); no-op for the normal Landing start.
bootstrapFromUrl()
// Expose journey for CDP-driven verification / debugging in the console.
if (typeof window !== 'undefined') window.__journey = journey

const app = createApp(App)
app.use(Quasar, { plugins: { Notify, Dialog, Loading } })

// Register every Q* component globally (identical to preview.js).
for (const [name, component] of Object.entries(QComponents)) {
  if (
    /^Q[A-Z]/.test(name) &&
    component &&
    (component.render || component.setup || component.__name || component.name)
  ) {
    app.component(name, component)
  }
}

// Preload Google Maps BEFORE mounting (same rationale as /prototype's main.js:
// the library HotelMap resolves its build-time key outside this app's root, so
// we seed the loader's singleton here where VITE_GOOGLE_MAPS_API_KEY is visible).
async function boot() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  if (typeof window !== 'undefined' && key) {
    try { sessionStorage.setItem('ds-gmaps-key', key) } catch (e) { /* sandboxed */ }
    try { await loadGoogleMaps(key) } catch (e) { /* map falls back gracefully */ }
  }
  app.mount('#app')
}
boot()
