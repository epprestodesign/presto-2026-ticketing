/** PATTERNS / Search & Filters → destination + dates + guests + filter chips (composition) */
import { ref } from 'vue'
export default {
  title: 'Patterns/Search & Filters',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `
## Overview
The hotel **search bar** (destination, dates, guests) plus a filter row with
active-filter chips. Keep filters visible, reflect them as removable chips, and
provide a clear-all.

## Edge cases
- **No results** → pair with **Patterns / Empty States** (No results variant).
- **Conflicting filters** (e.g. 5 stars + lowest price) → still return closest matches, never a dead end.
` } } },
}
export const HotelSearch = {
  name: 'Hotel Search',
  render: () => ({
    setup() {
      const dest = ref('New York, USA'); const dates = ref('Jun 2 – Jun 6'); const guests = ref('2 guests · 1 room')
      const filters = ref(['Free cancellation', '4+ stars', 'Pool'])
      const remove = (f) => (filters.value = filters.value.filter((x) => x !== f))
      return { dest, dates, guests, filters, remove }
    },
    template: `
      <div style="max-width:760px">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-sm">
            <q-input v-model="dest" outlined dense placeholder="Where to?" clearable>
              <template #prepend><q-icon name="place" /></template>
            </q-input>
          </div>
          <div class="col-6 col-sm-3"><q-input v-model="dates" outlined dense readonly><template #prepend><q-icon name="event" /></template></q-input></div>
          <div class="col-6 col-sm-3"><q-input v-model="guests" outlined dense readonly><template #prepend><q-icon name="person" /></template></q-input></div>
          <div class="col-auto"><q-btn unelevated color="primary" icon="search" label="Search" /></div>
        </div>
        <div class="row q-gutter-sm q-mt-sm items-center">
          <q-btn outline dense color="primary" icon="tune" label="Filters" class="q-mr-xs" />
          <q-chip v-for="f in filters" :key="f" removable color="primary" text-color="white" @remove="remove(f)">{{ f }}</q-chip>
          <q-btn v-if="filters.length" flat dense color="primary" label="Clear all" @click="filters = []" />
        </div>
      </div>` }),
}
