<script setup>
// PackageConfirmDialog — the step between picking a tile and paying.
//
// ONE component, two jobs, decided by the hotel:
//
//   Premium stay (The Ritz-Carlton) — several contracted room types, so the
//     dialog offers the CHOICE. Each room carries its per-night difference
//     against the room the package is priced around, and the total re-prices live.
//
//   Value stay (Courtyard by Marriott) — one contracted room type, so there is
//     nothing to choose and the dialog is pure CONFIRMATION: here is exactly what
//     you are buying, for these dates, at this price.
//
// Either way this is a confirmation step, not a configuration one. The ticket
// tier, the hotel and the free-ticket model are all still baked into the tile —
// the guest is never asked to assemble a package, only to see it before paying.
// That keeps the Aug 4 "no complex options" line intact while giving the premium
// block the room choice it needs.
import { computed } from 'vue'
import { roomsFor, priceTile } from '../packages.js'

const props = defineProps({
  pkg: { type: Object, default: null },
  room: { type: Object, default: null },  // the chosen room
  guests: { type: Number, default: 2 },
  nights: { type: Number, default: 1 },
  range: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['close', 'set-room', 'confirm', 'open-hotel'])

const rooms = computed(() => (props.pkg ? roomsFor(props.pkg.hotel.id) : []))
// The whole branch: more than one contracted room type means a choice to make.
const hasChoice = computed(() => rooms.value.length > 1)

const priced = computed(() =>
  props.pkg ? priceTile(props.pkg, props.guests, props.nights, props.room) : null
)

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const fmtDate = (s) => {
  if (!s) return ''
  const [, m, d] = s.split('/')
  return `${MON[+m - 1]} ${+d}`
}
const stayLabel = computed(() => {
  const { from, to } = props.range || {}
  if (!from || !to) return `${props.nights} night${props.nights === 1 ? '' : 's'}`
  return `${fmtDate(from)} – ${fmtDate(to)} · ${props.nights} night${props.nights === 1 ? '' : 's'}`
})

// Per-night difference against the room the package is priced around.
const deltaLabel = (r) =>
  r.deltaPerNight === 0 ? 'Included'
    : r.deltaPerNight > 0 ? `+${money(r.deltaPerNight)}/night`
      : `Save ${money(Math.abs(r.deltaPerNight))}/night`
</script>

<template>
<q-dialog :model-value="!!pkg" @update:model-value="(v) => !v && emit('close')">
  <q-card v-if="pkg" class="pcd">
    <!-- Header: what is being confirmed -->
    <header class="pcd__head">
      <div>
        <span class="pcd__kicker">{{ hasChoice ? 'Choose your room' : 'Confirm your package' }}</span>
        <h2 class="pcd__title">{{ pkg.ticket.tierName }} + {{ pkg.hotel.name }}</h2>
      </div>
      <q-btn flat round dense icon="close" aria-label="Close" @click="emit('close')" />
    </header>

    <div class="pcd__body">
      <!-- What the package is — identical in both modes -->
      <section class="pcd__summary">
        <img v-if="pkg.image" :src="pkg.image" :alt="pkg.hotel.name" class="pcd__photo" />
        <ul class="pcd__facts">
          <li>
            <q-icon name="confirmation_number" size="18px" />
            <span>
              <strong>{{ priced.guests }} × {{ pkg.ticket.tierName }} ticket{{ priced.guests === 1 ? '' : 's' }}</strong>
              — included free ({{ money(priced.savings) }} value)
            </span>
          </li>
          <li>
            <q-icon name="hotel" size="18px" />
            <span>
              <button type="button" class="pcd__hotel" @click="emit('open-hotel', pkg.hotel.id)">
                {{ pkg.hotel.name }}<q-icon name="open_in_new" size="13px" />
              </button>
              · {{ pkg.hotel.distanceMi }} mi · {{ pkg.hotel.walkMin }} min walk
            </span>
          </li>
          <li>
            <q-icon name="event" size="18px" />
            <span>{{ stayLabel }}</span>
          </li>
          <li>
            <q-icon name="group" size="18px" />
            <span>
              {{ priced.guests }} guest{{ priced.guests === 1 ? '' : 's' }}
              <template v-if="priced.rooms > 1"> · {{ priced.rooms }} rooms</template>
            </span>
          </li>
        </ul>
      </section>

      <!-- ROOM CHOICE — premium block only -->
      <section v-if="hasChoice" class="pcd__rooms">
        <h3 class="pcd__h3">Room type</h3>
        <p class="pcd__sub">
          Prices are the difference per night against the room this package is priced around.
        </p>
        <ul class="pcd__roomlist">
          <li v-for="r in rooms" :key="r.id">
            <label class="pcd__room" :class="{ 'pcd__room--on': room?.id === r.id }">
              <input type="radio" name="room" :checked="room?.id === r.id" @change="emit('set-room', r.id)" />
              <span class="pcd__roombody">
                <span class="pcd__roomname">{{ r.name }}</span>
                <span class="pcd__roomfacts">
                  <span><q-icon name="king_bed" size="15px" /> {{ r.bed }}</span>
                  <span><q-icon name="straighten" size="15px" /> {{ r.sqft }} sq ft</span>
                  <span><q-icon name="group" size="15px" /> Sleeps {{ r.sleeps }}</span>
                  <span><q-icon name="visibility" size="15px" /> {{ r.view }}</span>
                </span>
                <span class="pcd__roomstock" :class="r.roomsLeft <= 3 ? 'pcd__roomstock--low' : ''">
                  {{ r.roomsLeft <= 3 ? `Only ${r.roomsLeft} left` : `${r.roomsLeft} rooms left` }}
                </span>
              </span>
              <span class="pcd__roomprice">{{ deltaLabel(r) }}</span>
            </label>
          </li>
        </ul>
      </section>

      <!-- CONFIRMATION ONLY — value block, one contracted room type -->
      <section v-else class="pcd__single">
        <h3 class="pcd__h3">Your room</h3>
        <div class="pcd__singlebox">
          <div>
            <strong>{{ room?.name }}</strong>
            <p class="pcd__singlefacts">
              {{ room?.bed }} · {{ room?.sqft }} sq ft · Sleeps {{ room?.sleeps }} · {{ room?.view }}
            </p>
          </div>
          <span class="pcd__singletag">The contracted room at this hotel</span>
        </div>
      </section>

      <!-- The number being confirmed -->
      <section class="pcd__price">
        <div class="pcd__pricerow">
          <span>{{ money(priced.nightly) }}/night × {{ priced.nights }} night{{ priced.nights === 1 ? '' : 's' }}<template v-if="priced.rooms > 1"> × {{ priced.rooms }} rooms</template></span>
          <span>{{ money(priced.roomTotal) }}</span>
        </div>
        <div class="pcd__pricerow pcd__pricerow--free">
          <span>{{ priced.guests }} × {{ pkg.ticket.tierName }} ticket{{ priced.guests === 1 ? '' : 's' }}</span>
          <span>Free <small>({{ money(priced.ticketValue) }} value)</small></span>
        </div>
        <div class="pcd__total">
          <span>Total</span>
          <strong>{{ money(priced.packagePrice) }}</strong>
        </div>
      </section>
    </div>

    <footer class="pcd__foot">
      <q-btn flat label="Back to packages" @click="emit('close')" />
      <q-btn unelevated color="primary" class="pcd__cta"
        :label="`Reserve · ${money(priced.packagePrice)}`" @click="emit('confirm')" />
    </footer>
  </q-card>
</q-dialog>
</template>

<style scoped>
.pcd { width: 100%; max-width: 720px; border-radius: 12px; display: flex; flex-direction: column; max-height: 90vh; }

.pcd__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 18px 20px 12px; border-bottom: 1px solid var(--ds-color-border); flex: none; }
.pcd__kicker { font-size: .75rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.pcd__title { margin: 2px 0 0; font-size: 1.25rem; font-weight: 700; color: var(--ds-color-text); }

.pcd__body { padding: 18px 20px; overflow-y: auto; flex: 1; min-height: 0; }

.pcd__summary { display: flex; gap: 16px; margin-bottom: 22px; }
.pcd__photo { width: 160px; height: 110px; object-fit: cover; border-radius: 8px; flex: none; }
.pcd__facts { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.pcd__facts li { display: flex; align-items: flex-start; gap: 8px; font-size: .9375rem; }
.pcd__facts li .q-icon { color: var(--ds-color-text-subtle); margin-top: 2px; flex: none; }
.pcd__hotel { appearance: none; -webkit-appearance: none; display: inline-flex; align-items: center; gap: 3px; padding: 0; border: 0; background: none; font: inherit; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }

.pcd__h3 { margin: 0 0 4px; font-size: 1.0625rem; font-weight: 700; }
.pcd__sub { margin: 0 0 12px; font-size: .875rem; color: var(--ds-color-text-subtle); }

.pcd__roomlist { list-style: none; margin: 0 0 22px; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.pcd__room { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 12px; border: 1px solid var(--ds-color-border); border-radius: 8px; cursor: pointer; }
.pcd__room--on { border-color: var(--ds-color-border-brand, #0b2545); box-shadow: 0 0 0 1px var(--ds-color-border-brand, #0b2545) inset; }
.pcd__roombody { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.pcd__roomname { font-weight: 700; }
.pcd__roomfacts { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.pcd__roomfacts span { display: inline-flex; align-items: center; gap: 4px; }
.pcd__roomstock { font-size: .8125rem; font-weight: 600; color: var(--ds-color-text-success, #167a4a); }
.pcd__roomstock--low { color: var(--ds-palette-orange-600, #b45309); }
.pcd__roomprice { font-weight: 700; white-space: nowrap; }

.pcd__single { margin-bottom: 22px; }
.pcd__singlebox { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 14px; border: 1px solid var(--ds-color-border); border-radius: 8px; background: var(--ds-color-surface-sunken, #f1f2f4); }
.pcd__singlefacts { margin: 4px 0 0; font-size: .875rem; color: var(--ds-color-text-subtle); }
.pcd__singletag { font-size: .75rem; font-weight: 600; color: var(--ds-color-text-subtle); }

.pcd__price { border-top: 1px solid var(--ds-color-border); padding-top: 14px; }
.pcd__pricerow { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 5px 0; font-size: .9375rem; }
.pcd__pricerow--free { color: var(--ds-color-text-success, #167a4a); font-weight: 600; }
.pcd__pricerow--free small { font-weight: 400; }
.pcd__total { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-top: 8px; padding-top: 12px; border-top: 1px solid var(--ds-color-border); }
.pcd__total strong { font-size: 1.5rem; font-weight: 800; }

.pcd__foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 20px; border-top: 1px solid var(--ds-color-border); flex: none; }
.pcd__cta { font-weight: 700; }

@media (max-width: 640px) {
  .pcd__summary { flex-direction: column; }
  .pcd__photo { width: 100%; height: 150px; }
  .pcd__room { grid-template-columns: auto minmax(0, 1fr); }
  .pcd__roomprice { grid-column: 2; }
}
</style>
