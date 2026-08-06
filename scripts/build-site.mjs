// Build the whole deployable site: Storybook at the root, with every prototype
// nested underneath it as its own sub-app.
//
//   storybook-static/                 the design system's Storybook
//   storybook-static/prototype/       booking journey
//   storybook-static/bundle/          ticket + hotel bundle
//   storybook-static/experience/      tickets + packages
//   storybook-static/experience-packages/
//   storybook-static/option-a … -d/   the Aug 4–6 feedback rounds
//   storybook-static/hub/             directory page linking them all
//
// This is the same chain `.github/workflows/deploy.yml` runs step by step,
// collapsed into one command so a host that just runs `npm run build:site` —
// Netlify, Vercel, a container — produces the identical tree. The workflow can
// call this too rather than repeating itself.
//
// BASE PATHS are the one thing that differs per host. GitHub Pages serves this
// repo from a sub-path (`/presto-2026-ticketing/`), so every prototype has to be
// built with that prefix baked in. Netlify serves it from the domain root, where
// the prefix must be empty. Hence SITE_BASE:
//
//   SITE_BASE=""                       → /option-d/                  (Netlify)
//   SITE_BASE="/presto-2026-ticketing" → /presto-2026-ticketing/option-d/
//
// Storybook itself needs no base — it emits relative asset paths and so works at
// either depth unchanged.
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const OUT = join(root, 'storybook-static')

// Trailing slash stripped so `${SITE_BASE}/option-d/` never doubles up.
const SITE_BASE = (process.env.SITE_BASE ?? '').replace(/\/$/, '')

// Each prototype is a self-contained Vite app with no deps of its own — they all
// resolve vue/quasar/vite from the repo's node_modules.
const APPS = [
  'prototype',
  'bundle',
  'experience',
  'experience-packages',
  'option-a',
  'option-b',
  'option-c',
  'option-d',
]

const VITE = join(root, 'node_modules', 'vite', 'bin', 'vite.js')
// pnpm installs `.bin` entries as shell shims rather than symlinks into the
// package, so the CLI is launched through the shim instead of by module path.
const STORYBOOK_BIN = join(root, 'node_modules', '.bin', 'storybook')

// Passed through to every build. VITE_GOOGLE_MAPS_API_KEY is optional: without
// it the Hotel Map pattern renders its "key needed" placeholder rather than
// failing the build.
const env = {
  ...process.env,
  VITE_IMAGERY_URL: process.env.VITE_IMAGERY_URL || 'https://epprestodesign.github.io/presto-ds-imagery',
  STORYBOOK_DISABLE_TELEMETRY: '1',
}

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, env, stdio: 'inherit' })

const step = (msg) => console.log(`\n[1m▸ ${msg}[0m`)

// --- Storybook ---------------------------------------------------------------
step('Building Storybook')
rmSync(OUT, { recursive: true, force: true })
run(STORYBOOK_BIN, ['build', '-o', OUT], root)

// --- Prototypes --------------------------------------------------------------
for (const app of APPS) {
  const dir = join(root, app)
  if (!existsSync(dir)) {
    console.warn(`  skipped ${app} — directory not found`)
    continue
  }
  step(`Building ${app}  →  ${SITE_BASE}/${app}/`)
  run(process.execPath, [VITE, 'build', `--base=${SITE_BASE}/${app}/`], dir)
  cpSync(join(dir, 'dist'), join(OUT, app), { recursive: true })
}

// --- Hub ---------------------------------------------------------------------
// A single static page, not a Vite app — copied as-is.
step('Nesting the hub directory page')
mkdirSync(join(OUT, 'hub'), { recursive: true })
cpSync(join(root, 'hub', 'index.html'), join(OUT, 'hub', 'index.html'))

console.log(`\n[32m✓ Site built into storybook-static/[0m  (base "${SITE_BASE || '/'}")`)
