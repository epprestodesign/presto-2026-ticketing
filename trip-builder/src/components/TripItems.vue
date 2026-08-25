<script setup>
// TripItems — the trip, grouped and editable. The single most important surface
// in this prototype, and deliberately the only one that can change a line.
//
// It is mounted TWICE with different chrome: inside TripFlyout (the slide-over
// reachable from every screen) and on the Trip screen (the full page). That
// mirrors how the library shares CartReview between CartFlyout and CheckoutPage —
// one body, two frames — and it means the fly-out is not a read-only preview of
// the cart. Whatever you can do on the trip page you can do without leaving the
// tickets screen.
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
  trip, itemsOf, isEmpty, setQty, removeItem, restoreItem, addMore, nav,
} from '../store.js'
import {
  stayById, roomById, tierById, addonById, lineTotal, money,
  checkInLabel, checkOutLabel, MAX_TICKETS,
} from '../trip.js'

const props = defineProps({
  // 'panel' is the fly-out's tighter frame; 'page' is the Trip screen.
  variant: { type: String, default: 'page' },
})
const emit = defineEmits(['edit-stay'])
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
            <p class="ti__meta">{{ room(line).name }} · {{ room(line).bed }} · sleeps {{ room(line).sleeps }}</p>
            <p class="ti__meta">
              {{ checkInLabel() }} → {{ checkOutLabel(line.nights) }} ·
              {{ line.nights }} night{{ line.nights === 1 ? '' : 's' }} ·
              {{ line.rooms }} room{{ line.rooms === 1 ? '' : 's' }} ·
              {{ money(room(line).rate) }}/night
            </p>
            <div class="ti__ctrls">
              <button type="button" class="ti__edit" @click="emit('edit-stay', line)">
                <q-icon name="edit" size="16px" /> Edit stay
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

      <p v-if="props.variant === 'panel'" class="ti__hint">
        Everything here can be changed or removed on its own — the rest of the trip stays put.
      </p>
      <button v-if="props.variant === 'panel' && trip.screen !== 'trip'" type="button" class="ti__full" @click="nav('trip')">
        Open the full trip <q-icon name="arrow_forward" size="16px" />
      </button>
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

.ti__hint { margin: 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.ti__full { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 40px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-surface); font: inherit; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }
.ti__full:hover { background: var(--ds-palette-slate-100, #f1f2f4); }

/* The fly-out is 500px wide — the stay thumbnail is the first thing to go. */
.ti--panel .ti__thumb { width: 64px; height: 64px; }
</style>
