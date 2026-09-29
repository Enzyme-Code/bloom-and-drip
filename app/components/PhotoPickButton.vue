<script setup lang="ts">
/**
 * A clickable label wrapping a hidden file input that emits the picked image as a compressed JPEG data URL.
 * `camera` opens the camera directly on phones; without it phones offer the photo library (and camera).
 */
defineProps<{ camera?: boolean }>()
const emit = defineEmits<{ picked: [dataUrl: string] }>()
const toast = useToast()

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    emit('picked', await fileToDataUrl(file))
  } catch (err) {
    toast.show((err as Error).message, 'error')
  }
}
</script>

<template>
  <label class="cursor-pointer">
    <input type="file" accept="image/*" :capture="camera ? 'environment' : undefined" class="hidden" @change="onFile">
    <slot />
  </label>
</template>
