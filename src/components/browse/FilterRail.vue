<script setup>
// FilterRail — the Browse Hotels left-rail filter MODULE: a thin composition that
// stacks every per-section filter field in order (View Map, Exact Matches,
// Property Name, Parent Brand, Amenities, Search Radius, Budget, Min Star Rating,
// Room Type, Clear All). Owns all the state refs and hands each one to its field
// via v-model; the shared `radius` ref binds to BOTH the map preview and the
// search-radius slider so they stay in sync.
import { ref, computed } from 'vue'
import ViewMapField from './filter-rail/ViewMapField.vue'
import ExactMatchesField from './filter-rail/ExactMatchesField.vue'
import PropertyNameField from './filter-rail/PropertyNameField.vue'
import ParentBrandField from './filter-rail/ParentBrandField.vue'
import AmenitiesField from './filter-rail/AmenitiesField.vue'
import SearchRadiusField from './filter-rail/SearchRadiusField.vue'
import BudgetField from './filter-rail/BudgetField.vue'
import StarRatingField from './filter-rail/StarRatingField.vue'
import RoomTypeField from './filter-rail/RoomTypeField.vue'

// `exactOnly` is lifted so the page can react to it (drive the filtered edge
// case). The rest of the filter state stays local to the rail.
const props = defineProps({
  exactOnly: { type: Boolean, default: false },
})
const emit = defineEmits(['view-map', 'update:exactOnly'])

const exactOnly = computed({
  get: () => props.exactOnly,
  set: (v) => emit('update:exactOnly', v),
})
const propertyQuery = ref('')
const brandSel = ref([])
const amenitySel = ref([])
// Default to a tight 0.25-mile radius on load so the map isn't crowded.
const radius = ref(0.25)
const budget = ref({ basis: 'night', max: '' })
const minStars = ref(0)
const roomSel = ref([])

function clearAll() {
  exactOnly.value = false
  propertyQuery.value = ''
  brandSel.value = []
  amenitySel.value = []
  radius.value = 0.25
  budget.value = { basis: 'night', max: '' }
  minStars.value = 0
  roomSel.value = []
}
</script>

<template>
  <div class="fr">
    <!-- VIEW MAP -->
    <div class="fr__section">
      <view-map-field v-model="radius" @view-map="emit('view-map')" />
    </div>

    <!-- EXACT MATCHES ONLY -->
    <div class="fr__section fr__section--exact">
      <exact-matches-field v-model="exactOnly" />
    </div>

    <!-- SEARCH BY PROPERTY NAME -->
    <div class="fr__section">
      <property-name-field v-model="propertyQuery" />
    </div>

    <!-- PARENT BRAND -->
    <div class="fr__section">
      <parent-brand-field v-model="brandSel" />
    </div>

    <!-- AMENITIES -->
    <div class="fr__section">
      <amenities-field v-model="amenitySel" />
    </div>

    <!-- SEARCH RADIUS -->
    <div class="fr__section">
      <search-radius-field v-model="radius" />
    </div>

    <!-- YOUR BUDGET -->
    <div class="fr__section">
      <budget-field v-model="budget" />
    </div>

    <!-- MINIMUM STAR RATING -->
    <div class="fr__section">
      <star-rating-field v-model="minStars" />
    </div>

    <!-- ROOM TYPE -->
    <div class="fr__section">
      <room-type-field v-model="roomSel" />
    </div>

    <!-- CLEAR ALL -->
    <div class="fr__section fr__section--clear">
      <button type="button" class="fr__apply" @click="clearAll">
        <q-icon name="close" size="18px" /> Clear All Filters
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Transparent rail — sits directly on the grey page, sections split by hairlines
   (matches the reference: floating white map card, then flush filter sections). */
.fr {
  background: transparent;
}
.fr__section { padding: 16px 0; border-top: 1px solid var(--ds-color-border); }
.fr__section:first-child { border-top: 0; padding-top: 0; }
/* Exact Matches is a self-contained card — no divider between it and the map. */
.fr__section--exact { border-top: 0; }
.fr__section--clear { border-top: 1px solid var(--ds-color-border); }

/* Clear-all button (shares the apply-button styling) */
.fr__apply {
  width: 100%; height: 44px; margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;
  border: 0; border-radius: var(--ds-radius-button); cursor: pointer;
  background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; font-size: 0.9375rem;
}
.fr__apply:hover { background: var(--ds-palette-navy-800, #0a1f4d); }
</style>
