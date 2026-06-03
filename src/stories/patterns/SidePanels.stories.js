/** PATTERNS / Side Panels → QDrawer / QDialog (position) (composition) */
import { ref } from 'vue'
export default {
  title: 'Patterns/Side Panels',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `
## Overview
Contextual panels that slide from an edge for detail/edit without losing context —
here, a **reservation detail** panel opened from a results or trips list. Use a
right Drawer in-layout, or a positioned Dialog for an overlay panel.
` } } },
}
export const ReservationDetail = {
  name: 'Reservation Detail',
  render: () => ({ setup: () => ({ open: ref(false) }), template: `
    <div>
      <q-btn color="primary" label="View reservation" @click="open = true" />
      <q-dialog v-model="open" position="right">
        <q-card style="width:360px;max-width:90vw;height:100%">
          <q-card-section class="row items-center">
            <div class="text-h6">Reservation BK-1042</div><q-space /><q-btn flat round dense icon="close" v-close-popup />
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="text-subtitle1">The Grand Plaza</div>
            <div class="text-caption text-grey-7 q-mb-sm">Deluxe King · 4 nights</div>
            <q-list dense>
              <q-item><q-item-section avatar><q-icon name="login" /></q-item-section><q-item-section>Check-in</q-item-section><q-item-section side>Jun 2, 3:00 PM</q-item-section></q-item>
              <q-item><q-item-section avatar><q-icon name="logout" /></q-item-section><q-item-section>Check-out</q-item-section><q-item-section side>Jun 6, 11:00 AM</q-item-section></q-item>
              <q-item><q-item-section avatar><q-icon name="person" /></q-item-section><q-item-section>Guests</q-item-section><q-item-section side>2 adults</q-item-section></q-item>
            </q-list>
          </q-card-section>
          <q-separator />
          <q-card-section class="row items-center"><div class="text-subtitle1">Total</div><q-space /><div class="text-h6">$756</div></q-card-section>
          <q-card-actions align="right"><q-btn flat color="primary" label="Change dates" /><q-btn unelevated color="primary" label="View receipt" /></q-card-actions>
        </q-card>
      </q-dialog>
    </div>` }),
}
