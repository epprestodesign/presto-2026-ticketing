<script setup>
// ConfirmationPage — the post-checkout success screen, structured to match the
// production booking confirmation: a compact success banner, a Summary section
// (contact + booking ID + Book-in-Block / Copy-Link / Print actions + a
// reserved/organization/contact meta grid + one block per hotel with the rooms
// held per night), and a per-hotel Policies section.
//
// Three data modes share this structure:
//   hold         → Group Block   ("Group Block Summary", Group ID + release date,
//                  "Book in Block", rooms shown as "(N rooms held)")
//   reserve      → single stay    ("Reservation Summary", Confirmation #)
//   reservations → multiple stays ("Reservations Summary", one block per stay)
// Controls are presentational (visual states only). Accents use the DS primary.
import { computed, onMounted, ref } from 'vue'
import { loadImagery } from '../../lib/imagery'

const props = defineProps({
  mode: { type: String, default: 'reserve' }, // reserve | hold | reservations | ticketing
  data: { type: Object, default: () => ({}) },
})

const isHold = computed(() => props.mode === 'hold')
// Ticketing mode (post-checkout order confirmation for the 2×2 ticketing flows)
// reuses the same banner / summary-card / policies structure. Every new branch
// below is gated on isTicketing so hold/reserve/reservations are untouched.
const isTicketing = computed(() => props.mode === 'ticketing')
const d = computed(() => props.data || {})

// --- Tone (ticketing) --------------------------------------------------------
// Default 'success' keeps every other mode visually identical (check_circle +
// success accent). Warning → schedule/amber, danger → error/red.
const tone = computed(() => d.value.tone || 'success')
const bannerIcon = computed(() =>
  ({ success: 'check_circle', warning: 'schedule', danger: 'error' })[tone.value] || 'check_circle')

// --- Banner / labels ---------------------------------------------------------
const bannerTitle = computed(() =>
  d.value.bannerTitle ||
  (isTicketing.value
    ? 'Success! Your order is confirmed.'
    : isHold.value
      ? 'Success! Your Group Block is being held.'
      : props.mode === 'reservations'
        ? 'Success! Your reservations are confirmed.'
        : 'Success! Your reservation is confirmed.')
)
const bannerSub = computed(() => d.value.bannerSub || 'A confirmation email is on its way.')
const bannerCta = computed(() =>
  d.value.bannerCta ||
  (isTicketing.value ? 'View my orders' : isHold.value ? 'Hold Another Group Block' : 'Book Another Reservation')
)
const summaryLabel = computed(() =>
  isTicketing.value
    ? (d.value.summaryLabel || 'Order Summary')
    : isHold.value ? 'Group Block Summary' : props.mode === 'reservations' ? 'Reservations Summary' : 'Reservation Summary'
)
const idLabel = computed(() =>
  isTicketing.value ? (d.value.idLabel || 'Order') : isHold.value ? 'Group ID' : 'Confirmation #')
const bookingId = computed(() =>
  isTicketing.value
    ? (d.value.orderNumber || '')
    : (d.value.groupId || d.value.confirmationId || d.value.itinerary || ''))
const contactName = computed(() => d.value.contactName || '')
const releaseDate = computed(() => (isHold.value ? d.value.releaseDate : ''))

// Meta grid rows (label → value). Group blocks surface the organization + group
// contact; single/multiple reservations surface the booking guest; ticketing
// surfaces the event + guest.
const metaRows = computed(() => {
  const rows = []
  if (isTicketing.value) {
    const ev = d.value.event || {}
    if (ev.name) rows.push({ label: 'Event', value: ev.name })
    if (ev.date) rows.push({ label: 'Date', value: ev.date })
    if (ev.venue) rows.push({ label: 'Venue', value: ev.venue })
    if (d.value.guest) rows.push({ label: 'Guest', value: d.value.guest })
    if (d.value.email) rows.push({ label: 'Email', value: d.value.email })
    return rows
  }
  if (d.value.reservedOn) rows.push({ label: 'Reserved On', value: d.value.reservedOn })
  if (isHold.value) {
    if (d.value.organizationName) rows.push({ label: 'Organization Name', value: d.value.organizationName })
    if (d.value.groupContact) rows.push({ label: 'Group Contact', value: d.value.groupContact })
  } else if (d.value.guest) {
    rows.push({ label: 'Guest', value: d.value.guest })
  }
  if (d.value.email) rows.push({ label: 'Email', value: d.value.email })
  return rows
})

