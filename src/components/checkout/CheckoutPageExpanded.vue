<script setup>
// CheckoutPageExpanded — a fully-unfolded variant of CheckoutPage. Instead of
// the stepped accordion (one step open, "Next" advances, completed steps
// collapse behind an Edit), EVERY step is shown open at once with all of its
// fields in their input state, and the whole flow ends in ONE submit button.
//
// Same data, same modes and the SAME RAIL as CheckoutPage — only the left column
// changes. Ported from the presto-2026 component of the same name and extended
// with this fork's `ticketing` mode, which that one predates.
//
// Why a sibling component rather than a flag on CheckoutPage: the accordion owns
// a good deal of state that has no meaning here (current/furthest step, per-step
// summaries, Edit affordances, the Next handler). Threading an `expanded` prop
// through all of it would leave every one of those branches half-live. The two
// layouts share their inputs, not their mechanics.
import { ref, computed, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import CartReview from '../CartReview.vue'
import StepReviewOrder from './steps/StepReviewOrder.vue'
import StepContactInfo from './steps/StepContactInfo.vue'
import StepPayment from './steps/StepPayment.vue'
import StepReviewReservation from './steps/StepReviewReservation.vue'
import PoliciesAgreement from './PoliciesAgreement.vue'

const props = defineProps({
  mode: { type: String, default: 'group' }, // group | reservation | reservations | ticketing
  cart: { type: Object, default: () => ({}) },
  summary: { type: Object, default: () => ({}) },
  currency: { type: String, default: '$' },
  // Group flow: render the teams block widget in the contact step.
  showTeams: { type: Boolean, default: true },
  // Ticketing flow: an edge-case banner atop the steps column
  // (null | 'payment-failed' | 'sold-out' | 'hold-expired').
  edge: { type: String, default: null },
})

// "Time left to book" countdown for the rail — rooms are held temporarily.
const heldSecs = ref(props.cart.heldSeconds ?? 895)
const timerText = computed(() => `${Math.floor(heldSecs.value / 60)} min : ${String(heldSecs.value % 60).padStart(2, '0')} sec`)
let heldTimer = null
onMounted(() => { heldTimer = setInterval(() => { if (heldSecs.value > 0) heldSecs.value-- }, 1000) })
onBeforeUnmount(() => clearInterval(heldTimer))
const $q = useQuasar()

const isGroup = computed(() => props.mode === 'group')
const isMulti = computed(() => props.mode === 'reservations')
const isTicketing = computed(() => props.mode === 'ticketing')
const cartMode = computed(() => (isTicketing.value ? 'ticketing' : isGroup.value ? 'hold' : isMulti.value ? 'reservations' : 'reserve'))
const liveCart = reactive(JSON.parse(JSON.stringify(props.cart || {})))

const contactRooms = computed(() => {
  const n = liveCart.priceDetails?.rooms || 1
  const adults = liveCart.sleeps || 2
  return Array.from({ length: n }, () => ({ adults, children: 0 }))
})
const contactReservations = computed(() => (liveCart.hotels || []).map((h) => ({
  name: h.name,
  rooms: (h.rooms || []).map((r) => ({ adults: r.adults ?? 2, children: r.children ?? 0 })),
})))

// Ticketing collects a single buyer's contact (no team blocks, no per-room
// occupancy) — reuse the 'reservation' contact form with one 1-adult room.
const contactMode = computed(() => (isTicketing.value ? 'reservation' : props.mode))
const contactShowTeams = computed(() => (isTicketing.value ? false : props.showTeams))
const contactRoomsResolved = computed(() => (isTicketing.value ? [{ adults: 1, children: 0 }] : contactRooms.value))

const policyFlow = computed(() => (isGroup.value ? 'group' : 'reserve'))
const policyHotels = computed(() => {
  const hs = liveCart.hotels
  return (hs && hs.length) ? hs.map((h) => ({ name: h.name })) : [{}]
})

// The step set. Expanded splits what the accordion's last step bundles: the
// protect/review card and the policies agreement become their own numbered
// sections, because with everything open at once a single "Review" step holding
// both reads as one long unlabelled tail.
//
//   group     → Review order · Contact & group info · Policies   (held, not charged)
//   ticketing → Contact · Payment · Review your order · Policies
//   otherwise → Contact · Payment · Review your reservation · Policies
const steps = computed(() => {
  const contact = { key: 'contact', label: isGroup.value ? 'Enter contact & group information' : 'Enter contact information' }
  const policies = { key: 'policies', label: 'Policies' }
  if (isGroup.value) return [{ key: 'review', label: 'Review order' }, contact, policies]
  const protect = { key: 'protect', label: isTicketing.value ? 'Review your order' : 'Review your reservation' }
  return [contact, { key: 'payment', label: 'Add a payment method' }, protect, policies]
})

const EDGE = {
  'payment-failed': { icon: 'error', cls: 'is-danger', text: "Payment didn't go through — your seats are still held on a short grace period. Update your card and try again before the timer ends." },
  'sold-out': { icon: 'remove_shopping_cart', cls: 'is-warning', text: 'A section in your order just sold out and was removed. Your total has been updated below.' },
  'hold-expired': { icon: 'timer_off', cls: 'is-danger', text: 'Your hold expired. Re-select your seats on the map to continue.' },
}
const edgeInfo = computed(() => (isTicketing.value && props.edge ? EDGE[props.edge] : null))

// Captured field state (kept so the step components stay controlled).
const contact = ref({})
const payment = ref({})
const paymentLabel = computed(() => {
  const digits = (payment.value.cardNumber || '').replace(/\D/g, '')
  return digits.length >= 4 ? `Card ending ${digits.slice(-4)}` : 'Card details'
})
const contactSummary = computed(() => 'Contact details')

const submitLabel = computed(() => (isGroup.value ? 'Hold Group Block Now' : 'Book Now'))
const confirm = () => $q.notify({ message: 'Reservation confirmed — a confirmation has been emailed.', icon: 'check_circle', color: 'grey-9', position: 'bottom', timeout: 3000 })
</script>

<template>
  <div class="ck">
    <div class="ck__inner">
    <div class="ck__header">
      <h1 class="ck__h1">Confirm and pay</h1>
    </div>

    <div class="ck__grid">
      <!-- LEFT: every step expanded, all fields in their input state, and no
           per-step Next — the whole form submits once at the bottom. -->
      <div class="ck__steps">
        <div v-if="edgeInfo" class="ck__edge" :class="edgeInfo.cls">
          <q-icon :name="edgeInfo.icon" size="20px" /> <span>{{ edgeInfo.text }}</span>
        </div>

        <section v-for="(s, i) in steps" :key="s.key" class="ck__step is-open">
          <header class="ck__stephead">
            <span class="ck__num">{{ i + 1 }}</span>
            <span class="ck__steptitle">{{ s.label }}</span>
          </header>

          <div class="ck__body">
            <step-review-order v-if="s.key === 'review'" :mode="cartMode" :cart="liveCart" :currency="currency" bind flat />
            <step-contact-info v-else-if="s.key === 'contact'" :mode="contactMode" :show-teams="contactShowTeams" :rooms="contactRoomsResolved" :reservations="isMulti ? contactReservations : null" v-model="contact" flat />
            <step-payment v-else-if="s.key === 'payment'" v-model="payment" flat />
            <!-- `enhanced-protection`: the expanded page uses the Enhanced
                 Booking Protection block (covered reasons + accept/decline)
                 rather than the stepped flow's two plan cards. Set here, so all
                 six expanded flows carry it. -->
            <step-review-reservation v-else-if="s.key === 'protect'" :contact-summary="contactSummary" :payment-label="paymentLabel" :total="summary.total" :currency="currency" :flow="policyFlow" :hotels="policyHotels" flat hide-policies enhanced-protection />
            <policies-agreement v-else-if="s.key === 'policies'" :flow="policyFlow" :hotels="policyHotels" hide-cta />
          </div>
        </section>

        <!-- ONE submit for the whole expanded flow. -->
        <button type="button" class="ck__submit" @click="confirm">{{ submitLabel }}</button>
      </div>

      <!-- RIGHT: unchanged from CheckoutPage — the same sticky cart, the same
           in-rail countdown, the same reservation actions. -->
      <aside class="ck__railwrap">
        <cart-review :mode="cartMode" :cart="liveCart" :currency="currency" readonly bind :show-requests="false" cards :order-title="(isGroup || isMulti) ? 'Review your order' : ''" />

        <div class="ck__timer">
          <div class="ck__timer-row">
            <span class="ck__timer-label"><q-icon name="timer" size="18px" /> Time left to book</span>
            <span class="ck__timer-clock">{{ timerText }}</span>
          </div>
          <p class="ck__timer-note">Book before the timer runs out to secure this rate. If the timer expires, you'll need to run your search again.</p>
        </div>

        <div v-if="!isGroup && !isTicketing" class="ck__railactions">
          <button type="button" class="ck__railbtn"><q-icon name="edit" size="18px" /> Edit reservation</button>
          <button type="button" class="ck__railbtn ck__railbtn--ghost"><q-icon name="restart_alt" size="18px" /> Start over</button>
        </div>
      </aside>
    </div>
    </div>
  </div>
</template>

<style scoped>
.ck { background: var(--ds-palette-neutral-100); min-height: 100vh; padding: 12px 24px 40px; }
.ck__inner { max-width: 1040px; margin: 0 auto; }
.ck__header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.ck__h1 { font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--ds-color-text); }
.ck__grid { display: grid; grid-template-columns: 1fr 400px; gap: 32px; align-items: start; }

