<script setup>
// Checkout step 4 — Review your reservation. Recap + "Protect your stay"
// selection + cancellation policy, then Confirm and pay (gated on choosing a
// protection option, mirroring the Expedia flow).
import { ref, computed } from 'vue'
import PoliciesAgreement from '../PoliciesAgreement.vue'

const props = defineProps({
  contactSummary: { type: String, default: '' },
  paymentLabel: { type: String, default: '' },
  total: { type: Number, default: 0 },
  currency: { type: String, default: '$' },
  // Policies agreement (final gate + CTA). flow: 'reserve' | 'group'.
  flow: { type: String, default: 'reserve' },
  hotels: { type: Array, default: () => [{}] },
  protectionPlans: { type: Array, default: () => ([
    { id: 'plan', title: 'Trip Protection Plan', price: 10.51, recommended: true, benefits: [
      'Cancellation or early check-out, up to 100% of trip cost',
      'Coverage if your travel is interrupted or delayed',
      'Emergency medical & dental, reimbursed up to $200 / person',
    ] },
    { id: 'none', title: 'No protection', desc: 'You could be reimbursed for trip costs (minus the plan price) only if you cancel for a covered reason.' },
  ]) },
  // Expanded layout (CheckoutPageExpanded): render only "Protect your stay" —
  // Policies becomes its own numbered section on that page, so keeping it here
  // too would show the agreement twice. Opt-in; the stepped CheckoutPage still
  // gets both in one step.
  hidePolicies: { type: Boolean, default: false },
  // Expanded layout: the page owns the single submit, so this surface's own
  // completion CTA is suppressed.
  flat: { type: Boolean, default: false },
  // --- Enhanced Booking Protection (ported from presto-2026) -----------------
  // Opt-in swap for the "Protect your stay" block: instead of the two plan
  // cards, the Vertical Insure treatment — a covered-reasons grid over an
  // accept/decline pair with the coverage price and the e-signature notice.
  //
  // Opt-in rather than a replacement because the stepped CheckoutPage still
  // shows the plan cards; only CheckoutPageExpanded asks for this one. The two
  // designs share `protection`'s selected state, so neither flow changes what
  // it captures — 'yes'/'no' here, plan id there.
  enhancedProtection: { type: Boolean, default: false },
  protectionPrice: { type: Number, default: 20.66 },
  coveredReasons: { type: Array, default: () => ([
    { icon: 'monitor_heart', label: 'Injury or Illness' },
    { icon: 'work', label: 'Job Loss' },
    { icon: 'thunderstorm', label: 'Severe Weather' },
    { icon: 'directions_car', label: 'Car Breakdown' },
    { icon: 'groups', label: 'Family Emergency' },
    { icon: 'emergency', label: 'Emergency Service Duty' },
  ]) },
})
const emit = defineEmits(['confirm'])
const money = (n, c = '$') => c + Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const protection = ref(null)
const canConfirm = computed(() => protection.value !== null)
</script>

