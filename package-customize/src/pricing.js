// The ticket levels a package can be built on.
//
// Forked from Option D, which pinned ONE tier (`TIERS.find(t => t.id === 'club')`)
// and threw the rest away — its Aug 5 brief said the two tiles differ only by
// hotel, so a tier axis would have been noise. This prototype is the opposite
// brief: the ticket level is the first thing a guest is expected to change, so
// all four tiers stay, and the tier lives in the configuration rather than in the
// package definition.
//
// The prices are the LIBRARY's, not ours: `deriveTiers()` seeds them from the
// event id, so they are deterministic per event and identical to every other
// prototype in this repo that prices the same game. Hard-coding four numbers here
// would have been simpler and would have drifted the moment the library retuned
// its presets.
import { deriveTiers } from '@lib/lib/seatmap.js'
import { EVENT } from './event.js'

// What each tier gets you, beyond the library's one-line description. The
// customize screen shows these under the tier name: a guest downgrading needs to
// know what they are giving up, and "Club Level" alone doesn't say.
const TIER_PERKS = {
  lower: ['Closest to the field', 'Sideline & end-zone views', 'Fastest gate access'],
  club: ['Indoor climate-controlled lounge', 'In-seat wait service', 'Upscale club dining'],
  mezz: ['Elevated corner & sideline views', 'Covered concourse', 'Shorter concession lines'],
  upper: ['The full-stadium view', 'Best value of the four', 'Same gameday experiences'],
}

/**
 * The event's ticket tiers, CHEAPEST FIRST.
 *
 * Option D sorted these most-expensive-first, which is right for a price list.
 * Here the list is a ladder the guest moves up and down, and reading it bottom-up
 * ("what does the next step cost me?") is the harder direction — so the ladder is
 * rendered the way it is climbed.
 */
export const TIERS = deriveTiers(EVENT, 'stadium')
  .map((t) => ({ ...t, perks: TIER_PERKS[t.id] || [] }))
  .sort((a, b) => a.price - b.price)

export const resolveTier = (tierId) => TIERS.find((t) => t.id === tierId) || TIERS[0]
