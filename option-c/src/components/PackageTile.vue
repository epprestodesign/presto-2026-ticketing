<script setup>
// PackageTile — one complete SKU in the Option C grid (Aug 4 feedback).
//
// Modelled on the library's PackageCard so the grid keeps the visual language of
// the board it replaces, but the framing is inverted to match the MVP pitch:
//
//   PackageCard  — "here is a bundle, and here is what you saved by bundling"
//   PackageTile  — "here is a room, and your tickets are free"
//
// The tile carries NO controls. The party size and the dates both live in the
// search bar above the board, because both re-price all six tiles at once —
// putting either on the tile would mean six copies of the same decision. What the
// tile does is show what those shared numbers mean HERE: how many nights, how
// many rooms the party needs at this occupancy, and how many free tickets.
//
// Presentational: a package and a price come in, a selection goes out. No modal,
// no tier picker, no room picker — those choices are already baked into the tile
// by ../packages.js.
import { computed } from 'vue'

const props = defineProps({
  pkg: { type: Object, required: true },
  // Priced by the parent from the shared stay, so every tile on the board agrees.
  priced: { type: Object, required: true },
  // The single optional hero badge: { label, icon }. Passed in by the board only
  // when this tile is genuinely exceptional — never as a standing decoration.
  // One badge, one tile, or none at all.
  flag: { type: Object, default: null },
})
const emit = defineEmits(['select', 'open-hotel'])

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.pkg.currency || 'USD',
    maximumFractionDigits: 0,
  }).format(n || 0)

const stayLabel = computed(() => {
  const { nights, rooms } = props.priced
  const n = `${nights} night${nights === 1 ? '' : 's'}`
  return rooms > 1 ? `${rooms} rooms · ${n}` : n
})

const select = () => emit('select', { ...props.pkg, ...props.priced, quantity: props.priced.guests })
</script>

<template>
<article class="tile" :style="{ '--accent': `var(${pkg.accentVar || '--ds-palette-navy-700'})` }">
  <!-- Hero: the room.
       No standing badges. Both of the ones that used to live here said nothing
       the tile didn't already say:
         "Premium/Value stay" — the row heading states it once, in words, and the
           badge was tinted with the TICKET tier's accent, so one row showed the
           same "Value stay" in orange, red and blue as if they differed;
         "Tickets free"       — true of all six tiles, and already in the header
           bar, the green facts line and the price note.
       A badge that is always on is not a badge. The slot is reserved for genuine
       per-tile exceptions (scarcity, a standout rate) — nothing qualifies yet. -->
  <div class="tile__hero">
    <img v-if="pkg.image" :src="pkg.image" :alt="`${pkg.hotel.name} — ${pkg.hotel.roomType}`" loading="lazy" />
    <div v-if="flag" class="tile__heroover">
      <span class="tile__flag"><q-icon :name="flag.icon" size="15px" /> {{ flag.label }}</span>
    </div>
  </div>

  <div class="tile__body">
    <!-- The ticket leads: it is the thing being given away -->
    <h3 class="tile__name">
      <span class="tile__dot" aria-hidden="true"></span>{{ pkg.ticket.tierName }}
    </h3>
    <p class="tile__desc">{{ pkg.ticket.desc }}</p>

    <ul class="tile__facts">
      <li>
        <q-icon name="hotel" size="16px" />
        <span>
          <!-- The hotel name opens its read-only details page in a new tab, so
               the board behind it keeps its dates and party size. -->
          <button type="button" class="tile__hotel"
            @click.stop="emit('open-hotel', pkg.hotel.id)">
            {{ pkg.hotel.name }}<q-icon name="open_in_new" size="13px" />
          </button>
          · {{ pkg.hotel.roomType }}
        </span>
      </li>
      <li>
        <q-icon name="king_bed" size="16px" />
        <span>{{ pkg.hotel.bed }} · Sleeps {{ pkg.hotel.sleeps }} · {{ stayLabel }}</span>
      </li>
      <li>
        <q-icon name="directions_walk" size="16px" />
        <span>{{ pkg.hotel.distanceMi }} mi · {{ pkg.hotel.walkMin }} min walk to the stadium</span>
      </li>
      <li class="tile__facts--free">
        <q-icon name="confirmation_number" size="16px" />
        <span>
          <strong>{{ priced.guests }} × {{ pkg.ticket.tierName }} ticket{{ priced.guests === 1 ? '' : 's' }}</strong>
          — included free
        </span>
      </li>
    </ul>

    <!-- A party bigger than one room needs more than one room. Say so on the
         tile rather than silently multiplying the price. -->
    <p v-if="priced.rooms > 1" class="tile__rooms">
      <q-icon name="info" size="14px" />
      {{ priced.guests }} guests need <strong>{{ priced.rooms }} rooms</strong> here — this room sleeps {{ pkg.hotel.sleeps }}.
    </p>

    <!-- Price: the stay is what's charged; the tickets are the saving -->
    <div class="tile__foot">
      <div class="tile__price">
        <span class="tile__was">{{ money(priced.componentsTotal) }}</span>
        <strong class="tile__now">{{ money(priced.packagePrice) }}</strong>
        <small class="tile__note">
          {{ money(priced.nightly) }}/night × {{ stayLabel }} ·
          {{ priced.guests }} ticket{{ priced.guests === 1 ? '' : 's' }} free ({{ money(priced.savings) }} value)
        </small>
      </div>
      <q-btn unelevated color="primary" class="tile__cta" label="Select" @click="select" />
    </div>
  </div>
