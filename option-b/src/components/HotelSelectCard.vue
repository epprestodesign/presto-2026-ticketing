<script setup>
// HotelSelectCard — step 2 of the Option B flow.
//
// Deliberately prominent: a large photo, the hotel name as a LINK, distance,
// amenities and a from-rate, with the two paths the spec calls for —
//
//   • "Select a package"  → the packages page, scoped to this hotel
//   • the hotel NAME      → this hotel's details page (one room type), book there
//
// Both converge on the same checkout.
import { ref, computed } from 'vue'

const props = defineProps({
  hotel: { type: Object, required: true },
  guests: { type: Number, default: 2 },
})
const emit = defineEmits(['select-package', 'open-details'])

const frame = ref(0)
const photos = computed(() => props.hotel.photos || [])
const step = (d) => {
  const n = photos.value.length
  if (n) frame.value = (frame.value + d + n) % n
}
const money = (n) => `$${Number(n ?? 0).toLocaleString('en-US')}`
</script>

<template>
  <article class="hsc">
    <div class="hsc__media">
      <img v-if="photos.length" :src="photos[frame].src" :alt="photos[frame].alt" class="hsc__img" />
      <template v-if="photos.length > 1">
        <button type="button" class="hsc__nav hsc__nav--prev" aria-label="Previous photo" @click="step(-1)">
          <q-icon name="chevron_left" size="22px" />
        </button>
        <button type="button" class="hsc__nav hsc__nav--next" aria-label="Next photo" @click="step(1)">
          <q-icon name="chevron_right" size="22px" />
        </button>
        <span class="hsc__count">{{ frame + 1 }} / {{ photos.length }}</span>
      </template>
      <span class="hsc__walk"><q-icon name="directions_walk" size="15px" /> {{ hotel.walkMin }} min walk</span>
    </div>

    <div class="hsc__body">
      <!-- The hotel NAME is the link to its details page. -->
      <h3 class="hsc__name">
        <button type="button" class="hsc__namelink" @click="emit('open-details', hotel)">
          {{ hotel.name }}
        </button>
        <span class="hsc__rating"><q-icon name="star" size="16px" /> {{ hotel.rating }}</span>
      </h3>
      <p class="hsc__meta">{{ hotel.brand }} · {{ hotel.distanceMi }} mi from Gillette Stadium</p>
      <p class="hsc__blurb">{{ hotel.blurb }}</p>

      <ul class="hsc__amenities">
        <li v-for="a in hotel.amenities" :key="a.key">
          <q-icon :name="a.icon" size="16px" /> {{ a.label }}
        </li>
      </ul>

      <div class="hsc__foot">
        <div class="hsc__price">
          <span class="hsc__from">from</span>
          <strong>{{ money(hotel.fromRate) }}</strong>
          <span class="hsc__unit">/ night</span>
          <span class="hsc__left">{{ hotel.roomsLeft }} rooms left for {{ guests }} guest{{ guests === 1 ? '' : 's' }}</span>
        </div>

        <div class="hsc__actions">
          <button type="button" class="hsc__details" @click="emit('open-details', hotel)">
            Hotel details
          </button>
          <q-btn unelevated no-caps color="primary" class="hsc__cta"
            label="Select a package" @click="emit('select-package', hotel)" />
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.hsc { display: flex; flex-direction: column; background: var(--ds-color-surface, #fff); border: 1px solid rgba(0,0,0,0.05); border-radius: 14px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,.04), 0 12px 28px rgba(0,0,0,.08); transition: box-shadow .15s, transform .15s; }
.hsc:hover { box-shadow: 0 4px 8px rgba(0,0,0,.06), 0 16px 36px rgba(0,0,0,.12); transform: translateY(-2px); }

.hsc__media { position: relative; aspect-ratio: 16 / 9; background: var(--ds-palette-slate-100, #f1f2f4); }
.hsc__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hsc__nav { position: absolute; top: 50%; transform: translateY(-50%); width: 36px; height: 36px; display: grid; place-items: center; border: 0; border-radius: 50%; background: rgba(255,255,255,.92); color: #16202e; cursor: pointer; opacity: 0; transition: opacity .15s; }
.hsc__media:hover .hsc__nav, .hsc__nav:focus-visible { opacity: 1; }
.hsc__nav--prev { left: 12px; }
.hsc__nav--next { right: 12px; }
.hsc__count { position: absolute; right: 12px; bottom: 12px; padding: 3px 10px; border-radius: 999px; background: rgba(0,0,0,.6); color: #fff; font-size: .8125rem; }
.hsc__walk { position: absolute; left: 12px; top: 12px; display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 999px; background: rgba(0,0,0,.65); color: #fff; font-size: .8125rem; font-weight: 700; }

.hsc__body { display: flex; flex-direction: column; gap: 8px; padding: 22px 24px 24px; flex: 1; }
.hsc__name { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin: 0; }
.hsc__namelink { background: none; border: 0; padding: 0; font: inherit; font-size: 1.5rem; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; text-align: left; }
.hsc__namelink:hover { color: var(--ds-color-text-brand); }
.hsc__rating { display: inline-flex; align-items: center; gap: 4px; font-weight: 600; color: var(--ds-color-text-subtle); }
.hsc__meta { margin: 0; color: var(--ds-color-text-subtle); }
.hsc__blurb { margin: 2px 0 0; color: var(--ds-color-text); }

.hsc__amenities { list-style: none; display: flex; flex-wrap: wrap; gap: 6px 8px; margin: 10px 0 0; padding: 0; }
.hsc__amenities li { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; background: var(--ds-color-surface-sunken, #f1f2f4); font-size: .875rem; }

.hsc__foot { margin-top: auto; padding-top: 18px; display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; flex-wrap: wrap; }
.hsc__price { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
.hsc__from { color: var(--ds-color-text-subtle); font-size: .875rem; }
.hsc__price strong { font-size: 1.625rem; color: var(--ds-color-text-brand); }
.hsc__unit { color: var(--ds-color-text-subtle); font-size: .9375rem; }
.hsc__left { flex-basis: 100%; font-size: .875rem; font-weight: 600; color: var(--ds-color-text-success, #167a4a); }

.hsc__actions { display: flex; align-items: center; gap: 14px; }
.hsc__details { background: none; border: 0; padding: 0; font: inherit; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }
.hsc__cta { height: 52px; padding: 0 26px; font-size: 1rem; font-weight: 700; }

@media (max-width: 700px) {
  .hsc__foot { flex-direction: column; align-items: stretch; }
  .hsc__actions { justify-content: space-between; }
}
</style>
