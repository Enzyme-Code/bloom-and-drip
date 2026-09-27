<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: number
  step?: number
  unit?: string
  size?: 'lg' | 'md'
}>(), { step: 1, unit: 'g', size: 'lg' })

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

function onInput(e: Event) {
  const v = Number.parseFloat((e.target as HTMLInputElement).value)
  if (Number.isFinite(v)) emit('update:modelValue', v)
  else (e.target as HTMLInputElement).value = props.modelValue.toFixed(1)
}
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <button
      type="button"
      class="rounded bg-surface-container-highest text-primary flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-colors shrink-0"
      :class="size === 'lg' ? 'w-8 h-8' : 'w-7 h-7'"
      aria-label="減少"
      @click="emit('update:modelValue', modelValue - step)"
    >
      <span class="icon text-base">remove</span>
    </button>
    <label class="flex-1 flex items-baseline justify-center gap-1 min-w-0">
      <input
        :value="modelValue.toFixed(1)"
        inputmode="decimal"
        size="1"
        class="bg-transparent text-center font-mono font-medium tracking-tight text-primary focus:outline-none focus:bg-surface-container-lowest/70 rounded w-full"
        :class="size === 'lg' ? 'text-3xl max-w-[5.5rem]' : 'text-2xl max-w-[4.5rem]'"
        @change="onInput"
        @focus="($event.target as HTMLInputElement).select()"
      >
      <span class="font-mono text-sm text-outline">{{ unit }}</span>
    </label>
    <button
      type="button"
      class="rounded bg-surface-container-highest text-primary flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-colors shrink-0"
      :class="size === 'lg' ? 'w-8 h-8' : 'w-7 h-7'"
      aria-label="增加"
      @click="emit('update:modelValue', modelValue + step)"
    >
      <span class="icon text-base">add</span>
    </button>
  </div>
</template>
