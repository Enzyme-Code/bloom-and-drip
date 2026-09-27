<script setup lang="ts">
import type { GearSet } from '~/types/brew'

const props = defineProps<{ gear: GearSet; active: boolean; removable: boolean }>()
const emit = defineEmits<{ select: []; duplicate: []; remove: [] }>()
const { update } = useGear()

/** Two-way binding for one field that writes through useGear.update */
function field<K extends keyof Omit<GearSet, 'id'>>(key: K) {
  return computed({
    get: () => props.gear[key],
    set: (v: GearSet[K]) => update(props.gear.id, { [key]: v } as Partial<GearSet>)
  })
}

const name = field('name')
const temperature = field('temperature')
const grind = field('grind')
const grindNote = field('grindNote')
const dripper = field('dripper')
const filter = field('filter')
const waterSource = field('waterSource')
const waterNote = field('waterNote')

function onRemove() {
  if (window.confirm(`確定要刪除「${props.gear.name}」嗎？`)) emit('remove')
}
</script>

<template>
  <section
    class="rounded-xl bg-surface-container-low p-4 md:p-space-lg flex flex-col gap-space-md transition-shadow"
    :class="active ? 'ring-2 ring-secondary shadow-sm' : ''"
  >
    <div class="flex items-center justify-between gap-2">
      <input
        v-model="name"
        class="min-w-0 flex-1 px-2 py-1 -ml-2 rounded bg-transparent font-serif text-headline-sm text-primary hover:bg-surface-container focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-secondary"
        maxlength="30"
        aria-label="器具組合名稱"
      >
      <span v-if="active" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-on-secondary text-[11px] font-semibold shrink-0">
        <span class="icon text-[14px]">check</span>使用中
      </span>
      <button
        v-else
        type="button"
        class="px-2.5 py-1 rounded-lg bg-primary text-on-primary text-[12px] font-semibold shrink-0"
        @click="emit('select')"
      >
        使用這組
      </button>
    </div>

    <div class="grid grid-cols-2 gap-space-sm">
      <BrewParamCard v-model:value="temperature" editing icon="device_thermostat" label="注水水溫" suffix="°C" numeric />
      <BrewParamCard v-model:value="grind" v-model:note="grindNote" editing icon="grain" label="研磨刻度" />
      <BrewParamCard v-model:value="dripper" v-model:note="filter" editing icon="filter_vintage" label="萃取濾杯" />
      <BrewParamCard v-model:value="waterSource" v-model:note="waterNote" editing icon="water_drop" label="水源" />
    </div>

    <div class="flex items-center justify-end gap-3 text-[12px]">
      <button type="button" class="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary" @click="emit('duplicate')">
        <span class="icon text-[16px]">content_copy</span>複製
      </button>
      <button
        v-if="removable"
        type="button"
        class="inline-flex items-center gap-1 text-outline hover:text-error"
        @click="onRemove"
      >
        <span class="icon text-[16px]">delete</span>刪除
      </button>
    </div>
  </section>
</template>
