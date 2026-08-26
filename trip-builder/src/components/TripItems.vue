<script setup>
// TripItems — the trip, grouped and editable. The single most important surface
// in this prototype, and deliberately the only one that can change a line.
//
// It is mounted TWICE and is one component on purpose: the /trip page mounts it
// as `page`, the cart peek (TripFlyout) mounts it as `peek`. The peek came back
// in the second Aug 25 round after the first round deleted it, and the reason it
// is safe to have both surfaces is that they are not two surfaces — a line says
// the same thing, offers the same stepper and the same Remove in either frame,
// because there is only one of it. The moment a "simpler summary" component is
// written for the fly-out, the peek and the page start disagreeing about what is
// in the cart. `variant` therefore changes DENSITY ONLY: no control appears in
// one frame and not the other.
//
// IT IS ALSO, SINCE THE THIRD AUG 25 ROUND, THE ONLY PLACE A STAY IS PRICED.
// The hotel page's stay band is gone and its nights toggle and rooms stepper are
// on the stay line below — see the note above setNights(). That makes this the
// one writer for every quantity in the trip: a ticket count, an add-on count and
// now the two numbers that multiply a room rate. The hotel page reads them.
//
// WHY NOT the library's CartReview in 'ticketing' mode. It renders exactly this
// shape (typed lines, section heads, live totals) and its ticket lines are even
// quantity-editable — but nothing in it can REMOVE a line, and its quantities are
// held in a map keyed by array INDEX, which goes stale the moment an item is
// spliced out. Removal is the behaviour this prototype exists to demonstrate, so
// the body is ours; CartReview still renders the cart at checkout, where the
// trip is fixed and read-only. No library file was changed to get here.
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import QuantityStepper from '@lib/components/QuantityStepper.vue'
import DsEmptyState from '@lib/components/DsEmptyState.vue'
import {
  itemsOf, isEmpty, setQty, updateItem, removeItem, restoreItem, addMore, openStay,
} from '../store.js'
import {
  stayById, roomById, tierById, addonById, lineTotal, money,
  checkInLabel, checkOutLabel, MAX_TICKETS, MAX_NIGHTS, MAX_ROOMS,
} from '../trip.js'

const props = defineProps({
  // 'page' is the Trip screen; 'peek' is the 520px fly-out. Spacing and the stay
  // thumbnail, nothing else — see the note above.
  variant: { type: String, default: 'page' },
})

const $q = useQuasar()

// Sections are declared, not derived from what's in the cart, so "Tickets" always
// means the same thing in the same place — a trip that gains tickets grows a
// section where the guest already expected one.
const SECTIONS = [
  { kind: 'stay', title: 'Stay', icon: 'hotel', add: 'Add a hotel' },
  { kind: 'ticket', title: 'Tickets', icon: 'confirmation_number', add: 'Add tickets' },
  { kind: 'addon', title: 'Add-ons', icon: 'auto_awesome', add: 'Add an add-on' },
]
const sections = computed(() => SECTIONS.map((s) => {
  const lines = itemsOf(s.kind)
  return { ...s, lines, subtotal: lines.reduce((sum, l) => sum + lineTotal(l), 0) }
}))
const sec = (kind) => sections.value.find((s) => s.kind === kind)
// The categories not in the cart yet — offered as a quiet row under the sections
// rather than as empty section shells, which would read as three things missing
// instead of one thing bought.
const missing = computed(() => sections.value.filter((s) => !s.lines.length))

const stay = (line) => stayById(line.hotelId)
const room = (line) => roomById(line.hotelId, line.roomId)
const tier = (line) => tierById(line.tierId)
const addon = (line) => addonById(line.addonId)

// ── Nights and rooms, rehomed here (Aug 25, third round) ──
// They used to live in a band across the top of the hotel details page, which
// the stakeholder asked to remove: that screen should be the property's detail
// page and not much else. The band was the ONLY place either number could be
// set, so they moved onto the line they price rather than disappearing with it.
//
// This is where they belonged anyway. Every other line in this cart is edited in
// place — a ticket quantity, an add-on quantity — and nights and rooms are two
// more numbers on a line. Bound straight to the line like those steppers: no
// local draft, no Apply, so the line amount, the section subtotal, the trip bar
// and the checkout rail all move on the press. The hotel page now READS these
// two values to price its room cards, which makes the cart the single writer.
//
// The rejected alternative was a slimmer band back on the hotel page holding
// just these two controls — the same band with fewer fields, still a second
// place a stay is priced, still able to disagree with the cart.
const setNights = (line, n) => updateItem(line.uid, { nights: n })
const setRooms = (line, n) => updateItem(line.uid, { rooms: n })

