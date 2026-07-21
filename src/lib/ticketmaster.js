// Ticketmaster data shaping — pure, no network (safe to import in Storybook).
// The prototype's network layer (prototype/src/services/ticketmaster.js) imports
// normalizeEvent from here and adds the /tm proxy fetching + caching on top.
import rawFixtures from './ticketmaster-events.json'

/**
 * Reduce a raw Discovery API v2 event into the flat view model the UI consumes,
 * decoupling components from Ticketmaster's response shape.
 */
export function normalizeEvent(e = {}) {
  const venue = e?._embedded?.venues?.[0] ?? {}
  return {
    id: e.id ?? null,
    name: e.name ?? 'Untitled event',
    url: e.url ?? null,
    date: e?.dates?.start?.dateTime ?? e?.dates?.start?.localDate ?? null,
    status: e?.dates?.status?.code ?? 'unknown',
    image: pickImage(e?.images),
    seatmapUrl: e?.seatmap?.staticUrl ?? null,
    venue: {
      name: venue.name ?? null,
      city: venue.city ?? null,
      state: venue.state ?? null,
      country: venue.country ?? null,
    },
    priceRanges: e?.priceRanges ?? [],
    classification: firstClassification(e?.classifications),
    raw: e,
  }
}

// Prefer a wide (16:9) large image; fall back to the largest available.
export function pickImage(images = []) {
  if (!images?.length) return null
  const wide = images.filter((i) => i.ratio === '16_9')
  const pool = wide.length ? wide : images
  return pool.slice().sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]?.url ?? null
}

function firstClassification(classifications = []) {
  const c = classifications?.[0]
  if (!c) return null
  return { segment: c?.segment?.name ?? null, genre: c?.genre?.name ?? null }
}

// Real captured events (see src/lib/ticketmaster-events.json), normalized. Used
// by Storybook and as the prototype's offline fallback when no API key is set.
export const fixtureEvents = rawFixtures.map(normalizeEvent)

export function fixtureCatalog() {
  return fixtureEvents
}
