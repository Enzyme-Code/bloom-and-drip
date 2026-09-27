<script setup lang="ts">
defineProps<{ crumb: string; title: string; tag?: string }>()
</script>

<template>
  <section class="w-full px-margin-mobile md:px-margin py-space-md bg-surface-container-low/70">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-space-xs font-mono text-label-mono text-outline">
          <NuxtLink to="/" class="hover:text-primary transition-colors">沖煮工作台</NuxtLink>
          <span>/</span>
          <span class="text-secondary font-medium">{{ crumb }}</span>
        </div>
        <div class="flex items-center gap-3">
          <h1 class="font-serif text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight">{{ title }}</h1>
          <span v-if="tag" class="font-mono text-[11px] text-secondary tracking-wider uppercase px-2 py-0.5 rounded bg-surface-container">{{ tag }}</span>
        </div>
      </div>
      <slot />
    </div>
  </section>
</template>
