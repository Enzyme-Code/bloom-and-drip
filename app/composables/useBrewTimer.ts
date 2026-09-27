import type { StageSplit } from '~/types/brew'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

const TICK_MS = 100

let handle: ReturnType<typeof setInterval> | null = null
let lastTick = 0

/** Values typed in from the barista's own scale, one entry per stage */
export interface ManualStageEntry {
  t: number | null
  m: number | null
}

/**
 * Brew stopwatch with stage splits: either tap "分段注水" live as each pour reaches its target,
 * or switch to manual mode and type in the times / weights read off your own scale.
 */
export function useBrewTimer() {
  const { stages } = useBrewSession()

  const status = useState<TimerStatus>('timer-status', () => 'idle')
  const elapsed = useState('timer-elapsed', () => 0)
  const stageIndex = useState('stage-index', () => 0)
  const splits = useState<StageSplit[]>('stage-splits', () => [])
  /** Manual-entry mode, shared by the desktop and mobile consoles */
  const manual = useState('timer-manual', () => false)

  /** Seconds since the current stage began */
  const stageElapsed = computed(() => elapsed.value - (splits.value[splits.value.length - 1]?.t ?? 0))

  /** Current values in manual-entry shape, for pre-filling the form */
  function manualEntries(): ManualStageEntry[] {
    return stages.value.map((stage) => {
      const split = splits.value.find(s => s.key === stage.key)
      return { t: split?.t ?? null, m: split?.m ?? null }
    })
  }

  /**
   * Replaces splits / total time with manually entered values. Stops the stopwatch.
   * Total time falls back to the latest stage time when not given.
   */
  function applyManual(entries: ManualStageEntry[], total: number | null) {
    halt()
    splits.value = stages.value.flatMap((stage, i) => {
      const e = entries[i]
      if (!e || (e.t == null && e.m == null)) return []
      return [{ key: stage.key, label: stage.label, t: e.t, m: stage.targetMass == null ? null : e.m ?? stage.targetMass }]
    })
    const times = splits.value.map(s => s.t).filter((t): t is number => t != null)
    elapsed.value = total ?? (times.length ? Math.max(...times) : 0)

    const done = stages.value.every(stage => splits.value.some(s => s.key === stage.key))
    stageIndex.value = Math.min(splits.value.length, stages.value.length - 1)
    if (done || total != null) status.value = 'finished'
    else status.value = splits.value.length ? 'paused' : 'idle'
  }

  function tick() {
    const now = performance.now()
    elapsed.value += (now - lastTick) / 1000
    lastTick = now
  }

  function run() {
    lastTick = performance.now()
    handle ??= setInterval(tick, TICK_MS)
    status.value = 'running'
  }

  function halt() {
    if (handle) clearInterval(handle)
    handle = null
  }

  function pause() {
    halt()
    status.value = 'paused'
  }

  function toggle() {
    if (status.value === 'running') pause()
    else if (status.value !== 'finished') run()
  }

  /** Marks the current stage complete and moves on; completing the last stage ends the brew. */
  function nextStage() {
    if (status.value === 'finished') return
    if (status.value === 'idle') {
      run()
      return
    }
    const stage = stages.value[stageIndex.value]!
    splits.value.push({ key: stage.key, label: stage.label, t: round1(elapsed.value), m: stage.targetMass })

    if (stageIndex.value < stages.value.length - 1) {
      stageIndex.value++
      if (status.value === 'paused') run()
    } else {
      halt()
      status.value = 'finished'
    }
  }

  function reset() {
    halt()
    status.value = 'idle'
    elapsed.value = 0
    stageIndex.value = 0
    splits.value = []
  }

  function stageStatus(i: number): 'done' | 'active' | 'pending' {
    if (status.value === 'finished' || i < stageIndex.value) return 'done'
    if (i === stageIndex.value && status.value !== 'idle') return 'active'
    return 'pending'
  }

  return {
    status,
    elapsed,
    stageElapsed,
    stageIndex,
    splits,
    manual,
    pause,
    toggle,
    nextStage,
    reset,
    stageStatus,
    manualEntries,
    applyManual
  }
}
