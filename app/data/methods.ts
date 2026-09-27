import type { BrewMethod, MethodStep, StepType } from '~/types/brew'

export const STEP_TYPES: { type: StepType; label: string; short: string; hint: string; hasWater: boolean }[] = [
  { type: 'bloom', label: '悶蒸 (Bloom)', short: '悶蒸', hint: '濕潤粉層，讓二氧化碳排出', hasWater: true },
  { type: 'soak', label: '浸泡注水 (Soak)', short: '浸泡', hint: '關閉閥門或慢注，讓粉水充分浸泡', hasWater: true },
  { type: 'pour', label: '注水 (Pour)', short: '注水', hint: '中心細水流劃圈', hasWater: true },
  { type: 'wait', label: '斷水等待 (Pause)', short: '斷水', hint: '停止注水，等待水位下降', hasWater: false },
  { type: 'drawdown', label: '滴濾完成 (Drawdown)', short: '滴濾', hint: '等待滴濾結束，粉層平整無凹洞', hasWater: false }
]

export const STEP_META = Object.fromEntries(STEP_TYPES.map(t => [t.type, t])) as Record<StepType, (typeof STEP_TYPES)[number]>

let seq = 0
/** Unique enough for keys / split matching within a session and inside saved logs */
export function newStepId() {
  return `s${Date.now().toString(36)}${(seq++).toString(36)}`
}

const step = (type: StepType, at: number | null, share: number | null = null, note?: string): MethodStep =>
  ({ id: newStepId(), type, at, share, ...(note ? { note } : {}) })

/** Built-in methods; shares are cumulative fractions of total water so they scale with the recipe */
export function methodTemplates(): { id: string; description: string; method: BrewMethod }[] {
  return [
    {
      id: 'three-pour',
      description: '悶蒸後分兩段注水，最常見的入門手法',
      method: {
        name: '三段式',
        steps: [step('bloom', 0, 0.15), step('pour', 35, 0.58), step('pour', 75, 1), step('drawdown', 165)]
      }
    },
    {
      id: 'tetsu-4-6',
      description: '粕谷哲 4:6 法：前 40% 調酸甜，後 60% 調濃度',
      method: {
        name: '4:6 法',
        steps: [
          step('bloom', 0, 0.2, '前 40%：調整酸甜'),
          step('pour', 45, 0.4),
          step('pour', 90, 0.6, '後 60%：調整濃度'),
          step('pour', 130, 0.8),
          step('pour', 165, 1),
          step('drawdown', 210)
        ]
      }
    },
    {
      id: 'pulse',
      description: '悶蒸後小量多次斷水注水，控制流速與萃取',
      method: {
        name: '多次斷水',
        steps: [
          step('bloom', 0, 0.15),
          step('pour', 40, 0.35),
          step('wait', 55),
          step('pour', 65, 0.55),
          step('wait', 80),
          step('pour', 90, 0.75),
          step('wait', 105),
          step('pour', 115, 1),
          step('drawdown', 170)
        ]
      }
    },
    {
      id: 'single-pour',
      description: '悶蒸後一次注完，手法單純、穩定',
      method: {
        name: '一刀流',
        steps: [step('bloom', 0, 0.15), step('pour', 40, 1), step('drawdown', 150)]
      }
    },
    {
      id: 'immersion',
      description: 'Hario Switch 等浸泡式濾杯：關閥浸泡後放流',
      method: {
        name: '浸泡式',
        steps: [
          step('soak', 0, 0.3, '關閉閥門'),
          step('soak', 30, 1),
          step('wait', 60, null, '浸泡至 2:00'),
          step('drawdown', 165, null, '打開閥門放流')
        ]
      }
    }
  ]
}

export const DEFAULT_METHOD_ID = 'three-pour'
