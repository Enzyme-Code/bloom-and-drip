<script setup lang="ts">
/**
 * A menu anchored under its trigger on desktop and a bottom sheet on phones, where a wide dropdown
 * next to a button runs off the screen edge. The trigger goes in the `trigger` slot and receives `toggle`.
 */
defineProps<{ title: string }>()
const open = defineModel<boolean>('open', { default: false })
const root = ref<HTMLElement>()

const toggle = () => (open.value = !open.value)
const close = () => (open.value = false)

function onClickOutside(e: MouseEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) close()
}
function onKey(e: KeyboardEvent) {
  if (open.value && e.key === 'Escape') close()
}
onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="relative">
    <slot name="trigger" :toggle="toggle" :open="open" />
    <template v-if="open">
      <!-- Phone backdrop; it sits inside `root`, so it closes via its own click handler -->
      <div class="md:hidden fixed inset-0 z-[55] bg-primary/40" @click="close" />
      <div
        role="menu"
        :aria-label="title"
        class="fixed inset-x-0 bottom-0 z-[55] max-h-[75dvh] rounded-t-2xl pb-[max(0.5rem,env(safe-area-inset-bottom))]
          md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-full md:mt-2 md:w-80 md:max-h-[26rem] md:rounded-xl md:pb-2
          overflow-y-auto overscroll-contain bg-surface-container-lowest shadow-lg border border-outline-variant/50 p-2"
      >
        <div class="md:hidden sticky -top-2 -mx-2 -mt-2 mb-1 px-4 pt-2 pb-2 flex items-center justify-between bg-surface-container-lowest border-b border-outline-variant/40">
          <span class="text-label-md text-primary">{{ title }}</span>
          <button type="button" class="w-9 h-9 -mr-2 rounded-lg flex items-center justify-center text-outline" aria-label="關閉" @click="close">
            <span class="icon text-[22px]">close</span>
          </button>
        </div>
        <slot :close="close" />
      </div>
    </template>
  </div>
</template>