// --- Ticketing order components / value props / status note ------------------
const blocks = computed(() => (isTicketing.value ? d.value.blocks || [] : []))
const totalCharged = computed(() => d.value.totalCharged)
const valueProps = computed(() => (isTicketing.value ? d.value.valueProps || [] : []))
const valuePropsLabel = computed(() => d.value.valuePropsLabel || "What's included")
const statusNote = computed(() => (isTicketing.value ? d.value.statusNote || null : null))

// --- Hotels ------------------------------------------------------------------
// Every mode normalizes to a list of hotel blocks:
//   { name, stars, address, seed, checkIn, checkOut,
//     rooms: [{ type, note, nights: [{ date, qty, price }] }] }
const hotels = computed(() => d.value.hotels || [])
const heldSuffix = (qty) => `${qty} ${qty === 1 ? 'room' : 'rooms'}${isHold.value ? ' held' : ''}`
const starText = (n) => (Number.isInteger(n) ? `${n}` : `${n}`)

// Thumbnails come from the imagery library, seeded per hotel.
const lib = ref(null)
onMounted(async () => { lib.value = await loadImagery() })
const thumb = (h) => {
  const arr = lib.value?.exterior
  if (!arr || !arr.length) return null
  return arr[(h.seed ?? 0) % arr.length]?.url || null
}

// Policies accepts the per-hotel shape [{ hotel, items:[{title,body}] }] used by
// hold/reserve, OR a flat [{title,body}] list (ticketing) which is normalized
// into a single group under one heading.
const policies = computed(() => {
  const p = d.value.policies || []
  if (!p.length) return []
  if (p[0] && Array.isArray(p[0].items)) return p
  return [{ hotel: d.value.policiesHeading || 'Ticketing & event', items: p }]
})

const money = (n) => '$' + Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const print = () => { if (typeof window !== 'undefined') window.print() }
</script>