// Removing offers an exact undo. A cart that can be edited without fear is the
// whole claim being made here, and a destructive action with no way back quietly
// contradicts it — so removeItem() hands back the line AND its position, and the
// undo puts it exactly where it was rather than appending it to the end.
function remove(line, label) {
  const removed = removeItem(line.uid)
  if (!removed) return
  $q.notify({
    message: `Removed ${label}.`,
    icon: 'undo', color: 'grey-9', position: 'bottom', timeout: 4000,
    actions: [{ label: 'Undo', color: 'white', handler: () => restoreItem(removed.item, removed.index) }],
  })
}
</script>

<template>
  <div class="ti" :class="`ti--${props.variant}`">
    <!-- Empty trip: three ways in, stated as offers rather than as an error. The
         cart being empty is a normal state on a landing-page-less flow. -->
    <ds-empty-state
      v-if="isEmpty"
      icon="add_shopping_cart"
      title="Your trip is empty"
      description="Add a hotel, tickets or an add-on — in whatever order suits you. Nothing here has to be bought together."
    >
      <template #action>
        <div class="ti__entry">
          <button v-for="s in SECTIONS" :key="s.kind" type="button" class="ti__entrybtn" @click="addMore(s.kind)">
            <q-icon :name="s.icon" size="18px" /> {{ s.add }}
          </button>
        </div>
      </template>
    </ds-empty-state>

    <template v-else>
      <!-- Three declared sections, not a loop over what happens to be in the
           cart. Each renders its own line shape, because a room, a ticket and an
           add-on are edited in genuinely different ways — one has a room type and
           a length of stay, the other two have a number. -->

      <!-- ── Stay ── -->
      <section v-if="sec('stay').lines.length" class="ti__sec">
        <header class="ti__sechead">
          <span class="ti__sectitle"><q-icon name="hotel" size="18px" /> Stay</span>
          <span class="ti__secsub">{{ money(sec('stay').subtotal) }}</span>
        </header>
        <article v-for="line in sec('stay').lines" :key="line.uid" class="ti__line">
          <img :src="stay(line).image" :alt="stay(line).name" class="ti__thumb" loading="lazy" />
          <div class="ti__body">
            <div class="ti__top">
              <h3 class="ti__name">{{ stay(line).name }}</h3>
              <span class="ti__amt">{{ money(lineTotal(line)) }}</span>
            </div>
            <p class="ti__meta">
              {{ room(line).name }} · {{ room(line).bed }} · sleeps {{ room(line).sleeps * line.rooms }}
            </p>
            <p class="ti__meta">
              {{ checkInLabel() }} → {{ checkOutLabel(line.nights) }} ·
              {{ money(room(line).rate) }}/night ×
              {{ line.nights }} night{{ line.nights === 1 ? '' : 's' }} ×
              {{ line.rooms }} room{{ line.rooms === 1 ? '' : 's' }}
            </p>

            <!-- The two quantities that price the stay, on the line they price.
                 The check-out date, the sleeps count, the arithmetic above and
                 the amount top-right all move on the press — nothing here waits
                 for a Save. -->
            <div class="ti__stay">
              <div class="ti__field">
                <span class="ti__fieldlabel">Nights</span>
                <div class="ti__nights">
                  <button
                    v-for="n in MAX_NIGHTS" :key="n" type="button"
                    class="ti__night" :class="{ 'is-on': n === line.nights }"
                    :aria-pressed="n === line.nights"
                    @click="setNights(line, n)"
                  >{{ n }}</button>
                </div>
              </div>
              <div class="ti__field">
                <span class="ti__fieldlabel">Rooms</span>
                <!-- Same stepper as the ticket and add-on lines, and `removable`
                     is off for the same reason: Remove is already on this row. -->
                <quantity-stepper
                  :model-value="line.rooms" :min="1" :max="MAX_ROOMS" size="sm"
                  @update:model-value="(n) => setRooms(line, n)"
                />
              </div>
            </div>

            <div class="ti__ctrls">
              <!-- Was "Edit stay", and it went to the hotel page to set exactly
                   the two things now sitting above it. What that page still owns
                   is the ROOM — Reserve Room on any card swaps it in place — so
                   the link is renamed to what it can actually do rather than
                   left pointing at controls that are no longer there. -->
              <button type="button" class="ti__edit" @click="openStay(line.hotelId)">
                <q-icon name="king_bed" size="16px" /> Change room
              </button>
              <button type="button" class="ti__rm" @click="remove(line, stay(line).name)">Remove</button>
            </div>
          </div>
        </article>
      </section>

      <!-- ── Tickets ── -->
      <section v-if="sec('ticket').lines.length" class="ti__sec">
        <header class="ti__sechead">
          <span class="ti__sectitle"><q-icon name="confirmation_number" size="18px" /> Tickets</span>
          <span class="ti__secsub">{{ money(sec('ticket').subtotal) }}</span>
        </header>
        <article v-for="line in sec('ticket').lines" :key="line.uid" class="ti__line">
          <span class="ti__swatch" :style="{ background: `var(${tier(line).colorVar})` }">
            <q-icon name="confirmation_number" size="20px" />
          </span>
          <div class="ti__body">
            <div class="ti__top">
              <h3 class="ti__name">{{ tier(line).name }} ticket</h3>
              <span class="ti__amt">{{ money(lineTotal(line)) }}</span>
            </div>
            <p class="ti__meta">{{ tier(line).desc }}</p>
            <p class="ti__meta">{{ money(tier(line).price) }} each · your party is seated together</p>
            <div class="ti__ctrls">
              <!-- The stepper is bound straight to the line: no local copy, no
                   Apply button, so the total moves on the press. QuantityStepper's
                   `removable` trash was left off on purpose — with an explicit
                   Remove beside it, a second delete one press away would be two
                   controls for one act. -->
              <quantity-stepper
                :model-value="line.qty" :min="1" :max="MAX_TICKETS" size="sm"
                @update:model-value="(n) => setQty(line.uid, n)"
              />
              <button type="button" class="ti__rm" @click="remove(line, `${tier(line).name} tickets`)">Remove</button>
            </div>
          </div>
        </article>
      </section>

      <!-- ── Add-ons ── -->
      <section v-if="sec('addon').lines.length" class="ti__sec">
        <header class="ti__sechead">
          <span class="ti__sectitle"><q-icon name="auto_awesome" size="18px" /> Add-ons</span>
          <span class="ti__secsub">{{ money(sec('addon').subtotal) }}</span>
        </header>
        <article v-for="line in sec('addon').lines" :key="line.uid" class="ti__line">
          <span class="ti__swatch ti__swatch--addon"><q-icon :name="addon(line).icon" size="20px" /></span>
          <div class="ti__body">
            <div class="ti__top">
              <h3 class="ti__name">{{ addon(line).name }}</h3>
              <span class="ti__amt">{{ money(lineTotal(line)) }}</span>
            </div>
            <p class="ti__meta">{{ money(addon(line).price) }} per {{ addon(line).per }} · {{ line.qty }} {{ addon(line).unit }}{{ line.qty === 1 ? '' : 's' }}</p>
            <div class="ti__ctrls">
              <quantity-stepper
                :model-value="line.qty" :min="1" :max="addon(line).max" size="sm"
                @update:model-value="(n) => setQty(line.uid, n)"
              />
              <button type="button" class="ti__rm" @click="remove(line, addon(line).name)">Remove</button>
            </div>
          </div>
        </article>
      </section>

      <!-- What isn't in the trip yet. A single-item trip is a finished trip, so
           this is an offer at the bottom of the list, not a checklist of gaps. -->
      <div v-if="missing.length" class="ti__more">
        <span class="ti__morelabel">Add to this trip</span>
        <button v-for="s in missing" :key="s.kind" type="button" class="ti__morebtn" @click="addMore(s.kind)">
          <q-icon :name="s.icon" size="16px" /> {{ s.add }}
        </button>
      </div>

    </template>
  </div>
