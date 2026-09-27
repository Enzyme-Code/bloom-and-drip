<script setup lang="ts">
const props = defineProps<{ icon: string; label: string; suffix?: string; numeric?: boolean; hint?: string; editing?: boolean }>()
const emit = defineEmits<{ activate: [] }>()
const value = defineModel<string | number>('value', { required: true })
const note = defineModel<string>('note')

const inputClass = 'w-full min-w-0 px-2 py-1 rounded bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-secondary'

function onCardClick() {
  if (!props.editing) emit('activate')
}
</script>

<template>
  <div
    class="group relative p-3 rounded-lg bg-surface-container flex flex-col gap-1 min-w-0 transition-colors"
    :class="editing ? 'ring-1 ring-secondary/40' : 'cursor-pointer hover:bg-surface-container-high'"
    :role="editing ? undefined : 'button'"
    :tabindex="editing ? undefined : 0"
    :aria-label="editing ? undefined : `編輯${label}`"
    @click="onCardClick"
    @keydown.enter="onCardClick"
  >
    <span class="font-mono text-[10px] text-outline uppercase flex items-center gap-1">
      <span class="icon text-[13px] text-secondary">{{ icon }}</span>
      {{ label }}
      <span v-if="!editing" class="icon text-[12px] ml-auto opacity-0 group-hover:opacity-60 transition-opacity">edit</span>
    </span>

    <template v-if="editing">
      <label class="flex items-baseline gap-1">
        <input
          v-if="numeric"
          v-model.number="value"
          type="number"
          step="0.5"
          :class="[inputClass, 'font-mono text-base text-primary font-medium [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none']"
        >
        <input v-else v-model="value" :class="[inputClass, 'font-mono text-base text-primary font-medium']">
        <span v-if="suffix" class="font-mono text-sm text-outline shrink-0">{{ suffix }}</span>
      </label>
      <input
        v-if="note !== undefined"
        v-model="note"
        placeholder="備註"
        :class="[inputClass, 'text-[12px] text-on-surface-variant']"
      >
      <span v-else-if="hint" class="text-[11px] text-on-surface-variant">{{ hint }}</span>
    </template>

    <template v-else>
      <span class="flex items-baseline justify-between gap-1 font-mono text-base text-primary font-medium min-w-0">
        <span class="truncate">{{ value === '' ? '—' : value }}</span>
        <span v-if="suffix" class="shrink-0">{{ suffix }}</span>
      </span>
      <span v-if="note || hint" class="hidden md:block text-[11px] text-on-surface-variant truncate">{{ note || hint }}</span>
    </template>
  </div>
</template>
