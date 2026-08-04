<script setup>
// HotelAvailability — the carousel inside a package row's Availability panel.
//
// Replaces the library's text-only `RoomAvailability` cards with proper hotel
// cards: property photo, name, brand, rating, walking distance, what the hotel
// costs against the package, and how many rooms are left. Same interaction as the
// library carousel (scroll-snap track, prev/next arrows, dots) with the last card
// snapping to the END so it can actually be reached.
//
// Every card is a link: clicking it — or the brand underneath — opens the
// READ-ONLY Hotel Details page in a new tab. Nothing is selectable from here;
// picking a room happens in the package modal.
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { roomsFor, roomsAvailable } from '../rooms.js'
import { openHotelInNewTab } from '../store.js'

const props = defineProps({
  hotels: { type: Array, default: () => [] },  // hotelOptionsFor(pkg)
  nights: { type: Number, default: 1 },
})

const cards = computed(() =>
  props.hotels.map((h) => {
    const rooms = roomsFor(h, props.nights)
    const left = roomsAvailable(rooms)
    return {
      ...h,
      left,
      from: rooms.length ? Math.min(...rooms.map((r) => r.nightly)) : h.nightlyRate,
      priceLabel: h.included
        ? 'Included'
        : h.deltaPerNight > 0
          ? `+$${h.deltaPerNight}/night`
          : `Save $${Math.abs(h.deltaPerNight)}/night`,
      stockLabel: left <= 0 ? 'Sold out' : left <= 3 ? `Only ${left} left` : `${left} rooms left`,
      stockTone: left <= 0 ? 'is-sold' : left <= 3 ? 'is-limited' : 'is-ok',
    }
  })
)

const track = ref(null)
const active = ref(0)

// Whether the track ACTUALLY overflows — a count of cards says nothing about
// whether they fit. Measured on mount and whenever the panel resizes, so the
// arrows only appear when they can do something.
const overflows = ref(false)
const atStart = ref(true)
const atEnd = ref(false)

const measure = () => {
  const el = track.value
  if (!el) return
  overflows.value = el.scrollWidth - el.clientWidth > 1
  atStart.value = el.scrollLeft <= 1
  atEnd.value = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1
}

let ro = null
onMounted(() => {
  nextTick(measure)
  if (typeof ResizeObserver !== 'undefined' && track.value) {
    ro = new ResizeObserver(measure)
    ro.observe(track.value)
  }
})
onBeforeUnmount(() => ro?.disconnect())
watch(cards, () => nextTick(measure))

// One card's outer width (card + gap), measured from the first two cards.
const step = () => {
  const el = track.value
  if (!el || el.children.length < 2) return el?.children[0]?.offsetWidth || 1
  return el.children[1].offsetLeft - el.children[0].offsetLeft
}
const clamp = (i) => Math.max(0, Math.min(cards.value.length - 1, i))
const scrollToCard = (i) => {
  track.value?.scrollTo({ left: clamp(i) * step(), behavior: 'smooth' })
}
const onScroll = () => {
  const el = track.value
  if (!el) return
  measure()
  // At the end of the track the LAST card is the active one — rounding by scroll
  // position alone never gets there, because it can't align to the left edge.
  active.value = atEnd.value ? cards.value.length - 1 : clamp(Math.round(el.scrollLeft / step()))
}

// Dragging the track sideways must not fire a card's "open in a new tab" click.
let downX = 0
let dragged = false
const onPointerDown = (e) => { downX = e.clientX; dragged = false }
const onPointerMove = (e) => { if (Math.abs(e.clientX - downX) > 6) dragged = true }
const openHotel = (name) => { if (!dragged) openHotelInNewTab(name) }

const money = (n) => `$${Number(n ?? 0).toLocaleString('en-US')}`
</script>

