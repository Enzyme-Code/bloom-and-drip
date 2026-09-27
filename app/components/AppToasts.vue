<script setup lang="ts">
const { toasts } = useToast()
</script>

<template>
  <div class="fixed z-[60] top-20 xl:top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
    <TransitionGroup
      enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0"
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-200"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="flex items-center gap-2 max-w-[90vw] md:max-w-xl px-4 py-2.5 rounded-xl bg-primary-container text-on-primary shadow-lg text-body-sm"
      >
        <span class="icon text-[18px] text-secondary-fixed">{{ t.icon }}</span>
        {{ t.message }}
      </div>
    </TransitionGroup>
  </div>
</template>
