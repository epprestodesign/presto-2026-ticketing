// Ticketmaster Discovery API v2 client (prototype).
//
// All requests go through the Vite dev proxy at `/tm/*` (see vite.config.js),
// which appends the apikey server-side — so no secret is ever in this file or
// the client bundle. Base path here is therefore just `/tm`.
//
// What Discovery API gives us: real events, venues, price ranges, images, and a
// STATIC seatmap image (`seatmap.staticUrl`). It does NOT provide interactive
// seat-level data — that lives in Ticketmaster's gated Presence/Seat Map SDKs.
// The interactive SVG seatmap in this prototype is our own layer, driven by the
// real price tiers below.

import { normalizeEvent, fixtureCatalog } from '@lib/ticketmaster.js'

const BASE = '/tm'

// Small in-memory cache to protect the 5,000-calls/day / 5-req-sec quota.
const cache = new Map()

async function get(path) {
  if (cache.has(path)) return cache.get(path)

  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } })

  if (res.status === 429) {
    throw new Error('Ticketmaster rate limit hit (5 req/sec, 5,000/day). Try again shortly.')
  }
  if (!res.ok) {
    throw new Error(`Ticketmaster API error ${res.status}: ${res.statusText}`)
  }

  const json = await res.json()
  cache.set(path, json)
  return json
}

/**
 * Search events. Discovery caps deep paging at the 1000th item.
 * @param {object} params - e.g. { keyword, city, size, classificationName }
 */
export async function searchEvents(params = {}) {
  const qs = new URLSearchParams({ size: '20', ...params }).toString()
  const data = await get(`/events.json?${qs}`)
  const events = data?._embedded?.events ?? []
  return events.map(normalizeEvent)
}

/** Fetch a single event by its Ticketmaster id. */
export async function getEvent(id) {
  const data = await get(`/events/${encodeURIComponent(id)}.json`)
  return normalizeEvent(data)
}

/**
 * Live search with an offline fallback: if the proxy call fails (no API key in
 * prototype/.env, network error, or a rate limit), fall back to the bundled
 * real-data fixtures so the deployed demo — which has no server to hide the key
 * — still works. Returns { events, source: 'live' | 'fixtures' }.
 */
export async function loadEvents(params = {}) {
  try {
    const events = await searchEvents(params)
    if (events.length) return { events, source: 'live' }
    return { events: fixtureCatalog(), source: 'fixtures' }
  } catch (err) {
    console.warn('[ticketmaster] live fetch failed, using fixtures:', err.message)
    return { events: fixtureCatalog(), source: 'fixtures' }
  }
}

// Re-export the shared normalizer so callers have one import site.
export { normalizeEvent, fixtureCatalog }
