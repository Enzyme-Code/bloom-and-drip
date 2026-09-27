<script setup lang="ts">
const route = useRoute()
const { user } = useAuth()
const router = useRouter()

const NAV = [
  { to: '/', label: '即時沖煮紀錄', mobileTitle: '沖煮紀錄' },
  { to: '/journal', label: '沖煮歷史與日誌', mobileTitle: '沖煮日誌' },
  { to: '/flavors', label: '風味庫', mobileTitle: '風味庫' },
  { to: '/gear', label: '器具設備', mobileTitle: '器具設備' }
]

const mobileTitle = computed(() => NAV.find(n => n.to === route.path)?.mobileTitle ?? 'Bloom & Drip')
const menuOpen = ref(false)

watch(() => route.path, () => (menuOpen.value = false))

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <header class="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
    <!-- Desktop -->
    <div class="hidden xl:flex h-20 w-full px-margin items-center justify-between gap-gutter">
      <NuxtLink to="/" class="flex items-center gap-space-md">
        <AppLogo />
        <div class="flex flex-col">
          <span class="font-serif text-headline-sm text-primary tracking-tight">Bloom &amp; Drip</span>
          <span class="font-mono text-label-mono text-secondary uppercase">Pourcraft Studio</span>
        </div>
      </NuxtLink>

      <nav class="flex items-center gap-space-xs">
        <NuxtLink
          v-for="item in NAV"
          :key="item.to"
          :to="item.to"
          class="px-space-md py-space-sm rounded-lg transition-colors"
          :class="route.path === item.to
            ? 'bg-surface-container text-on-surface font-semibold'
            : 'text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-space-md">
<NuxtLink
          v-if="!user"
          :to="{ path: '/login', query: route.path !== '/' ? { redirect: route.fullPath } : undefined }"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-on-primary text-label-md hover:bg-primary-container transition-colors"
        >
          <span class="icon text-[16px]">login</span>登入
        </NuxtLink>
        <UserMenu v-else />
      </div>
    </div>

    <!-- Mobile / tablet -->
    <div class="xl:hidden h-16 px-margin-mobile flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <button
          v-if="route.path !== '/'"
          type="button"
          class="w-8 h-8 -ml-1 flex items-center justify-center rounded-lg hover:bg-surface-container"
          aria-label="返回"
          @click="goBack"
        >
          <span class="icon text-[22px]">arrow_back</span>
        </button>
        <button
          v-else
          type="button"
          class="w-8 h-8 -ml-1 flex items-center justify-center rounded-lg hover:bg-surface-container"
          aria-label="選單"
          @click="menuOpen = !menuOpen"
        >
          <span class="icon text-[22px]">{{ menuOpen ? 'close' : 'menu' }}</span>
        </button>
        <AppLogo />
        <span class="font-serif text-headline-sm text-primary tracking-tight">{{ mobileTitle }}</span>
      </div>
<NuxtLink
        v-if="!user"
        :to="{ path: '/login', query: route.path !== '/' ? { redirect: route.fullPath } : undefined }"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-on-primary text-label-md hover:bg-primary-container transition-colors"
      >
        <span class="icon text-[16px]">login</span>登入
      </NuxtLink>
      <UserMenu v-else />
    </div>

    <nav v-if="menuOpen" class="xl:hidden px-margin-mobile pb-3 flex flex-col gap-1">
      <NuxtLink
        v-for="item in NAV"
        :key="item.to"
        :to="item.to"
        class="px-3 py-2.5 rounded-lg"
        :class="route.path === item.to ? 'bg-surface-container font-semibold' : 'text-on-surface-variant'"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
  </header>
</template>
