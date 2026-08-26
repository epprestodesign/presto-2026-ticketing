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
// Nearly empty, and deliberately so. This app renders its own browse board and
// its own customize screen, and mounts PackageDetailPage, HotelDetailPage,
// CheckoutPageExpanded and ConfirmationPage exactly as the library ships them.
// Where a library component couldn't carry package semantics — the room card, the
// option rows, the price rail — the answer was a NEW component under
// src/components/, never a redirected library file.
//
// THE ONE ENTRY: the cart slide-over.
//
// `GlobalNav` is mounted exactly as the library ships it, cart button and all,
// and it imports its own `CartFlyout` by relative path — no slot, no cart event,
// nothing a prop can reach. Redirecting that one import is the only way to give
// the library nav a cart that belongs to this prototype, and it is precisely what
// this mechanism is for. The library file is not edited, and every other app in
// the repo still gets the library's flyout.
//
// Why the library flyout is the wrong body here is argued in full at the top of
// CartPeek.vue; the short version is that `CartFlyout` only mounts its contents
// while it is OPEN, so the count `GlobalNav` shows on its badge is 0 until the
// guest opens the cart — a live count is unreachable with it in place.
const localComponent = (name) => fileURLToPath(new URL(`./src/components/${name}`, import.meta.url))

const OVERRIDES = {
  'src/components/CartFlyout.vue': localComponent('CartPeek.vue'),
}

const overrideLibraryComponents = () => ({
  name: 'pkgcustomize-local-overrides',
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
// EMPTY HERE too. Nothing this prototype needs from a library page required
// reaching past its props: the two places the templates needed bending (section
// order on the package page, the room grid on the hotel page) are done in scoped
// CSS from the screens that mount them, which fails visibly rather than breaking
// the build when the library moves.
const PATCHES = []

const patchLibrarySources = () => ({
  name: 'pkgcustomize-source-patches',
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
          `[package-customize] ${patch.file} no longer contains:\n  ${from}\n` +
          `The library changed — update PATCHES in package-customize/vite.config.js.`
        )
      }
      out = out.split(from).join(to)
    }
    return { code: out, map: null }
  },
})

// When deployed as a Storybook sub-page on GitHub Pages the app is served from
// `/presto-2026-ticketing/package-customize/`; local dev serves from `/`. The
// deploy workflow passes `--base=/presto-2026-ticketing/package-customize/`.
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
      // 7200, not 7000: macOS AirPlay Receiver squats on 7000 and answers 403.
      port: 7200,
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
