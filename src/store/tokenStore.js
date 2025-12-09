// ============================================
// FILE 4: src/store/tokenStore.js
// ============================================
import { create } from 'zustand'
import { tokenService } from '@/services'

export const useTokenStore = create((set, get) => ({
  // State
  tokens: [],
  isLoading: false,
  error: null,
  filters: {
    status: '',
    type: '',
  },

  // Actions
  fetchTokens: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await tokenService.list(params)
      set({
        tokens: response.data.results || [],
        isLoading: false,
      })
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch tokens'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  issueToken: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await tokenService.issue(data)
      set((state) => ({
        tokens: [response.data, ...state.tokens],
        isLoading: false,
      }))
      return { success: true, data: response.data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to issue token'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  clearCredit: async (meterId, customerId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await tokenService.clearCredit(meterId, customerId)
      set({ isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear credit'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  clearTamper: async (meterId, customerId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await tokenService.clearTamper(meterId, customerId)
      set({ isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear tamper'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

 resendSms: async (tokenId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await tokenService.resendSms(tokenId)
      const updatedToken = response.data?.token

      if (updatedToken) {
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === updatedToken.id ? updatedToken : t,
          ),
          isLoading: false,
        }))
      } else {
        set({ isLoading: false })
      }

      const success = response.data?.success !== false
      return { success, data: response.data }
    } catch (error) {
      const data = error.response?.data
      const message =
        data?.detail ||
        data?.message ||
        data?.error ||
        'Failed to resend SMS'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  clearError: () => set({ error: null }),
}))
