// ============================================
// frontend/src/store/authStore.js - UPDATED for Backend Integration
// ============================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,


      clearError: () => set({ error: null }),

  // Called on app start to restore session if tokens exist
      bootstrap: async () => {
        try {
          const access = localStorage.getItem('access_token')
          if (access) {
            const { data } = await authService.getCurrentUser()
            set({ user: data, isAuthenticated: true })
          }
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          set({ user: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login(email, password)
          const { access, refresh, user } = response.data

          set({
            user,
            token: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 
                         error.response?.data?.detail ||
                         'Login failed'
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
          })
          return { success: false, error: message }
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch (error) {
          console.error('Logout error:', error)
        }

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      refreshAccessToken: async () => {
        try {
          const response = await authService.refreshToken()
          const { access } = response.data

          set({ token: access })
          return true
        } catch (error) {
          console.error('Token refresh failed:', error)
          get().logout()
          return false
        }
      },

      loadUser: async () => {
        const token = get().token
        if (!token) return

        try {
          const response = await authService.getCurrentUser()
          set({ user: response.data })
        } catch (error) {
          console.error('Failed to load user:', error)
          if (error.response?.status === 401) {
            get().logout()
          }
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }))
      },

      hasRole: (role) => {
        const state = get()
        return state.user?.role === role
      },

      hasPermission: (requiredRole) => {
        const state = get()
        const adminRoles = ['system_admin', 'client_admin']
        const operatorRoles = ['operator', 'field_engineer']

        if (!state.user) return false

        // System admin has all permissions
        if (state.user.role === 'system_admin') return true

        if (requiredRole === 'admin') {
          return adminRoles.includes(state.user.role)
        }
        if (requiredRole === 'operator') {
          return operatorRoles.includes(state.user.role)
        }
        return state.user.role === requiredRole
      },

      isSystemAdmin: () => {
        const state = get()
        return state.user?.role === 'system_admin'
      },

      isClientAdmin: () => {
        const state = get()
        return state.user?.role === 'client_admin'
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Load user data when store is rehydrated
        if (state?.isAuthenticated && state?.token) {
          state.loadUser()
        }
      },
    }
  )
)