/** PATTERNS / Confirmation Flows → Dialog + Snackbar (+ Undo) (composition) */
import { useQuasar } from 'quasar'
import { ref } from 'vue'
export default {
  title: 'Patterns/Confirmation Flows',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `
## Overview
How to confirm consequential actions. Prefer **optimistic + Undo** (Snackbar) for
reversible actions; reserve a blocking **Dialog** for destructive/irreversible ones.
` } } },
}
export const UndoPattern = {
  render: () => ({
    setup() {
      const $q = useQuasar()
      const del = () => $q.notify({ message: 'Reservation cancelled', color: 'dark', position: 'bottom', timeout: 4000, progress: true, actions: [{ label: 'Undo', color: 'yellow', handler: () => {} }] })
      return { del }
    },
    template: `<q-btn outline color="primary" label="Cancel reservation (reversible)" @click="del" />`,
  }),
}
export const DestructiveConfirm = {
  render: () => ({
    setup() {
      const $q = useQuasar(); const open = ref(false)
      const confirm = () => { open.value = false; $q.notify({ type: 'positive', message: 'Reservation cancelled', position: 'top' }) }
      return { open, confirm }
    },
    template: `
      <div>
        <q-btn color="negative" label="Cancel non-refundable booking" @click="open = true" />
        <q-dialog v-model="open" persistent>
          <q-card style="min-width:340px">
            <q-card-section class="row items-center q-gutter-sm"><q-icon name="warning" color="negative" size="28px" /><span class="text-h6">Cancel this booking?</span></q-card-section>
            <q-card-section class="q-pt-none">This rate is non-refundable — you won't be charged again, but the $756 paid will not be returned.</q-card-section>
            <q-card-actions align="right"><q-btn flat label="Keep booking" color="primary" v-close-popup /><q-btn unelevated label="Cancel anyway" color="negative" @click="confirm" /></q-card-actions>
          </q-card>
        </q-dialog>
      </div>` }),
}
