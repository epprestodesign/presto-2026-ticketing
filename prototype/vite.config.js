import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// The design-system repo root (one level up from this prototype folder).
// The prototype imports the REAL library components from here — nothing is
// copied or forked. Deps (vue, quasar, plugins) resolve up the tree to the
// parent repo's node_modules; no local install needed.
const repoRoot = fileURLToPath(new URL('../', import.meta.url))
const libSrc = fileURLToPath(new URL('../src', import.meta.url))
const quasarVariables = fileURLToPath(new URL('../src/css/quasar.variables.scss', import.meta.url))

// When deployed as a Storybook sub-page on GitHub Pages the app is served from
// `/presto-2026-ticketing/prototype/`; local dev serves from `/`. Set VITE_BASE at build
// time (the deploy workflow passes `--base=/presto-2026-ticketing/prototype/`).
// This config's own folder — where prototype/.env lives. We load env with an
// empty prefix ('') so NON-VITE_ vars (e.g. TICKETMASTER_API_KEY) are readable
// here in Node without ever being exposed to the client bundle.
const envDir = fileURLToPath(new URL('./', import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '')
  const tmKey = env.TICKETMASTER_API_KEY || ''

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
      port: 6100,
      fs: {
        // Allow serving the library source, assets, credit-card SVGs, and
        // background imagery that live outside this prototype folder.
        allow: [repoRoot],
      },
      // Ticketmaster Discovery API v2 proxy. The browser calls `/tm/events.json`
      // (same-origin → no CORS); Vite rewrites to the real endpoint and appends
      // the apikey server-side, so the key never reaches the client. Requires
      // TICKETMASTER_API_KEY in prototype/.env — without it the app falls back
      // to fixtures.
      proxy: {
        '/tm': {
          target: 'https://app.ticketmaster.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            const p = path.replace(/^\/tm/, '/discovery/v2')
            const sep = p.includes('?') ? '&' : '?'
            return `${p}${sep}apikey=${tmKey}`
          },
        },
      },
    },
  }
})
