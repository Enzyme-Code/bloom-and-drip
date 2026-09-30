<script setup lang="ts">
import { BLANK_BEAN, PROCESS_SUGGESTIONS, ROAST_SUGGESTIONS } from '~/data/beans'
import type { BeanInfo, Recipe } from '~/types/brew'

const { bean, selectBean } = useBrewSession()
const { status } = useBrewTimer()
const toast = useToast()
const requireLogin = useLoginPrompt()
const { findBean, saveBean } = useSavedBeans()

const editing = useState('bean-editing', () => false)
const nameInput = ref<HTMLInputElement>()

const displayName = computed(() => bean.value.name.trim() || '未命名咖啡豆')
const chips = computed(() =>
  [
    bean.value.process && { text: bean.value.process, tone: 'strong' },
    bean.value.roaster && { text: bean.value.roaster, tone: 'accent' },
    bean.value.roast && { text: bean.value.roast, tone: 'muted' },
    bean.value.bloomSeconds && { text: `建議悶蒸 ${bean.value.bloomSeconds}s`, tone: 'muted' }
  ].filter(Boolean) as { text: string; tone: 'strong' | 'accent' | 'muted' }[]
)

/** Mobile summary: label / value pairs instead of chips */
const metaItems = computed(() =>
  [
    { label: '處理法', value: bean.value.process },
    { label: '烘豆商', value: bean.value.roaster },
    { label: '焙度', value: bean.value.roast },
    { label: '建議悶蒸', value: bean.value.bloomSeconds ? `${bean.value.bloomSeconds} 秒` : '' }
  ].filter(i => i.value)
)

const chipClass = {
  strong: 'bg-surface-container-highest text-primary font-medium',
  accent: 'bg-secondary-fixed/50 text-on-secondary-fixed font-medium',
  muted: 'bg-surface-container-highest text-on-surface-variant'
}

async function startEditing() {
  editing.value = true
  await nextTick()
  nameInput.value?.focus()
}

function blockWhileRunning() {
  if (status.value !== 'running') return false
  toast.show('沖煮進行中，請先暫停再更換咖啡豆', 'info')
  return true
}

function onPick(info: BeanInfo, recipe?: Recipe) {
  if (blockWhileRunning()) return
  selectBean(info, recipe)
  editing.value = false
  toast.show(recipe ? `已帶入 ${info.name} 上次的配方` : `已選擇 ${info.name}`, 'swap_horiz')
}

function onBlank() {
  if (blockWhileRunning()) return
  selectBean(BLANK_BEAN)
  startEditing()
}

const BEAN_FIELDS = ['name', 'nameEn', 'process', 'roaster', 'roast'] as const
/** 'saved' when this bean is in 我的咖啡豆 exactly as shown, 'changed' when saved but edited since */
const savedState = computed(() => {
  if (!bean.value.name.trim()) return 'none'
  const saved = findBean(bean.value.name)
  if (!saved) return 'none'
  const same = BEAN_FIELDS.every(k => saved[k] === bean.value[k].trim()) && saved.bloomSeconds === (Number(bean.value.bloomSeconds) || 0)
  return same ? 'saved' : 'changed'
})
const saveLabel = computed(() => ({ none: '收藏', saved: '已收藏', changed: '更新收藏' })[savedState.value])

function onSaveBean() {
  if (savedState.value === 'saved') return
  if (!bean.value.name.trim()) {
    toast.show('請先填寫咖啡豆品名', 'info')
    startEditing()
    return
  }
  if (!requireLogin('登入後即可收藏咖啡豆')) return
  const updating = savedState.value === 'changed'
  try {
    saveBean(bean.value)
  } catch (err) {
    toast.show(`收藏失敗：${firestoreErrorMessage(err)}`, 'error')
    return
  }
  toast.show(updating ? `已更新「${bean.value.name.trim()}」` : `已收藏到我的咖啡豆，之後可從「更換」快速選取`, 'bookmark_added')
}

/** Bloom seconds input: empty or invalid becomes 0 rather than NaN */
const bloomModel = computed({
  get: () => bean.value.bloomSeconds || '',
  set: (v: string | number) => {
    const n = Number(v)
    bean.value.bloomSeconds = v !== '' && Number.isFinite(n) ? n : 0
  }
})

const fieldClass = 'w-full px-3 py-2 rounded-lg bg-surface-container-lowest text-body-sm text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-1 focus:ring-secondary'
const labelClass = 'flex flex-col gap-1 text-[11px] font-semibold text-on-surface-variant'
</script>

