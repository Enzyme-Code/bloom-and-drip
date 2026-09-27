<script setup lang="ts">
const { stages, targetFinish } = useBrewSession()
const timer = useBrewTimer()
const { status, elapsed, stageElapsed, splits, manual } = timer
const manualFormKey = ref(0)

function toggleManual() {
  if (!manual.value && status.value === 'running') timer.pause()
  manual.value = !manual.value
}

function clearAll() {
  timer.reset()
  manualFormKey.value++
}

const progress = computed(() =>
  status.value === 'finished' ? 100 : Math.min(100, (elapsed.value / targetFinish.value) * 100)
)

function stageDetail(i: number) {
  const stage = stages.value[i]!
  return stageText(stage, splits.value.find(s => s.key === stage.key), timer.stageStatus(i), targetFinish.value)
}
</script>

<template>
  <div class="rounded-xl bg-surface-container-high p-4 flex flex-col gap-4">
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-start gap-2">
        <span class="icon text-[18px] text-secondary">timer</span>
        <span class="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider">即時萃取碼錶 (Timer &amp; Stages)</span>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold shrink-0 transition-colors"
        :class="manual ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-primary'"
        @click="toggleManual"
      >
        <span class="icon text-[15px]">{{ manual ? 'timer' : 'edit' }}</span>
        {{ manual ? '改用計時' : '手動輸入' }}
      </button>
    </div>

    <div class="text-center">
      <div class="font-mono text-display-timer text-primary font-medium tabular-nums">{{ formatTime(elapsed) }}</div>
      <div class="font-mono text-[11px] text-outline tracking-widest">
        {{ manual ? '手動輸入 (MANUAL)' : `分 : 秒 (MIN : SEC)${status === 'idle' ? '' : ` · 本段 ${formatTime(stageElapsed)}`}` }}
      </div>
    </div>

    <div class="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
      <div class="h-full bg-secondary rounded-full transition-[width] duration-300" :style="{ width: `${progress}%` }" />
    </div>

    <template v-if="manual">
      <BrewManualEntry :key="manualFormKey" tone="light" />
      <div class="grid grid-cols-2 gap-2">
        <button type="button" class="py-3 rounded-lg bg-primary text-on-primary text-label-md flex items-center justify-center gap-1.5" @click="manual = false">
          <span class="icon text-[18px]">check</span>完成輸入
        </button>
        <button type="button" class="py-3 rounded-lg bg-surface-container-lowest text-primary text-label-md flex items-center justify-center gap-1.5" @click="clearAll">
          <span class="icon text-[18px]">backspace</span>清除數值
        </button>
      </div>
    </template>

    <ol v-if="!manual" class="flex flex-col gap-1.5">
      <li
        v-for="(stage, i) in stages"
        :key="stage.key"
        class="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-body-sm"
        :class="{
          'bg-surface-container-lowest text-primary': timer.stageStatus(i) === 'done',
          'bg-surface-dim text-primary font-semibold': timer.stageStatus(i) === 'active',
          'bg-surface-container text-outline': timer.stageStatus(i) === 'pending'
        }"
      >
        <span class="flex items-center gap-2 min-w-0">
          <span class="icon text-[18px]" :class="{ 'animate-pulse': timer.stageStatus(i) === 'active' && status === 'running' }">{{ stageIcon(stage, timer.stageStatus(i)) }}</span>
          <span class="truncate">{{ i + 1 }}. {{ stage.label }}</span>
        </span>
        <span class="font-mono text-[11px] font-normal shrink-0">{{ stageDetail(i) }}</span>
      </li>
    </ol>

    <div v-if="!manual" class="grid grid-cols-[1.4fr_1fr_auto] gap-2">
      <button
        type="button"
        class="py-3 rounded-lg bg-primary text-on-primary text-label-md flex items-center justify-center gap-1.5 disabled:opacity-50"
        :disabled="status === 'finished'"
        @click="timer.toggle"
      >
        <span class="icon text-[20px]">{{ status === 'running' ? 'pause' : status === 'finished' ? 'check' : 'play_arrow' }}</span>
        {{ { idle: '開始', running: '暫停', paused: '繼續', finished: '完成' }[status] }}
      </button>
      <button
        type="button"
        class="py-3 rounded-lg bg-surface-container-lowest text-primary text-label-md flex items-center justify-center gap-1.5 disabled:opacity-50"
        :disabled="status === 'finished'"
        @click="timer.nextStage"
      >
        <span class="icon text-[18px]">flag</span>
        {{ status === 'idle' ? '開始' : '下一步' }}
      </button>
      <button
        type="button"
        class="w-12 py-3 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center"
        aria-label="重新計時"
        @click="timer.reset"
      >
        <span class="icon text-[20px]">replay</span>
      </button>
    </div>
  </div>
</template>
