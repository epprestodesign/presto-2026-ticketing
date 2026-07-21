<script setup>
// ViewFromSeat — the SeatGeek-style "look at the seat you're buying" hero: a
// photo of the view toward the field/stage with a "Look around 360°" affordance,
// a deal score, and the section/row + price. PROTOTYPE: the photo is a stock
// (Unsplash) stand-in, not a real view from this seat — Ticketmaster provides no
// seat-view imagery. Unsplash attribution is rendered as required.
import DealScoreBadge from './DealScoreBadge.vue'

const props = defineProps({
  photo: { type: Object, required: true },      // { url, alt, photographer, photographerUrl, photoUrl }
  section: { type: [String, Number], default: null },
  row: { type: [String, Number], default: null },
  dealScore: { type: Number, default: null },
  price: { type: Number, default: null },
  currency: { type: String, default: 'USD' },
  has360: { type: Boolean, default: true },
})
const emit = defineEmits(['look-around'])

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: props.currency, maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <div class="vfs">
    <div class="vfs__frame">
      <img :src="photo.url" :alt="photo.alt || `View from section ${section}`" class="vfs__img" loading="lazy" />
      <button v-if="has360" type="button" class="vfs__look" @click="emit('look-around')">
        <q-icon name="360" size="16px" /> Look around
      </button>
      <span v-if="dealScore != null" class="vfs__deal">
        <DealScoreBadge :score="dealScore" size="sm" />
      </span>
    </div>

    <div class="vfs__meta">
      <div>
        <div class="vfs__seat">Section {{ section }}<template v-if="row">, Row {{ row }}</template></div>
        <div class="vfs__attr">
          Photo by
          <a :href="photo.photographerUrl" target="_blank" rel="noopener">{{ photo.photographer }}</a>
          on <a :href="photo.photoUrl" target="_blank" rel="noopener">Unsplash</a>
        </div>
      </div>
      <div v-if="price != null" class="vfs__price">{{ fmt(price) }}<span>incl. fees</span></div>
    </div>
  </div>
</template>

<style scoped>
.vfs { font-family: var(--ds-font-family); display: flex; flex-direction: column; gap: var(--ds-space-2); }
.vfs__frame {
  position: relative; border-radius: var(--ds-radius-lg); overflow: hidden;
  aspect-ratio: 16 / 10; background: var(--ds-color-surface-sunken);
}
.vfs__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.vfs__look {
  position: absolute; left: 10px; bottom: 10px; display: inline-flex; align-items: center; gap: 4px;
  background: rgba(0, 0, 0, 0.66); color: #fff; border: none; cursor: pointer;
  padding: 6px 12px; border-radius: var(--ds-radius-pill);
  font-family: inherit; font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold);
}
.vfs__look:hover { background: rgba(0, 0, 0, 0.8); }
.vfs__deal {
  position: absolute; left: 10px; top: 10px; background: var(--ds-color-surface);
  padding: 3px 7px; border-radius: var(--ds-radius-sm); box-shadow: var(--ds-shadow-1, 0 1px 3px rgba(0,0,0,.2));
}
.vfs__meta { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--ds-space-3); }
.vfs__seat { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.vfs__attr { font-size: 11px; color: var(--ds-color-text-subtlest); margin-top: 2px; }
.vfs__attr a { color: var(--ds-color-text-subtle); }
.vfs__price { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); white-space: nowrap; }
.vfs__price span { display: block; font-size: 11px; font-weight: 400; color: var(--ds-color-text-subtle); text-align: right; }
</style>
