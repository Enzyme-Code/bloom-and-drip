/** Free-form coffee bean description; every field is user-editable */
export interface BeanInfo {
  /** 品名 */
  name: string
  /** 產區 / 英文品名 (field name kept for compatibility with saved logs) */
  nameEn: string
  process: string
  roaster: string
  roast: string
  bloomSeconds: number
}

/**
 * What gets saved per bean (users/{uid}/presets/{beanName}) and restored from past logs.
 * Older presets also carry BrewParams fields, which are ignored now that params come from gear sets.
 */
export interface Recipe {
  dose: number
  ratio: number
  gearId?: string
  method?: BrewMethod
}

/** Built-in starting point the user can pick and then edit */
export interface BeanTemplate extends BeanInfo {
  id: string
  recommended: Recipe
}

export interface BrewParams {
  temperature: number
  grind: string
  grindNote: string
  dripper: string
  filter: string
  /** 水源, e.g. 過濾水 / Third Wave Water */
  waterSource: string
  waterNote: string
}

/** A named equipment setup managed on the gear page (users/{uid}/gear/{id}) */
export interface GearSet extends BrewParams {
  id: string
  name: string
  /** Position on the gear page / in the selector (absent on gear saved before reordering existed) */
  order?: number
}

/** 悶蒸 / 浸泡注水 / 注水 / 斷水等待 / 滴濾 */
export type StepType = 'bloom' | 'soak' | 'pour' | 'wait' | 'drawdown'

export interface MethodStep {
  id: string
  type: StepType
  /** Planned start time in seconds (for drawdown: planned finish time) */
  at: number | null
  /** Cumulative water at the end of the step as a fraction of total water (so recipes scale); null for wait / drawdown */
  share: number | null
  note?: string
}

export interface BrewMethod {
  name: string
  steps: MethodStep[]
}

export type StageStatus = 'done' | 'active' | 'pending'

/** A method step resolved against the current total water, as used by the timer */
export interface BrewStage {
  key: string
  type: StepType
  /** e.g. "注水 (Pour)" */
  label: string
  /** Chinese-only name for tight spaces, e.g. "注水" / "滴濾完成" */
  name: string
  shortLabel: string
  /** Target cumulative mass in grams; null for wait / drawdown */
  targetMass: number | null
  /** Planned start time (drawdown: planned finish) */
  plannedAt: number | null
  hint: string
}

export interface StageSplit {
  key: string
  label: string
  /** Elapsed seconds when the stage was completed; null if only the weight was entered manually */
  t: number | null
  /** Cumulative mass at the end of the stage (grams): measured when entered manually, else the target; null for drawdown */
  m: number | null
}

export interface SensoryScores {
  acidity: number
  sweetness: number
  body: number
  aftertaste: number
  cleanliness: number
}

/** Stored at users/{uid}/brewLogs/{id} */
export interface BrewLog {
  id: string
  /** ISO timestamp, used for ordering */
  createdAt: string
  /** Older logs lack bloomSeconds (and may still carry a retired altitude field) */
  bean: Pick<BeanInfo, 'name' | 'nameEn' | 'process' | 'roaster' | 'roast'> & Partial<Pick<BeanInfo, 'bloomSeconds'>>
  dose: number
  water: number
  params: BrewParams
  totalSeconds: number
  stageSplits: StageSplit[]
  /** Brew method used (absent on older logs) */
  method?: BrewMethod
  gearId?: string
  gearName?: string
  overall: number
  scores: SensoryScores
  flavors: string[]
  notes: string
  tags: string[]
  /** Compressed JPEG data URL (kept small to fit Firestore's 1 MiB document limit) */
  photo: string | null
}