</article>
</template>

<style scoped>
.tile { display: flex; flex-direction: column; border: 1px solid var(--ds-color-border); border-radius: 12px; overflow: hidden; background: var(--ds-color-surface, #fff); }
.tile:hover { box-shadow: 0 6px 18px rgba(0, 0, 0, .08); }

.tile__hero { position: relative; height: 150px; background: var(--accent); flex: none; }
.tile__hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
.tile__heroover { position: absolute; inset: 8px 8px auto 8px; display: flex; align-items: flex-start; gap: 8px; }
/* The one exception badge. Navy rather than the tier accent — the accent means
   "ticket tier" everywhere else on this board, and reusing it here is what made
   the old stay badge read as a tier distinction it never was. */
.tile__flag { display: inline-flex; align-items: center; gap: 5px; background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font-size: .75rem; font-weight: 700; padding: 4px 10px; border-radius: var(--ds-radius-pill, 999px); }

.tile__body { display: flex; flex-direction: column; flex: 1; padding: 14px 16px 16px; }
.tile__name { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-text); }
.tile__dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); flex: none; }
.tile__desc { margin: 4px 0 10px; font-size: .875rem; color: var(--ds-color-text-subtle); }

.tile__facts { list-style: none; margin: 0 0 12px; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.tile__facts li { display: flex; align-items: flex-start; gap: 8px; font-size: .875rem; color: var(--ds-color-text); }
.tile__facts li .q-icon { color: var(--ds-color-text-subtle); margin-top: 2px; flex: none; }
.tile__facts--free { color: var(--ds-color-text-success, #167a4a); }
.tile__facts--free .q-icon { color: var(--ds-color-text-success, #167a4a); }

/* `appearance: none` is load-bearing — see PackageGridScreen: macOS draws native
   button chrome through background:none, which made the link a grey box. */
.tile__hotel { appearance: none; -webkit-appearance: none; display: inline-flex; align-items: center; gap: 3px; padding: 0; border: 0; background: none; font: inherit; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }
.tile__hotel:hover { text-decoration-thickness: 2px; }

.tile__rooms { display: flex; align-items: flex-start; gap: 6px; margin: 0 0 4px; font-size: .75rem; color: var(--ds-palette-orange-600, #b45309); }

.tile__foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-top: auto; padding-top: 12px; }
.tile__price { display: flex; flex-direction: column; min-width: 0; }
.tile__was { font-size: .875rem; color: var(--ds-color-text-subtle); text-decoration: line-through; }
.tile__now { font-size: 1.5rem; font-weight: 800; line-height: 1.1; color: var(--ds-color-text); }
.tile__note { font-size: .75rem; color: var(--ds-color-text-subtle); }
.tile__cta { flex: none; font-weight: 700; }

@media (max-width: 860px) {
  .tile__foot { flex-direction: column; align-items: stretch; }
  .tile__cta { width: 100%; }
}
</style>
