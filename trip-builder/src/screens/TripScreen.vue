<script setup>
// Your trip — the same TripItems body the fly-out carries, given a page and a
// price rail.
//
// It is a destination rather than a stage: nothing about it says "step 3 of 4",
// and every screen can be reached from it in one press. The three entry points
// converge here, which is the point of the prototype — a guest who started on
// add-ons and a guest who started on hotels are looking at the same page, with
// the same controls, in whatever composition they built.
//
// The empty state is TripItems' own, and it is not an error screen. On a flow
// with no fixed first step, arriving here with nothing in the cart is an ordinary
// thing to do, so the page shows three offers rather than an apology.
import { computed } from 'vue'
import TripItems from '../components/TripItems.vue'
import TripTotals from '../components/TripTotals.vue'
import { isEmpty, count, openStayEditor, nav } from '../store.js'
import { EVENT, EVENT_DATE } from '../trip.js'

const summary = computed(() => `${count.value} item${count.value === 1 ? '' : 's'} for ${EVENT.name}`)
</script>

<template>
  <div class="tp">
    <div class="tp__inner">
      <header class="tp__head">
        <h1 class="tp__h1">Your trip</h1>
        <p class="tp__sub">
          <template v-if="!isEmpty">{{ summary }} · {{ EVENT_DATE }}. Change or drop any line — the rest stays exactly as it is.</template>
          <template v-else>Nothing in it yet. Whatever you add first is a complete trip on its own.</template>
        </p>
      </header>

      <div class="tp__grid" :class="{ 'tp__grid--solo': isEmpty }">
        <div class="tp__main">
          <trip-items variant="page" @edit-stay="(line) => openStayEditor(line.hotelId, line)" />
        </div>

        <aside v-if="!isEmpty" class="tp__rail">
          <div class="tp__card">
            <trip-totals />
          </div>
          <button type="button" class="tp__cta" @click="nav('checkout')">
            Checkout <q-icon name="arrow_forward" size="18px" />
          </button>
          <p class="tp__note">
            <q-icon name="lock" size="14px" />
            Nothing is charged and nothing is held until you check out — come back and change any of it.
          </p>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tp { background: var(--ds-palette-neutral-100, #f5f5f7); min-height: 100%; padding: 16px 0 56px; flex: 1; }
.tp__inner { width: 100%; max-width: min(1080px, 92%); margin: 0 auto; }
.tp__head { margin: 8px 0 20px; }
.tp__h1 { margin: 0; font-family: var(--ds-font-family); font-size: 1.75rem; font-weight: 800; color: var(--ds-color-text); }
.tp__sub { margin: 6px 0 0; max-width: 70ch; color: var(--ds-color-text-subtle); }

.tp__grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 28px; align-items: start; }
/* An empty trip has no total to show, so the rail doesn't linger as an empty
   card beside it — the offers get the whole width. */
.tp__grid--solo { grid-template-columns: minmax(0, 1fr); }
.tp__main { background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg, 12px); padding: 20px; }

.tp__rail { position: sticky; top: 76px; display: flex; flex-direction: column; gap: 14px; }
.tp__card { background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg, 12px); padding: 18px; }
.tp__cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 52px; border: 0; border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font: inherit; font-weight: 700; font-size: 1rem; cursor: pointer; }
.tp__note { display: flex; align-items: flex-start; justify-content: center; gap: 6px; margin: 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }

@media (max-width: 900px) {
  .tp__grid { grid-template-columns: minmax(0, 1fr); }
  .tp__rail { position: static; }
}
</style>
