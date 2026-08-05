<script setup>
// One of Option D's two package cards (Aug 5 feedback).
//
// Modelled on the library's Package Details packages grid — the reference for
// this screen — but with the comparison inverted. There, nine cards differ from
// each other in tier, hotel and theme, so each card has to explain itself. Here
// there are exactly TWO, and their contents are identical: same tickets, same
// transportation, same hospitality, same two nights. Only the hotel differs.
//
// So the card leads with the hotel, and the inclusion list is deliberately the
// same words on both cards. Repetition is the point — it is what makes "these are
// the same package, in two places" legible at a glance. Anything that read
// differently between the two would imply a difference that isn't there.
//
// --- Aug 5 (afternoon) feedback -----------------------------------------------
// Two changes, both about not making the guest leave this card:
//
//   • PARTY SIZE LIVES HERE, not in the page header. It was hoisted out on the
//     grounds that one number pricing two cards should be stated once. True, but
//     it put the control away from the number it changes: you adjust at the top
//     of the page and the effect happens 400px below, on both tiles at once. On
//     the card it sits directly above the price it drives.
//
//     There is still only ONE party size. The control is bound to the shared
//     store value (`:people` in, `update:people` out — no local copy), so setting
//     it on either card re-prices both. Two controls, one number: a mirror, not a
//     fork. The card also spells out what that number bought — the ticket count
//     and the room count — so the two tiles never look like they disagree.
//
//   • THE CARD CAN CHECK OUT. It used to only open the detail page, which meant
//     someone already decided on this package still had to load a second screen
//     to press a second button. Now the primary CTA goes straight to checkout and
//     "View package details" is the optional drill-in beside it. The detail page
//     is unchanged and still selects from its own CTA — it is now a route through
//     the decision rather than a toll gate in front of it.
import { computed } from 'vue'

const props = defineProps({
  pkg: { type: Object, required: true },
  // The party size — owned by the store, mirrored on both cards. Never copied
  // into local state: the two controls must move together.
  people: { type: Number, default: 2 },
  maxPeople: { type: Number, default: 12 },
  // Marks the card the guest is comparing against — used for the "same package"
  // framing, never to rank the two.
  featured: { type: Boolean, default: false },
})
const emit = defineEmits(['view', 'select', 'open-hotel', 'update:people'])

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: props.pkg.currency || 'USD', maximumFractionDigits: 0 }).format(n || 0)

// Just the room the package covers and what it holds. The room COUNT used to live
// here too, but it now sits under the party-size control that decides it — one
// number, stated where it is caused rather than in two places.
const roomsLabel = computed(() => `sleeps ${props.pkg.hotel.sleeps}`)

const peopleOptions = computed(() =>
  Array.from({ length: props.maxPeople }, (_, i) => ({
    label: `${i + 1} ${i === 0 ? 'person' : 'people'}`,
    value: i + 1,
  }))
)

// What the party size just bought on THIS card. Occupancy differs between the two
// hotels, so the same number of people is a different number of rooms — stating it
// next to the control is what keeps the re-price from looking arbitrary.
const partyEffect = computed(() => {
  const { guests, rooms } = props.pkg
  return `${guests} ticket${guests === 1 ? '' : 's'} · ${rooms} room${rooms === 1 ? '' : 's'}`
})
</script>

<template>
<article class="pc" :class="{ 'pc--featured': featured }">
  <div class="pc__hero">
    <img v-if="pkg.image" :src="pkg.image" :alt="`${pkg.hotel.name} — ${pkg.hotel.roomType}`" loading="lazy" />
  </div>

  <div class="pc__body">
    <h3 class="pc__name">{{ pkg.name }}</h3>
    <p class="pc__hotel">
      <button type="button" class="pc__hotellink" @click="emit('open-hotel', pkg.hotel.id)">
        {{ pkg.hotel.name }}<q-icon name="open_in_new" size="13px" />
      </button>
      <span class="pc__hotelmeta">
        <q-icon name="star" size="14px" /> {{ pkg.hotel.rating }}
        · {{ pkg.hotel.distanceMi }} mi · {{ pkg.hotel.walkMin }} min walk
      </span>
    </p>
    <p class="pc__blurb">{{ pkg.hotel.blurb }}</p>

    <!-- Identical on both cards, by design -->
    <ul class="pc__inc">
      <li v-for="i in pkg.inclusions" :key="i.label">
        <q-icon :name="i.icon" size="18px" />
        <span>
          <strong>{{ i.label }}</strong>
          <small>{{ i.note }}</small>
        </span>
      </li>
    </ul>

    <p class="pc__rooms">
      <q-icon name="king_bed" size="15px" />
      {{ pkg.hotel.roomType }} · {{ roomsLabel }}
    </p>

    <div class="pc__foot">
      <!-- Party size sits ON the card, above the price it drives. Bound to the
           shared store value, so the other card re-prices in step. -->
      <label class="pc__people">
        <span class="pc__people-label">Party size</span>
        <q-select
          outlined dense emit-value map-options
          :model-value="people" :options="peopleOptions"
          :aria-label="`Party size for the ${pkg.name}`"
          @update:model-value="(n) => emit('update:people', n)"
        />
        <small class="pc__people-effect">{{ partyEffect }}</small>
      </label>

      <div class="pc__price">
        <span class="pc__was">{{ money(pkg.componentsTotal) }}</span>
        <strong class="pc__now">{{ money(pkg.packagePrice) }}</strong>
        <small class="pc__per">{{ money(pkg.perPerson) }} per person · all in</small>
      </div>
    </div>

    <!-- Two ways out, and the direct one leads. Someone already decided on this
         package checks out from here; the detail page stays available beside it
         for anyone who wants to read first. -->
    <div class="pc__actions">
      <q-btn unelevated color="primary" class="pc__cta" label="Select & Check Out"
        @click="emit('select', pkg)" />
      <q-btn outline color="primary" class="pc__alt" label="View package details"
        @click="emit('view', pkg)" />
    </div>
  </div>
