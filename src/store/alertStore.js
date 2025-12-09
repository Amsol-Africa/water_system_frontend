// ============================================
// FILE: src/store/alertStore.js
// ============================================
import { create } from 'zustand'
import { alertService } from '@/services'

export const useAlertStore = create((set, get) => ({
  alerts: [],
  selectedAlert: null,
  isLoading: false,
  error: null,
  filters: {
    severity: '',
    status: '',
    search: '',
  },

  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },

  fetchAlerts: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { pagination, filters } = get()
      const response = await alertService.list({
        page: pagination.page,
        page_size: pagination.pageSize,
        ...filters,
        ...params,
      })

      const { results = [], count = 0 } = response.data

      set((state) => ({
        alerts: results,
        pagination: {
          ...state.pagination,
          total: count,
        },
        isLoading: false,
      }))

      return { success: true, data: results }
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Failed to fetch alerts'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  getAlert: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await alertService.get(id)
      set({ selectedAlert: response.data, isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Failed to fetch alert'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  // NOTE: this uses /acknowledge/ under-the-hood, but we keep the name resolveAlert
  // so the UI can treat "acknowledged" as effectively resolved/handled.
  resolveAlert: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await alertService.acknowledge(id)

      // Refresh list
      await get().fetchAlerts()

      // Refresh selected alert if it’s the same one
      if (get().selectedAlert?.id === id) {
        await get().getAlert(id)
      }

      set({ isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Failed to resolve alert'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    }))
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }))
  },

  clearError: () => set({ error: null }),
}))
