// WHAT THE CART IS, in one place.
//
// This prototype does not sell a basket. It sells ONE configured package, and
// `journey.config` is that package. So "cart" here needs a definition before it
// can have a count, and inventing a second one — a `cartItems` array the guest
// pushes things into — would immediately fork the arithmetic away from
// `priceConfiguration()`. There is nothing to push: the extras ARE the package.
//
// --- What the count counts -----------------------------------------------------
// The badge counts the PRICED COMPONENTS of the configured package: the tickets,
// the stay, and each extra that costs something. It is literally
// `breakdownLines().length` — the same rows the rail itemises, the same rows the
// cart page lists — so the number on the icon is "how many lines are behind it"
// and can never disagree with what opening it shows.
//
// Two alternatives were rejected:
//
//  · A constant 1 ("one package"). Honest, but a badge that never moves carries
//    no information — it is decoration on a control whose whole job is to report
//    change. Adding the hospitality tent is a real change to what you are buying,
//    and the nav should say so.
//  · Party size (4 people → "4"). It is the biggest number available and reads
//    like a quantity, which is exactly the problem: it would imply four of
//    something in the cart when there is one package for four people, and it
//    would move when the price moves rather than when the CONTENTS move.
//
// So the count changes when — and only when — the guest adds or drops an extra.
// Swapping hotel, room, tier or party size re-prices every line but adds and
// removes nothing, and the badge correctly holds still while the total moves.
//
// --- Zero-cost choices are not cart lines --------------------------------------
// "Make your own way" is a real answer to Getting there, and it costs nothing.
// `breakdownLines()` already filters it out of the itemisation, so it is not a
// cart line and is not counted — but it is still a choice the guest made, so the
// cart page states it under the extras rather than silently dropping it.
import { computed } from 'vue'
import { journey, priced } from './store.js'
import { breakdownLines, extraById } from './packages.js'

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

/**
 * Which customize-screen section owns each line, so every "Change" on the cart
 * page can land on the control that changes it rather than at the top of a long
 * screen. The ids are the ones CustomizeScreen puts on its section cards.
 */
function ownerOf(key) {
  if (key === 'tickets') return { section: 'tickets', group: 'Tickets', icon: 'confirmation_number' }
  if (key === 'stay') return { section: 'hotel', group: 'Stay', icon: 'hotel' }
  const extra = extraById(key)
  // Getting there is single-choice, so a cart-side "Remove" would leave the
  // package with no answer to how the party reaches the stadium — the one thing
  // the catalogue guarantees always has one. Transport changes; add-ons drop.
  if (extra?.group === 'transport') {
    return { section: 'transport', group: 'Getting there', icon: extra.icon }
  }
  return { section: 'addons', group: 'Extra', icon: extra?.icon || 'add_circle', removable: true }
}

/**
 * The cart, as rows. `breakdownLines()` produces the label, the note and the
 * amount — this only says where each row is edited. Nothing here computes money.
 */
export const cartLines = computed(() =>
  breakdownLines(priced.value, money).map((line) => ({ ...line, ...ownerOf(line.key) }))
)

/** The badge number. See the top of this file for what it counts and why. */
export const cartCount = computed(() => (journey.inCart ? cartLines.value.length : 0))

/** Choices the guest made that cost nothing — shown, but never counted. */
export const freeChoices = computed(() =>
  journey.inCart ? priced.value.extras.filter((e) => e.price === 0) : []
)

/** "4 people · 2 rooms at The Westin" — the context every cart surface opens with. */
export const cartContext = computed(() => {
  const p = priced.value
  return `${p.guests} ${p.guests === 1 ? 'person' : 'people'} · ${p.rooms} room${p.rooms === 1 ? '' : 's'} at ${p.hotel.name}`
})
