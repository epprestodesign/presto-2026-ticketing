<script setup>
// Screen 3 — CUSTOMIZE. The screen this prototype exists for.
//
// The guest arrives holding a package somebody else assembled. This screen takes
// it apart into the five things it is made of — how many people, which ticket
// level, which hotel, which room in it, which extras — and lets each be changed
// against a total that moves as they do.
//
// --- Layout: one column of choices, one rail of consequences -----------------
// Every axis is on ONE page rather than a wizard of steps. A wizard is the right
// shape when each answer narrows the next question; here the axes are
// independent, and the interesting comparisons run across them (is the room
// upgrade worth more than the ticket upgrade?). Stepping through them would hide
// exactly the comparison the screen is for.
//
// The price rail is sticky and carries the full itemisation — see PriceRail for
// why the breakdown is on the page rather than behind a "price details" link.
//
// --- Nothing above the heading (Aug 25) --------------------------------------
// This screen used to open with two bands of chrome before a word of its own: the
// shell's Package · Customize · Review stepper, and a full-bleed navy event strip
// repeating the game, the venue and the dates. The review removed both — "I don't
// like this review thing at the top", "I don't love that... it's a little
// confusing. We have this other thing on the side here", "once I get here, I don't
// think I need this at the top. I think I should just be here confirming."
//
// The judgement underneath the quotes is that both bands were answering questions
// the rail already answers, and answering them louder. The rail names the package,
// dates it, itemises it and prices it, permanently, beside the controls; the strip
// restated the dates in reverse video, and the stepper narrated a position the
// heading and the back link already give. Two orientations for the same thing is
// how a screen becomes "a little confusing".
//
// The strip cost more than duplication. It was the highest-contrast element on the
// page — a full-width block of navy — which meant the loudest thing on a screen
// whose job is a decision was a restatement of facts the guest had already
// accepted. Removing it is half of why the checkout CTA now reads as primary: it
// is the only filled navy surface left. See CheckoutCta.
//
// The event strip is KEPT on the browse screen. That is the landing page, where a
// guest may genuinely not know which game this is; by the time they are here they
// have opened a package and read its detail page, and the question has been
// answered twice. (The stepper, by contrast, went from the whole prototype — see
// App.vue for why removing it from this screen alone would have been worse.)
//
// --- One action, stated twice, identically -----------------------------------
// The CTA is at the foot of the rail and at the foot of the review card, and the
// two are the same component so they cannot drift into looking like two different
// actions. Below 1080px the rail stops being a rail, so a fixed bar carries the
// total and the same action for as long as the guest is on this screen — that
// viewport is exactly the one where "I might not see it" was true, because the
// only copy of the CTA was at the bottom of a very long scroll.
//
// --- Every alternative is priced ---------------------------------------------
// Each row shows what selecting it would do to the PACKAGE TOTAL, computed by
// pricing a hypothetical configuration through the same `priceConfiguration()`
// the rail uses. Nothing here reimplements the arithmetic, so a row can never
// promise a delta the rail then contradicts.
//
// That is also why the hotel rows call `withHotel()` rather than spreading
// `{ hotelId }` themselves: changing hotel also moves the room, and the preview
// has to make the same move the click will.
import { computed, ref } from 'vue'
import DsCard from '@lib/components/DsCard.vue'
import QuantityStepper from '@lib/components/QuantityStepper.vue'
import OptionRow from '../components/OptionRow.vue'
import PriceRail from '../components/PriceRail.vue'
import CheckoutCta from '../components/CheckoutCta.vue'
import {
  journey, priced, basePackage, isCustomized, changesFromPreset, MAX_PEOPLE,
  setGuests, setTier, setHotel, setRoom, setTransport, toggleExtra, resetConfig,
  withHotel, withTransport, withExtra, openHotelInNewTab, checkout, nav,
} from '../store.js'
import {
  TIERS, HOTELS, roomsFor, priceConfiguration,
  TRANSPORT_OPTIONS, ADDON_OPTIONS, STAY_SHORT,
} from '../packages.js'

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

