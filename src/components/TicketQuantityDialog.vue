<script setup>
// TicketQuantityDialog — a friendly "how many tickets?" prompt for the Ticket Map
// experience: a ticket glyph, a heading + reassurance ("You will be seated
// together"), a grid of quantity buttons (disabled beyond what's available), and
// a "skip" link for guests who don't need event tickets. Emits `select` with the
// chosen quantity, `skip`, and `close`. Rendered as content inside a <q-dialog>.
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: 'How many tickets do you need?' },
  subtitle: { type: String, default: 'You will be seated together.' },
  icon: { type: String, default: 'confirmation_number' }, // header glyph
  max: { type: Number, default: 8 },       // highest quantity shown
  available: { type: Number, default: 6 }, // quantities above this are disabled
  selected: { type: Number, default: null },
  // Show the highest option as "{max}+" (an open-ended cap, e.g. "8+").
  capPlus: { type: Boolean, default: false },
  skipLabel: { type: String, default: "Skip, I don't need event tickets" },
  showSkip: { type: Boolean, default: true },
})
const emit = defineEmits(['select', 'skip', 'close'])
const options = computed(() => Array.from({ length: props.max }, (_, i) => i + 1))
</script>

<template>
  <div class="tqd">
    <header class="tqd__head">
      <span class="tqd__glyph"><q-icon :name="icon" size="24px" /></span>
      <button class="tqd__close" aria-label="Close" @click="emit('close')"><q-icon name="close" size="22px" /></button>
    </header>

    <h2 class="tqd__title">{{ title }}</h2>
    <p class="tqd__sub">{{ subtitle }}</p>

    <div class="tqd__grid">
      <button
        v-for="n in options" :key="n" type="button" class="tqd__opt"
        :class="{ 'is-selected': selected === n }" :disabled="n > available"
        @click="emit('select', n)"
      >{{ capPlus && n === max ? n + '+' : n }}</button>
    </div>

    <footer v-if="showSkip" class="tqd__foot">
      <button type="button" class="tqd__skip" @click="emit('skip')">{{ skipLabel }} <q-icon name="chevron_right" size="18px" /></button>
    </footer>
  </div>
</template>

<style scoped>
.tqd { width: 430px; max-width: 92vw; background: var(--ds-color-surface); border-radius: var(--ds-radius-lg); box-shadow: var(--ds-shadow-4); padding: 22px 24px 18px; font-family: var(--ds-font-family); }
.tqd__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.tqd__glyph { width: 46px; height: 46px; border-radius: var(--ds-radius-md); background: color-mix(in srgb, var(--ds-color-background-brand-bold) 12%, transparent); color: var(--ds-color-background-brand-bold); display: flex; align-items: center; justify-content: center; }
.tqd__close { width: 34px; height: 34px; border: 0; border-radius: 50%; background: none; color: var(--ds-color-text-subtle); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.tqd__close:hover { background: var(--ds-palette-slate-100); color: var(--ds-color-text); }

.tqd__title { margin: 0; font-size: 1.375rem; font-weight: 700; color: var(--ds-color-text); }
.tqd__sub { margin: 6px 0 18px; color: var(--ds-color-text-subtle); }

.tqd__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.tqd__opt {
  height: 52px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-md);
  background: var(--ds-color-surface); color: var(--ds-color-text); font: inherit; font-size: 1.0625rem; font-weight: 700; cursor: pointer;
  transition: border-color var(--ds-duration-fast) var(--ds-ease-standard), background var(--ds-duration-fast) var(--ds-ease-standard);
}
.tqd__opt:hover:not(:disabled) { border-color: var(--ds-color-background-brand-bold); }
.tqd__opt.is-selected { border-color: var(--ds-color-background-brand-bold); background: var(--ds-color-background-brand-bold); color: #fff; }
.tqd__opt:disabled { color: var(--ds-color-text-disabled); border-color: var(--ds-color-border); cursor: not-allowed; }

.tqd__foot { display: flex; justify-content: flex-end; margin-top: 18px; }
.tqd__skip { display: inline-flex; align-items: center; gap: 2px; background: none; border: 0; padding: 6px 0; font: inherit; font-weight: 700; color: var(--ds-color-text); cursor: pointer; }
.tqd__skip:hover { color: var(--ds-color-text-brand); }
</style>
