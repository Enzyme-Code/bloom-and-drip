<template>
  <div class="min-h-screen grid lg:grid-cols-2 bg-surface">
    <!-- Brand panel -->
    <aside class="hidden lg:flex relative overflow-hidden bg-primary-container text-on-primary p-margin flex-col justify-between">
      <div class="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
      <div class="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none" />
      <div class="relative flex items-center gap-space-md">
        <span class="inline-flex items-center justify-center w-10 h-10 rounded-full border border-on-primary-container/50">
          <span class="icon text-[22px] text-secondary-fixed">coffee_maker</span>
        </span>
        <div class="flex flex-col">
          <span class="font-serif text-headline-sm tracking-tight">Bloom &amp; Drip</span>
          <span class="font-mono text-label-mono text-secondary-fixed-dim uppercase">Pourcraft Studio</span>
        </div>
      </div>
      <div class="relative flex flex-col gap-space-md max-w-md">
        <p class="font-mono text-label-mono text-secondary-fixed uppercase tracking-widest">Precision Brewing &amp; Sensory System</p>
        <h2 class="font-serif text-headline-lg">記錄每一杯的<br>悶蒸、分段與風味。</h2>
        <p class="text-body-md text-on-primary-container">粉水比計算、分段計時、杯測評分與沖煮日誌，雲端同步到你的每一台裝置。</p>
      </div>
      <p class="relative font-mono text-label-mono text-on-primary-container">© POURCRAFT STUDIO</p>
    </aside>

    <main class="flex items-center justify-center px-margin-mobile py-space-xl">
      <div class="w-full max-w-sm">
        <div class="lg:hidden flex items-center gap-3 mb-space-xl">
          <AppLogo />
          <span class="font-serif text-headline-sm text-primary">Bloom &amp; Drip</span>
        </div>
        <slot />
      </div>
    </main>
    <AppToasts />
  </div>
</template>
