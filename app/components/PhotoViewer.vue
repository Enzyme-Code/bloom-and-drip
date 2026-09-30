<script setup lang="ts">
/** Full-screen photo viewer: arrows / swipe / ← → to browse, Esc or the backdrop to close */
const props = defineProps<{ photos: string[]; start?: number; caption?: string }>()
const emit = defineEmits<{ close: [] }>()

const index = ref(Math.min(props.start ?? 0, Math.max(0, props.photos.length - 1)))
const many = computed(() => props.photos.length > 1)

function go(delta: number) {
  const n = props.photos.length
  if (n) index.value = (index.value + delta + n) % n
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowLeft') go(-1)
  else if (e.key === 'ArrowRight') go(1)
  else return
  // Capture phase + stop, so a dialog underneath (the log editor) doesn't also close on Esc
  e.stopPropagation()
  e.preventDefault()
}

let touchX: number | null = null
function onTouchStart(e: TouchEvent) {
  touchX = e.touches.length === 1 ? e.touches[0]!.clientX : null
}
function onTouchEnd(e: TouchEvent) {
  if (touchX == null) return
  const dx = e.changedTouches[0]!.clientX - touchX
  touchX = null
  if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
}

let prevOverflow = ''
onMounted(() => {
  document.addEventListener('keydown', onKey, true)
  prevOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey, true)
  document.body.style.overflow = prevOverflow
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[70] flex flex-col bg-black/95 text-white select-none"
      role="dialog"
      aria-modal="true"
      aria-label="檢視照片"
      @click.self="emit('close')"
    >
      <header class="flex items-center justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p class="min-w-0 truncate text-body-sm text-white/80">
          <span v-if="many" class="font-mono mr-2">{{ index + 1 }} / {{ photos.length }}</span>{{ caption }}
        </p>
        <button type="button" class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10" aria-label="關閉" @click="emit('close')">
          <span class="icon text-[26px]">close</span>
        </button>
      </header>

      <div class="relative flex-1 min-h-0 flex items-center justify-center px-2 md:px-16" @click.self="emit('close')" @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
        <img :src="photos[index]" :alt="`照片 ${index + 1}`" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl">
        <template v-if="many">
          <button type="button" class="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-white/15 flex items-center justify-center" aria-label="上一張" @click="go(-1)">
            <span class="icon text-[28px]">chevron_left</span>
          </button>
          <button type="button" class="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-white/15 flex items-center justify-center" aria-label="下一張" @click="go(1)">
            <span class="icon text-[28px]">chevron_right</span>
          </button>
        </template>
      </div>

      <div v-if="many" class="flex justify-center gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] overflow-x-auto">
        <button
          v-for="(p, i) in photos"
          :key="i"
          type="button"
          class="w-12 h-12 shrink-0 rounded-md overflow-hidden ring-2 transition-opacity"
          :class="i === index ? 'ring-white opacity-100' : 'ring-transparent opacity-50 hover:opacity-80'"
          :aria-label="`第 ${i + 1} 張`"
          @click="index = i"
        >
          <img :src="p" alt="" class="w-full h-full object-cover">
        </button>
      </div>
    </div>
  </Teleport>
</template>
