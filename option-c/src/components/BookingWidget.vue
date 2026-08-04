<script setup>
// BookingWidget — LOCAL FORK for the "Aug 4 — Option C" prototype.
//
// Carried over from Option A, which forked the library widget to swap the
// Travelers popover (adults/children/rooms steppers) for a plain "Guests"
// dropdown of 1–8+. Two further changes here, both because Option C mounts the
// widget DIRECTLY on its board rather than injecting it into library pages:
//
//   • NO SEARCH BUTTON. In Option A the widget sits on a landing page and Search
//     is what navigates to results. Here the results are already on screen —
//     every change re-prices the board live, so a Search button would be a
//     no-op the guest is invited to press.
//   • THE DATE RANGE WRITES TO THE STORE. Option A keeps its range as local
//     widget state; in Option C the nights multiply every room rate on the
//     board, so the range has to be shared or the prices below would ignore it.
//
// Unlike Option A this is NOT wired in by a resolveId override — Option C
// overrides no library files at all. It is imported directly by the board.
//
// Modes: 'reservations' (group + dates + guests) | 'group' (group(s) + rooms needed).
// Features: working tabs (toggle via `tabs`), group search popover with live filter,
// add-a-group MODAL with duplicate-name error, custom dual-month date range
// (DateRangeCalendar) + flexible pills, guests dropdown. Flat; DS tokens.
import { ref, reactive, computed, watch } from 'vue'
import DateRangeCalendar from '@lib/components/DateRangeCalendar.vue'
import { journey, setGuests, setRange } from '../store.js'

const props = defineProps({
  mode: { type: String, default: 'reservations' },
  tabs: { type: Boolean, default: true },
  // Force the far-left "Booking type" dropdown selector. NOTE: the dropdown is
  // now the DEFAULT for the tabs-less layout (shown whenever `tabs` is false and
  // `modeRadio` is off), so this prop is only needed to force it on explicitly.
  modeDropdown: { type: Boolean, default: false },
  // When true, hide the tabs and offer the flow selector as a radio-button pair
  // above the fields (alternate-layout exploration).
  modeRadio: { type: Boolean, default: false },
  // When false, hide the Registered Team(s) field — the "Core" booking widget
  // (generic hotel search: booking type + dates + travelers).
  showTeams: { type: Boolean, default: true },
  // When false, hide the mode selector (tabs / radio / "Booking type" dropdown)
  // entirely — used where the flow is already fixed (e.g. Browse Hotels).
  showMode: { type: Boolean, default: true },
  // When true, always show the Check-in – Check-out field (default: only in
  // 'reservations' mode). Used on Browse Hotels where dates apply to both flows.
  showDates: { type: Boolean, default: false },
})
const mode = ref(props.mode)
const modeOptions = [
  { label: 'Book Reservations', value: 'reservations' },
  { label: 'Hold Rooms for Group or Team', value: 'group' },
]
// The tabs-less layout surfaces the flow selector as a "Booking type" dropdown
// by default; `modeDropdown` keeps working as an explicit opt-in, and `modeRadio`
// (or tabs) takes precedence when chosen.
const showModeSelect = computed(() => props.showMode && (props.modeDropdown || (!props.tabs && !props.modeRadio)))

// --- Groups (EventPipe client companies invited to the game) ---
const clubs = [
  { name: 'Summit Financial', teams: ['Summit — Client Suite', 'Summit — Executive Group', 'Summit — Sales Incentive'] },
  { name: 'Harbor Capital', teams: ['Harbor — VIP Hospitality', 'Harbor — Client Group A', 'Harbor — Client Group B'] },
  { name: 'Northeast Logistics', teams: ['Northeast — Employee Outing', 'Northeast — Partner Guests'] },
]
const myTeams = ['My Group 1', 'My Group 2']
const groupsForMulti = [{ label: 'My Groups', teams: myTeams }, ...clubs.map((c) => ({ label: 'All of ' + c.name, teams: c.teams }))]
const allNames = [...clubs.flatMap((c) => c.teams), ...clubs.map((c) => c.name)]

const selectedTeam = ref('Summit — Client Suite')
const checked = reactive({})
;['My Group 1', 'My Group 2', 'Summit — Client Suite', 'Summit — Executive Group', 'Harbor — VIP Hospitality'].forEach((t) => { checked[t] = true })
const checkedCount = computed(() => Object.values(checked).filter(Boolean).length)
const teamLabel = computed(() => {
  if (mode.value === 'reservations') return selectedTeam.value || 'Select group'
  const n = checkedCount.value
  return n === 0 ? 'Select groups' : n === 1 ? Object.keys(checked).find((k) => checked[k]) : 'Multiple Groups'
})

