// Verify the Ticketmaster key in prototype/.env works — without ever printing it.
// Usage:  node prototype/scripts/tm-check.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const envPath = fileURLToPath(new URL('../.env', import.meta.url))

function readEnvKey(name) {
  let text = ''
  try {
    text = readFileSync(envPath, 'utf8')
  } catch {
    return null
  }
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && m[1] === name) return m[2].replace(/^["']|["']$/g, '').trim()
  }
  return null
}

const key = readEnvKey('TICKETMASTER_API_KEY')
if (!key) {
  console.error('❌ TICKETMASTER_API_KEY not found in prototype/.env')
  process.exit(1)
}

// Masked confirmation only — never log the full key.
console.log(`🔑 Key loaded: length ${key.length}, ends …${key.slice(-4)}`)

const url = `https://app.ticketmaster.com/discovery/v2/events.json?size=1&apikey=${key}`
const res = await fetch(url, { headers: { Accept: 'application/json' } })
console.log(`📡 HTTP ${res.status} ${res.statusText}`)

if (res.status === 401) {
  console.error('❌ Unauthorized — key is invalid or not yet activated.')
  process.exit(1)
}
if (res.status === 429) {
  console.error('⚠️  Rate limited (5 req/sec, 5,000/day). Key is valid — just throttled.')
  process.exit(1)
}
if (!res.ok) {
  console.error(`❌ Unexpected error ${res.status}.`)
  process.exit(1)
}

const data = await res.json()
const total = data?.page?.totalElements ?? 0
const sample = data?._embedded?.events?.[0]
console.log(`✅ Key works. ${total.toLocaleString()} events reachable.`)
if (sample) {
  console.log(`   Sample event: "${sample.name}" — seatmap image: ${sample?.seatmap?.staticUrl ? 'present ✅' : 'none'}`)
}
