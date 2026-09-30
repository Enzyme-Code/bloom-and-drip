<script setup lang="ts">
import { BEAN_TEMPLATES } from '~/data/beans'
import type { BeanInfo, Recipe, SavedBean } from '~/types/brew'

const emit = defineEmits<{ pick: [info: BeanInfo, recipe?: Recipe]; blank: [] }>()

const { logs } = useBrewLogs()
const { beans: savedBeans, removeBean } = useSavedBeans()
const toast = useToast()
const open = ref(false)

/** Latest log per bean name, newest first */
const recent = computed(() => {
  const seen = new Set<string>()
  const out: { info: BeanInfo; recipe?: Recipe; key: string }[] = []
  for (const log of logs.value) {
    if (seen.has(log.bean.name)) continue
    seen.add(log.bean.name)
    // Taste-only logs carry no recipe: picking one falls back to the saved / template recipe
    out.push({ key: log.id, ...beanFromLog(log) })
    if (out.length >= 5) break
  }
  return out
})

function choose(info: BeanInfo, recipe?: Recipe) {
  open.value = false
  emit('pick', info, recipe)
}

function toInfo({ id: _id, updatedAt: _updatedAt, ...info }: SavedBean): BeanInfo {
  return info
}

function onRemoveSaved(b: SavedBean) {
  if (!window.confirm(`要從我的咖啡豆移除「${b.name}」嗎？`)) return
  removeBean(b.id)
  toast.show(`已移除「${b.name}」`, 'delete')
}
</script>

<template>
  <MenuSheet v-model:open="open" title="更換咖啡豆">
    <template #trigger="{ toggle }">
      <slot :toggle="toggle" />
    </template>

    <button
      type="button"
      class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm font-semibold text-secondary hover:bg-surface-container"
      @click="open = false; emit('blank')"
    >
      <span class="icon text-[18px]">add</span>新的咖啡豆（空白）
    </button>

    <template v-if="savedBeans.length">
      <p class="px-3 pt-2 pb-1 font-mono text-[10px] text-outline uppercase tracking-wider">我的咖啡豆 · 帶入預設配方</p>
      <div v-for="b in savedBeans" :key="b.id" class="flex items-center gap-1 rounded-lg hover:bg-surface-container">
        <button type="button" class="flex-1 min-w-0 text-left px-3 py-2" @click="choose(toInfo(b))">
          <p class="text-body-sm text-primary truncate">{{ b.name }}</p>
          <p class="font-mono text-[10px] text-outline truncate">{{ [b.roaster, b.process, b.roast].filter(Boolean).join(' · ') || '—' }}</p>
        </button>
        <button type="button" class="w-9 h-9 mr-1 shrink-0 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error-container/50" :aria-label="`移除 ${b.name}`" @click="onRemoveSaved(b)">
          <span class="icon text-[18px]">delete</span>
        </button>
      </div>
    </template>

    <template v-if="recent.length">
      <p class="px-3 pt-2 pb-1 font-mono text-[10px] text-outline uppercase tracking-wider">最近沖煮 · 帶入當次配方</p>
      <button
        v-for="r in recent"
        :key="r.key"
        type="button"
        class="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container"
        @click="choose(r.info, r.recipe)"
      >
        <p class="text-body-sm text-primary truncate">{{ r.info.name }}</p>
        <p class="font-mono text-[10px] text-outline truncate">
          {{ [r.info.roaster, r.info.process].filter(Boolean).join(' · ') || '—' }} · {{ r.recipe ? `${r.recipe.dose}g 1:${r.recipe.ratio}` : '只記口感' }}
        </p>
      </button>
    </template>

    <p class="px-3 pt-2 pb-1 font-mono text-[10px] text-outline uppercase tracking-wider">範本</p>
    <button
      v-for="t in BEAN_TEMPLATES"
      :key="t.id"
      type="button"
      class="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container"
      @click="choose(t)"
    >
      <p class="text-body-sm text-primary truncate">{{ t.name }}</p>
      <p class="font-mono text-[10px] text-outline truncate">{{ t.roaster }} · {{ t.process }}</p>
    </button>
  </MenuSheet>
</template>
