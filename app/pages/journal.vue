<script setup lang="ts">
import type { BrewLogEntry } from '~/composables/useBrewLogs'
useHead({ title: '沖煮歷史與日誌 — Bloom & Drip' })

const { logs, loading, error, remove } = useBrewLogs()
const toast = useToast()
const editing = ref<BrewLogEntry | null>(null)
const viewing = ref<{ photos: string[]; start: number; caption: string } | null>(null)

const search = ref('')
/** Matches bean, roaster, method, gear, flavors, tags and notes */
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return logs.value
  return logs.value.filter(l =>
    [l.bean.name, l.bean.nameEn, l.bean.roaster, l.bean.process, l.method?.name, l.gearName, l.notes, ...l.flavors, ...l.tags]
      .some(v => v?.toLowerCase().includes(q))
  )
})

const rated = computed(() => logs.value.filter(l => l.overall > 0))
const stats = computed(() => {
  const beanCount = new Map<string, number>()
  for (const l of logs.value) beanCount.set(l.bean.name, (beanCount.get(l.bean.name) ?? 0) + 1)
  const favourite = [...beanCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
  const avg = rated.value.length ? rated.value.reduce((s, l) => s + l.overall, 0) / rated.value.length : 0
  return [
    { label: '累積沖煮次數', value: String(logs.value.length) },
    { label: '平均綜合評分', value: avg ? avg.toFixed(1) : '—' },
    { label: '最常沖煮', value: favourite }
  ]
})

const dateFmt = new Intl.DateTimeFormat('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })

function onDelete(id: string) {
  if (!window.confirm('確定要刪除這筆紀錄嗎？')) return
  remove(id)
  toast.show('已刪除紀錄', 'delete')
}

</script>

<template>
  <div class="flex flex-col w-full pb-space-xl">
    <PageTitle crumb="沖煮歷史與日誌" title="沖煮日誌" tag="Journal">
      <NuxtLink
        to="/"
        class="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md hover:bg-primary-container transition-all shadow-sm"
      >
        <span class="icon text-[16px]">add</span>
        新增沖煮紀錄
      </NuxtLink>
    </PageTitle>

    <div class="px-margin-mobile md:px-margin pt-space-md flex flex-col gap-space-lg">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-space-md">
        <!-- The favourite bean name is long: full row on mobile -->
        <div
          v-for="(s, i) in stats"
          :key="s.label"
          class="rounded-xl bg-surface-container p-3 md:p-space-md min-w-0"
          :class="{ 'col-span-2 md:col-span-1': i === stats.length - 1 }"
        >
          <p class="font-mono text-[10px] md:text-label-mono text-outline uppercase">{{ s.label }}</p>
          <p class="text-metric-val md:text-2xl text-primary font-medium mt-1 line-clamp-2" :class="i === stats.length - 1 ? 'font-serif' : 'font-mono'">{{ s.value }}</p>
        </div>
      </div>

      <p v-if="error" class="flex items-center gap-1.5 text-body-sm text-error bg-error-container/60 px-3 py-2 rounded-lg">
        <span class="icon text-[16px]">error</span>{{ error }}
      </p>

      <div v-if="loading" class="flex items-center justify-center gap-2 py-space-xl text-outline text-body-sm">
        <span class="icon text-[20px] animate-spin">progress_activity</span>載入中…
      </div>

      <div v-else-if="!logs.length" class="rounded-xl bg-surface-container-low p-space-xl flex flex-col items-center text-center gap-3">
        <span class="icon text-[48px] text-outline-variant">local_cafe</span>
        <p class="font-serif text-headline-sm text-primary">還沒有任何沖煮紀錄</p>
        <p class="text-body-sm text-on-surface-variant">完成一次沖煮並按下「儲存本次沖煮紀錄」，就會出現在這裡。</p>
        <NuxtLink to="/" class="mt-2 px-4 py-2 rounded-lg bg-secondary text-on-secondary text-label-md">開始沖煮</NuxtLink>
      </div>

      <template v-else>
        <label class="relative block">
          <span class="icon text-[18px] text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
          <input
            v-model="search"
            type="search"
            aria-label="搜尋沖煮紀錄"
            placeholder="搜尋豆名、烘豆商、手法、風味或筆記"
            class="w-full pl-10 pr-3 py-2.5 rounded-lg bg-surface-container-low text-[16px] md:text-body-md text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-1 focus:ring-secondary"
          >
        </label>

        <p v-if="!filtered.length" class="py-space-lg text-center text-body-sm text-outline">找不到符合「{{ search.trim() }}」的紀錄</p>

        <ul v-else class="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
          <li
            v-for="log in filtered"
            :key="log.id"
            class="rounded-xl bg-surface-container-low p-4 md:p-space-lg shadow-sm flex flex-col gap-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-mono text-label-mono text-outline flex items-center gap-2">
                  {{ [dateFmt.format(new Date(log.createdAt)), log.bean.roaster].filter(Boolean).join(' · ') }}
                  <span v-if="log.pending" class="inline-flex items-center gap-0.5 px-1.5 rounded bg-secondary-fixed/60 text-on-secondary-fixed">
                    <span class="icon text-[12px] animate-spin">progress_activity</span>同步中
                  </span>
                </p>
                <h2 class="font-serif text-headline-sm text-primary truncate">{{ log.bean.name }}</h2>
                <p class="text-body-sm text-on-surface-variant">{{ [log.bean.nameEn, log.bean.process].filter(Boolean).join(' · ') }}</p>
                <p v-if="log.mode === 'taste' || log.method || log.gearName" class="flex flex-wrap gap-1.5 mt-1 text-[11px]">
                  <span v-if="log.mode === 'taste'" class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-surface-container-highest text-primary font-semibold">
                    <span class="icon text-[13px]">local_cafe</span>只記口感
                  </span>
                  <span v-if="log.method" class="px-2 py-0.5 rounded bg-secondary-fixed/60 text-on-secondary-fixed font-semibold">{{ log.method.name || '自訂手法' }}</span>
                  <span v-if="log.gearName" class="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">{{ log.gearName }}</span>
                </p>
              </div>
              <button
                v-if="logPhotos(log).length"
                type="button"
                class="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 group"
                :aria-label="`檢視照片（${logPhotos(log).length} 張）`"
                @click="viewing = { photos: logPhotos(log), start: 0, caption: log.bean.name }"
              >
                <img :src="logPhotos(log)[0]" alt="萃取影像" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                <span class="absolute inset-0 flex items-center justify-center bg-primary/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="icon text-[22px]">zoom_in</span>
                </span>
                <span v-if="logPhotos(log).length > 1" class="absolute bottom-1 right-1 inline-flex items-center gap-0.5 px-1 rounded bg-primary/75 text-white font-mono text-[10px]">
                  <span class="icon text-[11px]">photo_library</span>{{ logPhotos(log).length }}
                </span>
              </button>
            </div>

            <div v-if="log.mode !== 'taste' && log.params" class="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div class="rounded-lg bg-surface-container p-2">
                <p class="text-[10px] text-outline">粉水比</p>
                <p class="text-body-sm text-primary">{{ log.dose }}g / {{ log.water }}g</p>
              </div>
              <div class="rounded-lg bg-surface-container p-2">
                <p class="text-[10px] text-outline">總時間</p>
                <p class="text-body-sm text-primary">{{ formatTime(log.totalSeconds ?? null) }}</p>
              </div>
              <div class="rounded-lg bg-surface-container p-2">
                <p class="text-[10px] text-outline">水溫</p>
                <p class="text-body-sm text-primary">{{ log.params.temperature }}°C</p>
              </div>
              <div class="rounded-lg bg-surface-container p-2 min-w-0">
                <p class="text-[10px] text-outline">研磨</p>
                <p class="text-body-sm text-primary truncate">{{ log.params.grind }}</p>
              </div>
            </div>

            <ol v-if="log.stageSplits?.length" class="flex flex-wrap gap-1.5 font-mono text-[10px]">
              <li v-for="(split, i) in log.stageSplits" :key="split.key" class="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                {{ i + 1 }}. {{ split.label.split(' ')[0] }} · {{ formatTime(split.t) }}<template v-if="split.m != null"> / {{ split.m }}g</template>
              </li>
            </ol>

            <div class="flex items-center gap-2">
              <BrewStarRating :model-value="log.overall" readonly size="text-base" />
              <span class="font-mono text-sm text-primary">{{ log.overall ? log.overall.toFixed(1) : '未評分' }}</span>
            </div>

            <div v-if="log.flavors.length || log.tags.length" class="flex flex-wrap gap-1.5">
              <span v-for="f in log.flavors" :key="f" class="px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary text-[11px] font-semibold">{{ f }}</span>
              <span v-for="t in log.tags" :key="t" class="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant"># {{ t }}</span>
            </div>

            <p v-if="log.notes" class="text-body-sm text-on-surface-variant line-clamp-3">{{ log.notes }}</p>

            <div class="flex justify-end gap-4">
              <button type="button" class="inline-flex items-center gap-1 text-[12px] text-outline hover:text-primary" @click="editing = log">
                <span class="icon text-[16px]">edit</span>
                編輯
              </button>
              <button type="button" class="inline-flex items-center gap-1 text-[12px] text-outline hover:text-error" @click="onDelete(log.id)">
                <span class="icon text-[16px]">delete</span>
                刪除
              </button>
            </div>
          </li>
        </ul>
      </template>
    </div>

    <PhotoViewer v-if="viewing" :photos="viewing.photos" :start="viewing.start" :caption="viewing.caption" @close="viewing = null" />
    <BrewLogEditor v-if="editing" :key="editing.id" :log="editing" @close="editing = null" />
  </div>
</template>
