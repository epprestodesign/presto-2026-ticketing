<script setup>
// PackageDetailPage — the event's package offerings on one screen, laid out like
// the Book Reservation hotel-details page: a photo gallery hero, a sticky
// section-tab nav, an event summary header, then the offerings — Overview (with
// value props + a Read more), the signature Experiences (promoted up), the
// Packages, and Policies. Reuses the Hotel Details building blocks (GalleryHero,
// DetailTabs, PoliciesSection). Each package card opens a condensed quick-view.
import { ref, computed, onMounted, nextTick } from 'vue'
import GalleryHero from './details/GalleryHero.vue'
import DetailTabs from './details/DetailTabs.vue'
import PoliciesSection from './details/PoliciesSection.vue'
import PackageCard from './PackageCard.vue'
import PackageSummary from './PackageSummary.vue'
import PackageExperiences from './PackageExperiences.vue'
import PackageQuickViewDialog from './PackageQuickViewDialog.vue'

const DEFAULT_VALUE_PROPS = [
  { icon: 'inventory_2', title: 'Everything handled', text: 'Tickets, hotel, and signature extras bundled into one plan — no juggling logistics.' },
  { icon: 'verified', title: 'Verified premium seats', text: 'Real ticket levels for this game, sourced and protected through EventPipe.' },
  { icon: 'savings', title: 'One simple price', text: 'Bundle savings baked in — what you see is what your group pays.' },
  { icon: 'support_agent', title: 'Gameday concierge', text: 'We sweat the details so your crew just shows up and enjoys the day.' },
]

const props = defineProps({
  event: { type: Object, required: true },
  gallery: { type: Array, default: () => [] },        // [{ src, title }]
  packages: { type: Array, default: () => [] },        // generateExperiencePackages()
  experiences: { type: Array, default: () => [] },     // [{ icon, label, theme }]
  about: { type: Array, default: () => [] },           // paragraphs
  policies: { type: Array, default: () => [] },        // [{ title, body }]
  valueProps: { type: Array, default: () => [] },      // [{ icon, title, text }] — falls back to DEFAULT_VALUE_PROPS
  host: { type: String, default: 'EventPipe' },
  eyebrow: { type: String, default: 'Client Appreciation' },
  // The section tab to open on load — enables deep-linking to a section
  // (overview · experiences · packages · policies).
  initialTab: { type: String, default: 'overview' },
})
const emit = defineEmits(['back', 'select', 'update:tab'])

const tabs = [
  { name: 'overview', label: 'Overview' },
  { name: 'experiences', label: 'Experiences' },
  { name: 'packages', label: 'Packages' },
  { name: 'policies', label: 'Policies' },
]
const activeTab = ref(props.initialTab || 'overview')
const root = ref(null)
const selectedId = ref(null)
const vProps = computed(() => (props.valueProps.length ? props.valueProps : DEFAULT_VALUE_PROPS))

// About: show the first paragraph, reveal the rest behind "Read more".
const aboutOpen = ref(false)
const aboutLead = computed(() => props.about[0])
const aboutRest = computed(() => props.about.slice(1))

// Condensed per-package quick view.
const quickOpen = ref(false)
const quickPkg = ref(null)
const openQuick = (p) => { quickPkg.value = p; quickOpen.value = true; selectedId.value = p.id; emit('select', p) }
const onQuickCustomize = (p) => { quickOpen.value = false; emit('select', p) }

