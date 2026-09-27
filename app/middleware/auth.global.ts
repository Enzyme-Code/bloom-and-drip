/** Routes usable without an account: the brew tools and gear setup work for guests, saving requires sign-in */
const PUBLIC_ROUTES = ['/', '/gear', '/login', '/register']
const AUTH_PAGES = ['/login', '/register']

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, ready } = useAuth()
  await ready()

  if (!user.value && !PUBLIC_ROUTES.includes(to.path)) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
  if (user.value && AUTH_PAGES.includes(to.path)) {
    return navigateTo('/')
  }
})
