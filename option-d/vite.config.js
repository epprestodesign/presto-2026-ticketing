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

// --- Local component overrides (this app only) -------------------------------
// Keys are repo-root-relative library files; values are the local replacements.
// The plugin below redirects them wherever they're imported from — including deep
// inside library pages, which import by RELATIVE path (so a plain `resolve.alias`
// wouldn't catch them). The library itself is never touched.
//
// EMPTY IN OPTION C, and that is the headline difference from Option A.
//
// Option A overrides four library files — the booking widget, the Browse Packages
// result row, the package quick-view modal and the shared hero image — because it
// renders the library's Browse Packages PAGE and has to reshape its parts. Option
// C renders its own grid out of its own tiles (src/components/PackageTile.vue), so
// there is no library page to bend. The only library components it mounts are
// GlobalNav, AppStepper, QuantityStepper and CheckoutPage, all used as shipped.
const OVERRIDES = {}

const overrideLibraryComponents = () => ({
  name: 'option-d-local-overrides',
  enforce: 'pre',
  async resolveId(source, importer, options) {
    if (!importer || source.includes('\0')) return null
    const resolved = await this.resolve(source, importer, { ...options, skipSelf: true })
    if (!resolved) return null
    const [id] = resolved.id.split('?')
    for (const [libRelPath, localFile] of Object.entries(OVERRIDES)) {
      // Only redirect the LIBRARY file — never the local fork itself, or the
      // fork's own imports would loop back onto it.
      if (id === `${repoRoot}${libRelPath}`) return localFile
    }
    return null
  },
})

// --- Source patches (this app only) ------------------------------------------
// --- Source patches (this app only) ------------------------------------------
// Library files rewritten as they're read, for cases a prop can't reach.
//
// EMPTY IN OPTION C, for the same reason OVERRIDES is: Option A patches four
// library pages (LandingPage, PackageListPage, RoomAvailability, HotelListPage)
// because it renders all of them. Option C renders none of them — its board is
// its own component and its checkout uses CheckoutPage as shipped — so there is
// nothing to patch, and no risk of the build breaking when the library moves.
const PATCHES = []

const patchLibrarySources = () => ({
  name: 'option-d-source-patches',
  enforce: 'pre',
  transform(code, id) {
    // Patch the whole SFC on its main request only; plugin-vue's `?vue&type=…`
    // sub-requests carry just one block and would never contain the script lines.
    if (id.includes('?vue')) return null
    const [path] = id.split('?')
    const patch = PATCHES.find((p) => path === `${repoRoot}${p.file}`)
    if (!patch) return null
    let out = code
    for (const [from, to] of patch.edits) {
      if (!out.includes(from)) {
        throw new Error(
          `[option-d] ${patch.file} no longer contains:\n  ${from}\n` +
          `The library changed — update PATCHES in option-d/vite.config.js.`
        )
      }
      out = out.split(from).join(to)
    }
    return { code: out, map: null }
  },
})

// When deployed as a Storybook sub-page on GitHub Pages the app is served from
// `/presto-2026-ticketing/option-d/`; local dev serves from `/`. The
// deploy workflow passes `--base=/presto-2026-ticketing/option-d/`.
const envDir = fileURLToPath(new URL('./', import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '')
  const tmKey = env.TICKETMASTER_API_KEY || ''

  return {
    plugins: [
      overrideLibraryComponents(),
      patchLibrarySources(),
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
      port: 6700,
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
