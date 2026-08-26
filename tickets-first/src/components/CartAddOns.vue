<script setup>
// THE EXTRAS PICKER, INSIDE THE CART — Aug 25 (evening), the round that deleted
// the Extras step.
//
//   "i dont want extras and reviews, i only want tickets, hotel, and review...
//    i think we can put extras in the flyout cart."
//
// So the stepper is three labels now (Tickets · Hotel · Review) and this is
// where parking, the tailgate, the transfer and hospitality live: a compact
// add/remove list at the foot of the trip, rendered by TripCartBody. Nothing
// about the extras themselves changed: same four offers, same prices, same
// units, same hotel dependency. What changed is that they are no longer a moment
// in the flow you pass through once; they are a shelf you can reach at any point
// from the cart button.
//
// Later that evening the review step became the checkout and the cart page was
// deleted, which left the peek as the ONE surface that shows the trip — so this
// list is now the only place in the app an extra can be bought. That raises the
// stakes on the two rules below rather than changing them: the transfer's
// disabled-with-a-reason row is the only explanation a guest will ever get for
// why there are three offers and not four, and its "Pick a hotel" link is the
// only route out of the dependency.
//
// WHY THIS ISN'T AddOnCard (deleted with the step it belonged to). That card was
// photo-tile-sized — a 132×108 icon tile beside a tagline, a meta line and a
// price block, built to fill an 820px step where four of them were the whole
// screen. The peek panel is 460px wide and the extras sit UNDER an itemised
// order in it: at that width the card wraps into three ragged rows and pushes
// the totals below the fold, which is the one thing a cart may not do. The two
// rules that card enforced are carried over verbatim, because they came from an
// earlier stakeholder review and are not up for revisiting:
//
//   • ICON, NOT A PHOTO. An extra is a service, not a place; stock photography
//     of a parking lot tells a guest nothing they can act on.
//   • NO QUANTITY CONTROL ON PER-GUEST EXTRAS. Their quantity IS the ticket
//     count and each row says so out loud ("× 2 guests, matches your tickets"),
//     otherwise the price looks like it moved on its own when the ticket
//     stepper is touched. Parking is the exception — it is per VEHICLE, because
//     four people can arrive in one car — and it keeps its own stepper. That
//     stepper lives on the parking CART LINE once parking is added (see
//     TripCartBody), not here: a count on something not yet in the trip is a
//     number with nothing to multiply.
//
// ONLY UN-ADDED EXTRAS ARE LISTED. Anything already on the trip is a line above
// with its own Remove — listing it twice would give one extra two states in one
// scroll. Add here, remove there; the list empties as the order fills.
import { computed } from 'vue'
import { ADD_ONS, unitsFor } from '../addons.js'

const props = defineProps({
  // Ids already on the trip — those are cart lines, not offers.
  added: { type: Array, default: () => [] },
  guests: { type: Number, default: 2 },     // the ticket count
  vehicles: { type: Number, default: 1 },
  // Whether a stay is in the trip. Drives the transfer, and nothing else.
  hasHotel: { type: Boolean, default: false },
})
const emit = defineEmits(['add', 'edit'])

const offers = computed(() => ADD_ONS.filter((a) => !props.added.includes(a.id)))

/**
 * The transfer with no hotel: DISABLED WITH A REASON, never absent.
 *
 * This is the rule that survived the step's deletion intact, and it is the one
 * the flyout made hardest. On the old Extras screen the dependency was implicit
 * in the running order — you had just answered the hotel question, so a card
 * saying "needs a hotel" pointed one screen back. In a peek there is no "one
 * screen back": the guest may be standing on the ticket map. So the reason
 * carries its own way out — a link that closes the peek and opens the hotel
 * step — instead of assuming the guest knows where the lobby answer is given.
 *
 * Hiding the row was rejected here for the same reason it was rejected there: a
 * guest who skipped the hotel would see three extras where a friend sees four
 * and never learn why.
 */
function reasonFor(addOn) {
  return addOn.requiresHotel && !props.hasHotel
    ? 'Needs a hotel — the coach leaves from your lobby'
    : null
}

function unitsOf(addOn) { return unitsFor(addOn, { guests: props.guests, vehicles: props.vehicles }) }
function totalOf(addOn) { return addOn.price * unitsOf(addOn) }

