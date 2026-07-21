// Imagery library — loads from the hosted imagery repo at runtime, with a small
// committed local set as offline/public fallback.
//
//   Remote (dynamic): set VITE_IMAGERY_URL to the imagery Pages base, e.g.
//     https://epprestodesign.github.io/presto-ds-imagery
//   New images pushed to that repo appear here on next load — no DS rebuild.
//   Fallback (offline / URL unset / fetch fails): src/assets/hotel/*.jpg
//
// Library + builder live in: github.com/epprestodesign/presto-ds-imagery
import localManifest from '../assets/hotel/manifest.local.json'
import { HOTEL_IMAGERY } from './hotelImagery'

const BASE = (import.meta.env.VITE_IMAGERY_URL || '').replace(/\/$/, '')

// Local fallback files (the original committed set), resolved to bundled URLs.
const localFiles = import.meta.glob('../assets/hotel/*.jpg', { eager: true, query: '?url', import: 'default' })
const localUrl = (file) => {
  const hit = Object.entries(localFiles).find(([k]) => k.endsWith('/' + file))
  return hit ? hit[1] : ''
}
const manifestData = Object.fromEntries(
  Object.entries(localManifest).map(([cat, arr]) => [cat, arr.map((e) => ({ ...e, url: localUrl(e.file) }))]),
)

// Richer hosted-Unsplash hotel library (src/assets/hotel-library/, 6 per
// category) so every hotel — in the list AND the detail gallery — draws a
// distinct photo via its seed instead of repeating one image per category.
// Keyed by the lowercase category names the browse/detail components request.
const libData = HOTEL_IMAGERY.reduce((acc, e) => {
  const cat = e.category.toLowerCase()
  ;(acc[cat] ||= []).push({ url: e.src, alt: e.alt, file: e.id, credit: e.photographer, photographer: e.photographer, photographerUrl: e.photographerUrl, photoUrl: e.photoUrl })
  return acc
}, {})

// Merge: the library supplies variety for its categories (exterior, lobby,
// rooms, suites, pool, spa, dining); the original manifest covers the rest
// (e.g. guests) so nothing that referenced the old set breaks.
const localData = { ...manifestData, ...libData }

let cache = null

/** Load the full library — remote manifest if VITE_IMAGERY_URL is set, else local. */
export async function loadImagery() {
  if (cache) return cache
  if (BASE) {
    try {
      const m = await fetch(`${BASE}/manifest.json`).then((r) => { if (!r.ok) throw new Error(r.status); return r.json() })
      cache = Object.fromEntries(
        Object.entries(m).map(([cat, arr]) => [cat, arr.map((e) => ({ ...e, url: `${BASE}/${e.file}` }))]),
      )
      return cache
    } catch { /* fall through to local */ }
  }
  cache = localData
  return cache
}

// Synchronous local accessors (instant; the committed fallback set).
export const categories = Object.keys(localData)
export const getImages = (cat) => localData[cat] || []
export const randomImage = (cat) => {
  const list = cat ? getImages(cat) : Object.values(localData).flat()
  return list.length ? list[Math.floor(Math.random() * list.length)] : null
}
