<script setup>
// App shell — renders the current screen and installs ONE document-level,
// capture-phase click handler that routes every intercepted CTA. The library
// page components emit no navigation events (we make ZERO library changes), so
// navigation is driven by matching the click target here. Capture phase + document
// scope also catches TELEPORTED nodes (the cart fly-out, menus) that render
// outside the active screen's DOM subtree.
import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { journey, nav, startFlow, openHotel, addActiveToCart, addRoomToHold, cartRoomCount, backToBrowse, goToCheckout, resetJourney } from './store.js'
import { getHotelByName, getHotel } from './hotels.js'

// Open the nav cart fly-out by triggering the library's cart button (the flyout
// is controlled inside GlobalNav; this is the no-library-change way to open it).
function openCartFlyout() {
  requestAnimationFrame(() => document.querySelector('.gnav__iconbtn')?.click())
}

// Read a group room card's live selection from the DOM (the card doesn't expose
// its internal per-night quantities via its `add` event, so we read them here).
function readGroupRoom(card) {
  if (!card) return null
  const type = card.querySelector('.rcg__title')?.textContent?.trim() || 'Room'
  const bed = card.querySelector('.rcg__bed')?.textContent?.trim() || ''
  const occ = (card.querySelector('.rcg__occ')?.textContent || '').match(/(\d+)/)?.[1]
  const summary = [bed, occ ? `Sleeps ${occ}` : ''].filter(Boolean).join(' · ')
  const nights = [...card.querySelectorAll('.rcg__night')].map((n) => ({
    date: n.querySelector('.rcg__date')?.textContent?.trim(),
    qty: parseInt(n.querySelector('.qstep__val')?.textContent?.trim() || '0', 10),
    price: parseFloat((n.querySelector('.rcg__nrate')?.textContent || '').replace(/[^0-9.]/g, '')) || 0,
    roomsLeft: parseInt((n.querySelector('.rcg__left')?.textContent || '').match(/(\d+)/)?.[1] || '9', 10),
  })).filter((n) => n.date && n.qty > 0)
  return { type, summary, price: nights[0]?.price || 0, nights }
}

// The GlobalNav badge count only updates when its fly-out mounts CartReview, and
// it resets when each screen re-mounts the nav. Keep the badge in sync with the
// real room count from the prototype (no library change).
function syncBadge() {
  const n = cartRoomCount()
  nextTick(() => requestAnimationFrame(() => {
    document.querySelectorAll('.gnav__badge').forEach((b) => { b.textContent = String(n) })
  }))
}
watch(() => [journey.screen, JSON.stringify(journey.cart)], syncBadge, { immediate: true })
import LandingScreen from './screens/LandingScreen.vue'
import BrowseScreen from './screens/BrowseScreen.vue'
import DetailsScreen from './screens/DetailsScreen.vue'
import CheckoutScreen from './screens/CheckoutScreen.vue'
import ConfirmationScreen from './screens/ConfirmationScreen.vue'

const screens = {
  landing: LandingScreen,
  browse: BrowseScreen,
  details: DetailsScreen,
  checkout: CheckoutScreen,
  confirmation: ConfirmationScreen,
}