// The extras catalogue stores a unit KEY; the rows need the words. Kept here
// rather than in the catalogue so the data stays about money and the screen stays
// about language. (`priceConfiguration()` attaches the same labels to the extras
// it prices — this is for options that aren't in the configuration yet.)
const UNIT_WORDS = { person: 'per person', room: 'per room', 'person-night': 'per person, per night', stay: 'per booking' }
const unitWords = (e) => UNIT_WORDS[e.unit] || ''

// The change to what the guest pays, for a hypothetical configuration.
const deltaFor = (cfg) => priceConfiguration(cfg).packagePrice - priced.value.packagePrice

// --- Party -------------------------------------------------------------------
// What the current party size bought, stated under the control that decides it.
// Room count is derived from occupancy, so it is the one number that moves for a
// reason the guest didn't type.
const partyEffect = computed(() => {
  const p = priced.value
  return `${p.guests} ticket${p.guests === 1 ? '' : 's'} · ${p.rooms} × ${p.room.name} for ${p.nights} nights`
})

// --- Tickets -----------------------------------------------------------------
const tierRows = computed(() =>
  TIERS.map((t) => ({
    ...t,
    selected: t.id === journey.config.tierId,
    price: `${money(t.price)} per ticket`,
    delta: deltaFor({ ...journey.config, tierId: t.id }),
  }))
)

// --- Hotel -------------------------------------------------------------------
const hotelRows = computed(() =>
  HOTELS.map((h) => {
    const cheapest = Math.min(...h.rooms.map((r) => h.nightlyRate + r.deltaPerNight))
    return {
      ...h,
      selected: h.id === journey.config.hotelId,
      price: `from ${money(cheapest)} / night`,
      meta: [`${h.rating} ★`, `${h.distanceMi} mi from the stadium`, `${h.rooms.length} room types`],
      delta: deltaFor(withHotel(journey.config, h.id)),
    }
  })
)

// --- Room, within the chosen hotel -------------------------------------------
const rooms = computed(() =>
  roomsFor(journey.config.hotelId).map((r) => {
    const hotel = HOTELS.find((h) => h.id === journey.config.hotelId)
    const roomsNeeded = Math.ceil(priced.value.guests / r.sleeps)
    return {
      ...r,
      selected: r.id === journey.config.roomId,
      price: r.deltaPerNight
        ? `${money(hotel.nightlyRate + r.deltaPerNight)} / night`
        : `${money(hotel.nightlyRate)} / night · base rate`,
      // Room count belongs on the room row, not only in the rail: it is the
      // reason a bigger room can come out cheaper, and that is counter-intuitive
      // enough to need saying where the choice is made.
      meta: [r.bed, `sleeps ${r.sleeps}`, `${r.sqft} sq ft`, r.view, `${roomsNeeded} room${roomsNeeded === 1 ? '' : 's'} for your party`],
      delta: deltaFor({ ...journey.config, roomId: r.id }),
      disabled: r.roomsLeft < roomsNeeded,
      badge: r.roomsLeft <= 3 ? `only ${r.roomsLeft} left` : '',
    }
  })
)

// --- Extras ------------------------------------------------------------------
const transportRows = computed(() =>
  TRANSPORT_OPTIONS.map((e) => ({
    ...e,
    selected: journey.config.extraIds.includes(e.id),
    price: e.price ? `${money(e.price)} ${unitWords(e)}`.trim() : 'No cost',
    delta: deltaFor(withTransport(journey.config, e.id)),
  }))
)
const addonRows = computed(() =>
  ADDON_OPTIONS.map((e) => ({
    ...e,
    selected: journey.config.extraIds.includes(e.id),
    price: money(e.price),
    delta: deltaFor(withExtra(journey.config, e.id)),
  }))
)

// --- Review ------------------------------------------------------------------
// The final restatement, in contents rather than money — the rail already owns
// the money. Together they answer the two questions a guest has before paying:
// what am I getting, and what does it cost.
const summaryRows = computed(() => {
  const p = priced.value
  return [
    { label: 'Tickets', value: `${p.guests} × ${p.tier.name}`, note: p.tier.desc },
    { label: 'Hotel', value: `${p.hotel.name} · ${STAY_SHORT}`, note: `${p.rooms} × ${p.room.name} · ${p.room.bed}` },
    ...p.extras.map((e) => ({
      label: e.group === 'transport' ? 'Getting there' : 'Extra',
      value: e.label,
      note: e.price ? `${e.qty} × ${money(e.price)} ${e.unitLabel}` : 'No cost',
    })),
  ]
})

