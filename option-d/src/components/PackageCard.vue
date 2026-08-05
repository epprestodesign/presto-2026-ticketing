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
import { computed } from 'vue'

const props = defineProps({
  pkg: { type: Object, required: true },
  // Marks the card the guest is comparing against — used for the "same package"
  // framing, never to rank the two.
  featured: { type: Boolean, default: false },
})
const emit = defineEmits(['view', 'open-hotel'])

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: props.pkg.currency || 'USD', maximumFractionDigits: 0 }).format(n || 0)

const roomsLabel = computed(() => {
  const { rooms, guests } = props.pkg
  const r = `${rooms} room${rooms === 1 ? '' : 's'}`
  return `${r} · sleeps ${props.pkg.hotel.sleeps} each · ${guests} guest${guests === 1 ? '' : 's'}`
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
      <div class="pc__price">
        <span class="pc__was">{{ money(pkg.componentsTotal) }}</span>
        <strong class="pc__now">{{ money(pkg.packagePrice) }}</strong>
        <small class="pc__per">{{ money(pkg.perPerson) }} per person · all in</small>
      </div>
      <!-- "View Package", not "Choose": the card is a summary, and the decision
           happens on the package template page this opens. -->
      <q-btn unelevated color="primary" class="pc__cta" label="View Package"
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

.pc__foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-top: auto; padding-top: 14px; border-top: 1px solid var(--ds-color-border); }
.pc__price { display: flex; flex-direction: column; min-width: 0; }
.pc__was { font-size: .875rem; color: var(--ds-color-text-subtle); text-decoration: line-through; }
.pc__now { font-size: 1.75rem; font-weight: 800; line-height: 1.1; color: var(--ds-color-text); }
.pc__per { font-size: .8125rem; color: var(--ds-color-text-subtle); }
.pc__cta { font-weight: 700; }

@media (max-width: 640px) {
  .pc__foot { flex-direction: column; align-items: stretch; }
  .pc__cta { width: 100%; }
}
</style>
