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
          'Getting Started', ['Introduction', 'Architecture & Conventions', 'User Journey & Build Spec', 'Story Template'],
          'Foundations', [
            'Colors', 'Palette', 'Typography', 'Icons', 'Imagery', 'Gameday Imagery', 'Hotel Imagery',
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
              'Alert', 'Banner', 'Badge', 'Availability Badge', 'Savings Badge', 'Snackbar', 'Toast', 'Progress', 'Skeleton',
            ],
            'Layout & Structure', [
              'Box', 'Card', 'Container', 'Grid', 'Stack', 'Divider', 'Section Header',
              'List', 'List Item', 'Accordion', 'Tabs', 'Table',
            ],
            'Media & Visuals', [
              'Avatar', 'Icon', 'Image List', 'Display Ad',
              'Hero Banner', ['Default', 'Patriots'],
              'Rating',
            ],
            'Typography & Content', [
              'Typography', 'Chip', 'Amenity', 'Tooltip',
            ],
            'Navigation', [
              'Journey Stepper',
            ],
            'Data Viz', [
              'Price Histogram',
            ],
          ],
          'App Shell', [
            'Global Nav & Cart', ['Book Reservation', 'Group Block', 'Ticketing'],
            'Stepper',
            'Page Frame',
          ],
          'Ticket Map', [
            // The unified SeatGeek-style ticket browse experience.
            'Browse Tickets',
            // Everything else — the individual building blocks.
            'Components', [
              'Browse Tickets', ['Filters Dialog', 'Ticket Quantity', 'Listing Row', 'Venue Map', 'Price Histogram'],
              'Event & Tickets', ['Event Page', 'Event Hero', 'Ticket Tiers', 'Ticket Category Card'],
              'Seat Map & View', ['Venue Map (Ticketmaster)', 'Seat Map', 'Static Seat Map', 'View From Seat', 'Seat Listings'],
              'Hotel Add-On', ['Add-On Step', 'Live Search', 'Contracted Hotel Card', 'No Availability'],
              'Packages', ['Package List', 'Package Card', 'Package Dialog'],
              'Bundle Cart & Checkout', ['Bundle Cart'],
              'Confirmation', ['Bundle Confirmation'],
              'Selection Summary',
            ],
          ],
          // Event package offerings, laid out like Hotel Details + a Browse
          // Packages list in the Browse Hotels layout. Components folder last.
          'Package Details', [
            'Browse Packages', ['Browse Packages', 'With Display Ad', 'With Guest Prompt', 'Components', ['Filter Rail']],
            'Package Details Page',
            'Components', ['Gallery', 'Summary', 'Experiences', 'Packages', 'Result Card', 'Quick View', 'Quick View · Showcase', 'Policies'],
          ],
          'Landing Page', [
            'Book Reservation', 'Group Block',
            'Components', ['Teams Booking Widget', 'Core Booking Widget'],
          ],
          'Browse Hotels', [
            'Book Reservation', 'Group Block',
            'Components', [
              // Grouped by page region — top bar, left rail, results, right rail, footer.
              'Top Bar', ['Breadcrumbs', 'Results Toolbar'],
              'Left Rail', ['Filter Rail', 'Search & Filters', 'Hotel Map'],
              'Results', [
                'Hotel Listing Card',
                'Result States', ['Book Reservation', 'Group Block', ['Full Results', 'Partial Results', 'No Results', 'Error', 'Loading']],
                'Availability Dialog', 'Empty States', 'Loading States', 'Forms',
              ],
              'Right Rail', ['Display Ads', ['160×600', '160×320', '120×600']],
              'Footer', ['Pagination'],
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
          // The fully-unfolded checkout — every step open, one submit. Sits
          // directly above the stepped flows it varies, matching presto-2026's
          // own ordering, so the two Storybooks read the same way.
          'Checkout Experience Expanded', [
            'Overview', [
              'Book Reservation', 'Group Block',
              'Tickets Only', 'Tickets + Hotel', 'Packages Only', 'Packages + Hotel',
            ],
          ],
          'Checkout Experience', [
            'Book Reservation', 'Group Block',
            'Tickets Only', 'Tickets + Hotel', 'Packages Only', 'Packages + Hotel',
            'Components', [
              'Book Reservation', ['Review Order', 'Contact Info', 'Reservation Guests', 'Payment', 'Review Reservation'],
              'Group Block', ['Review Order', 'Contact Info', 'Review Reservation'],
            ],
            'Old Designs',
          ],
          'Confirmation', [
            'Book Reservation', 'Group Block',
            'Tickets Only', 'Tickets + Hotel', 'Packages Only', 'Packages + Hotel',
          ],
          // The Aug prototype rounds, newest first, and ordered explicitly rather
          // than left to the '*' bucket below — alphabetically "Overview" sorts
          // last, which buries the page that explains what each option is.
          //
          // Aug 5 leads: Option D is the current direction, and a reviewer opening
          // Storybook cold should land on the newest round, not the previous one.
          'Aug 5 Changes', [
            'Option D', ['Overview', 'Package Pair', 'Package Details', 'Hotel Details'],
          ],
          // Aug 4 — Option C is that round's answer, so it leads its own block.
          'Aug 4 Changes', [
            'Overview',
            'Option C', ['Overview', 'Package Grid', 'Package Tile', 'Package Confirm Dialog', 'Event Hero', 'Booking Widget', 'Event Header Bar', 'Hotel Details'],
            'Option A', ['Booking Widget', 'Package Details', 'Foundations'],
            'Option B', ['Booking Widget', 'Package Details', 'Foundations'],
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
