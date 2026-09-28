<script setup lang="ts">
const { savePreset, logMode } = useBrewSession()
const { status } = useBrewTimer()
const { save, discard } = useBrewSave()
const { user } = useAuth()
const online = useOnline()
const toast = useToast()
const requireLogin = useLoginPrompt()

function onCancel() {
  if (logMode.value === 'full' && status.value !== 'idle' && !window.confirm('確定要捨棄本次沖煮紀錄嗎？')) return
  discard()
  toast.show('已清除本次紀錄', 'delete')
}

function onPreset() {
  if (!requireLogin('登入後即可儲存預設配方')) return
  try {
    savePreset().catch((err) => {
      console.error('[presets] write failed', err)
      toast.show(`配方同步失敗：${firestoreErrorMessage(err)}`, 'error')
    })
    toast.show('已存為此咖啡豆的預設沖煮配方', 'bookmark')
  } catch (err) {
    console.error('[presets] write failed', err)
    toast.show(`儲存配方失敗：${firestoreErrorMessage(err)}`, 'error')
  }
}
</script>

<template>
  <!-- Desktop -->
  <aside class="hidden md:block sticky bottom-0 w-full z-40 bg-surface/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-margin py-3">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 min-w-0">
        <template v-if="user">
          <span class="w-2 h-2 rounded-full shrink-0" :class="online ? 'bg-emerald-600' : 'bg-outline'" />
          <span class="font-mono text-label-mono text-on-surface truncate">
            {{ online ? '雲端同步中・紀錄儲存至你的帳號' : '離線中・恢復連線後自動同步' }}
          </span>
          <span class="hidden lg:inline font-mono text-[11px] text-outline truncate">| {{ user.email }}</span>
        </template>
        <template v-else>
          <span class="w-2 h-2 rounded-full shrink-0 bg-secondary-fixed-dim" />
          <span class="font-mono text-label-mono text-on-surface truncate">訪客模式・工具可自由使用，登入後即可儲存紀錄</span>
        </template>
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
          v-if="logMode === 'full'"
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
          {{ user ? '儲存本次沖煮紀錄 (Save Log Entry)' : '登入並儲存紀錄' }}
        </button>
      </div>
    </div>
  </aside>

  <!-- Mobile -->
  <aside class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-margin-mobile py-3">
    <button
      type="button"
      class="w-full h-12 rounded-lg bg-primary text-on-primary text-body-md font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
      @click="save"
    >
      <span class="icon text-[20px]">{{ user ? 'note_add' : 'login' }}</span>
      {{ user ? '儲存本次沖煮紀錄' : '登入並儲存紀錄' }}
    </button>
  </aside>
</template>
