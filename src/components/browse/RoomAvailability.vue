<script setup>
// RoomAvailability — a horizontal carousel of room-type availability cards,
// revealed when a hotel card's "Availability" is toggled open. Each room shows
// its nightly price and per-night rooms-left, color-coded by state:
//   0 left       → "Sold out"   (muted; whole card dims if every night is 0)
//   1–3 left     → "Only N left" (orange urgency)
//   4+ left      → "N rooms left" (green)
// Scroll with the prev/next arrows (or trackpad/drag). Shared by the reserve
// and group hotel cards.
import { ref, computed } from 'vue'

const props = defineProps({
  rooms: { type: Array, default: () => [] }, // [{ type, nightly, nights: [{ date, roomsLeft }] }]
  currency: { type: String, default: '$' },
})

const track = ref(null)
const scroll = (dir) => { track.value?.scrollBy({ left: dir * 260, behavior: 'smooth' }) }
const canScroll = computed(() => props.rooms.length > 1)

const money = (n) => props.currency + Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const isSoldout = (r) => (r.nights || []).length > 0 && r.nights.every((n) => n.roomsLeft <= 0)
const leftLabel = (n) => (n <= 0 ? 'Sold out' : n <= 3 ? `Only ${n} left` : `${n} rooms left`)
const leftClass = (n) => (n <= 0 ? 'is-sold' : n <= 3 ? 'is-limited' : 'is-ok')
</script>

<template>
  <div class="rav">
    <button v-if="canScroll" type="button" class="rav__nav rav__nav--prev" aria-label="Previous rooms" @click="scroll(-1)"><q-icon name="chevron_left" size="22px" /></button>

    <div ref="track" class="rav__track">
      <div v-for="(r, i) in rooms" :key="i" class="rav__room" :class="{ 'is-soldout': isSoldout(r) }">
        <div class="rav__rhead">
          <div class="rav__rtype">{{ r.type }}</div>
          <div class="rav__rprice">{{ money(r.nightly) }} nightly</div>
        </div>
        <span v-if="isSoldout(r)" class="rav__soldtag">Sold out</span>
        <div class="rav__rnights">
          <div v-for="n in r.nights" :key="n.date" class="rav__rrow">
            <span class="rav__rdate">{{ n.date }}</span>
            <span class="rav__rleft" :class="leftClass(n.roomsLeft)">{{ leftLabel(n.roomsLeft) }}</span>
          </div>
        </div>
      </div>
    </div>

    <button v-if="canScroll" type="button" class="rav__nav rav__nav--next" aria-label="More rooms" @click="scroll(1)"><q-icon name="chevron_right" size="22px" /></button>
  </div>
</template>

<style scoped>
.rav { position: relative; }
.rav__track { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 4px 2px 8px; scrollbar-width: none; }
.rav__track::-webkit-scrollbar { display: none; }

.rav__room { flex: 0 0 244px; scroll-snap-align: start; background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); padding: 16px 18px; position: relative; }
.rav__room.is-soldout { opacity: 0.7; }
.rav__rhead { text-align: center; margin-bottom: 10px; }
.rav__rtype { font-size: 1rem; font-weight: 700; color: var(--ds-color-text-brand); line-height: 1.25; }
.rav__rprice { color: var(--ds-color-text-subtle); font-size: 0.875rem; margin-top: 2px; }
.rav__soldtag { display: block; text-align: center; margin: -4px 0 10px; color: var(--ds-color-text-subtle); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.rav__rnights { display: flex; flex-direction: column; gap: 6px; }
.rav__rrow { display: flex; justify-content: space-between; gap: 10px; font-size: 0.875rem; }
.rav__rdate { color: var(--ds-color-text); font-weight: 500; white-space: nowrap; }
.rav__rleft { font-weight: 600; white-space: nowrap; }
.rav__rleft.is-ok { color: var(--ds-color-text-success); }
.rav__rleft.is-limited { color: var(--ds-palette-orange-600); }
.rav__rleft.is-sold { color: var(--ds-color-text-subtlest); }

/* nav arrows */
.rav__nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; width: 34px; height: 34px; border: 1px solid var(--ds-color-border); border-radius: 50%; background: var(--ds-color-surface); color: var(--ds-color-text-brand); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: var(--ds-shadow-1); transition: background var(--ds-duration-fast) var(--ds-ease-standard); }
.rav__nav:hover { background: var(--ds-palette-navy-50); }
.rav__nav--prev { left: -8px; }
.rav__nav--next { right: -8px; }
</style>
