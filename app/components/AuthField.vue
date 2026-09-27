<script setup lang="ts">
defineProps<{ label: string; type?: string; autocomplete?: string; placeholder?: string; error?: string }>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <label class="flex flex-col gap-1.5">
    <span class="text-label-md text-on-surface-variant">{{ label }}</span>
    <input
      v-model="model"
      :type="type ?? 'text'"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      class="w-full px-3 py-2.5 rounded-lg bg-surface-container text-on-surface text-body-md placeholder:text-outline/70 focus:outline-none focus:ring-1 focus:ring-secondary"
      :class="{ 'ring-1 ring-error': error }"
    >
    <span v-if="error" class="text-[12px] text-error">{{ error }}</span>
  </label>
</template>