<template>
  <section class="w-full px-margin-mobile md:px-margin pt-space-md pb-space-md md:pb-space-lg">
    <div class="rounded-xl bg-surface-container p-4 md:p-space-md shadow-sm flex flex-col gap-3 md:gap-space-md">
      <!-- Mobile: label row carries the actions so the name gets the full width -->
      <div class="md:hidden flex items-center justify-between gap-2">
        <span class="flex items-center gap-1.5 font-mono text-[10px] text-outline uppercase tracking-wider">
          <span class="icon text-[15px] text-secondary">coffee</span>咖啡豆
        </span>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-high"
            :class="savedState === 'none' ? 'text-on-surface' : 'text-secondary'"
            :aria-label="saveLabel"
            :title="saveLabel"
            @click="onSaveBean"
          >
            <span class="icon text-[18px]" :class="{ 'icon-fill': savedState === 'saved' }">{{ savedState === 'changed' ? 'bookmark_add' : 'bookmark' }}</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12px] font-semibold transition-colors"
            :class="editing ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'"
            :aria-label="editing ? '完成編輯' : '編輯咖啡豆'"
            @click="editing ? (editing = false) : startEditing()"
          >
            <span class="icon text-[16px]">{{ editing ? 'check' : 'edit' }}</span>{{ editing ? '完成' : '編輯' }}
          </button>
          <BrewBeanPicker v-slot="{ toggle }" @pick="onPick" @blank="onBlank">
            <button
              type="button"
              class="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-surface-container-high text-on-surface text-[12px] font-semibold"
              aria-label="更換咖啡豆"
              @click.stop="toggle()"
            >
              <span class="icon text-[16px]">swap_horiz</span>更換
            </button>
          </BrewBeanPicker>
        </div>
      </div>

      <!-- Summary -->
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-space-md min-w-0">
          <div class="hidden md:flex w-12 h-12 rounded-xl bg-secondary-container/40 items-center justify-center shrink-0">
            <span class="icon text-secondary text-2xl">coffee</span>
          </div>
          <div class="min-w-0">
            <div class="flex flex-col md:flex-row md:flex-wrap md:items-baseline gap-x-2 gap-y-0.5 md:mb-1">
              <span class="font-serif text-headline-sm tracking-tight text-balance" :class="bean.name.trim() ? 'text-primary' : 'text-outline italic'">
                {{ displayName }}
              </span>
              <span v-if="bean.nameEn" class="text-body-sm md:font-mono md:text-label-mono text-on-surface-variant md:text-outline">{{ bean.nameEn }}</span>
            </div>
            <div v-if="chips.length" class="hidden md:flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              <span v-for="c in chips" :key="c.text" class="px-2 py-0.5 rounded-sm" :class="chipClass[c.tone]">{{ c.text }}</span>
            </div>
            <p v-else-if="!editing" class="hidden md:block text-body-sm text-outline">點「編輯」填寫產區、處理法、烘豆商等資訊</p>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-2 shrink-0">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-body-sm hover:bg-surface-container-highest transition-colors"
            :class="savedState === 'none' ? 'text-on-surface' : 'text-secondary'"
            :aria-label="saveLabel"
            @click="onSaveBean"
          >
            <span class="icon text-[16px]" :class="{ 'icon-fill': savedState === 'saved' }">{{ savedState === 'changed' ? 'bookmark_add' : 'bookmark' }}</span>
            {{ saveLabel }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm transition-colors"
            :class="editing ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'"
            :aria-label="editing ? '完成編輯' : '編輯咖啡豆'"
            @click="editing ? (editing = false) : startEditing()"
          >
            <span class="icon text-[16px]">{{ editing ? 'check' : 'edit' }}</span>
            {{ editing ? '完成' : '編輯' }}
          </button>
          <BrewBeanPicker v-slot="{ toggle }" @pick="onPick" @blank="onBlank">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-body-sm hover:bg-surface-container-highest transition-colors"
              aria-label="更換咖啡豆"
              @click.stop="toggle()"
            >
              <span class="icon text-[16px]">swap_horiz</span>
              更換咖啡豆
            </button>
          </BrewBeanPicker>
        </div>
      </div>

      <!-- Mobile details -->
      <dl v-if="!editing && metaItems.length" class="md:hidden grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 border-t border-outline-variant/50">
        <div v-for="item in metaItems" :key="item.label" class="min-w-0">
          <dt class="text-[10px] text-outline">{{ item.label }}</dt>
          <dd class="text-body-sm text-primary font-medium truncate">{{ item.value }}</dd>
        </div>
      </dl>
      <p v-else-if="!editing" class="md:hidden text-body-sm text-outline">點「編輯」填寫產區、處理法、烘豆商等資訊</p>

      <!-- Editor -->
      <form v-if="editing" class="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-outline-variant/50" @submit.prevent="editing = false">
        <label :class="[labelClass, 'col-span-full min-[380px]:col-span-2']">
          品名
          <input ref="nameInput" v-model="bean.name" :class="fieldClass" placeholder="例：衣索比亞 耶加雪菲 潔蒂普" maxlength="80">
        </label>
        <label :class="[labelClass, 'col-span-full min-[380px]:col-span-2']">
          產區 / 英文品名
          <input v-model="bean.nameEn" :class="fieldClass" placeholder="例：Ethiopia Yirgacheffe Gedeb" maxlength="80">
        </label>
        <label :class="labelClass">
          處理法
          <input v-model="bean.process" :class="fieldClass" list="bean-process-options" placeholder="例：日曬" maxlength="40">
        </label>
        <label :class="labelClass">
          焙度
          <input v-model="bean.roast" :class="fieldClass" list="bean-roast-options" placeholder="例：淺焙" maxlength="40">
        </label>
        <label :class="labelClass">
          烘豆商
          <input v-model="bean.roaster" :class="fieldClass" placeholder="例：Nomad Roasters" maxlength="40">
        </label>
        <label :class="labelClass">
          悶蒸 (秒)
          <input v-model="bloomModel" type="number" min="0" max="120" inputmode="numeric" :class="fieldClass">
        </label>
        <datalist id="bean-process-options">
          <option v-for="o in PROCESS_SUGGESTIONS" :key="o" :value="o" />
        </datalist>
        <datalist id="bean-roast-options">
          <option v-for="o in ROAST_SUGGESTIONS" :key="o" :value="o" />
        </datalist>
        <button type="submit" class="hidden" />
      </form>
    </div>
  </section>
</template>
