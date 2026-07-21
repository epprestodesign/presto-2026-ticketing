<script setup>
// BundleCheckoutPage — the unified ticket + hotel bundle checkout (scope 3.5),
// following the Group Block convention: a left stepped accordion (one step open,
// completed steps collapse with Edit) beside a sticky OrderSummary rail. One
// charge covers all components. `edge` surfaces the scope's edge cases
// (payment-failure hold grace C-08, a section selling out, an expired hold).
import { ref, reactive, computed } from 'vue'
import BundleCart from '../BundleCart.vue'
import PaymentForm from './PaymentForm.vue'
import PhoneField from './PhoneField.vue'
import OrderSummary from './OrderSummary.vue'

const props = defineProps({
  event: { type: Object, required: true },
  cart: { type: Object, required: true },        // buildBundleCart() result
  summary: { type: Object, default: () => ({}) },  // OrderSummary model
  savings: { type: Number, default: 0 },
  startStep: { type: Number, default: 1 },
  edge: { type: String, default: null },           // payment-failed | sold-out | hold-expired
  holdLabel: { type: String, default: '4:52' },
})
const emit = defineEmits(['confirm'])

const steps = [
  { key: 'review', label: 'Review your order' },
  { key: 'contact', label: 'Contact info' },
  { key: 'payment', label: 'Payment' },
  { key: 'confirm', label: 'Review & pay' },
]
const current = ref(props.startStep)
const furthest = ref(props.startStep)
const stepState = (n) => (n === current.value ? 'open' : n <= furthest.value ? 'done' : 'upcoming')
const next = () => { furthest.value = Math.max(furthest.value, current.value + 1); current.value = Math.min(current.value + 1, steps.length) }
const goEdit = (n) => { current.value = n }

const contact = reactive({ name: '', email: '', phone: '' })
const payment = ref({})

const EDGE = {
  'payment-failed': { icon: 'error', cls: 'is-danger', text: `Payment didn't go through — your seats are still held for ${props.holdLabel}. Update your card and try again.` },
  'sold-out': { icon: 'remove_shopping_cart', cls: 'is-warning', text: 'A section in your cart just sold out and was removed. Your total has been updated.' },
  'hold-expired': { icon: 'timer_off', cls: 'is-danger', text: 'Your hold expired. Re-select your seats on the map to continue.' },
}
const edge = computed(() => (props.edge ? EDGE[props.edge] : null))

function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: props.cart.currency || 'USD', maximumFractionDigits: 0 }).format(n) }
</script>

<template>
  <div class="bck">
    <div class="bck__main">
      <!-- LEFT: stepped accordion -->
      <div class="bck__steps">
        <div v-if="edge" class="bck__edge" :class="edge.cls">
          <q-icon :name="edge.icon" size="20px" /> <span>{{ edge.text }}</span>
        </div>

        <section v-for="(s, i) in steps" :key="s.key" class="bck__step" :class="`is-${stepState(i + 1)}`">
          <header class="bck__stephead" @click="stepState(i + 1) === 'done' && goEdit(i + 1)">
            <span class="bck__num"><q-icon v-if="stepState(i + 1) === 'done'" name="check" size="16px" /><template v-else>{{ i + 1 }}</template></span>
            <span class="bck__steptitle">{{ s.label }}</span>
            <button v-if="stepState(i + 1) === 'done'" class="bck__edit" @click.stop="goEdit(i + 1)">Edit</button>
          </header>

          <div v-if="stepState(i + 1) === 'open'" class="bck__body">
            <!-- 1 · Review order -->
            <template v-if="s.key === 'review'">
              <BundleCart :cart="cart" :savings="savings" @checkout="next" />
            </template>

            <!-- 2 · Contact info -->
            <template v-else-if="s.key === 'contact'">
              <div class="bck__field"><label>Full name</label><input v-model="contact.name" type="text" placeholder="Jordan Rivera" /></div>
              <div class="bck__field"><label>Email</label><input v-model="contact.email" type="email" placeholder="you@company.com" /></div>
              <div class="bck__field"><label>Mobile</label><PhoneField v-model="contact.phone" /></div>
              <button class="bck__next" @click="next">Continue to payment</button>
            </template>

            <!-- 3 · Payment -->
            <template v-else-if="s.key === 'payment'">
              <PaymentForm v-model="payment" reassurance="One secure charge covers your tickets and hotel." />
              <button class="bck__next" @click="next">Review &amp; pay</button>
            </template>

            <!-- 4 · Review & pay -->
            <template v-else>
              <p class="bck__confirmnote">You'll be charged <strong>{{ fmt(cart.total) }}</strong> once. Tickets and hotel are booked together.</p>
              <button class="bck__pay" @click="emit('confirm')">Pay {{ fmt(cart.total) }}</button>
              <p class="bck__fine"><q-icon name="lock" size="12px" /> PCI-compliant · taxes &amp; fees shown at right</p>
            </template>
          </div>
        </section>
      </div>

      <!-- RIGHT: sticky order summary -->
      <div class="bck__rail">
        <OrderSummary :summary="summary" currency="$" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bck { font-family: var(--ds-font-family); }
