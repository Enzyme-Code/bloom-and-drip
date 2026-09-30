<script setup lang="ts">
defineProps<{ compact?: boolean }>()

const { photos, stages, bean } = useBrewSession()
const { elapsed, status } = useBrewTimer()
const toast = useToast()
const { add, remove, busy, full } = usePhotoList(photos)

/** Brew time at which each photo was added (parallel to photos) */
const takenAt = useState<number[]>('photo-taken-at', () => [])
/** Photo shown large on the desktop card */
const active = ref(0)
const viewing = ref<number | null>(null)

watch(() => photos.value.length, (n) => {
  if (active.value >= n) active.value = Math.max(0, n - 1)
})

async function onPicked(files: File[]) {
  const before = photos.value.length
  const added = await add(files)
  if (!added) return
  const t = status.value === 'idle' ? 0 : Math.round(elapsed.value)
  // slice() also drops stale times left over after the session was reset
  takenAt.value = [...takenAt.value.slice(0, before), ...Array<number>(added).fill(t)]
  active.value = before
  toast.show(added > 1 ? `已加入 ${added} 張萃取影像` : '已加入萃取影像', 'photo_camera')
}

function onRemove(i: number) {
  remove(i)
  takenAt.value = takenAt.value.filter((_, j) => j !== i)
}

const caption = computed(() => `悶蒸膨脹良好 (Bloom ${stages.value[0]?.targetMass}g)`)
const tile = 'w-16 h-16 shrink-0 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold'
</script>

