<script setup lang="ts">
import { methodTemplates } from '~/data/methods'
import type { LogMode } from '~/types/brew'

const { logMode, setLogMode, tasteMethod, tasteGearId, method } = useBrewSession()
const { gearSets } = useGear()
const { methods: savedMethods } = useSavedMethods()

const MODES: { value: LogMode; label: string; icon: string; hint: string }[] = [
  { value: 'full', label: '完整紀錄', icon: 'timer', hint: '粉水比、手法步驟、計時與口感' },
  { value: 'taste', label: '只記口感', icon: 'local_cafe', hint: '只記風味與評分，不需要沖煮參數' }
]

/** Saved methods, template names and the current custom method, as suggestions for the free-text field */
const methodSuggestions = computed(() => [
  ...new Set([...savedMethods.value.map(m => m.name), ...methodTemplates().map(t => t.method.name), method.value.name].filter(Boolean))
])

const fieldClass = 'w-full min-w-0 px-3 py-2 rounded-lg bg-surface-container-lowest text-body-sm text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-1 focus:ring-secondary'
</script>

<template>
  <section class="flex flex-col gap-3">
    <div class="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-container" role="radiogroup" aria-label="紀錄方式">
      <button
        v-for="m in MODES"
        :key="m.value"
        type="button"
        role="radio"
        :aria-checked="logMode === m.value"
        class="flex flex-col items-center sm:flex-row sm:justify-center gap-0.5 sm:gap-2 px-2 py-2 rounded-lg transition-colors min-w-0"
        :class="logMode === m.value ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'"
        @click="setLogMode(m.value)"
      >
        <span class="flex items-center gap-1.5 text-label-md whitespace-nowrap">
          <span class="icon text-[18px]" :class="logMode === m.value ? 'text-secondary' : ''">{{ m.icon }}</span>{{ m.label }}
        </span>
        <span class="hidden xl:inline text-[11px] text-outline truncate min-w-0">{{ m.hint }}</span>
      </button>
    </div>

    <div v-if="logMode === 'taste'" class="rounded-xl bg-surface-container-low p-4 md:p-space-md flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <span class="icon text-[18px] text-secondary">coffee_maker</span>
        <span class="text-label-md text-primary">沖煮方式</span>
        <span class="text-[11px] text-outline">選填</span>
      </div>
      <p class="text-body-sm text-on-surface-variant">
        只記錄用了什麼手法與器具，不會存粉量、水量與計時。
      </p>
      <div class="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
        <label class="flex flex-col gap-1 text-[11px] font-semibold text-on-surface-variant min-w-0">
          手法
          <input v-model="tasteMethod" :class="fieldClass" list="taste-method-options" placeholder="例：4:6 法" maxlength="40">
          <datalist id="taste-method-options">
            <option v-for="name in methodSuggestions" :key="name" :value="name" />
          </datalist>
        </label>
        <label class="flex flex-col gap-1 text-[11px] font-semibold text-on-surface-variant min-w-0">
          器具
          <select v-model="tasteGearId" :class="fieldClass">
            <option value="">不指定</option>
            <option v-for="g in gearSets" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
        </label>
      </div>
    </div>
  </section>
</template>
