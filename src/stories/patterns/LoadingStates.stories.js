/** PATTERNS / Loading States → Skeleton / InnerLoading / Progress (composition) */
import { ref } from 'vue'
export default {
  title: 'Patterns/Loading States',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `
## Overview
Choosing the right wait indicator: **Skeleton** for first content load,
**inner loading** for in-place refresh, **progress** for known/long tasks.
Toggle below to compare the loaded vs loading view.
` } } },
}
export const SkeletonToContent = {
  render: () => ({ setup: () => ({ loading: ref(true) }), template: `
    <div style="max-width:340px">
      <q-btn dense flat color="primary" :label="loading ? 'Show loaded' : 'Show loading'" @click="loading=!loading" class="q-mb-sm" />
      <q-card>
        <template v-if="loading">
          <q-skeleton height="140px" square />
          <q-card-section><q-skeleton type="text" class="text-h6" /><q-skeleton type="text" width="60%" /></q-card-section>
        </template>
        <template v-else>
          <q-img src="https://cdn.quasar.dev/img/mountains.jpg" height="140px" />
          <q-card-section><div class="text-h6">The Grand Plaza</div><div class="text-grey-7">Deluxe King · 4.5 ★</div></q-card-section>
        </template>
      </q-card>
    </div>` }),
}
