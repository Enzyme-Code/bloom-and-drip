<script setup lang="ts">
const { gearSets, selectedId, selected, select } = useGear()

const items = computed(() => [
  { icon: 'device_thermostat', label: '水溫', value: `${selected.value.temperature}°C` },
  { icon: 'grain', label: '研磨', value: selected.value.grind },
  { icon: 'filter_vintage', label: '濾杯', value: selected.value.dripper },
  { icon: 'water_drop', label: '水源', value: selected.value.waterSource || '—' }
])
</script>

<template>
  <div class="rounded-lg bg-surface-container p-3 flex flex-col gap-2.5">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <label class="flex items-center gap-2 min-w-0">
        <span class="font-mono text-[10px] text-outline uppercase shrink-0">器具組合</span>
        <select
          :value="selectedId"
          class="min-w-0 max-w-full pl-2.5 pr-8 py-1.5 rounded-lg bg-surface-container-lowest text-body-sm font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
          aria-label="選擇器具組合"
          @change="select(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="g in gearSets" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
      </label>
      <NuxtLink
        to="/gear"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high text-[12px] font-semibold text-on-surface hover:bg-surface-container-highest transition-colors"
      >
        <span class="icon text-[15px]">tune</span>管理器具
      </NuxtLink>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div v-for="item in items" :key="item.label" class="flex items-center gap-1.5 min-w-0">
        <span class="icon text-[15px] text-secondary shrink-0">{{ item.icon }}</span>
        <span class="font-mono text-[10px] text-outline shrink-0">{{ item.label }}</span>
        <span class="font-mono text-body-sm text-primary truncate">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>
