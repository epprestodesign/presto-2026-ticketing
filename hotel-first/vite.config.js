import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// The design-system repo root (one level up from this app folder).
// Like /prototype and /bundle, this app imports the REAL library components from
// there — nothing is copied or forked. Deps (vue, quasar, plugins) resolve up the
// tree to the parent repo's node_modules; no local install needed.
const repoRoot = fileURLToPath(new URL('../', import.meta.url))
const libSrc = fileURLToPath(new URL('../src', import.meta.url))
const quasarVariables = fileURLToPath(new URL('../src/css/quasar.variables.scss', import.meta.url))

// When deployed as a Storybook sub-page on GitHub Pages the app is served from
// `/presto-2026-ticketing/hotel-first/`; local dev serves from `/`. The deploy
// workflow passes `--base=/presto-2026-ticketing/hotel-first/` at build time.
const envDir = fileURLToPath(new URL('./', import.meta.url))

export default defineConfig(({ mode }) => {
  // Loaded so VITE_* keys (Google Maps, imagery host) reach the app; there is no
  // Ticketmaster proxy here — a youth tournament isn't in the Discovery API, so
  // this app's event is a fixture by necessity rather than by fallback.
  loadEnv(mode, envDir, '')

  return {
    plugins: [
      vue({ template: { transformAssetUrls } }),
      quasar({ sassVariables: quasarVariables }),
    ],
    resolve: {
      alias: {
        // Import library components/lib/assets via a stable alias, e.g.
        //   import GlobalNav from '@lib/components/GlobalNav.vue'
        '@lib': libSrc,
      },
    },
    server: {
      port: 6900,
      fs: {
        // Allow serving the library source, assets, credit-card SVGs, and
        // background imagery that live outside this app folder.
        allow: [repoRoot],
      },
    },
  }
})
