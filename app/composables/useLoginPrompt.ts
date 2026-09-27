/**
 * For actions that need an account: returns true when signed in, otherwise sends the guest to the
 * login page and back here afterwards. The in-progress brew lives in app state, so it survives the round trip.
 */
export function useLoginPrompt() {
  const { user } = useAuth()
  const route = useRoute()
  const toast = useToast()

  return function requireLogin(message = '登入後即可儲存紀錄') {
    if (user.value) return true
    toast.show(message, 'login')
    navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    return false
  }
}
