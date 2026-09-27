import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

let readyPromise: Promise<void> | null = null

function toAuthUser(u: User | null): AuthUser | null {
  return u ? { uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL } : null
}

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Email 格式不正確',
  'auth/missing-password': '請輸入密碼',
  'auth/weak-password': '密碼至少需要 6 個字元',
  'auth/email-already-in-use': '此 Email 已被註冊',
  'auth/invalid-credential': 'Email 或密碼錯誤',
  'auth/user-not-found': 'Email 或密碼錯誤',
  'auth/wrong-password': 'Email 或密碼錯誤',
  'auth/too-many-requests': '嘗試次數過多，請稍後再試',
  'auth/popup-closed-by-user': '已取消登入',
  'auth/network-request-failed': '網路連線失敗',
  'auth/operation-not-allowed': '此登入方式尚未在 Firebase 啟用'
}

export function authErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) return ERROR_MESSAGES[err.code] ?? `登入失敗（${err.code}）`
  return (err as Error)?.message ?? '發生未知錯誤'
}

export function useAuth() {
  const { $firebaseAuth, $db } = useNuxtApp()
  const user = useState<AuthUser | null>('auth-user', () => null)

  /** Resolves once Firebase has restored (or not) the previous session. */
  function ready() {
    readyPromise ??= new Promise<void>((resolve) => {
      onAuthStateChanged($firebaseAuth, (u) => {
        user.value = toAuthUser(u)
        resolve()
      })
    })
    return readyPromise
  }

  /** Creates / refreshes users/{uid} with basic profile info. */
  async function upsertProfile(u: User, extra: Record<string, unknown> = {}) {
    await setDoc(
      doc($db, 'users', u.uid),
      { email: u.email, displayName: u.displayName, photoURL: u.photoURL, lastLoginAt: serverTimestamp(), ...extra },
      { merge: true }
    )
  }

  async function register(displayName: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword($firebaseAuth, email, password)
    await updateProfile(cred.user, { displayName })
    await upsertProfile(cred.user, { createdAt: serverTimestamp() })
    user.value = toAuthUser(cred.user)
  }

  async function login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword($firebaseAuth, email, password)
    await upsertProfile(cred.user)
    user.value = toAuthUser(cred.user)
  }

  async function loginWithGoogle() {
    const cred = await signInWithPopup($firebaseAuth, new GoogleAuthProvider())
    await upsertProfile(cred.user)
    user.value = toAuthUser(cred.user)
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail($firebaseAuth, email)
  }

  async function logout() {
    await signOut($firebaseAuth)
    user.value = null
  }

  return { user, ready, register, login, loginWithGoogle, resetPassword, logout }
}
