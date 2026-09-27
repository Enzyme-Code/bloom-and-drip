interface Toast {
  id: number
  message: string
  icon: string
}

let seq = 0

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function show(message: string, icon = 'check_circle') {
    const id = ++seq
    toasts.value.push({ id, message, icon })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 2600)
  }

  return { toasts, show }
}
