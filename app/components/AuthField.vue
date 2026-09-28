<script setup lang="ts">
const props = defineProps<{ label: string; type?: string; autocomplete?: string; placeholder?: string; error?: string }>()
const model = defineModel<string>({ required: true })

/** Password fields get an eye button that shows what was typed */
const isPassword = computed(() => props.type === 'password')
const revealed = ref(false)
const inputType = computed(() => (isPassword.value && revealed.value ? 'text' : props.type ?? 'text'))
</script>

<template>
  <label class="flex flex-col gap-1.5">
    <span class="text-label-md text-on-surface-variant">{{ label }}</span>
    <span class="relative flex">
      <input
        v-model="model"
        :type="inputType"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        class="w-full px-3 py-2.5 rounded-lg bg-surface-container text-on-surface text-body-md placeholder:text-outline/70 focus:outline-none focus:ring-1 focus:ring-secondary"
        :class="[{ 'ring-1 ring-error': error }, isPassword ? 'pr-11' : '']"
      >
      <button
        v-if="isPassword"
        type="button"
        class="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-outline hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary"
        :aria-label="revealed ? '隱藏密碼' : '顯示密碼'"
        :aria-pressed="revealed"
        @click="revealed = !revealed"
      >
        <span class="icon text-[20px]">{{ revealed ? 'visibility_off' : 'visibility' }}</span>
      </button>
    </span>
    <span v-if="error" class="text-[12px] text-error">{{ error }}</span>
  </label>
</template>
