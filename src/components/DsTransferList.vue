<script setup>
// DsTransferList — move items between two lists (MUI "Transfer List").
// No Quasar equivalent; composed from two QList panels + move controls.
import { ref } from 'vue'
const props = defineProps({
  left: { type: Array, default: () => [] },
  right: { type: Array, default: () => [] },
})
const leftItems = ref([...props.left])
const rightItems = ref([...props.right])
const leftSel = ref([])
const rightSel = ref([])

const move = (from, to, sel) => {
  to.value.push(...from.value.filter((i) => sel.value.includes(i)))
  from.value = from.value.filter((i) => !sel.value.includes(i))
  sel.value = []
}
const toggle = (sel, item) => {
  const i = sel.value.indexOf(item)
  i === -1 ? sel.value.push(item) : sel.value.splice(i, 1)
}
</script>
<template>
  <div class="row items-center q-gutter-md">
    <q-list bordered separator style="width:200px;border-radius:10px;overflow:hidden">
      <q-item v-for="it in leftItems" :key="it" clickable :active="leftSel.includes(it)"
        active-class="bg-primary text-white" @click="toggle(leftSel, it)">
        <q-item-section>{{ it }}</q-item-section>
      </q-item>
    </q-list>
    <div class="column q-gutter-sm">
      <q-btn dense outline color="primary" icon="chevron_right"
        :disable="!leftSel.length" @click="move(leftItems, rightItems, leftSel)" />
      <q-btn dense outline color="primary" icon="chevron_left"
        :disable="!rightSel.length" @click="move(rightItems, leftItems, rightSel)" />
    </div>
    <q-list bordered separator style="width:200px;border-radius:10px;overflow:hidden">
      <q-item v-for="it in rightItems" :key="it" clickable :active="rightSel.includes(it)"
        active-class="bg-primary text-white" @click="toggle(rightSel, it)">
        <q-item-section>{{ it }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
