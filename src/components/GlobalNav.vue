<script setup>
// GlobalNav — the app's top-level white nav bar: brand logo on the left, a
// "Manage Booking" pill and a cart icon (with a live count badge) on the right.
// Brand/icons use the DS primary (navy); the count badge uses the DS danger red.
// The cart opens the CartFlyout order summary; it stays closed until clicked.
import { ref } from 'vue'
import CartFlyout from './CartFlyout.vue'

const props = defineProps({
  brand: { type: String, default: 'Soccer League' },
  manageLabel: { type: String, default: 'Manage Booking' },
  cartMode: { type: String, default: 'reserve' }, // reserve | hold
  cart: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['manage'])

// Cart fly-out.
const cartOpen = ref(false)
const count = ref(0)
</script>

<template>
  <div class="gnav-wrap">
    <header class="gnav">
      <a class="gnav__brand" href="#" @click.prevent>{{ brand }}</a>

      <div class="gnav__actions">
        <button class="gnav__manage" @click="emit('manage')">{{ manageLabel }}</button>
        <button class="gnav__iconbtn" aria-label="Open cart" @click="cartOpen = true">
          <q-icon name="shopping_cart" size="22px" />
          <span class="gnav__badge">{{ count }}</span>
        </button>
      </div>
    </header>

    <cart-flyout v-model="cartOpen" :mode="cartMode" :cart="cart" @update:count="count = $event" />
  </div>
</template>

<style scoped>
.gnav { display: flex; align-items: center; justify-content: space-between; gap: 16px; height: 72px; padding: 0 28px; background: var(--ds-color-surface); color: var(--ds-color-text-brand); border-bottom: 1px solid var(--ds-color-border); }
.gnav__brand { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.01em; color: var(--ds-color-text-brand); text-decoration: none; }

.gnav__actions { display: flex; align-items: center; gap: 16px; }
.gnav__manage { height: 48px; padding: 0 24px; border-radius: var(--ds-radius-button); border: 1px solid var(--ds-color-border-brand); background: transparent; color: var(--ds-color-text-brand); font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: background var(--ds-duration-fast) var(--ds-ease-standard), border-color var(--ds-duration-fast) var(--ds-ease-standard); }
.gnav__manage:hover { background: var(--ds-palette-navy-50); }

.gnav__iconbtn { position: relative; width: 52px; height: 52px; border-radius: 50%; border: 1px solid var(--ds-color-border-brand); background: transparent; color: var(--ds-color-text-brand); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background var(--ds-duration-fast) var(--ds-ease-standard), border-color var(--ds-duration-fast) var(--ds-ease-standard); }
.gnav__iconbtn:hover { background: var(--ds-palette-navy-50); border-color: var(--ds-color-border-brand); }
.gnav__badge { position: absolute; top: -2px; right: -2px; min-width: 22px; height: 22px; padding: 0 5px; border-radius: var(--ds-radius-pill); background: var(--ds-color-background-danger-bold); color: #fff; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
</style>