<template>
  <div class="srr">
    <!-- Protect your stay — reservations only; group blocks aren't charged so
         no booking protection is offered. -->
    <section v-if="flow !== 'group'" class="srr__sec srr__sec--first">
      <h4 class="srr__h">Protect your stay</h4>
      <p class="srr__sub">Select an option to continue.</p>

      <!-- Enhanced Booking Protection (opt-in) — the Vertical Insure treatment:
           what's covered, then accept or decline. -->
      <div v-if="enhancedProtection" class="bp">
        <h5 class="bp__title">Enhanced Booking Protection</h5>
        <p class="bp__desc">Life is unpredictable. Get back up to 100% of your {{ money(total, currency) }} payment if you're forced to cancel or unable to attend due to unexpected events.</p>

        <div class="bp__reasons">
          <div v-for="r in coveredReasons" :key="r.label" class="bp__reason">
            <span class="bp__reason-icon"><q-icon :name="r.icon" size="22px" /></span>
            <span class="bp__reason-label">{{ r.label }}</span>
          </div>
        </div>

        <button type="button" class="bp__opt" :class="{ 'is-sel': protection === 'yes' }" @click="protection = 'yes'">
          <span class="bp__radio"><span v-if="protection === 'yes'" class="bp__dot" /></span>
          <span class="bp__opt-main">Yes, make my booking refundable <span class="bp__rec">Recommended</span></span>
          <span class="bp__opt-price">{{ money(protectionPrice, currency) }}</span>
        </button>

        <button type="button" class="bp__opt bp__opt--no" :class="{ 'is-sel': protection === 'no' }" @click="protection = 'no'">
          <span class="bp__radio"><span v-if="protection === 'no'" class="bp__dot" /></span>
          <span class="bp__opt-main">No, I prefer no refunds or exchanges for any reason</span>
        </button>

        <div class="bp__rule" />
        <p class="bp__fine">Accepting coverage constitutes my electronic signature. I confirm that I have read, understand, and agree to the <a class="bp__link" href="#" @click.prevent>insurance notices and disclosures.</a></p>
      </div>

      <!-- The stepped checkout's plan cards. -->
      <div v-else class="srr__plans">
        <button v-for="p in protectionPlans" :key="p.id" class="srr__plan" :class="{ 'is-sel': protection === p.id }" @click="protection = p.id">
          <span class="srr__plan-body">
            <span class="srr__plan-title">{{ p.title }}<span v-if="p.recommended" class="srr__rec">Recommended</span></span>
            <span v-if="p.price != null" class="srr__plan-price">{{ money(p.price, currency) }}</span>
            <ul v-if="p.benefits" class="srr__bul">
              <li v-for="b in p.benefits" :key="b"><q-icon name="check" size="15px" />{{ b }}</li>
            </ul>
            <span v-else-if="p.desc" class="srr__plan-desc">{{ p.desc }}</span>
          </span>
          <span class="srr__radio"><span v-if="protection === p.id" class="srr__dot" /></span>
        </button>
      </div>
    </section>

    <!-- DES-92: the standalone "Cancellation policy" + "Special check-in
         instructions" block was removed — it duplicated the Policies section
         below. (For group blocks, Protect-your-stay is hidden, so Policies is the
         first section and drops its top border via srr__sec--first.) -->

    <!-- Policies + agreement + completion CTA -->
    <section v-if="!hidePolicies" class="srr__sec" :class="{ 'srr__sec--first': flow === 'group' }">
      <h4 class="srr__h">Policies</h4>
      <p class="srr__sub">Review and agree to the policies to complete your booking.</p>
      <policies-agreement :flow="flow" :hotels="hotels" :hide-cta="flat" @submit="emit('confirm')" />
    </section>
  </div>
</template>

<style scoped>
.srr__recap { list-style: none; margin: 0; padding: 0; }
.srr__recap li { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--ds-color-border); }
.srr__recap li span { color: var(--ds-color-text-subtle); }
.srr__recap li strong { color: var(--ds-color-text); }

.srr__sec { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--ds-color-border); }
.srr__sec--first { margin-top: 0; padding-top: 0; border-top: 0; }
.srr__h { font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-text); margin: 0; }
.srr__sub { color: var(--ds-color-text-subtle); font-size: 0.875rem; margin: 4px 0 14px; }

.srr__plans { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.srr__plan { display: flex; gap: 12px; text-align: left; padding: 16px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); background: var(--ds-color-surface); cursor: pointer; transition: border-color var(--ds-duration-fast) var(--ds-ease-standard); }
.srr__plan:hover { border-color: var(--ds-color-border-bold); }
.srr__plan.is-sel { border-color: var(--ds-color-background-brand-bold); box-shadow: inset 0 0 0 1px var(--ds-color-background-brand-bold); }
.srr__radio { width: 20px; height: 20px; flex: none; border: 1.5px solid var(--ds-color-border-bold); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
.srr__plan.is-sel .srr__radio { border-color: var(--ds-color-background-brand-bold); }
.srr__dot { width: 11px; height: 11px; border-radius: 50%; background: var(--ds-color-background-brand-bold); }
.srr__plan-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
.srr__plan-title { font-weight: 700; color: var(--ds-color-text); }
.srr__rec { display: inline-block; margin-left: 8px; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--ds-color-text-success); }
.srr__plan-price { font-weight: 700; color: var(--ds-color-text); }
.srr__bul { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 7px; align-items: flex-start; }
.srr__bul li { display: flex; align-items: flex-start; gap: 7px; font-size: 0.8125rem; color: var(--ds-color-text-subtle); line-height: 1.4; }
.srr__bul li :deep(.q-icon) { color: var(--ds-color-text-success); flex: none; margin-top: 1px; }
.srr__plan-desc { display: block; margin-top: 10px; font-size: 0.8125rem; color: var(--ds-color-text-subtle); line-height: 1.45; }