function onClickCapture(e) {
  const t = e.target
  if (!(t instanceof Element)) return
  const screen = journey.screen

  // Brand logo in the global nav → home (Landing), from any screen.
  if (t.closest('.gnav__brand')) { resetJourney(); return }

  // Map tooltip hotel link (name/photo) → that hotel's Details page. The library
  // popup renders `<a class="hm-link" href="#hotel-<id>">`; intercept it, cancel
  // the hash navigation, and open Details (this also unmounts the map dialog).
  const mapLink = t.closest('.hm-link')
  if (mapLink) {
    const id = (mapLink.getAttribute('href') || '').match(/#hotel-(.+)$/)?.[1]
    const hotel = id && getHotel(id)
    if (hotel) { e.preventDefault(); e.stopPropagation(); openHotel(hotel); return }
  }

  // Cart fly-out "Go to checkout" (teleported to <body>) — reachable from
  // Browse/Details once the cart has items.
  if (t.closest('.cf__cta')) { goToCheckout(); return }

  // "Add another reservation" / "Add another hotel" (in the fly-out or the
  // checkout order) → back to Browse to add more (keeps the cart; navigating
  // away closes the fly-out).
  if (t.closest('.cr__addhotel')) { backToBrowse(); return }

  if (screen === 'landing') {
    // The BookingWidget "Search" button has no handler — read the widget's
    // current mode (booking-type select / active tab) and start that flow.
    if (t.closest('.bw__search')) {
      const modeEl = document.querySelector('.bw__field--mode') || document.querySelector('.bw__tab--active')
      const isGroup = /hold/i.test(modeEl?.textContent || '')
      startFlow(isGroup ? 'group' : 'reservations')
    }
    return
  }

  if (screen === 'browse') {
    // Hotel NAME → its Details page. (The card CTA is handled by the card's own
    // @choose/@select event in BrowseScreen — not intercepted here, to avoid
    // double navigation.) Resolve to the full hotel record for a coherent Details.
    const nameEl = t.closest('.hc__name')
    if (nameEl) {
      const name = nameEl.textContent?.trim()
      const hotel = getHotelByName(name)
      if (hotel) openHotel(hotel)
    }
    return
  }

  if (screen === 'details') {
    // Room card CTA ("Reserve Room" / "Add N to Cart"). Disabled = sold out /
    // nothing selected. RoomsCarousel/HotelDetailPage don't relay these events.
    const rcta = t.closest('.rcr__cta, .rcg__cta')
    if (rcta && !rcta.disabled) {
      if (journey.flow === 'group') {
        // Group/hold: read THIS room card's per-night selection, accumulate it
        // into the hotel's held rooms, then fly the cart out to confirm. Adding
        // a different room type / night accumulates rather than replacing.
        const room = readGroupRoom(rcta.closest('.rcg'))
        if (room && room.nights.length) { addRoomToHold(room); openCartFlyout() }
      } else {
        // Single/multiple: go straight to checkout.
        addActiveToCart()
      }
    }
    return
  }

  if (screen === 'checkout') {
    // Rail actions: "Edit reservation" → Browse (to change/add) · "Start over" → reset.
    const rail = t.closest('.ck__railbtn')
    if (rail) {
      if (/start over/i.test(rail.textContent || '')) resetJourney()
      else backToBrowse()
      return
    }
    // Final CTA "Book Now" / "Hold Group Block Now" (disabled until policies
    // are acknowledged, so a disabled button never fires a click).
    const btn = t.closest('button')
    if (btn && /book now|hold group block now/i.test((btn.textContent || '').trim())) {
      nav('confirmation')
    }
    return
  }

  if (screen === 'confirmation') {
    if (t.closest('.conf__banner-cta')) resetJourney()
  }
}

onMounted(() => document.addEventListener('click', onClickCapture, true))
onBeforeUnmount(() => document.removeEventListener('click', onClickCapture, true))
</script>

<template>
  <div class="proto">
    <div class="proto__stage">
      <component :is="screens[journey.screen]" />
    </div>
  </div>
</template>

<style>
/* Full-width canvas — spans the entire browser viewport. */
html, body { margin: 0; }
/* Reserve scrollbar space on BOTH sides so a vertical scrollbar never shifts the
   centered content off-center (keeps left/right gutters even). */
html { scrollbar-gutter: stable both-edges; }
body { background: var(--ds-palette-slate-100, #f1f2f4); }
.proto { min-height: 100vh; }
/* The shared content column: capped at 1440px, but always leaving an even ~4%
   gutter on each side so content never touches the viewport edge. */
.proto__stage { width: 100%; min-height: 100vh; background: var(--ds-color-surface, #fff); --col: min(1440px, 92%); }

/* Cap all interior content to a centered 1440px column with side gutters, so
   elements sit inline within the body and never run to the viewport edge.
   Prototype-level override (beats the library's scoped styles via !important) —
   no library files changed. */

/* App bar: keep the bar background edge-to-edge on the (unstyled) wrapper, and
   cap the nav's own content (brand + actions) to the shared column using the same
   reliable max-width pattern as the page content — so "Manage Booking" lines up
   with the content's right gutter instead of sitting at the viewport edge. */
.gnav-wrap {
  background: var(--ds-color-surface);
  border-bottom: 1px solid var(--ds-color-border);
}
.gnav {
  max-width: var(--col) !important;
  margin-inline: auto !important;
  padding-inline: 0 !important;
  background: transparent !important;
  border-bottom: 0 !important;
}

/* Browse: make hotel names read as links to their Details page. */
.hc__name { cursor: pointer; }
.hc__name:hover { text-decoration: underline; }

/* Perf: the browse list is long (60 cards on a very tall page). Skip rendering
   + painting off-screen cards so scrolling stays smooth. The intrinsic-size MUST
   match the real rendered card height (~398px measured) — if it's too small, each
   card grows as it scrolls into view, shifting everything below it and making the
   scroll "skip"/jump. `auto` then remembers each card's real size after first paint. */
.hc--horizontal { content-visibility: auto; contain-intrinsic-size: auto 398px; }

/* Content blocks (and full-bleed section contents) → the shared centered column
   with even gutters on both sides. */
.hlp__search,      /* Browse booking-widget row */
.hlp__container,   /* Browse results area       */
.hdp,              /* Hotel Details content     */
.ck__inner,        /* Checkout two-column       */
.conf__inner,      /* Confirmation summary      */
.lp__content,      /* Landing body sections     */
.pf__footer-inner, /* Page footer content       */
.lp__footer-inner {
  max-width: var(--col) !important;
  margin-inline: auto !important;
  box-sizing: border-box;
}
</style>