<template>
  <div class="hav">
    <button v-if="overflows" type="button" class="hav__nav hav__nav--prev" aria-label="Previous hotels"
      :disabled="atStart" @click="scrollToCard(active - 1)"><q-icon name="chevron_left" size="22px" /></button>

    <div ref="track" class="hav__track" @scroll="onScroll"
      @pointerdown="onPointerDown" @pointermove="onPointerMove">
      <article
        v-for="h in cards" :key="h.id"
        class="hav__card" :class="{ 'is-included': h.included, 'is-sold': h.left <= 0 }"
        role="link" tabindex="0"
        :aria-label="`${h.name} — open hotel details in a new tab`"
        @click="openHotel(h.name)"
        @keydown.enter="openHotelInNewTab(h.name)"
      >
        <div class="hav__media">
          <img v-if="h.photos.length" :src="h.photos[0].src" :alt="h.photos[0].alt" loading="lazy" />
          <span v-if="h.included" class="hav__tag">Package hotel</span>
        </div>

        <div class="hav__body">
          <h4 class="hav__name">
            <span class="hav__namelink">{{ h.name }}</span>
            <q-icon name="open_in_new" size="15px" />
          </h4>
          <button type="button" class="hav__brand" @click.stop="openHotel(h.name)">{{ h.brand }}</button>

          <p class="hav__facts">
            <q-icon name="star" size="15px" /> {{ h.rating }}
            <span class="hav__dot">·</span> {{ h.distanceMi }} mi
            <span class="hav__dot">·</span> {{ h.walkMin }} min walk
          </p>

          <div class="hav__foot">
            <span class="hav__price" :class="{ 'is-included': h.included }">
              {{ h.priceLabel }}
              <small>from {{ money(h.from) }}/night</small>
            </span>
            <span class="hav__left" :class="h.stockTone">{{ h.stockLabel }}</span>
          </div>
        </div>
      </article>
    </div>

    <button v-if="overflows" type="button" class="hav__nav hav__nav--next" aria-label="More hotels"
      :disabled="atEnd" @click="scrollToCard(active + 1)"><q-icon name="chevron_right" size="22px" /></button>

    <div v-if="overflows" class="hav__dots">
      <button
        v-for="(h, i) in cards" :key="'dot-' + h.id" type="button"
        class="hav__dot-btn" :class="{ 'is-on': i === active }"
        :aria-label="`Go to hotel ${i + 1}`" :aria-current="i === active"
        @click="scrollToCard(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.hav { position: relative; min-width: 0; }
.hav__track { display: flex; min-width: 0; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 4px 2px 8px; scrollbar-width: none; }
.hav__track::-webkit-scrollbar { display: none; }

/* ~2.5 cards visible with a peek of the next; the last one snaps flush right so
   it's always reachable. */
.hav__card { flex: 0 0 clamp(230px, 27%, 290px); scroll-snap-align: start; display: flex; flex-direction: column; background: var(--ds-color-surface, #fff); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md, 10px); overflow: hidden; cursor: pointer; transition: border-color .15s, box-shadow .15s; }
.hav__card:last-child { scroll-snap-align: end; }
.hav__card:hover, .hav__card:focus-visible { border-color: var(--ds-color-border-bold, #9aa3ae); box-shadow: 0 4px 14px rgba(0,0,0,.08); }
.hav__card.is-included { border-color: var(--ds-color-border-brand, #0b2545); }
.hav__card.is-sold { opacity: .6; }

.hav__media { position: relative; aspect-ratio: 16 / 9; background: var(--ds-palette-slate-100, #f1f2f4); }
.hav__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hav__tag { position: absolute; left: 10px; top: 10px; padding: 3px 9px; border-radius: 999px; background: var(--ds-color-background-brand-bold, #0b2545); color: #fff; font-size: .75rem; font-weight: 700; }

.hav__body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 4px; }
.hav__name { display: flex; align-items: center; gap: 5px; margin: 0; font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-link, #1b4ed8); }
.hav__namelink { text-decoration: underline; }
.hav__name .q-icon { color: var(--ds-color-link, #1b4ed8); }
.hav__brand { align-self: flex-start; background: none; border: 0; padding: 0; font: inherit; font-size: .8125rem; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }
.hav__facts { display: flex; align-items: center; gap: 5px; margin: 4px 0 0; font-size: .875rem; color: var(--ds-color-text-subtle); }
.hav__facts .q-icon { color: var(--ds-color-text-brand); }
.hav__dot { color: var(--ds-color-text-subtlest, #9aa3ae); }

.hav__foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--ds-color-border); }
.hav__price { display: flex; flex-direction: column; font-weight: 700; color: var(--ds-color-text); }
.hav__price.is-included { color: var(--ds-color-text-success, #167a4a); }
.hav__price small { font-weight: 400; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.hav__left { font-size: .875rem; font-weight: 600; white-space: nowrap; }
.hav__left.is-ok { color: var(--ds-color-text-success, #167a4a); }
.hav__left.is-limited { color: var(--ds-palette-orange-600, #b45309); }
.hav__left.is-sold { color: var(--ds-color-text-subtle); }

.hav__nav { position: absolute; top: 38%; transform: translateY(-50%); z-index: 3; width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid var(--ds-color-border); border-radius: 50%; background: #fff; color: var(--ds-color-text); cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
/* Kept INSIDE the track: an ancestor's overflow:hidden would clip them outside. */
.hav__nav--prev { left: 6px; }
.hav__nav--next { right: 6px; }
.hav__nav:disabled { opacity: .35; cursor: default; }

.hav__dots { display: flex; justify-content: center; gap: 6px; margin-top: 4px; }
.hav__dot-btn { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 50%; background: var(--ds-palette-slate-300, #cbd2d9); cursor: pointer; }
.hav__dot-btn.is-on { background: var(--ds-color-background-brand-bold, #0b2545); }
</style>
