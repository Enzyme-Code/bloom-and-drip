<script setup lang="ts">
const { user, logout } = useAuth()
const { discard } = useBrewSave()
const toast = useToast()

const open = ref(false)
const root = ref<HTMLElement>()

const initial = computed(() => (user.value?.displayName || user.value?.email || '?').trim().charAt(0).toUpperCase())

function onClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

async function onLogout() {
  open.value = false
  discard()
  await logout()
  toast.show('已登出', 'logout')
  await navigateTo('/login')
}
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center overflow-hidden"
      aria-label="帳號選單"
      :aria-expanded="open"
      @click="open = !open"
    >
      <img v-if="user?.photoURL" :src="user.photoURL" alt="" class="w-full h-full object-cover" referrerpolicy="no-referrer">
      <span v-else-if="user" class="font-semibold text-body-sm">{{ initial }}</span>
      <span v-else class="icon text-[20px]">person</span>
    </button>

    <div
      v-if="open && user"
      class="absolute right-0 top-11 w-60 rounded-xl bg-surface-container-lowest shadow-lg border border-outline-variant/50 p-2 z-50"
    >
      <div class="px-3 py-2 border-b border-outline-variant/50 mb-1">
        <p class="text-body-sm font-semibold text-primary truncate">{{ user.displayName || '咖啡師' }}</p>
        <p class="font-mono text-[11px] text-outline truncate">{{ user.email }}</p>
      </div>
      <NuxtLink to="/journal" class="flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm hover:bg-surface-container" @click="open = false">
        <span class="icon text-[18px] text-secondary">menu_book</span>我的沖煮日誌
      </NuxtLink>
      <button type="button" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm text-error hover:bg-error-container/50" @click="onLogout">
        <span class="icon text-[18px]">logout</span>登出
      </button>
    </div>
  </div>
</template>
