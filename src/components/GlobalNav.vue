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
        <a class="gnav__contact" href="#" @click.prevent="emit('contact')">{{ contactLabel }}</a>
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
