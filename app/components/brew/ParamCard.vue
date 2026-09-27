<script setup lang="ts">
defineProps<{ icon: string; label: string; suffix?: string; numeric?: boolean; hint?: string }>()
const value = defineModel<string | number>('value', { required: true })
const note = defineModel<string>('note')
</script>

<template>
  <div class="p-3 rounded-lg bg-surface-container flex flex-col gap-1 min-w-0 focus-within:ring-1 focus-within:ring-secondary">
    <span class="font-mono text-[10px] text-outline uppercase flex items-center gap-1">
      <span class="icon text-[13px] text-secondary">{{ icon }}</span>
      {{ label }}
    </span>
    <label class="flex items-baseline gap-1">
      <input
        v-if="numeric"
        v-model.number="value"
        type="number"
        step="0.5"
        class="w-full min-w-0 bg-transparent font-mono text-base text-primary font-medium focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      >
      <input
        v-else
        v-model="value"
        class="w-full min-w-0 bg-transparent font-mono text-base text-primary font-medium focus:outline-none"
      >
      <span v-if="suffix" class="font-mono text-base text-primary shrink-0">{{ suffix }}</span>
    </label>
    <input
      v-if="note !== undefined"
      v-model="note"
      class="hidden md:block w-full min-w-0 bg-transparent text-[11px] text-on-surface-variant focus:outline-none"
    >
    <span v-else-if="hint" class="hidden md:block text-[11px] text-on-surface-variant">{{ hint }}</span>
  </div>
</template>
