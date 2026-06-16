<script setup>
// GlobalNav — the app's top-level dark nav bar: brand logo on the left, a
// "Manage Booking" pill and a cart icon (with live count badge) on the right.
// The cart icon opens the CartFlyout order summary; the badge stays in sync
// with the cart's live selection.
import { ref } from 'vue'
import CartFlyout from './CartFlyout.vue'

const props = defineProps({
  brand: { type: String, default: 'Soccer League' },
  manageLabel: { type: String, default: 'Manage Booking' },
  cartMode: { type: String, default: 'reserve' }, // reserve | hold
  cart: { type: Object, default: () => ({}) },
  startOpen: { type: Boolean, default: false },    // open the fly-out by default (stories)
})
const emit = defineEmits(['manage'])

const open = ref(props.startOpen)
const count = ref(0)
</script>

<template>
  <div class="gnav-wrap">
    <header class="gnav">
      <a class="gnav__brand" href="#" @click.prevent>{{ brand }}</a>

      <div class="gnav__actions">
        <button class="gnav__manage" @click="emit('manage')">{{ manageLabel }}</button>
        <button class="gnav__cart" aria-label="Open cart" @click="open = true">
          <q-icon name="shopping_cart" size="22px" />
          <span class="gnav__badge">{{ count }}</span>
        </button>
      </div>
    </header>

    <cart-flyout v-model="open" :mode="cartMode" :cart="cart" @update:count="count = $event" />
  </div>
</template>

<style scoped>
.gnav { display: flex; align-items: center; justify-content: space-between; gap: 16px; height: 72px; padding: 0 28px; background: #0a0a0b; color: #fff; }
.gnav__brand { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.01em; color: #fff; text-decoration: none; }

.gnav__actions { display: flex; align-items: center; gap: 16px; }
.gnav__manage { height: 48px; padding: 0 24px; border-radius: var(--ds-radius-pill); border: 1px solid rgba(255, 255, 255, 0.35); background: transparent; color: #fff; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: background var(--ds-duration-fast) var(--ds-ease-standard), border-color var(--ds-duration-fast) var(--ds-ease-standard); }
.gnav__manage:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.6); }

.gnav__cart { position: relative; width: 52px; height: 52px; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.35); background: transparent; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background var(--ds-duration-fast) var(--ds-ease-standard); }
.gnav__cart:hover { background: rgba(255, 255, 255, 0.08); }
.gnav__badge { position: absolute; top: -2px; right: -2px; min-width: 22px; height: 22px; padding: 0 5px; border-radius: var(--ds-radius-pill); background: var(--ds-palette-cyan-300); color: var(--ds-palette-zinc-900); font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
</style>