<template>
  <div class="conf">
    <div class="conf__inner">
      <!-- SUCCESS BANNER -->
      <section class="conf__banner" :class="`conf__banner--${tone}`">
        <span class="conf__banner-check"><q-icon :name="bannerIcon" size="34px" /></span>
        <div class="conf__banner-text">
          <p class="conf__banner-title">{{ bannerTitle }}</p>
          <p class="conf__banner-sub">{{ bannerSub }}</p>
        </div>
        <button type="button" class="conf__banner-cta">{{ bannerCta }}</button>
      </section>

      <!-- STATUS NOTE (ticketing edge/dual-email messaging) -->
      <section v-if="statusNote" class="conf__statusnote" :class="`conf__statusnote--${tone}`">
        <q-icon :name="bannerIcon" size="20px" class="conf__statusnote-icon" />
        <div class="conf__statusnote-text">
          <p class="conf__statusnote-title">{{ statusNote.title }}</p>
          <p class="conf__statusnote-body">{{ statusNote.body }}</p>
        </div>
      </section>

      <!-- SUMMARY -->
      <h2 class="conf__sectionlabel">{{ summaryLabel }}</h2>

      <section class="conf__card conf__summary">
        <!-- header: contact + id  |  actions + release date -->
        <div class="conf__sumhead">
          <div class="conf__sumhead-left">
            <div class="conf__contact">{{ contactName }}</div>
            <div v-if="bookingId" class="conf__bookingid">{{ idLabel }} {{ bookingId }}</div>
          </div>
          <div class="conf__sumhead-right">
            <div class="conf__actions">
              <button v-if="isHold" type="button" class="conf__action"><q-icon name="open_in_new" size="16px" /> Book in Block</button>
              <button type="button" class="conf__action"><q-icon name="content_copy" size="16px" /> Copy Booking Link</button>
              <button type="button" class="conf__action" @click="print"><q-icon name="print" size="16px" /> Print</button>
            </div>
            <div v-if="releaseDate" class="conf__release">
              <span>Group Block Release Date:</span> <strong>{{ releaseDate }}</strong>
            </div>
          </div>
        </div>

        <hr class="conf__rule" />

        <!-- meta grid -->
        <dl v-if="metaRows.length" class="conf__metagrid">
          <div v-for="m in metaRows" :key="m.label" class="conf__metarow">
            <dt>{{ m.label }}:</dt>
            <dd>{{ m.value }}</dd>
          </div>
        </dl>

        <!-- per-hotel blocks -->
        <div v-for="(h, hi) in hotels" :key="hi" class="conf__hotel">
          <hr class="conf__rule" />
          <header class="conf__hotelhead">
            <img v-if="thumb(h)" :src="thumb(h)" alt="" class="conf__thumb" />
            <div v-else class="conf__thumb conf__thumb--empty"><q-icon name="image" size="22px" /></div>
            <div class="conf__hotelmeta">
              <h3 class="conf__hotelname">{{ h.name }}</h3>
              <div v-if="h.stars" class="conf__stars"><q-icon name="star" size="16px" /> {{ starText(h.stars) }} Stars</div>
              <div v-if="h.address" class="conf__addr">{{ h.address }}</div>
            </div>
          </header>

          <div v-for="(r, ri) in h.rooms || []" :key="ri" class="conf__room">
            <div class="conf__roomtype">{{ r.type }}</div>
            <div v-if="r.note" class="conf__roomnote">{{ r.note }}</div>

            <div class="conf__ci">
              <div class="conf__cirow"><span>Check In</span><strong>{{ h.checkIn }}</strong></div>
              <div class="conf__cirow"><span>Check Out</span><strong>{{ h.checkOut }}</strong></div>
            </div>

            <ul class="conf__nights">
              <li v-for="(n, ni) in r.nights || []" :key="ni">
                <span class="conf__nightdate">{{ n.date }}</span>
                <span class="conf__nightheld">({{ heldSuffix(n.qty) }})</span>
                <span class="conf__nightprice">{{ money(n.price) }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- ticketing order components + total charged -->
        <template v-if="isTicketing && blocks.length">
          <hr class="conf__rule" />
          <div v-for="(b, bi) in blocks" :key="bi" class="conf__ordercomp">
            <span class="conf__comptile"><q-icon :name="b.icon" size="24px" /></span>
            <div class="conf__compmeta">
              <div class="conf__compname">{{ b.name }}</div>
              <div v-if="b.meta" class="conf__compsub">{{ b.meta }}</div>
            </div>
            <div class="conf__compamount">{{ money(b.amount) }}</div>
          </div>
          <hr class="conf__rule" />
          <div class="conf__total">
            <span class="conf__total-label">Total charged</span>
            <span class="conf__total-amount">{{ money(totalCharged) }}</span>
          </div>
        </template>
      </section>

      <!-- WHAT'S INCLUDED (ticketing value props) -->
      <template v-if="isTicketing && valueProps.length">
        <h2 class="conf__sectionlabel">{{ valuePropsLabel }}</h2>
        <section class="conf__card conf__valueprops">
          <div v-for="(vp, vi) in valueProps" :key="vi" class="conf__vp">
            <span class="conf__vp-icon"><q-icon :name="vp.icon" size="22px" /></span>
            <div class="conf__vp-text">
              <h4 class="conf__vp-title">{{ vp.title }}</h4>
              <p v-if="vp.text" class="conf__vp-body">{{ vp.text }}</p>
            </div>
          </div>
        </section>
      </template>

      <!-- POLICIES -->
      <section v-if="policies.length" class="conf__card conf__policies">
        <div v-for="(p, pi) in policies" :key="pi" class="conf__policyhotel">
          <h3 class="conf__policyname">{{ p.hotel }}</h3>
          <div v-for="(it, ii) in p.items || []" :key="ii" class="conf__policyitem">
            <h4 class="conf__policytitle">{{ it.title }}</h4>
            <p class="conf__policybody">{{ it.body }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.conf { background: var(--ds-color-surface-sunken); min-height: 100vh; padding: 32px 24px 64px; }
.conf__inner { max-width: 800px; margin: 0 auto; }

/* cards */
.conf__card { background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); padding: 28px 32px; margin-bottom: 20px; }
.conf__rule { border: 0; border-top: 1px solid var(--ds-color-border); margin: 20px 0; }

/* success banner */
.conf__banner { display: flex; align-items: center; gap: 18px; background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); padding: 20px 24px; margin-bottom: 24px; }
.conf__banner-check { color: var(--ds-color-text-success); display: flex; flex: none; }
.conf__banner-text { flex: 1; min-width: 0; }
.conf__banner-title { margin: 0; font-size: 1.125rem; font-weight: 800; color: var(--ds-color-text-success); }
.conf__banner-sub { margin: 2px 0 0; color: var(--ds-color-text-subtle); font-size: 0.9375rem; }
.conf__banner-cta { flex: none; height: 44px; padding: 0 20px; border: 0; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font-family: inherit; font-weight: 700; font-size: 0.9375rem; cursor: pointer; }
.conf__banner-cta:hover { background: var(--ds-palette-navy-800); }

