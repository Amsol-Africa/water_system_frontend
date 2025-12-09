// ============================================
// FILE: src/store/clientStore.js
// ============================================
import { create } from 'zustand'
import { clientService } from '@/services'

export const useClientStore = create((set) => ({
  clients: [],
  isLoading: false,
  error: null,

  fetchClients: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await clientService.list({ page_size: 100, ...params })
      const { results = [] } = response.data
      set({ clients: results, isLoading: false })
      return { success: true, data: results }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to fetch clients'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },
}))
