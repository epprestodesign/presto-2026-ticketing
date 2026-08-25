<script setup>
// Stage 3 — Destination add-ons. The step that makes this flow an ORLANDO trip
// rather than a hotel booking that happens to be in Orlando.
//
// Three decisions worth stating, because they are what stops an add-on step from
// turning into the airline-checkout upsell wall everyone hates:
//
//   • IT IS SKIPPABLE FROM THE TOP, not just the bottom. "Continue without
//     add-ons" sits in the rail beside the total from the moment the screen
//     loads. Nothing here is required, and burying the exit under six cards you
//     must scroll past is how you make people resent the offer.
//
//   • NOTHING IS PRE-SELECTED. The rail starts at $0 and stays there until the
//     guest adds something (see store.js — tickets are seeded, add-ons never are).
//
//   • THE PARTY SIZE IS THE QUANTITY, AND IT IS ON THIS PAGE. Every card is a
//     plain Add / Added toggle now; how many is decided once, by the party size
//     chosen for the room, and changing it here re-prices all six cards, the
//     rail, the nav cart and the checkout in the same tick. The party control is
//     repeated on this screen rather than left behind on Tickets because it is
//     the only quantity control the guest has left — sending them back a screen
//     to change a number that re-prices the page in front of them would be the
//     lock costing them something instead of saving them something.
//
//   • THE SCHEDULE IS THE ORGANISING FACT. Each card says which day it fits
//     against the competition schedule, and the header says out loud that a
//     Saturday park day is not available to a family whose athlete competes
//     Saturday. An add-on step that ignores the reason the guest is in town will
//     sell them something they cannot use.
//
// The cart line lands in the same ticketing cart the room and passes are in, so
// what the guest adds here is visible in the nav cart fly-out immediately.
import { computed } from 'vue'
import { ADD_ONS, addOnLines, addOnCount, addOnSubtotal } from '../addons.js'
import { COMP_DAYS } from '../event.js'
import { journey, toggleAddOn, addOnOn, clearAddOns, setGuests, nav } from '../store.js'
import AddOnCard from '../components/AddOnCard.vue'
import PartySizeField from '../components/PartySizeField.vue'

const lines = computed(() => addOnLines(journey.addOns))
const count = computed(() => addOnCount(journey.addOns))
const subtotal = computed(() => addOnSubtotal(journey.addOns))
const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

// "Continue without add-ons" clears anything already added — the guest is saying
// they don't want extras, and silently carrying a $556 park purchase past that
// sentence would be indefensible.
function continueWithout() {
  clearAddOns()
  nav('checkout')
}
</script>

<template>
  <div class="ao">
    <div class="ao__inner">
      <header class="ao__head">
        <p class="ao__eyebrow"><q-icon name="place" size="16px" /> While you're in Orlando</p>
        <h1 class="ao__h1">Add anything else to the same trip</h1>
        <p class="ao__sub">
          All optional, all on the same order and the same payment. Competition runs
          {{ COMP_DAYS[0].label }} through {{ COMP_DAYS[2].label }}, so each card says
          which day it actually fits — most families take a park day on the Monday after awards.
        </p>
      </header>

      <div class="ao__grid">
        <div class="ao__main">
          <party-size-field
            :guests="journey.guests"
            note="Every add-on below is priced for this many people — change it once and the whole trip re-prices."
            @update:guests="setGuests"
          />

          <div class="ao__cards">
            <add-on-card
              v-for="a in ADD_ONS" :key="a.id"
              :add-on="a" :guests="journey.guests" :selected="addOnOn(a.id)"
              @toggle="toggleAddOn(a.id)"
            />
          </div>
        </div>

        <aside class="ao__rail">
          <h3 class="ao__rail-h">Add-ons</h3>
          <div v-if="lines.length" class="ao__lines">
            <div v-for="l in lines" :key="l.id" class="ao__line">
              <span class="ao__line-name">{{ l.qty }} × {{ l.name }}</span>
              <span class="ao__line-amt">{{ money(l.amount) }}</span>
            </div>
            <div class="ao__rule" />
            <div class="ao__line ao__line--total">
              <span>{{ count }} added</span>
              <span>{{ money(subtotal) }}</span>
            </div>
          </div>
          <p v-else class="ao__empty">
            Nothing added. Your room and passes are already in the cart — this step is entirely optional.
          </p>

          <button type="button" class="ao__cta" @click="nav('checkout')">
            Review your itinerary <q-icon name="arrow_forward" size="18px" />
          </button>
          <button type="button" class="ao__skip" @click="continueWithout">Continue without add-ons</button>
          <p class="ao__note"><q-icon name="event_available" size="14px" /> Add-ons can be cancelled up to 72 hours before their date.</p>
        </aside>
      </div>

      <p class="ao__foot">
        Prototype pricing. Attraction names are used illustratively; nothing here is a quoted rate.
      </p>
    </div>
  </div>
</template>

<style scoped>
.ao { display: flex; flex-direction: column; flex: 1; background: var(--ds-palette-slate-50, #f8fafc); }
.ao__inner { width: 100%; max-width: 1180px; margin-inline: auto; padding: 28px 24px 56px; }

.ao__head { margin-bottom: 22px; }
.ao__eyebrow { display: flex; align-items: center; gap: 6px; margin: 0 0 6px; font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ds-color-text-subtle); }
.ao__h1 { margin: 0; font-size: 1.75rem; font-weight: 800; color: var(--ds-color-text); }
.ao__sub { margin: 8px 0 0; max-width: 74ch; color: var(--ds-color-text-subtle); }

.ao__grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 32px; align-items: start; }
.ao__main { min-width: 0; display: flex; flex-direction: column; gap: 18px; }
/* Two columns of cards, not three: each card carries an inclusion list, and a
   three-up track squeezes those lists into a shape you skim past. */
.ao__cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; align-items: stretch; }

.ao__rail { position: sticky; top: 16px; background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); padding: 18px; display: flex; flex-direction: column; gap: 12px; }
.ao__rail-h { margin: 0; font-size: 1.0625rem; font-weight: 800; color: var(--ds-color-text); }
.ao__lines { display: flex; flex-direction: column; gap: 8px; }
.ao__line { display: flex; justify-content: space-between; gap: 12px; font-size: 0.9375rem; color: var(--ds-color-text); }
.ao__line-name { color: var(--ds-color-text-subtle); }
.ao__line-amt { font-variant-numeric: tabular-nums; }
.ao__rule { height: 1px; background: var(--ds-color-border); }
.ao__line--total { font-weight: 800; }
.ao__empty { margin: 0; font-size: 0.875rem; color: var(--ds-color-text-subtle); }

.ao__cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 48px; border: 0; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.ao__skip { width: 100%; height: 42px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button); background: var(--ds-color-surface); color: var(--ds-color-text); font: inherit; font-weight: 700; cursor: pointer; }
.ao__skip:hover { background: var(--ds-palette-slate-100); }
.ao__note { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }

.ao__foot { margin: 26px 0 0; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }

@media (max-width: 1080px) { .ao__cards { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 980px) {
  .ao__grid { grid-template-columns: 1fr; }
  .ao__rail { position: static; }
}
</style>
