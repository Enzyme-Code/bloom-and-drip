<script setup lang="ts">
withDefaults(defineProps<{ size?: string; readonly?: boolean }>(), { size: 'text-lg' })
const model = defineModel<number>({ required: true })
const hover = ref<number | null>(null)

function icon(i: number, value: number) {
  if (value >= i) return 'star'
  if (value >= i - 0.5) return 'star_half'
  return 'star'
}
</script>

<template>
  <div class="flex items-center gap-0.5 text-secondary" @mouseleave="hover = null">
    <span v-for="i in 5" :key="i" class="relative inline-flex">
      <span
        class="icon"
        :class="[size, (hover ?? model) >= i - 0.5 ? 'icon-fill' : '']"
      >{{ icon(i, hover ?? model) }}</span>
      <template v-if="!readonly">
        <button
          type="button"
          class="absolute inset-y-0 left-0 w-1/2"
          :aria-label="`${i - 0.5} 星`"
          @mouseenter="hover = i - 0.5"
          @click="model = i - 0.5"
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 w-1/2"
          :aria-label="`${i} 星`"
          @mouseenter="hover = i"
          @click="model = model === i ? 0 : i"
        />
      </template>
    </span>
  </div>
</template>
