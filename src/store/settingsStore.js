// ============================================
// FILE: src/store/settingsStore.js
// ============================================
import { create } from 'zustand'
import { settingsService } from '@/services'

export const useSettingsStore = create((set) => ({
  systemSettings: null,
  isLoading: false,
  error: null,

  fetchSystemSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await settingsService.getSystem()
      set({ systemSettings: response.data, isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to load settings'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  updateSystemSettings: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await settingsService.updateSystem(data)
      set({ systemSettings: response.data, isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to update settings'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  clearError: () => set({ error: null }),
}))
