<script setup lang="ts">
defineProps<{ compact?: boolean }>()

const { photo, stages, bean } = useBrewSession()
const { elapsed, status } = useBrewTimer()
const toast = useToast()

const takenAt = useState('photo-taken-at', () => 0)

function onPicked(dataUrl: string) {
  const replaced = !!photo.value
  photo.value = dataUrl
  takenAt.value = status.value === 'idle' ? 0 : Math.round(elapsed.value)
  toast.show(replaced ? '已更換萃取影像' : '已加入萃取影像', 'photo_camera')
}

const caption = computed(() => `悶蒸膨脹良好 (Bloom ${stages.value[0]?.targetMass}g)`)
</script>

<template>
  <!-- Compact (mobile, inside the sensory card) -->
  <div v-if="compact" class="rounded-lg bg-surface-container p-2.5 flex items-center gap-3">
    <div class="relative shrink-0">
      <PhotoPickButton class="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-highest flex items-center justify-center" :aria-label="photo ? '重新選擇照片' : '從相簿選取'" @picked="onPicked">
        <img v-if="photo" :src="photo" alt="萃取影像" class="w-full h-full object-cover">
        <span v-else class="icon text-[22px] text-outline">image</span>
      </PhotoPickButton>
      <!-- Outside the label so tapping it doesn't open the picker -->
      <button
        v-if="photo"
        type="button"
        class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow"
        aria-label="移除照片"
        @click="photo = null"
      >
        <span class="icon text-[14px]">close</span>
      </button>
    </div>
    <div class="min-w-0 flex-1">
      <p class="flex items-center gap-1 text-body-sm font-semibold text-secondary truncate">
        <span class="icon text-[16px]">photo_camera</span>
        {{ photo ? caption : '尚未加入影像' }}
      </p>
      <p class="text-[12px] text-on-surface-variant truncate">
        {{ photo ? '選錯了？點縮圖或右側按鈕重新選擇' : '拍攝粉層狀態以便日後比對' }}
      </p>
    </div>
    <div class="flex gap-1.5 shrink-0">
      <PhotoPickButton camera class="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center" aria-label="拍照" title="拍照" @picked="onPicked">
        <span class="icon text-[20px]">photo_camera</span>
      </PhotoPickButton>
      <PhotoPickButton class="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center" aria-label="從相簿選取" title="從相簿選取" @picked="onPicked">
        <span class="icon text-[20px]">photo_library</span>
      </PhotoPickButton>
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
      <PhotoPickButton v-if="photo" class="block w-full h-full" aria-label="重新選擇照片" @picked="onPicked">
        <img :src="photo" alt="萃取影像" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <span class="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/70 text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="icon text-[14px]">sync</span>點擊重新選擇
        </span>
        <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex flex-col justify-end p-space-md text-on-primary">
          <div class="flex items-center justify-between gap-2">
            <span class="font-mono text-xs text-secondary-fixed font-medium">{{ caption }}</span>
            <span class="font-mono text-[10px] bg-primary/60 px-1.5 py-0.5 rounded text-white/90">{{ formatTime(takenAt) }} SNAPSHOT</span>
          </div>
          <p class="text-[12px] text-white/90 mt-0.5">{{ bean.name }} · 均勻排氣，粉層呈現飽滿油沫與細緻紋理</p>
        </div>
      </PhotoPickButton>
      <PhotoPickButton
        v-else
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-outline hover:text-secondary hover:bg-surface-container-high transition-colors"
        @picked="onPicked"
      >
        <span class="icon text-[40px]">add_a_photo</span>
        <span class="text-body-sm">上傳或拍攝粉層照片</span>
      </PhotoPickButton>
    </div>

    <div class="flex items-center justify-between gap-2 pt-1">
      <div class="flex gap-2">
        <PhotoPickButton
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-semibold hover:bg-surface-container-high transition-colors"
          @picked="onPicked"
        >
          <span class="icon text-[14px]">{{ photo ? 'sync' : 'photo_library' }}</span>
          {{ photo ? '替換照片' : '選擇照片' }}
        </PhotoPickButton>
        <!-- Touch devices (tablets) only: desktops have no camera to open -->
        <PhotoPickButton
          camera
          class="hidden pointer-coarse:inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-semibold hover:bg-surface-container-high transition-colors"
          @picked="onPicked"
        >
          <span class="icon text-[14px]">photo_camera</span>
          拍照
        </PhotoPickButton>
        <button
          v-if="photo"
          type="button"
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-semibold hover:bg-surface-container-high transition-colors"
          @click="photo = null"
        >
          <span class="icon text-[14px]">delete</span>
          移除
        </button>
      </div>
      <span class="font-mono text-[10px] text-outline">JPEG / 自動壓縮</span>
    </div>
  </div>
</template>
