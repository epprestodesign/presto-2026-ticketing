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
// ── AUG 25, FOURTH ROUND: THE BAR HAS NO CART HANDLE. THIS IS THE STAKEHOLDER
//    CALL, NOT AN OVERSIGHT — DO NOT PUT IT BACK. ──
//
// This bar used to end in a bordered button reading "4 items / $803" with a
// chevron, which opened the cart peek. It is gone, on a direct note: "there is a
// cart button that already exists from the global nav." One cart control, and
// the NAV ICON is the one that wins — it is the pattern shared across all four
// Aug 25 prototypes, so this bar is now the odd one out rather than the rule.
//
// WHAT THAT OVERRULES, so the next reader doesn't "fix" it back. The earlier
// round argued the icon and this handle were ONE action in TWO placements, the
// way a wordmark in a header and in a footer are both "home", and kept both on
// the grounds that the nav scrolls away while this row is sticky. That reasoning
// was reviewed and rejected: two handles on one cart, one row apart, is two
// things to a guest no matter how carefully they are argued to be one, and the
// answer to "the nav scrolls away" is that the nav's cart icon is reachable from
// the top of any screen rather than that it needs a deputy.
//
// WHAT THE BAR IS NOW, AND WHY IT STILL EARNS ITS ROW. Two jobs, neither of them
// the cart button's:
//
//   • WHAT THE TRIP HOLDS, at a glance — "Your trip", then a chip per category
//     present. This is what stands in for the stepper the sibling prototypes
//     carry. A stepper answers "how far along the one path am I", and this flow
//     has no one path: the honest orientation is what the cart currently holds.
//     It is TEXT, not a control, so it is not a second anything.
//   • THE THREE ADD DOORS — Hotel / Tickets / Add-ons — which are a DIFFERENT
//     VERB. Adding is not reviewing, those doors belong on every screen
//     (including the one you are already on: "add more tickets" is a real thing
//     to want while looking at tickets), and a 22px icon in the nav cannot offer
//     three of them.
//
// THE ONE THING THE REMOVAL COSTS, named rather than hidden: the running TOTAL
// is no longer visible at zero presses. It now lives in the peek footer, the
// /trip rail and the checkout rail — all one press from the nav's cart icon, on
// every screen. The earlier round called a cart with no visible total "not
// orientation"; that was the argument for the handle and it went with it. If the
// total is wanted back it belongs as a QUIET FIGURE in the summary chips on the
// left, never as a button on the right — a button is the thing that was removed.
//
// The bar itself is not an overlay and never was: it occupies its own row,
// covers nothing, scrolls nothing under a scrim, and cannot be dismissed. The
// one sanctioned overlay in this app is the peek — see TripFlyout.
import { computed } from 'vue'
import { isEmpty, itemsOf, addMore } from '../store.js'

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
      <!-- Nothing follows the Add group. The cart handle that used to sit here
           was removed on the stakeholder's call — the nav's cart icon is the
           one cart control, on every screen. -->
    </div>
  </div>
</template>

<style scoped>
/* AUG 26: the bar no longer pins itself. It sits inside `.tbapp__chrome`, which
   pins the nav and this row together — see App.vue for why the nav had to join
   it. A sticky child inside a sticky parent has no travel room of its own, so
   the old `position: sticky; top: 0; z-index: 1200` here was doing nothing but
   inviting a stacking-order question. Removed rather than left inert. */
.tb { background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-border); box-shadow: 0 1px 0 rgba(0,0,0,.02); }
.tb__inner { max-width: min(1440px, 92%); margin: 0 auto; padding: 10px 0; display: flex; align-items: center; gap: 18px; flex-wrap: wrap; font-family: var(--ds-font-family); }

.tb__left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-width: 0; }
.tb__title { display: inline-flex; align-items: center; gap: 8px; font-weight: 800; color: var(--ds-color-text); }
.tb__chip { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px; border-radius: 999px; background: var(--ds-palette-slate-100, #f1f2f4); font-size: .8125rem; font-weight: 600; color: var(--ds-color-text); }
.tb__empty { font-size: .875rem; color: var(--ds-color-text-subtle); }

.tb__add { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.tb__addlabel { font-size: .75rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.tb__addbtn { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border: 1px dashed var(--ds-color-border-bold); border-radius: 999px; background: none; font: inherit; font-size: .8125rem; font-weight: 600; color: var(--ds-color-text); cursor: pointer; }
.tb__addbtn:hover { background: var(--ds-palette-slate-100, #f1f2f4); }

/* With the cart handle gone the Add group is the last thing on the row, so
   `margin-left: auto` above now pushes it to the right edge on its own — the
   summary reads left, the doors read right, and the row keeps the same 42px
   rhythm it had. No filler was added to occupy the space the handle left: an
   empty gap between two groups that each say something is not a problem to
   solve with a third thing. */
@media (max-width: 860px) {
  /* Under 860 the summary chips can wrap, so the doors take their own full-width
     line rather than being squeezed against them. */
  .tb__add { margin-left: 0; order: 3; width: 100%; }
}
</style>
