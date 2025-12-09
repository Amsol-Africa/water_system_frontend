// ============================================
// FILE 8: src/hooks/useNotification.js
// ============================================
import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export const useNotification = () => {
  const [notifications, setNotifications, clearNotifications] = useLocalStorage('notifications', [])

  const addNotification = useCallback(
    (message, type = 'info', duration = 3000) => {
      const id = Date.now()
      const notification = { id, message, type }

      setNotifications((prev) => [...prev, notification])

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id)
        }, duration)
      }

      return id
    },
    [setNotifications]
  )

  const removeNotification = useCallback(
    (id) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    },
    [setNotifications]
  )

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  }
}
