import type { BrewStage, StageSplit, StageStatus } from '~/types/brew'

/** One-line status for a stage card / row, shared by the desktop and mobile consoles */
export function stageText(stage: BrewStage, split: StageSplit | undefined, state: StageStatus, targetFinish: number): string {
  if (state === 'done' && split) {
    return stage.targetMass != null && split.m != null ? `${formatTime(split.t)} / ${split.m}g` : `完成 ${formatTime(split.t)}`
  }
  if (state === 'active') {
    if (stage.targetMass != null) return `進行中 / 至 ${stage.targetMass}g`
    return stage.type === 'wait' ? '斷水等待中…' : '滴濾中…'
  }
  if (stage.targetMass != null) {
    return `${stage.plannedAt != null ? `${formatTime(stage.plannedAt)} · ` : ''}至 ${stage.targetMass}g`
  }
  if (stage.type === 'wait') return stage.plannedAt != null ? `${formatTime(stage.plannedAt)} 起斷水` : '斷水等待'
  return `預估 ${formatTime(stage.plannedAt ?? targetFinish)} 完成`
}

export function stageIcon(stage: BrewStage, state: StageStatus): string {
  if (state === 'done') return 'check_circle'
  if (state === 'active') return stage.type === 'wait' ? 'hourglass_top' : 'electric_bolt'
  if (stage.type === 'drawdown') return 'flag'
  if (stage.type === 'wait') return 'pause_circle'
  return 'radio_button_unchecked'
}
