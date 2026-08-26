<script setup>
// The full cart — a page, not a dialog, and the thing the nav's peek links to.
//
// --- What a cart page IS when the order is one configured package -------------
// Every other cart in this repo lists independent items: a ticket line, a hotel
// line, an experience line, each of which could be removed without touching the
// others. This flow sells ONE package, and its parts are not independent — the
// stay's price depends on the party size, the room count depends on occupancy,
// the extras multiply by heads and rooms and nights, and the 12% comes off all of
// it together. Listing "1 × The Club Weekend — $2,812" and stopping there would
// be accurate and useless: it is the components the guest spent the last screen
// choosing, and a cart that hides them is a cart that cannot be checked.
//
// So the page is ONE package with its components listed underneath — the same
// rows the rail itemises, in the same order, from the same `breakdownLines()`.
// A line per component with no package around them was the other candidate and
// was rejected: it would imply the lines are separately removable, and removing
// "the stay" from a package that is 12% off BECAUSE it bundles a stay is not a
// thing this flow can honour.
//
// --- Editable in place, without a second editor -------------------------------
// Each line's "Change" goes back to the customize screen and lands on the control
// that owns it (see `editSection()` in the store for the full argument). The
// guest's configuration is intact, the page is scrolled to the right section, and
// nothing restarts — which is what "editable without restarting the flow" means
// from where the guest is sitting.
//
// The single edit this page does perform is dropping an add-on, because it is one
// call to the same `toggleExtra()` the customize screen calls: there is no second
// implementation, so there is nothing to drift. Transport lines get "Change"
// instead of "Remove" — Getting there is single-choice and must always have an
// answer, so removing the coach has to be a swap, not a deletion.
//
// Rebuilding the tier ladder, the hotel list or the room list here was rejected
// outright. Each of those rows carries a live delta priced against the package
// total; a second copy would either recompute those deltas (a fork of the one
// function allowed to do arithmetic) or omit them, and a chooser that no longer
// tells you what a choice costs is worse than a link to the one that does.
//
// --- Layout ------------------------------------------------------------------
// The same two-column shape as the customize screen — contents left, money right
// — because it is the same package and the guest arrives from that screen. The
// rail is `PriceRail` with `itemised` off: the totals, the discount, the CTA and
// the reset are identical on both screens, so they are the same component, and
// only the rows it would duplicate are switched off.
import DsCard from '@lib/components/DsCard.vue'
import DsEmptyState from '@lib/components/DsEmptyState.vue'
import PriceRail from '../components/PriceRail.vue'
import CheckoutCta from '../components/CheckoutCta.vue'
import {
  journey, priced, basePackage, isCustomized, changesFromPreset,
  checkout, resetConfig, editSection, toggleExtra, nav,
} from '../store.js'
import { cartLines, cartCount, freeChoices, cartContext } from '../cart.js'
import { STAY_LABEL } from '../packages.js'

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)
</script>

