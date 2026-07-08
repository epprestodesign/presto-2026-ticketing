import { setup } from '@storybook/vue3-vite'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import * as QComponents from 'quasar'

// Icon + font extras
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/roboto-font/roboto-font.css'

// Quasar core styles — imported from SASS source so our brand
// variables (src/css/quasar.variables.scss) are applied.
import 'quasar/src/css/index.sass'

// Our global styles + component-level overrides.
import '../src/css/app.scss'

// Register Quasar as a Vue plugin for every story, then globally
// register every Q* component so any story template can use <q-*>
// tags directly without per-file imports.
setup((app) => {
  // App-level providers (Quasar plugins). These power the imperative
  // patterns used by the design system: Snackbar (Notify), programmatic
  // Dialog, and Backdrop/Loading overlays.
  app.use(Quasar, { plugins: { Notify, Dialog, Loading } })

  for (const [name, component] of Object.entries(QComponents)) {
    if (
      /^Q[A-Z]/.test(name) &&
      component &&
      (component.render || component.setup || component.__name || component.name)
    ) {
      app.component(name, component)
    }
  }
})

/** @type { import('@storybook/vue3-vite').Preview } */
const preview = {
  parameters: {
    backgrounds: {
      options: {
        light: { name: 'light', value: '#ffffff' },
        grey: { name: 'grey', value: '#f5f5f7' },
        dark: { name: 'dark', value: '#141218' }
      }
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Design-system information architecture: order the sidebar the way
    // designers/product think, not alphabetically. Raw Quasar lives under
    // "Catalog" at the bottom for reference during migration.
    options: {
      storySort: {
        order: [
          'Getting Started', ['Introduction', 'Architecture & Conventions', 'Story Template'],
          'Foundations', [
            'Colors', 'Palette', 'Typography', 'Icons', 'Imagery',
            'Spacing', 'Border Radius', 'Elevation', 'Breakpoints', 'Motion',
          ],
          'Components', [
            'Actions', [
              'Button', 'Dialog', 'Modal', 'Side Panel', 'Backdrop',
            ],
            'Forms', [
              'Text Field', 'Text Area', 'Select', 'Autocomplete', 'Checkbox', 'Checkbox Tree',
              'Radio Group', 'Choice Chips', 'Switch', 'Date Picker', 'Time Picker',
              'Slider', 'Range', 'Rating', 'Quantity Stepper', 'Phone Field', 'Transfer List',
            ],
            'Feedback & Status', [
              'Alert', 'Banner', 'Badge', 'Snackbar', 'Toast', 'Progress', 'Skeleton',
            ],
            'Layout & Structure', [
              'Box', 'Card', 'Container', 'Grid', 'Stack', 'Divider', 'Section Header',
              'List', 'List Item', 'Accordion', 'Tabs', 'Table',
            ],
            'Media & Visuals', [
              'Avatar', 'Icon', 'Image List', 'Hero Banner', 'Rating',
            ],
            'Typography & Content', [
              'Typography', 'Chip', 'Amenity', 'Tooltip',
            ],
          ],
          'App Shell', [
            'Global Nav', 'Page Frame',
          ],
          'Landing Page', [
            'Book Reservation', 'Group Block',
            'Components', ['Teams Booking Widget', 'Core Booking Widget', 'Display Ad'],
          ],
          'Browse Hotels', [
            'Book Reservation', 'Group Block',
            'Components', [
              'Hotel Listing Card', 'Availability Dialog', 'Hotel Map',
              'Search & Filters', 'Pagination', 'Breadcrumbs', 'Forms', 'Empty States', 'Loading States',
            ],
          ],
          'Hotel Details', [
            'Book Reservation', 'Group Block',
            'Components', [
              // Both flow folders list their components in the SAME order.
              'Book Reservation', ['Rooms', 'Room Card', 'Room Booking Dialog'],
              'Group Block', ['Rooms', 'Room Card', 'Room Booking Dialog'],
              'Photo Gallery', 'Detail Tabs', 'Hotel Summary Header', 'Amenities', 'Policies & Property',
            ],
          ],
          'Checkout Experience', [
            'Book Reservation', 'Group Block',
            'Components', [
              'Steps', ['Review Order', 'Contact Info', 'Payment', 'Review Reservation'],
              'Policies', 'Payment Dialogs',
            ],
          ],
          'Confirmation', [
            'Book Reservation', 'Group Block',
          ],
          '*',
          'Manage Booking', [
            'Account',
          ],
        ],
      },
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'light'
    }
  }
}

export default preview
