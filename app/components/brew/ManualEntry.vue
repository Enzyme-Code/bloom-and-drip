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
  <div class="flex flex-col gap-2.5">
    <p class="text-[11px] leading-relaxed" :class="labelClass">
      看著秤填寫每一步結束時的時間與累積水量。時間可輸入 2:45 或 165（秒），沒填的會略過。
    </p>

    <label class="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 rounded-lg p-2" :class="cardClass">
      <span class="text-[12px] font-semibold" :class="labelClass">總時間</span>
      <input
        v-model="draft.total"
        inputmode="numeric"
        :placeholder="`例：${formatTime(targetFinish)}`"
        :class="[inputClass, { 'ring-1 ring-error': invalidTime(draft.total) }]"
        aria-label="總時間"
        @input="commit"
      >
    </label>

    <div class="rounded-lg p-2 flex flex-col gap-1.5" :class="cardClass">
      <div class="grid grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1fr)] gap-2 px-0.5 font-mono text-[10px]" :class="labelClass">
        <span>步驟</span><span>結束時間</span><span>累積水量 (g)</span>
      </div>
      <div
        v-for="(stage, i) in stages"
        :key="stage.key"
        class="grid grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2"
      >
        <span class="font-mono text-[12px] font-medium truncate" :class="dark ? 'text-secondary-fixed' : 'text-secondary'">
          {{ i + 1 }}・{{ stage.shortLabel }}
        </span>
        <input
          v-model="draft.stages[i]!.t"
          inputmode="numeric"
          :placeholder="stage.type === 'drawdown' ? '完成' : '0:00'"
          :class="[inputClass, { 'ring-1 ring-error': invalidTime(draft.stages[i]!.t) }]"
          :aria-label="`${stage.label} 時間`"
          @input="commit"
        >
        <input
          v-if="stage.targetMass != null"
          v-model="draft.stages[i]!.m"
          inputmode="decimal"
          :placeholder="String(stage.targetMass)"
          :class="[inputClass, { 'ring-1 ring-error': invalidMass(draft.stages[i]!.m) }]"
          :aria-label="`${stage.label} 累積水量`"
          @input="commit"
        >
        <span v-else class="px-2.5 font-mono text-sm" :class="labelClass">—</span>
      </div>
    </div>
  </div>
</template>
