<script setup lang="ts">
import { STEP_META, STEP_TYPES, methodTemplates, newStepId } from '~/data/methods'
import type { MethodStep, StepType } from '~/types/brew'

const { method, water, stages, targetFinish } = useBrewSession()
const { status } = useBrewTimer()
const toast = useToast()

const editing = useState('method-editing', () => false)
const templatesOpen = ref(false)
const templates = methodTemplates()
const menuRoot = ref<HTMLElement>()

/** Steps can't change once timing started: splits are keyed by step id */
const locked = computed(() => status.value !== 'idle')

const lastWaterStage = computed(() => [...stages.value].reverse().find(s => s.targetMass != null))
const waterMismatch = computed(() => {
  const last = lastWaterStage.value?.targetMass
  return last != null && Math.abs(last - water.value) >= 1 ? last : null
})

function guard() {
  if (!locked.value) return false
  toast.show('沖煮已開始，請先「重新計時」再修改手法', 'info')
  return true
}

function applyTemplate(id: string) {
  templatesOpen.value = false
  if (guard()) return
  const t = methodTemplates().find(x => x.id === id)
  if (!t) return
  method.value = t.method
  toast.show(`已套用「${t.method.name}」`, 'auto_awesome')
}

function toggleEditing() {
  if (!editing.value && guard()) return
  editing.value = !editing.value
}

// --- Step editing helpers -------------------------------------------------

const grams = (step: MethodStep) => (step.share == null ? '' : String(Math.round(step.share * water.value)))

function setGrams(step: MethodStep, input: string) {
  const g = Number.parseFloat(input)
  step.share = input.trim() && Number.isFinite(g) && g >= 0 ? Math.round((g / water.value) * 10000) / 10000 : null
}

function setTime(step: MethodStep, input: string, el: HTMLInputElement) {
  const t = parseTime(input)
  step.at = t
  el.value = t == null ? '' : formatTime(t)
}

/** Previous cumulative water share before index i, for sensible defaults */
function shareBefore(i: number) {
  for (let j = i - 1; j >= 0; j--) {
    const s = method.value.steps[j]!
    if (s.share != null) return s.share
  }
  return 0
}

function setType(step: MethodStep, i: number, type: StepType) {
  step.type = type
  if (!STEP_META[type].hasWater) step.share = null
  else if (step.share == null) step.share = Math.min(1, shareBefore(i) + 0.2)
}

function addStep() {
  const steps = method.value.steps
  // Insert before a trailing drawdown so the finish stays last
  const insertAt = steps.at(-1)?.type === 'drawdown' ? steps.length - 1 : steps.length
  const prevAt = steps[insertAt - 1]?.at ?? 0
  steps.splice(insertAt, 0, {
    id: newStepId(),
    type: 'pour',
    at: prevAt + 30,
    share: Math.min(1, shareBefore(insertAt) + 0.2)
  })
}

function move(i: number, delta: number) {
  const steps = method.value.steps
  const j = i + delta
  if (j < 0 || j >= steps.length) return
  ;[steps[i], steps[j]] = [steps[j]!, steps[i]!]
}

function removeStep(i: number) {
  if (method.value.steps.length <= 1) return
  method.value.steps.splice(i, 1)
}

function fixLastPour() {
  const last = [...method.value.steps].reverse().find(s => s.share != null)
  if (last) last.share = 1
}

