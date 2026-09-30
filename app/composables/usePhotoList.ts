/**
 * Adds picked image files to a list of photo data URLs, compressing each so the whole list stays within
 * the per-log budget (MAX_PHOTOS photos, PHOTO_BUDGET_CHARS in total). Used by the brew page and the log editor.
 */
export function usePhotoList(photos: Ref<string[]>) {
  const toast = useToast()
  const busy = ref(false)
  const full = computed(() => photos.value.length >= MAX_PHOTOS || PHOTO_BUDGET_CHARS - photosSize(photos.value) < 30_000)

  /** Resolves to the number of photos added */
  async function add(files: File[]) {
    busy.value = true
    let added = 0
    let lastError = ''
    try {
      for (const file of files) {
        if (photos.value.length >= MAX_PHOTOS) {
          lastError = `最多 ${MAX_PHOTOS} 張照片`
          break
        }
        try {
          const remaining = PHOTO_BUDGET_CHARS - photosSize(photos.value)
          photos.value = [...photos.value, await fileToDataUrl(file, Math.min(MAX_PHOTO_CHARS, remaining))]
          added++
        } catch (err) {
          lastError = (err as Error).message
        }
      }
    } finally {
      busy.value = false
    }
    const missed = files.length - added
    if (missed) toast.show(added ? `已加入 ${added} 張，另 ${missed} 張未加入：${lastError}` : lastError, 'error')
    return added
  }

  function remove(index: number) {
    photos.value = photos.value.filter((_, i) => i !== index)
  }

  return { add, remove, busy, full }
}
