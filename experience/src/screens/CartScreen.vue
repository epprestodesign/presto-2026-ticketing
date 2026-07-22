<script setup>
// Review · Cart — laid out like the Tickets + Hotel checkout: a two-column page
// with the itemized order on the left (CartReview, ticketing cards) and a sticky
// Order Summary rail on the right, capped by a "Continue to checkout" action.
// Read-only review — the actual contact/payment form is the next step.
import CartReview from '@lib/components/CartReview.vue'
import OrderSummary from '@lib/components/checkout/OrderSummary.vue'
import { tier, hotel, ticketsHotelCart } from '@lib/stories/ticketing/_ticketing-flow-carts.js'
import { makeSummary } from '@lib/stories/checkout/_ticketing-checkout-data.js'
import { nav } from '../store.js'

const summary = makeSummary(ticketsHotelCart, [
  { label: 'Seats', value: 'Club · Sec CL10' },
  { label: 'Tickets', value: `2 × ${tier.name}` },
  { label: 'Hotel', value: `${hotel.name} · 1 night` },
], { rrow1: `2 × ${tier.name} + ${hotel.name}` })
</script>

<template>
  <div class="xcart">
    <div class="xcart__inner">
      <h1 class="xcart__h1">Your cart</h1>
      <div class="xcart__grid">
        <!-- LEFT: itemized order -->
        <div class="xcart__main">
          <div class="xcart__card">
            <cart-review mode="ticketing" :cart="ticketsHotelCart" cards :show-requests="false" />
          </div>
        </div>

        <!-- RIGHT: sticky summary rail + continue -->
        <aside class="xcart__rail">
          <order-summary :summary="summary" currency="$" />
          <button type="button" class="xcart__cta" @click="nav('checkout')">
            Continue to checkout <q-icon name="arrow_forward" size="18px" />
          </button>
          <p class="xcart__note"><q-icon name="lock" size="14px" /> You won't be charged yet.</p>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.xcart { background: var(--ds-palette-neutral-100, #f5f5f7); min-height: 100%; padding: 12px 24px 48px; flex: 1; }
.xcart__inner { max-width: 1040px; margin: 0 auto; }
.xcart__h1 { font-family: var(--ds-font-family); font-size: 1.75rem; font-weight: 800; color: var(--ds-color-text); margin: 12px 0 20px; }
.xcart__grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 32px; align-items: start; }
.xcart__card { background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); overflow: hidden; }
.xcart__rail { position: sticky; top: 16px; display: flex; flex-direction: column; gap: 16px; }
.xcart__cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 52px; border: 0; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font: inherit; font-weight: 700; font-size: 1rem; cursor: pointer; }
.xcart__note { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }

@media (max-width: 880px) {
  .xcart__grid { grid-template-columns: 1fr; }
  .xcart__rail { position: static; }
}
</style>