/* section label */
.conf__sectionlabel { margin: 0 0 12px; font-size: 1.375rem; font-weight: 800; color: var(--ds-color-link); }

/* summary header */
.conf__sumhead { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.conf__contact { font-size: 1.25rem; font-weight: 800; color: var(--ds-color-text); }
.conf__bookingid { margin-top: 4px; font-weight: 700; font-size: 0.9375rem; color: var(--ds-color-text-success); }
.conf__sumhead-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; text-align: right; }
.conf__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 18px; }
.conf__action { display: inline-flex; align-items: center; gap: 6px; background: none; border: 0; padding: 0; color: var(--ds-color-link); font-family: inherit; font-weight: 700; font-size: 0.9375rem; cursor: pointer; }
.conf__action:hover { text-decoration: underline; }
.conf__release { font-size: 0.875rem; color: var(--ds-color-text-subtle); }
.conf__release strong { color: var(--ds-color-text); font-weight: 700; }

/* meta grid */
.conf__metagrid { margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: 8px 24px; }
.conf__metarow { display: contents; }
.conf__metarow dt { color: var(--ds-color-text-subtle); font-size: 0.9375rem; }
.conf__metarow dd { margin: 0; font-weight: 700; color: var(--ds-color-text); font-size: 0.9375rem; }

