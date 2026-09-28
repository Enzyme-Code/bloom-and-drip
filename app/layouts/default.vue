<template>
  <div class="min-h-screen flex flex-col bg-surface">
    <AppHeader />
    <main class="flex-1 w-full pt-16 xl:pt-20">
      <VerifyEmailBanner />
      <slot />
    </main>
    <AppFooter />
    <AppToasts />
  </div>
</template>