const showChanges = ref(true)
</script>

<template>
<div class="cst">
  <div class="cst__inner">
    <header class="cst__head">
      <button type="button" class="cst__back" @click="nav('packageDetails')">
        <q-icon name="arrow_back" size="17px" /> Back to {{ basePackage.name }}
      </button>
      <h1 class="cst__title">Customize your package</h1>
      <p class="cst__sub">
        You started from <strong>{{ basePackage.name }}</strong> — {{ basePackage.tagline }}
        Swap the ticket level, move hotels, change the room, and add or drop extras.
        Nothing is locked except the dates: your party is invited for {{ STAY_SHORT }}.
      </p>
    </header>

    <div class="cst__cols">
      <div class="cst__main">
        <!-- 1 · Party ----------------------------------------------------- -->
        <ds-card class="cst__sec" tag="section">
          <h2 class="cst__sech">Your party</h2>
          <p class="cst__secsub">Tickets are per person; rooms follow the occupancy of the room you pick.</p>
          <div class="cst__party">
            <quantity-stepper
              :model-value="priced.guests" :min="1" :max="MAX_PEOPLE"
              @update:model-value="setGuests"
            />
            <span class="cst__partyeffect">{{ partyEffect }}</span>
          </div>
        </ds-card>

        <!-- 2 · Ticket level ---------------------------------------------- -->
        <ds-card class="cst__sec" tag="section">
          <h2 class="cst__sech">Ticket level</h2>
          <p class="cst__secsub">
            Upgrade or downgrade the whole party — everyone sits together in one block.
          </p>
          <div class="cst__rows" role="radiogroup" aria-label="Ticket level">
            <option-row
              v-for="t in tierRows" :key="t.id"
              :selected="t.selected" :title="t.name" :subtitle="t.desc"
              :meta="t.perks" :price="t.price" :delta="t.delta"
              @toggle="setTier(t.id)"
            />
          </div>
        </ds-card>

        <!-- 3 · Hotel ------------------------------------------------------ -->
        <ds-card class="cst__sec" tag="section">
          <h2 class="cst__sech">Hotel</h2>
          <p class="cst__secsub">
            Three properties in the EventPipe block.
            <button type="button" class="cst__link" @click="openHotelInNewTab(journey.config.hotelId)">
              Open {{ priced.hotel.name }} in a new tab<q-icon name="open_in_new" size="13px" />
            </button>
          </p>
          <div class="cst__rows" role="radiogroup" aria-label="Hotel">
            <option-row
              v-for="h in hotelRows" :key="h.id"
              :selected="h.selected" :title="h.name" :subtitle="h.blurb"
              :meta="h.meta" :price="h.price" :delta="h.delta"
              @toggle="setHotel(h.id)"
            />
          </div>
        </ds-card>

        <!-- 4 · Room ------------------------------------------------------- -->
        <ds-card class="cst__sec" tag="section">
          <h2 class="cst__sech">Room type at {{ priced.hotel.name }}</h2>
          <p class="cst__secsub">
            A room that sleeps more can cost less overall — it takes fewer of them to hold your party.
          </p>
          <div class="cst__rows" role="radiogroup" aria-label="Room type">
            <option-row
              v-for="r in rooms" :key="r.id"
              :selected="r.selected" :title="r.name" :meta="r.meta"
              :price="r.price" :delta="r.delta" :badge="r.badge" :disabled="r.disabled"
              @toggle="setRoom(r.id)"
            />
          </div>
        </ds-card>

        <!-- 5 · Extras ----------------------------------------------------- -->
        <ds-card class="cst__sec" tag="section">
          <h2 class="cst__sech">Getting there</h2>
          <p class="cst__secsub">One answer, because a coach seat and a parking space are the same decision.</p>
          <div class="cst__rows" role="radiogroup" aria-label="Getting there">
            <option-row
              v-for="e in transportRows" :key="e.id"
              :selected="e.selected" :icon="e.icon" :title="e.label" :subtitle="e.note"
              :price="e.price" :delta="e.delta"
              @toggle="setTransport(e.id)"
            />
          </div>

          <h2 class="cst__sech cst__sech--second">Add to your package</h2>
          <p class="cst__secsub">Add or drop any of these; each one prices itself against your party.</p>
          <div class="cst__rows">
            <option-row
              v-for="e in addonRows" :key="e.id" mode="check"
              :selected="e.selected" :icon="e.icon" :title="e.label" :subtitle="e.note"
              :price="`${e.price} ${unitWords(e)}`" :delta="e.delta"
              @toggle="toggleExtra(e.id)"
            />
          </div>
        </ds-card>

        <!-- 6 · Review ----------------------------------------------------- -->
        <ds-card class="cst__sec cst__sec--review" tag="section">
          <h2 class="cst__sech">Package summary</h2>
          <p class="cst__secsub">What you'd be booking, as it stands.</p>

          <dl class="cst__sum">
            <div v-for="(row, i) in summaryRows" :key="`${row.label}-${i}`" class="cst__sumrow">
              <dt>{{ row.label }}</dt>
              <dd>
                <strong>{{ row.value }}</strong>
                <small>{{ row.note }}</small>
              </dd>
            </div>
          </dl>

          <!-- Named packages are how the guest got here, so a package that no
               longer matches its name should say so BEFORE checkout does. -->
          <div v-if="isCustomized" class="cst__changes">
            <button type="button" class="cst__changetoggle" @click="showChanges = !showChanges">
              <q-icon :name="showChanges ? 'expand_less' : 'expand_more'" size="18px" />
              {{ changesFromPreset.length }} change{{ changesFromPreset.length === 1 ? '' : 's' }} from {{ basePackage.name }}
            </button>
            <ul v-if="showChanges" class="cst__changelist">
              <li v-for="c in changesFromPreset" :key="c"><q-icon name="edit" size="14px" />{{ c }}</li>
            </ul>
            <button type="button" class="cst__link cst__link--block" @click="resetConfig">
              Reset to the original package
            </button>
          </div>
          <p v-else class="cst__unchanged">
            <q-icon name="check_circle" size="17px" />
            This is {{ basePackage.name }} exactly as it was built.
          </p>

          <checkout-cta class="cst__cta" :total="priced.packagePrice" @click="checkout" />
        </ds-card>
      </div>

      <aside class="cst__rail">
        <price-rail
          :priced="priced" :package-name="basePackage.name" :customized="isCustomized"
          @continue="checkout" @reset="resetConfig"
        />
      </aside>
    </div>
  </div>

  <!-- Below 1080px only, where the rail has dropped out of view. It is a bar,
       not an overlay: it never covers anything (the page reserves its height in
       padding) and it never interrupts. -->
  <div class="cst__bar">
    <div class="cst__barinner">
      <span class="cst__barprice">
        <strong>{{ money(priced.packagePrice) }}</strong>
        <small>package total · {{ priced.guests }} {{ priced.guests === 1 ? 'person' : 'people' }}</small>
      </span>
      <checkout-cta class="cst__barcta" compact :total="priced.packagePrice" @click="checkout" />
    </div>
  </div>
