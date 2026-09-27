<script setup lang="ts">
useHead({ title: '器具設備 — Bloom & Drip' })

const { params } = useBrewSession()
const { logs } = useBrewLogs()

const drippers = computed(() => {
  const counts = new Map<string, number>()
  for (const l of logs.value) counts.set(l.params.dripper, (counts.get(l.params.dripper) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
})
</script>

<template>
  <div class="flex flex-col w-full pb-space-xl">
    <PageTitle crumb="器具設備" title="器具設備" tag="Gear" />
    <div class="px-margin-mobile md:px-margin pt-space-md grid grid-cols-1 lg:grid-cols-2 gap-space-md">
      <section class="rounded-xl bg-surface-container-low p-space-lg flex flex-col gap-space-md">
        <div class="flex items-center justify-between">
          <span class="text-label-md uppercase tracking-wider text-primary">目前沖煮設定</span>
          <span class="font-mono text-label-mono text-outline">ACTIVE SETUP</span>
        </div>
        <div class="grid grid-cols-2 gap-space-sm">
          <BrewParamCard v-model:value="params.temperature" icon="device_thermostat" label="注水水溫" suffix="°C" hint="PID 智能溫控壺" numeric />
          <BrewParamCard v-model:value="params.grind" v-model:note="params.grindNote" icon="grain" label="研磨刻度" />
          <BrewParamCard v-model:value="params.dripper" v-model:note="params.filter" icon="filter_vintage" label="萃取濾杯" />
          <BrewParamCard v-model:value="params.waterPpm" v-model:note="params.waterNote" icon="water_drop" label="沖煮水質" suffix="ppm" numeric />
        </div>
      </section>

      <section class="lg:col-span-2 rounded-xl bg-surface-container-low p-space-lg flex flex-col gap-space-sm">
        <span class="text-label-md uppercase tracking-wider text-primary">濾杯使用紀錄</span>
        <p v-if="!drippers.length" class="text-body-sm text-on-surface-variant">尚無紀錄。</p>
        <div v-for="[name, count] in drippers" :key="name" class="flex items-center justify-between rounded-lg bg-surface-container p-3">
          <span class="font-mono text-body-sm text-primary">{{ name }}</span>
          <span class="font-mono text-label-mono text-secondary">{{ count }} 次</span>
        </div>
      </section>
    </div>
  </div>
</template>
