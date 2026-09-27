interface Toast {
  id: number
  message: string
  icon: string
}

let seq = 0

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function show(message: string, icon = 'check_circle', duration = icon === 'error' ? 7000 : 2600) {
    const id = ++seq
    toasts.value.push({ id, message, icon })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  return { toasts, show }
}