const onTab = (name) => {
  emit('update:tab', name) // reflect the section in the URL for deep-linking
  if (name === 'overview') { root.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
  root.value?.querySelector(`#pdp-${name}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Deep-link entry: if opened on a non-overview tab, scroll to that section on
// load. Re-apply as the gallery images finish loading (layout shifts down), so
// the section stays pinned to the top instead of drifting off-screen.
onMounted(() => {
  if (!props.initialTab || props.initialTab === 'overview') return
  const scrollToSection = () => root.value?.querySelector(`#pdp-${props.initialTab}`)?.scrollIntoView({ block: 'start' })
  nextTick(scrollToSection)
  ;[150, 400, 900].forEach((ms) => setTimeout(scrollToSection, ms))
  if (typeof window !== 'undefined') window.addEventListener('load', scrollToSection, { once: true })
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
    <package-summary class="pdp__summary" :event="event" :host="host" :eyebrow="eyebrow" />

    <!-- Overview / About — lead paragraph + Read more, then value props -->
    <section id="pdp-overview" class="pdp__section">
      <h2 class="pdp__h">About this outing</h2>
      <p v-if="aboutLead" class="pdp__p">{{ aboutLead }}</p>
      <template v-if="aboutRest.length">
        <template v-if="aboutOpen">
          <p v-for="(p, i) in aboutRest" :key="i" class="pdp__p">{{ p }}</p>
        </template>
        <button type="button" class="pdp__readmore" @click="aboutOpen = !aboutOpen">
          {{ aboutOpen ? 'Read less' : 'Read more' }}
          <q-icon :name="aboutOpen ? 'expand_less' : 'expand_more'" size="18px" />
        </button>
      </template>

      <!-- Helpful value props -->
      <ul class="pdp__vp">
        <li v-for="(v, i) in vProps" :key="i" class="pdp__vpitem">
          <q-icon :name="v.icon" size="24px" class="pdp__vpicon" />
          <div><span class="pdp__vptitle">{{ v.title }}</span><span class="pdp__vptext">{{ v.text }}</span></div>
        </li>
      </ul>
    </section>

    <!-- Experiences — the signature add-ons across packages (promoted up) -->
    <section id="pdp-experiences" class="pdp__section pdp__section--ruled">
      <h2 class="pdp__h">Signature experiences</h2>
      <p class="pdp__sub">The extras that make each package — mix and match with any ticket.</p>
      <package-experiences :experiences="experiences" />
    </section>

    <!-- Packages — every experience package -->
    <section id="pdp-packages" class="pdp__section pdp__section--ruled">
      <h2 class="pdp__h">Patriots experience packages</h2>
      <p class="pdp__sub">Pre-built ticket + experience bundles, each with an optional hotel stay. Select a package for a quick view.</p>
      <div class="pdp__pkgs">
        <package-card v-for="p in packages" :key="p.id" :pkg="p" :selected="p.id === selectedId" @select="openQuick" @title="openQuick" />
      </div>
    </section>

    <!-- Policies -->
    <section id="pdp-policies" class="pdp__section pdp__section--ruled">
      <policies-section title="Ticketing & event policies" :policies="policies" />
    </section>

    <!-- Condensed per-package quick view -->
    <q-dialog v-model="quickOpen">
      <package-quick-view-dialog v-if="quickPkg" :pkg="quickPkg" @close="quickOpen = false" @select="onQuickCustomize" @customize="onQuickCustomize" />
    </q-dialog>
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

.pdp__readmore { display: inline-flex; align-items: center; gap: 4px; margin-top: 2px; background: none; border: 0; padding: 0; font: inherit; font-weight: 700; color: var(--ds-color-text-brand); cursor: pointer; }
.pdp__readmore:hover { text-decoration: underline; }

.pdp__vp { list-style: none; margin: 24px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; }
.pdp__vpitem { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); background: var(--ds-color-surface); }
.pdp__vpicon { color: var(--ds-color-text-brand); flex: none; margin-top: 1px; }
.pdp__vpitem > div { display: flex; flex-direction: column; gap: 3px; }
.pdp__vptitle { font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.pdp__vptext { font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); line-height: 1.45; }

.pdp__pkgs { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; }
.pdp__exps { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.pdp__exp { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); background: var(--ds-color-surface); }
.pdp__expicon { color: var(--ds-color-text-brand); flex: none; }
.pdp__explabel { display: block; font-weight: var(--ds-font-weight-bold); color: var(--ds-color-text); }
.pdp__exptheme { display: block; font-size: var(--ds-font-size-sm); color: var(--ds-color-text-subtle); margin-top: 2px; }
</style>