</template>

<style scoped>
.ti { display: flex; flex-direction: column; gap: 22px; font-family: var(--ds-font-family); }

.ti__sec { display: flex; flex-direction: column; gap: 10px; }
.ti__sechead { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.ti__sectitle { display: inline-flex; align-items: center; gap: 8px; font-size: .8125rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.ti__secsub { font-size: .875rem; font-weight: 700; color: var(--ds-color-text-subtle); }

.ti__line { display: flex; gap: 14px; padding: 14px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg, 12px); background: var(--ds-color-surface); }
.ti__thumb { width: 86px; height: 86px; flex: none; object-fit: cover; border-radius: var(--ds-radius-md, 8px); background: var(--ds-palette-slate-100); }
.ti__swatch { width: 44px; height: 44px; flex: none; display: flex; align-items: center; justify-content: center; border-radius: var(--ds-radius-md, 8px); background: var(--ds-palette-slate-500); color: #fff; }
.ti__swatch--addon { background: var(--ds-palette-slate-100, #f1f2f4); color: var(--ds-color-text); }

.ti__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.ti__top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.ti__name { margin: 0; font-size: 1rem; font-weight: 700; color: var(--ds-color-text); }
.ti__amt { font-size: 1rem; font-weight: 700; color: var(--ds-color-text); white-space: nowrap; }
.ti__meta { margin: 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }

/* Nights + rooms, on the stay line. Laid out as two labelled fields rather than
   as bare controls: unlabelled, a 1·2·3 group and a stepper sitting side by side
   read as one ambiguous quantity. */
.ti__stay { display: flex; align-items: flex-end; gap: 18px; flex-wrap: wrap; margin-top: 10px; }
.ti__field { display: flex; flex-direction: column; gap: 5px; }
.ti__fieldlabel { font-size: .6875rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.ti__nights { display: flex; gap: 6px; }
.ti__night { width: 34px; height: 32px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-surface); font: inherit; font-size: .875rem; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }
.ti__night:hover { background: var(--ds-palette-slate-100, #f1f2f4); }
.ti__night.is-on { background: var(--ds-color-background-brand-bold, #01113E); border-color: var(--ds-color-background-brand-bold, #01113E); color: #fff; }

.ti__ctrls { display: flex; align-items: center; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
.ti__edit { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-surface); font: inherit; font-size: .875rem; font-weight: 600; color: var(--ds-color-text); cursor: pointer; }
.ti__edit:hover { background: var(--ds-palette-slate-100, #f1f2f4); }
.ti__rm { appearance: none; padding: 0; border: 0; background: none; font: inherit; font-size: .875rem; font-weight: 600; color: var(--ds-color-text-subtle); text-decoration: underline; cursor: pointer; }
.ti__rm:hover { color: var(--ds-color-text-danger, #b3261e); }

/* Empty state + "add to this trip" — the same three offers, in two registers. */
.ti__entry { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.ti__entrybtn { display: inline-flex; align-items: center; gap: 8px; height: 42px; padding: 0 18px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-surface); font: inherit; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }
.ti__entrybtn:hover { background: var(--ds-palette-slate-100, #f1f2f4); }

.ti__more { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding-top: 4px; }
.ti__morelabel { font-size: .8125rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.ti__morebtn { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px; border: 1px dashed var(--ds-color-border-bold); border-radius: 999px; background: none; font: inherit; font-size: .875rem; font-weight: 600; color: var(--ds-color-text); cursor: pointer; }
.ti__morebtn:hover { background: var(--ds-palette-slate-100, #f1f2f4); }

/* The peek is 520px wide with a price footer under it, so it buys its room back
   from the gaps and the stay thumbnail — never from a control. */
.ti--peek { gap: 18px; }
.ti--peek .ti__line { padding: 12px; gap: 12px; }
.ti--peek .ti__thumb { width: 64px; height: 64px; }
.ti--peek .ti__name { font-size: .9375rem; }
/* Density only, as everywhere else in this file: the nights group and the rooms
   stepper are BOTH present in the peek, because a stay that can only be
   re-timed on one of the two surfaces is exactly the drift this component
   exists to prevent. */
.ti--peek .ti__stay { gap: 14px; margin-top: 8px; }

</style>
