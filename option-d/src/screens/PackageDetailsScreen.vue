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
// --- ONE package, not both (Aug 6 feedback) ----------------------------------
// The template shows a GRID of packages on its Packages tab, and this page used
// to hand it both of Option D's, with the clicked one leading. The reasoning was
// that someone reading the detail could switch without going back a screen.
//
// In practice that made "View package details" open something other than what
// was asked for: you press the button on the Westin card and land on a page
// showing the Westin *and* the Ritz, which re-opens a decision you had already
// made. The board is where the two are compared — that is its whole job, and it
// is one click away. This page answers a narrower question: tell me about THIS
// one.
//
// So the page carries only the active package now. Switching still costs exactly
// one click (the template's own back link, wired to the board below).
import { computed } from 'vue'
import PackageDetailPage from '@lib/components/PackageDetailPage.vue'
import { gallery, experiences, policies } from '@lib/stories/packagedetails/_pd-components-data.js'
import { journey, activePkg, selectPackage, nav, setTab } from '../store.js'
import { EVENT } from '../event.js'
import { STAY_LABEL, STAY_SHORT, TIER } from '../packages.js'

// The template renders PackageCards from this, so it needs the shape a card
// reads: theme, componentsTotal, packagePrice, savings, quantity. One entry —
// the package that was opened.
const templatePackages = computed(() => {
  const p = activePkg.value
  if (!p) return []
  return [{
    ...p,
    theme: `${p.hotel.name} · ${STAY_SHORT}`,
    icon: 'hotel',
    quantity: p.guests,
    experiences: [
      { icon: 'confirmation_number', label: `${p.guests} × ${TIER.name} ticket${p.guests === 1 ? '' : 's'}` },
      { icon: 'directions_bus', label: 'Round-trip transportation' },
      { icon: 'celebration', label: 'Pregame hospitality' },
    ],
  }]
})

// Option D's own copy in place of the library sample's.
//
// The middle paragraph used to open "Both packages carry exactly the same
// inclusions…", which only parsed when both were on the page. With one package
// showing, it now describes THIS package and names the other as the alternative
// waiting on the board — the comparison is still stated, just from the point of
// view of the package you opened.
const about = computed(() => {
  const p = activePkg.value
  const hotel = p?.hotel?.name || 'your hotel'
  return [
    `EventPipe is hosting its top customers at Gillette Stadium for ${EVENT.name} on ${EVENT.dateLabel}. Your party is booked in for ${STAY_SHORT} — ${STAY_LABEL} — and everything around the game is already arranged.`,
    `This package puts you at ${hotel}. It carries Club Level tickets seated together in one block, round-trip coach transportation between the hotel and the stadium on both days, and pregame hospitality in the EventPipe tent. The alternative package is identical in every one of those respects — the only thing that changes is the hotel, and it is one click back on the packages page.`,
    `Rooms are held under the EventPipe block at ${hotel}. Check-in is from 3:00 PM and check-out is by 11:00 AM; the coach runs from the hotel lobby.`,
  ]
})

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

/* The template's packages-section subtitle reads "Pre-built ticket + experience
   bundles, each with an optional hotel stay. Select a package for a quick view."
   With ONE package on the page (Aug 6 feedback) there is nothing to select
   among, so the sentence invites an action the page no longer offers. The
   heading above it still names the section; only the stale instruction goes. */
.xpd :deep(#pdp-packages .pdp__sub) { display: none; }
</style>
