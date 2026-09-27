import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore'

export default defineNuxtPlugin(() => {
  const { firebase: config, firebaseEmulator } = useRuntimeConfig().public
  const useEmulator = String(firebaseEmulator) === 'true'

  if (!config.apiKey || !config.projectId) {
    console.error('[firebase] 缺少設定，請在 .env 填入 NUXT_PUBLIC_FIREBASE_* 變數')
  }

  const isNew = !getApps().length
  const app = isNew ? initializeApp(config) : getApp()
  const auth = getAuth(app)
  auth.languageCode = 'zh-TW'
  // Offline cache so journal loads instantly and writes queue while offline.
  // Multi-tab manager lets several open tabs share the IndexedDB cache instead of all but one falling back to memory.
  const db = isNew
    ? initializeFirestore(app, {
        localCache: useEmulator
          ? memoryLocalCache()
          : persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      })
    : getFirestore(app)

  if (useEmulator && isNew) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8085)
  }

  return { provide: { firebaseAuth: auth, db } }
})
