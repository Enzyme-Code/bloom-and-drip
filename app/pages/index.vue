<script setup lang="ts">
useHead({ title: '新增沖煮紀錄 — Bloom & Drip' })

const { logMode } = useBrewSession()
</script>

<template>
  <div class="flex flex-col w-full pb-24 md:pb-0">
    <BrewPageHeader />
    <BrewBeanProfile />

    <div class="w-full px-margin-mobile md:px-margin pb-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-md md:gap-gutter">
      <div class="lg:col-span-7 min-w-0 flex flex-col gap-space-md md:gap-space-lg">
        <BrewLogMode />
        <template v-if="logMode === 'full'">
          <BrewRatioCalculator />
          <BrewMethodCard />
          <div class="hidden md:block"><BrewConsole /></div>
          <div class="md:hidden"><BrewConsoleCompact /></div>
        </template>
      </div>

      <div class="lg:col-span-5 min-w-0 flex flex-col gap-space-lg">
        <div class="hidden md:block"><BrewPhotoSnapshot /></div>
        <BrewSensoryPanel />
      </div>
    </div>

    <BrewSaveBar />
  </div>
</template>
