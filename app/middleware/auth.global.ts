const PUBLIC_ROUTES = ['/login', '/register']

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, ready } = useAuth()
  await ready()

  const isPublic = PUBLIC_ROUTES.includes(to.path)
  if (!user.value && !isPublic) {
    return navigateTo({ path: '/login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined })
  }
  if (user.value && isPublic) {
    return navigateTo('/')
  }
})
