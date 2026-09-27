<script setup lang="ts">
const { stages, targetFinish, water, dose, ratio } = useBrewSession()
const timer = useBrewTimer()
const { status, elapsed, stageElapsed, stageIndex, splits, manual } = timer

const currentStage = computed(() => stages.value[stageIndex.value]!)

const stageHeading = computed(() => {
  if (status.value === 'idle') return 'READY · 按下開始計時'
  if (status.value === 'finished') return 'BREW COMPLETE'
  return `STAGE ${stageIndex.value + 1} OF ${stages.value.length} ${status.value === 'paused' ? 'PAUSED' : 'ACTIVE'}`
})

/** Timeline scale: target finish, stretched if the brew runs long */
const timelineMax = computed(() => Math.max(targetFinish.value, elapsed.value) * 1.02)
const pos = (t: number) => `${Math.min(100, (t / timelineMax.value) * 100)}%`
const overTime = computed(() => elapsed.value > targetFinish.value)

function stageValue(i: number) {
  const stage = stages.value[i]!
  return stageText(stage, splits.value.find(s => s.key === stage.key), timer.stageStatus(i), targetFinish.value)
}

/** Water target to show while on a wait / drawdown step: the latest water step reached so far */
const currentTarget = computed(() => {
  for (let i = stageIndex.value; i >= 0; i--) {
    const m = stages.value[i]?.targetMass
    if (m != null) return m
  }
  return stages.value.find(s => s.targetMass != null)?.targetMass ?? water.value
})

const toggleLabel = computed(() => ({
  idle: { icon: 'play_arrow', text: '開始計時 (Start)' },
  running: { icon: 'pause', text: '暫停計時 (Pause)' },
  paused: { icon: 'play_arrow', text: '繼續計時 (Resume)' },
  finished: { icon: 'check', text: '萃取完成 (Done)' }
})[status.value])

const timedSplits = computed(() => splits.value.filter((s): s is typeof s & { t: number } => s.t != null))

/** Remounts the manual form so "清除" also clears its text fields */
const manualFormKey = ref(0)

function toggleManual() {
  if (!manual.value && status.value === 'running') timer.pause()
  manual.value = !manual.value
}

function clearAll() {
  timer.reset()
  manualFormKey.value++
}

const isLastStage = computed(() => stageIndex.value === stages.value.length - 1 && status.value !== 'idle')
</script>

