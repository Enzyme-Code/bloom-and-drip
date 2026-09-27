<script setup lang="ts">
defineProps<{ compact?: boolean }>()

const { photo, stages, bean } = useBrewSession()
const { elapsed, status } = useBrewTimer()
const toast = useToast()

const input = ref<HTMLInputElement>()
const takenAt = useState('photo-taken-at', () => 0)

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!file) return
  try {
    photo.value = await fileToDataUrl(file)
    takenAt.value = status.value === 'idle' ? 0 : Math.round(elapsed.value)
    toast.show('已加入萃取影像', 'photo_camera')
  } catch (err) {
    toast.show((err as Error).message, 'error')
  }
}

function pick() {
  input.value?.click()
}

const caption = computed(() => `悶蒸膨脹良好 (Bloom ${stages.value[0]?.targetMass}g)`)
</script>

<template>
  <input ref="input" type="file" accept="image/*" capture="environment" class="hidden" @change="onFile">

  <!-- Compact (mobile, inside the sensory card) -->
  <div v-if="compact" class="rounded-lg bg-surface-container p-2.5 flex items-center gap-3">
    <button type="button" class="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-highest shrink-0 flex items-center justify-center" @click="pick">
      <img v-if="photo" :src="photo" alt="萃取影像" class="w-full h-full object-cover">
      <span v-else class="icon text-[22px] text-outline">image</span>
    </button>
    <div class="min-w-0 flex-1">
      <p class="flex items-center gap-1 text-body-sm font-semibold text-secondary truncate">
        <span class="icon text-[16px]">photo_camera</span>
        {{ photo ? caption : '尚未加入影像' }}
      </p>
      <p class="text-[12px] text-on-surface-variant truncate">
        {{ photo ? '均勻排氣，粉層呈現飽滿黃金油沫' : '拍攝粉層狀態以便日後比對' }}
      </p>
    </div>
    <button type="button" class="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center shrink-0" aria-label="新增照片" @click="pick">
      <span class="icon text-[20px]">add_a_photo</span>
    </button>
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

    <div class="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-surface-container shadow-inner group">
      <template v-if="photo">
        <img :src="photo" alt="萃取影像" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex flex-col justify-end p-space-md text-on-primary">
          <div class="flex items-center justify-between gap-2">
            <span class="font-mono text-xs text-secondary-fixed font-medium">{{ caption }}</span>
            <span class="font-mono text-[10px] bg-primary/60 px-1.5 py-0.5 rounded text-white/90">{{ formatTime(takenAt) }} SNAPSHOT</span>
          </div>
          <p class="text-[12px] text-white/90 mt-0.5">{{ bean.name }} · 均勻排氣，粉層呈現飽滿油沫與細緻紋理</p>
        </div>
      </template>
      <button
        v-else
        type="button"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-outline hover:text-secondary hover:bg-surface-container-high transition-colors"
        @click="pick"
      >
        <span class="icon text-[40px]">add_a_photo</span>
        <span class="text-body-sm">上傳或拍攝粉層照片</span>
      </button>
    </div>

    <div class="flex items-center justify-between gap-2 pt-1">
      <div class="flex gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-semibold hover:bg-surface-container-high transition-colors"
          @click="pick"
        >
          <span class="icon text-[14px]">{{ photo ? 'sync' : 'add_a_photo' }}</span>
          {{ photo ? '替換照片' : '新增照片' }}
        </button>
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
