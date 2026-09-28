<script setup lang="ts">
const { user, resendVerification, refreshVerification } = useAuth()
const toast = useToast()

/** Closed for this visit only; it comes back on the next page load until the email is verified */
const dismissed = useState('verify-banner-dismissed', () => false)
const show = computed(() => !!user.value && !user.value.emailVerified && !dismissed.value)

const checking = ref(false)
const cooldown = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

async function check(manual: boolean) {
  if (checking.value) return
  checking.value = true
  try {
    if (await refreshVerification()) toast.show('信箱驗證完成', 'verified')
    else if (manual) toast.show('還沒有完成驗證，請點擊信中的連結', 'info')
  } catch (err) {
    if (manual) toast.show(authErrorMessage(err), 'error')
  } finally {
    checking.value = false
  }
}

async function resend() {
  if (cooldown.value) return
  try {
    await resendVerification()
    toast.show(`已重新寄出驗證信到 ${user.value?.email}，也請檢查垃圾郵件匣`, 'mail')
    cooldown.value = 60
    clearInterval(timer)
    timer = setInterval(() => {
      if (--cooldown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (err) {
    toast.show(authErrorMessage(err), 'error')
  }
}

// Verifying happens in the mail app / another tab: re-check when the user comes back
function onVisible() {
  if (show.value && document.visibilityState === 'visible') check(false)
}
onMounted(() => document.addEventListener('visibilitychange', onVisible))
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisible)
  clearInterval(timer)
})
</script>

<template>
  <div v-if="show" class="w-full px-margin-mobile md:px-margin pt-3">
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-lg bg-secondary-fixed/40 text-on-secondary-fixed text-body-sm">
      <p class="flex items-start gap-2 flex-1 min-w-0">
        <span class="icon text-[18px] shrink-0">mark_email_unread</span>
        <span class="min-w-0">
          請到 <strong class="font-semibold break-all">{{ user?.email }}</strong> 收信，點擊連結完成信箱驗證。
          <span class="block text-[12px] opacity-80 mt-0.5">沒收到的話，請檢查「垃圾郵件」或「促銷內容」資料夾，寄件人為 noreply@…firebaseapp.com。</span>
        </span>
      </p>
      <div class="flex flex-wrap items-center gap-1.5 shrink-0 pl-6 sm:pl-0">
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg bg-primary text-on-primary text-[12px] font-semibold disabled:opacity-60"
          :disabled="checking"
          @click="check(true)"
        >
          我已完成驗證
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg bg-surface-container-lowest/70 text-[12px] font-semibold disabled:opacity-60"
          :disabled="cooldown > 0"
          @click="resend"
        >
          {{ cooldown ? `重新寄送 (${cooldown})` : '重新寄送' }}
        </button>
        <button type="button" class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-container-lowest/60" aria-label="關閉提醒" @click="dismissed = true">
          <span class="icon text-[16px]">close</span>
        </button>
      </div>
    </div>
  </div>
</template>