const teamQuery = ref('')
const match = (t) => t.toLowerCase().includes(teamQuery.value.trim().toLowerCase())
// Bold the matched substring in result labels (case-insensitive).
const highlight = (text) => {
  const q = teamQuery.value.trim()
  if (!q) return text
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${esc})`, 'gi'), '<strong>$1</strong>')
}
const filteredClubs = computed(() => clubs.map((c) => ({ name: c.name, teams: c.teams.filter(match) })).filter((c) => c.teams.length))
const filteredGroups = computed(() => groupsForMulti.map((g) => ({ label: g.label, teams: g.teams.filter(match) })).filter((g) => g.teams.length))
const teamMenuOpen = ref(false)

// --- Add-a-group modal ---
const addDialog = ref(false)
const newTeams = ref([{ name: '' }])
const openAddDialog = () => { teamMenuOpen.value = false; newTeams.value = [{ name: '' }]; addDialog.value = true }
const addRow = () => newTeams.value.push({ name: '' })
const clearTeams = () => { newTeams.value = [{ name: '' }] }
const isDup = (name) => {
  const v = (name || '').trim().toLowerCase()
  if (v.length < 3) return false
  return allNames.some((n) => { const x = n.toLowerCase(); return x.includes(v) || v.includes(x) })
}
const addDisabled = computed(() => newTeams.value.some((t) => !t.name.trim() || isDup(t.name)))
const addLabel = computed(() => (newTeams.value.length > 1 ? `Add ${newTeams.value.length} Groups` : 'Add Group'))

// --- Dates ---
// The library defaults this to today + 7 → + 10 days, which floats away from the
// event. Option A replaced that with a gameday-weekend default computed here;
// Option C keeps the default in the STORE instead (see DEFAULT_RANGE), because
// the board, the URL and this widget all have to agree on one set of dates.
// Seeded from the store so a `?from=…&to=…` deep link opens on the right dates,
// and written back on every change so the board's nights follow the picker.
const range = ref({ ...journey.range })
watch(range, (r) => setRange(r), { deep: true })
watch(() => journey.range, (r) => {
  if (r.from !== range.value.from || r.to !== range.value.to) range.value = { ...r }
}, { deep: true })
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const fmt = (s) => { const [, m, d] = s.split('/'); return `${MON[+m - 1]} ${+d}` }
const dateLabel = computed(() => {
  const r = range.value
  if (r && r.from && r.to) return r.from.slice(5, 7) === r.to.slice(5, 7) ? `${fmt(r.from)} – ${+r.to.slice(8, 10)}` : `${fmt(r.from)} – ${fmt(r.to)}`
  return r && r.from ? fmt(r.from) : 'Add dates'
})

// --- Guests (fork) ---
// A single count instead of the library's per-room adults/children steppers.
// 1–7 are exact; '8+' is the open-ended top of the range (parties that size get
// handled by the group flow), so the value is a string and the label is prebuilt.
const GUEST_MAX = 8
const guestOptions = Array.from({ length: GUEST_MAX }, (_, i) => {
  const n = i + 1
  const value = n === GUEST_MAX ? `${n}+` : String(n)
  return { label: `${value} guest${n === 1 ? '' : 's'}`, value }
})

// The party size is JOURNEY state, not widget state: whatever is picked here is
// what Browse Packages prices its offerings for (and vice versa — the packages
// page's own Guests control writes back to the same place). '8+' maps to 8.
const toValue = (n) => (n >= GUEST_MAX ? `${GUEST_MAX}+` : String(Math.max(1, n || 1)))
const guests = ref(toValue(journey.guests))
watch(guests, (v) => setGuests(parseInt(v, 10)))
watch(() => journey.guests, (n) => { guests.value = toValue(n) })

// Group Block swaps the Travelers popover for a simple "Rooms Needed" number input.
// DES-80: no default — the organizer must enter how many rooms they need.
const roomsNeeded = ref(null)
</script>

<template>
  <div class="bw">
    <div v-if="showMode && tabs && !modeDropdown && !modeRadio" class="bw__tabs">
      <span :class="['bw__tab', { 'bw__tab--active': mode === 'reservations' }]" @click="mode = 'reservations'">Book Reservations</span>
      <span :class="['bw__tab', { 'bw__tab--active': mode === 'group' }]" @click="mode = 'group'">Hold Rooms for Group or Team</span>
    </div>

    <!-- RADIO SELECTOR (alternate-layout exploration) -->
    <div v-if="showMode && modeRadio" class="bw__radios">
      <q-radio v-model="mode" val="reservations" label="Book Reservations" color="primary" />
      <q-radio v-model="mode" val="group" label="Hold Rooms for Group or Team" color="primary" />
    </div>

    <div v-if="showMode && ((tabs && !modeDropdown && !modeRadio) || modeRadio)" class="bw__divider" />

    <div class="bw__fields">
      <!-- MODE DROPDOWN — farthest-left flow selector; default for tabs-less layout -->
      <div v-if="showModeSelect" class="bw__field bw__field--mode col">
        <q-select outlined stack-label class="bw__input" label="Booking Type" emit-value map-options
          :model-value="mode" :options="modeOptions" popup-content-class="bw-menu"
          @update:model-value="mode = $event">
          <template #prepend><q-icon name="tune" /></template>
        </q-select>
      </div>

      <!-- GROUP — DES-91: on the landing widget the booking type starts blank; the
           group field only appears once a booking type is chosen (it's contextual
           to the flow). In fixed-flow contexts `mode` is always set, so it shows. -->
      <div v-if="showTeams && !!mode" class="bw__field col">
        <q-input outlined stack-label readonly class="bw__input cursor-pointer"
          :label="mode === 'group' ? 'Registered Group(s)' : 'Registered Group'" :model-value="teamLabel">
          <template #prepend><q-icon name="groups" /></template>
        </q-input>
        <q-menu v-model="teamMenuOpen" class="bw-menu" :offset="[0, 8]">
          <div style="width:360px">
            <div class="row items-center justify-between" style="padding:12px 16px 6px">
              <div class="text-subtitle1" style="font-weight:600">Search Groups</div>
              <q-btn flat dense round icon="close" size="sm" v-close-popup />
            </div>
            <div style="padding:0 16px 8px">
              <q-input v-model="teamQuery" outlined dense clearable placeholder="Filter by company or group">
                <template #prepend><q-icon name="search" /></template>
              </q-input>
            </div>
            <div style="max-height:300px;overflow:auto;padding:0 16px 8px">
              <template v-if="mode === 'reservations'">
                <template v-for="club in filteredClubs" :key="club.name">
                  <div class="text-caption text-grey-7 q-mt-sm q-mb-xs">{{ club.name }}</div>
                  <div v-for="t in club.teams" :key="t" class="q-py-sm"><q-radio v-model="selectedTeam" :val="t" color="primary" dense><span v-html="highlight(t)" /></q-radio></div>
                </template>
                <div v-if="!filteredClubs.length" class="text-grey-7 q-py-md">No groups match "{{ teamQuery }}"</div>
              </template>
              <template v-else>
                <template v-for="g in filteredGroups" :key="g.label">
                  <q-checkbox :model-value="g.teams.every((t) => checked[t])" @update:model-value="(v) => g.teams.forEach((t) => (checked[t] = v))" :label="g.label" color="primary" dense class="q-mt-sm" style="font-weight:600" />
                  <div style="margin-left:24px">
                    <div v-for="t in g.teams" :key="t" class="q-py-sm"><q-checkbox v-model="checked[t]" color="primary" dense><span v-html="highlight(t)" /></q-checkbox></div>
                  </div>
                </template>
                <div v-if="!filteredGroups.length" class="text-grey-7 q-py-md">No groups match "{{ teamQuery }}"</div>
              </template>
            </div>
            <div class="bw__link" style="padding:12px 16px;border-top:1px solid var(--ds-color-border)" @click="openAddDialog">
              <q-icon name="add_circle" size="20px" /><span>Dont see your group in the list? Add it</span>
            </div>
          </div>
        </q-menu>
      </div>

      <!-- DATES -->
      <!-- DES-88: show Check-in–Check-out in Group Block too (with Rooms Needed).
           DES-91: also show when the booking type is still blank (landing default). -->
      <div v-if="showDates || !mode || mode === 'reservations' || mode === 'group'" class="bw__field col">
        <q-input outlined stack-label readonly class="bw__input cursor-pointer" label="Check-in - Check-out" :model-value="dateLabel">
          <template #prepend><q-icon name="calendar_month" /></template>
        </q-input>
        <!-- FORK: calendar only — the library's flexible-date pills (Exact dates,
             ± 1/2/3/7 days) are dropped. This is a one-game trip, so the dates
             are the gameday weekend, not a flexible search. -->
        <q-menu class="bw-menu" :offset="[0, 8]">
          <div style="padding:20px 32px 24px">
            <date-range-calendar v-model="range" />
          </div>
        </q-menu>
      </div>

      <!-- ROOMS NEEDED (Group Block) — replaces the Guests dropdown -->
      <div v-if="mode === 'group'" class="bw__field col">
        <q-input outlined stack-label type="number" min="1" class="bw__input"
          label="Rooms Needed" placeholder="Enter number of rooms" v-model.number="roomsNeeded">
          <template #prepend><q-icon name="meeting_room" /></template>
        </q-input>
      </div>

      <!-- GUESTS (Book Reservations) — fork: a 1–8+ dropdown in place of the
           library's adults/children/rooms popover. -->
      <div v-else class="bw__field col">
        <q-select outlined stack-label class="bw__input" label="Guests" emit-value map-options
          v-model="guests" :options="guestOptions" popup-content-class="bw-menu">
          <template #prepend><q-icon name="group" /></template>
        </q-select>
      </div>
      <!-- No Search button: the board below re-prices live on every change, so
           there is nothing for a Search press to do. See the header comment. -->
    </div>

    <div v-if="tabs && showTeams" class="bw__add" @click="openAddDialog">
      <q-icon name="add_circle" size="20px" /><span>Dont see your group in the list? Add it</span>
    </div>

    <!-- ADD A GROUP — full modal -->
    <q-dialog v-if="showTeams" v-model="addDialog">
      <q-card class="bw-dialog" style="width:640px;max-width:92vw;border-radius:var(--ds-radius-lg);padding:20px 24px 24px">
        <q-btn flat dense round icon="arrow_back" class="q-mb-sm" v-close-popup />
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6" style="font-weight:700">Add a group</div>
          <span class="bw__link" style="font-weight:500" @click="clearTeams">Clear</span>
        </div>
        <div v-for="(t, i) in newTeams" :key="i" class="q-mb-md">
          <q-input v-model="t.name" outlined label="New Group Name" :error="isDup(t.name)" hide-bottom-space />
          <div v-if="isDup(t.name)" class="q-mt-sm" style="color:var(--ds-color-text-danger)">
            <div style="font-weight:700">This group name is already registered.</div>
            <div class="text-body2">The name you entered matches a group that's already in our system. Please go back and select the correct group from the previous page, or enter a unique group name if you're booking for a different group.</div>
          </div>
        </div>
        <div class="bw__link q-mb-lg" @click="addRow"><q-icon name="add_circle" size="22px" /><span style="font-weight:600">Add another group</span></div>
        <q-btn unelevated color="primary" :label="addLabel" :disable="addDisabled" v-close-popup class="full-width" style="height:48px;border-radius:var(--ds-radius-button)" />
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.bw { background: var(--ds-color-surface); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-lg); padding: 24px 28px 22px; }
.bw__tabs { display: flex; gap: 28px; }
.bw__tab { font-weight: 500; color: var(--ds-color-text-subtle); padding-bottom: 12px; cursor: pointer; }
.bw__tab--active { color: var(--ds-color-text); border-bottom: 2px solid var(--ds-color-text); }
.bw__divider { height: 1px; background: var(--ds-color-border); margin: 0 -28px 20px; }
.bw__radios { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 28px; padding-bottom: 16px; }
.bw__field { position: relative; }
.bw__fields { display: flex; align-items: center; gap: 12px; flex-wrap: nowrap; }
/* Dropdown variant: the mode selector grows equally with the other fields. */
.bw__field--mode { min-width: 0; }
.bw__add { display: flex; align-items: center; gap: 8px; margin-top: 20px; font-size: 0.875rem; font-weight: 500; cursor: pointer; width: fit-content; color: var(--ds-color-text-brand); }
.bw__link { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; color: var(--ds-color-text-brand); }
.bw__step { width: 40px; min-width: 40px; height: 40px; min-height: 40px; font-size: 13px; border-radius: 50%; }
.bw__step :deep(.q-icon) { font-size: 22px; }
</style>

<style>
.bw-menu { box-shadow: var(--ds-shadow-1) !important; border: 1px solid var(--ds-color-border); }
.bw-dialog { box-shadow: var(--ds-shadow-2); }
/* Quasar dashes the outline of readonly outlined fields; our triggers are
   readonly by design — keep the border solid. */
.bw__input.q-field--outlined .q-field__control:before { border-style: solid; }
</style>