<template>
<div class="crt">
  <div class="crt__inner">
    <header class="crt__head">
      <button type="button" class="crt__back" @click="nav('customize')">
        <q-icon name="arrow_back" size="17px" /> Back to customizing
      </button>
      <h1 class="crt__title">Your cart</h1>
      <p class="crt__sub">
        One package, and everything that is in it. Change any line and you land back on the
        control that sets it, with the rest of your package untouched.
      </p>
    </header>

    <!-- Nothing taken yet. The badge in the nav says 0 for the same reason: the
         three tiles on the board are a catalogue, not a basket. -->
    <ds-card v-if="!journey.inCart" class="crt__empty">
      <ds-empty-state
        icon="shopping_cart"
        title="Your cart is empty"
        description="Pick one of the three pre-built packages and start changing it — it lands here the moment you open it."
      >
        <template #action>
          <button type="button" class="crt__emptybtn" @click="nav('packages')">See the packages</button>
        </template>
      </ds-empty-state>
    </ds-card>

    <div v-else class="crt__cols">
      <div class="crt__main">
        <ds-card class="crt__sec" tag="section" padding="none">
          <header class="crt__pkg">
            <div class="crt__pkgtop">
              <p class="crt__eyebrow">
                Your package
                <span v-if="isCustomized" class="crt__tag">Customised</span>
              </p>
              <h2 class="crt__pkgname">{{ basePackage.name }}</h2>
              <p class="crt__pkgmeta">
                {{ cartContext }} · {{ STAY_LABEL }}
              </p>
            </div>
            <!-- Party size sets the ticket count, the room count and the
                 quantity on every per-head extra at once, so it is a change to
                 the whole package rather than to a line — it belongs on the
                 package header, next to the sentence it rewrites. -->
            <button type="button" class="crt__change" @click="editSection('party')">
              Change party size
            </button>
          </header>

          <h3 class="crt__linesh">
            {{ cartCount }} item{{ cartCount === 1 ? '' : 's' }} in this package
          </h3>

          <ul class="crt__lines">
            <li v-for="l in cartLines" :key="l.key" class="crt__line">
              <span class="crt__icon"><q-icon :name="l.icon" size="20px" /></span>
              <div class="crt__info">
                <span class="crt__group">{{ l.group }}</span>
                <span class="crt__label">{{ l.label }}</span>
                <small class="crt__note">{{ l.note }}</small>
                <span class="crt__acts">
                  <button type="button" class="crt__act" @click="editSection(l.section)">Change</button>
                  <button
                    v-if="l.removable" type="button" class="crt__act crt__act--drop"
                    @click="toggleExtra(l.key)"
                  >Remove</button>
                </span>
              </div>
              <span class="crt__amt">{{ money(l.value) }}</span>
            </li>

            <!-- A choice that costs nothing is not an item and is not counted,
                 but it is still a choice the guest made about how their party
                 reaches the stadium — so it is stated, not silently dropped. -->
            <li v-for="e in freeChoices" :key="e.id" class="crt__line crt__line--free">
              <span class="crt__icon"><q-icon :name="e.icon" size="20px" /></span>
              <div class="crt__info">
                <span class="crt__group">Getting there</span>
                <span class="crt__label">{{ e.label }}</span>
                <small class="crt__note">{{ e.note }}</small>
                <span class="crt__acts">
                  <button type="button" class="crt__act" @click="editSection('transport')">Change</button>
                </span>
              </div>
              <span class="crt__amt crt__amt--free">No cost</span>
            </li>
          </ul>

          <footer class="crt__addfoot">
            <button type="button" class="crt__add" @click="editSection('addons')">
              <q-icon name="add" size="17px" /> Add something to this package
            </button>
          </footer>
        </ds-card>

        <!-- The diff, restated where the order is being checked. A guest who
             arrived on a named package and is now looking at a cart should be
             able to see, here, whether the two still describe the same thing. -->
        <ds-card v-if="isCustomized" class="crt__sec" tag="section">
          <h2 class="crt__sech">
            {{ changesFromPreset.length }} change{{ changesFromPreset.length === 1 ? '' : 's' }}
            from {{ basePackage.name }}
          </h2>
          <ul class="crt__changes">
            <li v-for="c in changesFromPreset" :key="c"><q-icon name="edit" size="14px" />{{ c }}</li>
          </ul>
          <button type="button" class="crt__reset" @click="resetConfig">
            <q-icon name="restart_alt" size="16px" /> Reset to the original package
          </button>
        </ds-card>
        <ds-card v-else class="crt__sec" tag="section">
          <p class="crt__unchanged">
            <q-icon name="check_circle" size="17px" />
            This is {{ basePackage.name }} exactly as it was built.
          </p>
        </ds-card>

        <!-- Below the list, where the guest finishes reading — the same
             component as the rail's, so the two are one action. -->
        <checkout-cta class="crt__cta" :total="priced.packagePrice" @click="checkout" />
      </div>

      <aside class="crt__rail">
        <price-rail
          :priced="priced" :package-name="basePackage.name" :customized="isCustomized"
          :itemised="false"
          @continue="checkout" @reset="resetConfig"
        />
      </aside>
    </div>
  </div>
</div>
</template>

<style scoped>
.crt { display: flex; flex-direction: column; flex: 1; }
.crt__inner { width: 100%; max-width: min(1280px, 92%); margin: 0 auto; padding: 22px 0 64px; }

