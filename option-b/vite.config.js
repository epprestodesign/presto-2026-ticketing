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
// This is the sandbox copy, so it may diverge from the library. Rather than fork
// whole page components to swap one child, list the library files replaced by a
// local version here; the plugin below redirects them wherever they're imported
// from — including deep inside library pages, which import BookingWidget by
// RELATIVE path (so a plain `resolve.alias` wouldn't catch them).
// The library itself is never touched: Storybook and the sibling prototypes keep
// the original components.
// Keys are repo-root-relative library files; values are the local replacements.
const OVERRIDES = {
  // Travelers popover → a plain 1–8+ "Guests" dropdown (Aug 4).
  // Picked up by LandingPage, HotelListPage and HotelDetailPage alike.
  'src/components/BookingWidget.vue': fileURLToPath(
    new URL('./src/components/BookingWidget.vue', import.meta.url)
  ),
  // Browse Packages rows: same horizontal layout, plus a rooms-availability line
  // and an Availability panel that expands the room carousel in place (Aug 4).
  'src/components/PackageResultCard.vue': fileURLToPath(
    new URL('./src/components/PackageResultCard.vue', import.meta.url)
  ),
  // The package modal — grown from a condensed quick view into the full package
  // sheet (photos, inclusions, hotels → rooms → extras, Reserve). It replaces the
  // Package Details PAGE, which is gone from this flow (Aug 4).
  'src/components/PackageQuickViewDialog.vue': fileURLToPath(
    new URL('./src/components/PackageQuickViewDialog.vue', import.meta.url)
  ),
  // The shared hero photo behind the Landing, Browse Hotels and Browse Packages
  // banners. Swapping the asset here re-skins all three at once (Aug 4) — now the
  // event's own Ticketmaster artwork, downloaded so the page has no runtime
  // dependency on ticketm.net.
  'background-img/defaultBackgroundImage.png': fileURLToPath(
    new URL('./src/assets/event-hero.jpg', import.meta.url)
  ),
}

const overrideLibraryComponents = () => ({
  name: 'option-b-local-overrides',
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
// Browse Hotels prints the event name and date from two module-level constants
// rather than props, so there's no way to pass this app's event in. Patching the
// two lines as the file is read beats forking 400+ lines of page just to change a
// string — and if the library ever renames them the build fails loudly here
// instead of quietly showing the wrong event.
const PATCHES = [
  {
    // The "Who's Attending?" heading renders even when the list is empty, so
    // there's no way to drop the section by props alone. One v-if makes an empty
    // `attending` array hide the heading with it (Aug 4).
    file: 'src/components/LandingPage.vue',
    edits: [
      ['<h2 class="lp__section-title">{{ attendingTitle }}</h2>',
        '<h2 v-if="attending.length" class="lp__section-title">{{ attendingTitle }}</h2>'],
    ],
  },
  {
    // Browse Packages seeds its Guests control from `initialGuests` but never
    // reports changes back, so the count picked there was stranded on the page.
    // These two edits make it a two-way control, keeping it in step with the
    // booking widget's Guests dropdown through the journey store (Aug 4).
    file: 'src/components/PackageListPage.vue',
    edits: [
      // The package modal is a full-screen experience here, not a centred sheet,
      // and it slides up from the bottom rather than fading in place.
      ['<q-dialog v-model="quickOpen">',
        '<q-dialog v-model="quickOpen" maximized transition-show="slide-up" transition-hide="slide-down">'],
      ["const emit = defineEmits(['select', 'customize'])",
        "const emit = defineEmits(['select', 'customize', 'update:guests'])"],
      ['const guests = ref(props.initialGuests)',
        "const guests = ref(props.initialGuests)\nwatch(guests, (v) => emit('update:guests', v))"],
    ],
  },
  {
    // The room carousel snaps every card to the START of the track under
    // `scroll-snap-type: x mandatory`. The last card can never reach that
    // position — the track runs out of scroll first — so the browser snaps back
    // and the final room is permanently half-clipped. Letting the last card snap
    // to the END lets it come flush with the right edge (Aug 4).
    file: 'src/components/browse/RoomAvailability.vue',
    edits: [
      ['.rav__room { flex: 0 0 43%; min-width: 300px; scroll-snap-align: start;',
        '.rav__room:last-child { scroll-snap-align: end; }\n.rav__room { flex: 0 0 43%; min-width: 300px; scroll-snap-align: start;'],
      // …and once the track is scrolled to its end, the last card IS the active
      // one. Rounding by scroll position alone never reaches that index, so the
      // dots used to stop one short of the end.
      ['  active.value = clamp(Math.round(el.scrollLeft / step()))',
        '  const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2\n' +
        '  active.value = atEnd ? props.rooms.length - 1 : clamp(Math.round(el.scrollLeft / step()))'],
    ],
  },
  {
    // Step 2 shows the Browse Hotels results layout with exactly TWO hotels, so
    // the curated sample's first two entries become the real contracted hotels
    // this event holds. Matching in the click router is by name, so these have
    // to be the actual names.
    file: 'src/components/browse/HotelListPage.vue',
    edits: [
      ["{ name: 'The Grand Riverside Hotel', stars: 4, distance: '0.3 mi from Main Arena', preferred: true, fromNightly: 189, total: 756, availability: 'available', seed: 1 },",
        "{ name: 'Courtyard by Marriott', stars: 4, distance: '0.3 mi from Gillette Stadium · 6 min walk', preferred: true, fromNightly: 219, total: 219, availability: 'available', seed: 1 },"],
      ["{ name: 'Omni Downtown Suites', stars: 4.5, distance: '0.6 mi from Main Arena', fromNightly: 219, total: 876, availability: 'available', seed: 2 },",
        "{ name: 'The Westin', stars: 4.5, distance: '0.8 mi from Gillette Stadium · 16 min walk', fromNightly: 289, total: 289, availability: 'available', seed: 2 },"],
      ["const EVENT_NAME = 'New England Patriots v Buffalo Bills'",
        "const EVENT_NAME = 'Pittsburgh Steelers at New England Patriots'"],
      ["const EVENT_DATES = 'Sat, Dec 6, 2026'",
        "const EVENT_DATES = 'Sun, Sep 20, 2026 · 1:00 PM'"],
    ],
  },
]

const patchLibrarySources = () => ({
  name: 'option-b-source-patches',
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
          `[option-b] ${patch.file} no longer contains:\n  ${from}\n` +
          `The library changed — update PATCHES in option-b/vite.config.js.`
        )
      }
      out = out.split(from).join(to)
    }
    return { code: out, map: null }
  },
})

// When deployed as a Storybook sub-page on GitHub Pages the app is served from
// `/presto-2026-ticketing/option-b/`; local dev serves from `/`. The
// deploy workflow passes `--base=/presto-2026-ticketing/option-b/`.
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
      port: 6500,
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
