export interface Bean {
  id: string
  name: string
  nameEn: string
  process: string
  roaster: string
  roast: string
  bloomSeconds: number
  altitude: number
  recommended: BrewParams & { dose: number; ratio: number }
}

export interface BrewParams {
  temperature: number
  grind: string
  grindNote: string
  dripper: string
  filter: string
  waterPpm: number
  waterNote: string
}

export type StageStatus = 'done' | 'active' | 'pending'

export interface BrewStage {
  key: string
  label: string
  shortLabel: string
  /** Target cumulative mass in grams; null for drawdown */
  targetMass: number | null
  hint: string
}

export interface StageSplit {
  key: string
  label: string
  /** Elapsed seconds when the stage was completed */
  t: number
  /** Target cumulative mass for the stage (grams); null for drawdown */
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
  bean: Pick<Bean, 'id' | 'name' | 'nameEn' | 'process' | 'roaster' | 'roast'>
  dose: number
  water: number
  params: BrewParams
  totalSeconds: number
  stageSplits: StageSplit[]
  overall: number
  scores: SensoryScores
  flavors: string[]
  notes: string
  tags: string[]
  /** Compressed JPEG data URL (kept small to fit Firestore's 1 MiB document limit) */
  photo: string | null
}
