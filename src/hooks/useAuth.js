// ============================================
// FILE 1: src/hooks/useAuth.js
// ============================================
import { useAuthStore } from '@/store'
import { useEffect } from 'react'

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    hasRole,
    hasPermission,
    updateUser,
    bootstrap,
  } = useAuthStore()

  useEffect(() => {
      if (isLoading) {bootstrap()
    }
  }, [bootstrap, isLoading])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    hasRole,
    hasPermission,
    updateUser,
  }
}