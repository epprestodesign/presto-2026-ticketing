<script setup>
// GlobalNav — the app's top-level white nav bar: brand logo on the left, a
// "Manage Booking" pill and a cart icon (with a live count badge) on the right.
// Brand/icons use the DS primary (navy); the count badge uses the DS danger red.
// The cart opens the CartFlyout order summary; it stays closed until clicked.
import { ref, computed } from 'vue'
import CartFlyout from './CartFlyout.vue'

const props = defineProps({
  brand: { type: String, default: 'Soccer League' },
  contactLabel: { type: String, default: 'Contact Us' },
  // Contact details shown in the Contact Us dropdown.
  contactInfo: { type: Object, default: () => ({
    name: 'EventPipe Travel',
    hours: 'Monday through Friday, 8:30am–5:30pm Eastern Time',
    phone: '(888) 640-6400',
    email: 'support@eventpipe.com',
  }) },
  manageLabel: { type: String, default: 'Manage Booking' },
  cartMode: { type: String, default: 'reserve' }, // reserve | hold | reservations
  cart: { type: Object, default: () => ({}) },
  // Cart icon button + fly-out visibility. 'auto' (default) shows the cart only
  // for the Group Block (hold) flow — the flows that book directly (single Book
  // Reservation and Multiple Reservations) have no running cart. Pass true/false
  // to force it (e.g. the standalone cart-component demos force it on).
  showCart: { type: [Boolean, String], default: 'auto' },
  // Show the cart fly-out open on mount (e.g. Storybook cart stories).
  openCart: { type: Boolean, default: false },
  // Minimal chrome (e.g. checkout): just the centered brand — no Contact Us,
  // Manage Booking, or cart.
  minimal: { type: Boolean, default: false },
})
const emit = defineEmits(['manage', 'contact'])

// The cart button belongs to the Group Block (hold) flow only; 'auto' derives
// that from cartMode, while an explicit boolean overrides it.
const cartVisible = computed(() =>
  typeof props.showCart === 'boolean' ? props.showCart : props.cartMode === 'hold'
)

// Cart fly-out.
const cartOpen = ref(props.openCart)
const count = ref(0)
</script>

<template>
  <div class="gnav-wrap">
    <header class="gnav" :class="{ 'gnav--minimal': minimal }">
      <a class="gnav__brand" href="#" @click.prevent>{{ brand }}</a>

      <div v-if="!minimal" class="gnav__actions">
        <a class="gnav__contact" href="#" @click.prevent="emit('contact')">
          {{ contactLabel }}
          <q-menu anchor="bottom right" self="top right" :offset="[0, 10]" class="gnav__contactmenu">
            <div class="gnav__contactcard">
              <h4 class="gnav__contact-name">{{ contactInfo.name }}</h4>
              <div class="gnav__contact-block">
                <span class="gnav__contact-h">Hours</span>
                <p class="gnav__contact-p">{{ contactInfo.hours }}</p>
              </div>
              <div class="gnav__contact-block">
                <span class="gnav__contact-h">By Phone</span>
                <a class="gnav__contact-row" :href="'tel:' + contactInfo.phone.replace(/[^0-9+]/g, '')"><q-icon name="call" size="18px" /> {{ contactInfo.phone }}</a>
              </div>
              <div class="gnav__contact-block">
                <span class="gnav__contact-h">By Email</span>
                <a class="gnav__contact-row" :href="'mailto:' + contactInfo.email"><q-icon name="mail" size="18px" /> {{ contactInfo.email }}</a>
              </div>
            </div>
          </q-menu>
        </a>
        <button class="gnav__manage" @click="emit('manage')">{{ manageLabel }}</button>
        <button v-if="cartVisible" class="gnav__iconbtn" aria-label="Open cart" @click="cartOpen = true">
          <q-icon name="shopping_cart" size="22px" />
          <span class="gnav__badge">{{ count }}</span>
        </button>
      </div>
    </header>

    <cart-flyout v-if="cartVisible && !minimal" v-model="cartOpen" :mode="cartMode" :cart="cart" @update:count="count = $event" />
  </div>
</template>

<style scoped>
.gnav { display: flex; align-items: center; justify-content: space-between; gap: 16px; height: 72px; padding: 0 28px; background: var(--ds-color-surface); color: var(--ds-color-text-brand); border-bottom: 1px solid var(--ds-color-border); }
.gnav__brand { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.01em; color: var(--ds-color-text-brand); text-decoration: none; }
/* Minimal (checkout): center the brand, no actions. */
.gnav--minimal { justify-content: center; }

.gnav__actions { display: flex; align-items: center; gap: 16px; }
.gnav__contact { color: var(--ds-color-text-brand); font-weight: 600; font-size: 0.9375rem; text-decoration: none; cursor: pointer; }
.gnav__contact:hover { text-decoration: underline; }
.gnav__manage { height: 48px; padding: 0 24px; border-radius: var(--ds-radius-button); border: 1px solid var(--ds-color-border-brand); background: transparent; color: var(--ds-color-text-brand); font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: background var(--ds-duration-fast) var(--ds-ease-standard), border-color var(--ds-duration-fast) var(--ds-ease-standard); }
.gnav__manage:hover { background: var(--ds-palette-navy-50); }

.gnav__iconbtn { position: relative; width: 52px; height: 52px; border-radius: 50%; border: 1px solid var(--ds-color-border-brand); background: transparent; color: var(--ds-color-text-brand); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background var(--ds-duration-fast) var(--ds-ease-standard), border-color var(--ds-duration-fast) var(--ds-ease-standard); }
.gnav__iconbtn:hover { background: var(--ds-palette-navy-50); border-color: var(--ds-color-border-brand); }
.gnav__badge { position: absolute; top: -2px; right: -2px; min-width: 22px; height: 22px; padding: 0 5px; border-radius: var(--ds-radius-pill); background: var(--ds-color-background-danger-bold); color: #fff; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
</style>

<!-- Unscoped: q-menu content is teleported outside this component. -->
<style>
.gnav__contactmenu { border-radius: var(--ds-radius-lg); box-shadow: var(--ds-shadow-3, 0 8px 24px rgba(0,0,0,0.18)); }
.gnav__contactmenu .gnav__contactcard { width: 320px; max-width: 88vw; padding: 24px; }
.gnav__contactmenu .gnav__contact-name { margin: 0 0 18px; text-align: center; font-size: 1.25rem; font-weight: 800; color: var(--ds-color-text-brand); }
.gnav__contactmenu .gnav__contact-block { margin-top: 18px; }
.gnav__contactmenu .gnav__contact-block:first-of-type { margin-top: 0; }
.gnav__contactmenu .gnav__contact-h { display: block; font-size: 1rem; font-weight: 700; color: var(--ds-color-text); margin-bottom: 5px; }
.gnav__contactmenu .gnav__contact-p { margin: 0; color: var(--ds-color-text); font-size: 0.9375rem; line-height: 1.45; }
.gnav__contactmenu .gnav__contact-row { display: inline-flex; align-items: center; gap: 10px; color: var(--ds-color-text); font-size: 0.9375rem; text-decoration: none; }
.gnav__contactmenu .gnav__contact-row:hover { text-decoration: underline; }
.gnav__contactmenu .gnav__contact-row .q-icon { color: var(--ds-color-text-brand); flex: none; }
</style>
