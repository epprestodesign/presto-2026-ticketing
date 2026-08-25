<script setup>
// Screen 2 — the package template page. Everything the package includes.
//
// The library's own `PackageDetailPage`: gallery, value props, the packages tab,
// policies — the same template /experience-packages uses, mounted as shipped.
// Nothing hand-rolled, and no library file touched.
//
// It carries ONE package — the one that was opened. The board is where the three
// are compared; this page answers the narrower question the guest asked by
// pressing "View package details": tell me about THIS one.
//
// --- Its job in this flow ----------------------------------------------------
// This is the read, and the last screen where the package is still the package as
// sold. Its Select CTA goes to CUSTOMIZE rather than to checkout, which is the
// one substantive difference from the sibling prototypes: here the package is a
// starting point, so "yes, this one" means "now let me change it", not "bill me".
//
// The inclusion list it renders comes from the live configuration, so a guest who
// customises, comes back here and reads again is reading what they now hold — not
// the preset they arrived on.
import { computed } from 'vue'
import PackageDetailPage from '@lib/components/PackageDetailPage.vue'
import { gallery, experiences, policies } from '@lib/stories/packagedetails/_pd-components-data.js'
import { journey, activePkg, basePackage, isCustomized, customizePackage, nav, setTab } from '../store.js'
import { EVENT } from '../event.js'
import { STAY_LABEL, STAY_SHORT } from '../packages.js'

// The template renders its own PackageCards from this, so it needs the shape a
// card reads: theme, componentsTotal, packagePrice, savings, quantity.
const templatePackages = computed(() => {
  const p = activePkg.value
  return [{
    ...p,
    theme: `${p.hotel.name} · ${STAY_SHORT}`,
    quantity: p.guests,
    experiences: p.inclusions.map((i) => ({ icon: i.icon, label: i.label })),
  }]
})

// This prototype's copy in place of the library sample's. The middle paragraph is
// built from the CONFIGURATION rather than written out, because on this screen
// the configuration is the thing that can have changed since the package was
// named.
const about = computed(() => {
  const p = activePkg.value
  const extras = p.extras.filter((e) => e.price > 0).map((e) => e.label.toLowerCase())
  const extrasSentence = extras.length
    ? `It also carries ${extras.slice(0, -1).join(', ')}${extras.length > 1 ? ' and ' : ''}${extras[extras.length - 1]}.`
    : 'No extras are attached — tickets and the stay only.'
  return [
    `EventPipe is hosting its top customers at Gillette Stadium for ${EVENT.name} on ${EVENT.dateLabel}. Your party is booked in for ${STAY_SHORT} — ${STAY_LABEL} — and everything around the game is arranged for you.`,
    `${basePackage.value.name} puts ${p.guests} of you in ${p.tier.name} seats, together in one block, and ${p.rooms} × ${p.room.name} at ${p.hotel.name}. ${extrasSentence}`,
    `Every one of those is a choice, not a fixture. Continue to the customize screen to change the ticket level, move to one of the other two hotels, pick a different room, or add and drop extras — the price re-adds itself as you go. Only the dates are fixed: your party is invited for the weekend.`,
  ]
})
</script>

<template>
  <div class="xpd">
    <p v-if="isCustomized" class="xpd__note">
      <q-icon name="edit" size="18px" />
      <span>
        <strong>You've customised this package.</strong>
        What's listed below is your version of {{ basePackage.name }}, not the one on the board.
      </span>
    </p>

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
      @select="customizePackage(journey.config.pkgId)"
    />
  </div>
</template>

<style scoped>
.xpd { display: flex; flex-direction: column; flex: 1; }

.xpd__note { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 0; padding: 12px 24px; background: var(--ds-color-surface-sunken, #f1f2f4); border-bottom: 1px solid var(--ds-color-border); color: var(--ds-color-text); }

/* --- Packages first ----------------------------------------------------------
   The library template orders its sections Overview → Experiences → Packages →
   Policies, which is right when the packages are one offering among many. Here
   they ARE the page: the guest arrived by pressing "View package details", so
   three sections of preamble bury the thing they asked for.

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

/* With ONE package on the page there is nothing to select among, so the
   template's "Select a package for a quick view" subtitle invites an action this
   page doesn't offer. The heading above it still names the section. */
.xpd :deep(#pdp-packages .pdp__sub) { display: none; }

/* The library card ships a party-size stepper that re-prices ITSELF and emits
   `update:guests`, which this template doesn't forward. In the sibling
   prototypes that is merely inert; here it is actively wrong — this is the
   prototype where party size IS editable, one screen further on, against a price
   that actually moves. A control that silently disagrees with the real one is
   worse than no control, so it is hidden here and offered where it works. */
.xpd :deep(#pdp-packages .pkg__guests) { display: none !important; }
</style>
