import { doc, getDoc, setDoc } from 'firebase/firestore'
import { BEANS } from '~/data/beans'
import type { BrewParams, BrewStage, SensoryScores } from '~/types/brew'

function roundTo5(n: number) {
  return Math.round(n / 5) * 5
}

function defaultScores(): SensoryScores {
  return { acidity: 3, sweetness: 3, body: 3, aftertaste: 3, cleanliness: 3 }
}

/** Stored at users/{uid}/presets/{beanId} */
type Preset = BrewParams & { dose: number; ratio: number }

/**
 * Shared state for the brew being logged: bean, recipe, parameters and sensory evaluation.
 * Timer state lives in useBrewTimer.
 */
export function useBrewSession() {
  const { $db } = useNuxtApp()
  const { user } = useAuth()
  const beanIndex = useState('bean-index', () => 0)
  const bean = computed(() => BEANS[beanIndex.value % BEANS.length]!)

  const dose = useState('dose', () => bean.value.recommended.dose)
  const water = useState('water', () => bean.value.recommended.dose * bean.value.recommended.ratio)
  const ratio = computed(() => round1(water.value / dose.value))

  const params = useState<BrewParams>('params', () => {
    const { dose: _d, ratio: _r, ...rest } = bean.value.recommended
    return { ...rest }
  })

  const overall = useState('overall', () => 0)
  const scores = useState<SensoryScores>('scores', defaultScores)
  const flavors = useState<string[]>('flavors', () => [])
  const notes = useState('notes', () => '')
  const tags = useState<string[]>('tags', () => [])
  const photo = useState<string | null>('photo', () => null)

  function setDose(value: number) {
    const next = Math.min(40, Math.max(5, round1(value)))
    const r = water.value / dose.value
    dose.value = next
    water.value = round1(next * r)
  }

  function setWater(value: number) {
    water.value = Math.min(800, Math.max(50, round1(value)))
  }

  function setRatio(r: number) {
    water.value = round1(dose.value * r)
  }

  function applyPreset(p: Preset) {
    dose.value = p.dose
    water.value = round1(p.dose * p.ratio)
    const { dose: _d, ratio: _r, ...rest } = p
    params.value = { ...rest }
  }

  const presetRef = (beanId: string) => {
    const uid = user.value?.uid
    if (!uid) throw new Error('尚未登入')
    return doc($db, 'users', uid, 'presets', beanId)
  }

  /** Loads the user's saved preset for this bean if any, otherwise the roaster recommendation. */
  async function loadRecommended(): Promise<'preset' | 'recommended'> {
    const beanId = bean.value.id
    let preset: Preset | undefined
    try {
      preset = (await getDoc(presetRef(beanId))).data() as Preset | undefined
    } catch (err) {
      console.error('[presets]', err)
    }
    // Ignore the result if the bean was switched while loading
    if (beanId !== bean.value.id) return 'recommended'
    applyPreset(preset ?? bean.value.recommended)
    return preset ? 'preset' : 'recommended'
  }

  /** Resolves once written to the local cache; the returned promise settles when the server acknowledges. */
  function savePreset() {
    const preset: Preset = { ...params.value, dose: dose.value, ratio: ratio.value }
    return setDoc(presetRef(bean.value.id), preset)
  }

  function nextBean() {
    beanIndex.value = (beanIndex.value + 1) % BEANS.length
    applyPreset(bean.value.recommended)
    loadRecommended()
  }

  const stages = computed<BrewStage[]>(() => {
    const bloom = roundTo5(dose.value * 2.8)
    const middle = Math.max(bloom + 10, roundTo5(water.value * 0.58))
    return [
      { key: 'bloom', label: '悶蒸 (Bloom)', shortLabel: '悶蒸', targetMass: bloom, hint: '二氧化碳充分排氣' },
      { key: 'middle', label: '第一段注水 (First Pour)', shortLabel: '中段', targetMass: middle, hint: '中心細水流劃圈 2.2g/s' },
      { key: 'final', label: '第二段注水 (Final Pour)', shortLabel: '尾段', targetMass: water.value, hint: '平順擴大注水降粉壁' },
      { key: 'drawdown', label: '滴濾完成 (Drip Finish)', shortLabel: '滴濾收尾', targetMass: null, hint: '粉層平整無凹洞' }
    ]
  })

  /** Target total brew time in seconds */
  const targetFinish = computed(() => bean.value.bloomSeconds + 130)

  function resetSensory() {
    overall.value = 0
    scores.value = defaultScores()
    flavors.value = []
    notes.value = ''
    tags.value = []
    photo.value = null
  }

  return {
    bean,
    dose,
    water,
    ratio,
    params,
    stages,
    targetFinish,
    overall,
    scores,
    flavors,
    notes,
    tags,
    photo,
    setDose,
    setWater,
    setRatio,
    loadRecommended,
    savePreset,
    nextBean,
    resetSensory
  }
}
