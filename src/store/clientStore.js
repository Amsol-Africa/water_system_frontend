// ============================================
// FILE: src/store/clientStore.js
// ============================================
import { create } from 'zustand'
import { clientService } from '@/services'

export const useClientStore = create((set, get) => ({
  clients: [],
  selectedClient: null,
  isLoading: false,
  error: null,
  filters: { search: '', status: '' },

  setFilters: (filters) => set({ filters }),
  clearError: () => set({ error: null }),

  fetchClients: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const res = await clientService.list(params)
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || [])
      set({ clients: data, isLoading: false })
      return { success: true, data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to load clients'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  getClient: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await clientService.retrieve(id)
      set({ selectedClient: res.data, isLoading: false })
      return { success: true, data: res.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to load client'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  createClient: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await clientService.create(data)
      set({ isLoading: false })
      // refresh list
      await get().fetchClients(get().filters)
      return { success: true, data: res.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to create client'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  updateClient: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await clientService.update(id, data)
      set({ selectedClient: res.data, isLoading: false })
      await get().fetchClients(get().filters)
      return { success: true, data: res.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to update client'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  deleteClient: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await clientService.remove(id)
      set({ isLoading: false })
      await get().fetchClients(get().filters)
      return { success: true }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to delete client'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },
}))
