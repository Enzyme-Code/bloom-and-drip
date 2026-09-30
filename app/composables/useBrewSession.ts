import { doc, getDoc, setDoc } from 'firebase/firestore'
import { BEAN_TEMPLATES, BLANK_BEAN } from '~/data/beans'
import { DEFAULT_METHOD_ID, STEP_META, methodTemplates, newStepId } from '~/data/methods'
import type { BeanInfo, BrewMethod, BrewStage, LogMode, Recipe, SensoryScores } from '~/types/brew'

const DEFAULT_TEMPLATE = BEAN_TEMPLATES[0]!
const LOG_MODE_KEY = 'bloom-and-drip:log-mode'

function readLogMode(): LogMode {
  try {
    return localStorage.getItem(LOG_MODE_KEY) === 'taste' ? 'taste' : 'full'
  } catch {
    return 'full'
  }
}

function defaultScores(): SensoryScores {
  return { acidity: 3, sweetness: 3, body: 3, aftertaste: 3, cleanliness: 3 }
}

function defaultMethod(): BrewMethod {
  return methodTemplates().find(t => t.id === DEFAULT_METHOD_ID)!.method
}

/** Deep copy with fresh step ids, so a method taken from a log / preset never shares ids with another */
export function cloneMethod(m: BrewMethod): BrewMethod {
  return { name: m.name, steps: m.steps.map(s => ({ ...s, id: newStepId() })) }
}

/**
 * Shared state for the brew being logged: bean, recipe, brew method and sensory evaluation.
 * Equipment parameters come from the selected gear set (useGear); timer state lives in useBrewTimer.
 */
export function useBrewSession() {
  const { $db } = useNuxtApp()
  const { user } = useAuth()
  const gear = useGear()

  // Starts blank rather than on a sample bean, so a log is never saved under a bean that wasn't brewed;
  // BeanProfile brings back the last brewed bean once the journal loads
  const bean = useState<BeanInfo>('bean', () => ({ ...BLANK_BEAN }))

  const dose = useState('dose', () => DEFAULT_TEMPLATE.recommended.dose)
  const water = useState('water', () => DEFAULT_TEMPLATE.recommended.dose * DEFAULT_TEMPLATE.recommended.ratio)
  const ratio = computed(() => round1(water.value / dose.value))

  const method = useState<BrewMethod>('method', defaultMethod)

  /** 完整紀錄 or 只記口感; remembered per browser */
  const logMode = useState<LogMode>('log-mode', readLogMode)
  /** Taste-only logs: optional method name (e.g. "4:6 法") and gear set, without any parameters */
  const tasteMethod = useState('taste-method', () => '')
  const tasteGearId = useState('taste-gear', () => '')

  function setLogMode(mode: LogMode) {
    logMode.value = mode
    try {
      localStorage.setItem(LOG_MODE_KEY, mode)
    } catch {
      // Storage unavailable (private mode): the choice just isn't remembered
    }
  }

  const overall = useState('overall', () => 0)
  const scores = useState<SensoryScores>('scores', defaultScores)
  const flavors = useState<string[]>('flavors', () => [])
  const notes = useState('notes', () => '')
  const tags = useState<string[]>('tags', () => [])
  const photos = useState<string[]>('photos', () => [])

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

  /** Moves the ratio to the next 0.5 step (1:15 → 1:15.5), snapping first if it's between steps */
  function stepRatio(direction: 1 | -1) {
    const exact = water.value / dose.value
    const snapped = direction > 0 ? Math.floor(exact * 2 + 1e-6) / 2 : Math.ceil(exact * 2 - 1e-6) / 2
    setRatio(Math.min(25, Math.max(5, snapped + direction * 0.5)))
  }

  function applyRecipe(p: Recipe) {
    dose.value = p.dose
    water.value = round1(p.dose * p.ratio)
    if (p.gearId) gear.select(p.gearId)
    if (p.method?.steps?.length) method.value = cloneMethod(p.method)
  }

  const presetRef = (name: string) => {
    const uid = user.value?.uid
    if (!uid) throw new Error('尚未登入')
    return doc($db, 'users', uid, 'presets', nameKey(name))
  }

  async function fetchSavedRecipe(name: string): Promise<Recipe | undefined> {
    if (!user.value) return undefined
    try {
      return (await getDoc(presetRef(name))).data() as Recipe | undefined
    } catch (err) {
      console.error('[presets]', err)
      return undefined
    }
  }

  /**
   * Loads the signed-in user's saved recipe for this bean; otherwise the matching template's
   * recommendation, otherwise the default recipe.
   */
  async function loadRecommended(): Promise<'preset' | 'template' | 'default'> {
    const name = bean.value.name
    const saved = await fetchSavedRecipe(name)
    // Ignore the result if the bean changed while loading
    if (name !== bean.value.name) return 'default'
    if (saved) {
      applyRecipe(saved)
      return 'preset'
    }
    const template = BEAN_TEMPLATES.find(t => t.name === name.trim())
    applyRecipe((template ?? DEFAULT_TEMPLATE).recommended)
    return template ? 'template' : 'default'
  }

  /** Saves dose, ratio, gear and method for this bean. Requires sign-in (throws otherwise). */
  function savePreset() {
    const recipe: Recipe = { dose: dose.value, ratio: ratio.value, gearId: gear.selectedId.value, method: method.value }
    return setDoc(presetRef(bean.value.name), recipe)
  }

  /**
   * Switches to another bean. With a recipe (e.g. from a previous log) that recipe is used as-is;
   * a template applies its recommendation and then the user's saved recipe, if any.
   */
  async function selectBean(info: BeanInfo, recipe?: Recipe) {
    bean.value = { ...info }
    if (recipe) {
      applyRecipe(recipe)
      return
    }
    const template = BEAN_TEMPLATES.find(t => t.name === info.name)
    if (template) applyRecipe(template.recommended)
    const saved = await fetchSavedRecipe(info.name)
    if (saved && info.name === bean.value.name) applyRecipe(saved)
  }

  /** Method steps resolved against the current total water */
  const stages = computed<BrewStage[]>(() =>
    method.value.steps.map((step) => {
      const meta = STEP_META[step.type]
      return {
        key: step.id,
        type: step.type,
        label: meta.label,
        name: meta.name,
        shortLabel: meta.short,
        targetMass: meta.hasWater && step.share != null ? Math.round(step.share * water.value) : null,
        plannedAt: step.at,
        hint: step.note || meta.hint
      }
    })
  )

  /** Target total brew time: the drawdown's planned finish, else a minute after the last planned step */
  const targetFinish = computed(() => {
    const steps = method.value.steps
    const drawdown = [...steps].reverse().find(s => s.type === 'drawdown' && s.at != null)
    if (drawdown) return drawdown.at!
    const lastAt = Math.max(0, ...steps.map(s => s.at ?? 0))
    return lastAt + 60
  })

  function resetSensory() {
    overall.value = 0
    scores.value = defaultScores()
    flavors.value = []
    notes.value = ''
    tags.value = []
    photos.value = []
  }

  return {
    bean,
    dose,
    water,
    ratio,
    params: gear.params,
    gear: gear.selected,
    method,
    logMode,
    setLogMode,
    tasteMethod,
    tasteGearId,
    stages,
    targetFinish,
    overall,
    scores,
    flavors,
    notes,
    tags,
    photos,
    setDose,
    setWater,
    setRatio,
    stepRatio,
    loadRecommended,
    savePreset,
    selectBean,
    resetSensory
  }
}
