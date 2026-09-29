import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, type Unsubscribe } from 'firebase/firestore'
import type { BrewLog } from '~/types/brew'

/** A journal entry plus whether it is still waiting to reach the server */
export type BrewLogEntry = BrewLog & { pending: boolean }

let scope: ReturnType<typeof effectScope> | null = null
let unsubscribe: Unsubscribe | null = null

/**
 * Brew journal stored in Firestore at users/{uid}/brewLogs/{id}.
 * A single live subscription follows the signed-in user and is shared by every caller.
 */
export function useBrewLogs() {
  const { $db } = useNuxtApp()
  const { user } = useAuth()
  const toast = useToast()
  // Raw snapshot rows; `pending` is Firestore's hasPendingWrites
  const snapshotLogs = useState<BrewLogEntry[]>('brew-logs', () => [])
  // Ids whose write the server has acknowledged. hasPendingWrites only clears once the listen stream
  // delivers the server's copy, which can lag (or stall behind some proxies) well after the write succeeded.
  const acked = useState<Record<string, true>>('brew-logs-acked', () => ({}))
  const logs = computed<BrewLogEntry[]>(() =>
    snapshotLogs.value.map(l => (l.pending && acked.value[l.id] ? { ...l, pending: false } : l))
  )
  const loading = useState('brew-logs-loading', () => true)
  const error = useState<string | null>('brew-logs-error', () => null)

  const logsCol = (uid: string) => collection($db, 'users', uid, 'brewLogs')

  // Detached scope so the subscription outlives whichever component called us first
  if (!scope) {
    scope = effectScope(true)
    scope.run(() => {
      watch(
        () => user.value?.uid,
        (uid) => {
          unsubscribe?.()
          unsubscribe = null
          snapshotLogs.value = []
          acked.value = {}
          error.value = null
          if (!uid) return
          loading.value = true
          unsubscribe = onSnapshot(
            query(logsCol(uid), orderBy('createdAt', 'desc')),
            // Metadata changes let us flip the "同步中" badge once the server acknowledges a write
            { includeMetadataChanges: true },
            (snap) => {
              snapshotLogs.value = snap.docs.map(d => ({
                ...(d.data() as Omit<BrewLog, 'id'>),
                id: d.id,
                pending: d.metadata.hasPendingWrites
              }))
              loading.value = false
            },
            (err) => {
              console.error('[brewLogs]', err)
              error.value = '無法讀取沖煮紀錄，請確認 Firestore 規則與網路連線'
              loading.value = false
            }
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

  /**
   * Firestore applies writes to the local cache synchronously and the snapshot listener updates right away,
   * so we don't wait for the server ack (a full network round trip). The promise resolves on server ack,
   * which is when we clear the "同步中" badge. If the server rejects the write, Firestore rolls the local
   * change back and we tell the user.
   */
  function add(log: BrewLog) {
    const { id, ...data } = log
    setDoc(doc(logsCol(requireUid()), id), data)
      .then(() => {
        acked.value = { ...acked.value, [id]: true }
      })
      .catch((err) => {
        console.error('[brewLogs] write failed', err)
        toast.show(`雲端同步失敗，這筆紀錄未能儲存：${firestoreErrorMessage(err)}`, 'error')
      })
  }

  /** Replaces a saved log with an edited copy; same optimistic write + rollback as add() */
  function update(log: BrewLog) {
    const { id, ...data } = log
    acked.value = Object.fromEntries(Object.entries(acked.value).filter(([k]) => k !== id))
    setDoc(doc(logsCol(requireUid()), id), data)
      .then(() => {
        acked.value = { ...acked.value, [id]: true }
      })
      .catch((err) => {
        console.error('[brewLogs] update failed', err)
        toast.show(`雲端同步失敗，修改已還原：${firestoreErrorMessage(err)}`, 'error')
      })
  }

  function remove(id: string) {
    deleteDoc(doc(logsCol(requireUid()), id)).catch((err) => {
      console.error('[brewLogs] delete failed', err)
      toast.show(`刪除失敗，紀錄已還原：${firestoreErrorMessage(err)}`, 'error')
    })
  }

  /** Next recipe number, shown in the breadcrumb */
  const nextRecipeNo = computed(() => String(logs.value.length + 1).padStart(4, '0'))

  return { logs, loading, error, add, update, remove, nextRecipeNo }
}
