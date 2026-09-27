/** Reactive navigator.onLine */
export function useOnline() {
  const online = useState('online', () => navigator.onLine)
  if (!import.meta.env.SSR && !(window as { __onlineBound?: boolean }).__onlineBound) {
    ;(window as { __onlineBound?: boolean }).__onlineBound = true
    window.addEventListener('online', () => (online.value = true))
    window.addEventListener('offline', () => (online.value = false))
  }
  return online
}
