import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { quasar } from '@quasar/vite-plugin'

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
  ],
  addons: ['@storybook/addon-themes', '@storybook/addon-docs'],
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
