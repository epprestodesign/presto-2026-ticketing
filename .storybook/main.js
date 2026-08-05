import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { quasar } from '@quasar/vite-plugin'
import remarkGfm from 'remark-gfm'

const quasarVariables = fileURLToPath(
  new URL('../src/css/quasar.variables.scss', import.meta.url)
)

/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
    // The "Aug 4 Changes" prototype documents its own components from inside
    // option-a/ — the app stays self-contained, the library stays clean.
    '../option-a/stories/**/*.mdx',
    '../option-a/stories/**/*.stories.@(js|jsx|ts|tsx)',
    // Option B — the v2 prototype. Its components are documented under the
    // "Option B" category; the shared overview doc lives with v1.
    '../option-b/stories/**/*.stories.@(js|jsx|ts|tsx)',
    // Option C — the one-click grid built from the Aug 4 feedback. It carries its
    // OWN overview doc (unlike Option B), because what it removes from Option A
    // is the substance of it and needs explaining next to the components.
    '../option-c/stories/**/*.mdx',
    '../option-c/stories/**/*.stories.@(js|jsx|ts|tsx)',
    // Option D — the Aug 5 feedback response. Its own top-level category, because
    // it answers a different round of feedback than A, B and C.
    '../option-d/stories/**/*.mdx',
    '../option-d/stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-themes',
    {
      name: '@storybook/addon-docs',
      options: {
        // GitHub-Flavoured Markdown. Without it MDX has no table support, so every
        // markdown table in every doc rendered as a paragraph of literal `|`
        // characters — Introduction, Architecture & Conventions, User Journey and
        // Aug 4 Changes were all affected. Tables are how those pages carry most of
        // their comparisons, so this is not cosmetic.
        mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } },
      },
    },
  ],
  // Serve ./public verbatim (mounted at site root) so the imagery gallery under
  // public/library/ deploys to a stable Pages URL: /presto-2026-ticketing/library/.
  staticDirs: ['../public'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {},
  async viteFinal(baseConfig) {
    // Note: @storybook/vue3-vite already provides the @vitejs/plugin-vue
    // ('vite:vue') plugin. We must NOT add a second one — a duplicate Vue
    // plugin breaks .vue SFC compilation. Quasar's plugin auto-detects the
    // existing Vue plugin and slots in after it.
    return mergeConfig(baseConfig, {
      plugins: [quasar({ sassVariables: quasarVariables })],
      resolve: {
        alias: {
          // The Aug 4 prototype's components import library code via `@lib`,
          // the same alias its own vite.config.js defines.
          '@lib': fileURLToPath(new URL('../src', import.meta.url)),
        },
      },
    })
  },
}

export default config
