<script setup lang="ts">
import { FLAVOR_LIBRARY, NOTE_TAGS, SENSORY_DIMENSIONS } from '~/data/beans'

const { overall, scores, flavors, notes, tags } = useBrewSession()

const tier = computed(() => {
  const v = overall.value
  if (!v) return null
  if (v >= 4.5) return 'SCA 卓越級評鑑 (90+)'
  if (v >= 4) return 'SCA 優異級 (85+)'
  if (v >= 3.5) return 'SCA 精品級 (80+)'
  return '待調整'
})

function descriptor(d: (typeof SENSORY_DIMENSIONS)[number]) {
  const v = scores.value[d.key]
  return d.descriptors[v < 2.5 ? 0 : v < 4 ? 1 : 2]
}

const suggestions = computed(() => FLAVOR_LIBRARY.filter(f => !flavors.value.includes(f)).slice(0, 4))
const shortName = (f: string) => f.split(' ')[0]

function toggleFlavor(f: string) {
  flavors.value = flavors.value.includes(f) ? flavors.value.filter(x => x !== f) : [...flavors.value, f]
}

function toggleTag(t: string) {
  tags.value = tags.value.includes(t) ? tags.value.filter(x => x !== t) : [...tags.value, t]
}

const addingCustom = ref(false)
const customFlavor = ref('')
const customInput = ref<HTMLInputElement>()

async function startCustom() {
  addingCustom.value = true
  await nextTick()
  customInput.value?.focus()
}

function commitCustom() {
  const v = customFlavor.value.trim()
  if (v && !flavors.value.includes(v)) flavors.value = [...flavors.value, v]
  customFlavor.value = ''
  addingCustom.value = false
}
</script>

<template>
  <div class="rounded-xl bg-surface-container-low md:bg-surface-container-low p-4 md:p-space-lg shadow-sm flex flex-col gap-space-md">
    <!-- Desktop heading -->
    <div class="hidden md:flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-secondary" />
        <span class="text-label-md uppercase tracking-wider text-primary">杯測與感官風味評分</span>
      </div>
      <span class="font-mono text-label-mono text-outline">SCA SENSORY PROTOCOL</span>
    </div>

    <!-- Mobile heading -->
    <div class="md:hidden flex items-start justify-between gap-2">
      <div>
        <h3 class="font-serif text-headline-sm text-primary">杯測與風味口感</h3>
        <p class="text-body-sm text-on-surface-variant">Sensory Evaluation &amp; Notes</p>
      </div>
      <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container font-mono text-body-sm text-primary">
        <span class="icon text-[16px]">star</span>{{ overall.toFixed(1) }}
      </span>
    </div>

    <!-- Overall -->
    <div class="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-container">
      <div class="flex md:flex-col items-center md:items-start justify-between w-full md:w-auto gap-1">
        <span class="text-label-md md:text-label-md text-on-surface-variant">
          <span class="hidden md:inline">整體綜合評分 (Overall Score)</span>
          <span class="md:hidden text-body-md text-primary font-medium">整體沖煮評分</span>
        </span>
        <div class="flex items-center gap-1">
          <BrewStarRating v-model="overall" size="text-[22px] md:text-lg" />
          <span class="hidden md:inline font-mono text-sm font-bold text-primary ml-1">{{ overall.toFixed(1) }}</span>
        </div>
      </div>
      <span v-if="tier" class="hidden md:inline font-mono text-xs px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-medium whitespace-nowrap">
        {{ tier }}
      </span>
    </div>

    <!-- Dimension sliders -->
    <div class="flex flex-col gap-3">
      <label v-for="d in SENSORY_DIMENSIONS" :key="d.key" class="flex flex-col gap-1.5">
        <span class="flex justify-between items-baseline gap-2 text-body-sm">
          <span class="font-medium text-primary">
            {{ d.label }}<span class="hidden md:inline"> - {{ descriptor(d) }}</span>
          </span>
          <span class="font-mono text-xs text-secondary font-medium whitespace-nowrap">{{ scores[d.key].toFixed(1) }} / 5.0</span>
        </span>
        <input
          v-model.number="scores[d.key]"
          type="range"
          min="0"
          max="5"
          step="0.5"
          class="range-bar w-full"
          :style="{ '--fill': `${(scores[d.key] / 5) * 100}%` }"
        >
      </label>
    </div>

    <!-- Flavor tags -->
    <div class="flex flex-col gap-2 pt-2">
      <span class="text-label-md text-on-surface-variant">
        <span class="hidden md:inline">風味輪識別標籤 (Selected Flavor Notes)</span>
        <span class="md:hidden font-mono font-normal text-[11px] tracking-wider">杯測風味輪標籤 (FLAVOR PROFILE)</span>
      </span>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="f in flavors"
          :key="f"
          type="button"
          class="px-2.5 py-1 rounded-full bg-secondary text-on-secondary text-[11px] font-semibold flex items-center gap-1 shadow-sm"
          @click="toggleFlavor(f)"
        >
          {{ f }}
          <span class="icon text-[13px]">close</span>
        </button>
        <button
          v-for="f in suggestions"
          :key="f"
          type="button"
          class="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold hover:bg-surface-container-high transition-colors"
          @click="toggleFlavor(f)"
        >
          + {{ shortName(f) }}
        </button>
        <input
          v-if="addingCustom"
          ref="customInput"
          v-model="customFlavor"
          placeholder="輸入風味後按 Enter"
          class="px-2.5 py-1 rounded-full bg-surface-container-lowest text-[11px] w-36 focus:outline-none focus:ring-1 focus:ring-secondary"
          @keydown.enter.prevent="commitCustom"
          @keydown.esc="addingCustom = false"
          @blur="commitCustom"
        >
        <button
          v-else
          type="button"
          class="px-2.5 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed text-[11px] font-semibold hover:bg-secondary-fixed transition-colors flex items-center gap-0.5"
          @click="startCustom"
        >
          <span class="icon text-[14px]">add</span>
          自訂標籤
        </button>
      </div>
    </div>

    <!-- Photo preview on mobile -->
    <div class="md:hidden flex flex-col gap-2">
      <span class="font-mono text-[11px] text-on-surface-variant tracking-wider">沖煮狀態影像預覽 (EXTRACTION SNAPSHOT)</span>
      <BrewPhotoSnapshot compact />
    </div>

    <!-- Notes -->
    <div class="flex flex-col gap-2 pt-2">
      <div class="flex items-center justify-between">
        <span class="text-label-md text-on-surface-variant">
          <span class="hidden md:inline">咖啡師沖煮筆記與萃取心得</span>
          <span class="md:hidden font-mono font-normal text-[11px]">風味筆記與萃取心得</span>
        </span>
        <span class="hidden md:inline font-mono text-label-mono text-outline">NOTES</span>
      </div>
      <textarea
        v-model="notes"
        rows="4"
        placeholder="例：前段乾淨明亮，帶有顯著茉莉花香與檸檬柑橘果酸，中後段甜感以荔枝蜜呈現，尾韻悠長乾淨。"
        class="w-full p-3 rounded-lg bg-surface-container text-on-surface text-body-md placeholder:text-outline/70 focus:outline-none focus:ring-1 focus:ring-secondary resize-none"
      />
      <div class="flex flex-wrap gap-1.5 pt-1">
        <button
          v-for="t in NOTE_TAGS"
          :key="t"
          type="button"
          class="font-mono text-[10px] px-2 py-0.5 rounded transition-colors"
          :class="tags.includes(t) ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'"
          @click="toggleTag(t)"
        >
          # {{ t }}
        </button>
      </div>
    </div>
  </div>
</template>
