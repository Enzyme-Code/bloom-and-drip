export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function formatRatio(ratio: number): string {
  return `1 : ${Number.isInteger(Math.round(ratio * 100) / 10) ? ratio.toFixed(1) : ratio.toFixed(2)}`
}
