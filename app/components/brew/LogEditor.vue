<script setup lang="ts">
import { FLAVOR_LIBRARY, NOTE_TAGS, PROCESS_SUGGESTIONS, ROAST_SUGGESTIONS, SENSORY_DIMENSIONS } from '~/data/beans'
import type { BrewLog } from '~/types/brew'

/** Edits a saved journal entry in a dialog (bottom sheet on mobile) */
const props = defineProps<{ log: BrewLog }>()
const emit = defineEmits<{ close: [] }>()

const { update } = useBrewLogs()
const toast = useToast()

// Work on a deep copy so cancelling leaves the entry untouched; `pending` is UI-only and never stored
const { pending: _pending, ...initial } = props.log as BrewLog & { pending?: boolean }
const draft = ref<BrewLog>(JSON.parse(JSON.stringify(initial)))
const methodName = ref(draft.value.method?.name ?? '')
const isTaste = draft.value.mode === 'taste'

const suggestions = computed(() => FLAVOR_LIBRARY.filter(f => !draft.value.flavors.includes(f)))
const shortName = (f: string) => f.split(' ')[0]

function toggle(list: 'flavors' | 'tags', v: string) {
  const cur = draft.value[list]
  draft.value[list] = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v]
}

const customFlavor = ref('')
function commitCustom() {
  const v = customFlavor.value.trim()
  if (v && !draft.value.flavors.includes(v)) draft.value.flavors = [...draft.value.flavors, v]
  customFlavor.value = ''
}

function onPicked(dataUrl: string) {
  if (dataUrl.length > MAX_PHOTO_CHARS) {
    toast.show('照片過大，請換一張', 'error')
    return
  }
  draft.value.photo = dataUrl
}

function save() {
  const d = draft.value
  d.bean = {
    ...d.bean,
    name: d.bean.name.trim() || '未命名咖啡豆',
    nameEn: d.bean.nameEn.trim(),
    process: d.bean.process.trim(),
    roaster: d.bean.roaster.trim(),
    roast: d.bean.roast.trim()
  }
  d.notes = d.notes.trim()
  if (d.params) {
    // A cleared number input yields '', which would be stored as a string
    d.params.grind = d.params.grind.trim()
    d.params.temperature = Number(d.params.temperature) || 0
    d.dose = Number(d.dose) || 0
    d.water = Number(d.water) || 0
  }
  if (isTaste) {
    // Firestore rejects undefined, so an emptied method name drops the key
    const name = methodName.value.trim()
    if (name) d.method = { name, steps: [] }
    else delete d.method
  }
  try {
    update(d)
  } catch (err) {
    toast.show(`儲存失敗：${firestoreErrorMessage(err)}`, 'error')
    return
  }
  toast.show('已更新沖煮紀錄', 'edit')
  emit('close')
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => {
  document.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})

