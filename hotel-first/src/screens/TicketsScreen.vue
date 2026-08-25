<script setup>
// Stage 2 — Tournament admission.
//
// This is the first screen that is allowed to leave the booking site's visual
// grammar, and it uses that room for one structural change: the passes are laid
// against the COMPETITION SCHEDULE. A ticketing UI normally sells a place (which
// section, which row); a tournament sells a day, and a family that buys the wrong
// day misses the only two minutes their athlete is on the mat. So the schedule is
// on the page beside the passes, not buried in a description.
//
// The second structural change is quantity. A tier is now IN or OUT: the party
// size chosen for the room decides how many, and no row carries a stepper. If
// you select two people, every line on this page says two — see TicketTierCard,
// which is the library's TicketCategoryCard grammar with its stepper removed
// (the library card can't do that, and the library is read-only here).
//
// Skipping is a first-class path. Hotel-first means the room can be the whole
// purchase: plenty of grandparents book a bed and watch the livestream.
import { computed } from 'vue'
import TicketTierCard from '../components/TicketTierCard.vue'
import PartySizeField from '../components/PartySizeField.vue'
import epLogoWhite from '@lib/assets/eventpipe logos/eventpipe-logo-fff.svg'
import heroBg from '../../../background-img/defaultBackgroundImage.png'
import { EVENT, COMP_DAYS } from '../event.js'
import { ticketCategories, ticketLines, ticketCount, ticketSubtotal } from '../tickets.js'
import { journey, activeHotel, setGuests, toggleTicket, ticketOn, nav } from '../store.js'