.srr__terms { color: var(--ds-color-text-subtle); font-size: 0.8125rem; line-height: 1.5; margin: 24px 0 16px; }
.srr__confirm { width: 100%; height: 54px; border-radius: var(--ds-radius-pill); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; font-size: 1.0625rem; }
.srr__confirm.is-disabled { background: var(--ds-palette-slate-200); color: var(--ds-color-text-subtlest); pointer-events: none; }

@media (max-width: 560px) { .srr__plans { grid-template-columns: 1fr; } }

/* --- Enhanced Booking Protection (ported from presto-2026) ------------------
   Only rendered when `enhancedProtection` is set, so these rules never touch
   the plan-card layout above. */
.bp { border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); padding: 22px 24px; }
.bp__title { margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--ds-color-text); }
.bp__desc { margin: 10px 0 18px; color: var(--ds-color-text-subtle); font-size: 0.9375rem; line-height: 1.5; }

.bp__reasons { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.bp__reason { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px 12px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); }
.bp__reason-icon { width: 48px; height: 48px; border-radius: 50%; background: var(--ds-palette-neutral-900, #18181B); color: #fff; display: flex; align-items: center; justify-content: center; flex: none; }
.bp__reason-label { font-weight: 700; font-size: 0.9375rem; color: var(--ds-color-text); text-align: center; line-height: 1.3; }

.bp__opt { display: flex; align-items: center; gap: 14px; width: 100%; text-align: left; padding: 16px 16px; border: 0; border-radius: var(--ds-radius-md); background: var(--ds-color-surface); cursor: pointer; }
.bp__opt:first-of-type { margin-top: 22px; }
.bp__opt--no { background: var(--ds-palette-slate-50, #F8FAFC); margin-top: 6px; }
.bp__opt.is-sel { box-shadow: inset 0 0 0 2px var(--ds-color-background-brand-bold); }
.bp__radio { width: 22px; height: 22px; flex: none; border: 2px solid var(--ds-color-border-bold); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.bp__opt.is-sel .bp__radio { border-color: var(--ds-color-background-brand-bold); }
.bp__dot { width: 12px; height: 12px; border-radius: 50%; background: var(--ds-color-background-brand-bold); }
.bp__opt-main { flex: 1; display: inline-flex; align-items: center; gap: 10px; flex-wrap: wrap; font-weight: 700; color: var(--ds-color-text); font-size: 1rem; }
.bp__opt-price { font-weight: 800; font-size: 1.125rem; color: var(--ds-color-text); white-space: nowrap; }
.bp__rec { display: inline-block; background: var(--ds-palette-green-600); color: #fff; font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: var(--ds-radius-pill); }

.bp__rule { height: 1px; background: var(--ds-color-border); margin: 18px 0 16px; }
.bp__fine { margin: 0; color: var(--ds-color-text-subtle); font-size: 0.875rem; line-height: 1.5; }
.bp__link { color: var(--ds-color-text-info); text-decoration: underline; }

/* Phones: the covered-reason grid becomes a snap-scrolling row. */
@media (max-width: 600px) {
  .bp { padding: 16px; }
  .bp__title { font-size: 1rem; }
  .bp__desc { font-size: 0.8125rem; line-height: 1.45; margin: 8px 0 14px; }
  .bp__reasons {
    display: flex; grid-template-columns: none; gap: 10px;
    overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
    margin-inline: -4px; padding: 2px 4px 6px;
  }
  .bp__reason { flex: 0 0 42%; min-width: 118px; scroll-snap-align: start; padding: 14px 10px; gap: 8px; }
  .bp__reason-icon { width: 40px; height: 40px; }
  .bp__reason-label { font-size: 0.8125rem; }
  .bp__opt { padding: 14px 12px; gap: 12px; }
  .bp__opt:first-of-type { margin-top: 16px; }
  .bp__opt-main { font-size: 0.875rem; }
  .bp__opt-price { font-size: 1rem; }
  .bp__rec { font-size: 0.6875rem; padding: 2px 8px; }
  .bp__fine { font-size: 0.75rem; line-height: 1.45; }
}
</style>