// What the price is multiplied by, and why it's that number.
function unitLine(addOn) {
  return addOn.unit === 'vehicle'
    ? `${fmt(addOn.price)} per vehicle`
    : `${fmt(addOn.price)} × ${props.guests} guest${props.guests === 1 ? '' : 's'} — matches your tickets`
}

function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) }
</script>

<template>
  <section v-if="offers.length" class="xadd">
    <div class="xadd__head">
      <span>Add to your gameday</span>
      <span class="xadd__pill"><q-icon name="verified" size="13px" /> One charge</span>
    </div>

    <div
      v-for="a in offers" :key="a.id"
      class="xadd__row" :class="{ 'is-off': !!reasonFor(a) }"
    >
      <span class="xadd__tile"><q-icon :name="a.icon" size="20px" /></span>

      <div class="xadd__info">
        <div class="xadd__name">{{ a.name }}</div>
        <div class="xadd__meta">{{ unitLine(a) }}</div>
        <p v-if="reasonFor(a)" class="xadd__off">
          <q-icon name="info" size="13px" />
          <span>{{ reasonFor(a) }}</span>
          <!-- The way out of the dependency, in the row that states it. -->
          <button type="button" class="xadd__link" @click="emit('edit', 'hotel')">Pick a hotel</button>
        </p>
      </div>

      <div class="xadd__act">
        <!-- The line the extra WOULD add, not its unit price: the guest is
             deciding what the total becomes, and per-guest extras multiply. -->
        <div class="xadd__amt">{{ fmt(totalOf(a)) }}</div>
        <button
          type="button" class="xadd__btn" :disabled="!!reasonFor(a)"
          @click="emit('add', a)"
        >
          <q-icon name="add" size="15px" />Add
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.xadd { display: flex; flex-direction: column; gap: var(--ds-space-3); font-family: var(--ds-font-family); }
.xadd__head {
  display: flex; align-items: baseline; justify-content: space-between; gap: var(--ds-space-3);
  font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold);
  letter-spacing: .04em; text-transform: uppercase; color: var(--ds-color-text-subtle);
  padding-top: var(--ds-space-3); border-top: 1px solid var(--ds-color-border);
}
.xadd__pill {
  display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
  text-transform: none; letter-spacing: normal; font-weight: var(--ds-font-weight-regular);
  font-size: var(--ds-font-size-sm); color: var(--ds-color-text-info);
  background: var(--ds-color-background-info); border-radius: var(--ds-radius-pill); padding: 2px 9px;
}

/* One row, three columns: what it is, what it costs, and the button. It has to
   survive a 460px flyout panel, so nothing here is fixed-width but the tile. */
.xadd__row {
  display: flex; align-items: flex-start; gap: var(--ds-space-3);
  border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md);
  padding: var(--ds-space-3);
}
.xadd__row.is-off { opacity: 0.78; }
.xadd__tile {
  width: 36px; height: 36px; flex: none; border-radius: var(--ds-radius-sm);
  display: flex; align-items: center; justify-content: center;
  background: var(--ds-color-surface-sunken); color: var(--ds-color-text-brand);
}
.xadd__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.xadd__name { font-weight: var(--ds-font-weight-medium); color: var(--ds-color-text); line-height: 1.3; }
.xadd__meta { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); }
.xadd__off {
  display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin: 4px 0 0;
  font-size: var(--ds-font-size-sm); color: var(--ds-color-text-info);
}
.xadd__link {
  background: none; border: none; padding: 0; cursor: pointer; font: inherit;
  font-size: var(--ds-font-size-sm); color: var(--ds-color-link); text-decoration: underline;
}
.xadd__act { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.xadd__amt { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); white-space: nowrap; }
.xadd__btn {
  display: inline-flex; align-items: center; gap: 3px; cursor: pointer; font: inherit;
  font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold);
  padding: 5px 13px; border-radius: var(--ds-radius-button);
  border: 1px solid var(--ds-color-border-bold); background: var(--ds-color-surface); color: var(--ds-color-text);
}
.xadd__btn:hover:not(:disabled) { background: var(--ds-palette-slate-100); }
.xadd__btn:disabled { cursor: not-allowed; color: var(--ds-color-text-disabled); border-color: var(--ds-color-border); }
</style>
