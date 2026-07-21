<script setup>
// PackageDetailPage — the event's ticket + package offerings on one screen, laid
// out like the Book Reservation hotel-details page: a photo gallery hero, a
// sticky section-tab nav, an event summary header, then the offerings —
// Overview, Tickets (all tiers), Packages (every experience package), the
// signature Experiences, and Policies. Reuses the Hotel Details building blocks
// (GalleryHero, DetailTabs, PoliciesSection) alongside the ticketing components
// (TicketTierList, PackageCard).
import { ref, computed } from 'vue'
import GalleryHero from './details/GalleryHero.vue'
import DetailTabs from './details/DetailTabs.vue'
import PoliciesSection from './details/PoliciesSection.vue'
import TicketTierList from './TicketTierList.vue'
import PackageCard from './PackageCard.vue'

const props = defineProps({
  event: { type: Object, required: true },
  gallery: { type: Array, default: () => [] },        // [{ src, title }]
  packages: { type: Array, default: () => [] },        // generateExperiencePackages()
  experiences: { type: Array, default: () => [] },     // [{ icon, label, theme }]
  about: { type: Array, default: () => [] },           // paragraphs
  policies: { type: Array, default: () => [] },        // [{ title, body }]
  host: { type: String, default: 'EventPipe' },
  eyebrow: { type: String, default: 'Client Appreciation' },
})
const emit = defineEmits(['back', 'select'])

const tabs = [
  { name: 'overview', label: 'Overview' },
  { name: 'tickets', label: 'Tickets' },
  { name: 'packages', label: 'Packages' },
  { name: 'experiences', label: 'Experiences' },
  { name: 'policies', label: 'Policies' },
]
const activeTab = ref('overview')
const root = ref(null)
const selectedId = ref(null)
const pick = (p) => { selectedId.value = p.id; emit('select', p) }

const onTab = (name) => {
  if (name === 'overview') { root.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
  root.value?.querySelector(`#pdp-${name}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const dateLabel = computed(() => {
  const raw = props.event?.date
  if (!raw) return null
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return String(raw)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
})
const venueLabel = computed(() => {
  const v = props.event?.venue
  if (!v) return null
  const city = v.city?.name || v.city || null
  return [v.name, city].filter(Boolean).join(' · ') || null
})
</script>

<template>
  <div ref="root" class="pdp">
    <!-- Back to the offerings list / previous screen -->
    <button type="button" class="pdp__back" @click="emit('back')">
      <q-icon name="chevron_left" size="22px" /> Back to event
    </button>

    <!-- Photo hero gallery -->
    <gallery-hero :images="gallery" :all-images="gallery" modal-title="Gameday & experiences" />

    <!-- Section nav -->
    <div class="pdp__tabs">
      <detail-tabs v-model="activeTab" :tabs="tabs" @select="onTab" />
    </div>

    <!-- Event summary header -->
    <header class="pdp__summary">
      <p class="pdp__eyebrow"><q-icon name="star" size="14px" /> {{ host }} · {{ eyebrow }}</p>
      <h1 class="pdp__name">{{ event.name }}</h1>
      <div class="pdp__meta">
        <span v-if="dateLabel"><q-icon name="event" size="18px" /> {{ dateLabel }}</span>
        <span v-if="venueLabel"><q-icon name="place" size="18px" /> {{ venueLabel }}</span>
      </div>
    </header>

    <!-- Overview / About -->
    <section id="pdp-overview" class="pdp__section">
      <h2 class="pdp__h">About this outing</h2>
      <p v-for="(p, i) in about" :key="i" class="pdp__p">{{ p }}</p>
    </section>

    <!-- Tickets — every tier for this event -->
    <section id="pdp-tickets" class="pdp__section pdp__section--ruled">
      <h2 class="pdp__h">Tickets</h2>
      <p class="pdp__sub">Pick your level — prices are per ticket for {{ event.name }}.</p>
      <ticket-tier-list :event="event" />
    </section>

    <!-- Packages — every experience package -->
    <section id="pdp-packages" class="pdp__section pdp__section--ruled">
      <h2 class="pdp__h">Patriots experience packages</h2>
      <p class="pdp__sub">Pre-built ticket + experience bundles, each with an optional hotel stay.</p>
      <div class="pdp__pkgs">
        <package-card v-for="p in packages" :key="p.id" :pkg="p" :selected="p.id === selectedId" @select="pick" />
      </div>
    </section>

    <!-- Experiences — the signature add-ons across packages -->
    <section id="pdp-experiences" class="pdp__section pdp__section--ruled">
      <h2 class="pdp__h">Signature experiences</h2>
      <p class="pdp__sub">The extras that make each package — mix and match with any ticket.</p>
      <div class="pdp__exps">
        <div v-for="(x, i) in experiences" :key="i" class="pdp__exp">
          <q-icon :name="x.icon" size="22px" class="pdp__expicon" />
          <div>
            <span class="pdp__explabel">{{ x.label }}</span>
            <span v-if="x.theme" class="pdp__exptheme">{{ x.theme }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Policies -->
    <section id="pdp-policies" class="pdp__section pdp__section--ruled">
      <policies-section title="Ticketing & event policies" :policies="policies" />
    </section>
  </div>
</template>

<style scoped>
.pdp { max-width: 1180px; margin: 0 auto; padding: 18px 24px 60px; display: flex; flex-direction: column; font-family: var(--ds-font-family); }
.pdp__back { align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; margin: 0 0 16px; padding: 6px 0; background: none; border: 0; color: var(--ds-color-text); font-family: inherit; font-size: 1.125rem; font-weight: 700; cursor: pointer; }
.pdp__back:hover { color: var(--ds-color-text-brand); }
.pdp__back .q-icon { color: inherit; }

.pdp__tabs { position: sticky; top: 0; z-index: 5; background: var(--ds-color-surface); margin: 24px 0; }

.pdp__summary { padding-top: 20px; }
.pdp__eyebrow { display: inline-flex; align-items: center; gap: 6px; margin: 0 0 10px; padding: 5px 12px; border-radius: var(--ds-radius-pill); background: var(--ds-palette-navy-700); color: #fff; font-size: var(--ds-font-size-sm); font-weight: var(--ds-font-weight-bold); }
.pdp__name { margin: 0; font-size: clamp(1.5rem, 3vw, 2.25rem); line-height: 1.15; font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.pdp__meta { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 12px; color: var(--ds-color-text-subtle); font-weight: var(--ds-font-weight-medium); }
.pdp__meta span { display: inline-flex; align-items: center; gap: 6px; }
.pdp__meta .q-icon { color: var(--ds-color-text); }

.pdp__section { padding-top: 28px; }
.pdp__section--ruled { margin-top: 20px; border-top: 1px solid var(--ds-color-border); padding-top: 32px; }
.pdp__h { margin: 0 0 6px; font-size: 1.375rem; font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.pdp__sub { margin: 0 0 18px; color: var(--ds-color-text-subtle); }
.pdp__p { margin: 0 0 12px; color: var(--ds-color-text); line-height: 1.6; max-width: 760px; }

.pdp__pkgs { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; }
.pdp__exps { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.pdp__exp { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); background: var(--ds-color-surface); }
.pdp__expicon { color: var(--ds-color-text-brand); flex: none; }
.pdp__explabel { display: block; font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.pdp__exptheme { display: block; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); margin-top: 2px; }
</style>