/* Rail — identical to CheckoutPage's. */
.ck__timer { margin-top: 16px; background: var(--ds-palette-blue-100); border: 1px solid var(--ds-palette-blue-200, #BFDBFE); border-radius: var(--ds-radius-lg); padding: 16px 20px; color: var(--ds-palette-blue-800); }
.ck__timer-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ck__timer-label { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1rem; }
.ck__timer-clock { font-weight: 700; font-variant-numeric: tabular-nums; font-size: 1.0625rem; }
.ck__timer-note { margin: 8px 0 0; font-size: 0.9375rem; line-height: 1.45; }

.ck__railactions { display: flex; gap: 10px; margin-top: 12px; }
.ck__railbtn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 46px; border: 1px solid var(--ds-color-border-brand); border-radius: var(--ds-radius-md); background: var(--ds-color-surface); color: var(--ds-color-text-brand); font-family: inherit; font-weight: 700; font-size: 0.9375rem; cursor: pointer; transition: background var(--ds-duration-fast) var(--ds-ease-standard); }
.ck__railbtn:hover { background: var(--ds-palette-navy-50); }
.ck__railbtn--ghost { border-color: var(--ds-color-border-bold); color: var(--ds-color-text); }
.ck__railbtn--ghost:hover { background: var(--ds-palette-slate-100); }
.ck__railwrap { position: sticky; top: 20px; }

.ck__edge { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: var(--ds-radius-md); margin-bottom: 16px; font-size: 0.9375rem; line-height: 1.4; }
.ck__edge.is-danger { background: var(--ds-color-background-danger); color: var(--ds-color-text-danger); }
.ck__edge.is-warning { background: var(--ds-color-background-warning); color: var(--ds-color-text-warning); }
.ck__edge :deep(.q-icon) { flex: none; }

.ck__step { background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); padding: 18px 20px; margin-bottom: 16px; }
.ck__stephead { display: flex; align-items: center; gap: 12px; }
.ck__num { width: 26px; height: 26px; border-radius: 50%; background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; flex: none; }
.ck__steptitle { flex: 1; font-weight: 700; color: var(--ds-color-text); }
.ck__body { margin-top: 18px; }

/* One submit for the whole expanded flow. */
.ck__submit { width: 100%; height: 60px; border: 0; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font-family: inherit; font-size: 1.125rem; font-weight: 700; cursor: pointer; transition: background var(--ds-duration-fast) var(--ds-ease-standard); }
.ck__submit:hover { background: var(--ds-palette-navy-800); }

/* Collapse to one column below 880. minmax(0,1fr) + min-width:0 let the column
   shrink to the viewport instead of stretching to a child's min-content. */
@media (max-width: 880px) {
  .ck__grid { grid-template-columns: minmax(0, 1fr); }
  .ck__steps, .ck__railwrap { min-width: 0; }
}
@media (max-width: 600px) {
  .ck { padding: 12px 16px 32px; }
  .ck__railwrap { position: static; }
  .ck__step { padding: 16px; }
  .ck__grid { gap: 20px; }
}
</style>
