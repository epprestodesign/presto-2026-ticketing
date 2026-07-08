<script setup>
// PageFrame — the app shell for full-page compositions: the Global Nav header,
// a content slot, and the shared footer. Used to render each journey step
// (Browse, Hotel Details, Checkout, Confirmation) as a fully-flushed-out page,
// consistent with the Landing Page. `cartMode` is 'reserve' (Book Reservation)
// or 'hold' (Group Block).
import GlobalNav from './GlobalNav.vue'
import epLogo from '../assets/eventpipe logos/eventpipe-logo.svg'

const props = defineProps({
  brand: { type: String, default: 'Presto' },
  cartMode: { type: String, default: 'reserve' }, // 'reserve' | 'hold'
  cart: { type: Object, default: () => ({}) },
})
</script>

<template>
  <div class="pf">
    <global-nav :brand="brand" :cart-mode="cartMode" :cart="cart" />
    <div class="pf__body"><slot /></div>
    <footer class="pf__footer">
      <div class="pf__footer-inner">
        <img :src="epLogo" alt="EventPipe" class="pf__logo" />
        <span class="pf__legal">© 2026 EventPipe · Terms · Privacy · Contact</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.pf { background: var(--ds-color-surface); color: var(--ds-color-text); min-height: 100%; }
.pf__footer { margin-top: 56px; border-top: 1px solid var(--ds-color-border); background: var(--ds-color-surface); }
.pf__footer-inner {
  max-width: 1180px; margin: 0 auto; padding: 28px 24px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.pf__logo { height: 30px; width: auto; display: block; }
.pf__legal { color: var(--ds-color-text-subtle); font-size: 0.8125rem; }
</style>
