<script setup>
// BundleConfirmation — the post-payment confirmation (scope 3.6): EP order number
// as the bundle identifier, every component listed, and the v1 dual-email notice
// ("your tickets will be confirmed in a separate email"). Shown only when a hotel
// is part of the order; ticket-only orders get TS's own confirmation.
import { computed } from 'vue'

const props = defineProps({
  orderNumber: { type: String, required: true },
  event: { type: Object, required: true },
  cart: { type: Object, required: true },        // buildBundleCart() result
  email: { type: String, default: 'you@example.com' },
  hasHotel: { type: Boolean, default: true },
})

const ICON = { ticket: 'confirmation_number', hotel: 'hotel' }
function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: props.cart.currency || 'USD', maximumFractionDigits: 0 }).format(n) }
</script>

<template>
  <div class="bconf">
    <div class="bconf__hero">
      <div class="bconf__check"><q-icon name="check" size="26px" /></div>
      <h2 class="bconf__title">You're all set!</h2>
      <p class="bconf__sub">{{ event.name }}<template v-if="event.venue?.name"> · {{ event.venue.name }}</template></p>
      <div class="bconf__order">Order <strong>{{ orderNumber }}</strong></div>
    </div>

    <ul class="bconf__items">
      <li v-for="(item, i) in cart.items" :key="i">
        <q-icon :name="ICON[item.type] || 'shopping_bag'" size="20px" />
        <div>
          <div class="bconf__label">{{ item.label }}</div>
          <div v-if="item.sublabel" class="bconf__sublabel">{{ item.sublabel }}</div>
        </div>
        <span class="bconf__amt">{{ fmt(item.amount) }}</span>
      </li>
      <li class="bconf__total"><span>Total charged</span><span>{{ fmt(cart.total) }}</span></li>
    </ul>

    <div v-if="hasHotel" class="bconf__email">
      <q-icon name="mark_email_read" size="20px" />
      <div>
        <strong>Hotel confirmation sent to {{ email }}.</strong>
        Your tickets will be confirmed in a <em>separate email</em> — please check your inbox.
      </div>
    </div>
  </div>
</template>

<style scoped>
.bconf {
  font-family: var(--ds-font-family); max-width: 520px; display: flex; flex-direction: column; gap: var(--ds-space-5);
  background: var(--ds-color-surface); border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-lg); padding: var(--ds-space-6);
}
.bconf__hero { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
.bconf__check {
  width: 52px; height: 52px; border-radius: var(--ds-radius-pill); display: flex; align-items: center; justify-content: center;
  background: var(--ds-color-background-success-bold); color: var(--ds-color-text-inverse); margin-bottom: 4px;
}
.bconf__title { margin: 0; font-size: var(--ds-font-size-lg); font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.bconf__sub { margin: 0; color: var(--ds-color-text-subtle); font-size: var(--ds-font-size-sm); }
.bconf__order { margin-top: 4px; font-size: var(--ds-font-size-sm); color: var(--ds-color-text); }

.bconf__items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--ds-space-3); }
.bconf__items li { display: flex; align-items: center; gap: var(--ds-space-3); color: var(--ds-color-text); }
.bconf__items li > div { flex: 1; min-width: 0; }
.bconf__label { font-weight: var(--ds-font-weight-medium); }
.bconf__sublabel { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.bconf__amt { font-weight: var(--ds-font-weight-bold); white-space: nowrap; }
.bconf__total { padding-top: var(--ds-space-3); border-top: 1px solid var(--ds-color-border); justify-content: space-between; font-weight: var(--ds-font-weight-bold); }
.bconf__total span:last-child { font-size: var(--ds-font-size-md); }

.bconf__email {
  display: flex; gap: var(--ds-space-3); align-items: flex-start;
  background: var(--ds-color-background-info); color: var(--ds-color-text-info);
  border-radius: var(--ds-radius-md); padding: var(--ds-space-3); font-size: var(--ds-font-size-sm);
}
.bconf__email strong { color: var(--ds-color-text); }
</style>
