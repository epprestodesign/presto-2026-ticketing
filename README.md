# Presto DS

A **Quasar + Vue 3 design system**, documented and QA'd in **Storybook**, themed
for a consumer **hotel booking & reservation** experience ("Birdie Stays").

- **Stack:** Vue 3 · Quasar 2 · Storybook 8 · Vite 6 · pnpm
- **Font:** Poppins
- **Color system:** Tailwind-based 3-tier tokens (primitives → semantic → Quasar
  bridge), brand = **Zinc**.

## Live docs
Storybook is published to GitHub Pages on every push to `main`:

**https://epprestodesign.github.io/presto-ds-v1/**

## Local development
```bash
pnpm install
pnpm storybook          # dev gallery at http://localhost:6006
pnpm build-storybook    # static build → storybook-static/
```

## Architecture
| Layer | File(s) | Purpose |
| --- | --- | --- |
| Primitives | `src/css/ds-palette.scss` | Raw Tailwind hue ramps (`--ds-palette-*`) |
| Semantic | `src/css/ds-color-tokens.scss` | Roles (`--ds-color-*`) referencing primitives |
| Utilities | `src/css/ds-utilities.scss` | `bg-ds-*` / `text-ds-*` / `border-ds-*` |
| Quasar bridge | `src/css/quasar.variables.scss` | `$primary…` so components reskin |
| Tokens | `src/css/tokens.scss` | Spacing, radius, elevation, motion |
| Type | `src/css/typography.scss` | Type scale + weights |
| Overrides | `src/css/app.scss` | Global + per-component tweaks |

Stories live in `src/stories/` organized as **Foundations · Inputs · Data
Display · Feedback · Layout · Navigation · Patterns**. Token files and the
foundation pages are generated from the palette; see the chat history / the
generator for regeneration.

## Deployment
Handled by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
builds Storybook and publishes `storybook-static/` to GitHub Pages.
**One-time:** enable Pages in repo **Settings → Pages → Build and deployment →
Source: GitHub Actions**.
