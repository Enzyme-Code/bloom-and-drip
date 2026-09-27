<script setup lang="ts">
const { bean, nextBean } = useBrewSession()
const { status } = useBrewTimer()
const toast = useToast()

function onSwap() {
  if (status.value === 'running') {
    toast.show('沖煮進行中，請先暫停再更換咖啡豆', 'info')
    return
  }
  nextBean()
  toast.show(`已更換為 ${bean.value.name}`, 'swap_horiz')
}

function onScan() {
  toast.show('掃描功能即將推出', 'qr_code_scanner')
}
</script>

<template>
  <section class="w-full px-margin-mobile md:px-margin pt-space-md pb-space-md md:pb-space-lg">
    <!-- Desktop -->
    <div class="hidden md:block rounded-xl bg-surface-container p-space-md shadow-sm">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div class="flex items-center gap-space-md">
          <div class="w-12 h-12 rounded-xl bg-secondary-container/40 flex items-center justify-center shrink-0">
            <span class="icon text-secondary text-2xl">coffee</span>
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="font-serif text-headline-sm text-primary tracking-tight">{{ bean.name }}</span>
              <span class="font-mono text-label-mono text-outline">{{ bean.nameEn }}</span>
            </div>
            <div class="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              <span class="px-2 py-0.5 rounded-sm bg-surface-container-highest text-primary font-medium">{{ bean.process }}</span>
              <span class="px-2 py-0.5 rounded-sm bg-secondary-fixed/50 text-on-secondary-fixed font-medium">{{ bean.roaster }}</span>
              <span class="px-2 py-0.5 rounded-sm bg-surface-container-highest text-on-surface-variant">{{ bean.roast }}</span>
              <span class="px-2 py-0.5 rounded-sm bg-surface-container-highest text-on-surface-variant">建議悶蒸 {{ bean.bloomSeconds }}s</span>
              <span class="px-2 py-0.5 rounded-sm bg-surface-container-highest text-on-surface-variant">產區海拔 {{ bean.altitude.toLocaleString() }}m</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-body-sm hover:bg-surface-container-highest transition-colors"
            @click="onScan"
          >
            <span class="icon text-[16px]">qr_code_scanner</span>
            掃描豆袋配方
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-body-sm hover:bg-surface-container-highest transition-colors"
            @click="onSwap"
          >
            <span class="icon text-[16px]">swap_horiz</span>
            更換咖啡豆
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile -->
    <div class="md:hidden rounded-xl bg-surface-container p-4 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-1.5 font-mono text-[11px] mb-1.5">
          <span class="px-2 py-0.5 rounded-sm bg-surface-container-highest text-primary font-medium">{{ bean.process }}</span>
          <span class="px-2 py-0.5 text-on-surface-variant tracking-wider">{{ bean.roaster }}</span>
          <span class="px-2 py-0.5 rounded-sm bg-secondary-fixed/60 text-on-secondary-fixed">{{ bean.roast.split(' ')[0] }}</span>
        </div>
        <h2 class="font-serif text-headline-sm text-primary tracking-tight">{{ bean.name }}</h2>
        <p class="text-body-sm text-on-surface-variant mt-0.5">{{ bean.nameEn }} • 建議悶蒸 {{ bean.bloomSeconds }}s</p>
      </div>
      <button
        type="button"
        class="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0"
        aria-label="更換咖啡豆"
        @click="onSwap"
      >
        <span class="icon text-[20px]">swap_horiz</span>
      </button>
    </div>
  </section>
</template>