</article>
</template>

<style scoped>
.pc { display: flex; flex-direction: column; border: 1px solid var(--ds-color-border); border-radius: 12px; overflow: hidden; background: var(--ds-color-surface, #fff); }
.pc:hover { box-shadow: 0 6px 18px rgba(0, 0, 0, .08); }
.pc--featured { border-color: var(--ds-color-border-brand, #0b2545); box-shadow: 0 0 0 1px var(--ds-color-border-brand, #0b2545) inset; }

.pc__hero { height: 170px; flex: none; background: var(--ds-palette-slate-100, #f1f2f4); }
.pc__hero img { width: 100%; height: 100%; object-fit: cover; display: block; }

.pc__body { display: flex; flex-direction: column; flex: 1; padding: 18px 20px 20px; }
.pc__name { margin: 0 0 6px; font-size: 1.25rem; font-weight: 800; color: var(--ds-color-text); }
.pc__hotel { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 6px; }
.pc__hotellink { appearance: none; -webkit-appearance: none; display: inline-flex; align-items: center; gap: 4px; padding: 0; border: 0; background: none; font: inherit; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }
.pc__hotelmeta { display: inline-flex; align-items: center; gap: 5px; font-size: .875rem; color: var(--ds-color-text-subtle); }
.pc__blurb { margin: 0 0 14px; font-size: .9375rem; color: var(--ds-color-text-subtle); }

.pc__inc { list-style: none; margin: 0 0 14px; padding: 14px 0 0; border-top: 1px solid var(--ds-color-border); display: flex; flex-direction: column; gap: 11px; }
.pc__inc li { display: flex; align-items: flex-start; gap: 10px; }
.pc__inc li .q-icon { color: var(--ds-color-text-success, #167a4a); margin-top: 1px; flex: none; }
.pc__inc span { display: flex; flex-direction: column; min-width: 0; }
.pc__inc strong { font-size: .9375rem; font-weight: 600; color: var(--ds-color-text); }
.pc__inc small { font-size: .8125rem; color: var(--ds-color-text-subtle); }

.pc__rooms { display: flex; align-items: center; gap: 6px; margin: 0 0 4px; font-size: .8125rem; color: var(--ds-color-text-subtle); }

/* Party size on the left, the price it drives on the right — one line, so the
   cause sits beside the effect instead of a screen above it. */
.pc__foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: auto; padding-top: 14px; border-top: 1px solid var(--ds-color-border); }

.pc__people { display: flex; flex-direction: column; gap: 4px; width: 152px; flex: none; }
.pc__people-label { font-size: .75rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.pc__people-effect { font-size: .75rem; color: var(--ds-color-text-subtle); }

.pc__price { display: flex; flex-direction: column; min-width: 0; text-align: right; margin-left: auto; }
.pc__was { font-size: .875rem; color: var(--ds-color-text-subtle); text-decoration: line-through; }
.pc__now { font-size: 1.75rem; font-weight: 800; line-height: 1.1; color: var(--ds-color-text); }
.pc__per { font-size: .8125rem; color: var(--ds-color-text-subtle); }

/* The direct route is the filled button and takes the space; the drill-in is an
   outline beside it. Both are real destinations, so neither is a text link. */
.pc__actions { display: flex; align-items: stretch; gap: 10px; padding-top: 14px; }
.pc__cta { flex: 1 1 auto; font-weight: 700; }
.pc__alt { flex: 0 1 auto; font-weight: 600; }

@media (max-width: 760px) {
  .pc__foot { flex-direction: column; align-items: stretch; }
  .pc__people { width: 100%; }
  .pc__price { text-align: left; margin-left: 0; }
  .pc__actions { flex-direction: column; }
}
</style>