function onClickOutside(e: MouseEvent) {
  if (menuRoot.value && !menuRoot.value.contains(e.target as Node)) templatesOpen.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

const inputClass = 'w-full min-w-0 px-2 py-1.5 rounded bg-surface-container-lowest font-mono text-body-sm text-primary focus:outline-none focus:ring-1 focus:ring-secondary'
</script>

<template>
  <div class="rounded-xl bg-surface-container-low p-4 md:p-space-lg shadow-sm flex flex-col gap-space-md">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <span class="hidden md:block w-2 h-2 rounded-full bg-secondary" />
        <span class="md:hidden icon text-[18px] text-secondary">water_drop</span>
        <span class="text-label-md uppercase tracking-wider text-primary shrink-0">沖煮手法</span>
        <span class="hidden md:inline font-mono text-label-mono text-outline">BREW METHOD</span>
        <span class="px-2 py-0.5 rounded bg-secondary-fixed/60 text-on-secondary-fixed text-[12px] font-semibold truncate">{{ method.name || '自訂手法' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <div ref="menuRoot" class="relative">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high text-[12px] font-semibold text-on-surface hover:bg-surface-container-highest transition-colors"
            @click="templatesOpen = !templatesOpen"
          >
            <span class="icon text-[15px]">auto_awesome</span>套用範本
          </button>
          <div v-if="templatesOpen" class="absolute right-0 top-full mt-2 w-72 rounded-xl bg-surface-container-lowest shadow-lg border border-outline-variant/50 p-2 z-30">
            <button
              v-for="t in templates"
              :key="t.id"
              type="button"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container"
              @click="applyTemplate(t.id)"
            >
              <p class="text-body-sm font-semibold text-primary">{{ t.method.name }} <span class="font-mono text-[10px] text-outline font-normal">{{ t.method.steps.length }} 步</span></p>
              <p class="text-[11px] text-on-surface-variant">{{ t.description }}</p>
            </button>
          </div>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-colors"
          :class="editing ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'"
          @click="toggleEditing"
        >
          <span class="icon text-[15px]">{{ editing ? 'check' : 'edit' }}</span>
          {{ editing ? '完成' : '編輯步驟' }}
        </button>
      </div>
    </div>

    <p v-if="locked" class="flex items-center gap-1.5 text-[12px] text-on-surface-variant -mt-2">
      <span class="icon text-[14px]">lock</span>沖煮進行中，手法已鎖定；按「重新計時」後可修改。
    </p>

    <!-- Summary -->
    <ol v-if="!editing || locked" class="flex flex-wrap gap-1.5">
      <li
        v-for="(stage, i) in stages"
        :key="stage.key"
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container font-mono text-[11px]"
      >
        <span class="text-outline">{{ i + 1 }}</span>
        <span class="text-primary font-semibold">{{ stage.shortLabel }}</span>
        <span v-if="stage.plannedAt != null" class="text-on-surface-variant">{{ formatTime(stage.plannedAt) }}</span>
        <span v-if="stage.targetMass != null" class="text-secondary">→ {{ stage.targetMass }}g</span>
      </li>
      <li class="flex items-center px-2 font-mono text-[11px] text-outline">預計 {{ formatTime(targetFinish) }} 完成</li>
    </ol>

    <!-- Editor -->
    <div v-else class="flex flex-col gap-2">
      <label class="flex items-center gap-2">
        <span class="text-[11px] font-semibold text-on-surface-variant shrink-0">手法名稱</span>
        <input v-model="method.name" :class="inputClass" placeholder="例：我的 V60 三段" maxlength="30">
      </label>

      <div class="hidden sm:grid grid-cols-[1.5rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 px-1 font-mono text-[10px] text-outline">
        <span>#</span><span>步驟</span><span>開始時間</span><span>累積水量 (g)</span><span class="w-[5.5rem]" />
      </div>

      <div
        v-for="(step, i) in method.steps"
        :key="step.id"
        class="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] sm:grid-cols-[1.5rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 items-center rounded-lg bg-surface-container p-2"
      >
        <span class="font-mono text-[11px] text-outline text-center">{{ i + 1 }}</span>
        <select
          :value="step.type"
          :class="inputClass"
          :aria-label="`第 ${i + 1} 步類型`"
          @change="setType(step, i, ($event.target as HTMLSelectElement).value as StepType)"
        >
          <option v-for="t in STEP_TYPES" :key="t.type" :value="t.type">{{ t.label }}</option>
        </select>
        <div class="flex items-center gap-0.5 sm:order-last">
          <button type="button" class="w-7 h-7 rounded hover:bg-surface-container-high disabled:opacity-30" :disabled="i === 0" aria-label="上移" @click="move(i, -1)">
            <span class="icon text-[16px]">arrow_upward</span>
          </button>
          <button type="button" class="w-7 h-7 rounded hover:bg-surface-container-high disabled:opacity-30" :disabled="i === method.steps.length - 1" aria-label="下移" @click="move(i, 1)">
            <span class="icon text-[16px]">arrow_downward</span>
          </button>
          <button type="button" class="w-7 h-7 rounded text-error hover:bg-error-container/50 disabled:opacity-30" :disabled="method.steps.length <= 1" aria-label="刪除步驟" @click="removeStep(i)">
            <span class="icon text-[16px]">delete</span>
          </button>
        </div>
        <!-- Mobile: time + water side by side under the type; desktop: own grid columns -->
        <div class="col-start-2 col-span-2 grid grid-cols-2 gap-2 sm:contents">
        <label class="flex flex-col gap-0.5">
          <span class="sm:hidden font-mono text-[9px] text-outline">{{ step.type === 'drawdown' ? '預計完成' : '開始時間' }}</span>
          <input
            :value="step.at == null ? '' : formatTime(step.at)"
            :class="inputClass"
            inputmode="numeric"
            :placeholder="step.type === 'drawdown' ? '完成 mm:ss' : 'mm:ss'"
            :aria-label="`第 ${i + 1} 步時間`"
            @change="setTime(step, ($event.target as HTMLInputElement).value, $event.target as HTMLInputElement)"
          >
        </label>
        <label class="flex flex-col gap-0.5">
          <span class="sm:hidden font-mono text-[9px] text-outline">累積水量 (g)</span>
          <input
            v-if="STEP_META[step.type].hasWater"
            :value="grams(step)"
            :class="inputClass"
            inputmode="decimal"
            placeholder="g"
            :aria-label="`第 ${i + 1} 步累積水量`"
            @change="setGrams(step, ($event.target as HTMLInputElement).value)"
          >
          <span v-else class="px-2 py-1.5 font-mono text-body-sm text-outline">—</span>
        </label>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary-fixed/50 text-on-secondary-fixed text-[12px] font-semibold hover:bg-secondary-fixed transition-colors"
          @click="addStep"
        >
          <span class="icon text-[16px]">add</span>新增步驟
        </button>
        <p v-if="waterMismatch != null" class="flex items-center gap-1.5 text-[12px] text-on-surface-variant">
          <span class="icon text-[15px] text-secondary">info</span>
          最後注水到 {{ waterMismatch }}g，總水量是 {{ water }}g
          <button type="button" class="text-secondary font-semibold hover:underline" @click="fixLastPour">調整為總水量</button>
        </p>
      </div>
    </div>
  </div>
</template>
