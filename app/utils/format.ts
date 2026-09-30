export function formatTime(totalSeconds: number | null): string {
  if (totalSeconds == null) return '--:--'
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** Parses "2:45", "02:45" or plain seconds ("165"); returns null for empty / invalid input */
export function parseTime(input: string): number | null {
  const s = input.trim()
  if (!s) return null
  const mmss = /^(\d{1,2})[:：](\d{1,2})$/.exec(s)
  if (mmss) {
    const sec = Number(mmss[2])
    return sec < 60 ? Number(mmss[1]) * 60 + sec : null
  }
  return /^\d{1,4}$/.test(s) ? Number(s) : null
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function formatRatio(ratio: number): string {
  return `1 : ${Number.isInteger(Math.round(ratio * 100) / 10) ? ratio.toFixed(1) : ratio.toFixed(2)}`
}

/**
 * Firestore doc id derived from a name, for things identified by name: a bean's saved recipe
 * (users/{uid}/presets/{key}) and the bean / method library.
 */
export function nameKey(name: string) {
  const key = name.trim().replace(/\//g, '／').slice(0, 200)
  return key && key !== '.' && key !== '..' ? key : '_unnamed'
}
