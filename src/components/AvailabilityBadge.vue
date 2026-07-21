<script setup>
// AvailabilityBadge — inventory status pill for ticket tiers / listings. Pass an
// explicit `status`, or a `count` (+ optional `threshold`) and it derives one:
//   available (plenty) · limited (≤ threshold) · sold-out (0).
// Use `status="selling-fast"` for urgency messaging.
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: null },     // available | limited | selling-fast | sold-out
  count: { type: Number, default: null },       // tickets left (drives status if status unset)
  threshold: { type: Number, default: 10 },     // ≤ this ⇒ "limited"
  showCount: { type: Boolean, default: true },
})

const resolved = computed(() => {
  if (props.status) return props.status
  if (props.count == null) return 'available'
  if (props.count <= 0) return 'sold-out'
  if (props.count <= props.threshold) return 'limited'
  return 'available'
})

const META = {
  available: { text: 'Available', icon: 'check_circle', cls: 'is-available' },
  limited: { text: 'Limited', icon: 'error', cls: 'is-limited' },
  'selling-fast': { text: 'Selling fast', icon: 'local_fire_department', cls: 'is-fast' },
  'sold-out': { text: 'Sold out', icon: 'block', cls: 'is-sold' },
}
const meta = computed(() => META[resolved.value] ?? META.available)
const label = computed(() => {
  if (props.showCount && props.count != null && resolved.value !== 'sold-out') {
    return `${props.count} left`
  }
  return meta.value.text
})
</script>

<template>
  <span class="avail" :class="meta.cls">
    <q-icon :name="meta.icon" size="13px" />{{ label }}
  </span>
</template>

<style scoped>
.avail {
  display: inline-flex; align-items: center; gap: 4px;
  font-family: var(--ds-font-family); font-size: var(--ds-font-size-sm);
  font-weight: var(--ds-font-weight-medium); padding: 2px 8px;
  border-radius: var(--ds-radius-pill); border: 1px solid transparent;
}
.is-available { color: var(--ds-color-text-success); background: var(--ds-color-background-success); }
.is-limited { color: var(--ds-color-text-warning); background: var(--ds-color-background-warning); }
.is-fast { color: var(--ds-color-text-danger); background: var(--ds-color-background-danger); }
.is-sold { color: var(--ds-color-text-subtle); background: var(--ds-color-background-neutral); text-decoration: none; }
</style>
