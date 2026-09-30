<script setup lang="ts">
/**
 * A clickable label wrapping a hidden file input that emits the picked image files.
 * `camera` opens the camera directly on phones; without it phones offer the photo library (and camera),
 * where several photos can be picked at once.
 */
defineProps<{ camera?: boolean; disabled?: boolean }>()
const emit = defineEmits<{ picked: [files: File[]] }>()

function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  input.value = ''
  if (files.length) emit('picked', files)
}
</script>

<template>
  <label :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'">
    <input
      type="file"
      accept="image/*"
      :multiple="!camera"
      :capture="camera ? 'environment' : undefined"
      :disabled="disabled"
      class="hidden"
      @change="onFile"
    >
    <slot />
  </label>
</template>
