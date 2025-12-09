// ============================================
// FILE 2: src/store/meterStore.js
// ============================================
import { create } from 'zustand'
import { meterService } from '@/services'

export const useMeterStore = create((set, get) => ({
  // State
  meters: [],
  selectedMeter: null,
  isLoading: false,
  error: null,
  filters: {
    status: '',
    search: '',
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },

  // Actions
  fetchMeters: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await meterService.list(params)
      const data = response.data

      // Handle both plain array and DRF paginated format
      const meters = Array.isArray(data) ? data : (data.results || [])
      const total = Array.isArray(data) ? data.length : (data.count || meters.length)

      set({
        meters,
        pagination: {
          ...get().pagination,
          total,
        },
        isLoading: false,
      })
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch meters'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },



 getMeter: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await meterService.get(id)
      set({
        selectedMeter: response.data,
        isLoading: false,
      })
      return { success: true, data: response.data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch meter'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  createMeter: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const response = await meterService.create(data)
        set((state) => ({
          meters: [...state.meters, response.data],
          isLoading: false,
        }))
        return { success: true, data: response.data }
      } catch (error) {
        // Try to surface validation errors
        const backend = error.response?.data
        let message = 'Failed to create meter'
        if (backend) {
          if (typeof backend === 'string') {
            message = backend
          } else if (backend.detail) {
            message = backend.detail
          } else if (backend.meter_id) {
            message = backend.meter_id.join
              ? backend.meter_id.join(', ')
              : String(backend.meter_id)
          }
        }

        set({ error: message, isLoading: false })
        return { success: false, error: message }
      }
    },

  updateMeter: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await meterService.update(id, data)
      set((state) => ({
        meters: state.meters.map((m) => (m.id === id ? response.data : m)),
        selectedMeter: state.selectedMeter?.id === id ? response.data : state.selectedMeter,
        isLoading: false,
      }))
      return { success: true, data: response.data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update meter'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  deleteMeter: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await meterService.delete(id)
      set((state) => ({
        meters: state.meters.filter((m) => m.id !== id),
        selectedMeter: state.selectedMeter?.id === id ? null : state.selectedMeter,
        isLoading: false,
      }))
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete meter'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

    queryMeter: async (meterId) => {
      set({ isLoading: true, error: null })
      try {
        const response = await meterService.query(meterId)
        set({ isLoading: false })
        return { success: true, data: response.data }
      } catch (error) {
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to query meter'

        set({ error: message, isLoading: false })
        return { success: false, error: message }
      }
    },

    suspendMeter: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await meterService.suspend(id)
      const message = response.data?.message || 'Meter suspended successfully'

      set((state) => ({
        meters: state.meters.map((m) =>
          m.id === id ? { ...m, status: 'suspended' } : m,
        ),
        selectedMeter:
          state.selectedMeter?.id === id
            ? { ...state.selectedMeter, status: 'suspended' }
            : state.selectedMeter,
        isLoading: false,
      }))

      return { success: true, message }
    } catch (error) {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to suspend meter'
      set({ error: msg, isLoading: false })
      return { success: false, error: msg }
    }
  },


  resumeMeter: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await meterService.resume(id)
      const message = response.data?.message || 'Meter resumed successfully'

      set((state) => ({
        meters: state.meters.map((m) =>
          m.id === id ? { ...m, status: 'active' } : m,
        ),
        selectedMeter:
          state.selectedMeter?.id === id
            ? { ...state.selectedMeter, status: 'active' }
            : state.selectedMeter,
        isLoading: false,
      }))

      return { success: true, message }
    } catch (error) {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to resume meter'
      set({ error: msg, isLoading: false })
      return { success: false, error: msg }
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