/* hotel block */
.conf__hotelhead { display: flex; align-items: flex-start; gap: 16px; }
.conf__thumb { width: 92px; height: 72px; flex: none; border-radius: var(--ds-radius-md); object-fit: cover; display: block; }
.conf__thumb--empty { display: flex; align-items: center; justify-content: center; background: var(--ds-palette-slate-100); color: var(--ds-color-text-subtlest); }
.conf__hotelmeta { min-width: 0; }
.conf__hotelname { margin: 0; font-size: 1.1875rem; font-weight: 800; color: var(--ds-color-text); }
.conf__stars { display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 0.875rem; font-weight: 700; color: var(--ds-color-text); }
.conf__stars .q-icon { color: var(--ds-palette-orange-500, #f59e0b); }
.conf__addr { margin-top: 4px; color: var(--ds-color-text-subtle); font-size: 0.8125rem; }

.conf__room { margin-top: 18px; }
.conf__roomtype { font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-link); }
.conf__roomnote { margin-top: 2px; color: var(--ds-color-text-subtle); font-size: 0.875rem; }
.conf__ci { margin-top: 12px; display: flex; flex-direction: column; gap: 4px; }
.conf__cirow { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; font-size: 0.9375rem; }
.conf__cirow span { color: var(--ds-color-text-subtle); }
.conf__cirow strong { color: var(--ds-color-text); font-weight: 700; }
.conf__nights { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.conf__nights li { display: grid; grid-template-columns: 1fr auto auto; align-items: baseline; gap: 16px; font-size: 0.9375rem; }
.conf__nightdate { color: var(--ds-color-text); }
.conf__nightheld { color: var(--ds-color-text); font-weight: 700; text-align: right; }
.conf__nightprice { color: var(--ds-color-text-success); font-weight: 700; min-width: 84px; text-align: right; }

/* policies */
.conf__policyhotel + .conf__policyhotel { margin-top: 24px; }
.conf__policyname { margin: 0 0 12px; font-size: 1.1875rem; font-weight: 800; color: var(--ds-color-link); }
.conf__policyitem { margin-bottom: 14px; }
.conf__policytitle { margin: 0; font-size: 0.9375rem; font-weight: 700; color: var(--ds-color-text); }
.conf__policybody { margin: 4px 0 0; color: var(--ds-color-text-subtle); font-size: 0.875rem; line-height: 1.5; }

/* banner tones (ticketing) — default/success keeps the existing look */
.conf__banner--warning .conf__banner-check,
.conf__banner--warning .conf__banner-title { color: var(--ds-color-text-warning, #b45309); }
.conf__banner--danger .conf__banner-check,
.conf__banner--danger .conf__banner-title { color: var(--ds-color-text-danger, #b91c1c); }

/* status note callout (ticketing), tinted by tone */
.conf__statusnote { display: flex; align-items: flex-start; gap: 12px; border: 1px solid; border-radius: var(--ds-radius-lg); padding: 14px 18px; margin: -8px 0 24px; }
.conf__statusnote-icon { flex: none; margin-top: 1px; }
.conf__statusnote-title { margin: 0; font-weight: 700; font-size: 0.9375rem; }
.conf__statusnote-body { margin: 2px 0 0; font-size: 0.875rem; line-height: 1.5; }
.conf__statusnote--success { background: var(--ds-color-background-info-subtle, #eff6ff); border-color: var(--ds-color-border-info, #bfdbfe); color: var(--ds-color-text-info, #1d4ed8); }
.conf__statusnote--warning { background: var(--ds-color-background-warning-subtle, #fffbeb); border-color: var(--ds-color-border-warning, #fde68a); color: var(--ds-color-text-warning, #b45309); }
.conf__statusnote--danger { background: var(--ds-color-background-danger-subtle, #fef2f2); border-color: var(--ds-color-border-danger, #fecaca); color: var(--ds-color-text-danger, #b91c1c); }
.conf__statusnote-title { color: inherit; }
.conf__statusnote-body { color: inherit; opacity: 0.92; }

/* ticketing order-component row (reuses the hotel-head visual rhythm) */
.conf__ordercomp { display: flex; align-items: center; gap: 16px; margin-top: 16px; }
.conf__ordercomp:first-of-type { margin-top: 0; }
.conf__comptile { width: 56px; height: 56px; flex: none; border-radius: var(--ds-radius-md); display: flex; align-items: center; justify-content: center; background: var(--ds-palette-slate-100); color: var(--ds-color-link); }
.conf__compmeta { flex: 1; min-width: 0; }
.conf__compname { font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-text); }
.conf__compsub { margin-top: 2px; color: var(--ds-color-text-subtle); font-size: 0.875rem; }
.conf__compamount { flex: none; font-weight: 700; font-size: 1.0625rem; color: var(--ds-color-text); }

/* total charged row */
.conf__total { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
.conf__total-label { font-size: 1.0625rem; font-weight: 800; color: var(--ds-color-text); }
.conf__total-amount { font-size: 1.25rem; font-weight: 800; color: var(--ds-color-text-success); }

/* value props (What's included) */
.conf__valueprops { display: flex; flex-direction: column; gap: 18px; }
.conf__vp { display: flex; align-items: flex-start; gap: 14px; }
.conf__vp-icon { width: 40px; height: 40px; flex: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--ds-palette-slate-100); color: var(--ds-color-link); }
.conf__vp-text { min-width: 0; }
.conf__vp-title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: var(--ds-color-text); }
.conf__vp-body { margin: 3px 0 0; color: var(--ds-color-text-subtle); font-size: 0.875rem; line-height: 1.5; }

@media (max-width: 620px) {
  .conf__sumhead-right { align-items: flex-start; text-align: left; }
  .conf__actions { justify-content: flex-start; }
}
</style>
