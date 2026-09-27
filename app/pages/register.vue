<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: '註冊 — Bloom & Drip' })

const { register, loginWithGoogle } = useAuth()
const route = useRoute()
const toast = useToast()

useRedirectWhenSignedIn()

const form = reactive({ name: '', email: '', password: '', confirm: '' })
const fieldErrors = reactive<Record<string, string>>({})
const error = ref('')
const loading = ref(false)

function validate() {
  for (const k of Object.keys(fieldErrors)) delete fieldErrors[k]
  if (!form.name.trim()) fieldErrors.name = '請輸入名稱'
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) fieldErrors.email = 'Email 格式不正確'
  if (form.password.length < 6) fieldErrors.password = '密碼至少需要 6 個字元'
  if (form.confirm !== form.password) fieldErrors.confirm = '兩次輸入的密碼不一致'
  return !Object.keys(fieldErrors).length
}

async function run(action: () => Promise<void>) {
  error.value = ''
  loading.value = true
  try {
    await action()
    toast.show('註冊成功，歡迎加入！', 'celebration')
    await navigateTo(safeRedirect(route.query.redirect), { replace: true })
  } catch (err) {
    error.value = authErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function onSubmit() {
  if (!validate()) return
  run(() => register(form.name.trim(), form.email.trim(), form.password))
}
</script>

<template>
  <div class="flex flex-col gap-space-lg">
    <div>
      <p class="font-mono text-label-mono text-secondary uppercase tracking-widest">Create account</p>
      <h1 class="font-serif text-headline-lg-mobile md:text-headline-md text-primary mt-1">建立你的沖煮帳號</h1>
    </div>

    <form class="flex flex-col gap-space-md" novalidate @submit.prevent="onSubmit">
      <AuthField v-model="form.name" label="顯示名稱" autocomplete="nickname" placeholder="例：Conan" :error="fieldErrors.name" />
      <AuthField v-model="form.email" label="Email" type="email" autocomplete="email" placeholder="you@example.com" :error="fieldErrors.email" />
      <AuthField v-model="form.password" label="密碼" type="password" autocomplete="new-password" placeholder="至少 6 個字元" :error="fieldErrors.password" />
      <AuthField v-model="form.confirm" label="確認密碼" type="password" autocomplete="new-password" placeholder="再輸入一次密碼" :error="fieldErrors.confirm" />

      <p v-if="error" class="flex items-center gap-1.5 text-body-sm text-error bg-error-container/60 px-3 py-2 rounded-lg">
        <span class="icon text-[16px]">error</span>{{ error }}
      </p>

      <button
        type="submit"
        class="w-full py-2.5 rounded-lg bg-primary text-on-primary text-label-md hover:bg-primary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        :disabled="loading"
      >
        <span v-if="loading" class="icon text-[16px] animate-spin">progress_activity</span>
        註冊
      </button>
    </form>

    <div class="flex items-center gap-3 font-mono text-label-mono text-outline">
      <span class="flex-1 h-px bg-outline-variant" />OR<span class="flex-1 h-px bg-outline-variant" />
    </div>

    <GoogleButton :loading="loading" @click="run(loginWithGoogle)" />

    <p class="text-body-sm text-on-surface-variant text-center">
      已經有帳號？
      <NuxtLink :to="{ path: '/login', query: route.query }" class="text-secondary font-semibold hover:underline">登入</NuxtLink>
    </p>
  </div>
</template>