const field = 'w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-[16px] md:text-body-md placeholder:text-outline/70 focus:outline-none focus:ring-1 focus:ring-secondary'
const label = 'flex flex-col gap-1 min-w-0'
const labelText = 'text-label-md text-on-surface-variant'
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-primary/50 md:p-space-lg" @click.self="emit('close')">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-editor-title"
        class="w-full md:max-w-2xl max-h-[92dvh] md:max-h-[88dvh] flex flex-col rounded-t-xl md:rounded-xl bg-surface shadow-xl overflow-hidden"
      >
        <header class="flex items-center justify-between gap-3 px-4 md:px-space-lg py-3 border-b border-outline-variant/50">
          <div class="min-w-0">
            <p class="font-mono text-label-mono text-outline uppercase">Edit Log</p>
            <h2 id="log-editor-title" class="font-serif text-headline-sm text-primary truncate">編輯沖煮紀錄</h2>
          </div>
          <button type="button" class="w-9 h-9 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container" aria-label="關閉" @click="emit('close')">
            <span class="icon text-[22px]">close</span>
          </button>
        </header>

        <div class="flex-1 overflow-y-auto overscroll-contain px-4 md:px-space-lg py-space-md flex flex-col gap-space-lg">
          <!-- Bean -->
          <section class="flex flex-col gap-3">
            <h3 class="text-label-md uppercase tracking-wider text-primary">咖啡豆</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label :class="[label, 'sm:col-span-2']">
                <span :class="labelText">品名</span>
                <input v-model="draft.bean.name" :class="field" placeholder="未命名咖啡豆">
              </label>
              <label :class="label">
                <span :class="labelText">產區 / 英文品名</span>
                <input v-model="draft.bean.nameEn" :class="field">
              </label>
              <label :class="label">
                <span :class="labelText">烘豆商</span>
                <input v-model="draft.bean.roaster" :class="field">
              </label>
              <label :class="label">
                <span :class="labelText">處理法</span>
                <input v-model="draft.bean.process" :class="field" list="log-editor-process">
              </label>
              <label :class="label">
                <span :class="labelText">烘焙度</span>
                <input v-model="draft.bean.roast" :class="field" list="log-editor-roast">
              </label>
            </div>
            <datalist id="log-editor-process"><option v-for="p in PROCESS_SUGGESTIONS" :key="p" :value="p" /></datalist>
            <datalist id="log-editor-roast"><option v-for="r in ROAST_SUGGESTIONS" :key="r" :value="r" /></datalist>
          </section>

          <!-- Recipe (full logs) / method name (taste-only logs) -->
          <section v-if="!isTaste && draft.params" class="flex flex-col gap-3">
            <h3 class="text-label-md uppercase tracking-wider text-primary">沖煮參數</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label :class="label">
                <span :class="labelText">粉量 (g)</span>
                <input v-model.number="draft.dose" type="number" inputmode="decimal" min="0" step="0.1" :class="[field, 'font-mono']">
              </label>
              <label :class="label">
                <span :class="labelText">水量 (g)</span>
                <input v-model.number="draft.water" type="number" inputmode="decimal" min="0" step="1" :class="[field, 'font-mono']">
              </label>
              <label :class="label">
                <span :class="labelText">水溫 (°C)</span>
                <input v-model.number="draft.params.temperature" type="number" inputmode="numeric" min="0" max="100" :class="[field, 'font-mono']">
              </label>
              <label :class="label">
                <span :class="labelText">研磨</span>
                <input v-model="draft.params.grind" :class="field">
              </label>
            </div>
          </section>
          <section v-else-if="isTaste" class="flex flex-col gap-3">
            <h3 class="text-label-md uppercase tracking-wider text-primary">沖煮方式</h3>
            <label :class="label">
              <span :class="labelText">手法名稱（選填）</span>
              <input v-model="methodName" :class="field" placeholder="例：三段式注水">
            </label>
          </section>

          <!-- Tasting -->
          <section class="flex flex-col gap-3">
            <h3 class="text-label-md uppercase tracking-wider text-primary">杯測與風味</h3>
            <div class="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-container">
              <span class="text-body-md text-primary font-medium">整體評分</span>
              <div class="flex items-center gap-2">
                <BrewStarRating v-model="draft.overall" size="text-[24px] md:text-xl" />
                <span class="font-mono text-sm font-bold text-primary w-8 text-right">{{ draft.overall.toFixed(1) }}</span>
              </div>
            </div>

            <label v-for="d in SENSORY_DIMENSIONS" :key="d.key" class="flex flex-col gap-1.5">
              <span class="flex justify-between items-baseline gap-2 text-body-sm">
                <span class="font-medium text-primary">{{ d.label }}</span>
                <span class="font-mono text-xs text-secondary font-medium whitespace-nowrap">{{ draft.scores[d.key].toFixed(1) }} / 5.0</span>
              </span>
              <input
                v-model.number="draft.scores[d.key]"
                type="range"
                min="0"
                max="5"
                step="0.5"
                class="range-bar w-full"
                :style="{ '--fill': `${(draft.scores[d.key] / 5) * 100}%` }"
              >
            </label>

            <div class="flex flex-col gap-2 pt-1">
              <span :class="labelText">風味標籤</span>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="f in draft.flavors"
                  :key="f"
                  type="button"
                  class="px-2.5 py-1 rounded-full bg-secondary text-on-secondary text-[12px] font-semibold flex items-center gap-1 shadow-sm"
                  @click="toggle('flavors', f)"
                >
                  {{ f }}
                  <span class="icon text-[14px]">close</span>
                </button>
                <button
                  v-for="f in suggestions"
                  :key="f"
                  type="button"
                  class="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[12px] font-semibold hover:bg-surface-container-high transition-colors"
                  @click="toggle('flavors', f)"
                >
                  + {{ shortName(f) }}
                </button>
              </div>
              <input
                v-model="customFlavor"
                placeholder="自訂風味，按 Enter 加入"
                :class="field"
                enterkeyhint="done"
                @keydown.enter.prevent="commitCustom"
                @blur="commitCustom"
              >
            </div>

            <div class="flex flex-col gap-2 pt-1">
              <span :class="labelText">筆記</span>
              <textarea v-model="draft.notes" rows="4" :class="[field, 'resize-none']" placeholder="風味筆記與萃取心得" />
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="t in NOTE_TAGS"
                  :key="t"
                  type="button"
                  class="font-mono text-[11px] px-2 py-0.5 rounded transition-colors"
                  :class="draft.tags.includes(t) ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'"
                  @click="toggle('tags', t)"
                >
                  # {{ t }}
                </button>
              </div>
            </div>
          </section>

          <!-- Photo -->
          <section class="flex flex-col gap-3">
            <h3 class="text-label-md uppercase tracking-wider text-primary">萃取影像</h3>
            <div class="flex items-center gap-3">
              <PhotoPickButton class="w-20 h-20 rounded-lg overflow-hidden bg-surface-container-highest shrink-0 flex items-center justify-center" :aria-label="draft.photo ? '重新選擇照片' : '選擇照片'" @picked="onPicked">
                <img v-if="draft.photo" :src="draft.photo" alt="萃取影像" class="w-full h-full object-cover">
                <span v-else class="icon text-[26px] text-outline">image</span>
              </PhotoPickButton>
              <div class="flex flex-wrap gap-2">
                <PhotoPickButton camera class="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant text-[12px] font-semibold hover:bg-surface-container-high pointer-fine:hidden" @picked="onPicked">
                  <span class="icon text-[16px]">photo_camera</span>拍照
                </PhotoPickButton>
                <PhotoPickButton class="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant text-[12px] font-semibold hover:bg-surface-container-high" @picked="onPicked">
                  <span class="icon text-[16px]">photo_library</span>{{ draft.photo ? '替換照片' : '選擇照片' }}
                </PhotoPickButton>
                <button
                  v-if="draft.photo"
                  type="button"
                  class="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant text-[12px] font-semibold hover:bg-surface-container-high hover:text-error"
                  @click="draft.photo = null"
                >
                  <span class="icon text-[16px]">delete</span>移除
                </button>
              </div>
            </div>
          </section>
        </div>

        <footer class="flex justify-end gap-2 px-4 md:px-space-lg py-3 border-t border-outline-variant/50 bg-surface-container-low pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button type="button" class="px-4 py-2 rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container-high" @click="emit('close')">
            取消
          </button>
          <button type="button" class="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md hover:bg-primary-container shadow-sm" @click="save">
            <span class="icon text-[16px]">check</span>儲存修改
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
