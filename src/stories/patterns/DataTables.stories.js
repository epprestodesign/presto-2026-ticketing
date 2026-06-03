/** PATTERNS / Data Tables → advanced QTable (composition) */
import { ref } from 'vue'
const columns = [
  { name: 'ref', label: 'Ref', field: 'ref', align: 'left', sortable: true },
  { name: 'guest', label: 'Guest', field: 'guest', align: 'left', sortable: true },
  { name: 'room', label: 'Room', field: 'room', align: 'left' },
  { name: 'dates', label: 'Stay', field: 'dates', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]
const rows = [
  { ref: 'BK-1042', guest: 'Ada Lovelace', room: 'Deluxe King', dates: 'Jun 2–6', status: 'Checked in' },
  { ref: 'BK-1043', guest: 'Alan Turing', room: 'Twin/Double', dates: 'Jun 3–5', status: 'Confirmed' },
  { ref: 'BK-1044', guest: 'Grace Hopper', room: 'Ocean Suite', dates: 'Jun 5–8', status: 'No show' },
  { ref: 'BK-1045', guest: 'Katherine Johnson', room: 'Family Room', dates: 'Jun 6–11', status: 'Confirmed' },
]
export default {
  title: 'Patterns/Data Tables',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `
## Overview
The full data-table pattern: title, search, sorting, selection, status cells, and
row actions — the **reservations management** view for hosts/admins. Built on
QTable with custom cells.
` } } },
}
export const Reservations = {
  render: () => ({
    setup: () => ({ columns, rows, selected: ref([]), filter: ref('') }),
    template: `
      <q-table title="Reservations — This week" :rows="rows" :columns="columns" row-key="ref"
        selection="multiple" v-model:selected="selected" :filter="filter"
        flat bordered :pagination="{ rowsPerPage: 10 }" style="max-width:820px">
        <template #top-right>
          <q-input v-model="filter" dense outlined debounce="200" placeholder="Search guest or ref">
            <template #append><q-icon name="search" /></template>
          </q-input>
        </template>
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip dense text-color="white"
              :color="props.value==='Checked in'?'positive':props.value==='No show'?'negative':'info'">{{ props.value }}</q-chip>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn dense flat round icon="more_vert">
              <q-menu><q-list style="min-width:160px">
                <q-item clickable v-close-popup><q-item-section>Check in</q-item-section></q-item>
                <q-item clickable v-close-popup><q-item-section>Change dates</q-item-section></q-item>
                <q-item clickable v-close-popup><q-item-section class="text-negative">Cancel</q-item-section></q-item>
              </q-list></q-menu>
            </q-btn>
          </q-td>
        </template>
      </q-table>` }),
}