.bck__main { display: grid; grid-template-columns: 1fr 360px; gap: var(--ds-space-6); align-items: start; max-width: 1040px; margin: 0 auto; }
@media (max-width: 900px) { .bck__main { grid-template-columns: 1fr; } }

.bck__edge { display: flex; align-items: center; gap: var(--ds-space-2); padding: var(--ds-space-3) var(--ds-space-4); border-radius: var(--ds-radius-md); margin-bottom: 16px; font-size: var(--ds-font-size-sm); }
.bck__edge.is-danger { background: var(--ds-color-background-danger); color: var(--ds-color-text-danger); }
.bck__edge.is-warning { background: var(--ds-color-background-warning); color: var(--ds-color-text-warning); }

.bck__step { background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); padding: 18px 20px; margin-bottom: 16px; }
.bck__step.is-upcoming { opacity: 0.55; }
.bck__stephead { display: flex; align-items: center; gap: var(--ds-space-3); cursor: default; }
.bck__step.is-done .bck__stephead { cursor: pointer; }
.bck__num { width: 26px; height: 26px; border-radius: var(--ds-radius-pill); display: flex; align-items: center; justify-content: center; font-weight: var(--ds-font-weight-bold); font-size: var(--ds-font-size-sm); background: var(--ds-color-background-neutral); color: var(--ds-color-text-subtle); flex: none; }
.bck__step.is-open .bck__num, .bck__step.is-done .bck__num { background: var(--ds-color-background-brand-bold); color: var(--ds-color-text-inverse); }
.bck__steptitle { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.bck__edit { margin-left: auto; background: none; border: none; cursor: pointer; color: var(--ds-color-link); font: inherit; font-weight: var(--ds-font-weight-bold); }

.bck__body { margin-top: var(--ds-space-4); display: flex; flex-direction: column; gap: var(--ds-space-3); }
.bck__field { display: flex; flex-direction: column; gap: 6px; }
.bck__field label { font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-medium); color: var(--ds-color-text); }
.bck__field input { border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-md); padding: 10px 12px; font: inherit; color: var(--ds-color-text); background: var(--ds-color-background-input); }
.bck__next, .bck__pay {
  align-self: flex-start; cursor: pointer; border: none; font: inherit; font-weight: var(--ds-font-weight-bold);
  background: var(--ds-color-background-brand-bold); color: var(--ds-color-text-inverse);
  padding: 11px 22px; border-radius: var(--ds-radius-button);
}
.bck__pay { align-self: stretch; text-align: center; padding: 13px; font-size: var(--ds-font-size-md); }
.bck__confirmnote { margin: 0; color: var(--ds-color-text); }
.bck__fine { margin: 0; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
</style>
