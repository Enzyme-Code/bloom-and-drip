<script setup lang="ts">
const props = withDefaults(defineProps<{ tone?: 'dark' | 'light' }>(), { tone: 'light' })

const { stages, targetFinish } = useBrewSession()
const timer = useBrewTimer()

// Draft as typed text so partial input like "2:" isn't wiped while typing
const initial = timer.manualEntries()
const draft = reactive({
  total: timer.status.value === 'idle' ? '' : formatTime(timer.elapsed.value),
  stages: initial.map(e => ({ t: e.t == null ? '' : formatTime(e.t), m: e.m == null ? '' : String(e.m) }))
})

const parseMass = (s: string) => {
  const n = Number.parseFloat(s)
  return s.trim() && Number.isFinite(n) && n >= 0 ? round1(n) : null
}
const invalidTime = (s: string) => s.trim() !== '' && parseTime(s) == null
const invalidMass = (s: string) => s.trim() !== '' && parseMass(s) == null

function commit() {
  timer.applyManual(
    draft.stages.map(e => ({ t: parseTime(e.t), m: parseMass(e.m) })),
    parseTime(draft.total)
  )
}

const dark = computed(() => props.tone === 'dark')
const labelClass = computed(() => dark.value ? 'text-on-primary-container' : 'text-on-surface-variant')
const inputClass = computed(() => [
  'w-full min-w-0 px-2.5 py-1.5 rounded font-mono text-sm focus:outline-none focus:ring-1',
  dark.value
    ? 'bg-surface-container-lowest/10 text-on-primary placeholder:text-on-primary-container/60 focus:ring-secondary-fixed'
    : 'bg-surface-container-lowest text-primary placeholder:text-outline/60 focus:ring-secondary'
])
const cardClass = computed(() => dark.value ? 'bg-surface-container-lowest/5' : 'bg-surface-container')
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="font-mono text-[10px]" :class="labelClass">
      看著你的秤填寫每段結束時的時間與累積水量，時間可輸入 2:45 或 165（秒）。沒填的欄位會略過。
    </p>

    <label class="flex items-center gap-3 rounded-lg p-2.5" :class="cardClass">
      <span class="font-mono text-[11px] shrink-0 w-20" :class="labelClass">總時間</span>
      <input
        v-model="draft.total"
        inputmode="numeric"
        :placeholder="`例：${formatTime(targetFinish)}`"
        :class="[inputClass, { 'ring-1 ring-error': invalidTime(draft.total) }]"
        aria-label="總時間"
        @input="commit"
      >
    </label>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      <div v-for="(stage, i) in stages" :key="stage.key" class="rounded-lg p-2.5 flex flex-col gap-1.5" :class="cardClass">
        <span class="font-mono text-[11px] font-medium" :class="dark ? 'text-secondary-fixed' : 'text-secondary'">
          {{ i + 1 }}・{{ stage.shortLabel }}
        </span>
        <div class="grid gap-1.5" :class="stage.targetMass == null ? 'grid-cols-1' : 'grid-cols-2'">
          <label class="flex flex-col gap-0.5">
            <span class="font-mono text-[9px]" :class="labelClass">{{ stage.type === 'drawdown' ? '完成時間' : '結束時間' }}</span>
            <input
              v-model="draft.stages[i]!.t"
              inputmode="numeric"
              placeholder="0:00"
              :class="[inputClass, { 'ring-1 ring-error': invalidTime(draft.stages[i]!.t) }]"
              :aria-label="`${stage.label} 時間`"
              @input="commit"
            >
          </label>
          <label v-if="stage.targetMass != null" class="flex flex-col gap-0.5">
            <span class="font-mono text-[9px]" :class="labelClass">累積水量 (g)</span>
            <input
              v-model="draft.stages[i]!.m"
              inputmode="decimal"
              :placeholder="String(stage.targetMass)"
              :class="[inputClass, { 'ring-1 ring-error': invalidMass(draft.stages[i]!.m) }]"
              :aria-label="`${stage.label} 累積水量`"
              @input="commit"
            >
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
