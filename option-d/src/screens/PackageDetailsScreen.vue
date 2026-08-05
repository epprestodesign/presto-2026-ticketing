<script setup>
// Screen 2 — the package template page.
//
// "View Package" on a card opens this: the library's own `PackageDetailPage` —
// gallery, value props, what's included, the packages tab, policies — the same
// template /experience-packages uses. Nothing hand-rolled.
//
// This is where the booking decision actually happens now. The cards on screen 1
// no longer go straight to checkout; they hand off to this page, and its Select
// CTA continues to checkout. So the card is a summary and this is the detail,
// which is what "View Package" promises.
//
// The template shows a grid of packages on its Packages tab. Option D has only
// two, and they are the same two from screen 1 — so opening from the Ritz card
// still shows both, with the Ritz one first. That is deliberate: someone who
// clicked in to read the detail should still be able to switch without going
// back a screen.
import { computed } from 'vue'
import PackageDetailPage from '@lib/components/PackageDetailPage.vue'
import { gallery, experiences, policies } from '@lib/stories/packagedetails/_pd-components-data.js'
import { packages, journey, activePkg, selectPackage, nav, setTab } from '../store.js'
import { EVENT } from '../event.js'
import { STAY_LABEL, STAY_SHORT, TIER } from '../packages.js'

// The package clicked leads, so the page opens on what was asked for.
const ordered = computed(() => {
  const list = packages.value
  const active = activePkg.value
  if (!active) return list
  return [active, ...list.filter((p) => p.id !== active.id)]
})

// The template renders PackageCards from this, so each needs the shape a card
// reads: theme, componentsTotal, packagePrice, savings, quantity.
const templatePackages = computed(() =>
  ordered.value.map((p) => ({
    ...p,
    theme: `${p.hotel.name} · ${STAY_SHORT}`,
    icon: 'hotel',
    quantity: p.guests,
    experiences: [
      { icon: 'confirmation_number', label: `${p.guests} × ${TIER.name} ticket${p.guests === 1 ? '' : 's'}` },
      { icon: 'directions_bus', label: 'Round-trip transportation' },
      { icon: 'celebration', label: 'Pregame hospitality' },
    ],
  }))
)

// Option D's own copy in place of the library sample's.
const about = [
  `EventPipe is hosting its top customers at Gillette Stadium for ${EVENT.name} on ${EVENT.dateLabel}. Your party is booked in for ${STAY_SHORT} — ${STAY_LABEL} — and everything around the game is already arranged.`,
  'Both packages carry exactly the same inclusions: Club Level tickets seated together in one block, round-trip coach transportation between the hotel and the stadium on both days, and pregame hospitality in the EventPipe tent. The only difference between them is which hotel you stay at.',
  'Rooms are held under the EventPipe block at both properties. Check-in is from 3:00 PM and check-out is by 11:00 AM; the coach runs from each hotel lobby.',
]

const select = (pkg) => selectPackage(pkg)
</script>

<template>
  <div class="xpd">
    <package-detail-page
      :event="EVENT"
      :packages="templatePackages"
      :gallery="gallery"
      :experiences="experiences"
      :about="about"
      :policies="policies"
      :initial-tab="journey.tab"
      eyebrow="Client Appreciation"
      @update:tab="setTab"
      @back="nav('packages')"
      @select="select"
    />
  </div>
</template>

<style scoped>
.xpd { display: flex; flex-direction: column; flex: 1; }

/* --- Packages first ----------------------------------------------------------
   The library template orders its sections Overview → Experiences → Packages →
   Policies, which is right when the packages are one offering among many. Here
   they ARE the page: the guest arrived by pressing "View Package", so making them
   read three sections of preamble first buries the thing they asked for.

   Reordered in CSS rather than by forking the template. `.pdp` is a plain block
   container, so it becomes a flex column and the sections get an explicit order;
   everything above them (back link, gallery, tabs, event summary) keeps the
   default `order: 0` and so stays put, in DOM order, at the top. */
.xpd :deep(.pdp) { display: flex; flex-direction: column; }
.xpd :deep(#pdp-packages) { order: 1; }
.xpd :deep(#pdp-overview) { order: 2; }
.xpd :deep(#pdp-experiences) { order: 3; }
.xpd :deep(#pdp-policies) { order: 4; }

/* Overview loses its position as the first section, so it needs the divider the
   template only gives to the sections that follow one. */
.xpd :deep(#pdp-overview) {
  margin-top: 20px;
  border-top: 1px solid var(--ds-color-border);
  padding-top: 32px;
}

/* The section-tab nav has to agree with the new order, or the tabs read
   Overview → Experiences → Packages while the page reads Packages first.
   `.dtabs` is already a flex row; the buttons carry no per-tab hook, so this is
   positional — the third tab is Packages. Brittle only if the library adds or
   reorders a tab, and it fails visibly (the wrong tab jumps first) rather than
   silently. */
.xpd :deep(.dtabs__tab:nth-child(3)) { order: -1; }
</style>
