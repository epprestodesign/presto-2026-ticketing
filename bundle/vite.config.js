import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// The ticket + hotel BUNDLE prototype — a second clickable Vite app (sibling of
// prototype/) that reuses the REAL library components via the @lib alias. Deps
// (vue, quasar, plugins) resolve up the tree to the repo's node_modules.
const repoRoot = fileURLToPath(new URL('../', import.meta.url))
const libSrc = fileURLToPath(new URL('../src', import.meta.url))
const quasarVariables = fileURLToPath(new URL('../src/css/quasar.variables.scss', import.meta.url))

// Deployed as a Storybook sub-page at /presto-2026-ticketing/bundle/ (the deploy
// workflow passes --base). Local dev serves from /.
export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: quasarVariables }),
  ],
  resolve: { alias: { '@lib': libSrc } },
  server: {
    port: 6200,
    fs: { allow: [repoRoot] },
  },
})
