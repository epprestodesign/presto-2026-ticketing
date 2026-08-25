<script setup>
// TripBar — the trip, in one sticky line, on every screen.
//
// This is what stands in for the stepper the sibling prototypes carry. A stepper
// answers "how far along the one path am I", and this flow has no one path: the
// honest orientation is what the cart currently holds and what could still be
// added to it. So the bar shows both, and its three Add buttons are live on every
// screen — including the ones you are already on, because "add more tickets" is a
// real thing to want while looking at tickets.
//
// It is not the library's GlobalNav cart button. That button opens CartFlyout,
// whose body is CartReview — which cannot remove a line (see TripItems). A cart
// icon that opens a cart you can't edit would undercut the entire prototype, so
// GlobalNav is mounted with `:show-cart="false"` and the trip lives here instead,
// where it is a labelled bar rather than a badge someone has to notice.
//
// AUG 25: "REVIEW TRIP" GOES TO THE TRIP PAGE. It used to open TripFlyout, a
// DsSidePanel carrying the same TripItems body the /trip page already carries —
// which made the fly-out a second copy of a page that existed, reached by a
// scrim. The round asked for pages rather than overlays, and the redundancy made
// it an easy call: one cart, one address. The BAR stays, because a docked row is
// not a pop-up — nothing is covered, nothing has to be dismissed, and it is what
// replaced the stepper.
import { computed } from 'vue'
import { trip, totals, count, isEmpty, itemsOf, addMore, nav } from '../store.js'
import { money } from '../trip.js'

const ADD = [
  { kind: 'stay', icon: 'hotel', label: 'Hotel' },
  { kind: 'ticket', icon: 'confirmation_number', label: 'Tickets' },
  { kind: 'addon', icon: 'auto_awesome', label: 'Add-ons' },
]

const chips = computed(() => {
  const stays = itemsOf('stay')
  const tickets = itemsOf('ticket').reduce((s, i) => s + i.qty, 0)
  const addons = itemsOf('addon').reduce((s, i) => s + i.qty, 0)
  const out = []
  if (stays.length) out.push({ icon: 'hotel', text: `${stays[0].nights} night${stays[0].nights === 1 ? '' : 's'}` })
  if (tickets) out.push({ icon: 'confirmation_number', text: `${tickets} ticket${tickets === 1 ? '' : 's'}` })
  if (addons) out.push({ icon: 'auto_awesome', text: `${addons} add-on${addons === 1 ? '' : 's'}` })
  return out
})
// On the trip page the review button would point at the page you're on, so it
// becomes the next step instead — the bar never shows a control that does nothing.
const onTripPage = computed(() => trip.screen === 'trip')
</script>

<template>
  <div class="tb">
    <div class="tb__inner">
      <div class="tb__left">
        <span class="tb__title"><q-icon name="luggage" size="20px" /> Your trip</span>
        <template v-if="!isEmpty">
          <span v-for="c in chips" :key="c.icon" class="tb__chip"><q-icon :name="c.icon" size="15px" /> {{ c.text }}</span>
        </template>
        <span v-else class="tb__empty">Empty — start anywhere</span>
      </div>

      <div class="tb__add">
        <span class="tb__addlabel">Add</span>
        <button v-for="a in ADD" :key="a.kind" type="button" class="tb__addbtn" @click="addMore(a.kind)">
          <q-icon :name="a.icon" size="15px" /> {{ a.label }}
        </button>
      </div>

      <div class="tb__right">
        <span v-if="!isEmpty" class="tb__total">
          <small>{{ count }} item{{ count === 1 ? '' : 's' }}</small>
          {{ money(totals.total) }}
        </span>
        <button v-if="onTripPage" type="button" class="tb__cta" :disabled="isEmpty" @click="nav('checkout')">
          Checkout <q-icon name="arrow_forward" size="16px" />
        </button>
        <button v-else type="button" class="tb__cta" @click="nav('trip')">
          {{ isEmpty ? 'View trip' : 'Review trip' }} <q-icon name="arrow_forward" size="16px" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tb { position: sticky; top: 0; z-index: 1200; background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-border); box-shadow: 0 1px 0 rgba(0,0,0,.02); }
.tb__inner { max-width: min(1440px, 92%); margin: 0 auto; padding: 10px 0; display: flex; align-items: center; gap: 18px; flex-wrap: wrap; font-family: var(--ds-font-family); }

.tb__left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-width: 0; }
.tb__title { display: inline-flex; align-items: center; gap: 8px; font-weight: 800; color: var(--ds-color-text); }
.tb__chip { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px; border-radius: 999px; background: var(--ds-palette-slate-100, #f1f2f4); font-size: .8125rem; font-weight: 600; color: var(--ds-color-text); }
.tb__empty { font-size: .875rem; color: var(--ds-color-text-subtle); }

.tb__add { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.tb__addlabel { font-size: .75rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.tb__addbtn { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border: 1px dashed var(--ds-color-border-bold); border-radius: 999px; background: none; font: inherit; font-size: .8125rem; font-weight: 600; color: var(--ds-color-text); cursor: pointer; }
.tb__addbtn:hover { background: var(--ds-palette-slate-100, #f1f2f4); }

.tb__right { display: flex; align-items: center; gap: 14px; }
.tb__total { display: flex; flex-direction: column; line-height: 1.15; text-align: right; font-weight: 800; color: var(--ds-color-text); }
.tb__total small { font-size: .6875rem; font-weight: 600; color: var(--ds-color-text-subtle); }
.tb__cta { display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 16px; border: 0; border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.tb__cta:disabled { background: var(--ds-palette-slate-200, #e2e4e8); color: var(--ds-color-text-subtlest); cursor: not-allowed; }

@media (max-width: 860px) {
  .tb__add { margin-left: 0; order: 3; width: 100%; }
  .tb__right { margin-left: auto; }
}
</style>
