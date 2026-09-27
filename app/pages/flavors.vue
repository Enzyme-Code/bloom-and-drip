<script setup lang="ts">
import { FLAVOR_LIBRARY } from '~/data/beans'

useHead({ title: '風味庫 — Bloom & Drip' })

const { logs } = useBrewLogs()

const flavorStats = computed(() => {
  const counts = new Map<string, { count: number; beans: Set<string> }>()
  for (const f of FLAVOR_LIBRARY) counts.set(f, { count: 0, beans: new Set() })
  for (const log of logs.value) {
    for (const f of log.flavors) {
      const entry = counts.get(f) ?? { count: 0, beans: new Set<string>() }
      entry.count++
      entry.beans.add(log.bean.name)
      counts.set(f, entry)
    }
  }
  const max = Math.max(1, ...[...counts.values()].map(v => v.count))
  return [...counts.entries()]
    .map(([name, v]) => ({ name, count: v.count, beans: [...v.beans], pct: (v.count / max) * 100 }))
    .sort((a, b) => b.count - a.count)
})
</script>

<template>
  <div class="flex flex-col w-full pb-space-xl">
    <PageTitle crumb="風味庫" title="風味庫" tag="Flavor Library" />
    <div class="px-margin-mobile md:px-margin pt-space-md">
      <p class="text-body-sm text-on-surface-variant mb-space-md">依你的沖煮紀錄統計出現過的風味標籤，未來可延伸為完整的 SCA 風味輪。</p>
      <ul class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
        <li v-for="f in flavorStats" :key="f.name" class="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="font-medium text-primary">{{ f.name }}</span>
            <span class="font-mono text-label-mono text-secondary">{{ f.count }} 次</span>
          </div>
          <div class="h-2 rounded-full bg-surface-container overflow-hidden">
            <div class="h-full bg-secondary rounded-full" :style="{ width: `${f.pct}%` }" />
          </div>
          <p class="text-[12px] text-on-surface-variant truncate">{{ f.beans.length ? f.beans.join('、') : '尚無紀錄' }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>
