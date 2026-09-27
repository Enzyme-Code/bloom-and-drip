<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: number
  step?: number
  unit?: string
  /** Custom +/- behaviour (e.g. water that moves the ratio in 0.5 steps); defaults to ±step */
  stepBy?: (direction: 1 | -1) => void
}>(), { step: 1, unit: 'g', stepBy: undefined })

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const text = computed(() => props.modelValue.toFixed(1))

function bump(direction: 1 | -1) {
  if (props.stepBy) props.stepBy(direction)
  else emit('update:modelValue', props.modelValue + direction * props.step)
}

function onInput(e: Event) {
  const v = Number.parseFloat((e.target as HTMLInputElement).value)
  if (Number.isFinite(v)) emit('update:modelValue', v)
  else (e.target as HTMLInputElement).value = text.value
}

// Layout follows the stepper's own width (container queries): in a narrow phone card the number gets
// its own row with wide −/+ buttons underneath; with room to spare it's the classic [−] 240.0 [+] row.
const buttonClass = 'h-8 w-full @[9rem]:w-7 @[9rem]:h-7 @[12rem]:w-8 @[12rem]:h-8 rounded bg-surface-container-highest text-primary flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-colors shrink-0'
</script>

<template>
  <div class="@container">
    <div class="grid grid-cols-2 gap-1.5 @[9rem]:flex @[9rem]:items-center @[9rem]:justify-between @[9rem]:gap-1 @[12rem]:gap-2">
      <button type="button" :class="[buttonClass, 'order-2 @[9rem]:order-none']" aria-label="減少" @click="bump(-1)">
        <span class="icon text-base">remove</span>
      </button>
      <label class="col-span-2 order-1 @[9rem]:order-none flex-1 flex items-baseline justify-center gap-0.5 min-w-0">
        <input
          :value="text"
          inputmode="decimal"
          size="1"
          class="bg-transparent text-center font-mono font-medium tracking-tight text-primary focus:outline-none focus:bg-surface-container-lowest/70 rounded min-w-0 text-2xl @[9rem]:text-xl @[12rem]:text-2xl @[15rem]:text-3xl"
          :style="{ width: `${text.length + 0.3}ch` }"
          @change="onInput"
          @focus="($event.target as HTMLInputElement).select()"
        >
        <span class="font-mono text-sm text-outline">{{ unit }}</span>
      </label>
      <button type="button" :class="[buttonClass, 'order-3 @[9rem]:order-none']" aria-label="增加" @click="bump(1)">
        <span class="icon text-base">add</span>
      </button>
    </div>
  </div>
</template>