</div>
</template>

<style scoped>
.cst { display: flex; flex-direction: column; flex: 1; }
.cst__inner { width: 100%; max-width: min(1280px, 92%); margin: 0 auto; padding: 22px 0 64px; }

.cst__head { margin-bottom: 20px; }
.cst__back { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 10px; padding: 0; border: 0; background: none; font: inherit; font-weight: 700; color: var(--ds-color-link, #1b4ed8); cursor: pointer; }
.cst__title { margin: 0; font-size: 1.75rem; font-weight: 800; color: var(--ds-color-text); }
.cst__sub { margin: 6px 0 0; max-width: 74ch; color: var(--ds-color-text-subtle); }

/* The choices take the room; the rail is fixed-width so the price never reflows
   under a long hotel name. */
.cst__cols { display: grid; grid-template-columns: minmax(0, 1fr) 370px; gap: 26px; align-items: start; }
.cst__main { display: flex; flex-direction: column; gap: 18px; min-width: 0; }

.cst__sec { display: block; }
.cst__sech { margin: 0; font-size: 1.125rem; font-weight: 800; color: var(--ds-color-text); }
.cst__sech--second { margin-top: 26px; padding-top: 22px; border-top: 1px solid var(--ds-color-border); }
.cst__secsub { margin: 4px 0 14px; font-size: .9375rem; color: var(--ds-color-text-subtle); }

.cst__link { display: inline-flex; align-items: center; gap: 4px; padding: 0; border: 0; background: none; font: inherit; font-weight: 600; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }
.cst__link--block { display: block; margin-top: 12px; }

.cst__party { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.cst__partyeffect { font-size: .9375rem; color: var(--ds-color-text-subtle); }

.cst__rows { display: flex; flex-direction: column; }

/* --- Review ---------------------------------------------------------------- */
.cst__sum { margin: 0; display: flex; flex-direction: column; gap: 12px; }
.cst__sumrow { display: flex; align-items: baseline; gap: 18px; }
.cst__sumrow dt { flex: none; width: 120px; font-size: .75rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.cst__sumrow dd { margin: 0; display: flex; flex-direction: column; min-width: 0; }
.cst__sumrow dd strong { font-weight: 700; color: var(--ds-color-text); }
.cst__sumrow dd small { font-size: .8125rem; color: var(--ds-color-text-subtle); }

.cst__changes { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--ds-color-border); }
.cst__changetoggle { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; font: inherit; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }
.cst__changelist { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
.cst__changelist li { display: flex; align-items: center; gap: 8px; font-size: .875rem; color: var(--ds-color-text-subtle); }
.cst__unchanged { display: flex; align-items: center; gap: 8px; margin: 18px 0 0; padding-top: 16px; border-top: 1px solid var(--ds-color-border); font-size: .875rem; color: var(--ds-color-text-subtle); }
.cst__unchanged .q-icon { color: var(--ds-color-text-success, #167a4a); }

.cst__cta { margin-top: 20px; }

/* --- The narrow-viewport action bar ---------------------------------------- */
/* Hidden by default: on desktop the rail is sticky and its CTA is on screen the
   whole time, so a second permanent copy would be clutter with nothing to fix. */
.cst__bar { display: none; }

/* Under 1080px the rail can't hold its width beside the choices, so it stops
   being a rail: it drops below the review card, where the guest has just read
   the contents and the price is the next thing they want.
   That is also where "if I didn't know to look for this, I might not see it"
   was literally true — the CTA was then reachable only at the end of a very long
   scroll — so this is the viewport that gets the fixed bar. */
@media (max-width: 1080px) {
  .cst__cols { grid-template-columns: minmax(0, 1fr); }
  .cst__rail :deep(.prail) { position: static; }

  /* Fixed rather than sticky: `position: sticky; bottom: 0` releases as soon as
     its container's end scrolls into view, which is precisely the bottom of this
     page — the bar would let go a screen before the guest finished reading. */
  .cst__bar { display: block; position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; background: var(--ds-color-surface, #fff); border-top: 1px solid var(--ds-color-border); box-shadow: 0 -6px 20px rgba(0, 0, 0, .10); }
  .cst__barinner { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: min(1280px, 92%); margin: 0 auto; padding: 10px 0; }
  .cst__barprice { display: flex; flex-direction: column; min-width: 0; }
  .cst__barprice strong { font-size: 1.25rem; font-weight: 800; line-height: 1.15; color: var(--ds-color-text); font-variant-numeric: tabular-nums; }
  .cst__barprice small { font-size: .75rem; color: var(--ds-color-text-subtle); }
  .cst__barcta { flex: 0 0 auto; }

  /* The bar reserves its own room rather than floating over the last card. */
  .cst__inner { padding-bottom: 108px; }
}

@media (max-width: 480px) {
  .cst__barprice small { display: none; }
}
</style>
