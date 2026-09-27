import type { StageSplit } from '~/types/brew'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

const TICK_MS = 100

let handle: ReturnType<typeof setInterval> | null = null
let lastTick = 0

/** Brew stopwatch with manual stage splits: the barista taps "分段注水" as each pour reaches its target. */
export function useBrewTimer() {
  const { stages } = useBrewSession()

  const status = useState<TimerStatus>('timer-status', () => 'idle')
  const elapsed = useState('timer-elapsed', () => 0)
  const stageIndex = useState('stage-index', () => 0)
  const splits = useState<StageSplit[]>('stage-splits', () => [])

  /** Seconds since the current stage began */
  const stageElapsed = computed(() => elapsed.value - (splits.value[splits.value.length - 1]?.t ?? 0))

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

  return { status, elapsed, stageElapsed, stageIndex, splits, pause, toggle, nextStage, reset, stageStatus }
}
