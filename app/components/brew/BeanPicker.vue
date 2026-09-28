<script setup lang="ts">
import { BEAN_TEMPLATES, BLANK_BEAN } from '~/data/beans'
import type { BeanInfo, Recipe } from '~/types/brew'

const emit = defineEmits<{ pick: [info: BeanInfo, recipe?: Recipe]; blank: [] }>()

const { logs } = useBrewLogs()
const open = ref(false)
const root = ref<HTMLElement>()

/** Latest log per bean name, newest first */
const recent = computed(() => {
  const seen = new Set<string>()
  const out: { info: BeanInfo; recipe?: Recipe; key: string }[] = []
  for (const log of logs.value) {
    if (seen.has(log.bean.name)) continue
    seen.add(log.bean.name)
    out.push({
      key: log.id,
      info: {
        name: log.bean.name,
        nameEn: log.bean.nameEn ?? '',
        process: log.bean.process ?? '',
        roaster: log.bean.roaster ?? '',
        roast: log.bean.roast ?? '',
        bloomSeconds: log.bean.bloomSeconds || BLANK_BEAN.bloomSeconds
      },
      // Taste-only logs carry no recipe: picking one falls back to the saved / template recipe
      recipe: log.dose && log.water ? { dose: log.dose, ratio: round1(log.water / log.dose), gearId: log.gearId, method: log.method } : undefined
    })
    if (out.length >= 5) break
  }
  return out
})

function choose(info: BeanInfo, recipe?: Recipe) {
  open.value = false
  emit('pick', info, recipe)
}

function onClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="root" class="relative">
    <slot :toggle="() => (open = !open)" />

    <div
      v-if="open"
      class="absolute right-0 top-full mt-2 w-72 max-h-96 overflow-y-auto rounded-xl bg-surface-container-lowest shadow-lg border border-outline-variant/50 p-2 z-30"
    >
      <button
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm font-semibold text-secondary hover:bg-surface-container"
        @click="open = false; emit('blank')"
      >
        <span class="icon text-[18px]">add</span>新的咖啡豆（空白）
      </button>

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
    </div>
  </div>
</template>
