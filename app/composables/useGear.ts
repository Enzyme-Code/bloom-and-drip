import { collection, deleteDoc, doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore'
import { DEFAULT_GEAR } from '~/data/gear'
import type { BrewParams, GearSet } from '~/types/brew'

const SELECTED_KEY = 'bloom-and-drip:gear'
const WRITE_DELAY = 600

let scope: ReturnType<typeof effectScope> | null = null
let unsubscribe: Unsubscribe | null = null
const pendingWrites = new Map<string, ReturnType<typeof setTimeout>>()

const cloneDefaults = () => DEFAULT_GEAR.map(g => ({ ...g }))

/** User-defined order first; gear without an order (saved before reordering existed) goes last, by name */
function byOrder(a: GearSet, b: GearSet) {
  return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name, 'zh-Hant')
}

/** Gear saved before 水源 replaced 水質 (ppm): the water name lived in waterNote and the TDS in waterPpm */
function fromDoc(id: string, data: Record<string, unknown>): GearSet {
  const gear = { ...(data as Omit<GearSet, 'id'>), id }
  if (gear.waterSource === undefined) {
    const ppm = data.waterPpm
    gear.waterSource = String(data.waterNote ?? '')
    gear.waterNote = typeof ppm === 'number' ? `TDS ${ppm} ppm` : ''
  }
  delete (gear as Record<string, unknown>).waterPpm
  return gear
}

function readSelected() {
  try {
    return localStorage.getItem(SELECTED_KEY)
  } catch {
    return null
  }
}

/**
 * Equipment setups (水溫 / 研磨 / 濾杯 / 水質). Signed-in users sync to users/{uid}/gear/{id};
 * guests get editable defaults kept in memory. The selected set is remembered per device.
 */
export function useGear() {
  const { $db } = useNuxtApp()
  const { user } = useAuth()
  const toast = useToast()
  const gearSets = useState<GearSet[]>('gear-sets', cloneDefaults)
  const selectedId = useState<string>('gear-selected', () => readSelected() ?? DEFAULT_GEAR[0]!.id)

  const gearCol = (uid: string) => collection($db, 'users', uid, 'gear')

  if (!scope) {
    scope = effectScope(true)
    scope.run(() => {
      watch(
        () => user.value?.uid,
        (uid) => {
          unsubscribe?.()
          unsubscribe = null
          if (!uid) {
            gearSets.value = cloneDefaults()
            return
          }
          unsubscribe = onSnapshot(gearCol(uid), (snap) => {
            // First sign-in: seed with whatever gear is in memory (defaults, or edits made as a guest).
            // Ids are kept, so seeding twice is harmless.
            if (snap.empty && !snap.metadata.fromCache) {
              for (const g of gearSets.value) {
                const { id, ...data } = g
                setDoc(doc(gearCol(uid), id), data).catch(err => console.error('[gear] seed failed', err))
              }
              return
            }
            if (snap.empty) return
            const local = new Map(gearSets.value.map(g => [g.id, g]))
            gearSets.value = snap.docs
              // Keep the local copy while an edit is still waiting to be written
              .map(d => (pendingWrites.has(d.id) && local.get(d.id)) || fromDoc(d.id, d.data()))
              .sort(byOrder)
          }, err => console.error('[gear]', err))
        },
        { immediate: true }
      )
      watch(selectedId, (id) => {
        try {
          localStorage.setItem(SELECTED_KEY, id)
        } catch {
          // Storage unavailable (private mode); selection just won't persist
        }
      })
    })
  }

  const selected = computed(() => gearSets.value.find(g => g.id === selectedId.value) ?? gearSets.value[0]!)

  /** The selected set's brew parameters */
  const params = computed<BrewParams>(() => {
    const { id: _id, name: _name, ...rest } = selected.value
    return rest
  })

  function persist(gear: GearSet) {
    const uid = user.value?.uid
    if (!uid) return
    clearTimeout(pendingWrites.get(gear.id))
    // Debounced so typing in a field doesn't write on every keystroke
    pendingWrites.set(gear.id, setTimeout(() => {
      pendingWrites.delete(gear.id)
      const { id, ...data } = gear
      setDoc(doc(gearCol(uid), id), data).catch((err) => {
        console.error('[gear] write failed', err)
        toast.show(`器具儲存失敗：${firestoreErrorMessage(err)}`, 'error')
      })
    }, WRITE_DELAY))
  }

  function update(id: string, patch: Partial<Omit<GearSet, 'id'>>) {
    const i = gearSets.value.findIndex(g => g.id === id)
    if (i < 0) return
    const next = { ...gearSets.value[i]!, ...patch }
    gearSets.value = gearSets.value.map(g => (g.id === id ? next : g))
    persist(next)
  }

  function add(from: GearSet = selected.value) {
    const order = Math.max(-1, ...gearSets.value.map((g, i) => g.order ?? i)) + 1
    const gear: GearSet = { ...from, id: `g${Date.now().toString(36)}`, name: `${from.name} 副本`, order }
    gearSets.value = [...gearSets.value, gear]
    persist(gear)
    return gear
  }

  /** Moves a gear set up / down one place and saves the new order of every set whose position changed */
  function move(id: string, delta: -1 | 1) {
    const list = [...gearSets.value]
    const i = list.findIndex(g => g.id === id)
    const j = i + delta
    if (i < 0 || j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j]!, list[i]!]
    gearSets.value = list.map((g, index) => {
      if (g.order === index) return g
      const next = { ...g, order: index }
      persist(next)
      return next
    })
  }

  function remove(id: string) {
    if (gearSets.value.length <= 1) return
    gearSets.value = gearSets.value.filter(g => g.id !== id)
    if (selectedId.value === id) selectedId.value = gearSets.value[0]!.id
    clearTimeout(pendingWrites.get(id))
    const uid = user.value?.uid
    if (uid) deleteDoc(doc(gearCol(uid), id)).catch(err => console.error('[gear] delete failed', err))
  }

  function select(id: string) {
    if (gearSets.value.some(g => g.id === id)) selectedId.value = id
  }

  return { gearSets, selectedId, selected, params, update, add, remove, move, select }
}
