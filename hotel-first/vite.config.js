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
const appSrc = fileURLToPath(new URL('./src', import.meta.url))
const quasarVariables = fileURLToPath(new URL('../src/css/quasar.variables.scss', import.meta.url))

// --- Source patches (this app only) ------------------------------------------
// Library files rewritten as they are READ, for the cases a prop cannot reach.
// The library file on disk is never touched, and no other app in the repo sees
// these edits. Same mechanism the sibling package-customize app declares.
//
// WHY THIS EXISTS AT ALL: the Aug 26 branding round.
//
// The event's own artwork has to land on the landing hero — the Varsity Spirit
// shield in place of the EventPipe mark, the supplied 1440×400 banner in place of
// the stock background. `LandingPage.vue` hardcodes BOTH as module imports
// (`defaultBg`, `epLogoWhite`) and exposes no prop for either, so there is no
// supported seam. Three ways in, and why this is the one:
//
//   (a) SCOPED `:deep()` FROM LandingScreen.vue. Cheapest, and it genuinely works
//       for the background (`background-image` with `!important`, since the
//       library binds the hero as an inline style) and even for the logo, via the
//       `img { content: url(…) }` replacement trick.
//
//       Rejected for ONE reason, and it is not a stylistic one: the `<img>` keeps
//       `alt="EventPipe"`. CSS cannot reach an attribute. A sighted guest would
//       see the Spirit shield while a screen reader announced "EventPipe" — the
//       swap would be invisible to exactly the guests who depend on the alt, and
//       it would announce the wrong organisation, not merely a stale one. That is
//       a defect shipped on purpose, and this round is a BRANDING round: getting
//       the brand right for some guests and wrong for others is the failure the
//       work was meant to prevent.
//
//       (Its second, quieter cost: a `:deep()` selector that stops matching after
//       a library rename fails SILENTLY — the hero just reverts to EventPipe
//       artwork and nobody notices until a stakeholder does.)
//
//   (b) THE `OVERRIDES` MAP — redirect the whole `LandingPage.vue` import at a
//       local fork. Correct result, correct alt, and the precedent exists next
//       door. Rejected because it forks ~250 lines of component to change three:
//       the nav, the booking widget, five prose sections, the ad rail and the
//       footer would all become this app's copies and would stop tracking
//       upstream forever. OVERRIDES earns its cost when the whole BODY of a
//       component is wrong for the app (package-customize redirects `CartFlyout`
//       because its cart genuinely is a different cart). Here the body is right;
//       only three literals are wrong.
//
//   (c) THIS. Patch the three literals, keep the component. The landing page
//       still tracks the library for everything else, and the alt text is real.
//
// WHAT IT COSTS, stated plainly: this app now depends on three exact strings in a
// library file it does not own. When the library moves them the build FAILS, with
// a message naming the file and the missing string — loudly, at build time, on
// every machine, which is the trade being bought. A silent-but-wrong hero is the
// thing being traded away. The other cost is discoverability: nothing in
// `LandingScreen.vue` shows why its hero is branded, so that file carries a
// comment pointing here. Keep the two in sync.
const appAsset = (rel) => `@hf/assets/event/${rel}`

const PATCHES = [
  {
    file: 'src/components/LandingPage.vue',
    edits: [
      // 1 — the hero background. `defaultBg` feeds `heroStyle` and nothing else,
      // so this is a clean one-for-one swap. The supplied file is 2880×800, i.e.
      // the 1440×400 the stakeholder named at @2x; the hero's existing
      // `background-size: cover` renders it at exactly 1440×400 on a 1440 viewport
      // and scales without softening above that.
      [
        `import defaultBg from '../../background-img/defaultBackgroundImage.png'`,
        `import defaultBg from '${appAsset('spirit-banner-hero.png')}'`,
      ],
      // 2 — the hero logo. NOTE this is `epLogoWhite`, used ONLY in the hero. The
      // footer's mark is the separate `epLogo` import and stays EventPipe, which
      // is correct: EventPipe is the booking platform in the footer, the event is
      // the brand in the hero.
      [
        `import epLogoWhite from '../assets/eventpipe logos/eventpipe-logo-fff.svg'`,
        `import epLogoWhite from '${appAsset('spirit-logo.png')}'`,
      ],
      // 3 — the alt text, the whole reason this mechanism is here rather than a
      // stylesheet. Matched together with the class so it cannot also hit the
      // footer's `alt="EventPipe" class="lp__logo"`.
      [
        `alt="EventPipe" class="lp__hero-logo"`,
        `alt="Varsity Spirit National School Spirit Championships" class="lp__hero-logo"`,
      ],
    ],
  },
]

const patchLibrarySources = () => ({
  name: 'hotelfirst-source-patches',
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
          `[hotel-first] ${patch.file} no longer contains:\n  ${from}\n` +
          `The library changed — update PATCHES in hotel-first/vite.config.js.`
        )
      }
      out = out.split(from).join(to)
    }
    return { code: out, map: null }
  },
})

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
      patchLibrarySources(),
      vue({ template: { transformAssetUrls } }),
      quasar({ sassVariables: quasarVariables }),
    ],
    resolve: {
      alias: {
        // Import library components/lib/assets via a stable alias, e.g.
        //   import GlobalNav from '@lib/components/GlobalNav.vue'
        '@lib': libSrc,
        // This app's own src. Exists so PATCHES above can name an asset with a
        // path that resolves the same wherever it is injected — the patched
        // import lands inside a LIBRARY file, where a relative `./assets/…` would
        // resolve against the library folder instead of this one.
        '@hf': appSrc,
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