const heroStyle = { backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(${heroBg})` }

const categories = computed(() => ticketCategories())
const lines = computed(() => ticketLines(journey.tickets))
const count = computed(() => ticketCount(journey.tickets))
const subtotal = computed(() => ticketSubtotal(journey.tickets))

const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

// The party size is the same number the room was booked for, so it is shown here
// rather than asked again. Changing it now re-prices EVERY selected line at once
// — passes here, and the Orlando add-ons a screen later — because a party of two
// that has to correct six separate quantities is a party of two that will get
// one of them wrong. `setGuests` does the whole re-derive (see store.js).

// Skipping clears any seeded pass — a cart that still holds four weekend passes
// after the guest said "just the room" is the prototype not listening.
function skipTickets() {
  journey.tickets = {}
  nav('addons')
}
</script>

<template>
  <div class="tix">
    <section class="tix__hero" :style="heroStyle">
      <div class="tix__hero-inner">
        <img :src="epLogoWhite" alt="EventPipe" class="tix__hero-logo" />
        <h1 class="tix__hero-title">{{ EVENT.name }}</h1>
        <p class="tix__hero-sub">{{ EVENT.dates }} · {{ EVENT.venue }}</p>
      </div>
    </section>

    <div class="tix__inner">
      <div class="tix__grid">
        <div class="tix__main">
          <header class="tix__head">
            <h2 class="tix__h2">Add tournament admission</h2>
            <p class="tix__sub">
              Your room at <strong>{{ activeHotel.name }}</strong> is held. Spectators need a pass for every
              day they are in the building — athletes need a credential wristband regardless.
            </p>
          </header>

          <!-- The schedule the passes are sold against. -->
          <ol class="tix__days">
            <li v-for="d in COMP_DAYS" :key="d.id" class="tix__day">
              <span class="tix__day-label">{{ d.label }}</span>
              <span class="tix__day-note">{{ d.note }}</span>
            </li>
          </ol>

          <party-size-field
            :guests="journey.guests"
            :note="`Matches the ${journey.room.type} you reserved — every pass and add-on is priced for this many people.`"
            @update:guests="setGuests"
          />

          <div class="tix__list">
            <ticket-tier-card
              v-for="c in categories" :key="c.id"
              :tier="c" :guests="journey.guests" :selected="ticketOn(c.id)"
              @toggle="toggleTicket(c.id)"
            />
          </div>

          <p class="tix__foot">
            Prototype pricing. Mat assignments and performance times are published two weeks before the event;
            a weekend pass covers every mat on every day. Quantities follow your party size — change it above
            and everything on this order re-prices together.
          </p>
        </div>

        <!-- Running selection. Deliberately NOT a checkout summary — the room and
             the add-ons join this cart on the next screens, and showing a grand
             total here would imply the trip is already priced. -->
        <aside class="tix__rail">
          <h3 class="tix__rail-h">Passes selected</h3>
          <div v-if="lines.length" class="tix__rail-lines">
            <div v-for="l in lines" :key="l.id" class="tix__rail-line">
              <span class="tix__rail-name">{{ l.qty }} × {{ l.name }}</span>
              <span class="tix__rail-amt">{{ money(l.amount) }}</span>
            </div>
            <div class="tix__rail-rule" />
            <div class="tix__rail-line tix__rail-line--total">
              <span>{{ count }} {{ count === 1 ? 'pass' : 'passes' }}</span>
              <span>{{ money(subtotal) }}</span>
            </div>
          </div>
          <p v-else class="tix__rail-empty">
            Nothing selected yet. You can continue without passes — your room stays booked either way.
          </p>

          <button type="button" class="tix__cta" @click="nav('addons')">
            Continue to Orlando add-ons <q-icon name="arrow_forward" size="18px" />
          </button>
          <button type="button" class="tix__skip" @click="skipTickets">Skip — I only need the room</button>
          <p class="tix__rail-note"><q-icon name="lock" size="14px" /> Nothing is charged until checkout.</p>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tix { display: flex; flex-direction: column; flex: 1; background: var(--ds-palette-slate-50, #f8fafc); }

.tix__hero { background-color: #000; background-size: cover; background-position: center; color: #fff; }
.tix__hero-inner { max-width: 1180px; margin-inline: auto; padding: 30px 24px; text-align: center; }
.tix__hero-logo { height: 30px; width: auto; margin-bottom: 12px; opacity: 0.95; }
.tix__hero-title { margin: 0; font-size: 1.5rem; font-weight: 700; line-height: 1.15; }
.tix__hero-sub { margin: 6px 0 0; opacity: 0.85; }

.tix__inner { max-width: 1180px; margin-inline: auto; width: 100%; padding: 28px 24px 56px; }
.tix__grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 32px; align-items: start; }
.tix__main { min-width: 0; display: flex; flex-direction: column; gap: 20px; }

.tix__head { margin: 0; }
.tix__h2 { margin: 0; font-size: 1.5rem; font-weight: 800; color: var(--ds-color-text); }
.tix__sub { margin: 6px 0 0; max-width: 68ch; color: var(--ds-color-text-subtle); }

/* The schedule strip — three days, equal weight, because the pass list is a
   choice between them and an unequal layout would imply a recommendation. */
.tix__days { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none; }
.tix__day { background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); padding: 12px 14px; }
.tix__day-label { display: block; font-weight: 700; color: var(--ds-color-text); font-size: 0.9375rem; }
.tix__day-note { display: block; margin-top: 2px; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }

.tix__list { display: flex; flex-direction: column; gap: 12px; }
.tix__foot { margin: 4px 0 0; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }

.tix__rail { position: sticky; top: 16px; background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); padding: 18px; display: flex; flex-direction: column; gap: 12px; }
.tix__rail-h { margin: 0; font-size: 1.0625rem; font-weight: 800; color: var(--ds-color-text); }
.tix__rail-lines { display: flex; flex-direction: column; gap: 8px; }
.tix__rail-line { display: flex; justify-content: space-between; gap: 12px; font-size: 0.9375rem; color: var(--ds-color-text); }
.tix__rail-name { color: var(--ds-color-text-subtle); }
.tix__rail-amt { font-variant-numeric: tabular-nums; }
.tix__rail-rule { height: 1px; background: var(--ds-color-border); }
.tix__rail-line--total { font-weight: 800; }
.tix__rail-empty { margin: 0; font-size: 0.875rem; color: var(--ds-color-text-subtle); }

.tix__cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 48px; border: 0; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.tix__skip { width: 100%; height: 42px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-button); background: var(--ds-color-surface); color: var(--ds-color-text); font: inherit; font-weight: 700; cursor: pointer; }
.tix__skip:hover { background: var(--ds-palette-slate-100); }
.tix__rail-note { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0; font-size: 0.8125rem; color: var(--ds-color-text-subtle); }

@media (max-width: 980px) {
  .tix__grid { grid-template-columns: 1fr; }
  .tix__rail { position: static; }
  .tix__days { grid-template-columns: 1fr; }
}
</style>
