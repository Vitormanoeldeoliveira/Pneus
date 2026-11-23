import { useEffect, useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 3800)
    return () => clearTimeout(timer)
  }, [toast])

  function notify(type, message) {
    setToast({ type, message, id: Date.now() })
  }

  return { toast, notify }
}

export function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`toast ${toast.type}`} role="status">
      {toast.message}
    </div>
  )
}
