<script setup lang="ts">
const { loadRecommended } = useBrewSession()
const { nextRecipeNo } = useBrewLogs()
const { save } = useBrewSave()
const toast = useToast()

async function onLoad() {
  const source = await loadRecommended()
  toast.show(source === 'preset' ? '已載入你的預設沖煮配方' : '已載入烘豆商推薦參數', 'tune')
}
</script>

<template>
  <section class="hidden md:block w-full px-margin py-space-md bg-surface-container-low/70">
    <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-space-xs font-mono text-label-mono text-outline">
          <NuxtLink to="/journal" class="hover:text-primary transition-colors">沖煮工作台</NuxtLink>
          <span>/</span>
          <span class="text-secondary font-medium">即時萃取紀錄與感官實驗室</span>
          <span class="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-secondary-fixed/40 text-on-secondary-fixed text-[10px] tracking-tight ml-2">
            RECIPE NO. #{{ nextRecipeNo }}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <h1 class="font-serif text-headline-lg text-primary tracking-tight">新增沖煮紀錄</h1>
          <span class="font-mono text-[11px] text-secondary tracking-wider uppercase px-2 py-0.5 rounded bg-surface-container">Live Session</span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-space-sm">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant text-label-md hover:bg-surface-container-high transition-all"
          @click="onLoad"
        >
          <span class="icon text-[16px] text-secondary">tune</span>
          載入推薦參數
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md hover:bg-primary-container transition-all shadow-sm"
          @click="save"
        >
          <span class="icon text-[16px]">save</span>
          儲存並歸檔紀錄
        </button>
      </div>
    </div>
  </section>
</template>
