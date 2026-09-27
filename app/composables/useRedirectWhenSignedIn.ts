/**
 * On the login / register pages: leave as soon as Firebase reports a signed-in user,
 * regardless of which step of the sign-in flow is still pending.
 */
export function useRedirectWhenSignedIn() {
  const { user } = useAuth()
  const route = useRoute()

  watch(
    () => user.value?.uid,
    (uid) => {
      if (uid) navigateTo(safeRedirect(route.query.redirect), { replace: true })
    }
  )
}
