<script setup lang="ts">
const { savePreset } = useBrewSession()
const { status } = useBrewTimer()
const { save, discard, share } = useBrewSave()
const { user } = useAuth()
const online = useOnline()
const toast = useToast()

function onCancel() {
  if (status.value !== 'idle' && !window.confirm('確定要捨棄本次沖煮紀錄嗎？')) return
  discard()
  toast.show('已清除本次紀錄', 'delete')
}

function onPreset() {
  try {
    savePreset().catch(() => toast.show('配方雲端同步失敗，請稍後再試', 'error'))
    toast.show('已存為此咖啡豆的預設沖煮配方', 'bookmark')
  } catch {
    toast.show('儲存配方失敗，請重新登入後再試', 'error')
  }
}
</script>

<template>
  <!-- Desktop -->
  <aside class="hidden md:block sticky bottom-0 w-full z-40 bg-surface/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-margin py-3">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 min-w-0">
        <span class="w-2 h-2 rounded-full shrink-0" :class="online ? 'bg-emerald-600' : 'bg-outline'" />
        <span class="font-mono text-label-mono text-on-surface truncate">
          {{ online ? '雲端同步中・紀錄儲存至你的帳號' : '離線中・恢復連線後自動同步' }}
        </span>
        <span class="hidden lg:inline font-mono text-[11px] text-outline truncate">| {{ user?.email }}</span>
      </div>
      <div class="flex items-center gap-space-sm shrink-0">
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant text-label-md hover:bg-surface-container-high transition-colors"
          @click="onCancel"
        >
          取消
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-surface-container-highest text-on-surface text-label-md hover:bg-surface-dim transition-colors"
          @click="onPreset"
        >
          另存為預設沖煮配方
        </button>
        <button
          type="button"
          class="px-5 py-2 rounded-lg bg-primary text-on-primary text-label-md hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60"
          @click="save"
        >
          <span class="icon text-[16px]">done_all</span>
          儲存本次沖煮紀錄 (Save Log Entry)
        </button>
      </div>
    </div>
  </aside>

  <!-- Mobile -->
  <aside class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-margin-mobile py-3 flex gap-3">
    <button
      type="button"
      class="w-14 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0"
      aria-label="分享"
      @click="share"
    >
      <span class="icon text-[20px]">share</span>
    </button>
    <button
      type="button"
      class="flex-1 h-12 rounded-lg bg-primary text-on-primary text-body-md font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
      @click="save"
    >
      <span class="icon text-[20px]">note_add</span>
      儲存本次沖煮紀錄
    </button>
  </aside>
</template>