.crt__head { margin-bottom: 20px; }
.crt__back { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 10px; padding: 0; border: 0; background: none; font: inherit; font-weight: 700; color: var(--ds-color-link, #1b4ed8); cursor: pointer; }
.crt__title { margin: 0; font-size: 1.75rem; font-weight: 800; color: var(--ds-color-text); }
.crt__sub { margin: 6px 0 0; max-width: 74ch; color: var(--ds-color-text-subtle); }

.crt__empty { padding: 8px; }
.crt__emptybtn { padding: 11px 18px; border: 0; border-radius: var(--ds-radius-button, 8px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }

.crt__cols { display: grid; grid-template-columns: minmax(0, 1fr) 370px; gap: 26px; align-items: start; }
.crt__main { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
.crt__sec { display: block; }

.crt__pkg { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; flex-wrap: wrap; padding: 18px 20px; border-bottom: 1px solid var(--ds-color-border); }
.crt__eyebrow { display: flex; align-items: center; gap: 8px; margin: 0; font-size: .6875rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.crt__tag { padding: 2px 8px; border-radius: var(--ds-radius-pill, 999px); background: var(--ds-color-background-brand-bold, #01113E); color: #fff; letter-spacing: .03em; }
.crt__pkgname { margin: 5px 0 0; font-size: 1.25rem; font-weight: 800; color: var(--ds-color-text); }
.crt__pkgmeta { margin: 4px 0 0; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.crt__change { flex: none; padding: 0; border: 0; background: none; font: inherit; font-size: .875rem; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }

.crt__linesh { margin: 0; padding: 14px 20px 0; font-size: .75rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--ds-color-text-subtle); }

.crt__lines { list-style: none; margin: 0; padding: 0; }
.crt__line { display: flex; align-items: flex-start; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--ds-color-border); }
.crt__line:last-child { border-bottom: 0; }
.crt__icon { flex: none; width: 40px; height: 40px; border-radius: 50%; background: var(--ds-palette-slate-100, #f1f2f4); color: var(--ds-color-text-brand, #01113E); display: flex; align-items: center; justify-content: center; }
.crt__info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.crt__group { font-size: .6875rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--ds-color-text-subtle); }
.crt__label { margin-top: 2px; font-size: 1rem; font-weight: 700; color: var(--ds-color-text); }
.crt__note { margin-top: 2px; font-size: .8125rem; color: var(--ds-color-text-subtle); }
.crt__acts { display: flex; align-items: center; gap: 16px; margin-top: 8px; }
.crt__act { padding: 0; border: 0; background: none; font: inherit; font-size: .8125rem; font-weight: 700; color: var(--ds-color-link, #1b4ed8); text-decoration: underline; cursor: pointer; }
.crt__act--drop { color: var(--ds-color-text-subtle); }
.crt__act--drop:hover { color: var(--ds-color-text-danger, #b3261e); }
.crt__amt { flex: none; font-size: 1rem; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--ds-color-text); }
.crt__amt--free { font-weight: 600; color: var(--ds-color-text-subtle); }
.crt__line--free .crt__icon { background: transparent; border: 1px dashed var(--ds-color-border-bold, #c4c8ce); color: var(--ds-color-text-subtle); }

.crt__addfoot { padding: 14px 20px 18px; border-top: 1px solid var(--ds-color-border); }
.crt__add { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; font: inherit; font-weight: 700; color: var(--ds-color-link, #1b4ed8); cursor: pointer; }

.crt__sech { margin: 0 0 10px; font-size: 1rem; font-weight: 800; color: var(--ds-color-text); }
.crt__changes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
.crt__changes li { display: flex; align-items: center; gap: 8px; font-size: .875rem; color: var(--ds-color-text-subtle); }
.crt__reset { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; padding: 0; border: 0; background: none; font: inherit; font-size: .8125rem; font-weight: 600; color: var(--ds-color-text-subtle); text-decoration: underline; cursor: pointer; }
.crt__unchanged { display: flex; align-items: center; gap: 8px; margin: 0; font-size: .875rem; color: var(--ds-color-text-subtle); }
.crt__unchanged .q-icon { color: var(--ds-color-text-success, #167a4a); }

.crt__cta { margin-top: 2px; }

@media (max-width: 1080px) {
  .crt__cols { grid-template-columns: minmax(0, 1fr); }
  .crt__rail :deep(.prail) { position: static; }
}
</style>
