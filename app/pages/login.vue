<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: '登入 — Bloom & Drip' })

const { login, loginWithGoogle, resetPassword } = useAuth()
const route = useRoute()
const toast = useToast()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const redirectTo = computed(() => safeRedirect(route.query.redirect))

async function run(action: () => Promise<void>) {
  error.value = ''
  loading.value = true
  try {
    await action()
    await navigateTo(redirectTo.value, { replace: true })
  } catch (err) {
    error.value = authErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function onSubmit() {
  run(() => login(email.value.trim(), password.value))
}

async function onForgot() {
  if (!email.value.trim()) {
    error.value = '請先輸入 Email，再按「忘記密碼」'
    return
  }
  try {
    await resetPassword(email.value.trim())
    toast.show('已寄出重設密碼信，請查看信箱', 'mail')
  } catch (err) {
    error.value = authErrorMessage(err)
  }
}
</script>

<template>
  <div class="flex flex-col gap-space-lg">
    <div>
      <p class="font-mono text-label-mono text-secondary uppercase tracking-widest">Welcome back</p>
      <h1 class="font-serif text-headline-lg-mobile md:text-headline-md text-primary mt-1">登入你的沖煮工作台</h1>
    </div>

    <form class="flex flex-col gap-space-md" novalidate @submit.prevent="onSubmit">
      <AuthField v-model="email" label="Email" type="email" autocomplete="email" placeholder="you@example.com" />
      <AuthField v-model="password" label="密碼" type="password" autocomplete="current-password" placeholder="••••••••" />
      <div class="flex justify-end -mt-2">
        <button type="button" class="text-[12px] text-secondary hover:underline" @click="onForgot">忘記密碼？</button>
      </div>

      <p v-if="error" class="flex items-center gap-1.5 text-body-sm text-error bg-error-container/60 px-3 py-2 rounded-lg">
        <span class="icon text-[16px]">error</span>{{ error }}
      </p>

      <button
        type="submit"
        class="w-full py-2.5 rounded-lg bg-primary text-on-primary text-label-md hover:bg-primary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        :disabled="loading"
      >
        <span v-if="loading" class="icon text-[16px] animate-spin">progress_activity</span>
        登入
      </button>
    </form>

    <div class="flex items-center gap-3 font-mono text-label-mono text-outline">
      <span class="flex-1 h-px bg-outline-variant" />OR<span class="flex-1 h-px bg-outline-variant" />
    </div>

    <GoogleButton :loading="loading" @click="run(loginWithGoogle)" />

    <p class="text-body-sm text-on-surface-variant text-center">
      還沒有帳號？
      <NuxtLink :to="{ path: '/register', query: route.query }" class="text-secondary font-semibold hover:underline">立即註冊</NuxtLink>
    </p>
  </div>
</template>
