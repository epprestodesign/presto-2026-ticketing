import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// The design-system repo root (one level up from this experience folder).
// Like /prototype and /bundle, this app imports the REAL library components from
// there — nothing is copied or forked. Deps (vue, quasar, plugins) resolve up the
// tree to the parent repo's node_modules; no local install needed.
const repoRoot = fileURLToPath(new URL('../', import.meta.url))
const libSrc = fileURLToPath(new URL('../src', import.meta.url))
const quasarVariables = fileURLToPath(new URL('../src/css/quasar.variables.scss', import.meta.url))

// When deployed as a Storybook sub-page on GitHub Pages the app is served from
// `/presto-2026-ticketing/experience-packages/`; local dev serves from `/`. The
// deploy workflow passes `--base=/presto-2026-ticketing/experience-packages/`.
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
      port: 6300,
      fs: {
        // Allow serving the library source, assets, credit-card SVGs, and
        // background imagery that live outside this app folder.
        allow: [repoRoot],
      },
      // Ticketmaster Discovery API v2 proxy (same pattern as /prototype). Falls
      // back to fixtures without a key.
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
