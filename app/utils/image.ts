import type { BrewLog } from '~/types/brew'

/**
 * Photos are embedded in the log document as JPEG data URLs, and Firestore documents max out at 1 MiB,
 * so all of a log's photos share one budget (leaving room for the rest of the log).
 */
export const PHOTO_BUDGET_CHARS = 880_000
/** No single photo may take more than this, so a first large photo can't crowd out the rest */
export const MAX_PHOTO_CHARS = 260_000
export const MAX_PHOTOS = 6
/** Below this there's no point trying: even the smallest step of the ladder won't fit */
const MIN_PHOTO_CHARS = 30_000

/** Tried in order until the JPEG fits: sharp enough to zoom in on first, smaller only when needed */
const LADDER: [maxSize: number, quality: number][] = [
  [1280, 0.8],
  [1080, 0.75],
  [900, 0.72],
  [720, 0.68],
  [560, 0.62],
  [420, 0.58]
]

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('無法讀取圖片'))
    }
    img.src = url
  })
}

/** Reads an image file and re-encodes it as a JPEG data URL no longer than `maxChars`. */
export async function fileToDataUrl(file: File, maxChars = MAX_PHOTO_CHARS): Promise<string> {
  if (maxChars < MIN_PHOTO_CHARS) throw new Error('照片空間已滿')
  const img = await loadImage(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  for (const [maxSize, quality] of LADDER) {
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', quality)
    if (dataUrl.length <= maxChars) return dataUrl
  }
  throw new Error('照片過大，請換一張')
}

export const photosSize = (photos: string[]) => photos.reduce((n, p) => n + p.length, 0)

/** A log's photos; logs saved before multi-photo support carry a single `photo` */
export function logPhotos(log: Pick<BrewLog, 'photos' | 'photo'>): string[] {
  return log.photos ?? (log.photo ? [log.photo] : [])
}