<template>
  <!-- Compact (mobile, inside the sensory card) -->
  <div v-if="compact" class="rounded-lg bg-surface-container p-2.5 flex flex-col gap-2">
    <div class="flex items-center justify-between gap-2">
      <p class="flex items-center gap-1 text-body-sm font-semibold text-secondary min-w-0 truncate">
        <span class="icon text-[16px]">photo_camera</span>
        {{ photos.length ? `已加入 ${photos.length} 張影像` : '尚未加入影像' }}
      </p>
      <span class="font-mono text-[10px] text-outline shrink-0">{{ photos.length }} / {{ MAX_PHOTOS }}</span>
    </div>
    <p class="text-[12px] text-on-surface-variant -mt-1">
      {{ photos.length ? '點縮圖放大檢視，右上角 × 移除' : '拍攝粉層狀態以便日後比對，相簿可一次選多張' }}
    </p>
    <!-- Top padding leaves room for the remove badges -->
    <div class="flex flex-wrap gap-2.5 pt-1.5">
      <div v-for="(p, i) in photos" :key="i" class="relative shrink-0">
        <button type="button" class="block w-16 h-16 rounded-lg overflow-hidden bg-surface-container-highest" :aria-label="`放大第 ${i + 1} 張`" @click="viewing = i">
          <img :src="p" alt="萃取影像" class="w-full h-full object-cover">
        </button>
        <button
          type="button"
          class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow"
          :aria-label="`移除第 ${i + 1} 張`"
          @click="onRemove(i)"
        >
          <span class="icon text-[14px]">close</span>
        </button>
      </div>
      <template v-if="!full">
        <PhotoPickButton camera :disabled="busy" :class="[tile, 'bg-surface-container-lowest text-on-surface-variant']" aria-label="拍照" @picked="onPicked">
          <span class="icon text-[22px]">photo_camera</span>拍照
        </PhotoPickButton>
        <PhotoPickButton :disabled="busy" :class="[tile, 'bg-surface-container-lowest text-on-surface-variant']" aria-label="從相簿選取" @picked="onPicked">
          <span class="icon text-[22px]" :class="{ 'animate-spin': busy }">{{ busy ? 'progress_activity' : 'photo_library' }}</span>相簿
        </PhotoPickButton>
      </template>
    </div>
  </div>

  <!-- Full card (desktop) -->
  <div v-else class="rounded-xl bg-surface-container-low p-space-md shadow-sm flex flex-col gap-space-sm">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="icon text-secondary text-[18px]">photo_camera</span>
        <span class="text-label-md uppercase tracking-wider text-primary">粉層萃取影像紀錄</span>
      </div>
      <span class="font-mono text-label-mono text-outline">BLOOM INSPECTION</span>
    </div>

    <div class="relative w-full aspect-[4/3] min-[1400px]:aspect-[16/10] 2xl:aspect-[2/1] rounded-lg overflow-hidden bg-surface-container shadow-inner group">
      <button v-if="photos.length" type="button" class="block w-full h-full" aria-label="放大檢視照片" @click="viewing = active">
        <img :src="photos[active]" alt="萃取影像" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <span class="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/70 text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="icon text-[14px]">zoom_in</span>點擊放大
        </span>
        <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex flex-col justify-end p-space-md text-on-primary text-left">
          <div class="flex items-center justify-between gap-2">
            <span class="font-mono text-xs text-secondary-fixed font-medium">{{ caption }}</span>
            <span class="font-mono text-[10px] bg-primary/60 px-1.5 py-0.5 rounded text-white/90">{{ formatTime(takenAt[active] ?? 0) }} SNAPSHOT</span>
          </div>
          <p class="text-[12px] text-white/90 mt-0.5">{{ bean.name }} · 均勻排氣，粉層呈現飽滿油沫與細緻紋理</p>
        </div>
      </button>
      <PhotoPickButton
        v-else
        :disabled="busy"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-outline hover:text-secondary hover:bg-surface-container-high transition-colors"
        @picked="onPicked"
      >
        <span class="icon text-[40px]" :class="{ 'animate-spin': busy }">{{ busy ? 'progress_activity' : 'add_a_photo' }}</span>
        <span class="text-body-sm">上傳或拍攝粉層照片（可一次選多張）</span>
      </PhotoPickButton>
    </div>

    <!-- Thumbnails -->
    <div v-if="photos.length" class="flex gap-2 overflow-x-auto pt-1.5 pr-1.5">
      <div v-for="(p, i) in photos" :key="i" class="relative shrink-0">
        <button
          type="button"
          class="block w-14 h-14 rounded-md overflow-hidden ring-2 transition-shadow"
          :class="i === active ? 'ring-secondary' : 'ring-transparent hover:ring-outline-variant'"
          :aria-label="`顯示第 ${i + 1} 張`"
          @click="active = i"
        >
          <img :src="p" alt="" class="w-full h-full object-cover">
        </button>
        <button
          type="button"
          class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shadow"
          :aria-label="`移除第 ${i + 1} 張`"
          @click="onRemove(i)"
        >
          <span class="icon text-[12px]">close</span>
        </button>
      </div>
      <PhotoPickButton
        v-if="!full"
        :disabled="busy"
        class="w-14 h-14 shrink-0 rounded-md border border-dashed border-outline-variant flex items-center justify-center text-outline hover:text-secondary hover:border-secondary transition-colors"
        aria-label="新增照片"
        @picked="onPicked"
      >
        <span class="icon text-[20px]" :class="{ 'animate-spin': busy }">{{ busy ? 'progress_activity' : 'add' }}</span>
      </PhotoPickButton>
    </div>

    <div class="flex items-center justify-between gap-2 pt-1">
      <div class="flex gap-2">
        <PhotoPickButton
          :disabled="busy || full"
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-semibold hover:bg-surface-container-high transition-colors"
          @picked="onPicked"
        >
          <span class="icon text-[14px]">photo_library</span>
          {{ photos.length ? '新增照片' : '選擇照片' }}
        </PhotoPickButton>
        <!-- Touch devices (tablets) only: desktops have no camera to open -->
        <PhotoPickButton
          camera
          :disabled="busy || full"
          class="hidden pointer-coarse:inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-semibold hover:bg-surface-container-high transition-colors"
          @picked="onPicked"
        >
          <span class="icon text-[14px]">photo_camera</span>
          拍照
        </PhotoPickButton>
        <button
          v-if="photos.length"
          type="button"
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-semibold hover:bg-surface-container-high hover:text-error transition-colors"
          @click="onRemove(active)"
        >
          <span class="icon text-[14px]">delete</span>
          移除這張
        </button>
      </div>
      <span class="font-mono text-[10px] text-outline">{{ photos.length }} / {{ MAX_PHOTOS }} 張 · 自動壓縮</span>
    </div>
  </div>

  <PhotoViewer v-if="viewing != null" :photos="photos" :start="viewing" :caption="bean.name" @close="viewing = null" />
</template>
