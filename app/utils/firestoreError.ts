import { FirebaseError } from 'firebase/app'

const MESSAGES: Record<string, string> = {
  'permission-denied': '沒有寫入權限，請確認 Firestore 安全規則已發布',
  'unauthenticated': '登入已失效，請重新登入',
  'not-found': '找不到 Firestore 資料庫，請確認專案設定',
  'resource-exhausted': '資料過大或超出用量（照片可能太大）',
  'unavailable': '無法連線到 Firestore，請檢查網路',
  'deadline-exceeded': '連線逾時，請稍後再試',
  'invalid-argument': '資料格式有誤'
}

/** Human-readable reason including the Firebase error code, so failures can be diagnosed from the toast */
export function firestoreErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    const code = err.code.replace(/^firestore\//, '')
    return `${MESSAGES[code] ?? err.message}（${code}）`
  }
  return err instanceof Error ? err.message : String(err)
}