<template>
  <div class="rounded-xl bg-primary-container text-on-primary p-space-lg shadow-md flex flex-col gap-space-md relative overflow-hidden">
    <div class="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
    <div class="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none" />

    <div class="flex items-center justify-between gap-2 border-b border-on-primary-container/20 pb-space-sm relative z-10">
      <div class="flex items-center gap-2">
        <span class="relative flex w-2.5 h-2.5">
          <span v-if="status === 'running'" class="absolute inset-0 rounded-full bg-secondary-fixed animate-ping" />
          <span class="relative w-2.5 h-2.5 rounded-full" :class="status === 'running' ? 'bg-secondary-fixed' : 'bg-on-primary-container'" />
        </span>
        <span class="font-mono text-label-mono tracking-widest text-on-primary-container uppercase">Brew Timer // Pour Stages</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-container-lowest/10 text-secondary-fixed">
          {{ dose }}g · {{ formatRatio(ratio) }}
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[12px] font-semibold transition-colors"
          :class="manual ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-lowest/15 text-on-primary hover:bg-surface-container-lowest/25'"
          @click="toggleManual"
        >
          <span class="icon text-[15px]">{{ manual ? 'timer' : 'edit' }}</span>
          {{ manual ? '改用計時' : '手動輸入' }}
        </button>
      </div>
    </div>

    <!-- Readouts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-space-md items-end py-2 relative z-10">
      <div class="flex flex-col">
        <span class="font-mono text-[11px] text-on-primary-container uppercase tracking-wider mb-1">Total Time</span>
        <div class="font-mono text-display-timer font-medium tabular-nums" :class="{ 'text-secondary-fixed-dim': overTime }">{{ formatTime(elapsed) }}</div>
        <span class="font-mono text-xs text-secondary-fixed-dim mt-0.5">TARGET FINISH: {{ formatTime(targetFinish) }}</span>
      </div>

      <div class="flex flex-col">
        <span class="font-mono text-[11px] text-on-primary-container uppercase tracking-wider mb-1">Stage Target / Total</span>
        <div class="flex items-baseline gap-2">
          <span class="font-mono text-display-timer text-secondary-fixed font-medium tabular-nums">
            {{ currentTarget }}
          </span>
          <span class="font-mono text-base text-on-primary-container whitespace-nowrap">/ {{ water }}g</span>
        </div>
        <span class="font-mono text-xs text-secondary-fixed-dim mt-0.5">{{ currentStage.label }}</span>
      </div>

      <div class="flex flex-col bg-surface-container-lowest/5 p-3 rounded-lg">
        <span class="font-mono text-[11px] text-on-primary-container mb-1">STAGE TIME (本段計時)</span>
        <div class="flex items-baseline gap-1.5">
          <span class="font-mono text-3xl font-medium tabular-nums">{{ status === 'idle' ? '00:00' : formatTime(stageElapsed) }}</span>
        </div>
        <span class="font-mono text-[10px] text-on-primary-container mt-2">{{ currentStage.hint }}</span>
      </div>
    </div>

    <!-- Manual entry -->
    <div v-if="manual" class="bg-surface-container-lowest/5 rounded-lg p-space-sm relative z-10">
      <BrewManualEntry :key="manualFormKey" tone="dark" />
    </div>

    <!-- Stages -->
    <div v-if="!manual" class="bg-surface-container-lowest/5 rounded-lg p-space-sm relative z-10 flex flex-col gap-2">
      <div class="flex items-center justify-between font-mono text-[11px] text-on-primary-container px-1">
        <span>沖煮步驟進程</span>
        <span class="text-secondary-fixed font-medium">{{ stageHeading }}</span>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div
          v-for="(stage, i) in stages"
          :key="stage.key"
          class="p-2.5 rounded flex flex-col gap-1 transition-colors"
          :class="{
            'bg-surface-container-lowest/10 border-l-2 border-secondary-fixed': timer.stageStatus(i) === 'done',
            'bg-secondary-container/20 border-l-2 border-secondary-fixed shadow-inner': timer.stageStatus(i) === 'active',
            'bg-surface-container-lowest/5 opacity-70': timer.stageStatus(i) === 'pending'
          }"
        >
          <div class="flex items-center justify-between">
            <span
              class="font-mono text-[11px]"
              :class="timer.stageStatus(i) === 'pending' ? 'text-on-primary-container' : 'text-secondary-fixed font-medium'"
            >
              {{ i + 1 }}・{{ stage.shortLabel }}
            </span>
            <span
              class="icon text-[14px]"
              :class="[
                timer.stageStatus(i) === 'pending' ? 'text-on-primary-container' : 'text-secondary-fixed',
                timer.stageStatus(i) === 'active' && status === 'running' ? 'animate-pulse' : ''
              ]"
            >
              {{ stageIcon(stage, timer.stageStatus(i)) }}
            </span>
          </div>
          <span class="font-mono text-sm" :class="timer.stageStatus(i) === 'active' ? 'text-secondary-fixed' : 'text-on-primary'">
            {{ stageValue(i) }}
          </span>
          <span class="font-mono text-[10px]" :class="timer.stageStatus(i) === 'active' ? 'text-on-primary' : 'text-on-primary-container'">
            {{ stage.hint }}
          </span>
        </div>
      </div>
    </div>

    <!-- Timeline -->
    <div v-if="!manual" class="bg-surface-container-lowest/5 rounded-lg p-space-sm relative z-10 flex flex-col gap-2">
      <div class="flex items-center justify-between font-mono text-[10px] text-on-primary-container">
        <span>萃取時間軸 (BREW TIMELINE)</span>
        <span :class="overTime ? 'text-secondary-fixed-dim' : 'text-secondary-fixed'">
          {{ overTime ? `超出目標 ${formatTime(elapsed - targetFinish)}` : `剩餘 ${formatTime(targetFinish - elapsed)}` }}
        </span>
      </div>
      <div class="relative h-2 mt-3 mb-5 rounded-full bg-surface-container-lowest/15">
        <div class="absolute inset-y-0 left-0 rounded-full bg-secondary-fixed/80 transition-[width] duration-200" :style="{ width: pos(elapsed) }" />
        <!-- Target finish marker -->
        <div class="absolute -top-1.5 -bottom-1.5 w-px bg-secondary-fixed-dim" :style="{ left: pos(targetFinish) }" />
        <!-- Stage split markers -->
        <div
          v-for="(split, i) in timedSplits"
          :key="split.key"
          class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          :style="{ left: pos(split.t) }"
        >
          <span class="w-3 h-3 rounded-full bg-white ring-2 ring-secondary-fixed" />
          <span class="absolute top-4 font-mono text-[9px] text-on-primary-container whitespace-nowrap">{{ i + 1 }} · {{ formatTime(split.t) }}</span>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div v-if="manual" class="grid grid-cols-2 gap-2 relative z-10 pt-1">
      <button
        type="button"
        class="py-2.5 px-3 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary text-label-md flex items-center justify-center gap-1.5 transition-colors shadow"
        @click="manual = false"
      >
        <span class="icon text-[18px]">check</span>
        完成輸入
      </button>
      <button
        type="button"
        class="py-2.5 px-3 rounded-lg bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-label-md flex items-center justify-center gap-1.5 transition-colors"
        @click="clearAll"
      >
        <span class="icon text-[18px]">backspace</span>
        清除數值
      </button>
    </div>
    <div v-else class="grid grid-cols-3 gap-2 relative z-10 pt-1">
      <button
        type="button"
        class="py-2.5 px-3 rounded-lg bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-label-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        :disabled="status === 'finished'"
        @click="timer.toggle"
      >
        <span class="icon text-[18px] text-secondary-fixed">{{ toggleLabel.icon }}</span>
        {{ toggleLabel.text }}
      </button>
      <button
        type="button"
        class="py-2.5 px-3 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary text-label-md flex items-center justify-center gap-1.5 transition-colors shadow disabled:opacity-50"
        :disabled="status === 'finished'"
        @click="timer.nextStage"
      >
        <span class="icon text-[18px]">{{ isLastStage ? 'flag' : 'skip_next' }}</span>
        {{ isLastStage ? '完成萃取 (Finish)' : status === 'idle' ? '開始並記錄 (Start)' : '下一步 (Next Step)' }}
      </button>
      <button
        type="button"
        class="py-2.5 px-3 rounded-lg bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-label-md flex items-center justify-center gap-1.5 transition-colors"
        @click="timer.reset"
      >
        <span class="icon text-[18px]">replay</span>
        重新計時 (Reset)
      </button>
    </div>
  </div>
</template>
