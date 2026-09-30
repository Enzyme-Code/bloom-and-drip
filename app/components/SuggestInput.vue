<script setup lang="ts">
/**
 * Free-text input with a suggestion list. Unlike <datalist>, focusing it lists every option even when
 * the field already has a value; the list only filters once the user starts typing.
 * Other attributes (class, placeholder, maxlength…) go to the input.
 */
defineOptions({ inheritAttrs: false })
const props = defineProps<{ options: readonly string[] }>()
const model = defineModel<string>({ required: true })

const open = ref(false)
/** True once the user typed since focusing: then the list narrows to matches */
const filtering = ref(false)
const highlighted = ref(-1)
const input = ref<HTMLInputElement>()

const shown = computed(() => {
  const q = model.value.trim().toLowerCase()
  return filtering.value && q ? props.options.filter(o => o.toLowerCase().includes(q)) : props.options
})

function show() {
  open.value = true
  filtering.value = false
  highlighted.value = -1
}

function onInput() {
  open.value = true
  filtering.value = true
  highlighted.value = -1
}

function pick(option: string) {
  model.value = option
  open.value = false
}

function toggle() {
  if (open.value) open.value = false
  else {
    show()
    input.value?.focus()
  }
}

function onKey(e: KeyboardEvent) {
  const n = shown.value.length
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!open.value) show()
    else if (n && e.key === 'ArrowDown') highlighted.value = (highlighted.value + 1) % n
    else if (n) highlighted.value = highlighted.value <= 0 ? n - 1 : highlighted.value - 1
    e.preventDefault()
  } else if (e.key === 'Enter' && open.value && highlighted.value >= 0) {
    pick(shown.value[highlighted.value]!)
    e.preventDefault()
  } else if (e.key === 'Escape' && open.value) {
    open.value = false
    // Keep a surrounding dialog open
    e.stopPropagation()
  }
}
</script>

<template>
  <div class="relative">
    <input
      ref="input"
      v-bind="$attrs"
      v-model="model"
      role="combobox"
      autocomplete="off"
      :aria-expanded="open && shown.length > 0"
      class="pr-9"
      @focus="show"
      @click="open || show()"
      @input="onInput"
      @blur="open = false"
      @keydown="onKey"
    >
    <button
      type="button"
      tabindex="-1"
      class="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded flex items-center justify-center text-outline hover:text-primary"
      aria-label="顯示選項"
      @mousedown.prevent
      @click="toggle"
    >
      <span class="icon text-[18px] transition-transform" :class="{ 'rotate-180': open }">expand_more</span>
    </button>
    <ul
      v-if="open && shown.length"
      role="listbox"
      class="absolute left-0 right-0 top-full mt-1 z-40 max-h-56 overflow-y-auto overscroll-contain rounded-lg bg-surface-container-lowest shadow-lg border border-outline-variant/50 p-1"
    >
      <li
        v-for="(o, i) in shown"
        :key="o"
        role="option"
        :aria-selected="o === model"
        class="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-body-sm cursor-pointer"
        :class="i === highlighted ? 'bg-surface-container-high' : 'hover:bg-surface-container'"
        @mousedown.prevent
        @click="pick(o)"
      >
        <span class="truncate text-on-surface">{{ o }}</span>
        <span v-if="o === model" class="icon text-[16px] text-secondary shrink-0">check</span>
      </li>
    </ul>
  </div>
</template>
