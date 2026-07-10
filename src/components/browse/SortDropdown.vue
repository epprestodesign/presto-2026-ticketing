<script setup>
// SortDropdown — the browse results "Sort by" control. A pill button showing the
// active option that opens a single-select menu. v-model holds the option value.
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: 'distance' },
  options: { type: Array, default: () => ([
    { value: 'distance', label: 'Distance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'guest_rating', label: 'Guest Rating' },
  ]) },
  label: { type: String, default: 'Sort by' },
  // 'pill' — rounded pill with a leading swap icon and inline "Sort by:" label.
  // 'box'  — bordered rectangle showing just the value (label rendered outside).
  variant: { type: String, default: 'pill' },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const current = computed(() => props.options.find((o) => o.value === props.modelValue) || props.options[0])
const choose = (o) => { emit('update:modelValue', o.value); open.value = false }
</script>

<template>
  <div class="srt" :class="`srt--${variant}`">
    <button type="button" class="srt__btn" :class="{ 'is-open': open }">
      <template v-if="variant === 'box'">
        <span class="srt__stack">
          <span v-if="label" class="srt__toplabel">{{ label }}</span>
          <span class="srt__current">{{ current.label }}</span>
        </span>
      </template>
      <template v-else>
        <q-icon name="swap_vert" size="18px" />
        <span v-if="label" class="srt__label">{{ label }}:</span>
        <span class="srt__current">{{ current.label }}</span>
      </template>
      <q-icon name="expand_more" size="18px" class="srt__chev" />
      <q-menu v-model="open" anchor="bottom left" self="top left" :offset="[0, 6]" class="srt__menu">
        <div class="srt__list">
          <button v-for="o in options" :key="o.value" type="button" class="srt__opt" :class="{ 'is-on': o.value === modelValue }" @click="choose(o)">
            <span>{{ o.label }}</span>
            <q-icon v-if="o.value === modelValue" name="check" size="18px" />
          </button>
        </div>
      </q-menu>
    </button>
  </div>
</template>

<style scoped>
.srt { display: inline-block; }
.srt__btn { display: inline-flex; align-items: center; gap: 8px; height: 46px; padding: 0 16px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-pill); background: var(--ds-color-surface); color: var(--ds-color-text); font-family: inherit; font-size: 0.9375rem; cursor: pointer; transition: border-color var(--ds-duration-fast) var(--ds-ease-standard); }
.srt__btn:hover, .srt__btn.is-open { border-color: var(--ds-color-text); }
.srt__btn > .q-icon { color: var(--ds-color-text-subtle); }
.srt__label { color: var(--ds-color-text-subtle); }
.srt__current { font-weight: 700; }
.srt__chev { transition: transform var(--ds-duration-fast) var(--ds-ease-standard); }
.srt__btn.is-open .srt__chev { transform: rotate(180deg); }

/* box variant — bordered rectangle with a stacked "Sort By" label above the value
   (floating-label select style). */
.srt--box .srt__btn { height: auto; min-height: 62px; min-width: 210px; padding: 10px 16px; border-radius: var(--ds-radius-md); border-color: var(--ds-color-border-bold); justify-content: space-between; align-items: center; gap: 12px; }
.srt--box .srt__stack { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
.srt--box .srt__toplabel { font-size: 0.8125rem; color: var(--ds-color-text-subtle); line-height: 1.1; }
.srt--box .srt__current { font-size: 1.0625rem; font-weight: 600; color: var(--ds-color-text); line-height: 1.2; }
.srt--box .srt__chev { margin-left: auto; color: var(--ds-color-text-subtle); }
</style>

<!-- Unscoped: q-menu content is teleported outside this component. -->
<style>
.srt__menu .srt__list { min-width: 240px; padding: 6px; display: flex; flex-direction: column; }
.srt__menu .srt__opt { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 11px 12px; border: 0; border-radius: var(--ds-radius-md); background: none; text-align: left; font-family: inherit; font-size: 0.9375rem; color: var(--ds-color-text); cursor: pointer; }
.srt__menu .srt__opt:hover { background: var(--ds-palette-slate-100); }
.srt__menu .srt__opt.is-on { font-weight: 700; }
.srt__menu .srt__opt .q-icon { color: var(--ds-color-background-brand-bold); }
</style>
