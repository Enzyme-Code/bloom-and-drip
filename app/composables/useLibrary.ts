import { collection, deleteDoc, doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore'
import type { BeanInfo, BrewMethod, SavedBean, SavedMethod } from '~/types/brew'

type LibraryName = 'beans' | 'methods'
type LibraryItem = { id: string; updatedAt: string }

const subscriptions = new Map<LibraryName, { scope: ReturnType<typeof effectScope>; unsubscribe: Unsubscribe | null }>()

/**
 * A user's saved items at users/{uid}/{name}/{id}, newest first. Like the journal, one live subscription
 * per collection follows the signed-in user and is shared by every caller; guests get an empty list.
 */
function useLibraryCollection<T extends LibraryItem>(name: LibraryName) {
  const { $db } = useNuxtApp()
  const { user } = useAuth()
  const toast = useToast()
  const items = useState<T[]>(`library-${name}`, () => [])

  const col = (uid: string) => collection($db, 'users', uid, name)

  if (!subscriptions.has(name)) {
    const sub = { scope: effectScope(true), unsubscribe: null as Unsubscribe | null }
    subscriptions.set(name, sub)
    sub.scope.run(() => {
      watch(
        () => user.value?.uid,
        (uid) => {
          sub.unsubscribe?.()
          sub.unsubscribe = null
          items.value = []
          if (!uid) return
          sub.unsubscribe = onSnapshot(
            col(uid),
            (snap) => {
              items.value = snap.docs
                .map(d => ({ ...(d.data() as Omit<T, 'id'>), id: d.id }) as T)
                .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            },
            err => console.error(`[library:${name}]`, err)
          )
        },
        { immediate: true }
      )
    })
  }

  function requireUid() {
    const uid = user.value?.uid
    if (!uid) throw new Error('尚未登入')
    return uid
  }

  /** Optimistic like the journal: the local cache (and list) update right away, a rejected write rolls back */
  function save(item: T) {
    const { id, ...data } = item
    setDoc(doc(col(requireUid()), id), data).catch((err) => {
      console.error(`[library:${name}] write failed`, err)
      toast.show(`雲端同步失敗，未能儲存：${firestoreErrorMessage(err)}`, 'error')
    })
  }

  function remove(id: string) {
    deleteDoc(doc(col(requireUid()), id)).catch((err) => {
      console.error(`[library:${name}] delete failed`, err)
      toast.show(`刪除失敗：${firestoreErrorMessage(err)}`, 'error')
    })
  }

  return { items, save, remove }
}

/** 我的咖啡豆: beans kept for reuse, keyed by name (saving the same name again updates it) */
export function useSavedBeans() {
  const { items, save, remove } = useLibraryCollection<SavedBean>('beans')

  const findBean = (name: string) => items.value.find(b => b.id === nameKey(name))

  /** Requires sign-in (throws otherwise) */
  function saveBean(info: BeanInfo) {
    const bean: SavedBean = {
      id: nameKey(info.name),
      updatedAt: new Date().toISOString(),
      name: info.name.trim(),
      nameEn: info.nameEn.trim(),
      process: info.process.trim(),
      roaster: info.roaster.trim(),
      roast: info.roast.trim(),
      bloomSeconds: Number(info.bloomSeconds) || 0
    }
    save(bean)
    return bean
  }

  return { beans: items, findBean, saveBean, removeBean: remove }
}

/** 我的手法: brew methods kept for reuse, keyed by name (saving the same name again updates it) */
export function useSavedMethods() {
  const { items, save, remove } = useLibraryCollection<SavedMethod>('methods')

  const findMethod = (name: string) => items.value.find(m => m.id === nameKey(name))

  /** Requires sign-in (throws otherwise) */
  function saveMethod(method: BrewMethod) {
    const name = method.name.trim()
    const saved: SavedMethod = {
      id: nameKey(name),
      updatedAt: new Date().toISOString(),
      name,
      // JSON round trip drops undefined fields, which Firestore rejects
      steps: JSON.parse(JSON.stringify(method.steps))
    }
    save(saved)
    return saved
  }

  return { methods: items, findMethod, saveMethod, removeMethod: remove }
}
